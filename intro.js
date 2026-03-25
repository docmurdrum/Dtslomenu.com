// ══════════════════════════════════════════════
// INTRO.JS — MENU Intro Sequence
// Self-contained. No app dependencies.
// ══════════════════════════════════════════════

(function() {

  var MAPTILER_KEY = 'kiFBCC0bWlsukNO2sHf7';
  var introMap     = null;
  var introTimer   = null;
  var introDone    = false;

  // ── PUBLIC API ──
  window.initIntro    = initIntro;
  window.finishIntro  = finishIntro;
  window.skipIntroToggle = skipIntroToggle;

  function initIntro() {
    try {
      // Check skip setting
      if (localStorage.getItem('menu_skip_intro') === '1') return;
      injectHTML();
      injectCSS();
      var el = document.getElementById('menu-intro');
      if (!el) return;
      el.style.display = 'block';
      // Hard timeout safety — always fires
      introTimer = setTimeout(function() { finishIntro(); }, 7000);
      runIntro();
    } catch(e) {
      console.warn('[Intro] init error:', e);
      finishIntro();
    }
  }

  function runIntro() {
    try {
      // Stage 1: wordmark sequence
      after(300,  function() { addClass('mi-logo',  'mi-in'); });
      after(800,  function() { addClass('mi-tag',   'mi-in'); });
      after(1200, function() { addClass('mi-city',  'mi-in'); });

      // Stage 2: start loading map in background at 2s
      after(2000, function() {
        try { loadIntroMap(); } catch(e) {}
      });

      // Stage 3: fade wordmark, reveal map at 2.8s
      after(2800, function() {
        try {
          var wm = document.getElementById('mi-wordmark-stage');
          if (wm) { wm.style.transition = 'opacity 0.8s ease'; wm.style.opacity = '0'; }
          var ms = document.getElementById('mi-map-stage');
          if (ms) { ms.style.opacity = '1'; ms.style.pointerEvents = 'all'; }
        } catch(e) {}
      });

      // Stage 4: reveal map tiles at 3.6s
      after(3600, function() {
        try {
          var ov = document.getElementById('mi-map-overlay');
          if (ov) ov.style.opacity = '0';
          var lg = document.getElementById('mi-map-logo');
          if (lg) lg.style.opacity = '1';
        } catch(e) {}
      });

      // Stage 5: finish at 6s
      after(6000, function() { finishIntro(); });

    } catch(e) {
      console.warn('[Intro] run error:', e);
      finishIntro();
    }
  }

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    if (introTimer) clearTimeout(introTimer);
    try {
      var el = document.getElementById('menu-intro');
      if (el) {
        el.style.transition = 'opacity 0.5s ease';
        el.style.opacity    = '0';
        setTimeout(function() {
          el.style.display = 'none';
          if (introMap) { try { introMap.remove(); } catch(e) {} introMap = null; }
          // Launch hub screen
          try { if (typeof menuHomeInit === 'function') menuHomeInit(); } catch(e) {}
        }, 550);
      }
    } catch(e) {
      var el2 = document.getElementById('menu-intro');
      if (el2) el2.style.display = 'none';
      try { if (typeof menuHomeInit === 'function') menuHomeInit(); } catch(e) {}
    }
  }

  function skipIntroToggle(on) {
    localStorage.setItem('menu_skip_intro', on ? '1' : '0');
  }

  // ── MAP ──
  function loadIntroMap() {
    if (!window.maplibregl) return;
    var container = document.getElementById('mi-map');
    if (!container) return;

    introMap = new maplibregl.Map({
      container:        'mi-map',
      style:            'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=' + MAPTILER_KEY,
      center:           [-120.6650, 35.2803],
      zoom:             15.0,
      pitch:            62,
      bearing:          -25,
      antialias:        true,
      attributionControl: false
    });

    introMap.on('load', function() {
      try {
        // 3D buildings
        var style  = introMap.getStyle();
        var layers = style && style.layers ? style.layers : [];
        var labelLayer = null;
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
            labelLayer = layers[i].id; break;
          }
        }
        introMap.addLayer({
          id: 'mi-3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['get', 'render_height'],
              0, '#111827', 15, '#1a2540', 40, '#1e3060', 80, '#243570'
            ],
            'fill-extrusion-height':  ['get', 'render_height'],
            'fill-extrusion-base':    ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.85
          }
        }, labelLayer || undefined);
      } catch(e) {}

      // Hub markers
      try {
        var hubs = [
          { coords: [-120.6650, 35.2803], icon: '🌃', label: 'DTSLO',    color: 'linear-gradient(135deg,#ff2d78,#b44fff)' },
          { coords: [-120.6620, 35.2840], icon: '🎓', label: 'CAL POLY', color: 'linear-gradient(135deg,#6366f1,#06b6d4)' },
          { coords: [-120.6680, 35.2770], icon: '🏛',  label: 'CITY',     color: 'linear-gradient(135deg,#00f5ff,#00ff88)' },
        ];
        hubs.forEach(function(hub) {
          var el = document.createElement('div');
          el.innerHTML = '<div class="mi-hub-pin"><div class="mi-hub-dot" style="background:' + hub.color + '">' + hub.icon + '</div><div class="mi-hub-lbl">' + hub.label + '</div></div>';
          new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(hub.coords).addTo(introMap);
        });
      } catch(e) {}

      // Slow rotation
      try {
        var bearing = -25;
        var rotating = true;
        var rotate = function() {
          if (!rotating || !introMap) return;
          bearing += 0.03;
          try { introMap.setBearing(bearing); } catch(e) { rotating = false; return; }
          requestAnimationFrame(rotate);
        };
        setTimeout(rotate, 200);
      } catch(e) {}
    });

    introMap.on('error', function() {
      // Map failed — just show dark bg, sequence still completes
    });
  }

  // ── HELPERS ──
  function after(ms, fn) { setTimeout(fn, ms); }

  function addClass(id, cls) {
    var el = document.getElementById(id);
    if (el) el.classList.add(cls);
  }

  // ── INJECT HTML ──
  function injectHTML() {
    if (document.getElementById('menu-intro')) return;
    var div = document.createElement('div');
    div.id = 'menu-intro';
    div.innerHTML = [
      '<div id="mi-wordmark-stage">',
        '<div class="mi-logo" id="mi-logo">MENU</div>',
        '<div class="mi-tag"  id="mi-tag">Your city. Your way.</div>',
        '<div class="mi-city" id="mi-city">San Luis Obispo</div>',
      '</div>',
      '<div id="mi-map-stage">',
        '<div id="mi-map"></div>',
        '<div id="mi-map-overlay"></div>',
        '<div id="mi-map-logo">MENU</div>',
      '</div>',
      '<button id="mi-skip-btn" onclick="finishIntro()">Skip</button>',
    ].join('');
    document.body.insertBefore(div, document.body.firstChild);
  }

  // ── INJECT CSS ──
  function injectCSS() {
    if (document.getElementById('mi-css')) return;
    var s = document.createElement('style');
    s.id  = 'mi-css';
    s.textContent = [
      '#menu-intro{position:fixed;inset:0;z-index:9999;background:#000;font-family:Georgia,serif;display:none}',
      '#mi-wordmark-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}',
      '.mi-logo{font-size:clamp(72px,20vw,120px);font-weight:700;letter-spacing:-4px;color:#fff;opacity:0;transform:translateY(12px);transition:opacity 0.9s ease,transform 0.9s ease}',
      '.mi-logo.mi-in{opacity:1;transform:translateY(0)}',
      '.mi-tag{font-size:12px;letter-spacing:5px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-top:10px;font-family:Helvetica Neue,sans-serif;opacity:0;transition:opacity 0.7s ease}',
      '.mi-tag.mi-in{opacity:1}',
      '.mi-city{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.2);margin-top:6px;font-family:Helvetica Neue,sans-serif;opacity:0;transition:opacity 0.6s ease}',
      '.mi-city.mi-in{opacity:1}',
      '#mi-map-stage{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity 1.2s ease}',
      '#mi-map{position:absolute;inset:0}',
      '#mi-map-overlay{position:absolute;inset:0;z-index:2;background:#000;opacity:1;transition:opacity 2s ease;pointer-events:none}',
      '#mi-map-logo{position:absolute;top:52px;left:0;right:0;z-index:10;text-align:center;font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-1px;text-shadow:0 2px 16px rgba(0,0,0,0.6);opacity:0;transition:opacity 0.6s ease;pointer-events:none}',
      '.mi-hub-pin{display:flex;flex-direction:column;align-items:center;cursor:pointer}',
      '.mi-hub-dot{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid rgba(255,255,255,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:mi-float 3s ease-in-out infinite}',
      '@keyframes mi-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
      '.mi-hub-lbl{margin-top:4px;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,0.8);white-space:nowrap;font-family:Helvetica Neue,sans-serif}',
      '#mi-skip-btn{position:absolute;top:52px;right:20px;z-index:100;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;backdrop-filter:blur(8px)}',
    ].join('');
    document.head.appendChild(s);
  }

})();
