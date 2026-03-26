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
  window.menuHomeRequireAuth = function() {
    if (typeof requireAuthForDTSLO === 'function') {
      requireAuthForDTSLO();
    } else {
      enterDTSLO(); // fallback
    }
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
    try { closeToolSheet(); } catch(e) {}

    var entered = false;
    var el = document.getElementById('menu-home');

    function doEnter() {
      if (entered) return;
      entered = true;
      try { cancelHubAnimation(); } catch(e) {}
      if (el) {
        el.style.transition = 'opacity 0.4s ease';
        el.style.opacity = '0';
        setTimeout(function() {
          if (homeMap) { try { homeMap.remove(); } catch(e) {} homeMap = null; }
          revealApp();
        }, 420);
      } else {
        revealApp();
      }
    }

    // Safety timeout
    var safety = setTimeout(doEnter, 4000);

    try {
      // Fly camera toward downtown first, then run building animation
      if (homeMap) {
        homeMap.flyTo({ center: [-120.6650, 35.2803], zoom: 16, pitch: 70, bearing: -15, duration: 800 });
      }
      setTimeout(function() {
        try {
          runHubEntryAnimation('dtslo', function() {
            clearTimeout(safety);
            doEnter();
          });
        } catch(e) {
          clearTimeout(safety);
          doEnter();
        }
      }, 400);
    } catch(e) {
      clearTimeout(safety);
      doEnter();
    }
  }

  function revealApp() {
    // Hide hub screen
    var el = document.getElementById('menu-home');
    if (el) {
      el.style.display = 'none';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '-1';
    }
    // Ensure app is visible and interactive
    var app = document.getElementById('app');
    if (app) {
      app.style.display = 'block';
      app.style.pointerEvents = 'auto';
      app.style.zIndex = '1';
      app.style.opacity = '1';
    }
    // Force show the active page
    var activePage = document.querySelector('.page.active');
    if (!activePage) {
      var linePage = document.getElementById('line');
      if (linePage) {
        linePage.classList.add('active');
        if (typeof loadReports === 'function') loadReports();
      }
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

  // ── DRAWER ──
  function openDrawer(id) {
    if (id === 'travel') { setTimeout(function() { try { menuHomeTravelLoadVenues(); } catch(e) {} }, 100); }
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


  function hubPreview(id) {
    // Beach hub is live — open beach selector instead of coming soon
    if (id === 'beach') { openBeachHub(); return; }
    if (id === 'restaurant') { openRestaurantHub(); return; }
    var hubs = {
      beach: {
        name: 'Beach Hub', emoji: '🏖', color: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
        tagline: 'Surf conditions, beach cams, coastal trails and more',
        features: ['🌊 Live surf cams & conditions','🚗 Beach traffic & parking','🥾 Coastal hiking trails','🏄 Rental & activity bookings','📍 Beach geo caches','🌅 Sunset alerts'],
        suggestions: ['Surf conditions','Beach parking','Rentals','Events','Tide charts','Other'],
        isLive: true
      },
      calpoly: {
        name: 'Cal Poly Hub', emoji: '🎓', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        tagline: 'Campus life, events, sports and student resources',
        features: ['🏈 Mustang sports & tickets','📅 Campus events calendar','🍕 Dining & late night food','🎭 Performing Arts Center','📚 Study spots & library','🎓 Campus tours'],
        suggestions: ['Sports & events','Dining','Study spots','Campus map','Student deals','Other']
      },
      city: {
        name: 'City Hub', emoji: '🏛', color: 'linear-gradient(135deg,#00f5ff,#00ff88)',
        tagline: 'Community marketplace, civic events and local services',
        features: ['🛒 Local marketplace','💼 Gig work & odd jobs','📅 City events & permits','🌳 Parks & recreation','🗳 Community board','🤝 Volunteer opportunities'],
        suggestions: ['Marketplace','Gig work','City events','Parks','Community board','Other']
      }
    };
    var hub = hubs[id];
    if (!hub) return;

    var existing = document.getElementById('mh-hub-preview');
    if (existing) existing.remove();

    var selectedTags = [];

    var sheet = document.createElement('div');
    sheet.id = 'mh-hub-preview';
    sheet.innerHTML = [
      '<div id="mh-hub-preview-inner">',
        '<div class="mh-sheet-handle" id="mh-preview-handle"></div>',
        '<div style="width:56px;height:56px;border-radius:16px;background:' + hub.color + ';display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">' + hub.emoji + '</div>',
        '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:6px">' + hub.name + '</div>',
        '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:16px;line-height:1.5">' + hub.tagline + '</div>',
        '<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">COMING SOON</div>',
        hub.features.map(function(f) {
          return '<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:rgba(255,255,255,0.7)">' + f + '</div>';
        }).join(''),
        // Suggestion section
        '<div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">',
          '<div style="font-size:13px;font-weight:800;margin-bottom:4px">💬 What do YOU want to see?</div>',
          '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:12px">Your input shapes what we build first</div>',
          '<div id="mh-suggestion-tags" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">',
            hub.suggestions.map(function(s) {
              return '<div class="mh-suggestion-tag" data-tag="' + s + '" onclick="menuHomeToggleSuggestionTag(this)">' + s + '</div>';
            }).join(''),
          '</div>',
          '<textarea id="mh-suggestion-text" placeholder="What would you love to see here..." style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:white;font-size:13px;font-family:Helvetica Neue,sans-serif;resize:none;height:80px;outline:none"></textarea>',
          '<button id="mh-suggestion-submit" onclick="menuHomeSubmitSuggestion(this.dataset.hub)" data-hub="' + id + '" style="width:100%;margin-top:10px;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05));color:white;font-size:14px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">Send Feedback →</button>',
          '<div id="mh-suggestion-thanks" style="display:none;text-align:center;padding:12px;font-size:13px;color:#22c55e;font-weight:700">✅ Thanks! Your input helps us build better.</div>',
        '</div>',
        '<button id="mh-preview-close-btn" style="width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>',
      '</div>',
    ].join('');

    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() {
      sheet.classList.add('show');
      var handle = document.getElementById('mh-preview-handle');
      var closeBtn = document.getElementById('mh-preview-close-btn');
      var closeSheet = function() { sheet.remove(); };
      if (handle) handle.addEventListener('click', closeSheet);
      if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    }, 50);
  }

  window.menuHomeHubPreview = hubPreview;
  function toggleSuggestionTag(el) {
    el.classList.toggle('mh-suggestion-tag-sel');
  }
  window.menuHomeToggleSuggestionTag = toggleSuggestionTag;

  async function submitSuggestion(hubId) {
    var tags = [];
    document.querySelectorAll('.mh-suggestion-tag-sel').forEach(function(t) {
      tags.push(t.dataset.tag);
    });
    var text = document.getElementById('mh-suggestion-text');
    var textVal = text ? text.value.trim() : '';
    var submitBtn = document.getElementById('mh-suggestion-submit');
    var thanks = document.getElementById('mh-suggestion-thanks');

    if (!tags.length && !textVal) {
      text.style.borderColor = 'rgba(255,45,120,0.5)';
      setTimeout(function() { text.style.borderColor = 'rgba(255,255,255,0.1)'; }, 1500);
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitBtn) submitBtn.textContent = 'Sending...';

    try {
      var payload = {
        hub_id: hubId,
        tags: tags,
        suggestion: textVal,
        created_at: new Date().toISOString()
      };

      // Try Supabase insert
      if (window.supabaseClient) {
        await window.supabaseClient.from('hub_suggestions').insert([payload]);
      }

      if (submitBtn) submitBtn.style.display = 'none';
      if (thanks) thanks.style.display = 'block';
      // Clear tags
      document.querySelectorAll('.mh-suggestion-tag-sel').forEach(function(t) {
        t.classList.remove('mh-suggestion-tag-sel');
      });
      if (text) text.value = '';
    } catch(e) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Feedback →'; }
      console.warn('[Suggestion]', e);
    }
  }
  window.menuHomeSubmitSuggestion = submitSuggestion;



  function closeThenShowPlanIt() {
    closeDrawer();
    // Plan It will be wired in next build
    setTimeout(function() {
      if (typeof revealApp === 'function') revealApp();
    }, 300);
  }
  window.menuHomeCloseThenShowPlanIt = closeThenShowPlanIt;



  // ══════════════════════════════════════════════


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
    { coords: [-120.6650, 35.2803], icon: '🌃', label: 'DTSLO',        sub: 'Nightlife',      color: 'linear-gradient(135deg,#ff2d78,#b44fff)', active: true,  onclick: 'menuHomeRequireAuth()' },
    { coords: [-120.6655, 35.2808], icon: '🍽',  label: 'Restaurants',  sub: 'Browse & dine',  color: 'linear-gradient(135deg,#ff6b35,#ef4444)', active: true,  onclick: 'menuHomeOpenRestaurantHub()' },
    { coords: [-120.6750, 35.2680], icon: '🏖',  label: 'Beach Hub',    sub: '8 beaches',      color: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', active: true,  onclick: 'menuHomeOpenBeachHub()' },
    { coords: [-120.8200, 35.3600], icon: '🍷',  label: 'Wine Country', sub: 'Paso & SLO wine', color: 'linear-gradient(135deg,#7c2d8e,#b44fff)', active: true,  onclick: 'menuHomeOpenWineHub()' },
    { coords: [-120.6590, 35.2820], icon: '🎭',  label: 'Events',       sub: 'Coming Soon',    color: 'linear-gradient(135deg,#ffd700,#ff9500)', active: false },
    { coords: [-120.6540, 35.2980], icon: '🎓',  label: 'Cal Poly',     sub: 'Coming Soon',    color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', active: false },
    { coords: [-120.6580, 35.2760], icon: '🛒',  label: 'Shopping',     sub: 'Coming Soon',    color: 'linear-gradient(135deg,#22c55e,#16a34a)', active: false },
    { coords: [-120.6620, 35.2790], icon: '🏛',  label: 'City Hub',     sub: 'Coming Soon',    color: 'linear-gradient(135deg,#00f5ff,#00ff88)', active: false },
  ];

  hubs.forEach(function(hub) {
    var el = document.createElement('div');
    el.className = 'mh-hub-marker';
    el.innerHTML = [
      '<div class="mh-hub-pin' + (hub.active ? ' mh-hub-active' : ' mh-hub-dim') + '"',
        hub.active && hub.onclick ? ' onclick="' + hub.onclick + '"' : '',
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

})();
