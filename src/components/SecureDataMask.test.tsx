import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SecureDataMask } from './SecureDataMask'

describe('SecureDataMask', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  })

  it('masks sensitive data by default', () => {
    render(<SecureDataMask value="234567891234" />)
    expect(screen.getByText('XXXX-XXXX-1234')).toBeInTheDocument()
    expect(screen.queryByText('2345-6789-1234')).not.toBeInTheDocument()
  })

  it('reveals then securely masks the value after ten seconds', () => {
    vi.useFakeTimers()
    render(<SecureDataMask value="234567891234" />)
    fireEvent.click(screen.getByRole('button', { name: /tap to reveal/i }))
    expect(screen.getByText('2345-6789-1234')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide now/i })).toHaveAttribute('aria-pressed', 'true')
    act(() => vi.advanceTimersByTime(10_000))
    expect(screen.getByText('XXXX-XXXX-1234')).toBeInTheDocument()
    expect(screen.queryByText('2345-6789-1234')).not.toBeInTheDocument()
  })

  it('hides the value immediately on request', () => {
    render(<SecureDataMask value="234567891234" />)
    fireEvent.click(screen.getByRole('button', { name: /tap to reveal/i }))
    fireEvent.click(screen.getByRole('button', { name: /hide now/i }))
    expect(screen.getByText('XXXX-XXXX-1234')).toBeInTheDocument()
  })

  it('announces a custom timeout and supports keyboard activation', async () => {
    const user = userEvent.setup()
    render(<SecureDataMask value="KYC9284105837" timeoutMs={5_000} />)
    const button = screen.getByRole('button', { name: /tap to reveal/i })
    button.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('KYC9284105837')).toBeInTheDocument()
    expect(screen.getByText('Sensitive number revealed for 5 seconds.')).toHaveAttribute('aria-live', 'polite')
  })

  it('hides revealed data when the page moves to the background', () => {
    render(<SecureDataMask value="234567891234" />)
    fireEvent.click(screen.getByRole('button', { name: /tap to reveal/i }))
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    fireEvent(document, new Event('visibilitychange'))
    expect(screen.getByText('XXXX-XXXX-1234')).toBeInTheDocument()
    expect(screen.queryByText('2345-6789-1234')).not.toBeInTheDocument()
  })

  it('clears its timeout when unmounted', () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = render(<SecureDataMask value="234567891234" />)
    fireEvent.click(screen.getByRole('button', { name: /tap to reveal/i }))
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
