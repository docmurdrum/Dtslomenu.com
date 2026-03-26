// ══════════════════════════════════════════════
// GLOBALS.JS — Single source of truth
// All shared state declared here, loaded first
// Never redeclare these in other files
// ══════════════════════════════════════════════

var BUILD_VERSION = '5.9.1';
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

// Proximity sort — sorts spots array nearest to [lat,lng] first
function sortByProximity(spots, lat, lng) {
  if (!lat || !lng) return spots;
  return spots.slice().sort(function(a, b) {
    if (!a.coords || !b.coords) return 0;
    var da = geoDistance(lat, lng, a.coords[1], a.coords[0]);
    var db = geoDistance(lat, lng, b.coords[1], b.coords[0]);
    return da - db;
  });
}
window.sortByProximity = sortByProximity;

var _findHubsUserCenter = null;

// ── HUB PARENT ──
function getHubParent() {
  var mh = document.getElementById('menu-home');
  if (mh && mh.style.display !== 'none') return mh;
  return document.body;
}
window.getHubParent = getHubParent;

// ── HUB SPOT PICKER ──
// Shows a bottom sheet listing all spots in a hub.
// User taps a spot → map flies there → onSelect fires → hub opens.
// Falls back to opening hub directly if not on map screen.
//
// spots  = [{ id, name, emoji, coords:[lng,lat], meta }]
// color  = hex accent color for the hub
// onOpen = function() — opens the full hub sheet
// onSelect = function(spotId) — called after flying to a spot (optional, for sort)
function hubShowSpotPicker(spots, color, hubName, onOpen, onSelect) {
  // Remove any existing picker
  var existing = document.getElementById('hub-spot-picker');
  if (existing) existing.remove();

  var mh = document.getElementById('menu-home');
  var onMap = mh && mh.style.display !== 'none';

  // Not on map — open hub directly
  if (!onMap) {
    if (typeof onOpen === 'function') onOpen();
    return;
  }

  // Fly map to show all spots
  if (homeMap && spots.length) {
    try {
      var lngs = spots.filter(function(s){return s.coords;}).map(function(s){return s.coords[0];});
      var lats = spots.filter(function(s){return s.coords;}).map(function(s){return s.coords[1];});
      if (lngs.length) {
        var centerLng = (Math.min.apply(null,lngs) + Math.max.apply(null,lngs)) / 2;
        var centerLat = (Math.min.apply(null,lats) + Math.max.apply(null,lats)) / 2;
        homeMap.flyTo({ center: [centerLng, centerLat], zoom: 12.5, duration: 700 });
      }
    } catch(e) {}
  }

  // Build the picker sheet
  var sheet = document.createElement('div');
  sheet.id = 'hub-spot-picker';
  sheet.style.cssText = [
    'position:fixed;bottom:0;left:0;right:0;z-index:10001;',
    'background:rgba(8,8,20,0.97);',
    'border-radius:20px 20px 0 0;',
    'border-top:2px solid ' + color + '55;',
    'padding:0 0 32px;',
    'max-height:55vh;',
    'display:flex;flex-direction:column;',
    'transform:translateY(100%);',
    'transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1);',
    'backdrop-filter:blur(16px);',
  ].join('');

  // Header
  var header = document.createElement('div');
  header.style.cssText = 'padding:10px 16px 0;flex-shrink:0';
  header.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 12px"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
      '<div style="font-size:15px;font-weight:800">' + hubName + '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button id="hsp-open-all" style="padding:6px 12px;border-radius:20px;border:none;background:' + color + ';color:#000;font-size:11px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif">See All →</button>' +
        '<button id="hsp-close" style="width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:14px;cursor:pointer">✕</button>' +
      '</div>' +
    '</div>';
  sheet.appendChild(header);

  // Spot list
  var list = document.createElement('div');
  list.style.cssText = 'overflow-y:auto;padding:0 16px 8px;flex:1';

  spots.forEach(function(sp) {
    if (!sp.coords) return;
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;-webkit-tap-highlight-color:transparent';

    row.innerHTML =
      '<div style="width:38px;height:38px;border-radius:10px;background:' + color + '22;border:1.5px solid ' + color + '55;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">' + (sp.emoji || '📍') + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + sp.name + '</div>' +
        (sp.meta ? '<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:1px">' + sp.meta + '</div>' : '') +
      '</div>' +
      '<div style="font-size:12px;color:' + color + ';font-weight:700;flex-shrink:0">→</div>';

    row.addEventListener('click', function() {
      // Fly to this spot
      try {
        homeMap.flyTo({
          center: sp.coords,
          zoom: 15.5,
          pitch: 55,
          bearing: (Math.random() * 40) - 20,
          duration: 800,
          essential: true
        });
      } catch(e) {}
      // Store for proximity sort
      window._findHubsUserCenter = [sp.coords[1], sp.coords[0]];
      // Close picker and open hub after fly
      sheet.style.transform = 'translateY(100%)';
      setTimeout(function() {
        sheet.remove();
        if (typeof onSelect === 'function') onSelect(sp.id || sp.name);
        if (typeof onOpen === 'function') onOpen();
      }, 500);
    });

    list.appendChild(row);
  });

  sheet.appendChild(list);
  document.body.appendChild(sheet);

  // Wire buttons
  document.getElementById('hsp-open-all').addEventListener('click', function() {
    sheet.remove();
    if (typeof onOpen === 'function') onOpen();
  });
  document.getElementById('hsp-close').addEventListener('click', function() {
    sheet.style.transform = 'translateY(100%)';
    setTimeout(function() { sheet.remove(); }, 350);
  });

  // Animate in
  setTimeout(function() { sheet.style.transform = 'translateY(0)'; }, 30);
}
window.hubShowSpotPicker = hubShowSpotPicker;

// Cleanup — remove picker if open
function hubClosePicker() {
  var p = document.getElementById('hub-spot-picker');
  if (p) { p.style.transform = 'translateY(100%)'; setTimeout(function(){ p.remove(); }, 350); }
}
window.hubClosePicker = hubClosePicker;

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
