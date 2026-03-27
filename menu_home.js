// ══════════════════════════════════════════════
// MENU_HOME.JS — Hub Screen
// Depends on: globals.js, shared.js, auth.js
// homeMap, MAPTILER_KEY declared in globals.js
// ══════════════════════════════════════════════

// ── PUBLIC API ──
window.menuHomeInit        = init;
window.menuHomeEnterDTSLO  = enterDTSLO;
window.menuHomeRequireAuth = function() {
  if (typeof requireAuthForDTSLO === 'function') requireAuthForDTSLO();
  else if (typeof goToDTSLO === 'function') goToDTSLO();
};
window.menuHomeSkipToggle  = skipToggle;
window.menuHomePromptYes   = promptYes;
window.menuHomePromptNo    = promptNo;
window.menuHomeOpenDrawer  = openDrawer;
window.menuHomeCloseDrawer = closeDrawer;

function init() {
  try {
    var count = parseInt(localStorage.getItem('menu_open_count') || '0') + 1;
    localStorage.setItem('menu_open_count', count);
    if (localStorage.getItem('menu_skip_to_dtslo') === '1') {
      injectCSS(); injectHTML();
      var el = document.getElementById('menu-home');
      if (el) el.style.display = 'block';
      setTimeout(function() {
        if (typeof requireAuthForDTSLO === 'function') requireAuthForDTSLO();
        else revealApp();
      }, 200);
      return;
    }
    injectCSS(); injectHTML();
    var el = document.getElementById('menu-home');
    if (!el) { revealApp(); return; }
    el.style.display = 'block';
    loadHomeMap();
    if (count === 2) setTimeout(showSkipPrompt, 4000);
  } catch(e) {
    console.warn('[MenuHome] init error:', e);
    try { injectCSS(); injectHTML(); } catch(e2) {}
    var el = document.getElementById('menu-home');
    if (el) el.style.display = 'block';
  }
}

function enterDTSLO() {
  try { closeDrawer(); } catch(e) {}
  try { if (homeMap) { homeMap.remove(); homeMap = null; } } catch(e) {}
  if (typeof goToDTSLO === 'function') goToDTSLO();
  else revealApp();
}

function revealApp() {
  if (typeof goToDTSLO === 'function') { goToDTSLO(); return; }
  var hubEl = document.getElementById('menu-home');
  if (hubEl) { hubEl.style.display = 'none'; hubEl.style.pointerEvents = 'none'; }
  var authEl = document.getElementById('auth-screen');
  if (authEl) authEl.style.display = 'none';
  var app = document.getElementById('app');
  if (app) { app.style.display = 'block'; app.style.opacity = '1'; app.style.pointerEvents = 'auto'; }
  var activePage = document.querySelector('.page.active');
  if (!activePage) {
    var linePage = document.getElementById('line');
    if (linePage) linePage.classList.add('active');
  }
}

function skipToggle(on) { localStorage.setItem('menu_skip_to_dtslo', on ? '1' : '0'); }
function promptYes() { localStorage.setItem('menu_skip_to_dtslo', '1'); hidePrompt(); }
function promptNo()  { localStorage.setItem('menu_skip_to_dtslo', '0'); hidePrompt(); }

function showSkipPrompt() {
  var p = document.getElementById('mh-skip-prompt');
  if (p) { p.style.display = 'flex'; setTimeout(function() { p.style.opacity = '1'; }, 50); }
}
function hidePrompt() {
  var p = document.getElementById('mh-skip-prompt');
  if (p) { p.style.opacity = '0'; setTimeout(function() { p.style.display = 'none'; }, 350); }
}

function openDrawer(id) {
  if (id === 'travel') setTimeout(function() { try { menuHomeTravelLoadVenues(); } catch(e) {} }, 100);
  ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools'].forEach(function(d) {
    var el = document.getElementById(d); if (el) el.classList.remove('mh-drawer-open');
  });
  ['mh-tab-hubs','mh-tab-travel','mh-tab-tools'].forEach(function(t) {
    var el = document.getElementById(t); if (el) el.classList.remove('mh-tab-active');
  });
  if (activeDrawer === id) { activeDrawer = null; return; }
  activeDrawer = id;
  var drawer = document.getElementById('mh-drawer-' + id);
  var tab    = document.getElementById('mh-tab-' + id);
  if (drawer) drawer.classList.add('mh-drawer-open');
  if (tab)    tab.classList.add('mh-tab-active');
}

function closeDrawer() {
  ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools'].forEach(function(d) {
    var el = document.getElementById(d); if (el) el.classList.remove('mh-drawer-open');
  });
  ['mh-tab-hubs','mh-tab-travel','mh-tab-tools'].forEach(function(t) {
    var el = document.getElementById(t); if (el) el.classList.remove('mh-tab-active');
  });
  activeDrawer = null;
}
window.menuHomeCloseDrawer = closeDrawer;

function hubPreview(id) {
  var existing = document.getElementById('mh-hub-preview');
  if (existing) existing.remove();
  var sheet = document.createElement('div');
  sheet.id = 'mh-hub-preview';
  sheet.innerHTML = '<div id="mh-hub-preview-inner"><div class="mh-sheet-handle" id="mh-preview-handle"></div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:8px">Coming Soon</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:16px">This hub is in development.</div>' +
    '<button id="mh-preview-close-btn" style="width:100%;margin-top:8px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
    '</div>';
  document.getElementById('menu-home').appendChild(sheet);
  setTimeout(function() {
    sheet.classList.add('show');
    var closeSheet = function() { sheet.remove(); };
    var h = document.getElementById('mh-preview-handle');
    var b = document.getElementById('mh-preview-close-btn');
    if (h) h.addEventListener('click', closeSheet);
    if (b) b.addEventListener('click', closeSheet);
  }, 50);
}
window.menuHomeHubPreview = hubPreview;

function toggleSuggestionTag(el) { el.classList.toggle('mh-suggestion-tag-sel'); }
window.menuHomeToggleSuggestionTag = toggleSuggestionTag;

async function submitSuggestion(hubId) {
  var tags = [];
  document.querySelectorAll('.mh-suggestion-tag-sel').forEach(function(t) { tags.push(t.dataset.tag); });
  var textEl = document.getElementById('mh-suggestion-text');
  var textVal = textEl ? textEl.value.trim() : '';
  var submitBtn = document.getElementById('mh-suggestion-submit');
  var thanks = document.getElementById('mh-suggestion-thanks');
  if (!tags.length && !textVal) {
    if (textEl) { textEl.style.borderColor = 'rgba(255,45,120,0.5)'; setTimeout(function() { textEl.style.borderColor = 'rgba(255,255,255,0.1)'; }, 1500); }
    return;
  }
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
  try {
    if (window.supabaseClient) {
      await window.supabaseClient.from('hub_suggestions').insert([{
        hub_id: hubId, tags: tags, suggestion: textVal, created_at: new Date().toISOString()
      }]);
    }
    if (submitBtn) submitBtn.style.display = 'none';
    if (thanks) thanks.style.display = 'block';
    document.querySelectorAll('.mh-suggestion-tag-sel').forEach(function(t) { t.classList.remove('mh-suggestion-tag-sel'); });
    if (textEl) textEl.value = '';
  } catch(e) {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Feedback'; }
  }
}
window.menuHomeSubmitSuggestion = submitSuggestion;

function loadHomeMap() {
  // If MapLibre hasn't loaded yet from CDN, wait and retry
  if (!window.maplibregl) {
    var attempts = 0;
    var wait = setInterval(function() {
      attempts++;
      if (window.maplibregl) {
        clearInterval(wait);
        loadHomeMap();
      } else if (attempts > 20) {
        clearInterval(wait);
        // MapLibre failed to load — show a message instead of black screen
        var container = document.getElementById('mh-map');
        if (container) {
          container.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:#06060f';
          container.innerHTML = '<div style="font-size:32px">🗺</div>' +
            '<div style="color:rgba(255,255,255,0.7);font-size:14px;font-weight:700;font-family:Helvetica Neue,sans-serif">Map failed to load</div>' +
            '<div style="color:rgba(255,255,255,0.35);font-size:12px;font-family:Helvetica Neue,sans-serif;text-align:center;padding:0 32px">Check your connection and reload the page</div>' +
            '<button onclick="location.reload()" style="margin-top:8px;padding:12px 24px;background:#ff2d78;border:none;border-radius:20px;color:#fff;font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">Reload</button>';
        }
      }
    }, 200);
    return;
  }
  var container = document.getElementById('mh-map');
  if (!container) return;

  homeMap = new maplibregl.Map({
    container: 'mh-map',
    style: 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=' + MAPTILER_KEY,
    center: [-120.6650, 35.2803], zoom: 15, pitch: 62, bearing: -25,
    antialias: true, attributionControl: false,
    scrollZoom: true, boxZoom: true, dragRotate: true, dragPan: true,
    touchZoomRotate: true, touchPitch: true, doubleClickZoom: true,
  });

  homeMap.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'top-right');

  homeMap.on('load', function() {
    var style = homeMap.getStyle();
    var layers = style && style.layers ? style.layers : [];
    var labelLayer = null;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === 'symbol') { labelLayer = layers[i].id; break; }
    }
    var sources = style.sources || {};
    var buildingSource = null;
    if (sources['openmaptiles']) buildingSource = 'openmaptiles';
    else if (sources['maptiler_planet']) buildingSource = 'maptiler_planet';
    else Object.keys(sources).forEach(function(src) { if (!buildingSource) buildingSource = src; });

    if (buildingSource) {
      try {
        homeMap.addLayer({
          id: 'mh-3d-buildings', source: buildingSource, 'source-layer': 'building',
          type: 'fill-extrusion', minzoom: 13,
          paint: {
            'fill-extrusion-color': '#1e3a6e',
            'fill-extrusion-height': ['interpolate',['linear'],['zoom'],13,0,14.5,['get','render_height']],
            'fill-extrusion-base': ['get','render_min_height'],
            'fill-extrusion-opacity': 0.9
          }
        }, labelLayer || undefined);
      } catch(e) { console.warn('[3D buildings]', e); }
    }

    // Hub glow layers — delayed, non-blocking
    setTimeout(function() {
      try { if (typeof initHubGlowLayers === 'function') initHubGlowLayers(); } catch(e) {}
    }, 3000);

    // Use localStorage coords only — skip Supabase lookup on map load (avoids network hang)
    try {
      var localPins = {};
      try { localPins = JSON.parse(localStorage.getItem('dtslo_hub_pins') || '{}'); } catch(e) {}
      addHubMarkers(localPins);
    } catch(e) { try { addHubMarkers({}); } catch(e2) {} }

    // Sync pin coords from Supabase in background — updates on next load
    setTimeout(function() {
      try {
        if (typeof loadSavedPinCoords === 'function') {
          loadSavedPinCoords().catch(function(){});
        }
      } catch(e) {}
    }, 5000);

    // Smart Start — delayed well after map settles
    setTimeout(function() {
      try { if (typeof smartStartInit === 'function') smartStartInit(); } catch(e) {}
    }, 4000);

    var bearing = -25, rotating = true;
    homeMap.on('mousedown', function() { rotating = false; });
    homeMap.on('touchstart', function() { rotating = false; });
    var rot = function() {
      if (!rotating || !homeMap) return;
      bearing += 0.015;
      try { homeMap.setBearing(bearing); } catch(e) { return; }
      requestAnimationFrame(rot);
    };
    setTimeout(rot, 800);
  });

  // Fade overlay immediately — don't wait for tiles to load
  setTimeout(function() {
    var overlay = document.getElementById('mh-map-overlay');
    if (overlay) overlay.style.opacity = '0';
  }, 300);

  homeMap.on('error', function(e) { console.warn('[Map error]', e); });
}

function addHubMarkersWithCoords(c) { addHubMarkers(c); }

function addHubMarkers(coordsOverride) {
  var s = coordsOverride || {};
  var hubs = [
    { id:'dtslo',      coords: s['dtslo']       || [-120.6650,35.2803], icon:'🌃', label:'DTSLO',        sub:'Nightlife',           color:'linear-gradient(135deg,#ff2d78,#b44fff)', active:true,  onclick:'menuHomeRequireAuth()' },
    { id:'restaurant', coords: s['restaurants'] || [-120.6655,35.2808], icon:'🍽',  label:'Restaurants',  sub:'Browse & dine',       color:'linear-gradient(135deg,#ff6b35,#ef4444)', active:true,  onclick:'menuHomeOpenRestaurantHub()' },
    { id:'beach',      coords: s['beach']       || [-120.6750,35.2680], icon:'🏖',  label:'Beach Hub',    sub:'8 beaches',           color:'linear-gradient(135deg,#06b6d4,#0ea5e9)', active:true,  onclick:'menuHomeOpenBeachHub()' },
    { id:'wine',       coords: s['wine']        || [-120.8200,35.3600], icon:'🍷',  label:'Wine Country', sub:'Paso & SLO wine',     color:'linear-gradient(135deg,#7c2d8e,#b44fff)', active:true,  onclick:'menuHomeOpenWineHub()' },
    { id:'brewery',    coords: s['brewery']     || [-120.6595,35.2808], icon:'🍺',  label:'Craft Beer',   sub:'9 breweries',         color:'linear-gradient(135deg,#f59e0b,#d97706)', active:true,  onclick:'menuHomeOpenBreweryHub()' },
    { id:'nature',     coords: s['nature']      || [-120.6785,35.2920], icon:'🌿',  label:'Nature',       sub:'Hikes & parks',       color:'linear-gradient(135deg,#22c55e,#16a34a)', active:true,  onclick:'menuHomeOpenNatureHub()' },
    { id:'thrill',     coords: s['thrill']      || [-120.6595,35.2750], icon:'⚡',  label:'Thrill',       sub:'Adventure',           color:'linear-gradient(135deg,#ef4444,#dc2626)', active:true,  onclick:'menuHomeOpenThrillHub()' },
    { id:'events',     coords: s['events']      || [-120.6590,35.2820], icon:'🎭',  label:'Events',       sub:'Concerts & markets',  color:'linear-gradient(135deg,#ffd700,#ff9500)', active:true,  onclick:'menuHomeOpenEventsHub()' },
    { id:'calpoly',    coords: s['calpoly']     || [-120.6540,35.2980], icon:'🎓',  label:'Cal Poly',     sub:'Student life',        color:'linear-gradient(135deg,#6366f1,#8b5cf6)', active:true,  onclick:'menuHomeOpenCalPolyHub()' },
    { id:'city',       coords: s['city']        || [-120.6620,35.2790], icon:'🏛',  label:'City Hub',     sub:'Landmarks & culture', color:'linear-gradient(135deg,#00f5ff,#00ff88)', active:true,  onclick:'menuHomeOpenCityHub()' },
    { id:'shopping',   coords: s['shopping']    || [-120.6580,35.2760], icon:'🛒',  label:'Shopping',     sub:'Coming Soon',         color:'linear-gradient(135deg,#22c55e,#16a34a)', active:false },
  ];
  hubs.forEach(function(hub) {
    var el = document.createElement('div');
    el.className = 'mh-hub-marker';
    el.dataset.hubId = hub.id || '';
    el.innerHTML = [
      '<div class="mh-hub-pin' + (hub.active ? ' mh-hub-active' : ' mh-hub-dim') + '"' +
        (hub.active && hub.onclick ? ' onclick="' + hub.onclick + '"' : '') + '>',
        '<div class="mh-hub-dot" style="background:' + hub.color + '">',
          '<span class="mh-hub-icon">' + hub.icon + '</span>',
        '</div>',
        '<div class="mh-hub-label">' + hub.label + '</div>',
        hub.active ? '<div class="mh-hub-enter">Tap to Enter</div>' : '<div class="mh-hub-sub">' + hub.sub + '</div>',
      '</div>'
    ].join('');
    new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(hub.coords).addTo(homeMap);
  });
}
window.menuHomeReturnToSLO = function() {
  if (homeMap) homeMap.flyTo({ center: [-120.6650,35.2803], zoom: 14, pitch: 45, bearing: -20, duration: 800 });
};

// ── BUILDING GLOW SYSTEM ──
var _glowInterval = null;
var _glowSettings = {
  on: false,
  color: '#1e3a6e',     // base color
  glowColor: '#2d6abf', // peak glow color
  speed: 3000,          // ms per full cycle
  intensity: 0.9,
};

function startBuildingGlow() {
  if (_glowInterval) clearInterval(_glowInterval);
  if (!_glowSettings.on) return;

  var t = 0;
  _glowInterval = setInterval(function() {
    if (!homeMap || !homeMap.getLayer('mh-3d-buildings')) {
      clearInterval(_glowInterval);
      return;
    }
    t += 50;
    // Sine wave between base and glow color
    var phase = (Math.sin((t / _glowSettings.speed) * Math.PI * 2) + 1) / 2; // 0..1
    var color = lerpColor(_glowSettings.color, _glowSettings.glowColor, phase * 0.6);
    var opacity = 0.75 + phase * 0.2;
    try {
      homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-color', color);
      homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-opacity', opacity * _glowSettings.intensity);
    } catch(e) {}
  }, 500);
}
window.startBuildingGlow = startBuildingGlow;

function stopBuildingGlow() {
  if (_glowInterval) { clearInterval(_glowInterval); _glowInterval = null; }
  if (homeMap && homeMap.getLayer('mh-3d-buildings')) {
    try {
      homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-color', _glowSettings.color);
      homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-opacity', 0.85);
    } catch(e) {}
  }
}
window.stopBuildingGlow = stopBuildingGlow;

function updateGlowSettings(key, val) {
  _glowSettings[key] = val;
  if (key === 'on') {
    if (val) startBuildingGlow();
    else stopBuildingGlow();
  } else if (_glowSettings.on) {
    startBuildingGlow(); // restart with new settings
  }
  // Persist
  try { localStorage.setItem('dtslo_glow_settings', JSON.stringify(_glowSettings)); } catch(e) {}
}
window.updateGlowSettings = updateGlowSettings;

// Load saved glow settings
(function() {
  try {
    var saved = JSON.parse(localStorage.getItem('dtslo_glow_settings') || 'null');
    if (saved) Object.assign(_glowSettings, saved);
  } catch(e) {}
})();

// Linear interpolate between two hex colors
function lerpColor(a, b, t) {
  var ah = a.replace('#',''), bh = b.replace('#','');
  var ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab2 = parseInt(ah.slice(4,6),16);
  var br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb2 = parseInt(bh.slice(4,6),16);
  var r = Math.round(ar + (br-ar)*t);
  var g = Math.round(ag + (bg-ag)*t);
  var b2 = Math.round(ab2 + (bb2-ab2)*t);
  return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b2.toString(16).padStart(2,'0');
}

// ── DEV MAP DISPLAY FUNCTIONS ──

var MAP_STYLES = {
  dark:      'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=' + MAPTILER_KEY,
  satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=' + MAPTILER_KEY,
  streets:   'https://api.maptiler.com/maps/streets/style.json?key=' + MAPTILER_KEY,
  topo:      'https://api.maptiler.com/maps/topo-v2/style.json?key=' + MAPTILER_KEY,
};
var _currentMapStyle = 'dark';
var _dev3D = true;
var _devRotationActive = true;
var _devLockSLO = false;
var _devFollowWatcher = null;
var _devNightDimLayer = false;
var _devNavControl = null;

function devSetMapStyle(name) {
  if (!homeMap || !MAP_STYLES[name]) return;
  _currentMapStyle = name;
  ['dark','satellite','streets','topo'].forEach(function(s) {
    var btn = document.getElementById('mh-style-' + s);
    if (btn) btn.style.borderColor = s === name ? '#b44fff' : 'rgba(255,255,255,0.08)';
  });
  homeMap.setStyle(MAP_STYLES[name]);
  homeMap.once('styledata', function() {
    if (_dev3D) devAdd3DBuildings();
  });
  try { localStorage.setItem('dtslo_map_style', name); } catch(e) {}
}
window.devSetMapStyle = devSetMapStyle;

function devToggle3D(on) {
  _dev3D = on;
  if (!homeMap) return;
  if (on) { devAdd3DBuildings(); }
  else { try { if (homeMap.getLayer('mh-3d-buildings')) homeMap.removeLayer('mh-3d-buildings'); } catch(e) {} }
}
window.devToggle3D = devToggle3D;

function devAdd3DBuildings() {
  if (!homeMap) return;
  try { if (homeMap.getLayer('mh-3d-buildings')) homeMap.removeLayer('mh-3d-buildings'); } catch(e) {}
  var style = homeMap.getStyle();
  var sources = style && style.sources ? style.sources : {};
  var buildingSource = sources['openmaptiles'] ? 'openmaptiles' : sources['maptiler_planet'] ? 'maptiler_planet' : Object.keys(sources)[0];
  if (!buildingSource) return;
  var layers = style.layers || [];
  var labelLayer = null;
  for (var i = 0; i < layers.length; i++) { if (layers[i].type === 'symbol') { labelLayer = layers[i].id; break; } }
  try {
    homeMap.addLayer({
      id: 'mh-3d-buildings', source: buildingSource, 'source-layer': 'building',
      type: 'fill-extrusion', minzoom: 13,
      paint: {
        'fill-extrusion-color': _glowSettings.color || '#1e3a6e',
        'fill-extrusion-height': ['interpolate',['linear'],['zoom'],13,0,14.5,['get','render_height']],
        'fill-extrusion-base': ['get','render_min_height'],
        'fill-extrusion-opacity': 0.9
      }
    }, labelLayer || undefined);
  } catch(e) { console.warn('[3D buildings]', e); }
}

function devToggleRotation(on) {
  _devRotationActive = on;
  if (on && homeMap) {
    var bearing = homeMap.getBearing();
    var rot = function() {
      if (!_devRotationActive || !homeMap) return;
      bearing += 0.015;
      try { homeMap.setBearing(bearing); } catch(e) { return; }
      requestAnimationFrame(rot);
    };
    rot();
  }
}
window.devToggleRotation = devToggleRotation;

function devToggleGlowDots(on) {
  if (typeof HUB_SPOT_DEFS === 'undefined') return;
  HUB_SPOT_DEFS.forEach(function(hub) {
    if (typeof setHubGlowVisible === 'function') setHubGlowVisible(hub.id, on);
  });
}
window.devToggleGlowDots = devToggleGlowDots;

function devToggleLabels(on) {
  if (!homeMap) return;
  var style = homeMap.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(function(layer) {
    if (layer.type === 'symbol') {
      try { homeMap.setLayoutProperty(layer.id, 'visibility', on ? 'visible' : 'none'); } catch(e) {}
    }
  });
}
window.devToggleLabels = devToggleLabels;

function devToggleNightDim(on) {
  _devNightDimLayer = on;
  var existing = document.getElementById('mh-night-dim');
  if (on) {
    if (existing) return;
    var dim = document.createElement('div');
    dim.id = 'mh-night-dim';
    dim.style.cssText = 'position:absolute;inset:0;z-index:3;background:rgba(0,0,20,0.45);pointer-events:none;transition:opacity 0.8s';
    var mapEl = document.getElementById('menu-home');
    if (mapEl) mapEl.appendChild(dim);
  } else {
    if (existing) existing.remove();
  }
}
window.devToggleNightDim = devToggleNightDim;

function devToggleNavControls(on) {
  if (!homeMap) return;
  if (!on) {
    if (_devNavControl) { try { homeMap.removeControl(_devNavControl); } catch(e) {} _devNavControl = null; }
    // Remove existing nav controls
    document.querySelectorAll('.maplibregl-ctrl-top-right').forEach(function(el) { el.style.display = 'none'; });
  } else {
    document.querySelectorAll('.maplibregl-ctrl-top-right').forEach(function(el) { el.style.display = ''; });
    if (!_devNavControl) {
      _devNavControl = new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true });
      try { homeMap.addControl(_devNavControl, 'top-right'); } catch(e) {}
    }
  }
}
window.devToggleNavControls = devToggleNavControls;

function devToggleRadiusRing(on) {
  if (!homeMap) return;
  if (!on) {
    try { if (homeMap.getLayer('dev-radius-ring')) homeMap.removeLayer('dev-radius-ring'); } catch(e) {}
    try { if (homeMap.getSource('dev-radius-src')) homeMap.removeSource('dev-radius-src'); } catch(e) {}
    return;
  }
  // Draw ~0.5 mile walkable radius around downtown SLO
  var center = [-120.6650, 35.2803];
  var radiusDeg = 0.007; // ~0.5 miles
  var points = [];
  for (var i = 0; i <= 64; i++) {
    var angle = (i / 64) * Math.PI * 2;
    points.push([center[0] + Math.cos(angle) * radiusDeg * 1.3, center[1] + Math.sin(angle) * radiusDeg]);
  }
  try {
    homeMap.addSource('dev-radius-src', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [points] }, properties: {} } });
    homeMap.addLayer({ id: 'dev-radius-ring', type: 'line', source: 'dev-radius-src', paint: { 'line-color': '#ffd700', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [4, 3] } });
  } catch(e) { console.warn('[radius ring]', e); }
}
window.devToggleRadiusRing = devToggleRadiusRing;

var _devBarPinMarkers = [];
function devToggleBarPins(on) {
  if (!homeMap) return;
  if (!on) {
    _devBarPinMarkers.forEach(function(m) { try { m.remove(); } catch(e) {} });
    _devBarPinMarkers = [];
    return;
  }
  if (typeof bars === 'undefined') return;
  // Bar lat/lng coords — hardcoded from pin_mover
  var BAR_COORDS = {
    "Black Sheep Bar & Grill": [35.2814, -120.6658],
    "Bull's Tavern":           [35.2816, -120.6662],
    "Frog & Peach Pub":        [35.2815, -120.6661],
    "High Bar":                [35.2800, -120.6644],
    "Nightcap":                [35.2791, -120.6640],
    "Feral Kitchen & Lounge":  [35.2806, -120.6655],
    "The Library":             [35.2801, -120.6648],
    "The Mark":                [35.2809, -120.6652],
    "McCarthy's Irish Pub":    [35.2812, -120.6660],
    "Sidecar SLO":             [35.2808, -120.6656],
    "BA Start Arcade Bar":     [35.2803, -120.6650],
    "SLO Brew Rock":           [35.2768, -120.6638],
  };
  bars.forEach(function(bar) {
    var coords = (bar.lat && bar.lng) ? [bar.lat, bar.lng] : BAR_COORDS[bar.name];
    if (!coords) return;
    var el = document.createElement('div');
    el.style.cssText = 'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid rgba(255,255,255,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer';
    el.style.background = bar.color || '#ff2d78';
    el.textContent = bar.emoji || '🍺';
    el.title = bar.name;
    var marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([coords[1], coords[0]])
      .addTo(homeMap);
    _devBarPinMarkers.push(marker);
  });
}
window.devToggleBarPins = devToggleBarPins;

function devToggleTileQuality(high) {
  if (!homeMap) return;
  try { homeMap.setMaxTileCacheSize(high ? 200 : 50); } catch(e) {}
  // Also toggle overzooming
  try { homeMap.setMaxZoom(high ? 22 : 18); } catch(e) {}
}
window.devToggleTileQuality = devToggleTileQuality;

function devKillAnimations(on) {
  var style = document.getElementById('dev-kill-anim-style');
  if (on) {
    if (style) return;
    var s = document.createElement('style');
    s.id = 'dev-kill-anim-style';
    s.textContent = '#menu-home * { animation: none !important; transition: none !important; }';
    document.head.appendChild(s);
  } else {
    if (style) style.remove();
  }
}
window.devKillAnimations = devKillAnimations;

function devResetNorth() {
  if (!homeMap) return;
  homeMap.easeTo({ bearing: 0, duration: 600 });
}
window.devResetNorth = devResetNorth;

function devFollowMe() {
  if (!homeMap) return;
  if (_devFollowWatcher) { navigator.geolocation.clearWatch(_devFollowWatcher); _devFollowWatcher = null; }
  if (!navigator.geolocation) { try { if (typeof showToast === 'function') showToast('GPS not available'); } catch(e) {} return; }
  _devFollowWatcher = navigator.geolocation.watchPosition(function(pos) {
    homeMap.easeTo({ center: [pos.coords.longitude, pos.coords.latitude], duration: 500 });
  }, function() {}, { enableHighAccuracy: true });
  try { if (typeof showToast === 'function') showToast('Following your location'); } catch(e) {}
}
window.devFollowMe = devFollowMe;

function devLockToSLO() {
  if (!homeMap) return;
  _devLockSLO = !_devLockSLO;
  var SLO_BOUNDS = [[-121.2, 35.0], [-120.3, 35.6]];
  if (_devLockSLO) {
    homeMap.setMaxBounds(SLO_BOUNDS);
    try { if (typeof showToast === 'function') showToast('Map locked to SLO area'); } catch(e) {}
  } else {
    homeMap.setMaxBounds(null);
    try { if (typeof showToast === 'function') showToast('Map bounds unlocked'); } catch(e) {}
  }
}
window.devLockToSLO = devLockToSLO;

var DEV_LOCATIONS = {
  downtown: { center: [-120.6650, 35.2803], zoom: 15, pitch: 62 },
  calpoly:  { center: [-120.6596, 35.3050], zoom: 15, pitch: 45 },
  paso:     { center: [-120.6910, 35.6244], zoom: 13, pitch: 30 },
  morro:    { center: [-120.8650, 35.3658], zoom: 13, pitch: 30 },
};
function devJumpTo(name) {
  var loc = DEV_LOCATIONS[name];
  if (!homeMap || !loc) return;
  homeMap.flyTo({ center: loc.center, zoom: loc.zoom, pitch: loc.pitch, duration: 1200 });
}
window.devJumpTo = devJumpTo;

function devSetPitch(val) {
  var lbl = document.getElementById('dev-pitch-val');
  if (lbl) lbl.textContent = val + 'deg';
  if (homeMap) { try { homeMap.setPitch(val); } catch(e) {} }
}
window.devSetPitch = devSetPitch;

function devSetZoom(val) {
  var lbl = document.getElementById('dev-zoom-val');
  if (lbl) lbl.textContent = val;
  if (homeMap) { try { homeMap.setZoom(val); } catch(e) {} }
}
window.devSetZoom = devSetZoom;

function devSetBuildingColor(color) {
  _glowSettings.color = color;
  if (homeMap && homeMap.getLayer('mh-3d-buildings')) {
    try { homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-color', color); } catch(e) {}
  }
  try { localStorage.setItem('dtslo_glow_settings', JSON.stringify(_glowSettings)); } catch(e) {}
}
window.devSetBuildingColor = devSetBuildingColor;

function devToggleXPToast(on) {
  window._devSuppressXPToast = !on;
  try { localStorage.setItem('dtslo_dev_suppress_xp', on ? '0' : '1'); } catch(e) {}
}
window.devToggleXPToast = devToggleXPToast;

function devToggleLevelUp(on) {
  window._devSuppressLevelUp = !on;
  try { localStorage.setItem('dtslo_dev_suppress_levelup', on ? '0' : '1'); } catch(e) {}
}
window.devToggleLevelUp = devToggleLevelUp;

// Restore suppression state on load
(function() {
  try {
    if (localStorage.getItem('dtslo_dev_suppress_xp') === '1') window._devSuppressXPToast = true;
    if (localStorage.getItem('dtslo_dev_suppress_levelup') === '1') window._devSuppressLevelUp = true;
  } catch(e) {}
})();
// These were missing in v6.1.1 causing black screen
// ══════════════════════════════════════════════

function mkCard(fn, colors, icon, name, sub) {
  return '<div class="mh-hub-card mh-hub-card-active" onclick="' + fn + '">' +
    '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,' + colors + ')">' + icon + '</div>' +
    '<div class="mh-hub-card-info"><div class="mh-hub-card-name">' + name + '</div><div class="mh-hub-card-sub">' + sub + '</div></div>' +
    '<div class="mh-hub-card-arrow">→</div></div>';
}
function mkTour(id, icon, name, meta) {
  return '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="' + id + '">' +
    '<div class="mh-tour-icon">' + icon + '</div><div class="mh-tour-name">' + name + '</div><div class="mh-tour-meta">' + meta + '</div></div>';
}
function mkBeach(id, icon, name, sub) {
  return '<div class="mh-venue-row" onclick="menuHomeTravelBeach(\'' + id + '\')">' +
    '<span class="mh-venue-emoji">' + icon + '</span>' +
    '<div class="mh-venue-info"><div class="mh-venue-name">' + name + '</div><div class="mh-venue-sub">' + sub + '</div></div>' +
    '<span style="color:rgba(255,255,255,0.3)">›</span></div>';
}
function mkTool(id, icon, label) {
  return '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="' + id + '"><div class="mh-tool-icon">' + icon + '</div><div>' + label + '</div></button>';
}

function injectHTML() {
  if (document.getElementById('menu-home')) return;
  var div = document.createElement('div');
  div.id = 'menu-home';
  div.innerHTML = [
    '<div id="mh-map"></div>',
    '<div id="mh-map-overlay"></div>',
    '<div id="mh-header"><div id="mh-logo">MENU</div><div id="mh-city">San Luis Obispo</div></div>',
    '<button id="mh-location-btn" onclick="menuHomeToggleLocation()" style="position:absolute;top:160px;right:16px;z-index:10;background:rgba(8,8,20,0.75);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);padding:7px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;backdrop-filter:blur(8px);font-family:Helvetica Neue,sans-serif">📍 Me</button>',

    // HUBS DRAWER
    '<div id="mh-drawer-hubs" class="mh-drawer">',
      '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
      '<div class="mh-drawer-title">Hubs</div>',
      '<div class="mh-hub-cards">',
        mkCard('menuHomeRequireAuth()',       '#ff2d78,#b44fff', '🌃', 'DTSLO',        'Nightlife · Active Now'),
        mkCard('menuHomeOpenRestaurantHub()', '#ff6b35,#ef4444', '🍽',  'Restaurants',  'Browse & dine'),
        mkCard('menuHomeOpenBeachHub()',      '#06b6d4,#0ea5e9', '🏖',  'Beach Hub',    '8 beaches · Surf · Trails'),
        mkCard('menuHomeOpenNatureHub()',     '#22c55e,#16a34a', '🌿',  'Nature Hub',   'Hikes · Parks · Trails'),
        mkCard('menuHomeOpenThrillHub()',     '#ef4444,#dc2626', '⚡',  'Thrill Hub',   'Zipline · ATV · Adventure'),
        mkCard('menuHomeOpenEventsHub()',     '#ffd700,#ff9500', '🎭',  'Events Hub',   'Concerts · Markets · Festivals'),
        mkCard('menuHomeOpenBreweryHub()',    '#f59e0b,#d97706', '🍺',  'Craft Beer',   '9 SLO breweries'),
        mkCard('menuHomeOpenWineHub()',       '#7c2d8e,#b44fff', '🍷',  'Wine Country', 'Paso Robles · Edna Valley'),
        mkCard('menuHomeOpenCalPolyHub()',    '#6366f1,#8b5cf6', '🎓',  'Cal Poly Hub', 'Student life · Bars · Eats'),
        mkCard('menuHomeOpenCityHub()',       '#00f5ff,#00ff88', '🏛',  'City Hub',     'Landmarks · Culture · Art'),
        '<div class="mh-hub-card mh-hub-card-soon"><div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#22c55e,#16a34a)">🛒</div><div class="mh-hub-card-info"><div class="mh-hub-card-name">Shopping</div><div class="mh-hub-card-sub">Coming Soon</div></div><div class="mh-hub-card-arrow" style="opacity:0.3">→</div></div>',
      '</div>',
    '</div>',

    // TRAVEL DRAWER
    '<div id="mh-drawer-travel" class="mh-drawer">',
      '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
      '<div class="mh-drawer-title">✨ Travel Guide</div>',
      '<button class="mh-plan-btn" onclick="menuHomeOpenTravelPlanIt()"><span style="font-size:18px">✨</span><div style="text-align:left;flex:1"><div style="font-size:14px;font-weight:800">Plan It</div><div style="font-size:11px;color:rgba(255,255,255,0.5)">Build your perfect outing with AI</div></div><span style="color:rgba(255,255,255,0.3)">›</span></button>',
      '<div class="mh-travel-tabs">',
        '<button class="mh-travel-tab active" onclick="menuHomeTravelTab(this,\'all\')">All</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'tours\')">🗺 Tours</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'food\')">🍽 Food</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'hotels\')">🏨 Hotels</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'beaches\')">🌊 Beaches</button>',
      '</div>',
      '<div class="mh-travel-section" id="mh-tsec-tours">',
        '<div class="mh-section-label">🗺 SELF-GUIDED TOURS</div>',
        '<div class="mh-tour-grid">',
          mkTour('historic','🏛','Historic SLO','90 min · Free'),
          mkTour('bishop','🥾','Bishop Peak','2.5 hrs · Hard'),
          mkTour('food','🍕','Food Tour','3 hrs · $40-100'),
          mkTour('wine','🍷','Wine Trail','4 hrs · Drive'),
          mkTour('beach','🌊','Beach Day','All day · Drive'),
          mkTour('morro','🦦','Morro Bay','Half day · Drive'),
          mkTour('brewery','🍺','Brewery Hop','3 hrs · Walking'),
          mkTour('bike','🚴','Bike Trail','2-3 hrs · Easy'),
        '</div>',
      '</div>',
      '<div class="mh-travel-section" id="mh-tsec-food">',
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><div class="mh-section-label" style="margin-bottom:0">🍽 RESTAURANTS</div><button onclick="menuHomeTravelViewAll(\'food\')" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">View all →</button></div>',
        '<div id="mh-restaurant-list"><div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);font-size:12px">Loading...</div></div>',
      '</div>',
      '<div class="mh-travel-section" id="mh-tsec-hotels">',
        '<div class="mh-section-label">🏨 HOTELS</div>',
        '<div id="mh-hotel-list"><div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);font-size:12px">Loading...</div></div>',
      '</div>',
      '<div class="mh-travel-section" id="mh-tsec-beaches">',
        '<div class="mh-section-label">🌊 BEACHES NEARBY</div>',
        '<div class="mh-venue-list">',
          mkBeach('avila','🏖','Avila Beach','10 min · Calm water · Dog friendly'),
          mkBeach('pismo','🌊','Pismo Beach','15 min · Classic vibe · Pier'),
          mkBeach('shell','🪨','Shell Beach','12 min · Dramatic cliffs · Surfing'),
          mkBeach('morro','🦦','Morro Bay Beach','30 min · Sea otters · Morro Rock'),
        '</div>',
      '</div>',
    '</div>',

    // TOOLS DRAWER
    '<div id="mh-drawer-tools" class="mh-drawer">',
      '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
      '<div class="mh-drawer-title">Tools</div>',
      '<div class="mh-section-label">🚗 TRANSPORT</div>',
      '<div class="mh-tools-grid">',
        mkTool('rides','🚗','Rides'), mkTool('transit','🚌','Transit'),
        mkTool('gas','⛽','Gas'),     mkTool('parking','🅿️','Parking'),
      '</div>',
      '<div class="mh-section-label">📍 MAP TOOLS</div>',
      '<div class="mh-tools-grid">',
        '<button class="mh-tool-btn" onclick="menuHomePinMover()"><div class="mh-tool-icon">📍</div><div>Move Pins</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeReturnToSLO()"><div class="mh-tool-icon">🗺</div><div>Return to SLO</div></button>',
      '</div>',
      '<div class="mh-section-label">🏙 DOWNTOWN</div>',
      '<div class="mh-tools-grid">',
        mkTool('atms','🏧','ATMs'),        mkTool('traffic','📡','Traffic'),
        mkTool('wifi','📶','Free WiFi'),   mkTool('safe_ride','🌙','Safe Ride'),
      '</div>',
      '<div class="mh-section-label">🛡 SAFETY</div>',
      '<div class="mh-tools-grid">',
        mkTool('emergency','🚨','Emergency'), mkTool('hospital','🏥','Hospital'),
        mkTool('pharmacy','💊','Pharmacy'),
      '</div>',
    '</div>',


    // TOOLBAR
    '<div id="mh-toolbar">',
      '<button class="mh-tab" id="mh-tab-hubs"   onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="hubs"><span class="mh-tab-icon">🌐</span><span class="mh-tab-label">Hubs</span></button>',
      '<button class="mh-tab" id="mh-tab-tools"  onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="tools"><span class="mh-tab-icon">⚡</span><span class="mh-tab-label">Tools</span></button>',
      '<button class="mh-tab" id="mh-tab-travel" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="travel"><span class="mh-tab-icon">🗺</span><span class="mh-tab-label">Travel</span></button>',
    '</div>',

    // SKIP PROMPT
    '<div id="mh-skip-prompt"><div id="mh-skip-sheet"><div class="mh-sheet-handle"></div>',
      '<div id="mh-skip-title">Go straight to DTSLO?</div>',
      '<div id="mh-skip-body">Skip the hub screen on future opens. Change this anytime in your profile settings.</div>',
      '<button class="mh-skip-btn mh-skip-yes" onclick="menuHomePromptYes()">Yes, go straight to DTSLO</button>',
      '<button class="mh-skip-btn mh-skip-no"  onclick="menuHomePromptNo()">No, show me the hub screen</button>',
    '</div></div>',

  ].join('');
  document.body.insertBefore(div, document.body.firstChild);

}

function injectCSS() {
  if (document.getElementById('mh-css')) return;
  var s = document.createElement('style');
  s.id = 'mh-css';
  s.textContent = [
    '#menu-home{position:fixed;inset:0;z-index:9998;background:#000;display:none}',
    '#mh-map{position:absolute;inset:0}',
    '#mh-map-overlay{position:absolute;inset:0;z-index:2;background:#000;opacity:1;transition:opacity 1.5s ease;pointer-events:none}',
    '#mh-header{position:absolute;top:52px;left:0;right:0;z-index:10;text-align:center;pointer-events:none}',
    '#mh-logo{font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-1px;text-shadow:0 2px 20px rgba(0,0,0,0.8)}',
    '#mh-city{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-top:3px;font-family:Helvetica Neue,sans-serif}',
    '.mh-hub-marker{background:none;border:none}',
    '.mh-hub-pin{display:flex;flex-direction:column;align-items:center;transition:transform 0.2s}',
    '.mh-hub-active{cursor:pointer}.mh-hub-active:active{transform:scale(0.95)}',
    '.mh-hub-dim{opacity:0.3;cursor:default}',
    '.mh-hub-dot{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.5)}',
    '.mh-hub-active .mh-hub-dot{animation:mh-float 3s ease-in-out infinite}',
    '@keyframes mh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '.mh-hub-icon{font-size:22px}',
    '.mh-hub-label{margin-top:4px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,0.9);white-space:nowrap;font-family:Helvetica Neue,sans-serif}',
    '.mh-hub-sub{font-size:9px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif;white-space:nowrap}',
    '.mh-hub-enter{font-size:9px;color:#ffd700;font-family:Helvetica Neue,sans-serif;font-weight:800;white-space:nowrap}',
    '#mh-toolbar{position:absolute;bottom:0;left:0;right:0;z-index:20;display:flex;background:rgba(6,6,15,0.7);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.08);padding:8px 0 28px}',
    '.mh-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;padding:8px 4px;transition:all 0.15s;font-family:Helvetica Neue,sans-serif}',
    '.mh-tab-icon{font-size:22px}.mh-tab-label{font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}',
    '.mh-tab-active{color:#ffd700}.mh-tab-active .mh-tab-icon{filter:drop-shadow(0 0 6px rgba(255,215,0,0.6))}',
    '.mh-drawer{position:absolute;bottom:72px;left:0;right:0;z-index:15;background:rgba(6,6,15,0.92);backdrop-filter:blur(24px);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 20px;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);max-height:60vh;overflow-y:auto}',
    '.mh-drawer-open{transform:translateY(0)}',
    '.mh-drawer-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin:0 auto 14px;cursor:pointer}',
    '.mh-drawer-title{font-size:16px;font-weight:800;color:#fff;margin-bottom:14px;font-family:Georgia,serif}',
    '.mh-hub-cards{display:flex;flex-direction:column;gap:8px}',
    '.mh-hub-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.15s}',
    '.mh-hub-card-active{border-color:rgba(255,45,120,0.3);background:rgba(255,45,120,0.06)}.mh-hub-card-active:active{transform:scale(0.98)}',
    '.mh-hub-card-soon{opacity:0.4;cursor:default}',
    '.mh-hub-card-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}',
    '.mh-hub-card-info{flex:1}.mh-hub-card-name{font-size:14px;font-weight:800;color:#fff;font-family:Helvetica Neue,sans-serif}',
    '.mh-hub-card-sub{font-size:11px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif}',
    '.mh-hub-card-arrow{font-size:18px;color:#ffd700}',
    '.mh-tools-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}',
    '.mh-tool-btn{padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;transition:all 0.15s;text-align:left}',
    '.mh-tool-btn:active{transform:scale(0.97)}.mh-tool-icon{font-size:22px;margin-bottom:4px}',
    '.mh-section-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;margin-top:4px}',
    '.mh-plan-btn{display:flex;align-items:center;gap:12px;width:100%;padding:14px 16px;border-radius:16px;border:1px solid rgba(255,215,0,0.25);background:linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,215,0,0.04));cursor:pointer;font-family:Helvetica Neue,sans-serif;color:#fff;margin-bottom:14px;transition:all 0.15s}',
    '.mh-plan-btn:active{transform:scale(0.98)}',
    '.mh-travel-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px}',
    '.mh-travel-tab{padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
    '.mh-travel-tab.active{background:rgba(255,215,0,0.12);border-color:rgba(255,215,0,0.3);color:#ffd700}',
    '.mh-travel-section{margin-bottom:16px}',
    '.mh-tour-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.mh-tour-card{padding:12px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.15s}',
    '.mh-tour-card:active{transform:scale(0.97);background:rgba(255,215,0,0.08)}',
    '.mh-tour-icon{font-size:24px;margin-bottom:6px}.mh-tour-name{font-size:12px;font-weight:800;margin-bottom:2px;font-family:Helvetica Neue,sans-serif}',
    '.mh-tour-meta{font-size:10px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif}',
    '.mh-venue-list{display:flex;flex-direction:column;gap:6px}',
    '.mh-venue-row{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:all 0.15s}',
    '.mh-venue-row:active{background:rgba(255,255,255,0.06)}.mh-venue-emoji{font-size:22px;flex-shrink:0}.mh-venue-info{flex:1}',
    '.mh-venue-name{font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif}.mh-venue-sub{font-size:11px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif}',
    '#mh-skip-prompt{position:absolute;inset:0;z-index:25;background:rgba(0,0,0,0.6);display:none;align-items:flex-end;opacity:0;transition:opacity 0.35s;backdrop-filter:blur(4px)}',
    '#mh-skip-sheet{width:100%;background:rgba(8,8,20,0.97);border-radius:24px 24px 0 0;padding:20px 24px 52px;border-top:1px solid rgba(255,255,255,0.08)}',
    '#mh-skip-title{font-size:18px;font-weight:800;margin-bottom:8px;font-family:Georgia,serif}',
    '#mh-skip-body{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;line-height:1.5}',
    '.mh-skip-btn{width:100%;padding:14px;border-radius:14px;font-size:14px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer;margin-bottom:8px;transition:all 0.15s}',
    '.mh-skip-yes{background:linear-gradient(135deg,#ff2d78,#b44fff);border:none;color:#fff}',
    '.mh-skip-no{background:transparent;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5)}',
    '#mh-hub-preview{position:absolute;inset:0;z-index:22;background:rgba(0,0,0,0.75);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s;backdrop-filter:blur(4px)}',
    '#mh-hub-preview.show{opacity:1}',
    '#mh-hub-preview-inner{width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;padding:20px 20px 48px;max-height:85vh;overflow-y:auto;border-top:1px solid rgba(255,255,255,0.08)}',
    '.mh-sheet-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin:0 auto 16px;cursor:pointer}',
    '.mh-suggestion-tag{padding:6px 12px;border-radius:20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);font-size:12px;font-weight:700;color:rgba(255,255,255,0.5);cursor:pointer;display:inline-block;transition:all 0.15s}',
    '.mh-suggestion-tag-sel{background:rgba(255,215,0,0.12);border-color:rgba(255,215,0,0.4);color:#ffd700}',
  ].join('');
  document.head.appendChild(s);
}

// ── ADMIN COMMAND BRIDGE ──
// Polls localStorage for commands sent from the admin panel.
// Admin calls liveApp(fn, arg) which writes to dtslo_admin_cmd.
(function() {
  var _lastCmd = null;
  setInterval(function() {
    try {
      var raw = localStorage.getItem('dtslo_admin_cmd');
      if (!raw || raw === _lastCmd) return;
      _lastCmd = raw;
      var cmd = JSON.parse(raw);
      if (!cmd || !cmd.fn) return;
      // Only process commands from the last 3 seconds
      if (Date.now() - cmd.ts > 3000) return;
      var fn = window[cmd.fn];
      if (typeof fn === 'function') {
        cmd.arg !== null ? fn(cmd.arg) : fn();
      }
    } catch(e) {}
  }, 500);
})();
