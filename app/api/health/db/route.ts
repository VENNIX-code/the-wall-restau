import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const db = await getDb()
    return Response.json({
      ok: true,
      dbName: db.databaseName,
      collections: await db.listCollections().toArray()
    })
  } catch (error: any) {
    return Response.json({
      ok: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
