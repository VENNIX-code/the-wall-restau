import type { AdminConfig } from "./types"
import { getDb } from "./db"

const COLLECTION = "admins"
const DOC_ID = "config"

export async function getAdminConfigMongo(): Promise<AdminConfig> {
  const db = await getDb()
  const doc = await db.collection<AdminConfig & { _id: string }>(COLLECTION).findOne({ _id: DOC_ID })
  if (!doc) return {}
  const { _id, ...rest } = doc
  return rest
}

export async function setAdminPasswordHashMongo(passwordHash: string): Promise<void> {
  const db = await getDb()
  await db
    .collection<AdminConfig & { _id: string }>(COLLECTION)
    .updateOne({ _id: DOC_ID }, { $set: { passwordHash } }, { upsert: true })
}
