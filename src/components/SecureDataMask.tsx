import { useCallback, useEffect, useId, useRef, useState } from 'react'

interface SecureDataMaskProps {
  value: string
  label?: string
  timeoutMs?: number
}

const formatValue = (value: string) => /^\d{12}$/.test(value) ? value.replace(/(.{4})(?=.)/g, '$1-') : value
const maskValue = (value: string) => /^\d{12}$/.test(value) ? `XXXX-XXXX-${value.slice(-4)}` : `${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`

export function SecureDataMask({
  value,
  label = 'Identity number',
  timeoutMs = 10_000,
}: SecureDataMaskProps) {
  const [revealedValue, setRevealedValue] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const valueId = useId()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRevealed = revealedValue !== null
  const revealDuration = Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.min(timeoutMs, 60_000) : 10_000

  const clearRevealTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const hide = useCallback(() => {
    clearRevealTimer()
    setRevealedValue(null)
    setAnnouncement('Sensitive number hidden.')
  }, [clearRevealTimer])

  const reveal = () => {
    clearRevealTimer()
    setRevealedValue(value)
    setAnnouncement(`Sensitive number revealed for ${revealDuration / 1000} seconds.`)
    timerRef.current = setTimeout(hide, revealDuration)
  }

  useEffect(() => {
    const hideWhenBackgrounded = () => {
      if (document.hidden) hide()
    }
    document.addEventListener('visibilitychange', hideWhenBackgrounded)
    return () => document.removeEventListener('visibilitychange', hideWhenBackgrounded)
  }, [hide])

  useEffect(() => clearRevealTimer, [clearRevealTimer])

  return (
    <div className="secure-data">
      <span className="field-label">{label}</span>
      <div className="secure-data__row">
        <span id={valueId} className="secure-data__value" aria-label={`${label}, ${isRevealed ? 'visible' : 'masked'}`}>
          {isRevealed ? formatValue(revealedValue) : maskValue(value)}
        </span>
        <button
          type="button"
          className="text-button"
          aria-controls={valueId}
          aria-pressed={isRevealed}
          onClick={isRevealed ? hide : reveal}
        >
          <svg
            className="text-button__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {isRevealed ? (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A10.8 10.8 0 0112 5c6.4 0 10 7 10 7a15.3 15.3 0 01-4 4.7" />
                <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.8 10.8 0 004.1-.8" />
              </>
            ) : (
              <>
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
          {isRevealed ? 'Hide now' : 'Tap to reveal'}
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  )
}
