// ══════════════════════════════════════════════
// MENU_HOME.JS — Hub Selection Screen v2
// Interactive 3D map with bottom toolbar
// ══════════════════════════════════════════════

(function() {

  var MAPTILER_KEY = 'kiFBCC0bWlsukNO2sHf7';
  var homeMap      = null;
  var homeDone     = false;
  var activeDrawer = null;

  // ── PUBLIC API ──
  window.menuHomeInit        = init;
  window.menuHomeEnterDTSLO  = enterDTSLO;
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
        revealApp(); return;
      }

      injectCSS();
      injectHTML();

      var el = document.getElementById('menu-home');
      if (!el) { revealApp(); return; }
      el.style.display = 'block';
      loadHomeMap();

      if (count === 2) setTimeout(showSkipPrompt, 4000);
    } catch(e) {
      console.warn('[MenuHome]', e);
      revealApp();
    }
  }

  function enterDTSLO() {
    closeDrawer();
    var el = document.getElementById('menu-home');
    if (el) {
      el.style.transition = 'opacity 0.5s ease';
      el.style.opacity = '0';
      setTimeout(function() {
        el.style.display = 'none';
        if (homeMap) { try { homeMap.remove(); } catch(e) {} homeMap = null; }
        revealApp();
      }, 520);
    } else { revealApp(); }
  }

  function revealApp() {
    var el = document.getElementById('menu-home');
    if (el) el.style.display = 'none';
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

  // ── DRAWER ──
  function openDrawer(id) {
    // Close any open drawer first
    ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools','mh-drawer-dev'].forEach(function(d) {
      var el = document.getElementById(d);
      if (el) el.classList.remove('mh-drawer-open');
    });
    ['mh-tab-hubs','mh-tab-travel','mh-tab-tools','mh-tab-dev'].forEach(function(t) {
      var el = document.getElementById(t);
      if (el) el.classList.remove('mh-tab-active');
    });

    if (activeDrawer === id) {
      activeDrawer = null;
      return;
    }
    activeDrawer = id;
    var drawer = document.getElementById('mh-drawer-' + id);
    var tab    = document.getElementById('mh-tab-' + id);
    if (drawer) drawer.classList.add('mh-drawer-open');
    if (tab)    tab.classList.add('mh-tab-active');
  }

  function closeDrawer() {
    ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools','mh-drawer-dev'].forEach(function(d) {
      var el = document.getElementById(d);
      if (el) el.classList.remove('mh-drawer-open');
    });
    ['mh-tab-hubs','mh-tab-travel','mh-tab-tools','mh-tab-dev'].forEach(function(t) {
      var el = document.getElementById(t);
      if (el) el.classList.remove('mh-tab-active');
    });
    activeDrawer = null;
  }

  function findHubs() {
    if (homeMap) homeMap.flyTo({ center: [-120.6650, 35.2803], zoom: 14.5, pitch: 62, bearing: -25, duration: 1000 });
  }

  // ── MAP ──
  function loadHomeMap() {
    if (!window.maplibregl) return;
    var container = document.getElementById('mh-map');
    if (!container) return;

    homeMap = new maplibregl.Map({
      container:        'mh-map',
      style:            'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=' + MAPTILER_KEY,
      center:           [-120.6650, 35.2803],
      zoom:             15,
      pitch:            62,
      bearing:          -25,
      antialias:        true,
      attributionControl: false,
      // Enable user interaction
      scrollZoom:       true,
      boxZoom:          true,
      dragRotate:       true,
      dragPan:          true,
      touchZoomRotate:  true,
      touchPitch:       true,
      doubleClickZoom:  true,
    });

    // Add navigation control
    homeMap.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'top-right');

    homeMap.on('load', function() {
      // Find first symbol layer for building insertion
      var style  = homeMap.getStyle();
      var layers = style && style.layers ? style.layers : [];
      var labelLayer = null;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') { labelLayer = layers[i].id; break; }
      }

      // Check available sources for buildings
      var sources = style.sources || {};
      var buildingSource = null;
      var buildingLayer  = 'building';
      if (sources['openmaptiles'])  buildingSource = 'openmaptiles';
      else if (sources['maptiler_planet']) { buildingSource = 'maptiler_planet'; }
      else {
        // Find any source with building layer
        Object.keys(sources).forEach(function(src) { if (!buildingSource) buildingSource = src; });
      }

      // Add 3D buildings
      if (buildingSource) {
        try {
          homeMap.addLayer({
            id: 'mh-3d-buildings',
            source: buildingSource,
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': [
                'interpolate', ['linear'], ['get', 'render_height'],
                0, '#111827', 15, '#1a2a45', 40, '#1e3060', 80, '#243570'
              ],
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                13, 0, 14.5, ['get', 'render_height']
              ],
              'fill-extrusion-base':    ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.85
            }
          }, labelLayer || undefined);
        } catch(e) { console.warn('[3D buildings]', e); }
      }

      // Hub markers
      try { addHubMarkers(); } catch(e) {}

      // Slow auto-rotation (stops when user interacts)
      var bearing = -25;
      var rotating = true;
      homeMap.on('mousedown', function() { rotating = false; });
      homeMap.on('touchstart', function() { rotating = false; });
      var rot = function() {
        if (!rotating || !homeMap) return;
        bearing += 0.015;
        try { homeMap.setBearing(bearing); } catch(e) { return; }
        requestAnimationFrame(rot);
      };
      setTimeout(rot, 800);

      // Fade map in
      var overlay = document.getElementById('mh-map-overlay');
      if (overlay) overlay.style.opacity = '0';
    });

    homeMap.on('error', function(e) { console.warn('[Map error]', e); });
  }

  function addHubMarkers() {
    var hubs = [
      { coords: [-120.6650, 35.2803], icon: '🌃', label: 'DTSLO',        sub: 'Nightlife',   color: 'linear-gradient(135deg,#ff2d78,#b44fff)', active: true,  onclick: 'menuHomeEnterDTSLO()' },
      { coords: [-120.6750, 35.2680], icon: '🏖',  label: 'Beach Hub',    sub: 'Coming Soon', color: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', active: false },
      { coords: [-120.6540, 35.2980], icon: '🎓', label: 'Cal Poly',      sub: 'Coming Soon', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', active: false },
      { coords: [-120.6590, 35.2840], icon: '🏛',  label: 'City Hub',     sub: 'Coming Soon', color: 'linear-gradient(135deg,#00f5ff,#00ff88)', active: false },
    ];

    hubs.forEach(function(hub) {
      var el = document.createElement('div');
      el.className = 'mh-hub-marker';
      el.innerHTML = [
        '<div class="mh-hub-pin' + (hub.active ? ' mh-hub-active' : ' mh-hub-dim') + '"',
          hub.active ? ' onclick="' + hub.onclick + '"' : '',
          '>',
          '<div class="mh-hub-dot" style="background:' + hub.color + '">',
            '<span class="mh-hub-icon">' + hub.icon + '</span>',
          '</div>',
          '<div class="mh-hub-label">' + hub.label + '</div>',
          hub.active ? '<div class="mh-hub-enter">Tap to Enter →</div>' : '<div class="mh-hub-sub">' + hub.sub + '</div>',
        '</div>'
      ].join('');
      new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(hub.coords).addTo(homeMap);
    });
  }

  // ── INJECT HTML ──
  function injectHTML() {
    if (document.getElementById('menu-home')) return;
    var div = document.createElement('div');
    div.id = 'menu-home';

    var isDevMode = localStorage.getItem('dtslo_dev_mode') === '1';

    div.innerHTML = [
      '<div id="mh-map"></div>',
      '<div id="mh-map-overlay"></div>',

      // Header
      '<div id="mh-header">',
        '<div id="mh-logo">MENU</div>',
        '<div id="mh-city">San Luis Obispo</div>',
      '</div>',

      // Find hubs button
      '<button id="mh-find-hubs" onclick="menuHomeFindHubs()">📍 Find Hubs</button>',

      // Drawers
      '<div id="mh-drawer-hubs" class="mh-drawer">',
        '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
        '<div class="mh-drawer-title">Hubs</div>',
        '<div class="mh-hub-cards">',
          '<div class="mh-hub-card mh-hub-card-active" onclick="menuHomeEnterDTSLO()">',
            '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#ff2d78,#b44fff)">🌃</div>',
            '<div class="mh-hub-card-info"><div class="mh-hub-card-name">DTSLO</div><div class="mh-hub-card-sub">Nightlife · Active</div></div>',
            '<div class="mh-hub-card-arrow">→</div>',
          '</div>',
          '<div class="mh-hub-card mh-hub-card-soon">',
            '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#06b6d4,#0ea5e9);opacity:0.4">🏖</div>',
            '<div class="mh-hub-card-info"><div class="mh-hub-card-name">Beach Hub</div><div class="mh-hub-card-sub">Coming Soon</div></div>',
          '</div>',
          '<div class="mh-hub-card mh-hub-card-soon">',
            '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);opacity:0.4">🎓</div>',
            '<div class="mh-hub-card-info"><div class="mh-hub-card-name">Cal Poly</div><div class="mh-hub-card-sub">Coming Soon</div></div>',
          '</div>',
          '<div class="mh-hub-card mh-hub-card-soon">',
            '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#00f5ff,#00ff88);opacity:0.4">🏛</div>',
            '<div class="mh-hub-card-info"><div class="mh-hub-card-name">City Hub</div><div class="mh-hub-card-sub">Coming Soon</div></div>',
          '</div>',
        '</div>',
      '</div>',

      '<div id="mh-drawer-travel" class="mh-drawer">',
        '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
        '<div class="mh-drawer-title">Travel Guide</div>',
        '<div style="color:rgba(255,255,255,0.4);font-size:13px;padding:8px 0">Your SLO travel companion — coming soon.</div>',
      '</div>',

      '<div id="mh-drawer-tools" class="mh-drawer">',
        '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
        '<div class="mh-drawer-title">Tools</div>',
        '<div class="mh-tools-grid">',
          '<button class="mh-tool-btn" onclick="menuHomeEnterDTSLO()">🚗 Rides</button>',
          '<button class="mh-tool-btn">🏄 Surf</button>',
          '<button class="mh-tool-btn">🌤 Weather</button>',
          '<button class="mh-tool-btn">🏧 ATMs</button>',
        '</div>',
      '</div>',

      isDevMode ? [
        '<div id="mh-drawer-dev" class="mh-drawer">',
          '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
          '<div class="mh-drawer-title">🐛 Dev Tools</div>',
          '<div style="color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:12px">Map Position</div>',
          '<div id="mh-dev-coords" style="font-size:10px;color:#b44fff;font-family:monospace;margin-bottom:12px"></div>',
          '<button class="mh-tool-btn" onclick="menuHomeEnterDTSLO()">→ Skip to DTSLO</button>',
        '</div>'
      ].join('') : '',

      // Bottom toolbar
      '<div id="mh-toolbar">',
        '<button class="mh-tab" id="mh-tab-hubs"   onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="hubs">',
          '<span class="mh-tab-icon">🌐</span>',
          '<span class="mh-tab-label">Hubs</span>',
        '</button>',
        '<button class="mh-tab" id="mh-tab-travel" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="travel">',
          '<span class="mh-tab-icon">🗺</span>',
          '<span class="mh-tab-label">Travel</span>',
        '</button>',
        '<button class="mh-tab" id="mh-tab-tools"  onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="tools">',
          '<span class="mh-tab-icon">⚡</span>',
          '<span class="mh-tab-label">Tools</span>',
        '</button>',
        isDevMode ? [
          '<button class="mh-tab" id="mh-tab-dev" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="dev">',
            '<span class="mh-tab-icon">🐛</span>',
            '<span class="mh-tab-label">Dev</span>',
          '</button>'
        ].join('') : '',
      '</div>',

      // Skip prompt
      '<div id="mh-skip-prompt">',
        '<div id="mh-skip-sheet">',
          '<div class="mh-sheet-handle"></div>',
          '<div id="mh-skip-title">Go straight to DTSLO?</div>',
          '<div id="mh-skip-body">Skip the hub screen on future opens. Change this anytime in your profile settings.</div>',
          '<button class="mh-skip-btn mh-skip-yes" onclick="menuHomePromptYes()">Yes, go straight to DTSLO</button>',
          '<button class="mh-skip-btn mh-skip-no"  onclick="menuHomePromptNo()">No, show me the hub screen</button>',
        '</div>',
      '</div>',

    ].join('');
    document.body.insertBefore(div, document.body.firstChild);

    // Update dev coords display
    if (isDevMode && homeMap) {
      setInterval(function() {
        var el = document.getElementById('mh-dev-coords');
        if (el && homeMap) {
          var c = homeMap.getCenter();
          el.textContent = 'Center: ' + c.lat.toFixed(4) + ', ' + c.lng.toFixed(4) +
            '\nZoom: ' + homeMap.getZoom().toFixed(1) +
            '\nPitch: ' + homeMap.getPitch().toFixed(0) +
            '\nBearing: ' + homeMap.getBearing().toFixed(0);
        }
      }, 500);
    }
  }

  // ── INJECT CSS ──
  function injectCSS() {
    if (document.getElementById('mh-css')) return;
    var s = document.createElement('style');
    s.id = 'mh-css';
    s.textContent = [
      '#menu-home{position:fixed;inset:0;z-index:9998;background:#000;display:none}',
      '#mh-map{position:absolute;inset:0}',
      '#mh-map-overlay{position:absolute;inset:0;z-index:2;background:#000;opacity:1;transition:opacity 1.5s ease;pointer-events:none}',

      // Header
      '#mh-header{position:absolute;top:52px;left:0;right:0;z-index:10;text-align:center;pointer-events:none}',
      '#mh-logo{font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-1px;text-shadow:0 2px 20px rgba(0,0,0,0.8)}',
      '#mh-city{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-top:3px;font-family:Helvetica Neue,sans-serif}',

      // Find hubs button
      '#mh-find-hubs{position:absolute;top:120px;right:16px;z-index:10;background:rgba(8,8,20,0.75);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);padding:7px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;backdrop-filter:blur(8px);font-family:Helvetica Neue,sans-serif}',

      // Hub pins on map
      '.mh-hub-marker{background:none;border:none}',
      '.mh-hub-pin{display:flex;flex-direction:column;align-items:center;transition:transform 0.2s}',
      '.mh-hub-active{cursor:pointer}',
      '.mh-hub-active:active{transform:scale(0.95)}',
      '.mh-hub-dim{opacity:0.3;cursor:default}',
      '.mh-hub-dot{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.5)}',
      '.mh-hub-active .mh-hub-dot{animation:mh-float 3s ease-in-out infinite;box-shadow:0 4px 24px rgba(0,0,0,0.5),0 0 30px rgba(255,45,120,0.4)}',
      '@keyframes mh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
      '.mh-hub-icon{font-size:22px}',
      '.mh-hub-label{margin-top:4px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,0.9);white-space:nowrap;font-family:Helvetica Neue,sans-serif}',
      '.mh-hub-sub{font-size:9px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif;white-space:nowrap}',
      '.mh-hub-enter{font-size:9px;color:#ffd700;font-family:Helvetica Neue,sans-serif;font-weight:800;white-space:nowrap}',

      // Bottom toolbar
      '#mh-toolbar{position:absolute;bottom:0;left:0;right:0;z-index:20;display:flex;background:rgba(6,6,15,0.7);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.08);padding:8px 0 28px}',
      '.mh-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;padding:8px 4px;border-radius:12px;transition:all 0.15s;font-family:Helvetica Neue,sans-serif}',
      '.mh-tab-icon{font-size:22px}',
      '.mh-tab-label{font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}',
      '.mh-tab-active{color:#ffd700}',
      '.mh-tab-active .mh-tab-icon{filter:drop-shadow(0 0 6px rgba(255,215,0,0.6))}',

      // Drawers
      '.mh-drawer{position:absolute;bottom:72px;left:0;right:0;z-index:15;background:rgba(6,6,15,0.92);backdrop-filter:blur(24px);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 20px;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);max-height:60vh;overflow-y:auto}',
      '.mh-drawer-open{transform:translateY(0)}',
      '.mh-drawer-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin:0 auto 14px;cursor:pointer}',
      '.mh-drawer-title{font-size:16px;font-weight:800;color:#fff;margin-bottom:14px;font-family:Georgia,serif}',

      // Hub cards in drawer
      '.mh-hub-cards{display:flex;flex-direction:column;gap:8px}',
      '.mh-hub-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.15s}',
      '.mh-hub-card-active{border-color:rgba(255,45,120,0.3);background:rgba(255,45,120,0.06)}',
      '.mh-hub-card-active:active{transform:scale(0.98)}',
      '.mh-hub-card-soon{opacity:0.45;cursor:default}',
      '.mh-hub-card-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}',
      '.mh-hub-card-info{flex:1}',
      '.mh-hub-card-name{font-size:14px;font-weight:800;color:#fff;font-family:Helvetica Neue,sans-serif}',
      '.mh-hub-card-sub{font-size:11px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif}',
      '.mh-hub-card-arrow{font-size:18px;color:#ffd700}',

      // Tools grid
      '.mh-tools-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
      '.mh-tool-btn{padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;transition:all 0.15s;text-align:left}',
      '.mh-tool-btn:active{transform:scale(0.97)}',

      // Skip prompt
      '#mh-skip-prompt{position:absolute;inset:0;z-index:25;background:rgba(0,0,0,0.6);display:none;align-items:flex-end;opacity:0;transition:opacity 0.35s;backdrop-filter:blur(4px)}',
      '#mh-skip-sheet{width:100%;background:rgba(8,8,20,0.97);border-radius:24px 24px 0 0;padding:20px 24px 52px;border-top:1px solid rgba(255,255,255,0.08)}',
      '.mh-sheet-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 20px}',
      '#mh-skip-title{font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;font-family:Georgia,serif}',
      '#mh-skip-body{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:24px;line-height:1.6;font-family:Helvetica Neue,sans-serif}',
      '.mh-skip-btn{width:100%;padding:15px;border-radius:14px;border:none;font-size:15px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer;margin-bottom:10px}',
      '.mh-skip-yes{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000}',
      '.mh-skip-no{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.1)!important}',
    ].join('');
    document.head.appendChild(s);
  }

})();
