export class ApiError extends Error {
  status: number
  body?: unknown
  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function parseJsonResponse(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const data = await res.json()
      return data as T
    }
    const text = await res.text()
    return text as unknown as T
  }
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('apiKey')
      } catch {}
      try {
        window.location.replace('/login')
      } catch {}
    }
  }
  let body: unknown
  try {
    body = await parseJsonResponse(res)
  } catch {
    body = undefined
  }
  const message = typeof body === 'object' && body && 'message' in (body as Record<string, unknown>) && typeof (body as Record<string, unknown>)['message'] === 'string'
    ? String((body as Record<string, unknown>)['message'])
    : res.statusText || 'API error'
  throw new ApiError(message, res.status, body)
}

function normalizePath(url: string) {
  if (!url) return '/'
  if (url.startsWith('/')) return url
  return `/${url}`
}

export async function get<T>(url: string): Promise<T> {
  const path = normalizePath(url)
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (path.startsWith('/api') && typeof window !== 'undefined') {
    const clientKey = localStorage.getItem('apiKey')
    if (clientKey) headers['X-CLIENT-KEY'] = clientKey
  }
  const res = await fetch(path, { method: 'GET', headers })
  return handleResponse<T>(res)
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const path = normalizePath(url)
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (path.startsWith('/api') && typeof window !== 'undefined') {
    const clientKey = localStorage.getItem('apiKey')
    if (clientKey) headers['X-CLIENT-KEY'] = clientKey
  }
  const res = await fetch(path, { method: 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body) })
  return handleResponse<T>(res)
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  const path = normalizePath(url)
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
  if (path.startsWith('/api') && typeof window !== 'undefined') {
    const clientKey = localStorage.getItem('apiKey')
    if (clientKey) headers['X-CLIENT-KEY'] = clientKey
  }
  const res = await fetch(path, { method: 'PATCH', headers, body: body === undefined ? undefined : JSON.stringify(body) })
  return handleResponse<T>(res)
}

export async function del(url: string): Promise<void> {
  const path = normalizePath(url)
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (path.startsWith('/api') && typeof window !== 'undefined') {
    const clientKey = localStorage.getItem('apiKey')
    if (clientKey) headers['X-CLIENT-KEY'] = clientKey
  }
  const res = await fetch(path, { method: 'DELETE', headers })
  await handleResponse<void>(res)
}

const api = { get, post, patch, del }
export default api
