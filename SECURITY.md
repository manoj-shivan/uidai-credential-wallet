# Security Model

## 1. Scope statement

This repository is a frontend security demonstration using mock data. It is suitable for the UIDAI Sandbox assignment but must not process real Aadhaar, eKYC, authentication secrets, or production identity credentials.

Frontend code runs in an untrusted browser. Attackers can inspect bundles, alter state, bypass UI checks, and replay requests. Real security decisions must be enforced by a backend.

## 2. Current controls

### Sensitive display

- Masked by default
- Explicit reveal interaction
- Default 10-second reveal duration
- Maximum custom duration of 60 seconds
- Immediate manual hiding
- Automatic hiding when the page becomes hidden
- Local revealed copy reset to `null`
- Timer cleanup on unmount
- No automatic clipboard operation

### Accessibility

- Native buttons
- visible focus indicators
- keyboard activation
- `aria-controls`
- `aria-pressed`
- polite state announcements
- skip links
- reduced-motion support

### Data handling

- Runtime validation of API JSON
- Allowed status/accent enumerations
- date validation
- no `dangerouslySetInnerHTML`
- no sensitive console logging
- no frontend private keys or API secrets

### Browser policy

- same-origin script policy
- constrained connections, images, fonts, workers, and manifests
- objects and base URL changes blocked
- no-referrer metadata
- same-origin service-worker handling

### Offline behavior

- only GET requests are intercepted
- exact credential pathname match
- successful response required before caching
- cache write awaited
- cached fallback after network or HTTP failure
- obsolete cache versions deleted

### Testing

- fake-timer security test
- hidden-tab test
- cleanup test
- keyboard/live-region test
- invalid API payload test
- no-fetch-before-login test
- offline strategy tests

## 3. Known limitations

### Simulated authentication

The demo user and access code are shipped to the browser. This login can be bypassed and must never be treated as authentication.

### Plaintext browser data

The complete mock sensitive number exists in:

- API response
- Redux memory
- component properties
- Cache Storage

UI masking is not encryption.

### Frontend-only logout

Logout currently removes the dashboard from view but does not invalidate a server session because no server exists. Redux credentials and the offline cache remain available in the browser environment.

### Metadata CSP

The current CSP is development-compatible and permits inline styles for Vite. Production needs an HTTP-header CSP and should remove unnecessary inline permissions.

## 4. Production target architecture

```text
Browser
  --> HTTPS/CDN/WAF
  --> identity provider or session service
  --> API gateway
  --> credential service
  --> encrypted data store and key-management service
```

The backend must enforce:

- authentication
- credential ownership
- authorization
- consent
- recent authentication for reveal
- rate limiting
- audit logging
- token/session invalidation

## 5. Recommended API design

Dashboard endpoint:

```http
GET /api/credentials
```

Returns masked metadata only:

```json
{
  "id": "cred-aadhaar-01",
  "type": "Aadhaar Identity",
  "maskedNumber": "XXXX-XXXX-1234",
  "status": "verified"
}
```

Reveal endpoint:

```http
POST /api/credentials/{id}/reveal
```

Requirements:

- authenticated session
- server-side ownership check
- recent re-authentication
- CSRF/origin protection
- rate limiting
- security audit event
- short response lifetime
- no service-worker caching

Headers:

```http
Cache-Control: no-store, max-age=0
Pragma: no-cache
```

## 6. Authentication recommendations

Use a reviewed standard:

- OIDC/OAuth Authorization Code with PKCE
- passkeys/WebAuthn
- approved identity-provider integration
- opaque server session

Prefer cookies configured as:

```text
HttpOnly
Secure
SameSite=Lax or Strict
Path=/
```

Do not store long-lived tokens in localStorage, sessionStorage, Redux persistence, Cache Storage, or IndexedDB.

## 7. Authorization requirements

Every backend request must derive identity from the verified session and confirm resource ownership. Never trust client-provided user IDs, role values, disabled buttons, hidden fields, or Redux state.

Protect against insecure direct object reference by checking each credential ID against the authenticated account.

## 8. XSS controls

Continue to:

- render strings with React interpolation
- avoid `dangerouslySetInnerHTML`
- avoid `innerHTML`, `eval`, and `new Function`
- validate dynamic URLs and protocols
- avoid third-party scripts
- keep CSP restrictive

If rich HTML is required, use a reviewed sanitizer with a restrictive allowlist and retain CSP.

## 9. Production security headers

Configure at the server/CDN:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-...'; style-src 'self' 'nonce-...'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://approved-api.example; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

Test CSP first in report-only mode.

## 10. Service-worker production rules

- Cache only masked metadata.
- Never cache reveal responses, tokens, or private keys.
- Clear user-specific caches on logout.
- Prevent User B from receiving User A's cached response.
- Cancel or ignore requests from an expired session.
- Test worker upgrades and rollback.
- Keep `/sw.js` small, same-origin, and served over HTTPS.

## 11. Logging and privacy

Never include these fields in analytics, error monitoring, URLs, or console logs:

- full identity number
- access/refresh token
- session identifier
- access code or OTP
- credential payload
- private key

Disable or mask session replay on wallet screens. Apply server-side redaction before storing logs.

## 12. Dependency security

Recommended CI gates:

```bash
npm ci
npm run lint
npm test
npm run build
npm audit
```

Also enable dependency review, secret scanning, static analysis, lock-file review, and automated update proposals after the repository is published.

## 13. Incident-oriented controls

A production wallet needs:

- session/device inventory
- remote session revocation
- credential access audit history
- suspicious reveal monitoring
- account recovery
- key rotation
- incident response playbook
- breach notification process
- backup and restore security

## 14. Security verification checklist

Before real data:

- [ ] Formal threat model approved
- [ ] Backend authentication implemented
- [ ] Server authorization tested
- [ ] Full values removed from dashboard response
- [ ] Reveal endpoint protected and non-cacheable
- [ ] User cache deleted on logout
- [ ] HTTPS and production headers configured
- [ ] CSRF controls tested
- [ ] Rate limits tested
- [ ] Sensitive logs redacted
- [ ] Dependency and secret scanning enabled
- [ ] Accessibility audit completed
- [ ] Penetration test completed
- [ ] Privacy impact assessment completed

## 15. Responsible reporting

Do not include real credentials, tokens, or personal data in bug reports. A published project should define a private security contact or repository security-advisory process for vulnerability reports.
