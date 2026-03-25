// ══════════════════════════════════════════════
// DTSLO Service Worker
// Caches core assets for offline/fast load
// ══════════════════════════════════════════════

const CACHE_NAME = 'dtslo-v3.1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/base.css',
  '/auth.css',
  '/profile.css',
  '/lines.css',
  '/delivery.css',
  '/lost.css',
  '/games.css',
  '/achievements.css',
  '/missions.css',
  '/bar.css',
  '/friends.css',
  '/shared.js',
  '/auth.js',
  '/profile.js',
  '/lines.js',
  '/delivery.js',
  '/lost.js',
  '/games.js',
  '/dice.js',
  '/bar.js',
  '/friends.js',
  '/party_games.js',
  '/achievements.js',
  '/onboarding.js',
  '/missions.js',
  '/missed_connections.js',
  '/leaderboard.js',
  '/intro.js',
  '/menu_home.js',
];

// Install — cache core assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key)   { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch — cache first for core assets, network first for API calls
self.addEventListener('fetch', function(e) {
  // Skip Supabase, MapTiler, and CDN requests — always network
  var url = e.request.url;
  if (url.includes('supabase.co') ||
      url.includes('maptiler.com') ||
      url.includes('cdn.jsdelivr') ||
      url.includes('unpkg.com') ||
      url.includes('maplibre')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache successful GET requests
        if (e.request.method === 'GET' && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback — return cached index.html
        return caches.match('/index.html');
      });
    })
  );
});
