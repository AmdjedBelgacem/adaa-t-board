import { NextRequest, NextResponse } from 'next/server'
import fetchFromBackend, { UnauthorizedError, ClientError, ServerError } from '../../../../lib/helper'
import { validateClientKey } from '../../../../lib/validateClientKey'

export async function GET(_req: NextRequest, context: { params: Record<string, string> | Promise<Record<string, string>> }) {
  try {
    if (!validateClientKey(_req)) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }
    const params = await Promise.resolve(context.params)
    const { id } = params
    const data = await fetchFromBackend(`/tasks/${id}`)
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

export async function PATCH(req: NextRequest, context: { params: Record<string, string> | Promise<Record<string, string>> }) {
  try {
    if (!validateClientKey(req)) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }
    const params = await Promise.resolve(context.params)
    const { id } = params
    const body = await req.json().catch(() => undefined)
    const data = await fetchFromBackend(`/tasks/${id}`, { method: 'PATCH', body })
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

export async function DELETE(_req: NextRequest, context: { params: Record<string, string> | Promise<Record<string, string>> }) {
  try {
    if (!validateClientKey(_req)) {
      return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 })
    }
    const params = await Promise.resolve(context.params)
    const { id } = params
    await fetchFromBackend(`/tasks/${id}`, { method: 'DELETE' })
    return new NextResponse(null, { status: 204 })
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
