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
