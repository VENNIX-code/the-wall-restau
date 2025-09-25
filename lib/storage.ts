import crypto from "crypto"
import type { AdminConfig, StoredOrder, OrderRecord } from "./types"

// Filesystem storage disabled for Vercel (read-only FS). Use MongoDB instead.
const dataDir = ""
const ordersFile = ""
const adminFile = ""

async function ensureDir() {
  throw new Error("Filesystem storage is disabled. Use MongoDB via lib/db.ts.")
}

async function readJSON<T>(_filePath: string, _fallback: T): Promise<T> {
  throw new Error("readJSON disabled. Migrate to MongoDB (see lib/db.ts and app/api/* routes).")
}

async function writeJSON<T>(_filePath: string, _data: T): Promise<void> {
  throw new Error("writeJSON disabled. Migrate to MongoDB (see lib/db.ts and app/api/* routes).")
}

export async function getAdminConfig(): Promise<AdminConfig> {
  throw new Error("getAdminConfig (filesystem) disabled. Use MongoDB admin repo (lib/admin-repo.ts).")
}

export async function setAdminPasswordHash(_passwordHash: string): Promise<void> {
  throw new Error("setAdminPasswordHash (filesystem) disabled. Use MongoDB admin repo (lib/admin-repo.ts).")
}

export async function ordersAll(): Promise<StoredOrder[]> {
  throw new Error("ordersAll (filesystem) disabled. Use MongoDB via lib/db.ts.")
}

export async function ordersCreate(_order: OrderRecord): Promise<StoredOrder> {
  throw new Error("ordersCreate (filesystem) disabled. Use MongoDB via lib/db.ts.")
}

export async function ordersUpdateStatus(_id: string, _status: StoredOrder["status"]): Promise<StoredOrder | null> {
  throw new Error("ordersUpdateStatus (filesystem) disabled. Use MongoDB via lib/db.ts.")
}

export async function ordersClear(_id: string): Promise<boolean> {
  throw new Error("ordersClear (filesystem) disabled. Use MongoDB via lib/db.ts.")
}

export async function ordersByType(_type: "table" | "delivery"): Promise<StoredOrder[]> {
  throw new Error("ordersByType (filesystem) disabled. Use MongoDB via lib/db.ts.")
}

export function genId(prefix = "order"): string {
  const rnd = crypto.randomBytes(8).toString("hex")
  return `${prefix}_${Date.now()}_${rnd}`
}
