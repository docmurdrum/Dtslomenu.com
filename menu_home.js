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
window.menuHomeFindHubs    = findHubs;

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
  if (!window.maplibregl) return;
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
            'fill-extrusion-color': ['interpolate',['linear'],['get','render_height'],0,'#111827',15,'#1a2a45',40,'#1e3060',80,'#243570'],
            'fill-extrusion-height': ['interpolate',['linear'],['zoom'],13,0,14.5,['get','render_height']],
            'fill-extrusion-base': ['get','render_min_height'],
            'fill-extrusion-opacity': 0.85
          }
        }, labelLayer || undefined);
      } catch(e) { console.warn('[3D buildings]', e); }
    }

    try {
      if (typeof loadSavedPinCoords === 'function') {
        loadSavedPinCoords().then(function(coords) {
          try { addHubMarkers(coords); } catch(e) { addHubMarkers({}); }
        }).catch(function() { try { addHubMarkers({}); } catch(e) {} });
      } else {
        addHubMarkers({});
      }
    } catch(e) { try { addHubMarkers({}); } catch(e2) {} }

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
    { coords: s['dtslo']       || [-120.6650,35.2803], icon:'🌃', label:'DTSLO',        sub:'Nightlife',           color:'linear-gradient(135deg,#ff2d78,#b44fff)', active:true,  onclick:'menuHomeRequireAuth()' },
    { coords: s['restaurants'] || [-120.6655,35.2808], icon:'🍽',  label:'Restaurants',  sub:'Browse & dine',       color:'linear-gradient(135deg,#ff6b35,#ef4444)', active:true,  onclick:'menuHomeOpenRestaurantHub()' },
    { coords: s['beach']       || [-120.6750,35.2680], icon:'🏖',  label:'Beach Hub',    sub:'8 beaches',           color:'linear-gradient(135deg,#06b6d4,#0ea5e9)', active:true,  onclick:'menuHomeOpenBeachHub()' },
    { coords: s['wine']        || [-120.8200,35.3600], icon:'🍷',  label:'Wine Country', sub:'Paso & SLO wine',     color:'linear-gradient(135deg,#7c2d8e,#b44fff)', active:true,  onclick:'menuHomeOpenWineHub()' },
    { coords: s['brewery']     || [-120.6595,35.2808], icon:'🍺',  label:'Craft Beer',   sub:'9 breweries',         color:'linear-gradient(135deg,#f59e0b,#d97706)', active:true,  onclick:'menuHomeOpenBreweryHub()' },
    { coords: s['nature']      || [-120.6785,35.2920], icon:'🌿',  label:'Nature',       sub:'Hikes & parks',       color:'linear-gradient(135deg,#22c55e,#16a34a)', active:true,  onclick:'menuHomeOpenNatureHub()' },
    { coords: s['thrill']      || [-120.6595,35.2750], icon:'⚡',  label:'Thrill',       sub:'Adventure',           color:'linear-gradient(135deg,#ef4444,#dc2626)', active:true,  onclick:'menuHomeOpenThrillHub()' },
    { coords: s['events']      || [-120.6590,35.2820], icon:'🎭',  label:'Events',       sub:'Concerts & markets',  color:'linear-gradient(135deg,#ffd700,#ff9500)', active:true,  onclick:'menuHomeOpenEventsHub()' },
    { coords: s['calpoly']     || [-120.6540,35.2980], icon:'🎓',  label:'Cal Poly',     sub:'Student life',        color:'linear-gradient(135deg,#6366f1,#8b5cf6)', active:true,  onclick:'menuHomeOpenCalPolyHub()' },
    { coords: s['city']        || [-120.6620,35.2790], icon:'🏛',  label:'City Hub',     sub:'Landmarks & culture', color:'linear-gradient(135deg,#00f5ff,#00ff88)', active:true,  onclick:'menuHomeOpenCityHub()' },
    { coords: s['shopping']    || [-120.6580,35.2760], icon:'🛒',  label:'Shopping',     sub:'Coming Soon',         color:'linear-gradient(135deg,#22c55e,#16a34a)', active:false },
  ];
  hubs.forEach(function(hub) {
    var el = document.createElement('div');
    el.className = 'mh-hub-marker';
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

var _findHubsMarkers = [];

var FIND_HUBS_DEFS = [
  { id:'dtslo',       icon:'🌃', label:'DTSLO',        color:'#ff2d78', fn:'menuHomeRequireAuth()',       coords:[-120.6650,35.2803], glow:'255,45,120'  },
  { id:'restaurants', icon:'🍽',  label:'Restaurants',  color:'#f97316', fn:'menuHomeOpenRestaurantHub()', coords:[-120.6655,35.2808], glow:'249,115,22'  },
  { id:'nature',      icon:'🌿', label:'Nature',        color:'#22c55e', fn:'menuHomeOpenNatureHub()',     coords:[-120.6785,35.2920], glow:'34,197,94'   },
  { id:'thrill',      icon:'⚡', label:'Thrill',        color:'#ef4444', fn:'menuHomeOpenThrillHub()',     coords:[-120.6595,35.2750], glow:'239,68,68'   },
  { id:'beach',       icon:'🏖', label:'Beach',         color:'#06b6d4', fn:'menuHomeOpenBeachHub()',      coords:[-120.6750,35.2680], glow:'6,182,212'   },
  { id:'wine',        icon:'🍷', label:'Wine',          color:'#9b2335', fn:'menuHomeOpenWineHub()',       coords:[-120.8200,35.3600], glow:'155,35,53'   },
  { id:'brewery',     icon:'🍺', label:'Craft Beer',    color:'#f59e0b', fn:'menuHomeOpenBreweryHub()',    coords:[-120.6595,35.2808], glow:'245,158,11'  },
  { id:'events',      icon:'🎭', label:'Events',        color:'#ffd700', fn:'menuHomeOpenEventsHub()',     coords:[-120.6590,35.2820], glow:'255,215,0'   },
  { id:'calpoly',     icon:'🎓', label:'Cal Poly',      color:'#6366f1', fn:'menuHomeOpenCalPolyHub()',    coords:[-120.6540,35.2980], glow:'99,102,241'  },
  { id:'city',        icon:'🏛', label:'City',          color:'#00f5ff', fn:'menuHomeOpenCityHub()',       coords:[-120.6620,35.2790], glow:'0,245,255'   },
];

function findHubs() {
  if (window._findHubsActive) { findHubsDeactivate(); return; }
  findHubsActivate();
}

function findHubsActivate() {
  window._findHubsActive = true;

  var btn = document.getElementById('mh-find-hubs');
  if (btn) { btn.textContent = '✕ Exit'; btn.style.background = 'rgba(255,45,120,0.3)'; btn.style.borderColor = '#ff2d78'; btn.style.color = '#ff2d78'; }
  if (typeof showToast === 'function') showToast('Tap a glowing hub to open it');

  if (!document.getElementById('find-hubs-css')) {
    var s = document.createElement('style');
    s.id = 'find-hubs-css';
    s.textContent = [
      '@keyframes fhpulse{',
        '0%{box-shadow:0 0 0 0 rgba(255,255,255,0.6)}',
        '70%{box-shadow:0 0 0 14px rgba(255,255,255,0)}',
        '100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}',
      '}',
      '.fh-wrap{',
        'position:relative;',
        'width:56px;',
        'display:flex;flex-direction:column;align-items:center;gap:3px;',
        'cursor:pointer;',
        'transform:scale(0);',
        'transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);',
      '}',
      '.fh-dot{',
        'width:52px;height:52px;border-radius:50%;',
        'display:flex;align-items:center;justify-content:center;',
        'font-size:22px;',
        'border:2px solid rgba(255,255,255,0.5);',
        'animation:fhpulse 2s ease-out infinite;',
      '}',
      '.fh-lbl{',
        'font-size:10px;font-weight:800;color:#fff;',
        'background:rgba(0,0,0,0.75);',
        'padding:2px 7px;border-radius:20px;',
        'white-space:nowrap;',
        'border:1px solid rgba(255,255,255,0.15);',
        'max-width:80px;overflow:hidden;text-overflow:ellipsis;',
      '}',
    ].join('');
    document.head.appendChild(s);
  }

  FIND_HUBS_DEFS.forEach(function(h, idx) {
    // Outer wrapper — fixed 56px wide so MapLibre anchors correctly
    var wrap = document.createElement('div');
    wrap.className = 'fh-wrap';

    var dot = document.createElement('div');
    dot.className = 'fh-dot';
    dot.style.background = h.color;
    dot.style.boxShadow = '0 0 18px ' + h.color;
    dot.textContent = h.icon;

    var lbl = document.createElement('div');
    lbl.className = 'fh-lbl';
    lbl.textContent = h.label;

    wrap.appendChild(dot);
    wrap.appendChild(lbl);

    // Capture h for closure
    (function(hub, delay) {
      wrap.addEventListener('click', function() {
        findHubsDeactivate();
        try {
          if (homeMap) {
            var c = homeMap.getCenter();
            window._findHubsUserCenter = [c.lat, c.lng];
          }
        } catch(e) {}
        try { if (homeMap) homeMap.flyTo({ center: hub.coords, zoom: 14.5, duration: 600 }); } catch(e) {}
        setTimeout(function() { try { eval(hub.fn); } catch(e) {} }, 450);
      });

      try {
        var marker = new maplibregl.Marker({ element: wrap, anchor: 'bottom' })
          .setLngLat(hub.coords)
          .addTo(homeMap);
        _findHubsMarkers.push(marker);
      } catch(e) { console.warn('[FindHubs] marker error:', e); }

      // Stagger pop-in — delay captured correctly via IIFE
      setTimeout(function() { wrap.style.transform = 'scale(1)'; }, delay);
    })(h, 60 + idx * 70);
  });
}

function findHubsDeactivate() {
  window._findHubsActive = false;
  var btn = document.getElementById('mh-find-hubs');
  if (btn) { btn.textContent = '📍 Find Hubs'; btn.style.background = 'rgba(8,8,20,0.75)'; btn.style.borderColor = 'rgba(255,255,255,0.15)'; btn.style.color = 'rgba(255,255,255,0.8)'; }
  _findHubsMarkers.forEach(function(m) { try { m.remove(); } catch(e) {} });
  _findHubsMarkers = [];
}
window.findHubsDeactivate = findHubsDeactivate;

function menuHomeReturnToSLO() {
  findHubsDeactivate();
  if (homeMap) homeMap.flyTo({ center: [-120.6650,35.2803], zoom: 13.5, pitch: 55, bearing: -25, duration: 1200 });
}
window.menuHomeReturnToSLO = menuHomeReturnToSLO;

function openTool(id) { if (typeof buildToolSheet === 'function') buildToolSheet(id); }
window.menuHomeOpenTool = openTool;

function travelViewAll(type) { if (type === 'food') { try { menuHomeOpenRestaurantHub(); } catch(e) {} } }
window.menuHomeTravelViewAll = travelViewAll;
function travelBeach() { try { menuHomeOpenBeachHub(); } catch(e) {} }
window.menuHomeTravelBeach = travelBeach;

var _userLocationMarker = null, _userLocationWatcher = null;

function menuHomeToggleLocation() {
  var btn = document.getElementById('mh-location-btn');
  if (_userLocationMarker) {
    _userLocationMarker.remove(); _userLocationMarker = null;
    if (_userLocationWatcher) { navigator.geolocation.clearWatch(_userLocationWatcher); _userLocationWatcher = null; }
    if (btn) { btn.style.background = 'rgba(8,8,20,0.75)'; btn.style.color = 'rgba(255,255,255,0.8)'; btn.textContent = '📍 Me'; }
    return;
  }
  if (!navigator.geolocation) { if (typeof showToast === 'function') showToast('Location not available'); return; }
  if (btn) btn.textContent = '⏳';
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lng = pos.coords.longitude, lat = pos.coords.latitude;
      var el = document.createElement('div');
      el.style.cssText = 'position:relative;width:18px;height:18px';
      el.innerHTML = '<div style="position:absolute;inset:0;border-radius:50%;background:#4A90E2;border:2px solid white;box-shadow:0 0 0 0 rgba(74,144,226,0.4);animation:location-pulse 2s ease-out infinite;z-index:1"></div>' +
        '<div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(74,144,226,0.15);animation:location-ring 2s ease-out infinite"></div>';
      if (!document.getElementById('location-pulse-css')) {
        var s = document.createElement('style'); s.id = 'location-pulse-css';
        s.textContent = '@keyframes location-pulse{0%{box-shadow:0 0 0 0 rgba(74,144,226,0.5)}70%{box-shadow:0 0 0 10px rgba(74,144,226,0)}100%{box-shadow:0 0 0 0 rgba(74,144,226,0)}}@keyframes location-ring{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(1.8);opacity:0}}';
        document.head.appendChild(s);
      }
      try {
        _userLocationMarker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng,lat]).addTo(homeMap);
        homeMap.flyTo({ center: [lng,lat], zoom: 15, duration: 1000 });
        if (btn) { btn.textContent = '📍'; btn.style.background = 'rgba(74,144,226,0.3)'; btn.style.color = '#4A90E2'; }
      } catch(e) {}
      _userLocationWatcher = navigator.geolocation.watchPosition(
        function(p) { if (_userLocationMarker) _userLocationMarker.setLngLat([p.coords.longitude, p.coords.latitude]); },
        null, { enableHighAccuracy: true, maximumAge: 5000 }
      );
    },
    function() { if (btn) btn.textContent = '📍 Me'; if (typeof showToast === 'function') showToast('Location access denied'); },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}
window.menuHomeToggleLocation = menuHomeToggleLocation;

function injectHTML() {
  if (document.getElementById('menu-home')) return;
  var div = document.createElement('div');
  div.id = 'menu-home';
  var dev = localStorage.getItem('dtslo_dev_mode') === '1';
  div.innerHTML = [
    '<div id="mh-map"></div>',
    '<div id="mh-map-overlay"></div>',
    '<div id="mh-header"><div id="mh-logo">MENU</div><div id="mh-city">San Luis Obispo</div></div>',
    '<button id="mh-find-hubs" onclick="menuHomeFindHubs()">📍 Find Hubs</button>',
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

    dev ? [
      '<div id="mh-drawer-dev" class="mh-drawer">',
        '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
        '<div class="mh-drawer-title">🐛 Dev Tools</div>',
        '<div id="mh-dev-coords" style="font-size:10px;color:#b44fff;font-family:monospace;margin-bottom:12px"></div>',

        '<div class="mh-section-label">🗺 MAP EFFECTS</div>',
        '<div class="mh-tools-grid" style="margin-bottom:12px">',
          '<button class="mh-tool-btn" id="dev-pulse-btn" onclick="devTogglePulse()"><div class="mh-tool-icon">💥</div><div>Pulsing Rings</div></button>',
          '<button class="mh-tool-btn" id="dev-tour-btn" onclick="devToggleTour()"><div class="mh-tool-icon">🌀</div><div>Camera Tour</div></button>',
        '</div>',

        '<div class="mh-section-label">🧪 APP</div>',
        '<div class="mh-tools-grid">',
          '<button class="mh-tool-btn" onclick="menuHomeEnterDTSLO()"><div class="mh-tool-icon">→</div><div>Skip to DTSLO</div></button>',
          '<button class="mh-tool-btn" onclick="devResetMap()"><div class="mh-tool-icon">🔄</div><div>Reset Map</div></button>',
        '</div>',
      '</div>'
    ].join('') : '',

    // TOOLBAR
    '<div id="mh-toolbar">',
      '<button class="mh-tab" id="mh-tab-hubs"   onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="hubs"><span class="mh-tab-icon">🌐</span><span class="mh-tab-label">Hubs</span></button>',
      '<button class="mh-tab" id="mh-tab-tools"  onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="tools"><span class="mh-tab-icon">⚡</span><span class="mh-tab-label">Tools</span></button>',
      '<button class="mh-tab" id="mh-tab-travel" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="travel"><span class="mh-tab-icon">🗺</span><span class="mh-tab-label">Travel</span></button>',
      dev ? '<button class="mh-tab" id="mh-tab-dev" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="dev"><span class="mh-tab-icon">🐛</span><span class="mh-tab-label">Dev</span></button>' : '',
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
  if (dev) setInterval(function() {
    var el = document.getElementById('mh-dev-coords');
    if (el && homeMap) { var c = homeMap.getCenter(); el.textContent = 'Center: ' + c.lat.toFixed(4) + ', ' + c.lng.toFixed(4); }
  }, 500);
}

// Small helpers to keep injectHTML readable
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
    '#mh-find-hubs{position:absolute;top:120px;right:16px;z-index:10;background:rgba(8,8,20,0.75);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);padding:7px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;backdrop-filter:blur(8px);font-family:Helvetica Neue,sans-serif;transition:all 0.2s}',
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

// ── DEV MAP EFFECTS ──
var _devPulseActive = false;
var _devPulseInterval = null;
var _devTourActive = false;

function devTogglePulse() {
  var btn = document.getElementById('dev-pulse-btn');
  if (_devPulseActive) {
    // Turn off
    _devPulseActive = false;
    if (_devPulseInterval) { clearInterval(_devPulseInterval); _devPulseInterval = null; }
    if (homeMap) {
      try { if (homeMap.getLayer('dev-pulse')) homeMap.removeLayer('dev-pulse'); } catch(e) {}
      try { if (homeMap.getLayer('dev-pulse-core')) homeMap.removeLayer('dev-pulse-core'); } catch(e) {}
      try { if (homeMap.getSource('dev-pulse-src')) homeMap.removeSource('dev-pulse-src'); } catch(e) {}
    }
    if (btn) { btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }
    return;
  }

  _devPulseActive = true;
  if (btn) { btn.style.background = 'rgba(255,45,120,0.15)'; btn.style.borderColor = '#ff2d78'; btn.style.color = '#ff2d78'; }

  if (!homeMap) return;

  // Hub coords as GeoJSON
  var features = [
    { coords: [-120.6650,35.2803], color: '#ff2d78' },
    { coords: [-120.6655,35.2808], color: '#f97316' },
    { coords: [-120.6750,35.2680], color: '#06b6d4' },
    { coords: [-120.8200,35.3600], color: '#9b2335' },
    { coords: [-120.6595,35.2808], color: '#f59e0b' },
    { coords: [-120.6785,35.2920], color: '#22c55e' },
    { coords: [-120.6595,35.2750], color: '#ef4444' },
    { coords: [-120.6590,35.2820], color: '#ffd700' },
    { coords: [-120.6540,35.2980], color: '#6366f1' },
    { coords: [-120.6620,35.2790], color: '#00f5ff' },
  ].map(function(h) {
    return { type: 'Feature', geometry: { type: 'Point', coordinates: h.coords }, properties: { color: h.color } };
  });

  try {
    homeMap.addSource('dev-pulse-src', { type: 'geojson', data: { type: 'FeatureCollection', features: features } });

    // Outer glow ring
    homeMap.addLayer({ id: 'dev-pulse', type: 'circle', source: 'dev-pulse-src', paint: {
      'circle-radius': 28,
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.2,
      'circle-blur': 0.6,
    }});

    // Solid core
    homeMap.addLayer({ id: 'dev-pulse-core', type: 'circle', source: 'dev-pulse-src', paint: {
      'circle-radius': 14,
      'circle-color': ['get', 'color'],
      'circle-opacity': 0.9,
      'circle-stroke-width': 2,
      'circle-stroke-color': 'rgba(255,255,255,0.5)',
    }});

    // Animate the ring
    var r = 20, growing = true;
    _devPulseInterval = setInterval(function() {
      if (!homeMap || !homeMap.getLayer('dev-pulse')) return;
      r += growing ? 2 : -2;
      if (r > 42) growing = false;
      if (r < 20) growing = true;
      homeMap.setPaintProperty('dev-pulse', 'circle-radius', r);
      homeMap.setPaintProperty('dev-pulse', 'circle-opacity', 0.08 + (r - 20) / 120);
    }, 60);

    homeMap.flyTo({ center: [-120.6650, 35.2803], zoom: 11, pitch: 20, bearing: 0, duration: 800 });
  } catch(e) { console.warn('[devPulse]', e); }
}
window.devTogglePulse = devTogglePulse;

function devToggleTour() {
  var btn = document.getElementById('dev-tour-btn');
  if (_devTourActive) {
    _devTourActive = false;
    if (btn) { btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }
    homeMap && homeMap.stop();
    return;
  }

  _devTourActive = true;
  if (btn) { btn.style.background = 'rgba(99,102,241,0.15)'; btn.style.borderColor = '#6366f1'; btn.style.color = '#a5b4fc'; }

  var stops = [
    { center: [-120.6650,35.2803], zoom: 17,   pitch: 70, bearing: 0,   duration: 1400 },
    { center: [-120.6750,35.2680], zoom: 14.5, pitch: 55, bearing: 90,  duration: 1600 },
    { center: [-120.8200,35.3600], zoom: 11.5, pitch: 40, bearing: -45, duration: 2000 },
    { center: [-120.6540,35.2980], zoom: 15,   pitch: 60, bearing: 180, duration: 1600 },
    { center: [-120.6595,35.2750], zoom: 14,   pitch: 50, bearing: 45,  duration: 1400 },
    { center: [-120.6650,35.2803], zoom: 13,   pitch: 45, bearing: -20, duration: 1400 },
  ];

  var i = 0;
  function next() {
    if (!_devTourActive || i >= stops.length) {
      _devTourActive = false;
      if (btn) { btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }
      return;
    }
    homeMap.flyTo(stops[i++]);
    homeMap.once('moveend', function() { setTimeout(next, 400); });
  }
  next();
}
window.devToggleTour = devToggleTour;

function devResetMap() {
  if (!homeMap) return;
  homeMap.flyTo({ center: [-120.6650, 35.2803], zoom: 14, pitch: 45, bearing: -20, duration: 800 });
}
window.devResetMap = devResetMap;
