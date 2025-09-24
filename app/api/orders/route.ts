import { NextResponse } from "next/server"
import { ordersAll, ordersByType, ordersCreate, ordersUpdateStatus, ordersClear, genId } from "@/lib/storage"
import type { OrderRecord } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") as "table" | "delivery" | null
  const list = type ? await ordersByType(type) : await ordersAll()
  return NextResponse.json(list)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderInfo, items, total } = body as {
      orderInfo: any
      items: any[]
      total: number
    }

    if (!orderInfo || !items || !Array.isArray(items) || typeof total !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const id = genId()

    const record: OrderRecord = {
      id,
      createdAt: new Date().toISOString(),
      type: orderInfo.type,
      tableNumber: orderInfo.type === "table" ? orderInfo.tableNumber : undefined,
      name: orderInfo.type === "delivery" ? orderInfo.name : undefined,
      phone: orderInfo.type === "delivery" ? orderInfo.phone : undefined,
      address: orderInfo.type === "delivery" ? orderInfo.address : undefined,
      items,
      total,
    }

    const saved = await ordersCreate(record)
    return NextResponse.json(saved, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body as { id: string; status: any }
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
    const updated = await ordersUpdateStatus(id, status)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const ok = await ordersClear(id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
