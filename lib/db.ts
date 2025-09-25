import { MongoClient, Db, Collection } from "mongodb"
import type { StoredOrder } from "./types"

const uri = process.env.MONGODB_URI || process.env.MONGO_URI

// Use a global cached promise to avoid creating multiple clients in dev Hot Reload
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!uri) {
  // We'll throw at runtime when trying to connect if it's missing
  console.warn("MONGODB_URI/MONGO_URI is not set. Set it in .env.local or Vercel env vars.")
}

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("Missing MONGODB_URI/MONGO_URI env var")
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  const client = await global._mongoClientPromise!
  return client.db("restaurant")
}

export async function getOrdersCollection(): Promise<Collection<StoredOrder>> {
  const database = await getDb()
  return database.collection<StoredOrder>("orders")
}
