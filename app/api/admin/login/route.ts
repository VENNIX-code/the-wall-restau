import { NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth"
import { getAdminConfigMongo } from "@/lib/admin-repo"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    console.log("[ADMIN][LOGIN][POST] payload received")
    if (typeof password !== "string") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }
    const cfg = await getAdminConfigMongo()
    console.log("[ADMIN][LOGIN][POST] configured=", Boolean(cfg.passwordHash))
    if (!cfg.passwordHash) {
      return NextResponse.json({ ok: false, error: "Not configured" }, { status: 409 })
    }
    const ok = await verifyPassword(password, cfg.passwordHash)
    if (!ok) return NextResponse.json({ ok: false }, { status: 401 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[ADMIN][LOGIN][POST][ERROR]", (e as any)?.message, (e as any)?.stack)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
