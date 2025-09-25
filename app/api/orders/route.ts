import { NextResponse } from "next/server"
import { genId } from "@/lib/storage"
import { getOrdersCollection } from "@/lib/db"
import type { OrderRecord, StoredOrder } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "table" | "delivery" | null
    console.log("[ORDERS][GET] type=", type)
    const col = await getOrdersCollection()
    const query: any = {}
    if (type) query.type = type
    const list = await col
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    console.log("[ORDERS][GET] resultCount=", list.length)
    return NextResponse.json(list)
  } catch (e) {
    console.error("[ORDERS][GET][ERROR]", (e as any)?.message, (e as any)?.stack)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
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

    const record: StoredOrder = {
      id,
      createdAt: new Date().toISOString(),
      type: orderInfo.type,
      tableNumber: orderInfo.type === "table" ? orderInfo.tableNumber : undefined,
      name: orderInfo.type === "delivery" ? orderInfo.name : undefined,
      phone: orderInfo.type === "delivery" ? orderInfo.phone : undefined,
      address: orderInfo.type === "delivery" ? orderInfo.address : undefined,
      items,
      total,
      status: "received",
    }

    const col = await getOrdersCollection()
    console.log("[ORDERS][POST] inserting id=", id, "type=", record.type, "items=", items?.length, "total=", total)
    await col.insertOne(record)
    console.log("[ORDERS][POST] inserted id=", id)
    return NextResponse.json(record, { status: 201 })
  } catch (e) {
    console.error("[ORDERS][POST][ERROR]", (e as any)?.message, (e as any)?.stack)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body as { id: string; status: StoredOrder["status"] }
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
    const col = await getOrdersCollection()
    console.log("[ORDERS][PATCH] id=", id, "status=", status)
    const res = await col.findOneAndUpdate({ id }, { $set: { status } }, { returnDocument: "after" })
    const doc = (res as any)?.value ?? null
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(doc)
  } catch (e) {
    console.error("[ORDERS][PATCH][ERROR]", (e as any)?.message, (e as any)?.stack)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const col = await getOrdersCollection()
    console.log("[ORDERS][DELETE] id=", id)
    const res = await col.deleteOne({ id })
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[ORDERS][DELETE][ERROR]", (e as any)?.message, (e as any)?.stack)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
