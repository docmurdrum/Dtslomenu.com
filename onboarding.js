// ══════════════════════════════════════════════
// ONBOARDING.JS — Interactive Spotlight Walkthrough
// 7 steps covering Lines, Check-in, Missions,
// Games, Itinerary, Friends + DMs
// Tone: fun and casual, like a friend showing you around
// ══════════════════════════════════════════════

// ── MENU INTRO (kept from original) ──
var miMap = null;

function checkMenuIntro() {
  try {
    if (localStorage.getItem('menu_intro_seen')) return;
    var el = document.getElementById('menu-intro');
    if (!el) return;
    el.style.display = 'block';
    el.style.position = 'fixed';
    el.style.inset = '0';
    el.style.zIndex = '9999';
    el.style.background = '#000';
    runMenuIntro().catch(function(e) {
      console.warn('Intro sequence error:', e);
      menuIntroFinish();
    });
  } catch(e) {
    console.warn('checkMenuIntro error:', e);
    menuIntroFinish();
  }
}

async function runMenuIntro() {
  try {
    await miDelay(1000);
    var skip = document.getElementById('mi-skip');
    if (skip) skip.style.opacity = '1';
    await miDelay(200);
    var logo = document.getElementById('mi-logo');
    if (logo) logo.classList.add('in');
    await miDelay(500);
    var tag = document.getElementById('mi-tag');
    if (tag) tag.classList.add('in');
    await miDelay(400);
    var city = document.getElementById('mi-city');
    if (city) city.classList.add('in');
    await miDelay(1800);
  } catch(e) { menuIntroFinish(); return; }
  try {
    miInitMap();
    var mapStage = document.getElementById('mi-map-stage');
    if (mapStage) { mapStage.style.opacity = '1'; mapStage.style.pointerEvents = 'all'; }
    var wm = document.getElementById('mi-wordmark');
    if (wm) { wm.style.transition = 'opacity 1s ease'; wm.style.opacity = '0'; }
    await miDelay(1400);
    var overlay = document.getElementById('mi-map-overlay');
    var mapLogo = document.getElementById('mi-map-logo');
    if (overlay) overlay.style.opacity = '0';
    if (mapLogo) mapLogo.style.opacity = '1';
    await miDelay(3000);
    menuIntroFinish();
  } catch(e) { menuIntroFinish(); }
}

function miInitMap() {
  if (!window.maplibregl) return;
  miMap = new maplibregl.Map({
    container: 'mi-map',
    style: 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=kiFBCC0bWlsukNO2sHf7',
    center: [-120.6650, 35.2803],
    zoom: 15.5, pitch: 55, bearing: -25, antialias: true,
    attributionControl: false
  });
  miMap.on('load', function() {
    var layers = miMap.getStyle().layers;
    var labelLayer = layers.find(function(l) { return l.type === 'symbol' && l.layout && l.layout['text-field']; });
    try {
      miMap.addLayer({
        id: '3d-buildings', source: 'openmaptiles', 'source-layer': 'building',
        filter: ['==', 'extrude', 'true'], type: 'fill-extrusion', minzoom: 14,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'render_height'], 0, '#0f1729', 20, '#162040', 50, '#1e2d55'],
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-base': ['get', 'render_min_height'],
          'fill-extrusion-opacity': 0.85
        }
      }, labelLayer ? labelLayer.id : undefined);
    } catch(e) {}
    var hubs = [
      { coords: [-120.6650, 35.2803], icon: '🌃', label: 'DTSLO',    color: 'linear-gradient(135deg,#ff2d78,#b44fff)' },
      { coords: [-120.6580, 35.3050], icon: '🎓', label: 'CAL POLY', color: 'linear-gradient(135deg,#6366f1,#06b6d4)' },
      { coords: [-120.6590, 35.2820], icon: '🏛',  label: 'CITY',     color: 'linear-gradient(135deg,#00f5ff,#00ff88)' },
    ];
    hubs.forEach(function(hub) {
      var el = document.createElement('div');
      el.innerHTML = '<div class="mi-hub-pin"><div class="mi-hub-dot" style="background:' + hub.color + '">' + hub.icon + '</div><div class="mi-hub-label">' + hub.label + '</div></div>';
      new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(hub.coords).addTo(miMap);
    });
    var bearing = -25;
    var rot = function() { bearing += 0.03; miMap.setBearing(bearing); requestAnimationFrame(rot); };
    setTimeout(rot, 300);
  });
}

function menuIntroFinish() {
  localStorage.setItem('menu_intro_seen', '1');
  var el = document.getElementById('menu-intro');
  if (el) {
    el.style.transition = 'opacity 0.6s ease';
    el.style.opacity = '0';
    setTimeout(function() { el.style.display = 'none'; if (miMap) { miMap.remove(); miMap = null; } }, 650);
  }
}

function miDelay(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function menuIntroReset() { localStorage.removeItem('menu_intro_seen'); location.reload(); }

// ══════════════════════════════════════════════
// INTERACTIVE SPOTLIGHT WALKTHROUGH
// ══════════════════════════════════════════════

var OB_BETA_STEP = {
  id: 'beta',
  target: null,
  title: 'You are in beta 🧪',
  body: 'DTSLO is brand new and still being polished. You might hit a rough edge — if anything looks broken, go to Profile and tap "Clear Cache & Reload". That fixes 90% of issues. Use the Send Feedback button to report anything else. Thanks for being here early.',
  cta: 'Got it →',
  position: 'center',
  isBeta: true,
};

var OB_STEPS = [
  {
    id: 'welcome',
    target: null, // no spotlight — full screen welcome
    title: 'Hey, welcome to DTSLO! 👋',
    body: 'Think of this as your SLO nightlife co-pilot. Live bar info, missions, games, your whole crew — all in one place. Takes 2 minutes to learn. Let\'s go.',
    cta: 'Show me around →',
    position: 'center',
  },
  {
    id: 'lines',
    target: '#nav-line',
    title: 'This is your home base 🍺',
    body: 'The Lines tab shows every downtown bar, live. Is it packed? Dead? Getting busy? Tap Empty / Busy / Packed to report what you see and earn XP. The more people report, the better it gets for everyone.',
    cta: 'Got it →',
    position: 'above',
    page: 'line',
  },
  {
    id: 'checkin',
    target: null,
    targetSelector: '.bar-card-v2',
    title: 'Check in when you arrive 📍',
    body: 'Tap any bar card to open it, then hit Check In. You earn 20 XP, your friends can see where you are, and you start building your bar passport. Don\'t forget — you need to actually be there!',
    cta: 'Next →',
    position: 'below',
    page: 'line',
  },
  {
    id: 'missions',
    target: '#nav-missions',
    title: 'Missions = free stuff 🎯',
    body: 'Real missions, real rewards. Check in at the right bar, bring your crew, hit a time challenge — and earn XP, badges, even free drinks at the bar. New missions drop weekly.',
    cta: 'Next →',
    position: 'above',
    page: 'missions',
  },
  {
    id: 'games',
    target: '#nav-games',
    title: 'Games keep it interesting 🎮',
    body: 'Bar bingo, bar golf, duel your friends on trivia, make predictions on which bar gets packed first. 12 games total. Great for when you\'re waiting in line or just want to stir things up.',
    cta: 'Next →',
    position: 'above',
    page: 'games',
  },
  {
    id: 'itinerary',
    target: '#nav-resources',
    title: 'Plan your night like a pro 🗓',
    body: 'Build an itinerary with stop times, estimated costs, and a rideshare toggle. Browse the menu at each bar and save what you want before you get there. Share it with the crew so everyone\'s on the same page.',
    cta: 'Next →',
    position: 'above',
    page: 'resources',
  },
  {
    id: 'friends',
    target: '#nav-friends',
    title: 'Bring your people 👥',
    body: 'Add friends by QR code or username. See where they\'re checked in on the Lines page, DM them directly, create group chats for the night. The app is way more fun with your crew in it.',
    cta: 'Next →',
    position: 'above',
    page: 'friends',
  },
  {
    id: 'finish',
    target: null,
    title: 'You\'re all set! 🎉',
    body: 'That\'s the whole tour. Jump in, report your first bar, earn some XP, and have a good night. You can rewatch this anytime from your Profile.',
    cta: 'Let\'s go! 🍻',
    position: 'center',
    isLast: true,
  },
];

var obStep   = 0;
var obActive = false;
var obSteps  = OB_STEPS; // active steps — may include beta screen

// ── LOAD ACTIVE STEPS (checks beta flag) ──
async function obLoadSteps() {
  try {
    var res = await supabaseClient.from('app_settings').select('value').eq('key', 'show_beta_screen').limit(1);
    var showBeta = res.data && res.data[0] && res.data[0].value === 'true';
    obSteps = showBeta ? [OB_BETA_STEP].concat(OB_STEPS) : OB_STEPS;
  } catch(e) {
    obSteps = OB_STEPS;
  }
}

// ── BUILD ONBOARDING DOM ──
function obBuildDOM() {
  if (document.getElementById('ob-overlay')) return;

  // Dark overlay
  var overlay = document.createElement('div');
  overlay.id = 'ob-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9800;pointer-events:none;transition:opacity 0.3s';
  overlay.innerHTML = '<div id="ob-spotlight" style="position:absolute;pointer-events:none;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);border-radius:16px;box-shadow:0 0 0 9999px rgba(0,0,10,0.82)"></div>';

  // Tooltip bubble
  var bubble = document.createElement('div');
  bubble.id = 'ob-bubble';
  bubble.style.cssText = [
    'position:fixed;z-index:9900;max-width:320px;width:calc(100vw - 32px);',
    'background:#0e0e1a;border:1px solid rgba(255,255,255,0.1);',
    'border-radius:20px;padding:20px;pointer-events:all;',
    'box-shadow:0 8px 40px rgba(0,0,0,0.6);',
    'transition:all 0.35s cubic-bezier(0.4,0,0.2,1);',
    'left:16px;'
  ].join('');

  bubble.innerHTML = [
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">',
      '<div id="ob-progress" style="display:flex;gap:5px"></div>',
      '<button onclick="obSkip()" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;padding:0">Skip tour</button>',
    '</div>',
    '<div id="ob-title" style="font-size:18px;font-weight:900;margin-bottom:8px;letter-spacing:-0.3px;color:white"></div>',
    '<div id="ob-body" style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin-bottom:16px"></div>',
    '<div style="display:flex;gap:8px;align-items:center">',
      '<button id="ob-cta" onclick="obNext()" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:14px;font-weight:900;font-family:inherit;cursor:pointer"></button>',
    '</div>',
  ].join('');

  document.body.appendChild(overlay);
  document.body.appendChild(bubble);
}

// ── SHOW STEP ──
function obShowStep(idx) {
  var step     = obSteps[idx];
  var overlay  = document.getElementById('ob-overlay');
  var spotlight = document.getElementById('ob-spotlight');
  var bubble   = document.getElementById('ob-bubble');
  var title    = document.getElementById('ob-title');
  var body     = document.getElementById('ob-body');
  var cta      = document.getElementById('ob-cta');
  var progress = document.getElementById('ob-progress');
  if (!overlay || !bubble) return;

  // Switch to the relevant page
  if (step.page && typeof showPage === 'function') {
    showPage(step.page);
  }

  // Progress dots
  progress.innerHTML = obSteps.map(function(s, i) {
    return '<div style="width:' + (i === idx ? '20px' : '6px') + ';height:6px;border-radius:3px;background:' +
      (i === idx ? '#ff2d78' : i < idx ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.15)') +
      ';transition:all 0.3s"></div>';
  }).join('');

  title.textContent = step.title;
  body.textContent  = step.body;
  cta.textContent   = step.cta;

  // Last step — different CTA style
  if (step.isLast) {
    cta.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    cta.style.fontSize   = '16px';
  } else {
    cta.style.background = 'linear-gradient(135deg,#ff2d78,#b44fff)';
    cta.style.fontSize   = '14px';
  }

  // Position spotlight and bubble
  if (step.target || step.targetSelector) {
    var targetEl = step.target
      ? document.querySelector(step.target)
      : document.querySelector(step.targetSelector);

    if (targetEl) {
      var rect = targetEl.getBoundingClientRect();
      var pad  = 8;

      overlay.style.opacity      = '1';
      overlay.style.pointerEvents = 'all';
      spotlight.style.left   = (rect.left - pad) + 'px';
      spotlight.style.top    = (rect.top - pad) + 'px';
      spotlight.style.width  = (rect.width + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';

      // Position bubble above or below
      var bubbleTop;
      if (step.position === 'above') {
        bubbleTop = rect.top - pad - 16; // will use bottom: from bottom of screen
        bubble.style.bottom = (window.innerHeight - rect.top + pad + 12) + 'px';
        bubble.style.top    = 'auto';
      } else {
        bubble.style.top    = (rect.bottom + pad + 12) + 'px';
        bubble.style.bottom = 'auto';
      }
      return;
    }
  }

  // No target — center the bubble, hide spotlight
  spotlight.style.width  = '0';
  spotlight.style.height = '0';
  spotlight.style.left   = '50%';
  spotlight.style.top    = '50%';
  overlay.style.opacity      = '1';
  overlay.style.pointerEvents = 'all';
  bubble.style.top    = '50%';
  bubble.style.bottom = 'auto';
  bubble.style.transform = 'translateY(-50%)';

  // Reset transform on non-center steps
  setTimeout(function() {
    if (step.position !== 'center') bubble.style.transform = '';
  }, 10);
}

// ── START / NEXT / SKIP / CLOSE ──
async function showOnboarding() {
  await obLoadSteps();
  obBuildDOM();
  obStep   = 0;
  obActive = true;
  var overlay = document.getElementById('ob-overlay');
  var bubble  = document.getElementById('ob-bubble');
  if (overlay) overlay.style.opacity = '0';
  if (bubble)  bubble.style.opacity  = '0';
  setTimeout(function() {
    if (overlay) overlay.style.opacity = '1';
    if (bubble)  bubble.style.opacity  = '1';
    obShowStep(0);
  }, 100);
}
window.showOnboarding = showOnboarding;

function obNext() {
  obStep++;
  if (obStep >= obSteps.length) {
    obFinish();
    return;
  }
  obShowStep(obStep);
}
window.obNext = obNext;

function obSkip() {
  obFinish();
}
window.obSkip = obSkip;

function obFinish() {
  obActive = false;
  localStorage.setItem('dtslo_onboarding_done', '1');
  var overlay = document.getElementById('ob-overlay');
  var bubble  = document.getElementById('ob-bubble');
  if (overlay) { overlay.style.opacity = '0'; setTimeout(function() { overlay.remove(); }, 350); }
  if (bubble)  { bubble.style.opacity  = '0'; setTimeout(function() { bubble.remove(); }, 350); }
  // Go to Lines after finish
  if (typeof showPage === 'function') showPage('line');
}
window.obFinish = obFinish;

// ── MAYBE SHOW ON LOGIN ──
function maybeShowOnboarding(isNewUser) {
  var done = localStorage.getItem('dtslo_onboarding_done');
  if (isNewUser && !done) {
    setTimeout(function() { showOnboarding(); }, 800);
  }
}
window.maybeShowOnboarding = maybeShowOnboarding;

// ── REWATCH (called from profile) ──
function rewatchOnboarding() {
  localStorage.removeItem('dtslo_onboarding_done');
  showOnboarding();
}
window.rewatchOnboarding = rewatchOnboarding;

// ── LEGACY: closeOnboarding (referenced from existing HTML) ──
function closeOnboarding() { obSkip(); }
window.closeOnboarding = closeOnboarding;
function onboardingNext() { obNext(); }
window.onboardingNext = onboardingNext;
