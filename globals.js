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

// ── HUB SPOT DEFINITIONS ──
// Single source of truth for all hub spot locations on the map.
// Add new hubs here and they automatically appear in map settings + glow layers.
var HUB_SPOT_DEFS = [
  { id: 'nature', label: 'Nature', icon: '🌿', color: '#22c55e', coords: [[-120.6785, 35.292], [-120.6698, 35.2756], [-120.876, 35.2645], [-120.642, 35.295], [-120.695, 35.276], [-120.705, 35.26], [-120.72, 35.27], [-120.65, 35.258], [-120.845, 35.364], [-120.729, 35.189]] },
  { id: 'thrill', label: 'Thrill', icon: '⚡', color: '#ef4444', coords: [[-120.6, 35.4], [-120.56, 35.18], [-120.623, 35.142], [-120.895, 35.443], [-120.62, 35.09], [-120.732, 35.18], [-120.705, 35.17], [-120.45, 34.83], [-120.63, 35.32]] },
  { id: 'events', label: 'Events', icon: '🎭', color: '#ffd700', coords: [[-120.6648, 35.2813], [-120.6642, 35.2797], [-120.6659, 35.2815], [-120.665, 35.28], [-120.66, 35.28], [-120.682, 35.264], [-120.6587, 35.2994], [-120.652, 35.275], [-120.6642, 35.2797], [-120.663, 35.279]] },
  { id: 'city', label: 'City', icon: '🏛', color: '#00f5ff', coords: [[-120.6642, 35.2797], [-120.6648, 35.2806], [-120.663, 35.2797], [-120.6648, 35.2813], [-120.665, 35.28], [-120.6655, 35.281], [-120.682, 35.264], [-120.662, 35.2785], [-120.6635, 35.2793], [-120.663, 35.2793]] },
  { id: 'brewery', label: 'Craft Beer', icon: '🍺', color: '#f59e0b', coords: [[-120.658, 35.282], [-120.64, 35.2367], [-120.66, 35.279], [-120.663, 35.265], [-120.656, 35.283], [-120.664, 35.28], [-120.659, 35.281], [-120.6645, 35.2795], [-120.692, 35.62]] },
  { id: 'wine', label: 'Wine', icon: '🍷', color: '#9b2335', coords: [[-120.6908, 35.6244], [-120.595, 35.22], [-120.664, 35.28]] },
  { id: 'beach', label: 'Beach', icon: '🏖', color: '#06b6d4', coords: [[-120.7319, 35.1797], [-120.6413, 35.1427], [-120.66, 35.1552], [-120.85, 35.3658], [-120.8939, 35.4426], [-121.1025, 35.5641], [-120.6214, 35.1052], [-120.8894, 35.2659]] },
  { id: 'restaurant', label: 'Restaurants', icon: '🍽', color: '#f97316', coords: [[-120.666, 35.2815], [-120.6663, 35.2818], [-120.663, 35.28], [-120.6642, 35.2797], [-120.6635, 35.2786], [-120.6638, 35.2792], [-120.6663, 35.2818], [-120.6661, 35.2816], [-120.6599, 35.2746], [-120.664, 35.2791], [-120.6638, 35.2797], [-120.6637, 35.2792], [-120.6662, 35.2817], [-120.6663, 35.2817], [-120.6637, 35.2792], [-120.6655, 35.2808], [-120.665, 35.28], [-120.6654, 35.28], [-120.6622, 35.281], [-120.6648, 35.2801], [-120.6632, 35.28], [-120.6622, 35.278]] },
];
window.HUB_SPOT_DEFS = HUB_SPOT_DEFS;

// ── HUB SPOT GLOW LAYERS ──
// Driven by HUB_SPOT_DEFS — adding a hub there automatically adds a glow layer.

var _hubGlowState = {}; // hub_id -> true/false (on/off)
var _hubGlowIntervals = {}; // hub_id -> interval

// Load saved state
(function() {
  try {
    var saved = JSON.parse(localStorage.getItem('dtslo_hub_glow_state') || '{}');
    _hubGlowState = saved;
  } catch(e) {}
})();

function initHubGlowLayers() {
  if (!homeMap) return;
  HUB_SPOT_DEFS.forEach(function(hub) {
    var isOn = _hubGlowState[hub.id] !== false; // default on
    addHubGlowLayer(hub, isOn);
  });
}
window.initHubGlowLayers = initHubGlowLayers;

function addHubGlowLayer(hub, visible) {
  if (!homeMap || !hub.coords || !hub.coords.length) return;

  var srcId  = 'hgl-src-'  + hub.id;
  var ringId = 'hgl-ring-' + hub.id;
  var dotId  = 'hgl-dot-'  + hub.id;

  try {
    if (homeMap.getSource(srcId)) return; // already added

    homeMap.addSource(srcId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: hub.coords.map(function(c) {
          return { type: 'Feature', geometry: { type: 'Point', coordinates: c }, properties: {} };
        })
      }
    });

    var vis = visible ? 'visible' : 'none';

    homeMap.addLayer({ id: ringId, type: 'circle', source: srcId, layout: { visibility: vis }, paint: {
      'circle-radius': 20,
      'circle-color': hub.color,
      'circle-opacity': 0.12,
      'circle-blur': 0.8,
    }});

    homeMap.addLayer({ id: dotId, type: 'circle', source: srcId, layout: { visibility: vis }, paint: {
      'circle-radius': 6,
      'circle-color': hub.color,
      'circle-opacity': 0.9,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': 'rgba(255,255,255,0.35)',
    }});

    // Animate this hub's ring
    var r = 14, growing = true;
    var offset = Math.random() * Math.PI * 2; // stagger phases so they don't all pulse together
    var t = offset * 1000;
    _hubGlowIntervals[hub.id] = setInterval(function() {
      if (!homeMap || !homeMap.getLayer(ringId)) {
        clearInterval(_hubGlowIntervals[hub.id]);
        return;
      }
      t += 50;
      var phase = (Math.sin((t / 3000) * Math.PI * 2) + 1) / 2;
      var radius = 14 + phase * 16;
      var opacity = 0.06 + phase * 0.12;
      try {
        homeMap.setPaintProperty(ringId, 'circle-radius', radius);
        homeMap.setPaintProperty(ringId, 'circle-opacity', opacity);
      } catch(e) {}
    }, 60);

  } catch(e) { console.warn('[hubGlow]', hub.id, e); }
}

function setHubGlowVisible(hubId, visible) {
  if (!homeMap) return;
  var ringId = 'hgl-ring-' + hubId;
  var dotId  = 'hgl-dot-'  + hubId;
  var vis = visible ? 'visible' : 'none';
  try {
    if (homeMap.getLayer(ringId)) homeMap.setLayoutProperty(ringId, 'visibility', vis);
    if (homeMap.getLayer(dotId))  homeMap.setLayoutProperty(dotId,  'visibility', vis);
  } catch(e) {}
  _hubGlowState[hubId] = visible;
  try { localStorage.setItem('dtslo_hub_glow_state', JSON.stringify(_hubGlowState)); } catch(e) {}
}
window.setHubGlowVisible = setHubGlowVisible;
