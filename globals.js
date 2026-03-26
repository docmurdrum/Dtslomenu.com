// ══════════════════════════════════════════════
// GLOBALS.JS — Single source of truth
// All shared state declared here, loaded first
// Never redeclare these in other files
// ══════════════════════════════════════════════

var BUILD_VERSION = '5.0.0';
var BUILD_DATE    = '2026-03-25';

// ── MAP ──
var homeMap      = null;   // MapLibre map instance — set by menu_home.js
var MAPTILER_KEY = 'kiFBCC0bWlsukNO2sHf7';

// ── AUTH / USER ──
var currentUser  = null;   // Supabase user object — set by auth.js
var supabaseClient = null; // Set by shared.js after Supabase init

// ── BAR STATE ──
var currentBarIndex  = null;
var currentBarId     = null;

// ── APP FLAGS ──
var homeDone         = false;
var activeDrawer     = null;

// ── TOAST (declared here, implemented in shared.js) ──
// showToast() is defined in shared.js — available globally

// ── SAFETY: warn if any file tries to redeclare these ──
// (development aid — silent in production)
if (typeof window !== 'undefined') {
  window.__GLOBALS_LOADED = true;
}

// ── MERCH / PRINTFUL ──
var PRINTFUL_KEY = 'r1xwbRdtOpANsjTjcsP7IFiA6XssWqSu28UWAsG8';
var PRINTFUL_API = 'https://api.printful.com';

// ── GEO DISTANCE HELPER ──
function geoDistance(lat1, lng1, lat2, lng2) {
  var R = 3958.8; // miles
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Current map center — updated when Find Hubs marker is tapped
var _findHubsUserCenter = null;

// ── HUB PARENT HELPER ──
// Hubs can open from the hub screen OR from inside the app.
// Always use this to get the right parent container.
function getHubParent() {
  var menuHome = document.getElementById('menu-home');
  if (menuHome && menuHome.style.display !== 'none') return menuHome;
  return document.body;
}
window.getHubParent = getHubParent;

// ── ITINERARY GLOBAL ──
// Open itinerary from anywhere in the app
function openItinerary() {
  // Inside DTSLO app
  var app = document.getElementById('app');
  if (app && app.style.display !== 'none') {
    if (typeof openItineraryBuilder === 'function') {
      var saved = [];
      try { saved = JSON.parse(localStorage.getItem('dtslo_itineraries') || '[]'); } catch(e) {}
      if (saved.length) {
        openItineraryBuilder(saved[0], false);
      } else {
        // No saved plans — open a blank one
        openItineraryBuilder({
          id: Math.random().toString(36).slice(2,10),
          share_id: Math.random().toString(36).slice(2,10),
          name: 'Tonight',
          mode: 'planned',
          start_time: '9:00 PM',
          using_rideshare: false,
          group_size: 2,
          stops: [],
          total_cost: '',
          created: Date.now()
        }, false);
      }
    }
    return;
  }
  // From hub screen — open Plan It
  if (typeof openPlanIt === 'function') openPlanIt();
}
window.openItinerary = openItinerary;

// ══════════════════════════════════════════════
// HUB ACTIVATION SYSTEM
// Tap hub → pins vanish → spot markers glow on map
// Tap marker → zoom+rotate → hub opens sorted by proximity
// ══════════════════════════════════════════════

var _activeHubMarkers = [];   // glowing spot markers currently on map
var _savedHubMarkers  = [];   // regular hub pin markers to restore

// Called by each hub BEFORE opening its full sheet
// spots = array of { name, emoji, coords:[lng,lat] }
// onSelect(spotId, coords) = called when marker tapped
function hubActivateMapMode(spots, color, onSelect) {
  if (!homeMap || !window.maplibregl) return;

  // 1. Hide all existing hub pin markers
  var existingPins = document.querySelectorAll('.mh-hub-marker');
  existingPins.forEach(function(el) {
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  });

  // 2. Inject pulse CSS once
  if (!document.getElementById('hub-spot-css')) {
    var s = document.createElement('style');
    s.id = 'hub-spot-css';
    s.textContent =
      '@keyframes spot-pulse{0%{box-shadow:0 0 0 0 rgba(var(--sc),0.8)}70%{box-shadow:0 0 0 18px rgba(var(--sc),0)}100%{box-shadow:0 0 0 0 rgba(var(--sc),0)}}' +
      '.hub-spot-marker{cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:transform 0.2s}' +
      '.hub-spot-marker:active{transform:scale(0.9)!important}' +
      '.hub-spot-dot{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid rgba(255,255,255,0.6);animation:spot-pulse 2.2s ease-out infinite}' +
      '.hub-spot-lbl{font-size:9px;font-weight:800;color:#fff;background:rgba(0,0,0,0.75);padding:2px 6px;border-radius:20px;white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(255,255,255,0.15);backdrop-filter:blur(4px)}';
    document.head.appendChild(s);
  }

  // Parse color to rgb for CSS variable
  var rgb = hexToRgb(color) || '255,255,255';

  // 3. Place glowing marker for each spot that has coords
  spots.forEach(function(spot, idx) {
    if (!spot.coords || spot.coords.length < 2) return;

    var el = document.createElement('div');
    el.className = 'hub-spot-marker';
    el.style.cssText = '--sc:' + rgb + ';transform:scale(0);transition:transform 0.4s cubic-bezier(0.34,1.5,0.64,1)';

    var dot = document.createElement('div');
    dot.className = 'hub-spot-dot';
    dot.style.cssText = 'background:' + color + 'cc;box-shadow:0 0 16px ' + color + '99';
    dot.textContent = spot.emoji || '📍';

    var lbl = document.createElement('div');
    lbl.className = 'hub-spot-lbl';
    lbl.textContent = spot.name;

    el.appendChild(dot);
    el.appendChild(lbl);

    el.addEventListener('click', function() {
      // Fly to spot: zoom in, rotate toward it
      try {
        homeMap.flyTo({
          center: spot.coords,
          zoom: 16,
          pitch: 55,
          bearing: (Math.random() * 60) - 30, // slight random bearing for drama
          duration: 900,
          essential: true
        });
      } catch(e) {}
      // Store user center for proximity sort
      window._findHubsUserCenter = [spot.coords[1], spot.coords[0]];
      // Call the hub opener after fly animation
      setTimeout(function() {
        if (typeof onSelect === 'function') onSelect(spot.id || spot.name, spot.coords);
      }, 600);
    });

    try {
      var marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(spot.coords)
        .addTo(homeMap);
      _activeHubMarkers.push(marker);
    } catch(e) {}

    // Stagger pop-in
    setTimeout(function() { el.style.transform = 'scale(1)'; }, 40 + idx * 55);
  });
}

// Restore map to normal state — remove spot markers, show hub pins
function hubDeactivateMapMode() {
  _activeHubMarkers.forEach(function(m) { try { m.remove(); } catch(e) {} });
  _activeHubMarkers = [];
  // Restore hub pin visibility
  document.querySelectorAll('.mh-hub-marker').forEach(function(el) {
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
  });
}
window.hubDeactivateMapMode = hubDeactivateMapMode;

function hexToRgb(hex) {
  if (!hex) return null;
  var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? parseInt(r[1],16)+','+parseInt(r[2],16)+','+parseInt(r[3],16) : null;
}
