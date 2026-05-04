// ══════════════════════════════════════════════
// MENU_HOME.JS — 3D Ring Hub Home Screen
// Three.js portal ring replaces MapLibre map
// Depends on: three.min.js loaded before this
// ══════════════════════════════════════════════

// ── STUBS expected by hub files and other modules ──
window.hubDeactivateMapMode  = function() {
  var el = document.getElementById('menu-home');
  if (el) {
    el.style.display = 'block';
    el.style.pointerEvents = 'auto';
  }
  // Force-clear flying flag in case hub was closed mid-animation
  if (typeof mhFlying !== 'undefined' && mhFlying) {
    console.warn('[MenuHome] mhFlying was stuck true on hub close — force-resetting');
    mhFlying = false;
  }
  if (typeof menuHome3dReset === 'function') menuHome3dReset();
  console.warn('[MenuHome] hubDeactivateMapMode — hub closed, scene reset');
};
window.menuHomeRequireAuth   = function() {
  if (typeof requireAuthForDTSLO === 'function') requireAuthForDTSLO();
  else if (typeof goToDTSLO      === 'function') goToDTSLO();
};
window.menuHomeOpenDTSLO     = function() { if (typeof goToDTSLO === 'function') goToDTSLO(); };
window.menuHomeOpenBudget       = function() { if (typeof openBudgetSheet   === 'function') openBudgetSheet(); };
window.menuHomeOpenItinerary    = function() { if (typeof openItineraryBuilder === 'function') openItineraryBuilder(itin && itin.current ? itin.current : null, false); };
window.menuHomeOpenLegalHub     = function() { if (typeof openLegalHub === 'function') openLegalHub(); };
window.menuHomeOpenHousingHub   = function() { if (typeof openHousingHub === 'function') openHousingHub(); };
window.menuHomeOpenJobsHub      = function() { if (typeof openJobsHub === 'function') openJobsHub(); };
window.menuHomeOpenBuySellHub   = function() { if (typeof openBuySellHub === 'function') openBuySellHub(); };
window.menuHomeOpenLearnSLO     = function() { if (typeof openLearnSLO === 'function') openLearnSLO(); };
window.menuHomeOpenBucketList   = function() { if (typeof openBucketList === 'function') openBucketList(); };
window.menuHomeOpenHealthHub    = function() { if (typeof openHealthHub === 'function') openHealthHub(); };
window.menuHomeOpenFitnessHub   = function() { if (typeof openFitnessHub === 'function') openFitnessHub(); };
window.menuHomeOpenEmergencyHub = function() { if (typeof openEmergencyHub === 'function') openEmergencyHub(); };
window.menuHomeOpenDayTrips     = function() { if (typeof openDayTrips === 'function') openDayTrips(); };
window.menuHomeOpenShotList     = function() { if (typeof openShotList === 'function') openShotList(); };
window.menuHomeOpenHotelsHub    = function() { if (typeof openHotelsHub === 'function') openHotelsHub(); };
window.menuHomeOpenTransitHub   = function() { if (typeof openTransitHub === 'function') openTransitHub(); };
window.menuHomeOpenSearchHub    = function() { if (typeof openSearchHub === 'function') openSearchHub(); };
window.menuHomeOpenToursHub     = function() { if (typeof openToursHub === 'function') openToursHub(); };
window.menuHomeOpenLineSkip     = function() { if (typeof openLineSkipSheet === 'function') openLineSkipSheet(); };
window.menuHomeToggleLocation   = function() { if (typeof openMapHub === 'function') openMapHub(); };
window.menuHomeOpenTravelPlanIt = function() { if (typeof openTravelPlanIt === 'function') openTravelPlanIt(); };

// ── INIT called by auth.js / intro.js ──
window.menuHomeInit = function() {
  if (!document.getElementById('mh-base-css')) {
    var s = document.createElement('style');
    s.id = 'mh-base-css';
    s.textContent = [
      '#menu-home{position:fixed;inset:0;z-index:9998;background:#000;display:none}',
      '.mh-land-card{background:rgba(255,255,255,0.11);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.18);border-radius:18px;padding:15px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px;cursor:pointer;transform:translateY(-200px);opacity:0;}',
      '.mh-land-card:active{background:rgba(255,255,255,0.18);}',
      '.mh-land-back{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;color:white;flex-shrink:0;}',
      '.mh3d-emoji{position:absolute;transform:translate(-50%,-50%);font-size:26px;line-height:1;pointer-events:none;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.9))}',
      '.mh3d-label{position:absolute;transform:translate(-50%,0);font-family:Helvetica Neue,sans-serif;font-size:10px;font-weight:800;color:rgba(255,255,255,0.85);letter-spacing:0.4px;pointer-events:none;white-space:nowrap;text-align:center;text-shadow:0 1px 6px rgba(0,0,0,1),0 0 12px rgba(0,0,0,1)}',
      '.mh3d-tab{flex:1;padding:9px 4px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.3);font-family:Helvetica Neue,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.5px;text-align:center;cursor:pointer;transition:all 0.2s}',
      '.mh3d-tab.active{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.25);color:white}',
      '.mh3d-tab:active{transform:scale(0.94)}',
    ].join('');
    document.head.appendChild(s);
  }

  if (!document.getElementById('menu-home')) {
    var div = document.createElement('div');
    div.id = 'menu-home';
    document.body.insertBefore(div, document.body.firstChild);
  }

  var container = document.getElementById('menu-home');
  container.style.display = 'block';

  // Init back button handler now that app is ready
  if (typeof backHandlerInit === 'function') backHandlerInit();

  // Defer one rAF so display:block paints and offsetWidth/Height are valid
  requestAnimationFrame(function() {
    if (typeof THREE !== 'undefined') {
      _mhRingInit(container);
    } else {
      var tries = 0;
      var iv = setInterval(function() {
        if (typeof THREE !== 'undefined') { clearInterval(iv); _mhRingInit(container); }
        else if (++tries > 30) { clearInterval(iv); console.warn('[MenuHome] THREE.js not loaded'); }
      }, 100);
    }
  });
};

// ══════════════════════════════════════════════
// 3D RING ENGINE
// ══════════════════════════════════════════════

var MH_TABS = {
  0: [
    { icon:'🌃', name:'DTSLO',        sub:'Nightlife · Bars · Lines',       color:0xff2d78, colorArr:[255,45,120],  onopen:'menuHomeOpenDTSLO()' },
    { icon:'🍽', name:'Restaurants',  sub:'Browse & Dine in SLO',           color:0xff6b35, colorArr:[255,107,53],  onopen:'menuHomeOpenRestaurantHub()' },
    { icon:'🏖', name:'Beach Hub',    sub:'8 Beaches · Surf · Trails',      color:0x06b6d4, colorArr:[6,182,212],   onopen:'menuHomeOpenBeachHub()' },
    { icon:'🍺', name:'Craft Beer',   sub:'9 SLO Breweries',                color:0xf59e0b, colorArr:[245,158,11],  onopen:'menuHomeOpenBreweryHub()' },
    { icon:'🍷', name:'Wine Country', sub:'Paso Robles · Edna Valley',      color:0x7c2d8e, colorArr:[124,45,142],  onopen:'menuHomeOpenWineHub()' },
    { icon:'🌿', name:'Nature',       sub:'Hikes · Parks · Trails',         color:0x22c55e, colorArr:[34,197,94],   onopen:'menuHomeOpenNatureHub()' },
    { icon:'🎭', name:'Events',       sub:'Concerts · Markets · Festivals', color:0xffd700, colorArr:[255,215,0],   onopen:'menuHomeOpenEventsHub()' },
    { icon:'🎓', name:'Cal Poly',     sub:'Campus · Bars · Eats',           color:0x6366f1, colorArr:[99,102,241],  onopen:'menuHomeOpenCalPolyHub()' },
    { icon:'⚡', name:'Thrill',       sub:'Adventure · Zipline · ATV',      color:0xef4444, colorArr:[239,68,68],   onopen:'menuHomeOpenThrillHub()' },
    { icon:'🗺', name:'Explore SLO',  sub:'Landmarks · Culture · Art',      color:0x00f5ff, colorArr:[0,245,255],   onopen:'menuHomeOpenCityHub()' },
  ],
  1: [
    { icon:'🗺', name:'Tours',     sub:'14 self-guided SLO tours',  color:0xffd700, colorArr:[255,215,0],   onopen:'menuHomeOpenToursHub()' },
    { icon:'📚', name:'Learn SLO',  sub:'History · Geology · Culture', color:0x8b5cf6, colorArr:[139,92,246], onopen:'menuHomeOpenLearnSLO()' },
    { icon:'🏆', name:'Bucket List',sub:'100 things to do in SLO',    color:0xffd700, colorArr:[255,215,0],  onopen:'menuHomeOpenBucketList()' },
    { icon:'✨', name:'Plan It',   sub:'AI-powered trip planner',   color:0xb44fff, colorArr:[180,79,255],  onopen:'menuHomeOpenTravelPlanIt()' },
    { icon:'🔍', name:'Search',      sub:'Find anything in SLO',         color:0x00f5ff, colorArr:[0,245,255],   onopen:'menuHomeOpenSearchHub()' },
    { icon:'🗺', name:'Day Trips',   sub:'10 drives from SLO',           color:0xffd700, colorArr:[255,215,0],   onopen:'menuHomeOpenDayTrips()' },
    { icon:'📸', name:'Shot List',   sub:'Best photo spots in SLO',      color:0xec4899, colorArr:[236,72,153],  onopen:'menuHomeOpenShotList()' },
    { icon:'🏨', name:'Hotels',      sub:'Stays · Camping · Glamping',   color:0x8b5cf6, colorArr:[139,92,246],  onopen:'menuHomeOpenHotelsHub()' },
    { icon:'🚌', name:'Transit',     sub:'Bus · Amtrak · Bike · Airport', color:0x06b6d4, colorArr:[6,182,212],  onopen:'menuHomeOpenTransitHub()' },
  ],
  2: [
    { icon:'🏛', name:'Civic Hub',  sub:'Gov · Utilities · Permits',   color:0x6366f1, colorArr:[99,102,241],   onopen:'menuHomeOpenCivicHub()' },
    { icon:'🏠', name:'Housing',    sub:'Rentals · Rooms · Sublets',    color:0x10b981, colorArr:[16,185,129],   onopen:'menuHomeOpenHousingHub()' },
    { icon:'💼', name:'Jobs & Gigs', sub:'Local jobs · Gigs · Internships', color:0x06b6d4, colorArr:[6,182,212], onopen:'menuHomeOpenJobsHub()' },
    { icon:'🛍', name:'Buy & Sell',  sub:'Marketplace · Free stuff',     color:0xec4899, colorArr:[236,72,153],  onopen:'menuHomeOpenBuySellHub()' },
    { icon:'🏃', name:'Fitness',     sub:'Gyms · Trails · Classes',      color:0x22c55e, colorArr:[34,197,94],   onopen:'menuHomeOpenFitnessHub()' },
    { icon:'🚨', name:'Emergency',   sub:'Contacts · Safety · Crisis',    color:0xef4444, colorArr:[239,68,68],   onopen:'menuHomeOpenEmergencyHub()' },
  ],
  3: [
    { icon:'🏥', name:'Health',       sub:'Triage · Appointments · Providers', color:0x10b981, colorArr:[16,185,129], onopen:'menuHomeOpenHealthHub()' },
    { icon:'⚖️', name:'Know Rights', sub:'Laws · Police · SLO Code',    color:0xef4444, colorArr:[239,68,68],   onopen:'menuHomeOpenLegalHub()' },
    { icon:'💰', name:'Budget',    sub:'Track · Goals · SLO Costs', color:0xffd700, colorArr:[255,215,0],   onopen:'menuHomeOpenBudget()' },
    { icon:'🗓', name:'Itinerary', sub:'Plan · Track · Share',       color:0x00f5ff, colorArr:[0,245,255],   onopen:'menuHomeOpenItinerary()' },
    { icon:'⏩', name:'Line Skip', sub:'Skip the wait',             color:0xff2d78, colorArr:[255,45,120],  onopen:'menuHomeOpenLineSkip()' },
  ],
};

var MH_PROFILE_ORDER = {
  local:   [1,2,3,5,6,7,8,9,0,4],
  student: [0,7,2,1,3,5,6,8,9,4],
  tourist: [9,2,1,7,3,5,8,0,6,4],
};

var mhScene, mhCamera, mhRenderer, mhClock;
var mhHubMeshes  = [];
var mhRaycaster, mhMouse;
var mhHovered    = null;
var mhFlying     = false;
var mhTab        = 0;
var mhW, mhH, mhApp, mhCanvas;
var mhCamTarget, mhCamLookAt, mhCamLookAtCur;
var mhReady      = false;
var mhParticles  = null;
var mhRingT      = 0;

function _mhRingInit(container) {
  // On hard refresh: mhReady=false but DOM has stale children from previous session
  // Clear them so we don't double-append canvas/emoji layer/tabs
  if (!mhReady) {
    container.innerHTML = '';
  }

  if (mhReady) {
    container.style.display = 'block';
    // Refresh dimensions in case browser chrome changed
    mhW = container.offsetWidth  || window.innerWidth;
    mhH = container.offsetHeight || window.innerHeight;
    mhRenderer.setSize(mhW, mhH);
    mhCamera.aspect = mhW / mhH;
    mhCamera.updateProjectionMatrix();
    // Reset all stale state synchronously
    mhCanvas.style.transform = '';
    mhFlying  = false;
    mhHovered = null;
    mhResetScene();
    return;
  }
  mhReady = true;
  mhApp   = container;
  mhW     = container.offsetWidth  || window.innerWidth;
  mhH     = container.offsetHeight || window.innerHeight;

  // Canvas — z-index:1, no pointer-events override
  mhCanvas = document.createElement('canvas');
  mhCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;';
  container.appendChild(mhCanvas);

  // Logo header — pointer-events:none
  var logoEl = document.createElement('div');
  logoEl.style.cssText = 'position:absolute;top:0;left:0;right:0;z-index:10;padding:48px 0 0;text-align:center;pointer-events:none;';
  logoEl.innerHTML = '<div style="font-family:Helvetica Neue,sans-serif;font-size:13px;font-weight:900;letter-spacing:8px;text-transform:uppercase;color:rgba(255,255,255,0.35)">SLO</div>' +
    '<div style="font-family:Georgia,serif;font-size:42px;font-weight:700;color:rgba(255,255,255,0.7);letter-spacing:-2px;line-height:1;margin-top:0px">MENU</div>';
  container.appendChild(logoEl);

  // Tab bar — z-index:10, pointer-events:all only on this bar
  var tabBar = document.createElement('div');
  tabBar.style.cssText = 'position:absolute;bottom:0;left:0;right:0;z-index:10;padding:10px 14px 36px;display:flex;gap:6px;background:linear-gradient(0deg,rgba(0,0,0,0.85) 50%,transparent);pointer-events:all;';
  tabBar.innerHTML = [
    '<button class="mh3d-tab active" data-tab="0">CITY</button>',
    '<button class="mh3d-tab" data-tab="1">TOURISM</button>',
    '<button class="mh3d-tab" data-tab="2">RESOURCES</button>',
    '<button class="mh3d-tab" data-tab="3">TOOLS</button>',
  ].join('');
  container.appendChild(tabBar);
  tabBar.querySelectorAll('.mh3d-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (mhFlying) return;
      tabBar.querySelectorAll('.mh3d-tab').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      mhTab = parseInt(btn.dataset.tab);
      mhBuildHubs();
    });
  });

  // ── Swipe/flick to switch tabs ──────────────────────────
  var mhSwipeStartX = 0;
  var mhSwipeStartY = 0;
  var mhSwipeActive = false;
  var MH_TAB_COUNT = Object.keys(MH_TABS).length;

  mhCanvas.addEventListener('touchstart', function(e) {
    if (mhFlying) return;
    mhSwipeStartX = e.touches[0].clientX;
    mhSwipeStartY = e.touches[0].clientY;
    mhSwipeActive = true;
  }, { passive: true });

  mhCanvas.addEventListener('touchend', function(e) {
    if (!mhSwipeActive || mhFlying) return;
    mhSwipeActive = false;
    var dx = e.changedTouches[0].clientX - mhSwipeStartX;
    var dy = e.changedTouches[0].clientY - mhSwipeStartY;
    // Only register as swipe if horizontal movement dominates and is fast enough
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      var newTab = dx < 0
        ? Math.min(mhTab + 1, MH_TAB_COUNT - 1)  // swipe left = next tab
        : Math.max(mhTab - 1, 0);                  // swipe right = prev tab
      if (newTab !== mhTab) {
        mhTab = newTab;
        tabBar.querySelectorAll('.mh3d-tab').forEach(function(b) { b.classList.remove('active'); });
        var activeBtn = tabBar.querySelector('[data-tab="' + mhTab + '"]');
        if (activeBtn) activeBtn.classList.add('active');
        mhBuildHubs();
      }
    }
  }, { passive: true });

  // Three.js
  mhScene  = new THREE.Scene();
  mhScene.fog = new THREE.FogExp2(0x000000, 0.018);

  mhCamera = new THREE.PerspectiveCamera(50, mhW / mhH, 0.1, 500);
  mhCamera.position.set(0, 0, 18);

  mhRenderer = new THREE.WebGLRenderer({ canvas: mhCanvas, antialias: true, alpha: false });
  mhRenderer.setSize(mhW, mhH);
  mhRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mhRenderer.setClearColor(0x000000, 1);

  mhScene.add(new THREE.AmbientLight(0xffffff, 0.15));
  var pl = new THREE.PointLight(0xffffff, 0.6, 60);
  pl.position.set(0, 8, 12);
  mhScene.add(pl);

  mhRaycaster    = new THREE.Raycaster();
  mhMouse        = new THREE.Vector2();
  mhCamTarget    = new THREE.Vector3(0, 0, 18);
  mhCamLookAt    = new THREE.Vector3(0, 0, 0);
  mhCamLookAtCur = new THREE.Vector3(0, 0, 0);
  mhClock        = new THREE.Clock();

  mhBuildHubs();
  mhAnimate();

  mhCanvas.addEventListener('touchstart', function(e) {
    if (mhFlying) return;
    var t = e.touches[0];
    var hit = mhGetHit(t.clientX, t.clientY);
    if (hit) mhRumbleAndFly(hit);
  }, { passive: true });

  mhCanvas.addEventListener('click', function(e) {
    if (mhFlying) return;
    var hit = mhGetHit(e.clientX, e.clientY);
    if (hit) mhRumbleAndFly(hit);
  });

  mhCanvas.addEventListener('mousemove', function(e) {
    if (mhFlying) return;
    mhHovered = mhGetHit(e.clientX, e.clientY);
    mhCanvas.style.cursor = mhHovered ? 'pointer' : 'default';
    var rect = mhApp.getBoundingClientRect();
    mhCamTarget.x =  ((e.clientX - rect.left) / mhW - 0.5) * 3;
    mhCamTarget.y = -((e.clientY - rect.top)  / mhH - 0.5) * 1.6;
    mhCamTarget.z = 18;
  });
}

function mhGetHubs() {
  var list = (MH_TABS[mhTab] || []).slice();
  if (mhTab === 0) {
    var profile = 'tourist';
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.user_metadata) {
      profile = currentUser.user_metadata.profile || 'tourist';
    }
    var order = MH_PROFILE_ORDER[profile] || MH_PROFILE_ORDER.tourist;
    list = order.map(function(i) { return MH_TABS[0][i]; }).filter(Boolean);
  }
  return list;
}

function mhBuildHubs() {
  // Clear ALL non-light children — Groups have type 'Group', not 'Mesh'
  mhScene.children.slice().forEach(function(c) {
    if (c.type !== 'AmbientLight' && c.type !== 'PointLight' && c.type !== 'DirectionalLight') {
      mhScene.remove(c);
    }
  });
  mhHubMeshes = [];

  var hubs = mhGetHubs();
  var n    = hubs.length;

  // Grid layout — 3 columns, rows as needed
  var COLS   = 3;
  var CELL_X = 3.2;  // horizontal spacing
  var CELL_Y = 3.6;  // vertical spacing
  var rows   = Math.ceil(n / COLS);
  // Center the grid vertically and horizontally
  var totalW = (COLS - 1) * CELL_X;
  var totalH = (rows - 1) * CELL_Y;

  var positions = [];
  for (var i = 0; i < n; i++) {
    var col = i % COLS;
    var row = Math.floor(i / COLS);
    var x   = col * CELL_X - totalW / 2;
    var y   = -(row * CELL_Y - totalH / 2);
    positions.push({ x: x, y: y, inner: false });
  }

  // Camera z based on number of rows
  var targetZ = rows <= 2 ? 16 : rows <= 3 ? 20 : 24;
  mhCamera.position.z = targetZ;
  mhCamTarget.z = targetZ;

  var innerCount = 0; var outerCount = n; var thirdCount = 0;

  hubs.forEach(function(hub, i) {
    var pos   = positions[i] || { x: 0, y: 0, inner: false };
    var group = new THREE.Group();

    var ringGeo = new THREE.RingGeometry(0.72, 0.84, 64);
    var ringMat = new THREE.MeshBasicMaterial({ color: hub.color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
    group.add(new THREE.Mesh(ringGeo, ringMat));

    // Disc 1.1 radius — large enough for reliable raycasting
    var discGeo = new THREE.CircleGeometry(1.1, 64);
    var discMat = new THREE.MeshBasicMaterial({ color: hub.color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false });
    group.add(new THREE.Mesh(discGeo, discMat));

    var glowGeo = new THREE.RingGeometry(0.84, 1.1, 64);
    var glowMat = new THREE.MeshBasicMaterial({ color: hub.color, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    if (pos.inner) group.scale.setScalar(1.15);
    group.userData = {
      hub: hub, ringMat: ringMat, discMat: discMat, glowMat: glowMat,
      baseX: pos.x, baseY: pos.y,
      dropStart: performance.now() + 200 + i * 80,
    };

    // Start close to camera (big), falls back into position
    group.position.set(pos.x, pos.y, 30);
    group.scale.setScalar(3.5);
    group.lookAt(mhCamera.position);

    mhScene.add(group);
    mhHubMeshes.push(group);

    // Icon + label as canvas texture sprite — moves with group automatically
    // Icon sprite
    var iconCanvas = document.createElement('canvas');
    iconCanvas.width = iconCanvas.height = 128;
    var ictx = iconCanvas.getContext('2d');
    ictx.font = '80px serif';
    ictx.textAlign = 'center';
    ictx.textBaseline = 'middle';
    ictx.fillText(hub.icon, 64, 64);
    var iconTex = new THREE.CanvasTexture(iconCanvas);
    var iconMat = new THREE.SpriteMaterial({ map: iconTex, transparent: true, opacity: 0, depthWrite: false });
    var iconSprite = new THREE.Sprite(iconMat);
    iconSprite.scale.set(0.9, 0.9, 1);
    iconSprite.position.set(0, 0, 0.01);
    group.add(iconSprite);

    // Label sprite
    var lblCanvas = document.createElement('canvas');
    lblCanvas.width  = 256;
    lblCanvas.height = 48;
    var lctx = lblCanvas.getContext('2d');
    lctx.font = '800 22px Helvetica Neue, Arial, sans-serif';
    lctx.textAlign = 'center';
    lctx.textBaseline = 'middle';
    lctx.fillStyle = 'rgba(255,255,255,0.95)';
    lctx.shadowColor = 'rgba(0,0,0,1)';
    lctx.shadowBlur = 6;
    lctx.fillText(hub.name.toUpperCase(), 128, 24);
    var lblTex = new THREE.CanvasTexture(lblCanvas);
    var lblMat = new THREE.SpriteMaterial({ map: lblTex, transparent: true, opacity: 0, depthWrite: false });
    var lblSprite = new THREE.Sprite(lblMat);
    lblSprite.scale.set(2.0, 0.375, 1);
    lblSprite.position.set(0, -1.05, 0.01);
    group.add(lblSprite);

    group.userData.iconMat = iconMat;
    group.userData.lblMat  = lblMat;
    // Keep spriteMat as alias to iconMat for fly hide/show
    group.userData.spriteMat = { 
      get opacity() { return iconMat.opacity; },
      set opacity(v) { iconMat.opacity = v; lblMat.opacity = v; }
    };
  });

  // Grid layout — no orbit rings needed

  // Stars
  var starGeo = new THREE.BufferGeometry();
  var sp = new Float32Array(500 * 3);
  for (var s = 0; s < 500; s++) {
    sp[s*3]   = (Math.random()-0.5)*80;
    sp[s*3+1] = (Math.random()-0.5)*80;
    sp[s*3+2] = (Math.random()-0.5)*80 - 20;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  mhScene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.35 })));

  // Ambient floating particles — small colored dots drifting in space
  var pCount = 120;
  var pPos   = new Float32Array(pCount * 3);
  var pCol   = new Float32Array(pCount * 3);
  var hubs   = mhGetHubs();
  for (var pi = 0; pi < pCount; pi++) {
    pPos[pi*3]   = (Math.random()-0.5) * 18;
    pPos[pi*3+1] = (Math.random()-0.5) * 18;
    pPos[pi*3+2] = (Math.random()-0.5) * 8;
    var ph = hubs[Math.floor(Math.random() * hubs.length)];
    var pc = ph ? ph.colorArr : [255,255,255];
    pCol[pi*3]   = pc[0]/255; pCol[pi*3+1] = pc[1]/255; pCol[pi*3+2] = pc[2]/255;
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
  var pMat = new THREE.PointsMaterial({ size: 0.06, transparent: true, opacity: 0.4, vertexColors: true });
  mhParticles = new THREE.Points(pGeo, pMat);
  mhScene.add(mhParticles);
}

function mhAnimate() {
  requestAnimationFrame(mhAnimate);
  mhClock.getDelta();

  mhCamera.position.x += (mhCamTarget.x - mhCamera.position.x) * 0.04;
  mhCamera.position.y += (mhCamTarget.y - mhCamera.position.y) * 0.04;
  mhCamera.position.z += (mhCamTarget.z - mhCamera.position.z) * 0.04;
  mhCamLookAtCur.lerp(mhCamLookAt, 0.06);
  mhCamera.lookAt(mhCamLookAtCur);

  mhRingT += 0.008;

  if (!mhFlying) {
    var now = performance.now();
    mhHubMeshes.forEach(function(group, i) {
      var ud    = group.userData;
      var isHov = (group === mhHovered);
      group.lookAt(mhCamera.position);

      // Drop-in: starts close/large, falls back into place with bounce
      if (ud.dropStart && now >= ud.dropStart) {
        var dt = Math.min((now - ud.dropStart) / 800, 1);
        // Damped spring — progress from 0→1
        var zeta = 0.42, w = 9;
        var wd = w * Math.sqrt(1 - zeta*zeta);
        var spring = 1 - Math.exp(-zeta*w*dt) * (Math.cos(wd*dt) + (zeta/Math.sqrt(1-zeta*zeta))*Math.sin(wd*dt));
        spring = Math.max(0, spring);
        // Z goes from 30 → 0, scale goes from 3.5 → 1
        group.position.z = 30 * (1 - spring);
        var sc = 3.5 - (3.5 - 1) * spring;
        group.scale.setScalar(Math.max(0.01, sc));
        if (dt >= 1) {
          group.position.z = 0;
          group.scale.setScalar(1);
          ud.dropStart = null;
          if (ud.spriteMat) ud.spriteMat.opacity = 1;
        }
      } else if (!ud.dropStart) {
        // Idle ring rotation — only rotate ring/disc/glow, not the sprite
        var rot = mhRingT * 0.15 * (i % 2 === 0 ? 1 : -1);
        group.children.forEach(function(child) {
          if (child.type !== 'Sprite') child.rotation.z = rot;
        });
      }

      // Only apply hover scale when fully settled
      if (!ud.dropStart) {
        var ts = isHov ? 1.18 : 1.0;
        group.scale.lerp(new THREE.Vector3(ts, ts, ts), 0.08);
      }
      ud.glowMat.opacity += ((isHov ? 0.28 : 0.0)  - ud.glowMat.opacity) * 0.08;
      ud.ringMat.opacity += ((isHov ? 1.0  : 0.8)  - ud.ringMat.opacity) * 0.08;
      ud.discMat.opacity += ((isHov ? 0.2  : 0.06) - ud.discMat.opacity) * 0.08;
    });

    // Particle drift
    if (mhParticles) {
      mhParticles.rotation.y = mhRingT * 0.04;
      mhParticles.rotation.x = mhRingT * 0.02;
      mhParticles.material.opacity = 0.35 + Math.sin(mhRingT) * 0.08;
    }

  }

  mhRenderer.render(mhScene, mhCamera);
}

function mhGetHit(clientX, clientY) {
  var rect = mhCanvas.getBoundingClientRect();
  mhMouse.x =  ((clientX - rect.left) / mhW) * 2 - 1;
  mhMouse.y = -((clientY - rect.top)  / mhH) * 2 + 1;
  mhRaycaster.setFromCamera(mhMouse, mhCamera);
  // Test only mhHubMeshes — never scene.children
  var hits = mhRaycaster.intersectObjects(mhHubMeshes, true);
  if (!hits.length) return null;
  var cur = hits[0].object;
  while (cur.parent) {
    if (cur.userData && cur.userData.hub) return cur;
    cur = cur.parent;
  }
  return null;
}

function mhRumbleAndFly(group) {
  if (mhFlying) return;
  if (navigator.vibrate) navigator.vibrate([20]);
  mhFly(group);
}

function mhDoRumble() {
  if (navigator.vibrate) navigator.vibrate([30, 15, 50, 15, 70]);
  var count = 0, max = 8;
  var iv = setInterval(function() {
    count++;
    var intensity = Math.pow(1 - count / max, 0.5);
    var sx = (Math.random()-0.5) * 12 * intensity;
    var sy = (Math.random()-0.5) * 7  * intensity;
    mhCanvas.style.transform = 'translate('+sx+'px,'+sy+'px)';
    if (count >= max) {
      clearInterval(iv);
      mhCanvas.style.transform = '';
    }
  }, 22);
}

function mhFly(group) {
  if (mhFlying) return;
  mhFlying = true;

  var hub         = group.userData.hub;
  var targetPos   = group.position.clone();
  var startCamPos = mhCamera.position.clone();
  var c1s         = hub.colorArr.join(',');

  var T_PAN   = 400;
  var T_FLY   = 1400;
  var T_FLASH = 300;
  var T_TOTAL = T_PAN + T_FLY + T_FLASH;
  var t0      = performance.now();
  var rumbleFired = false;

  // Flash overlay div for color flood on impact
  var flashEl = document.createElement('div');
  flashEl.style.cssText = 'position:absolute;inset:0;z-index:8;pointer-events:none;opacity:0;transition:none;background:rgb('+c1s+');';
  mhApp.appendChild(flashEl);

  // Selected hub brightens before launch, hide all sprites
  mhHubMeshes.forEach(function(g) { if (g.userData.spriteMat) g.userData.spriteMat.opacity = 0; });
  var ud = group.userData;
  ud.ringMat.opacity = 1.0;
  ud.glowMat.opacity = 0.5;

  function flyFrame() {
    var elapsed = performance.now() - t0;

    if (elapsed < T_PAN) {
      // Phase 0: camera pans to lock onto hub
      var p    = elapsed / T_PAN;
      var ease = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
      mhCamLookAt.copy(targetPos);
      mhCamLookAtCur.lerp(mhCamLookAt, ease * 0.15 + 0.02);
      mhCamera.lookAt(mhCamLookAtCur);

    } else if (elapsed < T_PAN + T_FLY) {
      // Phase 1: fly toward hub
      if (!rumbleFired) { rumbleFired = true; mhDoRumble(); }
      var p    = (elapsed - T_PAN) / T_FLY;
      var ease = p * p * p * p; // quartic — explosive at end

      mhCamera.position.lerpVectors(startCamPos, targetPos, ease * 0.94);
      mhCamera.lookAt(targetPos);

      // Other hubs scatter outward — use baseX/baseY so positions stay clean
      mhHubMeshes.forEach(function(g) {
        if (g === group) return;
        var dx = g.userData.baseX - targetPos.x;
        var dy = g.userData.baseY - targetPos.y;
        var dist = Math.sqrt(dx*dx + dy*dy) || 1;
        var scatter = ease * ease * 2.5;
        g.position.x = g.userData.baseX + (dx/dist) * scatter;
        g.position.y = g.userData.baseY + (dy/dist) * scatter;
        var fade = Math.max(0, 1 - ease * 2.2);
        g.userData.ringMat.opacity = Math.max(0, 0.8 * fade);
        g.userData.discMat.opacity = Math.max(0, 0.06 * fade);
        g.scale.setScalar(Math.max(0.01, 1 - ease * 0.9));
      });

      // Portal fills with color as you approach
      var portalFill = ease * ease * 0.35;
      ud.discMat.opacity = Math.min(0.6, 0.06 + portalFill);

      // Speed lines — handled by fog
      mhScene.fog.density = 0.018 + ease * 0.12;

    } else if (elapsed < T_TOTAL) {
      // Phase 2: color flood on impact
      var p2 = (elapsed - T_PAN - T_FLY) / T_FLASH;
      var ease2 = p2 < 0.3 ? p2/0.3 : 1 - (p2-0.3)/0.7; // flash in then out
      flashEl.style.opacity = (ease2 * 0.85).toString();
      mhCamera.position.copy(targetPos);

    } else {
      flashEl.remove();
      mhFlying = false;
      mhResetScene();
      mhOpenHub(hub);
      return;
    }

    if (mhFlying) requestAnimationFrame(flyFrame);
  }

  requestAnimationFrame(flyFrame);
}

function mhResetScene() {
  mhCamera.position.set(0, 0, 18);
  mhCamTarget.set(0, 0, 18);
  mhCamLookAt.set(0, 0, 0);
  mhCamLookAtCur.set(0, 0, 0);
  mhCamera.lookAt(0, 0, 0);
  mhScene.fog.density = 0.018;
  mhHovered = null;
  mhFlying  = false;
  mhBuildHubs();
}

function mhOpenHub(hub) {
  if (!hub.onopen) return;
  // Hide the ring scene so it doesn't bleed through frosted hub UI
  var el = document.getElementById('menu-home');
  if (el) el.style.display = 'none';
  try { eval(hub.onopen); } catch(e) { console.warn('[MenuHome]', hub.name, e); } // eslint-disable-line
}

function mhSpringDropCard(card, delay) {
  setTimeout(function() {
    card.style.opacity = '1';
    var start = null, dur = 700;
    function springEase(t) {
      var zeta = 0.36, w = 11, wd = w * Math.sqrt(1 - zeta*zeta);
      return 1 - Math.exp(-zeta*w*t) * (Math.cos(wd*t) + (zeta/Math.sqrt(1-zeta*zeta))*Math.sin(wd*t));
    }
    function frame(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var s = Math.max(0, springEase(t * 1.7));
      card.style.transform = 'translateY(' + ((1 - Math.min(s, 1)) * -180) + 'px)';
      if (t < 1) requestAnimationFrame(frame);
      else card.style.transform = 'translateY(0)';
    }
    requestAnimationFrame(frame);
  }, delay);
}
window.mhSpringDropCard = mhSpringDropCard;

// Public reset — call after returning from a hub
window.menuHome3dReset = function() {
  if (!mhReady) {
    console.warn('[MenuHome] menuHome3dReset called but mhReady=false');
    return;
  }
  mhFlying  = false;
  mhHovered = null;
  mhResetScene();
  console.warn('[MenuHome] menuHome3dReset complete — mhFlying=' + mhFlying + ' mhReady=' + mhReady);
};
