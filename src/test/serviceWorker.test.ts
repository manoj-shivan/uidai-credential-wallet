import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

class TestResponse {
  ok: boolean
  status: number
  body: string
  headers: Record<string, string>

  constructor(body = '', init: { status?: number; headers?: Record<string, string> } = {}) {
    this.body = body
    this.status = init.status ?? 200
    this.ok = this.status >= 200 && this.status < 300
    this.headers = init.headers ?? {}
  }

  clone() {
    return new TestResponse(this.body, { status: this.status, headers: this.headers })
  }

  static error() {
    return new TestResponse('', { status: 500 })
  }
}

const loadWorker = (fetchMock: ReturnType<typeof vi.fn>, cached?: TestResponse) => {
  const listeners = new Map<string, (event: never) => void>()
  const put = vi.fn().mockResolvedValue(undefined)
  const caches = {
    open: vi.fn().mockResolvedValue({ addAll: vi.fn(), put }),
    keys: vi.fn().mockResolvedValue([]),
    delete: vi.fn(),
    match: vi.fn().mockResolvedValue(cached),
  }
  const self = {
    addEventListener: (name: string, handler: (event: never) => void) => listeners.set(name, handler),
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
    location: { origin: 'https://wallet.test' },
  }
  const source = readFileSync(join(process.cwd(), 'public', 'sw.js'), 'utf8')
  runInNewContext(source, { self, caches, fetch: fetchMock, Response: TestResponse, URL, Error })
  return { handler: listeners.get('fetch')!, put }
}

const dispatchCredentialRequest = async (handler: (event: never) => void) => {
  let responsePromise: Promise<TestResponse> | undefined
  handler({
    request: { method: 'GET', url: 'https://wallet.test/api/credentials', mode: 'cors' },
    respondWith: (value: Promise<TestResponse>) => { responsePromise = value },
  } as never)
  return responsePromise!
}

describe('credential service worker strategy', () => {
  it('awaits caching before returning a successful network response', async () => {
    const networkResponse = new TestResponse('[{"id":"1"}]')
    const { handler, put } = loadWorker(vi.fn().mockResolvedValue(networkResponse))
    expect(await dispatchCredentialRequest(handler)).toBe(networkResponse)
    expect(put).toHaveBeenCalledOnce()
  })

  it('returns cached credentials for unsuccessful HTTP responses', async () => {
    const cached = new TestResponse('[{"id":"cached"}]')
    const { handler } = loadWorker(vi.fn().mockResolvedValue(new TestResponse('', { status: 500 })), cached)
    expect(await dispatchCredentialRequest(handler)).toBe(cached)
  })

  it('returns an empty offline response when no cache exists', async () => {
    const { handler } = loadWorker(vi.fn().mockRejectedValue(new Error('offline')))
    const response = await dispatchCredentialRequest(handler)
    expect(response.body).toBe('[]')
    expect(response.headers['X-Offline-Fallback']).toBe('true')
  })
})
