import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { getAdminConfigMongo, setAdminPasswordHashMongo } from "@/lib/admin-repo"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const cfg = await getAdminConfigMongo()
    console.log("[ADMIN][SETUP][POST] configured=", Boolean(cfg.passwordHash))
    if (cfg.passwordHash) {
      return NextResponse.json({ error: "Already configured" }, { status: 409 })
    }
    const { password } = await request.json()
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 })
    }
    const hash = await hashPassword(password)
    await setAdminPasswordHashMongo(hash)
    console.log("[ADMIN][SETUP][POST] password hash stored")
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[ADMIN][SETUP][POST][ERROR]", (e as any)?.message, (e as any)?.stack)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const cfg = await getAdminConfigMongo()
    console.log("[ADMIN][SETUP][GET] configured=", Boolean(cfg.passwordHash))
    return NextResponse.json({ configured: Boolean(cfg.passwordHash) })
  } catch (e) {
    console.error("[ADMIN][SETUP][GET][ERROR]", (e as any)?.message, (e as any)?.stack)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
