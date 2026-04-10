/* ═══════════════════════════════════════════════════════════════
   KINETIC MONOLITH — Service Worker (Offline-First)
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = 'kinetic-monolith-v1'
const CREATIVE_CACHE = 'kinetic-creatives-v1'

// App shell assets to cache on install
const APP_SHELL = [
  '/',
  '/index.html'
]

// Creative assets (images/videos) to pre-cache
const CREATIVE_ASSETS = [
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=90',
  "/creatives/H_M_180.mp4", // Example video in /public/creatives/
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=90',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=90',
  'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=1920&q=90',
]

// ── Install: cache app shell ───────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Install')
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(APP_SHELL).catch((err) => {
          console.warn('[SW] App shell cache partial failure:', err)
        })
      }),
      caches.open(CREATIVE_CACHE).then((cache) => {
        return Promise.allSettled(
          CREATIVE_ASSETS.map((url) =>
            cache.add(url).catch((err) =>
              console.warn('[SW] Creative cache miss:', url, err)
            )
          )
        )
      }),
    ]).then(() => self.skipWaiting())
  )
})

// ── Activate: clean old caches ─────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate')
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== CREATIVE_CACHE)
          .map((k) => {
            console.log('[SW] Deleting old cache:', k)
            return caches.delete(k)
          })
      )
    ).then(() => self.clients.claim())
  )
})

// ── Fetch: Cache-first for creatives, Network-first for shell ──
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  const isCreative =
    CREATIVE_ASSETS.some((asset) => request.url.includes(asset)) ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i)

  if (isCreative) {
    // Cache-first: show cached immediately, update in background
    event.respondWith(
      caches.open(CREATIVE_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        try {
          const fresh = await fetch(request)
          if (fresh.ok) cache.put(request, fresh.clone())
          return fresh
        } catch {
          return new Response('Creative unavailable offline', { status: 503 })
        }
      })
    )
  } else {
    // Network-first for app shell (with offline fallback)
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          // Fallback to index.html for navigation requests
          if (request.mode === 'navigate') {
            const fallback = await caches.match('/index.html')
            if (fallback) return fallback
          }
          return new Response('Offline', { status: 503 })
        })
    )
  }
})
