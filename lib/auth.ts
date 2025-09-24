import crypto from "crypto"

const SALT_LEN = 16
const KEY_LEN = 64
const ITER = 310000
const DIGEST = "sha256"

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LEN)
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITER, KEY_LEN, DIGEST, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
  return `pbkdf2$${ITER}$${salt.toString("hex")}$${derivedKey.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [method, iterStr, saltHex, keyHex] = stored.split("$")
    if (!method.startsWith("pbkdf2")) return false
    const iter = Number(iterStr)
    const salt = Buffer.from(saltHex, "hex")
    const key = Buffer.from(keyHex, "hex")
    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(password, salt, iter, key.length, DIGEST, (err, out) => {
        if (err) reject(err)
        else resolve(out)
      })
    })
    return crypto.timingSafeEqual(key, derived)
  } catch {
    return false
  }
}
