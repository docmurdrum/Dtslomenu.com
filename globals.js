// ══════════════════════════════════════════════
// GLOBALS.JS — Single source of truth
// All shared state declared here, loaded first
// Never redeclare these in other files
// ══════════════════════════════════════════════

var BUILD_VERSION = '6.3.17';
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
    var isOn = _hubGlowState[hub.id] === true; // default OFF — user turns on via dev drawer
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
    }, 500);

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


// ══════════════════════════════════════════════
// DEV ERROR OVERLAY
// Only active when localStorage has dtslo_dev_mode=1
// OR when logged in as devtest@dtslomenu.com
// Catches: JS errors, unhandled promise rejections,
//          console.warn, console.error, try/catch swallows
// ══════════════════════════════════════════════

(function() {
  var _errors = [];
  var _overlay = null;
  var _badge = null;
  var _isDevMode = false;

  function checkDevMode() {
    _isDevMode = localStorage.getItem('dtslo_dev_mode') === '1' ||
                 localStorage.getItem('dtslo_dev_errors') === '1';
  }

  function getOverlay() {
    if (_overlay && document.getElementById('dtslo-err-overlay')) return _overlay;

    var o = document.createElement('div');
    o.id = 'dtslo-err-overlay';
    o.style.cssText = [
      'position:fixed;bottom:80px;left:0;right:0;z-index:99999;',
      'max-height:55vh;overflow-y:auto;',
      'background:rgba(6,0,0,0.97);',
      'border-top:2px solid #ef4444;',
      'font-family:monospace;font-size:11px;color:#f87171;',
      'display:none;padding:8px 12px 12px;',
      'backdrop-filter:blur(8px);'
    ].join('');

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(239,68,68,0.3);';
    header.innerHTML = '<span style="font-size:12px;font-weight:900;color:#ef4444;letter-spacing:1px">DEV ERROR LOG</span>' +
      '<div style="display:flex;gap:8px">' +
        '<button onclick="dtsloDebugEmblem()" style="background:rgba(180,79,255,0.15);border:1px solid rgba(180,79,255,0.3);color:#b44fff;padding:3px 10px;border-radius:6px;font-size:10px;font-family:monospace;cursor:pointer">🔍 Emblem</button>' +
        '<button onclick="dtsloErrClear()" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#f87171;padding:3px 10px;border-radius:6px;font-size:10px;font-family:monospace;cursor:pointer">Clear</button>' +
        '<button onclick="dtsloErrClose()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);padding:3px 10px;border-radius:6px;font-size:10px;font-family:monospace;cursor:pointer">Hide</button>' +
      '</div>';
    o.appendChild(header);

    var list = document.createElement('div');
    list.id = 'dtslo-err-list';
    o.appendChild(list);

    document.body.appendChild(o);
    _overlay = o;
    return o;
  }

  function getBadge() {
    if (_badge && document.getElementById('dtslo-err-badge')) return _badge;
    var b = document.createElement('button');
    b.id = 'dtslo-err-badge';
    b.onclick = function() { dtsloErrShow(); };
    b.style.cssText = [
      'position:fixed;bottom:88px;right:12px;z-index:100000;',
      'background:#ef4444;color:#fff;',
      'border:none;border-radius:20px;',
      'padding:5px 10px;font-size:11px;font-weight:900;',
      'font-family:monospace;cursor:pointer;',
      'display:none;box-shadow:0 2px 12px rgba(239,68,68,0.6);',
      'letter-spacing:0.5px;'
    ].join('');
    document.body.appendChild(b);
    _badge = b;
    return b;
  }

  function addError(type, msg, source) {
    checkDevMode();
    if (!_isDevMode) return;

    var entry = {
      type: type,
      msg: String(msg).substring(0, 300),
      source: source || '',
      time: new Date().toLocaleTimeString()
    };
    _errors.push(entry);

    // Ensure DOM is ready
    if (!document.body) {
      setTimeout(function() { addError(type, msg, source); }, 500);
      return;
    }

    var o = getOverlay();
    var list = document.getElementById('dtslo-err-list');
    if (!list) return;

    var row = document.createElement('div');
    row.style.cssText = 'padding:5px 0;border-bottom:1px solid rgba(239,68,68,0.1);line-height:1.5;';
    var color = type === 'error' ? '#f87171' : type === 'warn' ? '#fbbf24' : '#a78bfa';
    var icon  = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '🔵';
    row.innerHTML =
      '<span style="color:rgba(255,255,255,0.3);font-size:10px">' + entry.time + '</span> ' +
      '<span style="color:' + color + ';font-weight:900">' + icon + ' ' + type.toUpperCase() + '</span> ' +
      '<span style="color:#fca5a5">' + escHtml(entry.msg) + '</span>' +
      (entry.source ? '<div style="color:rgba(255,255,255,0.25);font-size:10px;margin-top:2px">at ' + escHtml(entry.source) + '</div>' : '');
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;

    // Show badge with count
    var badge = getBadge();
    var errCount = _errors.filter(function(e) { return e.type === 'error'; }).length;
    var warnCount = _errors.filter(function(e) { return e.type === 'warn'; }).length;
    badge.textContent = errCount + ' err' + (warnCount ? ' · ' + warnCount + ' warn' : '');
    badge.style.display = 'block';
    badge.style.background = errCount > 0 ? '#ef4444' : '#f59e0b';

    // Auto-show overlay on first error
    if (_errors.length === 1 && type === 'error') {
      o.style.display = 'block';
    }
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── PUBLIC API ──
  window.dtsloErrShow = function() {
    var o = getOverlay();
    if (o) o.style.display = 'block';
  };
  window.dtsloErrClose = function() {
    var o = document.getElementById('dtslo-err-overlay');
    if (o) o.style.display = 'none';
  };
  window.dtsloErrClear = function() {
    _errors = [];
    var list = document.getElementById('dtslo-err-list');
    if (list) list.innerHTML = '';
    var badge = document.getElementById('dtslo-err-badge');
    if (badge) badge.style.display = 'none';
    var o = document.getElementById('dtslo-err-overlay');
    if (o) o.style.display = 'none';
  };
  // Call this after dev login to activate
  window.dtsloErrEnable = function() {
    localStorage.setItem('dtslo_dev_mode', '1');
    _isDevMode = true;
    addError('info', 'Dev error overlay active — all errors will appear here', '');
  };

  // ── INTERCEPT window.onerror ──
  var _origOnerror = window.onerror;
  window.onerror = function(msg, src, line, col, err) {
    addError('error',
      msg + (err && err.stack ? '\n' + err.stack.split('\n').slice(0,3).join('\n') : ''),
      (src ? src.split('/').pop() : '') + (line ? ':' + line : '')
    );
    if (_origOnerror) return _origOnerror.apply(this, arguments);
    return false;
  };

  // ── INTERCEPT unhandled promise rejections ──
  window.addEventListener('unhandledrejection', function(e) {
    var msg = e.reason && e.reason.message ? e.reason.message : String(e.reason);
    addError('error', 'Unhandled Promise rejection: ' + msg, '');
  });

  // ── INTERCEPT console.error and console.warn ──
  var _origErr  = console.error;
  var _origWarn = console.warn;

  console.error = function() {
    var msg = Array.prototype.slice.call(arguments).map(String).join(' ');
    addError('error', msg, '');
    _origErr.apply(console, arguments);
  };

  console.warn = function() {
    var msg = Array.prototype.slice.call(arguments).map(String).join(' ');
    // Filter noisy expected warns
    var noisy = ['[Map error]','[hubGlow]','[SW]','MapLibre','maplibre','schema cache','Failed to fetch','[SmartStart]','[stamps]'];
    if (noisy.some(function(n){ return msg.indexOf(n) !== -1; })) {
      _origWarn.apply(console, arguments);
      return;
    }
    addError('warn', msg, '');
    _origWarn.apply(console, arguments);
  };

  // Init check
  checkDevMode();
})();

// ── EMBLEM DEBUG ──
// Tap "🔍 Emblem" in the dev error log to dump computed styles of all emblems
window.dtsloDebugEmblem = function() {
  var emblems = document.querySelectorAll('.bar-emblem-float');
  if (!emblems.length) { console.warn('[emblem] No .bar-emblem-float elements found in DOM'); return; }

  emblems.forEach(function(el, i) {
    var cs  = window.getComputedStyle(el);
    var disc = el.querySelector('.bar-emblem-disc');
    var dcs  = disc ? window.getComputedStyle(disc) : null;
    var parent = el.parentElement;
    var pcs  = parent ? window.getComputedStyle(parent) : null;

    var msg = 'EMBLEM[' + i + '] float: ' +
      'display=' + cs.display +
      ' vis=' + cs.visibility +
      ' op=' + cs.opacity +
      ' z=' + cs.zIndex +
      ' top=' + cs.top +
      ' left=' + cs.left +
      ' transform=' + cs.transform +
      ' overflow=' + cs.overflow;

    if (dcs) msg += ' | DISC: display=' + dcs.display + ' op=' + dcs.opacity + ' overflow=' + dcs.overflow;
    if (pcs) msg += ' | PARENT(' + (parent.className || parent.id) + '): overflow=' + pcs.overflow + ' transform=' + pcs.transform + ' z=' + pcs.zIndex;

    // Check grandparent (bar-card-v2)
    var gp = parent && parent.parentElement;
    if (gp) {
      var gcs = window.getComputedStyle(gp);
      msg += ' | CARD: overflow=' + gcs.overflow + ' transform=' + gcs.transform + ' anim=' + gcs.animationName;
    }

    console.warn(msg);
  });
  console.warn('[emblem] Dumped ' + emblems.length + ' emblem(s) — check above');
};

// ══════════════════════════════════════════════
// PWA INSTALL PROMPT
// ══════════════════════════════════════════════
var _pwaPrompt = null;
var _pwaIsIOS  = /iphone|ipad|ipod/i.test(navigator.userAgent);
var _pwaIsStandalone = window.navigator.standalone === true ||
  window.matchMedia('(display-mode: standalone)').matches;

// Capture the install prompt event (Android/Chrome)
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _pwaPrompt = e;
});

function pwaShowBanner() {
  // Don't show if already installed, already dismissed, or shown recently
  if (_pwaIsStandalone) return;
  try {
    if (localStorage.getItem('pwa_dismissed')) return;
  } catch(e) {}

  var banner = document.getElementById('pwa-banner');
  if (!banner) return;

  if (_pwaIsIOS) {
    // iOS: show manual instructions
    var iosInstr = document.getElementById('pwa-ios-instructions');
    var installBtn = document.getElementById('pwa-install-btn');
    if (iosInstr) iosInstr.style.display = 'block';
    if (installBtn) installBtn.style.display = 'none';
  } else if (!_pwaPrompt) {
    // No prompt available (already installed or not supported)
    return;
  }

  banner.style.display = 'block';
}
window.pwaShowBanner = pwaShowBanner;

function pwaInstall() {
  if (_pwaPrompt) {
    _pwaPrompt.prompt();
    _pwaPrompt.userChoice.then(function(result) {
      if (result.outcome === 'accepted') {
        pwaDismiss();
      }
      _pwaPrompt = null;
    });
  }
}
window.pwaInstall = pwaInstall;

function pwaDismiss() {
  var banner = document.getElementById('pwa-banner');
  if (banner) banner.style.display = 'none';
  try { localStorage.setItem('pwa_dismissed', '1'); } catch(e) {}
}
window.pwaDismiss = pwaDismiss;

// ── CLEAR CACHE & RELOAD ──
async function clearCacheAndReload() {
  if (!confirm('This will clear the app cache and reload. Use this if something looks broken. Continue?')) return;
  try {
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      var regs = await navigator.serviceWorker.getRegistrations();
      for (var r of regs) await r.unregister();
    }
    // Clear all caches
    if ('caches' in window) {
      var keys = await caches.keys();
      for (var k of keys) await caches.delete(k);
    }
    // Clear localStorage keys that might cause stale state
    var keepKeys = ['gps_bypass','dtslo_onboarding_done','pwa_dismissed'];
    var allKeys = Object.keys(localStorage);
    allKeys.forEach(function(k) {
      if (!keepKeys.includes(k)) localStorage.removeItem(k);
    });
  } catch(e) {}
  // Hard reload
  window.location.href = window.location.href.split('?')[0] + '?cache_bust=' + Date.now();
}
window.clearCacheAndReload = clearCacheAndReload;

// ══════════════════════════════════════════════
// GUEST PROMPT — shown when guest tries to do
// something that requires an account
// ══════════════════════════════════════════════
function showGuestPrompt(context) {
  var existing = document.getElementById('guest-prompt-overlay');
  if (existing) existing.remove();

  var messages = {
    report:   { icon: '📡', title: 'Report to earn XP', body: 'Sign up free to report bar status, earn 10 XP per report, and help everyone have a better night.' },
    checkin:  { icon: '📍', title: 'Check in to leave your mark', body: 'Sign up free to check in, earn 20 XP, and let your friends see where you are.' },
    missions: { icon: '🎯', title: 'Missions = real rewards', body: 'Sign up to unlock missions at downtown bars. Earn XP and win free drinks.' },
    games:    { icon: '🎮', title: 'Play with your crew', body: 'Sign up to play bar trivia, duels, bingo, and more. Climb the weekly leaderboard.' },
    friends:  { icon: '👥', title: 'Bring your crew', body: 'Sign up to add friends, see where they are tonight, and DM them directly.' },
    profile:  { icon: '🏆', title: 'Build your profile', body: 'Sign up to earn XP, unlock badges, level up your character, and hit the leaderboard.' },
    default:  { icon: '🌃', title: 'Join DTSLO', body: 'Sign up free to get the full experience — reports, check-ins, missions, games, and your crew all in one place.' },
  };

  var m = messages[context] || messages.default;

  var overlay = document.createElement('div');
  overlay.id = 'guest-prompt-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center';

  overlay.innerHTML =
    '<div id="guest-prompt-sheet" style="width:100%;max-width:480px;background:#0e0e1a;border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:20px 20px 40px;transform:translateY(30px);transition:transform 0.3s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin:0 auto 20px"></div>' +
      '<div style="font-size:36px;text-align:center;margin-bottom:12px">' + m.icon + '</div>' +
      '<div style="font-size:20px;font-weight:900;text-align:center;margin-bottom:8px;letter-spacing:-0.3px">' + m.title + '</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.5);text-align:center;line-height:1.6;margin-bottom:24px">' + m.body + '</div>' +
      '<button onclick="guestGoSignup()" style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:16px;font-weight:900;font-family:inherit;cursor:pointer;margin-bottom:10px">Create Free Account →</button>' +
      '<button onclick="guestGoLogin()" style="width:100%;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:14px;font-weight:700;font-family:inherit;cursor:pointer">Already have an account? Sign In</button>' +
    '</div>';

  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeGuestPrompt(); });
  setTimeout(function() {
    var sheet = document.getElementById('guest-prompt-sheet');
    if (sheet) sheet.style.transform = 'translateY(0)';
  }, 10);
}
window.showGuestPrompt = showGuestPrompt;

function closeGuestPrompt() {
  var overlay = document.getElementById('guest-prompt-overlay');
  if (!overlay) return;
  var sheet = document.getElementById('guest-prompt-sheet');
  if (sheet) sheet.style.transform = 'translateY(30px)';
  setTimeout(function() { overlay.remove(); }, 300);
}
window.closeGuestPrompt = closeGuestPrompt;

function guestGoSignup() {
  closeGuestPrompt();
  var authEl = document.getElementById('auth-screen');
  var appEl  = document.getElementById('app');
  if (appEl)  appEl.style.display  = 'none';
  if (authEl) {
    authEl.style.display  = 'flex';
    authEl.style.zIndex   = '9999';
    authEl.style.position = 'fixed';
    authEl.style.inset    = '0';
  }
  if (typeof switchAuthTab === 'function') switchAuthTab('signup');
  window._pendingDTSLOEntry = true;
}
window.guestGoSignup = guestGoSignup;

function guestGoLogin() {
  closeGuestPrompt();
  var authEl = document.getElementById('auth-screen');
  var appEl  = document.getElementById('app');
  if (appEl)  appEl.style.display  = 'none';
  if (authEl) {
    authEl.style.display  = 'flex';
    authEl.style.zIndex   = '9999';
    authEl.style.position = 'fixed';
    authEl.style.inset    = '0';
  }
  if (typeof switchAuthTab === 'function') switchAuthTab('login');
  window._pendingDTSLOEntry = true;
}
window.guestGoLogin = guestGoLogin;

// ══════════════════════════════════════════════
// BETA WELCOME POPUP
// Shows every visit until user signs up
// ══════════════════════════════════════════════
function showBetaWelcome() {
  if (currentUser) return;
  if (document.getElementById('beta-welcome-overlay')) return;

  var overlay = document.createElement('div');
  overlay.id = 'beta-welcome-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px';

  overlay.innerHTML =
    '<div style="width:100%;max-width:400px;background:#0e0e1a;border-radius:24px;border:1px solid rgba(255,255,255,0.08);padding:28px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.6);max-height:90vh;overflow-y:auto">' +
      '<div style="display:flex;justify-content:center;margin-bottom:16px">' +
        '<div style="background:linear-gradient(135deg,rgba(255,45,120,0.15),rgba(180,79,255,0.15));border:1px solid rgba(180,79,255,0.3);border-radius:20px;padding:5px 14px;font-size:11px;font-weight:800;color:#b44fff;letter-spacing:1px;text-transform:uppercase">Beta</div>' +
      '</div>' +
      '<div style="font-size:26px;font-weight:900;text-align:center;margin-bottom:12px;letter-spacing:-0.5px">Uhh.... hullo? 👋</div>' +
      '<div style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.75;margin-bottom:22px;text-align:center">' +
        'Hey, you found us before we\'re cool 😅' +
        '<br><br>' +
        'We\'re in beta and would love to have you join! After sign up this pop up will no longer appear.' +
        '<br><br>' +
        'Your numbers matter — the more users we have, the easier it is to get downtown bars and businesses on board with real rewards. You\'ll never pay to use this, it\'s built for you.' +
        '<br><br>' +
        '<strong style="color:white">Oh, and early beta users get an exclusive BETA badge.</strong> 🏅' +
      '</div>' +
      '<button onclick="betaGoSignup()" style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;margin-bottom:10px">Create Free Account →</button>' +
      '<button onclick="betaTour()" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:8px">Show me around first 👀</button>' +
      '<div style="display:flex;gap:8px;margin-top:4px">' +
        '<button onclick="betaBrowse()" style="flex:1;padding:10px;border-radius:12px;border:none;background:transparent;color:rgba(255,255,255,0.3);font-size:12px;font-weight:600;font-family:inherit;cursor:pointer">Just browsing</button>' +
        '<button onclick="betaGoLogin()" style="flex:1;padding:10px;border-radius:12px;border:none;background:transparent;color:rgba(255,255,255,0.3);font-size:12px;font-weight:600;font-family:inherit;cursor:pointer">Sign In</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
}
window.showBetaWelcome = showBetaWelcome;

function closeBetaWelcome() {
  var el = document.getElementById('beta-welcome-overlay');
  if (el) el.remove();
}

function betaGoSignup() {
  closeBetaWelcome();
  var authEl = document.getElementById('auth-screen');
  var appEl  = document.getElementById('app');
  if (appEl)  appEl.style.display  = 'none';
  if (authEl) { authEl.style.display = 'flex'; authEl.style.zIndex = '9999'; authEl.style.position = 'fixed'; authEl.style.inset = '0'; }
  if (typeof switchAuthTab === 'function') switchAuthTab('signup');
  window._pendingDTSLOEntry = true;
}
window.betaGoSignup = betaGoSignup;

function betaGoLogin() {
  closeBetaWelcome();
  var authEl = document.getElementById('auth-screen');
  var appEl  = document.getElementById('app');
  if (appEl)  appEl.style.display  = 'none';
  if (authEl) { authEl.style.display = 'flex'; authEl.style.zIndex = '9999'; authEl.style.position = 'fixed'; authEl.style.inset = '0'; }
  if (typeof switchAuthTab === 'function') switchAuthTab('login');
  window._pendingDTSLOEntry = true;
}
window.betaGoLogin = betaGoLogin;

function betaBrowse() {
  closeBetaWelcome();
}
window.betaBrowse = betaBrowse;

function betaTour() {
  closeBetaWelcome();
  runLinesTour();
}
window.betaTour = betaTour;

// ── LINES MINI TOUR ──
var LINES_TOUR_STEPS = [
  {
    target: '#nav-line',
    title: 'This is the Lines page 🍺',
    body: 'Every bar on Higuera Street, live. See who\'s packed, who\'s dead, and where the night is actually happening.',
    position: 'above',
  },
  {
    target: null,
    targetSelector: '.bar-card-v2',
    title: 'Tap any bar to open it 📍',
    body: 'See crowd levels, recent reports, and check-in counts. Sign up to check in and earn XP.',
    position: 'below',
  },
  {
    target: null,
    targetSelector: '.vote-btn',
    title: 'Report the vibe 📡',
    body: 'Is it packed? Dead? Tap to report and help everyone have a better night. Signing up earns you 10 XP per report.',
    position: 'above',
  },
];

var _linesTourStep = 0;

function runLinesTour() {
  _linesTourStep = 0;
  _showLinesTourStep();
}

function _cleanTourElements() {
  var o = document.getElementById('lines-tour-overlay');
  var b = document.getElementById('lines-tour-bubble');
  if (o) o.remove();
  if (b) b.remove();
}

function _showLinesTourStep() {
  _cleanTourElements();

  if (_linesTourStep >= LINES_TOUR_STEPS.length) {
    setTimeout(function() { showBetaWelcome(); }, 400);
    return;
  }

  var step = LINES_TOUR_STEPS[_linesTourStep];
  var targetEl = step.target
    ? document.querySelector(step.target)
    : step.targetSelector ? document.querySelector(step.targetSelector) : null;

  // Overlay + spotlight
  var overlay = document.createElement('div');
  overlay.id = 'lines-tour-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9550;pointer-events:none';

  var spotlight = document.createElement('div');
  spotlight.style.cssText = 'position:absolute;border-radius:14px;box-shadow:0 0 0 9999px rgba(0,0,10,0.82);pointer-events:none';
  if (targetEl) {
    var r = targetEl.getBoundingClientRect();
    var pad = 8;
    spotlight.style.left   = (r.left - pad) + 'px';
    spotlight.style.top    = (r.top - pad) + 'px';
    spotlight.style.width  = (r.width + pad * 2) + 'px';
    spotlight.style.height = (r.height + pad * 2) + 'px';
  } else {
    spotlight.style.cssText += ';width:0;height:0;left:50%;top:50%';
  }
  overlay.appendChild(spotlight);
  document.body.appendChild(overlay);

  // Bubble — separate element with stable ID
  var bubble = document.createElement('div');
  bubble.id = 'lines-tour-bubble';
  bubble.style.cssText = 'position:fixed;z-index:9560;left:16px;right:16px;max-width:340px;margin:0 auto;background:#0e0e1a;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:20px;box-shadow:0 8px 40px rgba(0,0,0,0.6)';

  if (targetEl) {
    var r2 = targetEl.getBoundingClientRect();
    if (step.position === 'above') {
      bubble.style.bottom = (window.innerHeight - r2.top + 16) + 'px';
    } else {
      bubble.style.top = (r2.bottom + 16) + 'px';
    }
  } else {
    bubble.style.top = '50%';
    bubble.style.transform = 'translateY(-50%)';
  }

  var isLast = _linesTourStep === LINES_TOUR_STEPS.length - 1;

  bubble.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '<div style="display:flex;gap:4px">' +
        LINES_TOUR_STEPS.map(function(s, i) {
          return '<div style="width:' + (i === _linesTourStep ? '18px' : '6px') + ';height:6px;border-radius:3px;background:' + (i <= _linesTourStep ? '#ff2d78' : 'rgba(255,255,255,0.15)') + '"></div>';
        }).join('') +
      '</div>' +
      '<button onclick="skipLinesTour()" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;padding:0">Skip</button>' +
    '</div>' +
    '<div style="font-size:17px;font-weight:900;margin-bottom:8px">' + step.title + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;margin-bottom:16px">' + step.body + '</div>' +
    '<button onclick="nextLinesTourStep()" style="width:100%;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">' +
      (isLast ? 'Got it 🎉' : 'Next →') +
    '</button>';

  document.body.appendChild(bubble);
}
window._showLinesTourStep = _showLinesTourStep;

function nextLinesTourStep() {
  _linesTourStep++;
  _showLinesTourStep();
}
window.nextLinesTourStep = nextLinesTourStep;

function skipLinesTour() {
  _cleanTourElements();
  setTimeout(function() { showBetaWelcome(); }, 400);
}
window.skipLinesTour = skipLinesTour;
