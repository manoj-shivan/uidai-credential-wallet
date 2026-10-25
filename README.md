<<<<<<< HEAD
# UIDAI Sandbox Credential Wallet

A responsive Progressive Web App demonstrating a verifiable credential wallet for the UIDAI Innovation Sandbox frontend assignment. All identities and credentials are mock data.

## Features

- Accessible responsive sandbox login and logout flow
- Responsive credential dashboard built with React and TypeScript
- Redux Toolkit request and credential state management
- Explicit loading, error, empty, and success states
- Runtime validation of credential API responses
- Accessible sensitive-data masking with automatic re-masking after 10 seconds
- Network-first service worker strategy with offline credential fallback
- Installable web app manifest and maskable icon
- Automated dashboard, accessibility, security-timeout, and service-worker tests

## Security and privacy scope

This is a sandbox demonstration. It must not be used with real Aadhaar numbers or other identity data. Mock credentials are cached in browser Cache Storage to demonstrate offline behavior. Production identity systems require an approved threat model, encrypted storage, secure key management, authentication, authorization, content-security controls, and independent security review.

## Technology

- React 19
- TypeScript
- Redux Toolkit and React Redux
- Vite
- Vitest and React Testing Library
- Vanilla Service Worker and Cache Storage

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Verification

```bash
npm test
npm run lint
npm run build
```

## Documentation

| Document | Contents |
|---|---|
| [Architecture](./ARCHITECTURE.md) | System design, project structure, state ownership, data flows, build and deployment |
| [Implementation guide](./IMPLEMENTATION_GUIDE.md) | Feature-by-feature code explanation and interview questions |
| [Testing guide](./TESTING.md) | All test files, test cases, mocking approach, and manual verification |
| [Security model](./SECURITY.md) | Current safeguards, threat model, limitations, and production roadmap |
| [Assignment report](./FrontendDev_Manoj_Assignment.pdf) | Submission-ready PDF summary |

## Sandbox login

Use **Use demo access**, or enter:

```text
User ID: aarav@uidai-sandbox.test
Access code: 123456
```

This is simulated frontend access for mock data, not production authentication.

## Assignment implementation

### Dashboard and state management

The dashboard fetches mock credentials from `GET /api/credentials`. Redux Toolkit stores the request status, validated credentials, errors, and synchronization time. The UI renders dedicated loading, failure, empty, and populated states.

### Secure reveal component

`SecureDataMask` masks sensitive values by default. Its native button supports keyboard interaction and exposes state through ARIA attributes. Revealed data is copied into local state temporarily, announced through a polite live region, and cleared automatically after 10 seconds or immediately when the user selects **Hide now**.

### Offline behavior

The production build registers `public/sw.js`. The service worker uses a network-first strategy for `GET /api/credentials`, stores the latest successful mock response, and serves it after network or HTTP failure. It also caches same-origin application assets as they are requested.

## Project structure

```text
public/
  api/credentials        Mock API response
  manifest.webmanifest   PWA metadata
  sw.js                  Offline caching strategy
src/
  app/                   Redux store and typed hooks
  components/            Dashboard and secure reveal components
  features/credentials/  Credential types, validation, and Redux slice
  test/                   Test setup and service-worker tests
```

## Scope notes

Authentication and credential issuance are represented as sandbox UI only and are outside the three requested coding prompts. Non-dashboard navigation and add/detail actions are demonstration placeholders.
=======
# uidai-credential-wallet
>>>>>>> db0ce51b8d29688bfb8a19ac72b52aad84a7f939
