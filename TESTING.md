# Testing Guide

## 1. Test stack

- Vitest: runner, mocks, assertions, fake timers
- React Testing Library: component rendering and accessible queries
- `@testing-library/user-event`: realistic keyboard and pointer interaction
- `@testing-library/jest-dom`: DOM-specific assertions
- jsdom: browser-like test environment

Configuration is in `vite.config.ts`; common matcher setup is in `src/test/setup.ts`.

## 2. Run tests

Run once:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Complete verification:

```bash
npm test
npm run lint
npm run build
```

Current expected result:

```text
Test files: 3 passed
Tests:      17 passed
```

## 3. Test philosophy

Tests prefer behavior visible to a user or assistive technology:

- buttons are queried by role and accessible name
- fields are queried by label
- alerts are queried by role
- headings confirm state transitions
- sensitive text presence/absence verifies security behavior

Tests do not depend on internal component variables or CSS selectors unless necessary.

## 4. `src/App.test.tsx`

This file provides integration coverage for the login gate, Redux store, API request, validation, and dashboard states.

Every render uses:

```tsx
<Provider store={createAppStore()}>
  <App />
</Provider>
```

A fresh store avoids state leakage between tests.

### Sandbox access tests

#### Shows login without fetching credentials

Verifies:

- sign-in heading is visible
- `fetch` was not called before authentication

Security value: unauthenticated UI does not request credential data.

#### Rejects invalid sandbox credentials

Simulates typing an unknown user and invalid access code, submits the form, and checks the accessible alert.

#### Returns to login on sign out

Uses demo access, enters the dashboard, activates the sign-out control, and verifies that the sign-in heading returns.

### Dashboard tests

#### Loads and displays credentials

Uses a deliberately unresolved fetch promise so the loading skeleton can be asserted. The test then resolves the request and verifies:

- loading state
- credential heading
- masked sensitive number

#### Empty state

Returns an empty array and verifies `No credentials yet`.

#### Error state

Returns a non-success response and verifies:

- alert role
- user-readable error
- retry button

#### Invalid payload

Returns an object missing required fields and verifies runtime validation sends the UI to the error state.

#### Exact API endpoint

Verifies `fetch` was called with `/api/credentials`.

## 5. `src/components/SecureDataMask.test.tsx`

### Default masking

Confirms:

- `XXXX-XXXX-1234` is present
- complete formatted value is absent

### Ten-second security timeout

Sequence:

1. Enable fake timers.
2. Mount the component.
3. Click `Tap to reveal`.
4. Verify complete formatted value.
5. Verify pressed state.
6. Advance timers by exactly 10,000ms inside `act`.
7. Verify masked value.
8. Verify complete value is absent.

This directly implements the assignment's critical automated test.

### Immediate hide

Reveals and then selects `Hide now`; verifies immediate masking.

### Keyboard and live-region behavior

Focuses the reveal button, presses Enter through `userEvent`, verifies the value, and checks the polite timeout announcement.

### Background hiding

Reveals the value, changes `document.hidden` to true, dispatches `visibilitychange`, and verifies the complete value is removed.

### Unmount cleanup

Spies on `clearTimeout`, starts a reveal timer, unmounts the component, and verifies cleanup.

## 6. `src/test/serviceWorker.test.ts`

The service worker is classic JavaScript rather than an imported module. The tests read `public/sw.js` and evaluate it in an isolated VM context with mocks for:

- `self`
- event listeners
- `caches`
- `fetch`
- `Response`

### Successful network response

Verifies the response is returned and `cache.put` is called before completion.

### HTTP failure fallback

Returns an HTTP 500 response while a cached response exists and verifies the cached value is returned.

### Offline/no-cache fallback

Rejects `fetch`, provides no cached response, and verifies:

- JSON body equals `[]`
- `X-Offline-Fallback` header equals `true`

## 7. Mocking rules

`fetch` is replaced per test through `vi.stubGlobal`. Mocks are restored after tests to prevent cross-test contamination.

Fake timers are returned to real timers after each `SecureDataMask` test.

No test makes a real network request.

## 8. Adding a dashboard state test

Recommended pattern:

```tsx
it('describes expected behavior', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => expectedPayload,
  }))

  renderApp()
  await login()

  expect(await screen.findByRole(...)).toBeInTheDocument()
})
```

Use `findBy*` for asynchronous results and `getBy*` for content that must already exist.

## 9. Adding a timer test

Recommended pattern:

```tsx
vi.useFakeTimers()
render(<SecureDataMask value="234567891234" />)
fireEvent.click(screen.getByRole('button', { name: /tap to reveal/i }))
act(() => vi.advanceTimersByTime(10_000))
expect(screen.getByText('XXXX-XXXX-1234')).toBeInTheDocument()
```

Always restore real timers in cleanup.

## 10. Manual verification checklist

### Login

- Tab order follows the visible form.
- Enter submits valid credentials.
- Invalid values show an announced error.
- Demo autofill works.
- Mobile layout does not horizontally scroll.

### Dashboard

- Loading skeleton appears on a delayed response.
- Error retry issues another request.
- Empty response shows empty state.
- Cards become one column on narrow screens.

### Reveal security

- Value starts masked.
- Button works with mouse, touch, Enter, and Space.
- Value hides after 10 seconds.
- `Hide now` works immediately.
- Switching tabs hides the value.
- Screen reader announces reveal/hide changes.

### PWA

Use a production preview:

```bash
npm run build
npm run preview
```

Then:

1. Open browser developer tools.
2. Confirm `/sw.js` is active.
3. Load credentials while online.
4. Enable offline mode.
5. Reload and confirm the cached list is available.
6. Confirm no service worker is registered during normal Vite development.

## 11. Coverage still recommended for production

- Real authentication callback tests
- Server authorization tests
- CSRF tests
- logout cache deletion
- stale-request cancellation
- multi-user cache isolation
- protected reveal endpoint not cached
- CSP end-to-end checks
- automated accessibility scanner
- browser/device matrix
- penetration and dynamic application testing
