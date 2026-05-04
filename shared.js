// ══════════════════════════════════════════════
// SHARED.JS — Supabase, State, Global Utilities
// ══════════════════════════════════════════════

// ── SUPABASE ──
try {
  supabaseClient = window.supabase.createClient(
    "https://jwgwufggptpdmgcmmqes.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Z3d1ZmdncHRwZG1nY21tcWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTExNTAsImV4cCI6MjA4OTYyNzE1MH0.mzbgdrq10Y203l1-oj-m4WjoQs9Z3KgsrFoEU24lV18"
  );
} catch(e) {
  console.warn('[DTSLO] Supabase init failed — running offline:', e.message);
  supabaseClient = null;
}

// ── GLOBAL STATE ──
// currentUser declared in globals.js
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
  if (p === 'leaderboard') { try { openLbPopup(); } catch(e) {} return; }

  if (p === 'rides')       { try { initRides(); } catch(e) {} }
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
  const pageEl = document.getElementById(p);
  if (pageEl) pageEl.classList.add('active');
  const nb = document.getElementById('nav-' + p);
  if (nb) nb.classList.add('active');
  if (p === 'profile')  { renderProfile(); initAppSettings(); try { loadSkipIntroPref(); loadSkipToDTSLOPref(); } catch(e) {} }
  if (p === 'games')    { initGamesPage(); }
  if (p === 'missions') { initMissionsPage(); }
  if (p === 'resources'){ renderResources(); }
  if (p === 'missed')   { initMissedConnections(); }
  if (p === 'friends')  { try { initFriends(); } catch(e) {} }
  if (p === 'events')   { try { initEvents(); } catch(e) {} }
  if (p === 'line')     { if (typeof loadReports === 'function') loadReports(); }
  if (p === 'lineskip') { try { initLineSkip(); } catch(e) {} }
}

// ── HANDLE VOTE FROM BAR PAGE ──
function handleVoteFromBar(status) {
  if (currentBarIndex === null) return;
  if (typeof report === 'function') report(currentBarIndex, status);
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

function updateUsernameBar() {
  const el = document.getElementById('username-bar');
  if (!el || !currentUser) return;
  const username = getUsername();
  el.innerHTML = `<span class="username-bar-text">👋 ${username}</span>`;
  el.style.display = 'flex';
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
  return false; // Thursday mode disabled
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
// XP is authoritative from profiles table.
// reportCount + postCount are for achievement tracking only.
async function loadUserStats() {
  if (!currentUser) return;
  try {
    const [profileRes, rr, pr] = await Promise.all([
      supabaseClient.from('profiles').select('xp').eq('id', currentUser.id).limit(1),
      supabaseClient.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id),
      supabaseClient.from('lost_found').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id)
    ]);
    const profileRow = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
    userXP      = profileRow?.xp || 0;
    reportCount = rr.count || 0;
    postCount   = pr.count || 0;
  } catch(e) {
    console.log('Stats skipped:', e.message);
  }
}

// ── SAFE LOCAL STORAGE ──
const safeStore = {
  get(k)    { try { return localStorage.getItem(k) || ''; } catch(e) { return _memStore[k] || ''; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch(e) { _memStore[k] = v; } }
};
const _memStore = {};

// ── INVITE FRIENDS ──
function inviteFriends() {
  const username = getUsername();
  const link = 'https://dtslomenu.com?ref=' + encodeURIComponent(username);
  const text = 'Join me on DTSLO — the best way to navigate downtown SLO nightlife! ' + link;
  if (navigator.share) {
    navigator.share({ title: 'Join DTSLO', text, url: link }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    showToast('📋 Invite link copied!');
  } else {
    showToast('Share: ' + link);
  }
}

// ── DONATION ──
function openDonation() {
  window.open('https://ko-fi.com/dtslomenu', '_blank');
}

// ── GPS BYPASS (in-app settings) ──
function initAppSettings() {
  const bypass = localStorage.getItem('gps_bypass') === 'true';
  const toggle = document.getElementById('gps-bypass-app-toggle');
  const status = document.getElementById('gps-bypass-status-app');
  if (toggle) toggle.checked = bypass;
  if (status) status.textContent = bypass ? '⚠️ Location check bypassed' : '✅ Location check active';
}

function toggleGPSBypassApp(enabled) {
  localStorage.setItem('gps_bypass', enabled ? 'true' : 'false');
  const status = document.getElementById('gps-bypass-status-app');
  if (status) status.textContent = enabled ? '⚠️ Location check bypassed' : '✅ Location check active';
  showToast(enabled ? '⚠️ GPS bypass ON' : '✅ GPS bypass OFF');
}

// ══════════════════════════════════════════════
// HUB VISIT TRACKING
// Called when a user opens any hub.
// Persists distinct hub IDs to profiles.hubs_visited.
// Triggers badge check after each new hub is recorded.
// ══════════════════════════════════════════════

var _hubVisitDebounce = null;
var _hubsVisitedLocal = null; // in-memory cache for this session

async function trackHubVisit(hubId) {
  if (!hubId) return;

  // Always update local cache
  if (!_hubsVisitedLocal) {
    // Init from localStorage for guests or as fallback
    try { _hubsVisitedLocal = JSON.parse(localStorage.getItem('dtslo_hubs_visited') || '[]'); } catch(e) { _hubsVisitedLocal = []; }
  }

  if (_hubsVisitedLocal.includes(hubId)) return; // already recorded — nothing to do
  _hubsVisitedLocal.push(hubId);

  try { localStorage.setItem('dtslo_hubs_visited', JSON.stringify(_hubsVisitedLocal)); } catch(e) {}

  if (!currentUser || !supabaseClient) return;

  // Debounce Supabase write — 800ms
  clearTimeout(_hubVisitDebounce);
  _hubVisitDebounce = setTimeout(async function() {
    try {
      var res = await supabaseClient
        .from('profiles')
        .select('hubs_visited')
        .eq('id', currentUser.id)
        .limit(1);

      var profileRow = Array.isArray(res.data) ? res.data[0] : res.data;
      var existing   = (profileRow && Array.isArray(profileRow.hubs_visited))
        ? profileRow.hubs_visited
        : [];

      // Merge local + remote, deduplicate
      var merged = Array.from(new Set([...existing, ..._hubsVisitedLocal]));

      // Only write if something actually changed
      if (merged.length === existing.length) return;

      await supabaseClient
        .from('profiles')
        .update({ hubs_visited: merged })
        .eq('id', currentUser.id);

      // Check badge eligibility
      if (typeof checkBadges === 'function') checkBadges();

    } catch(e) {
      console.warn('[trackHubVisit]', e.message);
    }
  }, 800);
}
window.trackHubVisit = trackHubVisit;

// ══════════════════════════════════════════════
// XP SYSTEM
// Single source of truth for all XP awards.
// Writes to profiles table, keeps userXP in sync,
// triggers level-up callback and badge check.
// Max level: 100. XP per level: 100.
// ══════════════════════════════════════════════
async function addXP(amount) {
  amount = Math.floor(amount || 0);
  if (amount <= 0) return;

  // Guest: store locally, apply on signup
  if (!currentUser) {
    var local = parseInt(localStorage.getItem('dtslo_xp') || '0') + amount;
    localStorage.setItem('dtslo_xp', local);
    return;
  }

  try {
    var res = await supabaseClient
      .from('profiles')
      .select('xp')
      .eq('id', currentUser.id)
      .limit(1);

    var profileRow = Array.isArray(res.data) ? res.data[0] : res.data;
    if (!profileRow) return;

    var oldXP    = profileRow.xp || 0;
    var newXP    = oldXP + amount;
    var oldLevel = Math.min(100, Math.floor(oldXP  / 100) + 1);
    var newLevel = Math.min(100, Math.floor(newXP / 100) + 1);

    await supabaseClient
      .from('profiles')
      .update({ xp: newXP, level: newLevel })
      .eq('id', currentUser.id);

    userXP = newXP;

    if (typeof showToast === 'function' && !window._devSuppressXPToast) {
      showToast('⚡ +' + amount + ' XP');
    }

    // Level-up celebration
    if (newLevel > oldLevel) {
      if (typeof onLevelUp === 'function') onLevelUp(newLevel);
    }

    // Re-render profile if open
    if (document.getElementById('profile')?.classList.contains('active')) {
      if (typeof renderProfile === 'function') renderProfile();
    }

    // Check badge eligibility
    if (typeof checkBadges === 'function') checkBadges();

  } catch(e) {
    console.warn('[addXP]', e);
  }
}
