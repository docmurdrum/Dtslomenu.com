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
  ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools','mh-drawer-dev'].forEach(function(d) {
    var el = document.getElementById(d); if (el) el.classList.remove('mh-drawer-open');
  });
  ['mh-tab-hubs','mh-tab-travel','mh-tab-tools','mh-tab-dev'].forEach(function(t) {
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
  ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools','mh-drawer-dev'].forEach(function(d) {
    var el = document.getElementById(d); if (el) el.classList.remove('mh-drawer-open');
  });
  ['mh-tab-hubs','mh-tab-travel','mh-tab-tools','mh-tab-dev'].forEach(function(t) {
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

    // Delay all effects — let map render first
    setTimeout(function() {
      try { startBuildingGlow(); } catch(e) {}
      try { if (typeof initHubGlowLayers === 'function') initHubGlowLayers(); } catch(e) {}
    }, 2000);

    try {
      if (typeof loadSavedPinCoords === 'function') {
        loadSavedPinCoords().then(function(coords) {
          try { addHubMarkers(coords); } catch(e) { addHubMarkers({}); }
        }).catch(function() { try { addHubMarkers({}); } catch(e) {} });
      } else {
        addHubMarkers({});
      }
    } catch(e) { try { addHubMarkers({}); } catch(e2) {} }

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
    var overlay = document.getElementById('mh-map-overlay');
    if (overlay) overlay.style.opacity = '0';
  });

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
  on: true,
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
  }, 50);
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

function openMapSettings() {
  var existing = document.getElementById('mh-map-settings');
  if (existing) { existing.remove(); return; }

  var sheet = document.createElement('div');
  sheet.id = 'mh-map-settings';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);display:flex;align-items:flex-end';

  sheet.innerHTML =
    '<div style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.2);padding:16px 20px 48px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<div style="font-size:16px;font-weight:800;font-family:Georgia,serif">🏙 Map Settings</div>' +
        '<button onclick="closeMapSettings()" style="width:30px;height:30px;border-radius:50%;border:none;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +

      // Building Glow toggle
      '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🏢 BUILDING GLOW</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">' +
        '<span style="font-size:13px;font-weight:700">Building Glow</span>' +
        '<label style="display:flex;align-items:center"><input type="checkbox" id="glow-toggle" ' + (_glowSettings.on ? 'checked' : '') + ' onchange="updateGlowSettings(\'on\',this.checked)" style="width:18px;height:18px;accent-color:#ffd700"></label>' +
      '</div>' +

      // Base color
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">' +
        '<span style="font-size:13px;font-weight:700">Base Color</span>' +
        '<input type="color" value="' + _glowSettings.color + '" onchange="updateGlowSettings(\'color\',this.value)" style="width:40px;height:30px;border:none;border-radius:6px;cursor:pointer;background:none">' +
      '</div>' +

      // Glow color
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">' +
        '<span style="font-size:13px;font-weight:700">Glow Color</span>' +
        '<input type="color" value="' + _glowSettings.glowColor + '" onchange="updateGlowSettings(\'glowColor\',this.value)" style="width:40px;height:30px;border:none;border-radius:6px;cursor:pointer;background:none">' +
      '</div>' +

      '<div style="padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;font-weight:700">Intensity</span><span id="glow-intensity-val" style="font-size:12px;color:#ffd700">' + Math.round(_glowSettings.intensity*100) + '%</span></div>' +
        '<input type="range" min="10" max="100" value="' + Math.round(_glowSettings.intensity*100) + '" style="width:100%;accent-color:#ffd700" oninput="document.getElementById(\'glow-intensity-val\').textContent=this.value+\'%\';updateGlowSettings(\'intensity\',this.value/100)">' +
      '</div>' +

      '<div style="padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:16px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;font-weight:700">Speed</span><span id="glow-speed-val" style="font-size:12px;color:#ffd700">' + (_glowSettings.speed/1000).toFixed(1) + 's</span></div>' +
        '<input type="range" min="500" max="8000" step="500" value="' + _glowSettings.speed + '" style="width:100%;accent-color:#ffd700" oninput="document.getElementById(\'glow-speed-val\').textContent=(this.value/1000).toFixed(1)+\'s\';updateGlowSettings(\'speed\',parseInt(this.value))">' +
      '</div>' +

      '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:4px">📍 SPOT LAYERS</div>' +
      buildHubGlowToggles() +
      '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">⚡ PRESETS</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
        '<button onclick="applyGlowPreset(\'blue\')" style="padding:10px;border-radius:10px;border:1px solid rgba(45,106,191,0.4);background:rgba(45,106,191,0.1);color:#6ba3f5;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer">🔵 Blue</button>' +
        '<button onclick="applyGlowPreset(\'pink\')" style="padding:10px;border-radius:10px;border:1px solid rgba(255,45,120,0.4);background:rgba(255,45,120,0.1);color:#ff2d78;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer">🩷 Pink</button>' +
        '<button onclick="applyGlowPreset(\'gold\')" style="padding:10px;border-radius:10px;border:1px solid rgba(255,215,0,0.4);background:rgba(255,215,0,0.1);color:#ffd700;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer">⭐ Gold</button>' +
        '<button onclick="applyGlowPreset(\'green\')" style="padding:10px;border-radius:10px;border:1px solid rgba(34,197,94,0.4);background:rgba(34,197,94,0.1);color:#22c55e;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer">🟢 Green</button>' +
        '<button onclick="applyGlowPreset(\'purple\')" style="padding:10px;border-radius:10px;border:1px solid rgba(139,92,246,0.4);background:rgba(139,92,246,0.1);color:#a78bfa;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer">🟣 Purple</button>' +
        '<button onclick="applyGlowPreset(\'red\')" style="padding:10px;border-radius:10px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.1);color:#ef4444;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer">🔴 Red</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(sheet);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.openMapSettings = openMapSettings;

function closeMapSettings() { var s = document.getElementById('mh-map-settings'); if (s) s.remove(); }
window.closeMapSettings = closeMapSettings;

var GLOW_PRESETS = {
  blue:   { color: '#0d1f3c', glowColor: '#2d6abf' },
  pink:   { color: '#2d0a1e', glowColor: '#ff2d78' },
  gold:   { color: '#2d2000', glowColor: '#ffd700' },
  green:  { color: '#0a2d14', glowColor: '#22c55e' },
  purple: { color: '#1a0a2d', glowColor: '#8b5cf6' },
  red:    { color: '#2d0a0a', glowColor: '#ef4444' },
};

function applyGlowPreset(name) {
  var p = GLOW_PRESETS[name];
  if (!p) return;
  _glowSettings.color = p.color;
  _glowSettings.glowColor = p.glowColor;
  _glowSettings.on = true;
  try { localStorage.setItem('dtslo_glow_settings', JSON.stringify(_glowSettings)); } catch(e) {}
  startBuildingGlow();
  // Close sheet and reopen to refresh inputs
  var s = document.getElementById('mh-map-settings');
  if (s) { s.remove(); setTimeout(openMapSettings, 100); }
}
window.applyGlowPreset = applyGlowPreset;


// ── DYNAMIC HUB GLOW TOGGLES ──
// Reads HUB_SPOT_DEFS — new hubs added there appear here automatically
function buildHubGlowToggles() {
  if (typeof HUB_SPOT_DEFS === 'undefined') return '';
  return HUB_SPOT_DEFS.map(function(hub) {
    var isOn = _hubGlowState && _hubGlowState[hub.id] !== false;
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);margin-bottom:6px">' +
      '<span style="font-size:13px;font-weight:700">' + hub.icon + ' ' + hub.label + '</span>' +
      '<label style="display:flex;align-items:center">' +
        '<input type="checkbox" ' + (isOn ? 'checked' : '') + ' onchange="setHubGlowVisible(\'' + hub.id + '\',this.checked)" style="width:18px;height:18px;accent-color:' + hub.color + '">' +
      '</label>' +
    '</div>';
  }).join('');
}
window.buildHubGlowToggles = buildHubGlowToggles;
