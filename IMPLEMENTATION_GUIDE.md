# Implementation Guide

## 1. Local setup

Requirements:

- Node.js compatible with the installed Vite version
- npm
- A modern browser with service-worker support for production preview

Install and start:

```bash
npm install
npm run dev
```

Use the URL printed by Vite.

Demo access:

```text
User ID: aarav@uidai-sandbox.test
Access code: 123456
```

These credentials are intentionally public because login is a frontend sandbox simulation.

## 2. Available commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm test` | Run all Vitest tests once |
| `npm run test:watch` | Run tests interactively while developing |
| `npm run lint` | Run Oxlint rules |
| `npm run build` | Type-check and build production assets |
| `npm run preview` | Serve the generated `dist` build locally |

## 3. Login implementation

`src/components/LoginScreen.tsx` owns the simulated login form.

### Form state

- `userId`: sandbox email-like identifier.
- `accessCode`: numeric six-digit value.
- `error`: accessible validation feedback.

### Input controls

- User ID uses `type="email"` and `autocomplete="username"`.
- Access code uses `type="password"`, numeric input mode, six-character limit, and `autocomplete="current-password"`.
- Non-digit characters are removed from the access-code input.
- Validation failures are presented with `role="alert"`.

### Demo autofill

`Use demo access` fills the two public sandbox values. It exists to make the assignment easy to review and does not represent production authentication.

### Application gate

`App` starts with `authenticated = false`. Credential fetching checks both authentication state and Redux status, so opening the application does not request credentials before simulated login.

Logout sets `authenticated` back to false and unmounts the dashboard and sensitive-data components.

## 4. Redux implementation

### Store

`src/app/store.ts` calls `configureStore` with one reducer:

```ts
reducer: { credentials: credentialsReducer }
```

It exports:

- Shared application `store`
- `createAppStore()` for isolated tests
- `RootState`
- `AppDispatch`

### Typed hooks

`src/app/hooks.ts` provides:

```ts
useAppDispatch
useAppSelector
```

These eliminate repeated generic annotations and preserve state/action types.

### Async thunk

`fetchCredentials` performs:

```text
fetch('/api/credentials')
    --> check response.ok
    --> decode JSON
    --> parseCredentials
    --> fulfill or reject
```

Redux Toolkit generates pending, fulfilled, and rejected actions automatically.

### Reducer transitions

Pending:

- status becomes `loading`
- previous error becomes `null`

Fulfilled:

- status becomes `succeeded`
- items become validated payload
- `lastUpdated` receives the current ISO timestamp

Rejected:

- status becomes `failed`
- error receives the thrown message or fallback

## 5. Runtime validation

`src/features/credentials/types.ts` defines compile-time types and runtime guards.

A credential must include:

- non-empty string ID
- non-empty type
- non-empty issuer
- non-empty holder name
- sensitive string with at least four characters
- allowed status: verified, pending, or expired
- valid issue date
- valid optional expiry date
- allowed accent: red, blue, or green

`parseCredentials` rejects values that are not arrays or contain any invalid item.

Why both TypeScript and runtime validation are needed:

- TypeScript checks code written in the repository.
- API JSON is unknown at runtime.
- A type assertion does not inspect network data.
- Runtime validation prevents malformed payloads from reaching rendering logic.

## 6. Dashboard implementation

`src/App.tsx` selects:

```ts
items
status
error
lastUpdated
```

The dashboard includes:

- Skip link
- Responsive header and mobile navigation
- Welcome/identity hero
- Credential count
- Synchronization status
- Add-credential demonstration action
- Required request states
- Responsive credential cards
- Sandbox privacy warning
- Footer navigation

### Loading state

`LoadingState` presents two skeleton cards and exposes:

```html
aria-busy="true"
aria-label="Loading credentials"
```

### Error state

`ErrorState` uses `role="alert"`, displays the Redux error message, and dispatches another fetch when the user chooses `Try again`.

### Empty state

`EmptyState` appears only after a successful request returns an empty array.

### Credential card

`CredentialCard` uses semantic elements:

- `article` for a standalone credential
- `dl`, `dt`, and `dd` for metadata
- visible status label
- locale-aware date formatting through `Intl.DateTimeFormat('en-IN')`
- reusable `SecureDataMask`

## 7. SecureDataMask implementation

### Public API

```ts
interface SecureDataMaskProps {
  value: string
  label?: string
  timeoutMs?: number
}
```

Defaults:

- Label: `Identity number`
- Timeout: 10,000 milliseconds

### Masking

A 12-digit value is rendered as:

```text
XXXX-XXXX-1234
```

When revealed:

```text
2345-6789-1234
```

Generic alphanumeric values use bullet masking and remain unmodified when revealed.

### Local state

`revealedValue` is `null` while hidden. Reveal copies the prop value into temporary state. Hide sets it back to `null` rather than only changing a Boolean flag.

### Timer handling

The timeout ID is stored in `useRef` because it must survive renders without causing a render. A shared `clearRevealTimer` callback is used before starting another timer, during hiding, and during unmount.

Timeout input is validated:

- non-finite, zero, and negative values fall back to 10 seconds
- custom values are capped at 60 seconds

### Background protection

The component listens for `visibilitychange`. If `document.hidden` is true, the value is immediately hidden and removed from reveal state.

### Accessibility

- Native `button` supports pointer, Enter, and Space activation.
- `type="button"` prevents accidental form submission.
- `aria-controls` connects the button to the displayed value.
- `aria-pressed` exposes toggle state.
- The displayed value announces whether it is masked or visible.
- Decorative symbols use `aria-hidden`.
- A polite `role="status"` live region announces reveal/hide changes.
- Global `:focus-visible` styling supplies a visible focus indicator.

## 8. PWA implementation

### Manifest

`public/manifest.webmanifest` defines:

- Application name and short name
- Description
- Standalone display mode
- Theme/background colors
- Categories
- Standard and maskable icon entries

### Registration

`src/main.tsx` registers `/sw.js` only in production and after the window load event.

### Credential strategy

`public/sw.js` intercepts same-origin GET requests whose path is exactly `/api/credentials`.

Network-first algorithm:

```text
Try network
    --> non-success status treated as failure
    --> open credential cache
    --> await cache.put(response.clone())
    --> return network response
Catch failure
    --> return matching cached response
    --> otherwise return [] JSON fallback
```

### Application shell strategy

Basic shell resources are precached during installation. Other same-origin GET resources use cache-first behavior and are cached after successful retrieval. Navigation failure falls back to cached `index.html`.

### Cache lifecycle

Activation removes obsolete cache versions and claims clients.

## 9. Styling approach

`src/index.css` contains:

- Design tokens
- Global box sizing
- Body defaults
- focus-visible treatment
- screen-reader-only utility
- skip-link behavior
- reduced-motion preference handling

`src/App.css` contains:

- Header and navigation styles
- Login split-screen and card design
- Hero illustration built with CSS
- Credential grid/cards
- Dashboard states
- Footer
- 900px and 600px responsive adaptations

## 10. CSP and privacy metadata

`index.html` defines a development-compatible CSP and `no-referrer` policy.

The CSP limits scripts, images, fonts, connections, workers, manifests, objects, base URLs, and form destinations. Inline styles are currently permitted because Vite injects CSS during development.

Production should move CSP to an HTTP header and remove inline-style permission when the deployment supports nonce/hash or external-only styles.

## 11. Production migration checklist

Before real identity data is used:

1. Replace simulated login with OIDC/OAuth PKCE, passkeys, or approved authentication.
2. Enforce ownership and authorization on the backend.
3. Return only masked metadata from the dashboard endpoint.
4. Add a protected, audited, non-cacheable reveal endpoint.
5. Do not cache complete identifiers.
6. Clear state and user-specific storage during logout.
7. Add server session invalidation and CSRF protection.
8. Configure HTTPS, CSP, HSTS, and other security headers.
9. Add rate limiting, monitoring, and redacted audit logs.
10. Perform threat modeling, accessibility audit, and penetration testing.

## 12. Common interview questions

### Why Redux instead of only Context?

Redux Toolkit makes the async request lifecycle explicit, provides isolated store creation for tests, and scales cleanly if credential operations expand. Local component state is still used where global state is unnecessary.

### Why validate API JSON if TypeScript already defines `Credential`?

TypeScript types do not exist at runtime. External JSON can be malformed, so it must be validated before entering application state.

### Why store the revealed value rather than a Boolean?

The requirement explicitly asks to clear the unmasked local value. A nullable revealed value allows the component to set that temporary copy back to `null` after hiding.

### Why use `useRef` for the timer?

The timeout ID must persist across renders but changing it should not render the UI. That is exactly the use case for a ref.

### Why Vitest instead of Jest?

The assignment permits an equivalent testing tool. Vitest supplies Jest-compatible assertions, mocks, and fake timers while integrating directly with Vite and TypeScript.

### Why network-first for credentials?

Users should receive the newest credential list while connected, but the last successful list should remain available after a network drop.

### Is the login secure?

No. It is intentionally a sandbox UI simulation. Real authentication and authorization cannot be enforced solely by frontend JavaScript.
