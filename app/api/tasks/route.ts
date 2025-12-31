import { NextRequest, NextResponse } from 'next/server'
import fetchFromBackend, { UnauthorizedError, ClientError, ServerError } from '../../../lib/helper'
import { validateClientKey } from '../../../lib/validateClientKey'

export async function GET(req: NextRequest) {
  try {
    if (!process.env.BACKEND_API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: BACKEND_API_KEY not set.' }, { status: 500 })
    }
    if (!validateClientKey(req)) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }
    const url = new URL(req.url)
    const search = url.search
    const data = await fetchFromBackend(`/tasks${search}`)
    return NextResponse.json(data, { status: 200 })
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }
    if (err instanceof ClientError) {
      const status = err.status >= 400 && err.status < 500 ? err.status : 400
      const msg = status === 404 ? 'Not found' : 'Client error'
      return NextResponse.json({ error: msg, status }, { status })
    }
    if (err instanceof ServerError) {
      return NextResponse.json({ error: 'Upstream server error', status: 502 }, { status: 502 })
    }
    return NextResponse.json({ error: 'Internal server error', status: 500 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.BACKEND_API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: BACKEND_API_KEY not set.' }, { status: 500 })
    }
    if (!validateClientKey(req)) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }
    const body = await req.json().catch(() => undefined)
    const data = await fetchFromBackend('/tasks', { method: 'POST', body })
    return NextResponse.json(data, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }
    if (err instanceof ClientError) {
      const status = err.status >= 400 && err.status < 500 ? err.status : 400
      const msg = status === 404 ? 'Not found' : 'Client error'
      return NextResponse.json({ error: msg, status }, { status })
    }
    if (err instanceof ServerError) {
      return NextResponse.json({ error: 'Upstream server error', status: 502 }, { status: 502 })
    }
    return NextResponse.json({ error: 'Internal server error', status: 500 }, { status: 500 })
  }
}
