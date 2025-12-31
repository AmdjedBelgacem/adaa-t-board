import crypto from 'crypto'
import type { NextRequest } from 'next/server'

export function validateClientKey(req: NextRequest): boolean {
  const header = req.headers.get('x-client-key') || req.headers.get('x-api-key') || ''
  const envKey = process.env.BACKEND_API_KEY || ''
  if (!header || !envKey) return false
  try {
    const h1 = crypto.createHash('sha256').update(String(header)).digest()
    const h2 = crypto.createHash('sha256').update(String(envKey)).digest()
    return crypto.timingSafeEqual(h1, h2)
  } catch {
    return false
  }
}
