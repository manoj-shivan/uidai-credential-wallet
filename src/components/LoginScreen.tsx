import { type FormEvent, useId, useState } from 'react'

interface LoginScreenProps {
  onLogin: () => void
}

const DEMO_USER = 'aarav@uidai-sandbox.test'
const DEMO_CODE = '123456'

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [userId, setUserId] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const errorId = useId()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (userId.trim().toLowerCase() !== DEMO_USER || accessCode !== DEMO_CODE) {
      setError('Enter the sandbox user ID and six-digit access code shown below.')
      return
    }
    setError('')
    onLogin()
  }

  const useDemoAccess = () => {
    setUserId(DEMO_USER)
    setAccessCode(DEMO_CODE)
    setError('')
  }

  return <div className="login-page">
    <a className="skip-link" href="#login-form">Skip to sign in</a>
    <div className="tricolour" aria-hidden="true"><span /><span /><span /></div>
    <header className="login-header">
      <a className="brand" href="#login-form" aria-label="Digital Identity Wallet sign in">
        <span className="brand-mark" aria-hidden="true"><span>✓</span></span>
        <span><strong>Digital Identity Wallet</strong><small>UIDAI Innovation Sandbox</small></span>
      </a>
      <span className="sandbox-badge">SANDBOX • MOCK DATA</span>
    </header>

    <main className="login-main">
      <section className="login-story" aria-labelledby="login-title">
        <p className="eyebrow eyebrow--light">TRUSTED DIGITAL IDENTITY</p>
        <h1 id="login-title">Your credentials.<br /><em>Private by design.</em></h1>
        <p>Access a secure sandbox experience for viewing and managing simulated identity credentials.</p>
        <ul className="login-benefits">
          <li><span aria-hidden="true">✓</span><span><strong>Privacy first</strong><small>Sensitive values stay masked until you choose to reveal them.</small></span></li>
          <li><span aria-hidden="true">✓</span><span><strong>Accessible by default</strong><small>Keyboard and screen-reader friendly interactions.</small></span></li>
          <li><span aria-hidden="true">✓</span><span><strong>Ready offline</strong><small>Your last sandbox credential list remains available.</small></span></li>
        </ul>
      </section>

      <section className="login-panel" aria-labelledby="sign-in-title">
        <div className="login-panel__heading">
          <span className="login-lock" aria-hidden="true">▣</span>
          <div><p className="eyebrow">SECURE ACCESS</p><h2 id="sign-in-title">Sign in to your wallet</h2></div>
        </div>
        <p className="login-intro">Use the sandbox credentials below. Never enter a real Aadhaar number or production password.</p>

        <form id="login-form" className="login-form" onSubmit={submit} noValidate>
          <label htmlFor="user-id">Sandbox user ID</label>
          <input id="user-id" name="username" type="email" autoComplete="username" value={userId} onChange={(event) => setUserId(event.target.value)} aria-describedby={error ? errorId : undefined} required />
          <label htmlFor="access-code">Six-digit access code</label>
          <input id="access-code" name="password" type="password" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="current-password" value={accessCode} onChange={(event) => setAccessCode(event.target.value.replace(/\D/g, ''))} aria-describedby={error ? errorId : undefined} required />
          {error ? <p className="login-error" id={errorId} role="alert">{error}</p> : null}
          <button className="login-submit" type="submit">Continue securely <span aria-hidden="true">→</span></button>
        </form>

        <div className="demo-access">
          <div><strong>Demo access</strong><span>{DEMO_USER} • {DEMO_CODE}</span></div>
          <button type="button" onClick={useDemoAccess}>Use demo access</button>
        </div>
        <p className="login-disclaimer"><span aria-hidden="true">ⓘ</span> Frontend-only demonstration. Authentication is simulated and does not protect real data.</p>
      </section>
    </main>
    <footer className="login-footer"><span>UIDAI Innovation Sandbox</span><span>Mock credentials only • No real identity data</span></footer>
  </div>
}
