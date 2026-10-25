import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { CredentialCard } from './components/CredentialCard'
import { EmptyState, ErrorState, LoadingState } from './components/DashboardStates'
import { LoginScreen } from './components/LoginScreen'
import { fetchCredentials } from './features/credentials/credentialsSlice'
import './App.css'

function Header({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <div className="tricolour" aria-hidden="true"><span /><span /><span /></div>
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#main-content" aria-label="Digital Identity Wallet home">
          <span className="brand-mark" aria-hidden="true"><span>✓</span></span>
          <span><strong>Digital Identity Wallet</strong><small>Secure • Simple • Yours</small></span>
        </a>
        <span className="sandbox-badge">SANDBOX</span>
        <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
        <nav id="primary-navigation" className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Primary navigation">
          <a className="nav__active" href="#credentials">My credentials</a>
          <a href="#activity">Activity</a>
          <a href="#help">Help & support</a>
        </nav>
        <button className="profile-button" type="button" onClick={onLogout} aria-label="Sign out of sandbox wallet"><span>AS</span><span className="profile-copy">Aarav Sharma<small>Sign out</small></span><span aria-hidden="true">↗</span></button>
      </div>
    </header>
  </>
}

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const dispatch = useAppDispatch()
  const { items, status, error, lastUpdated } = useAppSelector((state) => state.credentials)

  useEffect(() => { if (authenticated && status === 'idle') void dispatch(fetchCredentials()) }, [authenticated, dispatch, status])

  if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />

  return <div className="app-shell">
    <Header onLogout={() => setAuthenticated(false)} />
    <main id="main-content">
      <section className="welcome-section" aria-labelledby="welcome-title">
        <div className="content-container welcome-grid">
          <div>
            <p className="eyebrow eyebrow--red">NAMASTE, AARAV</p>
            <h1 id="welcome-title">Your digital identity,<br /><em>always with you.</em></h1>
            <p className="welcome-copy">Access and manage your verified credentials securely—anytime, anywhere.</p>
            <div className="security-note"><span className="shield-icon" aria-hidden="true">✓</span><span><strong>Sandbox data stays on this device</strong><small>Mock credentials are cached locally for offline access.</small></span></div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="chakra">✦</div>
            <div className="mini-card mini-card--back"><span>IDENTITY</span></div>
            <div className="mini-card"><div className="mini-card__head"><span className="mini-avatar">AS</span><span><b>Aarav Sharma</b><small>VERIFIED IDENTITY</small></span><i>✓</i></div><div className="mini-lines"><span /><span /></div><b>XXXX XXXX 1234</b></div>
            <span className="spark spark--one">✦</span><span className="spark spark--two">✦</span>
          </div>
        </div>
      </section>

      <section className="credentials-section" id="credentials" aria-labelledby="credentials-title">
        <div className="content-container">
          <div className="section-heading">
            <div><p className="eyebrow">YOUR WALLET</p><h2 id="credentials-title">My credentials <span className="count-badge">{items.length}</span></h2></div>
            <div className="wallet-actions"><span className="sync-status"><span aria-hidden="true">↻</span> {lastUpdated ? 'Synced just now' : 'Connecting securely'}</span><button className="primary-button" type="button"><span aria-hidden="true">＋</span> Add credential</button></div>
          </div>
          {status === 'loading' || status === 'idle' ? <LoadingState /> : null}
          {status === 'failed' ? <ErrorState message={error} onRetry={() => void dispatch(fetchCredentials())} /> : null}
          {status === 'succeeded' && items.length === 0 ? <EmptyState /> : null}
          {status === 'succeeded' && items.length > 0 ? <div className="credential-grid">{items.map((credential) => <CredentialCard credential={credential} key={credential.id} />)}</div> : null}
          <div className="privacy-banner"><span className="lock-icon" aria-hidden="true">▣</span><div><strong>Sandbox privacy notice</strong><p>This demonstration uses mock credentials cached locally to support offline access. Do not enter real identity data.</p></div><a href="#privacy">Learn about security <span aria-hidden="true">→</span></a></div>
        </div>
      </section>
    </main>
    <footer><div className="content-container footer-inner"><div><strong>Digital Identity Wallet</strong><p>A secure identity experience for the UIDAI Innovation Sandbox.</p></div><nav aria-label="Footer navigation"><a href="#accessibility">Accessibility</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#help">Help</a></nav><p>Sandbox environment • Mock data only</p></div></footer>
  </div>
}

export default App
