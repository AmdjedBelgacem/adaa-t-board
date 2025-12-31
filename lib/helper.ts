export class UnauthorizedError extends Error {
  status = 401
  body: unknown
  constructor(body?: unknown) {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
    this.body = body
  }
}

export class ClientError extends Error {
  status: number
  body: unknown
  constructor(status: number, body?: unknown) {
    super(`Client error: ${status}`)
    this.name = 'ClientError'
    this.status = status
    this.body = body
  }
}

export class ServerError extends Error {
  status: number
  body: unknown
  constructor(status: number, body?: unknown) {
    super(`Server error: ${status}`)
    this.name = 'ServerError'
    this.status = status
    this.body = body
  }
}

function ensureServer() {
  if (typeof window !== 'undefined') throw new Error('server-only')
}

async function readBody(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json().catch(() => undefined)
  if (res.status === 204) return undefined
  return res.text().catch(() => undefined)
}

export default async function fetchFromBackend<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  ensureServer()
  const base = process.env.BACKEND_API_BASE_URL || "http://127.0.0.1:8000/";
  const key = process.env.BACKEND_API_KEY
  if (!base) throw new Error('BACKEND_API_BASE_URL missing')
  if (!key) throw new Error('BACKEND_API_KEY missing')
  let normalizedPath = path
  if (!normalizedPath.startsWith('/api')) {
    if (normalizedPath.startsWith('/')) normalizedPath = `/api${normalizedPath}`
    else normalizedPath = `/api/${normalizedPath}`
  }
    const qidx = normalizedPath.indexOf('?')
    if (qidx === -1) {
      if (!normalizedPath.endsWith('/')) normalizedPath = `${normalizedPath}/`
    } else {
      const before = normalizedPath.slice(0, qidx)
      const after = normalizedPath.slice(qidx)
      if (!before.endsWith('/')) normalizedPath = `${before}/${after}`
    }
    const url = new URL(normalizedPath, base).toString()
  const headers = new Headers(init?.headers || {})
  headers.set('X-API-KEY', key)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  let body = init?.body
  const isPlainObject = body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof ArrayBuffer)
  if (isPlainObject) {
    body = JSON.stringify(body)
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(url, { ...init, headers, body: body as BodyInit | undefined })
  if (res.status === 401) throw new UnauthorizedError(await readBody(res))
  if (res.status >= 400 && res.status < 500) throw new ClientError(res.status, await readBody(res))
  if (res.status >= 500) throw new ServerError(res.status, await readBody(res))
  const parsed = await readBody(res)
  return parsed as T
}

export { fetchFromBackend }
