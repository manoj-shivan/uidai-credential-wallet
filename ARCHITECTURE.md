# Architecture Guide

## 1. Purpose

This project is a frontend assignment implementation for a simulated UIDAI Sandbox credential wallet. It demonstrates a responsive login experience, credential dashboard, Redux state management, secure reveal behavior, accessibility, offline fallback, runtime validation, and automated testing.

All identities, access codes, and credentials are mock data. The application is not a production authentication or Aadhaar-storage system.

## 2. Technology decisions

| Technology | Responsibility | Reason for selection |
|---|---|---|
| React 19 | Component rendering and local UI state | Component model and accessible event handling |
| TypeScript | Static type safety | Defines credential and component contracts |
| Redux Toolkit | Shared credential/request state | Explicit async lifecycle and predictable updates |
| React Redux | React-to-store integration | Typed selectors and dispatch hooks |
| Vite | Development and production builds | Fast development and native Vitest integration |
| Vitest | Test runner and fake timers | Jest-equivalent API designed for Vite |
| React Testing Library | UI behavior tests | Tests through accessible user-facing behavior |
| Vanilla service worker | Offline request strategy | Meets requirements without an extra Workbox dependency |
| Cache Storage | Last-known mock credential response | Browser-native offline fallback required by the assignment |

## 3. High-level architecture

```text
index.html
    |
    v
src/main.tsx
    |-- registers production service worker
    |-- creates React root
    |-- provides Redux store
    v
src/App.tsx
    |-- unauthenticated --> LoginScreen
    |
    `-- authenticated --> Dashboard
                           |-- Header and logout
                           |-- Loading/Error/Empty states
                           `-- CredentialCard[]
                                  `-- SecureDataMask

Redux data path:
App --> dispatch(fetchCredentials)
       --> GET /api/credentials
       --> parseCredentials(runtime validation)
       --> credentialsSlice
       --> App selector
       --> dashboard state/card rendering

Offline path:
GET /api/credentials
       --> public/sw.js
       --> network success: cache + return
       --> network/HTTP failure: cached response
       `-- no cache: [] fallback
```

## 4. Project structure

```text
uidai-credential-wallet/
|-- index.html                         HTML shell, CSP, manifest metadata
|-- package.json                       Scripts and dependencies
|-- package-lock.json                  Reproducible dependency versions
|-- vite.config.ts                     Vite and Vitest configuration
|-- tsconfig.json                      TypeScript project references
|-- tsconfig.app.json                  Browser/test TypeScript settings
|-- tsconfig.node.json                 Build configuration typing
|-- .oxlintrc.json                     Lint rules
|-- .gitignore                         Generated/dependency exclusions
|-- README.md                          Project overview and document index
|-- ARCHITECTURE.md                    System structure and data flows
|-- IMPLEMENTATION_GUIDE.md            Feature-by-feature explanation
|-- TESTING.md                         Test strategy and test case inventory
|-- SECURITY.md                        Threat model, controls, and limitations
|-- FrontendDev_Manoj_Assignment.html  Editable assignment report
|-- FrontendDev_Manoj_Assignment.pdf   Submission report
|-- public/
|   |-- api/
|   |   |-- credentials                Exact GET /api/credentials fixture
|   |   `-- credentials.json           Original mock-data fixture
|   |-- manifest.webmanifest           PWA metadata
|   |-- sw.js                          Service-worker caching logic
|   |-- wallet-icon.svg                PWA icon
|   |-- favicon.svg                    Legacy template icon
|   `-- icons.svg                      Static icon asset
|-- src/
|   |-- main.tsx                       React entry and service-worker registration
|   |-- App.tsx                        Login gate and dashboard composition
|   |-- App.css                        Login/dashboard responsive design
|   |-- App.test.tsx                   Login and dashboard integration tests
|   |-- index.css                      Global tokens, focus, reduced motion
|   |-- app/
|   |   |-- store.ts                   Redux store creation
|   |   `-- hooks.ts                   Typed selector/dispatch hooks
|   |-- components/
|   |   |-- LoginScreen.tsx            Accessible simulated login
|   |   |-- CredentialCard.tsx         Individual credential presentation
|   |   |-- DashboardStates.tsx        Loading, error, and empty states
|   |   |-- SecureDataMask.tsx         Sensitive reveal lifecycle
|   |   `-- SecureDataMask.test.tsx    Security and accessibility tests
|   |-- features/credentials/
|   |   |-- types.ts                   Types and runtime validators
|   |   `-- credentialsSlice.ts        Async thunk and Redux state transitions
|   `-- test/
|       |-- setup.ts                   jest-dom matcher setup
|       `-- serviceWorker.test.ts      Offline strategy unit tests
`-- dist/                              Generated production build, ignored by Git
```

## 5. Application startup

`src/main.tsx` performs three tasks:

1. Imports global CSS.
2. Registers `/sw.js` after page load when `import.meta.env.PROD` is true.
3. Renders `App` inside Redux `Provider` and React `StrictMode`.

The service worker is intentionally disabled during Vite development to prevent stale cached assets from confusing development.

## 6. State ownership

### Local React state

Local state is used where data belongs to one UI boundary:

- `App.authenticated`: controls the simulated login gate.
- `Header.menuOpen`: controls mobile navigation.
- `LoginScreen.userId`, `accessCode`, and `error`: controls the login form.
- `SecureDataMask.revealedValue` and `announcement`: controls temporary reveal behavior.

### Redux state

Redux owns credential data shared by the dashboard:

```ts
{
  credentials: {
    items: Credential[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null,
    lastUpdated: string | null
  }
}
```

This separation avoids putting short-lived form or reveal state into the global store.

## 7. Authentication flow

```text
Application starts
    --> authenticated = false
    --> LoginScreen rendered
    --> no credential fetch occurs
    --> user enters sandbox credentials
    --> LoginScreen validates demo values
    --> onLogin()
    --> authenticated = true
    --> App dispatches fetchCredentials()
```

The login is explicitly simulated. It demonstrates routing/gating behavior but is not a security boundary. Production authentication must be enforced by a backend or identity provider.

## 8. Credential data flow

1. The authenticated application sees Redux status `idle`.
2. `useEffect` dispatches `fetchCredentials()`.
3. The thunk requests `GET /api/credentials`.
4. Non-success HTTP responses throw a user-readable error.
5. JSON is passed to `parseCredentials`.
6. Every object is validated at runtime.
7. The fulfilled reducer stores the validated array and update timestamp.
8. The rejected reducer stores the error message.
9. `App` selects Redux state and renders exactly one relevant dashboard state.

## 9. Rendering decisions

| Redux condition | Rendered result |
|---|---|
| `idle` or `loading` | Skeleton `LoadingState` |
| `failed` | Alert `ErrorState` with retry |
| `succeeded` and empty array | `EmptyState` |
| `succeeded` and non-empty array | Responsive credential grid |

This prevents an empty successful result from being mistaken for an error.

## 10. Responsive design

The application uses CSS Grid, Flexbox, fluid sizes, and breakpoints:

- Desktop: two-column credentials and split login layout.
- Under 900px: one-column credentials, collapsible navigation, stacked login layout.
- Under 600px: vertically stacked controls, compact margins, one-column login benefits, full-width actions.

Global reduced-motion rules disable animation and smooth scrolling for users who request reduced motion.

## 11. Build and deployment flow

```text
npm run build
    --> TypeScript project build
    --> Vite transforms React and CSS
    --> public/* copied into dist/*
    --> hashed JS/CSS assets generated
```

A production server should:

- Serve `dist/` over HTTPS.
- Route application navigation to `index.html`.
- Serve `/sw.js` from the origin root.
- Serve `/api/credentials` from a real authenticated API in production.
- Add production CSP and other security headers.
- Avoid caching sensitive reveal responses.

## 12. Interview summary

A concise explanation:

> I separated local interaction state from shared server state. Redux Toolkit owns the credential request lifecycle, while React state owns login presentation, navigation, and temporary reveal behavior. API data is validated at runtime because TypeScript alone cannot validate network responses. The dashboard explicitly renders loading, failure, empty, and populated states. Sensitive data is masked by default, temporarily copied into local state, automatically cleared, hidden when the tab is backgrounded, and covered by fake-timer tests. A vanilla service worker uses a network-first strategy for the exact credential endpoint and falls back to Cache Storage during network drops.
