const APP_CACHE = 'identity-wallet-shell-v2'
const CREDENTIAL_CACHE = 'identity-wallet-credentials-v2'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/wallet-icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => ![APP_CACHE, CREDENTIAL_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

const offlineCredentials = () => new Response('[]', {
  status: 200,
  headers: { 'Content-Type': 'application/json', 'X-Offline-Fallback': 'true' },
})

async function credentialResponse(request) {
  try {
    const response = await fetch(request)
    if (!response.ok) throw new Error('Credential request failed')
    const cache = await caches.open(CREDENTIAL_CACHE)
    await cache.put(request, response.clone())
    return response
  } catch {
    return await caches.match(request) ?? offlineCredentials()
  }
}

async function shellResponse(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(APP_CACHE)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    if (request.mode === 'navigate') return await caches.match('/index.html') ?? Response.error()
    return Response.error()
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) return
  if (requestUrl.pathname === '/api/credentials') {
    event.respondWith(credentialResponse(event.request))
    return
  }
  event.respondWith(shellResponse(event.request))
})
