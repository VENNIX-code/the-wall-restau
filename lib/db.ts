import { MongoClient, Db, Collection } from "mongodb"
import type { StoredOrder } from "./types"

const uri = process.env.MONGODB_URI

// Use a global cached promise to avoid creating multiple clients in dev Hot Reload
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (!uri) {
  // We'll throw at runtime when trying to connect if it's missing
  console.warn("MONGODB_URI is not set. Set it in .env.local or Vercel env vars.")
}

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri || "")
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise!

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("Missing MONGODB_URI env var")
  const client = await clientPromise
  return client.db("restaurant")
}

export async function getOrdersCollection(): Promise<Collection<StoredOrder>> {
  const database = await getDb()
  return database.collection<StoredOrder>("commandes")
}
