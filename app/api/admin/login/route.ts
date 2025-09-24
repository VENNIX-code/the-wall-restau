import { NextResponse } from "next/server"
import { getAdminConfig } from "@/lib/storage"
import { verifyPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    if (typeof password !== "string") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }
    const cfg = await getAdminConfig()
    if (!cfg.passwordHash) {
      return NextResponse.json({ ok: false, error: "Not configured" }, { status: 409 })
    }
    const ok = await verifyPassword(password, cfg.passwordHash)
    if (!ok) return NextResponse.json({ ok: false }, { status: 401 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 })
  }
}
