import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { createAppStore } from './app/store'
import type { Credential } from './features/credentials/types'

const credential: Credential = {
  id: 'test-1',
  type: 'Aadhaar Identity',
  issuer: 'UIDAI Sandbox',
  holderName: 'Aarav Sharma',
  sensitiveNumber: '234567891234',
  status: 'verified',
  issuedAt: '2025-01-18',
  accent: 'red',
}

const renderApp = () => render(<Provider store={createAppStore()}><App /></Provider>)

const login = async () => {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /use demo access/i }))
  await user.click(screen.getByRole('button', { name: /continue securely/i }))
}

describe('sandbox access', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows the login screen without fetching credentials', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderApp()
    expect(screen.getByRole('heading', { name: /sign in to your wallet/i })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects invalid sandbox credentials', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.type(screen.getByLabelText(/sandbox user id/i), 'unknown@example.test')
    await user.type(screen.getByLabelText(/six-digit access code/i), '000000')
    await user.click(screen.getByRole('button', { name: /continue securely/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/enter the sandbox user id/i)
  })

  it('returns to login when the user signs out', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
    renderApp()
    await login()
    await user.click(screen.getByRole('button', { name: /sign out of sandbox wallet/i }))
    expect(screen.getByRole('heading', { name: /sign in to your wallet/i })).toBeInTheDocument()
  })
})

describe('credential dashboard', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads and displays credentials from the API', async () => {
    let resolveRequest: (response: { ok: boolean; json: () => Promise<Credential[]> }) => void = () => undefined
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise((resolve) => { resolveRequest = resolve })))
    renderApp()
    await login()
    expect(screen.getByLabelText(/loading credentials/i)).toBeInTheDocument()
    resolveRequest({ ok: true, json: async () => [credential] })
    expect(await screen.findByRole('heading', { name: 'Aadhaar Identity' })).toBeInTheDocument()
    expect(screen.getByText('XXXX-XXXX-1234')).toBeInTheDocument()
  })

  it('shows an empty state when no credentials exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
    renderApp()
    await login()
    expect(await screen.findByRole('heading', { name: /no credentials yet/i })).toBeInTheDocument()
  })

  it('shows a retry action when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    renderApp()
    await login()
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load your credentials/i)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('rejects malformed credential data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [{ id: 'invalid' }] }))
    renderApp()
    await login()
    expect(await screen.findByRole('alert')).toHaveTextContent(/returned invalid data/i)
  })

  it('uses the assignment API endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })
    vi.stubGlobal('fetch', fetchMock)
    renderApp()
    await login()
    await screen.findByRole('heading', { name: /no credentials yet/i })
    expect(fetchMock).toHaveBeenCalledWith('/api/credentials')
  })
})
