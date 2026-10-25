import type { Credential } from '../features/credentials/types'
import { SecureDataMask } from './SecureDataMask'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))

export function CredentialCard({ credential }: { credential: Credential }) {
  return (
    <article className={`credential-card credential-card--${credential.accent}`}>
      <div className="credential-card__topline" aria-hidden="true" />
      <div className="credential-card__body">
        <div className="credential-card__header">
          <div className="credential-icon" aria-hidden="true">{credential.type.charAt(0)}</div>
          <div>
            <p className="eyebrow">Digital credential</p>
            <h3>{credential.type}</h3>
          </div>
          <span className={`status status--${credential.status}`}>
            <span aria-hidden="true">✓</span> {credential.status}
          </span>
        </div>
        <dl className="credential-meta">
          <div><dt>Issued by</dt><dd>{credential.issuer}</dd></div>
          <div><dt>Issued on</dt><dd>{formatDate(credential.issuedAt)}</dd></div>
        </dl>
        <SecureDataMask value={credential.sensitiveNumber} />
        <div className="credential-card__footer">
          <span className="offline-ready"><span aria-hidden="true">↓</span> Available offline</span>
          <button className="secondary-button" type="button">View details <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>
  )
}
