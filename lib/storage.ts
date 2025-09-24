import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"
import type { AdminConfig, StoredOrder, OrderRecord } from "./types"

const dataDir = path.join(process.cwd(), "server")
const ordersFile = path.join(dataDir, "orders.json")
const adminFile = path.join(dataDir, "admin.json")

async function ensureDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch {}
}

async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  await ensureDir()
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")
}

export async function getAdminConfig(): Promise<AdminConfig> {
  return readJSON<AdminConfig>(adminFile, {})
}

export async function setAdminPasswordHash(passwordHash: string): Promise<void> {
  const cfg: AdminConfig = { passwordHash }
  await writeJSON(adminFile, cfg)
}

export async function ordersAll(): Promise<StoredOrder[]> {
  return readJSON<StoredOrder[]>(ordersFile, [])
}

export async function ordersCreate(order: OrderRecord): Promise<StoredOrder> {
  const existing = await ordersAll()
  const stored: StoredOrder = {
    ...order,
    status: "received",
  }
  existing.unshift(stored)
  await writeJSON(ordersFile, existing)
  return stored
}

export async function ordersUpdateStatus(id: string, status: StoredOrder["status"]): Promise<StoredOrder | null> {
  const list = await ordersAll()
  const idx = list.findIndex((o) => o.id === id)
  if (idx === -1) return null
  list[idx].status = status
  await writeJSON(ordersFile, list)
  return list[idx]
}

export async function ordersClear(id: string): Promise<boolean> {
  const list = await ordersAll()
  const filtered = list.filter((o) => o.id !== id)
  const changed = filtered.length !== list.length
  if (changed) await writeJSON(ordersFile, filtered)
  return changed
}

export async function ordersByType(type: "table" | "delivery"): Promise<StoredOrder[]> {
  const list = await ordersAll()
  return list.filter((o) => o.type === type)
}

export function genId(prefix = "order"): string {
  const rnd = crypto.randomBytes(8).toString("hex")
  return `${prefix}_${Date.now()}_${rnd}`
}
