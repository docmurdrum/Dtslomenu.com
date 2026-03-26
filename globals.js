// ══════════════════════════════════════════════
// GLOBALS.JS — Single source of truth
// All shared state declared here, loaded first
// Never redeclare these in other files
// ══════════════════════════════════════════════

var BUILD_VERSION = '5.9.2';
var BUILD_DATE    = '2026-03-26';

// ── MAP ──
var homeMap      = null;
var MAPTILER_KEY = 'kiFBCC0bWlsukNO2sHf7';

// ── AUTH / USER ──
var currentUser    = null;
var supabaseClient = null;

// ── BAR STATE ──
var currentBarIndex = null;
var currentBarId    = null;

// ── APP FLAGS ──
var homeDone     = false;
var activeDrawer = null;

if (typeof window !== 'undefined') window.__GLOBALS_LOADED = true;

// ── MERCH ──
var PRINTFUL_KEY = 'r1xwbRdtOpANsjTjcsP7IFiA6XssWqSu28UWAsG8';
var PRINTFUL_API = 'https://api.printful.com';

// ── GEO DISTANCE (miles) ──
function geoDistance(lat1, lng1, lat2, lng2) {
  var R = 3958.8;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

var _findHubsUserCenter = null;

// ── HUB PARENT ──
function getHubParent() {
  var mh = document.getElementById('menu-home');
  if (mh && mh.style.display !== 'none') return mh;
  return document.body;
}
window.getHubParent = getHubParent;

// ── ITINERARY GLOBAL ──
function openItinerary() {
  var app = document.getElementById('app');
  if (app && app.style.display !== 'none') {
    if (typeof openItineraryBuilder === 'function') {
      var saved = [];
      try { saved = JSON.parse(localStorage.getItem('dtslo_itineraries') || '[]'); } catch(e) {}
      if (saved.length) {
        openItineraryBuilder(saved[0], false);
      } else {
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
  if (typeof openPlanIt === 'function') openPlanIt();
}
window.openItinerary = openItinerary;

function hexToRgb(hex) {
  if (!hex) return null;
  var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? parseInt(r[1],16)+','+parseInt(r[2],16)+','+parseInt(r[3],16) : null;
}
