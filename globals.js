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
var currentBarIndex  = 0;
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
