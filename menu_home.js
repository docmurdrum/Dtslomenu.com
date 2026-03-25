// ══════════════════════════════════════════════
// MENU_HOME.JS — Hub Selection Screen
// Self-contained. Injected by JS.
// ══════════════════════════════════════════════

(function() {

  var MAPTILER_KEY = 'kiFBCC0bWlsukNO2sHf7';
  var homeMap      = null;
  var homeDone     = false;

  // ── PUBLIC API ──
  window.menuHomeInit        = init;
  window.menuHomeEnterDTSLO  = enterDTSLO;
  window.menuHomeSkipToggle  = skipToggle;
  window.menuHomePromptYes   = promptYes;
  window.menuHomePromptNo    = promptNo;

  function init() {
    try {
      // Increment open count
      var count = parseInt(localStorage.getItem('menu_open_count') || '0') + 1;
      localStorage.setItem('menu_open_count', count);

      // Check skip preference
      if (localStorage.getItem('menu_skip_to_dtslo') === '1') {
        revealApp();
        return;
      }

      injectCSS();
      injectHTML();

      var el = document.getElementById('menu-home');
      if (!el) { revealApp(); return; }

      el.style.display = 'block';
      loadHomeMap();

      // Show second-open prompt
      if (count === 2) {
        setTimeout(showSkipPrompt, 3000);
      }

    } catch(e) {
      console.warn('[MenuHome] init error:', e);
      revealApp();
    }
  }

  function enterDTSLO() {
    try {
      var el = document.getElementById('menu-home');
      if (el) {
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity = '0';
        setTimeout(function() {
          el.style.display = 'none';
          if (homeMap) { try { homeMap.remove(); } catch(e) {} homeMap = null; }
          revealApp();
        }, 520);
      } else {
        revealApp();
      }
    } catch(e) {
      revealApp();
    }
  }

  function revealApp() {
    // App is already loaded behind the overlay — just make sure it's visible
    var app = document.getElementById('app');
    var auth = document.getElementById('auth-screen');
    // Don't touch app visibility — auth.js handles that
    // Just make sure menu-home is gone
    var el = document.getElementById('menu-home');
    if (el) el.style.display = 'none';
  }

  function skipToggle(on) {
    localStorage.setItem('menu_skip_to_dtslo', on ? '1' : '0');
  }

  function showSkipPrompt() {
    var prompt = document.getElementById('mh-skip-prompt');
    if (prompt) {
      prompt.style.display = 'flex';
      setTimeout(function() { prompt.style.opacity = '1'; }, 50);
    }
  }

  function promptYes() {
    localStorage.setItem('menu_skip_to_dtslo', '1');
    // Update profile toggle if it exists
    var tog = document.getElementById('pref-skip-to-dtslo');
    if (tog) tog.checked = true;
    hidePrompt();
  }

  function promptNo() {
    localStorage.setItem('menu_skip_to_dtslo', '0');
    hidePrompt();
  }

  function hidePrompt() {
    var prompt = document.getElementById('mh-skip-prompt');
    if (prompt) {
      prompt.style.opacity = '0';
      setTimeout(function() { prompt.style.display = 'none'; }, 350);
    }
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
      zoom:             14.5,
      pitch:            62,
      bearing:          -25,
      antialias:        true,
      attributionControl: false
    });

    homeMap.on('load', function() {
      try {
        // 3D buildings
        var style  = homeMap.getStyle();
        var layers = style && style.layers ? style.layers : [];
        var labelLayer = null;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
            labelLayer = layers[i].id; break;
          }
        }
        homeMap.addLayer({
          id: 'mh-3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['get', 'render_height'],
              0, '#111827', 15, '#1a2540', 40, '#1e3060', 80, '#243570'
            ],
            'fill-extrusion-height':  ['interpolate', ['linear'], ['zoom'], 13, 0, 14, ['get', 'render_height']],
            'fill-extrusion-base':    ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.85
          }
        }, labelLayer || undefined);
      } catch(e) {}

      // Hub markers
      try { addHubMarkers(); } catch(e) {}

      // Slow rotation
      try {
        var bearing = -25;
        var rot = function() {
          if (!homeMap) return;
          bearing += 0.02;
          try { homeMap.setBearing(bearing); } catch(e) { return; }
          requestAnimationFrame(rot);
        };
        setTimeout(rot, 500);
      } catch(e) {}

      // Fade in map
      var overlay = document.getElementById('mh-map-overlay');
      if (overlay) overlay.style.opacity = '0';
    });

    homeMap.on('error', function() {});
  }

  function addHubMarkers() {
    var hubs = [
      {
        coords: [-120.6650, 35.2803],
        icon: '🌃', label: 'DTSLO', sub: 'Nightlife',
        color: 'linear-gradient(135deg,#ff2d78,#b44fff)',
        active: true,
        onclick: 'menuHomeEnterDTSLO()'
      },
      {
        coords: [-120.6750, 35.2680],
        icon: '🏖', label: 'Beach Hub', sub: 'Coming Soon',
        color: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
        active: false
      },
      {
        coords: [-120.6590, 35.3000],
        icon: '🎓', label: 'Cal Poly', sub: 'Coming Soon',
        color: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        active: false
      },
      {
        coords: [-120.6600, 35.2850],
        icon: '🏛', label: 'City Hub', sub: 'Coming Soon',
        color: 'linear-gradient(135deg,#00f5ff,#00ff88)',
        active: false
      },
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
          '<div class="mh-hub-sub">' + hub.sub + '</div>',
          hub.active ? '<div class="mh-hub-enter">Tap to Enter →</div>' : '',
        '</div>'
      ].join('');
      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(hub.coords)
        .addTo(homeMap);
    });
  }

  // ── INJECT HTML ──
  function injectHTML() {
    if (document.getElementById('menu-home')) return;
    var div = document.createElement('div');
    div.id = 'menu-home';
    div.innerHTML = [
      '<div id="mh-map"></div>',
      '<div id="mh-map-overlay"></div>',

      // Header
      '<div id="mh-header">',
        '<div id="mh-logo">MENU</div>',
        '<div id="mh-city">San Luis Obispo</div>',
      '</div>',

      // Hint
      '<div id="mh-hint">Select a hub to get started</div>',

      // Second-open skip prompt
      '<div id="mh-skip-prompt">',
        '<div id="mh-skip-sheet">',
          '<div class="mh-sheet-handle"></div>',
          '<div id="mh-skip-title">Go straight to DTSLO?</div>',
          '<div id="mh-skip-body">Skip the hub screen on future opens. You can change this in your profile settings anytime.</div>',
          '<button class="mh-skip-btn mh-skip-yes" onclick="menuHomePromptYes()">Yes, go straight to DTSLO</button>',
          '<button class="mh-skip-btn mh-skip-no"  onclick="menuHomePromptNo()">No, show me the hub screen</button>',
        '</div>',
      '</div>',

    ].join('');
    document.body.insertBefore(div, document.body.firstChild);
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
      '#mh-logo{font-family:Georgia,serif;font-size:32px;font-weight:700;color:#fff;letter-spacing:-1px;text-shadow:0 2px 16px rgba(0,0,0,0.6)}',
      '#mh-city{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-top:4px;font-family:Helvetica Neue,sans-serif}',

      // Hint
      '#mh-hint{position:absolute;bottom:120px;left:0;right:0;z-index:10;text-align:center;font-size:12px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif;letter-spacing:1px;pointer-events:none}',

      // Hub markers
      '.mh-hub-marker{background:none;border:none}',
      '.mh-hub-pin{display:flex;flex-direction:column;align-items:center;transition:transform 0.2s}',
      '.mh-hub-active{cursor:pointer}',
      '.mh-hub-active:active{transform:scale(0.95)}',
      '.mh-hub-dim{opacity:0.35;cursor:default}',
      '.mh-hub-dot{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.25);box-shadow:0 4px 24px rgba(0,0,0,0.5)}',
      '.mh-hub-active .mh-hub-dot{animation:mh-float 3s ease-in-out infinite;box-shadow:0 4px 24px rgba(0,0,0,0.5),0 0 30px rgba(255,45,120,0.3)}',
      '@keyframes mh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
      '.mh-hub-icon{font-size:24px}',
      '.mh-hub-label{margin-top:5px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,0.8);font-family:Helvetica Neue,sans-serif;white-space:nowrap}',
      '.mh-hub-sub{font-size:9px;color:rgba(255,255,255,0.5);font-family:Helvetica Neue,sans-serif;margin-top:1px;white-space:nowrap}',
      '.mh-hub-enter{font-size:10px;color:#ffd700;font-family:Helvetica Neue,sans-serif;font-weight:700;margin-top:3px;white-space:nowrap}',

      // Skip prompt
      '#mh-skip-prompt{position:absolute;inset:0;z-index:20;background:rgba(0,0,0,0.6);display:none;align-items:flex-end;justify-content:center;opacity:0;transition:opacity 0.35s ease;backdrop-filter:blur(4px)}',
      '#mh-skip-sheet{width:100%;background:rgba(8,8,20,0.97);border-radius:24px 24px 0 0;padding:20px 24px 52px;border-top:1px solid rgba(255,255,255,0.08)}',
      '.mh-sheet-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 20px}',
      '#mh-skip-title{font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;font-family:Georgia,serif}',
      '#mh-skip-body{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:24px;line-height:1.6;font-family:Helvetica Neue,sans-serif}',
      '.mh-skip-btn{width:100%;padding:15px;border-radius:14px;border:none;font-size:15px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer;margin-bottom:10px;transition:transform 0.15s}',
      '.mh-skip-btn:active{transform:scale(0.98)}',
      '.mh-skip-yes{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000}',
      '.mh-skip-no{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.1)!important}',
    ].join('');
    document.head.appendChild(s);
  }

})();
