// ══════════════════════════════════════════════
// DTSLO Service Worker v6.1.2
// Network-first for JS/HTML, cache-first for assets.
// Bump CACHE_NAME on every deploy to bust old caches.
// ══════════════════════════════════════════════

const CACHE_NAME = 'dtslo-v6.3.31';

const CORE_ASSETS = [
  '/','/index.html',
  '/base.css','/auth.css','/profile.css','/lines.css','/delivery.css',
  '/lost.css','/games.css','/achievements.css','/missions.css','/bar.css','/friends.css',
  '/globals.js','/shared.js','/auth.js','/profile.js','/lines.js','/delivery.js',
  '/lost.js','/games.js','/dice.js','/bar.js','/friends.js','/party_games.js',
  '/achievements.js','/onboarding.js','/missions.js','/missed_connections.js',
  '/leaderboard.js','/intro.js','/hub_animation.js','/menu_home.js',
  '/sync.js','/smart_start.js','/crafting.js','/bar_golf.js','/itinerary.js',
  '/merch.js','/plan_it.js','/travel.js','/pin_mover.js','/tool_sheets.js',
  '/line_skip.js','/budget.js','/beach_hub.js','/restaurant_hub.js','/wine_hub.js',
  '/brewery_hub.js','/nature_hub.js','/thrill_hub.js','/events_hub.js',
  '/calpoly_hub.js','/city_hub.js','/icon-192.png','/icon-512.png','/manifest.json',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  if (url.includes('supabase.co') || url.includes('maptiler.com') ||
      url.includes('cdn.jsdelivr') || url.includes('unpkg.com') ||
      url.includes('maplibre') || url.includes('anthropic.com') ||
      url.includes('printful.com')) { return; }

  var isJS   = url.endsWith('.js');
  var isHTML = url.endsWith('.html') || url.endsWith('/');

  if (isJS || isHTML) {
    // Network first — always fresh code
    e.respondWith(
      fetch(e.request).then(function(response) {
        if (response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request).then(function(c) { return c || caches.match('/index.html'); });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(response) {
          if (e.request.method === 'GET' && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, clone); });
          }
          return response;
        });
      })
    );
  }
});
