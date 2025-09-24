import { NextResponse } from "next/server"
import { getAdminConfig, setAdminPasswordHash } from "@/lib/storage"
import { hashPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const cfg = await getAdminConfig()
    if (cfg.passwordHash) {
      return NextResponse.json({ error: "Already configured" }, { status: 409 })
    }
    const { password } = await request.json()
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 })
    }
    const hash = await hashPassword(password)
    await setAdminPasswordHash(hash)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET() {
  const cfg = await getAdminConfig()
  return NextResponse.json({ configured: Boolean(cfg.passwordHash) })
}
