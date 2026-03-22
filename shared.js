// ══════════════════════════════════════════════
// SHARED.JS — Supabase, State, Global Utilities
// ══════════════════════════════════════════════

// ── SUPABASE ──
const supabaseClient = window.supabase.createClient(
  "https://jwgwufggptpdmgcmmqes.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Z3d1ZmdncHRwZG1nY21tcWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTExNTAsImV4cCI6MjA4OTYyNzE1MH0.mzbgdrq10Y203l1-oj-m4WjoQs9Z3KgsrFoEU24lV18"
);

// ── GLOBAL STATE ──
let currentUser  = null;
let userXP       = 0;
let reportCount  = 0;
let postCount    = 0;

// ── THEME ──
function toggleTheme() {
  const html = document.documentElement;
  const dark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', dark ? 'light' : 'dark');
  document.querySelector('.theme-toggle').textContent = dark ? '🌙' : '☀️';
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── NAV ──
function showPage(p) {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
  document.getElementById(p).classList.add('active');
  const nb = document.getElementById('nav-' + p);
  if (nb) nb.classList.add('active');
  if (p === 'profile') { renderProfile(); renderCharacterCard(); }
}

// ── USER HELPERS ──
function getGender() {
  return currentUser?.user_metadata?.gender || 'other';
}

function getGenderWord() {
  const g = getGender();
  if (g === 'male')   return 'man';
  if (g === 'female') return 'woman';
  return 'person';
}

function getGenderPronoun() {
  const g = getGender();
  if (g === 'male')   return 'he';
  if (g === 'female') return 'she';
  return 'they';
}

function getUsername() {
  if (!currentUser) return '?';
  return currentUser.user_metadata?.username
      || currentUser.email?.split('@')[0]
      || 'User';
}

function renderAvatar() {
  const initial = getUsername()[0]?.toUpperCase() || '?';
  const el = document.getElementById('avatar-btn');
  if (el) el.textContent = initial;
}

// ── TIME HELPER ──
function timeAgo(t) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  return Math.floor(m / 60) + 'h ago';
}

// ── THURSDAY CHECK ──
function isThursdayNight() {
  const now = new Date();
  return now.getDay() === 4 && now.getHours() >= 20;
}

function checkThursdayMode() {
  const is = isThursdayNight();
  document.documentElement.setAttribute('data-thursday', is ? 'true' : 'false');
  if (is) startFireRain();
}

function startFireRain() {
  if (document.querySelector('.fire-particle')) return;
  const emojis = ['🔥','✨','🍺','⚡'];
  function spawnFire() {
    if (!isThursdayNight()) return;
    const p = document.createElement('div');
    p.className = 'fire-particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top = '-30px';
    p.style.animationDuration = (2 + Math.random() * 3) + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 5000);
    setTimeout(spawnFire, 800 + Math.random() * 1200);
  }
  spawnFire();
}

// ── PARTICLES ──
function spawnBarParticles(cardEl, status) {
  const emojis = status === 'Packed' ? ['🔥','💥','⚡'] : status === 'Busy' ? ['🟡','✨','🎉'] : ['🟢','😌'];
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'bar-particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = (10 + Math.random() * 80) + '%';
      p.style.bottom = '60px';
      p.style.animationDuration = (0.8 + Math.random() * 0.5) + 's';
      cardEl.style.position = 'relative';
      cardEl.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }, i * 80);
  }
}

function popVoteBtn(btn) {
  btn.classList.remove('popping');
  void btn.offsetWidth;
  btn.classList.add('popping');
  setTimeout(() => btn.classList.remove('popping'), 400);
}

// ── CONFETTI ──
function fireConfetti() {
  const colors = ['#ffd700','#ff2d78','#b44fff','#00f5ff','#00ff88','#ff9500','#ffffff'];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = (10 + Math.random() * 80) + 'vw';
      p.style.top = '-10px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = (1.2 + Math.random() * 2) + 's';
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      p.style.width = (8 + Math.random() * 8) + 'px';
      p.style.height = p.style.width;
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.boxShadow = `0 0 8px ${colors[Math.floor(Math.random() * colors.length)]}`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }, i * 20);
  }
}

// ── VIBE SEGMENTS ──
function buildVigeSegments(trackEl, vibe, barColor) {
  trackEl.innerHTML = '';
  const segs = document.createElement('div');
  segs.className = 'vibe-segments';
  const total = 12;
  const active = Math.round((vibe / 100) * total);
  for (let i = 0; i < total; i++) {
    const s = document.createElement('div');
    s.className = 'vibe-seg' + (i < active ? ' active' : '');
    s.style.background = barColor;
    segs.appendChild(s);
  }
  trackEl.appendChild(segs);
}
function buildVibeSegments(t, v, c) { buildVigeSegments(t, v, c); }

// ── CONTINUOUS FLAME PARTICLES ──
let _packedParticleTimers = [];
function startPackedParticles() {
  _packedParticleTimers.forEach(t => clearTimeout(t));
  _packedParticleTimers = [];
  document.querySelectorAll('.flame-wrap').forEach(wrap => {
    function emit() {
      const emojis = ['🔥','💥','⚡','✨','🌟'];
      const p = document.createElement('div');
      p.className = 'flame-particle';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = (10 + Math.random() * 80) + '%';
      p.style.bottom = (50 + Math.random() * 20) + 'px';
      p.style.animationDuration = (0.7 + Math.random() * 0.8) + 's';
      wrap.appendChild(p);
      setTimeout(() => p.remove(), 1600);
      const t = setTimeout(emit, 300 + Math.random() * 400);
      _packedParticleTimers.push(t);
    }
    emit();
  });
}

// ── LOAD USER STATS ──
async function loadUserStats() {
  if (!currentUser) return;
  try {
    const [rr, pr] = await Promise.all([
      supabaseClient.from('reports').select('id',   { count: 'exact', head: true }).eq('user_id', currentUser.id),
      supabaseClient.from('lost_found').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id)
    ]);
    reportCount = rr.count  || 0;
    postCount   = pr.count  || 0;
    userXP      = (reportCount * 10) + (postCount * 15);
  } catch (e) {
    console.log('Stats skipped:', e.message);
  }
}

// ── SAFE LOCAL STORAGE ──
const safeStore = {
  get(k)    { try { return localStorage.getItem(k) || ''; } catch(e) { return _memStore[k] || ''; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch(e) { _memStore[k] = v; } }
};
const _memStore = {};
