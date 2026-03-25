
// ══════════════════════════════════════════════
// MENU INTRO SEQUENCE — shows once on first load
// ══════════════════════════════════════════════
let miMap = null;

function checkMenuIntro() {
  try {
    if (localStorage.getItem('menu_intro_seen')) return;
    const el = document.getElementById('menu-intro');
    if (!el) return;
    el.style.display = 'block';
    // Ensure intro is on top and visible
    el.style.position = 'fixed';
    el.style.inset = '0';
    el.style.zIndex = '9999';
    el.style.background = '#000';
    runMenuIntro().catch(e => {
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
  // Show skip after 1s
  await miDelay(1000);
  const skip = document.getElementById('mi-skip');
  if (skip) skip.style.opacity = '1';

  // Step 1: wordmark
  await miDelay(200);
  document.getElementById('mi-logo')?.classList.add('in');
  await miDelay(500);
  document.getElementById('mi-tag')?.classList.add('in');
  await miDelay(400);
  document.getElementById('mi-city')?.classList.add('in');
  await miDelay(1800);

  // Step 2: init map + fade wordmark out
  } catch(e) { menuIntroFinish(); return; }
  try {
  miInitMap();
  const mapStage = document.getElementById('mi-map-stage');
  if (mapStage) { mapStage.style.opacity = '1'; mapStage.style.pointerEvents = 'all'; }
  const wm = document.getElementById('mi-wordmark');
  if (wm) { wm.style.transition = 'opacity 1s ease'; wm.style.opacity = '0'; }

  // Reveal map
  await miDelay(1400);
  const overlay = document.getElementById('mi-map-overlay');
  const logo    = document.getElementById('mi-map-logo');
  if (overlay) overlay.style.opacity = '0';
  if (logo)    logo.style.opacity    = '1';

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

  miMap.on('load', () => {
    // 3D buildings
    const layers = miMap.getStyle().layers;
    const labelLayer = layers.find(l => l.type === 'symbol' && l.layout?.['text-field']);
    miMap.addLayer({
      id: '3d-buildings',
      source: 'openmaptiles',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': [
          'interpolate', ['linear'], ['get', 'render_height'],
          0, '#0f1729', 20, '#162040', 50, '#1e2d55'
        ],
        'fill-extrusion-height':      ['get', 'render_height'],
        'fill-extrusion-base':        ['get', 'render_min_height'],
        'fill-extrusion-opacity':     0.85
      }
    }, labelLayer ? labelLayer.id : undefined);

    // Hub markers
    const hubs = [
      { coords: [-120.6650, 35.2803], icon: '🌃', label: 'DTSLO',    color: 'linear-gradient(135deg,#ff2d78,#b44fff)' },
      { coords: [-120.6580, 35.3050], icon: '🎓', label: 'CAL POLY', color: 'linear-gradient(135deg,#6366f1,#06b6d4)' },
      { coords: [-120.6590, 35.2820], icon: '🏛',  label: 'CITY',     color: 'linear-gradient(135deg,#00f5ff,#00ff88)' },
    ];
    hubs.forEach(hub => {
      const el = document.createElement('div');
      el.innerHTML = '<div class="mi-hub-pin"><div class="mi-hub-dot" style="background:' + hub.color + '">' + hub.icon + '</div><div class="mi-hub-label">' + hub.label + '</div></div>';
      new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(hub.coords).addTo(miMap);
    });

    // Slow rotation
    let bearing = -25;
    const rot = () => { bearing += 0.03; miMap.setBearing(bearing); requestAnimationFrame(rot); };
    setTimeout(rot, 300);
  });
}

function menuIntroFinish() {
  localStorage.setItem('menu_intro_seen', '1');
  const el = document.getElementById('menu-intro');
  if (el) {
    el.style.transition = 'opacity 0.6s ease';
    el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; if (miMap) { miMap.remove(); miMap = null; } }, 650);
  }
}

function miDelay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Reset intro (for testing) — call menuIntroReset() in console
function menuIntroReset() {
  localStorage.removeItem('menu_intro_seen');
  location.reload();
}

// ══════════════════════════════════════════════
// ONBOARDING.JS — New User Onboarding Slides
// ══════════════════════════════════════════════

const ONBOARDING_SLIDES = [
  {
    icon: '🌃',
    title: 'Welcome to DTSLO',
    body: 'Your guide to downtown San Luis Obispo nightlife. Real-time bar info, games, and more — all in one place.',
    cta: 'Next →',
  },
  {
    icon: '📍',
    title: 'Know Before You Go',
    body: 'See live crowd levels at every bar on Higuera Street. Check in to earn XP and help the community.',
    cta: 'Next →',
  },
  {
    icon: '🎮',
    title: 'Games & Challenges',
    body: 'Play trivia, duel other users, make bar predictions, and earn XP. Climb the leaderboard every week.',
    cta: 'Next →',
  },
  {
    icon: '🎭',
    title: 'Your Character',
    body: 'Earn XP to level up and unlock a unique character card. Each level reveals a new scene. How far can you go?',
    cta: "Let's Go! 🎉",
  },
];

let onboardingIdx = 0;

function showOnboarding() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;
  onboardingIdx = 0;
  renderOnboardingSlide();
  modal.classList.add('show');
}

function renderOnboardingSlide() {
  const slide = ONBOARDING_SLIDES[onboardingIdx];
  const icon  = document.getElementById('ob-icon');
  const title = document.getElementById('ob-title');
  const body  = document.getElementById('ob-body');
  const cta   = document.getElementById('ob-cta');
  const dots  = document.querySelectorAll('.ob-dot');

  if (icon)  icon.textContent  = slide.icon;
  if (title) title.textContent = slide.title;
  if (body)  body.textContent  = slide.body;
  if (cta)   cta.textContent   = slide.cta;

  dots.forEach((d, i) => d.classList.toggle('active', i === onboardingIdx));
}

function onboardingNext() {
  onboardingIdx++;
  if (onboardingIdx >= ONBOARDING_SLIDES.length) {
    closeOnboarding();
    return;
  }
  // Animate slide
  const content = document.getElementById('ob-content');
  if (content) {
    content.classList.add('sliding');
    setTimeout(() => {
      renderOnboardingSlide();
      content.classList.remove('sliding');
    }, 200);
  } else {
    renderOnboardingSlide();
  }
}

function closeOnboarding() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) modal.classList.remove('show');
}

// Called from auth.js after successful signup
function maybeShowOnboarding(isNewUser) {
  if (isNewUser) {
    setTimeout(() => showOnboarding(), 600);
  }
}
