export function LoadingState() {
  return <div className="credential-grid" aria-busy="true" aria-label="Loading credentials">{[1, 2].map((item) => <div className="skeleton-card" key={item}><span /><span /><span /><span /></div>)}</div>
}

export function EmptyState() {
  return <div className="state-panel"><div className="state-icon" aria-hidden="true">＋</div><h3>No credentials yet</h3><p>Your verified digital credentials will appear here when they are issued.</p><button className="primary-button" type="button">Explore credentials</button></div>
}

export function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return <div className="state-panel state-panel--error" role="alert"><div className="state-icon" aria-hidden="true">!</div><h3>Unable to load credentials</h3><p>{message ?? 'Check your connection and try again.'}</p><button className="primary-button" type="button" onClick={onRetry}>Try again</button></div>
}
