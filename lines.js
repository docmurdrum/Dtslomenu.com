// ══════════════════════════════════════════════
// LINES.JS — Bars, Voting, Check-In, Feed Views
// ══════════════════════════════════════════════

// ── BAR DATA ──
const bars = [
  { name: "Black Sheep Bar & Grill", emoji: '🐑', address: 'Downtown SLO', reports: [], color: '#7c6af7', headcountAvg: 0 },
  { name: "Bull's Tavern",           emoji: '🐂', address: 'Downtown SLO', reports: [], color: '#f59e0b', headcountAvg: 0 },
  { name: "Frog & Peach Pub",        emoji: '🐸', address: 'Downtown SLO', reports: [], color: '#22c55e', headcountAvg: 0 },
  { name: "High Bar",                emoji: '🌆', address: 'Hotel SLO Rooftop · Downtown SLO', reports: [], color: '#6366f1', headcountAvg: 0 },
  { name: "Nightcap",                emoji: '🌙', address: 'Downtown SLO', reports: [], color: '#8b5cf6', headcountAvg: 0 },
  { name: "Feral Kitchen & Lounge",  emoji: '🌿', address: 'Downtown SLO', reports: [], color: '#10b981', headcountAvg: 0 },
  { name: "The Library",             emoji: '📚', address: 'Downtown SLO', reports: [], color: '#7c6af7', headcountAvg: 0 },
  { name: "The Mark",                emoji: '🎯', address: 'Downtown SLO', reports: [], color: '#ec4899', headcountAvg: 0 },
  { name: "McCarthy's Irish Pub",    emoji: '🍀', address: 'Downtown SLO', reports: [], color: '#22c55e', headcountAvg: 0 },
  { name: "Sidecar SLO",             emoji: '🥂', address: 'Downtown SLO', reports: [], color: '#f59e0b', headcountAvg: 0 },
  { name: "Eureka!",                 emoji: '💡', address: 'Downtown SLO', reports: [], color: '#ef4444', headcountAvg: 0 },
  { name: "Finney's Crafthouse",     emoji: '🍺', address: 'Downtown SLO', reports: [], color: '#f97316', headcountAvg: 0 },
  { name: "Novo Restaurant & Lounge",emoji: '🌊', address: 'Downtown SLO', reports: [], color: '#06b6d4', headcountAvg: 0 },
  { name: "BA Start Arcade Bar",     emoji: '🕹️', address: 'Downtown SLO', reports: [], color: '#a855f7', headcountAvg: 0 },
  { name: "The Carrisa",             emoji: '🏨', address: 'Downtown SLO', reports: [], color: '#d4a855', headcountAvg: 0 },
];


// ── LOAD BARS FROM SUPABASE ──
var _barsDBLoaded = false;
async function loadBarsFromDB() {
  if (_barsDBLoaded) return; // Only load once — emblem_url etc cached in bars array
  try {
    var res = await supabaseClient
      .from('businesses')
      .select('*')
      .eq('type', 'bar')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (res.error) throw res.error;
    if (!res.data || !res.data.length) return;

    res.data.forEach(function(row) {
      var idx = bars.findIndex(function(b) { return b.name === row.name; });
      if (idx > -1) {
        // Merge DB fields into hardcoded bar
        if (row.color)      bars[idx].color      = row.color;
        if (row.emoji)      bars[idx].emoji      = row.emoji;
        if (row.address)    bars[idx].address    = row.address;
        if (row.emblem_url) bars[idx].emblem_url = row.emblem_url;
        if (row.hours)      bars[idx].hours      = row.hours;
        if (row.phone)      bars[idx].phone      = row.phone;
        bars[idx].db_id = row.id;
        bars[idx].happy_hour    = row.happy_hour    || '';
        bars[idx].cover_charge  = row.cover_charge  || false;
        bars[idx].jukebox       = row.jukebox       || false;
        bars[idx].pool_table    = row.pool_table     || false;
        bars[idx].darts         = row.darts          || false;
        bars[idx].arcade        = row.arcade         || false;
        bars[idx].patio         = row.patio          || false;
        bars[idx].live_music    = row.live_music     || false;
        bars[idx].karaoke       = row.karaoke        || false;
        bars[idx].trivia        = row.trivia         || false;
        bars[idx].bar_golf_eligible = row.bar_golf_eligible || false;
        // Lat/lng from businesses table
        if (row.lat && row.lng) {
          bars[idx].lat = row.lat;
          bars[idx].lng = row.lng;
        }
      } else {
        // New bar in DB not in hardcoded list — add it
        bars.push({
          name:         row.name,
          emoji:        row.emoji || '🍺',
          color:        row.color || '#ff2d78',
          address:      row.address || '',
          hours:        row.hours || '',
          phone:        row.phone || '',
          emblem_url:   row.emblem_url || null,
          db_id:        row.id,
          lat:          row.lat,
          lng:          row.lng,
          happy_hour:   row.happy_hour || '',
          cover_charge: row.cover_charge || false,
          jukebox:      row.jukebox || false,
          pool_table:   row.pool_table || false,
          darts:        row.darts || false,
          arcade:       row.arcade || false,
          patio:        row.patio || false,
          live_music:   row.live_music || false,
          karaoke:      row.karaoke || false,
          trivia:       row.trivia || false,
          bar_golf_eligible: row.bar_golf_eligible || false,
          tags:         [],
        });
      }
    });
    _barsDBLoaded = true; // Mark as loaded — won't re-fetch on report refreshes
    // Preload all emblem images into browser cache immediately
    bars.forEach(function(b) {
      if (b.emblem_url && !b._emblemPreloaded) {
        var img = new Image();
        img.src = b.emblem_url;
        b._emblemPreloaded = true;
      }
    });
  } catch(e) {
    console.warn('[lines] loadBarsFromDB:', e.message);
  }
}

// ── LOCATION VERIFICATION ──
const BAR_COORDS = {
  'Black Sheep Bar & Grill':   [35.2793, -120.6639],  // 1117 Higuera
  "Bull's Tavern":             [35.2816, -120.6662],  // 709 Higuera
  'Frog & Peach Pub':          [35.2815, -120.6661],  // 728 Higuera
  'High Bar':                  [35.2800, -120.6644],  // Hotel SLO, 1 Garden St
  'Nightcap':                  [35.2791, -120.6640],  // 1144 Chorro St
  'Feral Kitchen & Lounge':    [35.2806, -120.6655],  // 893 Higuera
  'The Library':               [35.2801, -120.6648],  // 996 Higuera
  'The Mark':                  [35.2791, -120.6638],  // 1124 Garden St
  "McCarthy's Irish Pub":      [35.2821, -120.6658],  // 600 Marsh St
  'Sidecar SLO':               [35.2788, -120.6629],  // 1127 Broad St
  'Eureka!':                   [35.2792, -120.6638],  // 1141 Higuera
  "Finney's Crafthouse":       [35.2792, -120.6637],  // 1144 Higuera
  'Novo Restaurant & Lounge':  [35.2815, -120.6660],  // 726 Higuera
  'BA Start Arcade Bar':       [35.2818, -120.6663],  // 647 Higuera
  'The Carrisa':               [35.2786, -120.6635],  // 1234 Garden St
}
const GPS_RADIUS_METERS = 50;

function isGPSBypassed() {
  try { return localStorage.getItem('gps_bypass') === 'true'; } catch(e) { return false; }
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2)
    + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180)
    * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function verifyLocation(barName, callback) {
  if (isGPSBypassed()) { callback(true); return; }

  const barCoord = BAR_COORDS[barName];
  if (!barCoord) { callback(true); return; } // unknown bar — allow

  if (!navigator.geolocation) {
    showToast('📍 Location not supported on this device');
    callback(false); return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const dist = haversineDistance(
        pos.coords.latitude, pos.coords.longitude,
        barCoord.lat, barCoord.lng
      );
      if (dist <= GPS_RADIUS_METERS) {
        callback(true);
      } else {
        showToast(`📍 You need to be at ${barName} to report`);
        callback(false);
      }
    },
    (err) => {
      if (err.code === 1) showToast('📍 Location access is required to report');
      else showToast('📍 Could not get your location — try again');
      callback(false);
    },
    { timeout: 8000, maximumAge: 30000 }
  );
}

// ── LINES STATE ──
let currentView = 'list';
let refreshTimer = null;
const RECENT_REPORTS_LIMIT = 30;

// ── STATUS HELPERS ──
function getStatus(bar) {
  if (!bar.reports.length) return 'No Data';
  const cutoff = Date.now() - 30 * 60 * 1000;
  const recent = bar.reports.filter(r => r.time > cutoff);
  if (!recent.length) return 'No Data';
  const c = {};
  recent.slice(0, 8).forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
  return Object.keys(c).reduce((a, b) => c[a] > c[b] ? a : b);
}

function getRecentCount(bar) {
  return bar.reports.filter(r => r.time > Date.now() - 30 * 60 * 1000).length;
}

function statusLabel(s) {
  if (s === 'Dead')   return { text: '🟢 Empty',        cls: 'status-Dead',   vibe: 10, color: 'var(--green)',  barColor: '#22c55e' };
  if (s === 'Busy')   return { text: '🟡 Getting Busy', cls: 'status-Busy',   vibe: 55, color: 'var(--yellow)', barColor: '#f59e0b' };
  if (s === 'Packed') return { text: '🔴 Packed',       cls: 'status-Packed', vibe: 95, color: 'var(--red)',    barColor: '#ef4444' };
  return               { text: '⚪ No Data',             cls: 'status-NoData', vibe: 0,  color: 'var(--text2)',  barColor: 'var(--border)' };
}

// ── RENDER HOT STRIP ──
function renderHotStrip() {
  const strip = document.getElementById('hot-strip');
  const cards = document.getElementById('hot-cards');
  if (!strip || !cards) return;

  const order = { 'Packed': 3, 'Busy': 2, 'Dead': 1, 'No Data': 0 };
  const active = bars
    .map((bar, i) => ({ bar, i, status: getStatus(bar), count: getRecentCount(bar) }))
    .filter(b => b.status !== 'No Data')
    .sort((a, b) => (order[b.status] - order[a.status]) || (b.count - a.count))
    .slice(0, 4);

  if (!active.length) { strip.style.display = 'none'; return; }
  strip.style.display = 'block';

  const medals = ['🥇','🥈','🥉','4️⃣'];
  cards.innerHTML = active.map(({ bar, i, status, count }, rank) => {
    const { text, barColor } = statusLabel(status);
    return `<div class="hot-card" onclick="document.querySelectorAll('.bar-card-v2')[${i}]?.scrollIntoView({behavior:'smooth',block:'center'})">
      <div class="hot-card-flood" style="background:${barColor}"></div>
      <div class="hot-card-top">
        <span class="hot-card-emoji">${bar.emoji}</span>
        <span class="hot-card-rank">${medals[rank]}</span>
      </div>
      <div class="hot-card-name">${bar.name}</div>
      <div class="hot-card-status" style="color:${barColor}">${text}</div>
      <div class="hot-card-count">👥 ${count} report${count !== 1 ? 's' : ''}</div>
    </div>`;
  }).join('');
}

function updateSummaryStrip() {
  const packed  = bars.filter(b => getStatus(b) === 'Packed').length;
  const busy    = bars.filter(b => getStatus(b) === 'Busy').length;
  const total   = bars.reduce((n, b) => n + getRecentCount(b), 0);
  const sp = document.getElementById('sum-packed');
  const sb = document.getElementById('sum-busy');
  const sr = document.getElementById('sum-reports');
  if (sp) sp.textContent = packed;
  if (sb) sb.textContent = busy;
  if (sr) sr.textContent = total;

  const sub = document.getElementById('lines-subtitle');
  if (!sub) return;
  const active = bars.filter(b => getStatus(b) !== 'No Data').length;
  if (active === 0) sub.textContent = 'No reports yet tonight — be the first!';
  else sub.textContent = `${active} bar${active !== 1 ? 's' : ''} reporting · ${total} report${total !== 1 ? 's' : ''} (30min)`;
}



// ── SMART UPDATE — only refreshes dynamic parts, preserves emblem images ──
function renderBarsUpdate() {
  const c = document.getElementById('bars');
  if (!c) return;

  const order = { 'Packed': 0, 'Busy': 1, 'Dead': 2, 'No Data': 3 };
  const sorted = [...bars].map((bar, i) => ({ bar, i }))
    .sort((a, b) => (order[getStatus(a.bar)] ?? 3) - (order[getStatus(b.bar)] ?? 3));

  // Check if sort order changed — if so, full rebuild needed
  var cards = Array.from(c.querySelectorAll('.bar-card-v2'));
  var currentOrder = cards.map(function(card) { return card.dataset.barName; });
  var newOrder = sorted.map(function(x) { return x.bar.name; });
  var orderChanged = currentOrder.join(',') !== newOrder.join(',');
  if (orderChanged) {
    c.innerHTML = '';
    renderBars();
    return;
  }

  // Update each card's dynamic parts without touching the emblem
  sorted.forEach(function(x) {
    var bar = x.bar, i = x.i;
    var status = getStatus(bar);
    var st = statusLabel(status);
    var userReport = bar.reports.find(function(r) { return r.user_id === (currentUser && currentUser.id) && r.time > Date.now() - 30*60*1000; });
    var userStatus = userReport && userReport.status;

    // Find card by bar name
    var card = c.querySelector('[data-bar-name="' + bar.name.replace(/"/g,'&quot;') + '"]');
    if (!card) return;

    // Update status badge
    var badge = card.querySelector('.bar-status-badge-v2');
    if (badge) {
      badge.className = 'bar-status-badge-v2 status-badge-' + status.replace(' ','');
      badge.textContent = st.text;
    }

    // Update vote buttons
    var votes = card.querySelectorAll('.g2-vote');
    votes.forEach(function(btn) {
      var s = btn.dataset.status;
      btn.classList.toggle('sel', s === userStatus);
    });

    // Update card class for packed/busy glow
    var isPacked = status === 'Packed';
    var isBusy   = status === 'Busy';
    var isCollapsed = status === 'Dead' || status === 'No Data';
    var cls = 'bar-card-v2';
    if (isPacked) cls += ' v2-packed';
    else if (isBusy) cls += ' v2-busy';
    else if (isCollapsed) cls += ' v2-collapsed';
    card.className = cls;

    // Update report time
    var timeEl = card.querySelector('.bar-report-time-v2');
    if (timeEl) timeEl.textContent = bar.reports[0] ? timeAgo(bar.reports[0].time) : '';
  });
}


// ── TONIGHT BANNER ──
let tonightSlideIdx = 0;
let tonightInterval = null;

function renderTonightBanner(sorted) {
  const wrap = document.getElementById('tonight-banner-wrap');
  if (!wrap) return;

  const top3 = sorted
    .filter(({ bar }) => getStatus(bar) !== 'No Data')
    .slice(0, 3);

  if (!top3.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  const track = document.getElementById('tonight-track');
  const dotsEl = document.getElementById('tonight-dots');
  if (!track || !dotsEl) return;

  track.innerHTML = top3.map(({ bar }) => {
    const status = getStatus(bar);
    const { text, barColor } = statusLabel(status);
    const label = status === 'Packed' ? '🌙 Hottest Right Now'
                : status === 'Busy'   ? '⚡ Getting Busy'
                :                       '🟢 Still Space';
    const waitMins = getAvgWaitTime(bar.name);
    const waitStr  = waitMins > 0 ? `~${waitMins} min wait` : getRecentCount(bar) + ' reports';
    return `
      <div class="tonight-slide">
        <div class="tonight-fire">${bar.emoji}</div>
        <div class="tonight-text">
          <div class="tonight-label">${label}</div>
          <div class="tonight-bar">${bar.name}</div>
          <div class="tonight-sub">${waitStr}</div>
        </div>
        <div class="tonight-status" style="background:${barColor}22;border-color:${barColor}44;color:${barColor}">${status.toUpperCase()}</div>
      </div>`;
  }).join('');

  dotsEl.innerHTML = top3.map((_, i) =>
    `<div class="tonight-dot ${i===0?'active':''}" id="tdot-${i}" onclick="goToTonightSlide(${i})"></div>`
  ).join('');

  tonightSlideIdx = 0;
  clearInterval(tonightInterval);
  tonightInterval = setInterval(() => goToTonightSlide((tonightSlideIdx + 1) % top3.length), 3500);
}

function goToTonightSlide(i) {
  tonightSlideIdx = i;
  const track = document.getElementById('tonight-track');
  if (track) track.style.transform = `translateX(-${i * 100}%)`;
  document.querySelectorAll('.tonight-dot').forEach((d, j) => d.classList.toggle('active', j === i));
}

function updateTicker() {
  const all = [];
  bars.forEach(bar => bar.reports.slice(0, 3).forEach(r => all.push({ bar: bar.name, status: r.status, time: r.time })));
  all.sort((a, b) => b.time - a.time);
  const el = document.getElementById('ticker-track');
  if (!el) return;
  if (!all.length) { el.textContent = 'No reports yet tonight — be the first to report!'; return; }
  el.textContent = all.slice(0, 6).map(r => `${r.bar}: ${r.status} (${timeAgo(r.time)})`).join('   ·   ');
}

// ── REPORTER AVATARS ──
const AVATAR_COLORS = ['#b44fff','#ff2d78','#00f5ff','#ffd700','#00ff88','#ff9500','#6366f1','#10b981'];

function buildReporterAvatars(reports) {
  if (!reports.length) return '';
  const recent = reports.slice(0, 4);
  const avatars = recent.map((r, i) => {
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const initial = r.user_id ? r.user_id.slice(0,1).toUpperCase() : '?';
    return `<div class="reporter-avatar-sm" style="background:${color}">${initial}</div>`;
  }).join('');
  const label = reports.length === 1 ? 'reported' : `reported · ${reports.length} reports`;
  return `<div class="reporters-row-sm">${avatars}<span class="reporters-label-sm">${label}</span></div>`;
}

// ── CROWD PARTICLES ──
function buildCrowdParticles(status, barColor) {
  if (status === 'Dead' || status === 'No Data') return '';
  const count = status === 'Packed' ? 16 : 8;
  const color = status === 'Packed' ? '#ff2d78' : '#f59e0b';
  let html = '<div class="bar-crowd-particles">';
  for (let i = 0; i < count; i++) {
    const x = 5 + Math.random() * 90;
    const y = 10 + Math.random() * 80;
    const size = 2 + Math.random() * 5;
    const dur  = 1 + Math.random() * 2.5;
    const del  = Math.random() * 3;
    html += `<div class="crowd-dot-anim" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;background:${color};animation-duration:${dur}s;animation-delay:${del}s"></div>`;
  }
  return html + '</div>';
}

// ── VIBE SEGMENTS ──
function buildVibeSegs(vibe, status) {
  const total  = 12;
  const active = Math.round((vibe / 100) * total);
  const color  = status === 'Packed' ? '#ff2d78' : status === 'Busy' ? '#f59e0b' : '#22c55e';
  const showFlames = vibe >= 80;
  const segs = Array.from({length: total}, (_, i) =>
    `<div class="vibe-seg-new ${i < active ? 'active' : ''}" style="${i < active ? `background:${color};box-shadow:0 0 4px ${color}66` : ''}"></div>`
  ).join('');
  return `<div class="vibe-row-new">
    <div class="vibe-label-new">Vibe</div>
    <div class="vibe-segs-wrap">${segs}</div>
    ${showFlames ? `<div class="vibe-flames-v2"><div class="flame flame-1"></div><div class="flame flame-2"></div><div class="flame flame-3"></div></div>` : `<div class="vibe-pct-new" style="color:${color}">${vibe}%</div>`}
  </div>`;
}

// ── GET ACTIVE MISSIONS FOR BAR ──
function getBarMission(barName) {
  if (typeof SAMPLE_MISSIONS === 'undefined') return false;
  return SAMPLE_MISSIONS.some(m => m.bar === barName && m.active && !completedMissions?.has(m.id));
}


// ── FRIENDS AT BAR (for bar cards) ──
function buildFriendsAtBarRow(barName) {
  const friends = (window.friendsCheckins || []).filter(f => f.barName === barName);
  if (!friends.length) return '';
  const avatars = friends.slice(0,4).map(f =>
    `<div style="width:22px;height:22px;border-radius:50%;background:${f.color};display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;border:1.5px solid var(--bg);margin-right:-6px">${f.username[0].toUpperCase()}</div>`
  ).join('');
  const label = friends.length === 1 ? friends[0].username + ' is here' : friends.length + ' friends here';
  return `<div style="padding:4px 16px 8px;display:flex;align-items:center;gap:8px">
    <div style="display:flex">${avatars}</div>
    <span style="font-size:11px;color:var(--neon-green);font-weight:700;margin-left:8px">👥 ${label}</span>
  </div>`;
}


// ── SHOW FRIENDS AT BAR POPUP ──
function showFriendsAtBar(barIndex, event) {
  event.stopPropagation();
  const barName = bars[barIndex]?.name || "";
  const friends = (window.friendsCheckins || []).filter(f => f.barName === barName);
  if (!friends.length) return;

  // Remove existing popup
  const existing = document.getElementById('friends-at-bar-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'friends-at-bar-popup';
  popup.style.cssText = 'position:fixed;left:16px;right:16px;bottom:90px;z-index:5000;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:16px;box-shadow:0 8px 32px rgba(0,0,0,0.5)';
  popup.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:15px;font-weight:800">👥 Friends at ${barName}</div>
      <button onclick="document.getElementById('friends-at-bar-popup').remove()" style="background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;line-height:1">×</button>
    </div>
    ${friends.map(f => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="width:36px;height:36px;border-radius:50%;background:${f.color};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;flex-shrink:0">${f.username[0].toUpperCase()}</div>
        <div>
          <div style="font-size:14px;font-weight:700">${f.username}</div>
          <div style="font-size:11px;color:var(--text2)">${f.type === 'inside' ? '🎉 Inside' : '🚶 In line'}</div>
        </div>
      </div>`).join('')}
  `;
  document.body.appendChild(popup);
  // Auto close after 5s or on tap outside
  setTimeout(() => popup.remove(), 5000);
  document.addEventListener('click', () => popup.remove(), { once: true });
}

// ── RENDER BARS ──
function renderBars() {
  const c = document.getElementById('bars');
  if (!c) return;
  // Only do a full rebuild if cards don't exist yet
  // If they exist, update dynamic parts in-place to preserve image cache
  var existingCards = c.querySelectorAll('.bar-card-v2');
  var needsFullRebuild = existingCards.length === 0;
  if (!needsFullRebuild) {
    renderBarsUpdate();
    return;
  }
  c.innerHTML = '';

  const tb = document.getElementById('thursday-banner');
  if (tb) tb.style.display = isThursdayNight() ? 'flex' : 'none';

  const order = { 'Packed': 0, 'Busy': 1, 'Dead': 2, 'No Data': 3 };
  const sorted = [...bars].map((bar, i) => ({ bar, i }))
    .sort((a, b) => (order[getStatus(a.bar)] ?? 3) - (order[getStatus(b.bar)] ?? 3));

  // Update tonight banner
  renderTonightBanner(sorted);
  // Update last updated time
  const lu = document.getElementById('lines-last-updated');
  if (lu) lu.textContent = 'Updated just now';

  sorted.forEach(({ bar, i }) => {
    const last        = bar.reports[0] ? timeAgo(bar.reports[0].time) : null;
    const status      = getStatus(bar);
    const { text, cls, vibe, barColor } = statusLabel(status);
    const recentCount = getRecentCount(bar);
    const recentReports = bar.reports.filter(r => r.time > Date.now() - 30*60*1000).slice(0,4);
    const userReport  = bar.reports.find(r => r.user_id === currentUser?.id && r.time > Date.now() - 30*60*1000);
    const userStatus  = userReport?.status;
    const isCollapsed = status === 'Dead' || status === 'No Data';
    const isPacked    = status === 'Packed';
    const isBusy      = status === 'Busy';
    const hasMission  = getBarMission(bar.name);
    const avgWait     = getAvgWaitTime(bar.name);
    const checkinCount = bar.checkinCount || 0;

    // Second color for gradient
    const color2 = bar.color + '88';

    const waitText = avgWait > 0
      ? avgWait <= 10 ? { cls:'wait-short',  t:`~${avgWait} min wait` }
      : avgWait <= 20 ? { cls:'wait-medium', t:`~${avgWait} min wait` }
      :                 { cls:'wait-long',   t:`~${avgWait}+ min wait` }
      : status === 'Packed' ? { cls:'wait-long', t:'Long wait expected' }
      : status === 'Busy'   ? { cls:'wait-medium', t:'Short wait' }
      : null;

    const el = document.createElement('div');
    el.className = 'bar-card-v2'; // updated after glowSettings computed below

    // Build checkin strip separately to avoid nested template literal issues
    const _ci = activeCheckins[bar.name];
    const _checkedInCount = Object.values(activeCheckins).filter(c => c.barName === bar.name).length;
    let checkinStripHTML = '<div class="checkin-strip">';
    if (_ci) {
      const _escapedName = bar.name.replace(/'/g, "&#39;");
      checkinStripHTML += '<div class="checkin-active-banner" style="flex:1;display:flex;align-items:center;justify-content:space-between;padding:0">'
        + '<span style="font-size:13px;font-weight:700">' + (_ci.type === 'line' ? '🚶 In line' : '🎉 Inside') + ' at ' + bar.name + ' &middot; <span class="checkin-timer">' + getCheckinDuration(_ci.checkedInAt) + '</span></span>'
        + '<button class="checkin-leave-btn" onclick="leaveCheckin(&#39;' + _escapedName + '&#39;)">Leave</button>'
        + '</div>';
    } else {
      checkinStripHTML += '<button class="checkin-btn" onclick="openCheckinModal(' + i + ')">'
        + '<span class="checkin-btn-icon">📍</span>'
        + '<span class="checkin-btn-label">Check In · +20 XP</span>'
        + '</button>';
    }
    checkinStripHTML += '</div>';

    // Glow + effects per status
    const glowSettings = {
      Dead:     { color: bar.glow_empty_color  || bar.color, intensity: bar.glow_empty_intensity  ?? 20, effects: bar.effects_empty  || {} },
      Busy:     { color: bar.glow_busy_color   || bar.color, intensity: bar.glow_busy_intensity   ?? 50, effects: bar.effects_busy   || {} },
      Packed:   { color: bar.glow_packed_color || bar.color, intensity: bar.glow_packed_intensity ?? 90, effects: bar.effects_packed || {} },
      'No Data':{ color: bar.glow_nodata_color || bar.color, intensity: bar.glow_nodata_intensity ?? 30, effects: bar.effects_nodata || {} },
    };
    const glow = glowSettings[status] || glowSettings['No Data'];
    const glowAlpha = Math.round(glow.intensity * 2.55).toString(16).padStart(2,'0');
    const glowColor = glow.color + glowAlpha;
    const glowSize = Math.round(glow.intensity * 0.6);

    // Apply card classes now that glowSettings is computed
    const fx = glow.effects || {};
    let cardClasses = 'bar-card-v2';
    if (isPacked) cardClasses += ' v2-packed';
    else if (isBusy) cardClasses += ' v2-busy';
    else if (isCollapsed) cardClasses += ' v2-collapsed';
    if (fx.pulse)  cardClasses += ' emblem-effect-pulse';
    if (fx.bounce) cardClasses += ' emblem-effect-bounce';
    if (fx.shake)  cardClasses += ' emblem-effect-shake';
    if (fx.dim)    cardClasses += ' card-effect-dim';
    el.className = cardClasses;
    el.dataset.barName = bar.name;

    // Line count and inside count from checkins
    const lineCount    = Object.values(activeCheckins).filter(c => c.barName === bar.name && c.type === 'line').length;
    const insideCount  = Object.values(activeCheckins).filter(c => c.barName === bar.name && c.type === 'inside').length;

    // Friends at this bar
    const friendsHere = (window.friendsCheckins || []).filter(f => f.barName === bar.name);

    const emblSz = bar.emblem_size || 80;
    const vertOffset = bar.emblem_offset ?? -20;
    const emblHTML = bar.emblem_url
      ? '<img src="' + bar.emblem_url + '" style="width:' + emblSz + 'px;height:' + emblSz + 'px;object-fit:contain;border-radius:' + (bar.emblem_radius||0) + '%">'
      : '<span style="font-size:' + (emblSz*0.55) + 'px;line-height:1">' + bar.emoji + '</span>';

    el.innerHTML = `
      <!-- Photo area -->
      <div class="bar-photo-v2 ${isCollapsed ? 'photo-collapsed' : ''}" style="overflow:visible">

        <!-- Floating emblem -->
        <div class="bar-emblem-float" style="top:${vertOffset}px">
          <div class="bar-emblem-glow" style="background:${glow.color};width:${emblSz+40}px;height:${emblSz+40}px;opacity:${glow.intensity/100}"></div>
          <div class="bar-emblem-disc" style="width:${emblSz+24}px;height:${emblSz+24}px">
            ${emblHTML}
          </div>
        </div>

        <div class="bar-photo-gradient-v2" style="background:linear-gradient(135deg,${bar.color}22,${bar.color}44,#030308)"></div>
        <div class="bar-photo-overlay-v2"></div>

        <!-- Upper left: line count -->
        ${lineCount > 0 ? `<div class="bar-corner-badge bar-corner-left">🚶 ${lineCount} in line</div>` : ''}

        <!-- Upper right: inside count -->
        ${insideCount > 0 ? `<div class="bar-corner-badge bar-corner-right">🎉 ${insideCount} inside</div>` : ''}

        <!-- Status badge -->
        <div class="bar-status-badge-v2 status-badge-${status.replace(' ','')}">
          ${text}
        </div>
      </div>

      <!-- Body -->
      <div class="bar-body-v2">
        <div class="bar-top-v2">
          <div>
            <button onclick="openBarPage(${i})" style="background:none;border:none;padding:0;font-family:inherit;font-size:17px;font-weight:900;letter-spacing:-0.3px;color:var(--text);text-align:left;cursor:pointer;margin-bottom:2px;-webkit-tap-highlight-color:transparent">${bar.name} <span style="color:${bar.color}">›</span></button>
            <div class="bar-address-v2">📍 ${bar.address}</div>
          </div>
          <div class="bar-report-meta-v2">
            ${last ? `<div class="bar-report-time-v2">${last}</div>` : ''}
          </div>
        </div>

        ${hasMission ? `<div class="bar-mission-badge"><div class="mission-blink-dot"></div>Active Mission</div>` : ''}



        ${!isCollapsed ? `<div class="bar-meta-pills">
          ${waitText ? `<span class="wait-pill-v2 ${waitText.cls}">⏱ ${waitText.t}</span>` : ''}
          ${checkinCount > 0 ? `<span class="checkin-count-v2">👤 ${checkinCount} checked in</span>` : ''}
        </div>` : `<div class="bar-no-data-label">${status === 'No Data' ? 'Be the first to report' : 'Quiet right now'}</div>`}

        ${userStatus ? `<div class="user-report-label">You reported: ${userStatus} ✓</div>` : ''}
      </div>

      <div class="vote-row">
        <button class="vote-btn dead ${userStatus==='Dead'?'selected':''}" onclick="handleVote(event,${i},'Dead')" data-status="Dead">
          <span class="vote-btn-label">Empty</span>
        </button>
        <button class="vote-btn busy ${userStatus==='Busy'?'selected':''}" onclick="handleVote(event,${i},'Busy')" data-status="Busy">
          <span class="vote-btn-label">Busy</span>
        </button>
        <button class="vote-btn packed ${userStatus==='Packed'?'selected':''}" onclick="handleVote(event,${i},'Packed')" data-status="Packed">
          <span class="vote-btn-label">Packed</span>
        </button>
      </div>

      <!-- Friends button -->
      ${friendsHere.length > 0 ? `
      <button class="bar-friends-btn" onclick="showFriendsAtBar(${i},event)">
        <div style="display:flex;margin-right:6px">
          ${friendsHere.slice(0,3).map(f => `<div class="bar-friend-av-sm" style="background:${f.color}">${f.username[0].toUpperCase()}</div>`).join('')}
        </div>
        <span>${friendsHere.length === 1 ? friendsHere[0].username + ' is here' : friendsHere.length + ' friends here'}</span>
        <span style="margin-left:auto;opacity:0.5">›</span>
      </button>` : ''}



      ${checkinStripHTML}
    `;

    c.appendChild(el);

    // Apply border glow effect
    if (fx.borderGlow) {
      const glowC = glow.color;
      const intens = glow.intensity / 100;
      el.style.boxShadow = `0 0 0 1.5px ${glowC}${Math.round(intens*200).toString(16).padStart(2,'0')}, 0 0 ${Math.round(20*intens)}px ${glowC}${Math.round(intens*100).toString(16).padStart(2,'0')}`;
      el.style.borderColor = glowC + Math.round(intens*180).toString(16).padStart(2,'0');
    }

    // Inject particle elements
    if (fx.particles) {
      const pContainer = document.createElement('div');
      pContainer.className = 'bar-card-particles';
      for (let p = 0; p < 6; p++) {
        const dot = document.createElement('div');
        dot.className = 'bar-particle';
        const size = 3 + Math.random() * 5;
        dot.style.cssText = `width:${size}px;height:${size}px;background:${glow.color};left:${Math.random()*90+5}%;bottom:0;animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()*2}s`;
        pContainer.appendChild(dot);
      }
      el.appendChild(pContainer);
    }
  });

  updateSummaryStrip();
  updateTicker();
  renderHotStrip();
  if (currentView === 'grid2') renderGrid2();
  if (currentView === 'grid3') renderGrid3();
  if (currentView === 'map')   renderRealMap();
  if (currentView === 'feed')  renderFeedView();
  startPackedParticles();
}

function scrollToBar(targetIdx) {
  setView('list');
  setTimeout(() => {
    const order = { 'Packed': 0, 'Busy': 1, 'Dead': 2, 'No Data': 3 };
    const sorted = [...bars].map((bar, idx) => ({ bar, idx }))
      .sort((a, b) => (order[getStatus(a.bar)] ?? 3) - (order[getStatus(b.bar)] ?? 3));
    const pos = sorted.findIndex(s => s.idx === targetIdx);
    const cards = document.querySelectorAll('.bar-card-v2');
    if (cards[pos]) cards[pos].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 150);
}

// ── GRID 2 — Mini cards 2col ──
function renderGrid2() {
  const g = document.getElementById('grid2-container');
  if (!g) return;
  g.innerHTML = '';
  const order = { 'Packed': 0, 'Busy': 1, 'Dead': 2, 'No Data': 3 };
  const sorted = [...bars].map((bar, i) => ({ bar, i }))
    .sort((a, b) => (order[getStatus(a.bar)] ?? 3) - (order[getStatus(b.bar)] ?? 3));

  sorted.forEach(({ bar, i }) => {
    const status = getStatus(bar);
    const { text, barColor } = statusLabel(status);
    const isPacked = status === 'Packed';
    const isBusy   = status === 'Busy';
    const userReport = bar.reports.find(r => r.user_id === currentUser?.id && r.time > Date.now() - 30*60*1000);
    const userStatus = userReport?.status;
    const glowColor = isPacked ? 'rgba(255,45,120,0.35)' : isBusy ? 'rgba(245,158,11,0.25)' : 'transparent';
    const borderColor = isPacked ? 'rgba(255,45,120,0.4)' : isBusy ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)';
    const emblSz = Math.min(bar.emblem_size || 48, 36);
    const emblHTML = bar.emblem_url
      ? '<img src="' + bar.emblem_url + '" style="width:' + emblSz + 'px;height:' + emblSz + 'px;object-fit:contain;border-radius:' + (bar.emblem_radius||0) + '%">'
      : '<span style="font-size:24px">' + bar.emoji + '</span>';

    const el = document.createElement('div');
    el.className = 'g2-card' + (isPacked ? ' g2-packed' : '');
    el.style.cssText = 'border-color:' + borderColor + ';box-shadow:0 0 16px ' + glowColor;
    el.innerHTML = `
      <div class="g2-emblem-wrap">
        <div class="g2-emblem-glow" style="background:${bar.color}"></div>
        <div class="g2-emblem">${emblHTML}</div>
      </div>
      <div class="g2-body">
        <div class="g2-name">${bar.name}</div>
        <div class="g2-badge" style="background:${barColor}22;color:${barColor};border:1px solid ${barColor}44">${text}</div>
        <div class="g2-addr">${bar.address}</div>
      </div>
      <div class="g2-votes">
        <button class="g2-vote ${userStatus==='Dead'?'sel':''}" onclick="handleVote(event,${i},'Dead')" data-status="Dead" style="${userStatus==='Dead'?'color:'+barColor:''}">Empty</button>
        <button class="g2-vote ${userStatus==='Busy'?'sel':''}" onclick="handleVote(event,${i},'Busy')" data-status="Busy" style="${userStatus==='Busy'?'color:'+barColor:''}">Busy</button>
        <button class="g2-vote ${userStatus==='Packed'?'sel':''}" onclick="handleVote(event,${i},'Packed')" data-status="Packed" style="${userStatus==='Packed'?'color:'+barColor:''}">Packed</button>
      </div>
    `;
    el.addEventListener('click', (e) => { if (!e.target.classList.contains('g2-vote')) openBarPage(i); });
    g.appendChild(el);
  });
}

// ── GRID 3 — Tiles 3col ──
function renderGrid3() {
  const g = document.getElementById('grid3-container');
  if (!g) return;
  g.innerHTML = '';
  const order = { 'Packed': 0, 'Busy': 1, 'Dead': 2, 'No Data': 3 };
  const sorted = [...bars].map((bar, i) => ({ bar, i }))
    .sort((a, b) => (order[getStatus(a.bar)] ?? 3) - (order[getStatus(b.bar)] ?? 3));

  sorted.forEach(({ bar, i }) => {
    const status   = getStatus(bar);
    const { barColor } = statusLabel(status);
    const isPacked = status === 'Packed';
    const isBusy   = status === 'Busy';
    const isEmpty  = status === 'Dead';
    const dotColor = isPacked ? '#ff2d78' : isBusy ? '#f59e0b' : isEmpty ? '#22c55e' : 'rgba(255,255,255,0.2)';
    const dotGlow  = isPacked ? '0 0 8px #ff2d78' : isBusy ? '0 0 6px #f59e0b' : isEmpty ? '0 0 4px #22c55e' : 'none';
    const borderColor = isPacked ? 'rgba(255,45,120,0.5)' : isBusy ? 'rgba(245,158,11,0.4)' : isEmpty ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)';
    const opacity  = status === 'No Data' ? '0.45' : '1';
    const emblSz   = Math.min(bar.emblem_size || 48, 32);
    const emblHTML = bar.emblem_url
      ? '<img src="' + bar.emblem_url + '" style="width:' + emblSz + 'px;height:' + emblSz + 'px;object-fit:contain;border-radius:' + (bar.emblem_radius||0) + '%">'
      : '<span style="font-size:28px">' + bar.emoji + '</span>';

    const el = document.createElement('div');
    el.className = 'g3-tile' + (isPacked ? ' g3-packed' : '');
    el.style.cssText = 'opacity:' + opacity + ';border-color:' + borderColor;
    el.onclick = () => openBarPage(i);
    el.innerHTML = `
      <div class="g3-tile-bg" style="background:radial-gradient(circle at 50% 40%,${bar.color}44,transparent 70%)"></div>
      ${emblHTML}
      <div class="g3-name">${bar.name}</div>
      <div class="g3-dot" style="background:${dotColor};box-shadow:${dotGlow}"></div>
    `;
    g.appendChild(el);
  });
}

// ── REAL MAP VIEW ──
let leafletMap = null;
let leafletMarkers = [];



function renderRealMap() {
  const container = document.getElementById('leaflet-map');
  if (!container) return;

  // Init map once
  if (!leafletMap) {
    leafletMap = L.map('leaflet-map', {
      center: [35.2803, -120.6598],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(leafletMap);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);
  }

  // Clear old markers
  leafletMarkers.forEach(m => m.remove());
  leafletMarkers = [];

  bars.forEach((bar, i) => {
    const coords = BAR_COORDS[bar.name];
    if (!coords) return;

    const status   = getStatus(bar);
    const { barColor } = statusLabel(status);
    const isPacked = status === 'Packed';
    const isBusy   = status === 'Busy';
    const dotColor = isPacked ? '#ff2d78' : isBusy ? '#f59e0b' : status === 'Dead' ? '#22c55e' : '#888';
    const glowSize = isPacked ? 20 : isBusy ? 14 : 8;
    const pulse    = isPacked ? 'animation:map-pin-pulse 1.5s ease-in-out infinite;' : '';
    const emblSz   = 36;
    const emblHTML = bar.emblem_url
      ? '<img src="' + bar.emblem_url + '" style="width:' + emblSz + 'px;height:' + emblSz + 'px;object-fit:contain;border-radius:' + (bar.emblem_radius||0) + '%">'
      : '<span style="font-size:26px;line-height:1">' + bar.emoji + '</span>';

    // Read pin style from admin settings
    let settings = {};
    try { settings = JSON.parse(localStorage.getItem('dtslo_card_layout') || '{}'); } catch(e) {}
    const pinStyle = settings.mapPinStyle || 'emblem';
    const pinSz    = settings.mapPinSize  || emblSz;

    let iconHtml = '';
    if (pinStyle === 'dot') {
      iconHtml = '<div style="position:relative;' + pulse + '">'
        + '<div style="width:' + (pinSz/2) + 'px;height:' + (pinSz/2) + 'px;border-radius:50%;background:' + dotColor + ';box-shadow:0 0 ' + glowSize + 'px ' + dotColor + ';border:2px solid rgba(6,6,15,0.8)"></div>'
        + '</div>';
    } else if (pinStyle === 'pin') {
      iconHtml = '<div style="position:relative;' + pulse + ';text-align:center">'
        + '<div style="font-size:' + pinSz + 'px;filter:drop-shadow(0 0 6px ' + dotColor + ')">📍</div>'
        + '</div>';
    } else if (pinStyle === 'bubble') {
      iconHtml = '<div style="position:relative;' + pulse + ';background:rgba(12,12,28,0.95);border:1.5px solid ' + dotColor + ';border-radius:20px;padding:4px 10px;box-shadow:0 4px 16px rgba(0,0,0,0.5);white-space:nowrap">'
        + '<div style="font-size:11px;font-weight:800;color:white">' + bar.emoji + ' ' + bar.name + '</div>'
        + '<div style="font-size:9px;color:' + dotColor + ';font-weight:700">' + (status === 'Dead' ? 'Empty' : status === 'No Data' ? 'No data' : status) + '</div>'
        + '</div>';
    } else {
      // Default: emblem style
      iconHtml = '<div style="position:relative;display:flex;align-items:center;justify-content:center;' + pulse + '">'
        + '<div style="position:absolute;width:' + (pinSz+glowSize) + 'px;height:' + (pinSz+glowSize) + 'px;border-radius:50%;background:' + bar.color + ';filter:blur(' + (glowSize/2) + 'px);opacity:0.6"></div>'
        + '<div style="position:relative;z-index:2;width:' + (pinSz+8) + 'px;height:' + (pinSz+8) + 'px;border-radius:50%;background:rgba(6,6,15,0.85);border:2px solid ' + dotColor + ';display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5)">'
        + emblHTML
        + '</div>'
        + '<div style="position:absolute;bottom:-5px;right:-2px;z-index:3;width:10px;height:10px;border-radius:50%;background:' + dotColor + ';border:1.5px solid #06060f;box-shadow:0 0 6px ' + dotColor + '"></div>'
        + '</div>';
    }

    const icon = L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [emblSz + glowSize + 10, emblSz + glowSize + 10],
      iconAnchor: [(emblSz + glowSize + 10)/2, (emblSz + glowSize + 10)/2]
    });

    const marker = L.marker(coords, { icon }).addTo(leafletMap);

    // Popup
    const recentCount = getRecentCount(bar);
    const popupHtml = `
      <div style="font-family:'DM Sans',sans-serif;min-width:180px;background:#0f0f1a;color:white;padding:12px;border-radius:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:22px">${bar.emoji}</span>
          <div>
            <div style="font-size:14px;font-weight:800">${bar.name}</div>
            <div style="font-size:10px;color:#5a5a8a">${bar.address}</div>
          </div>
        </div>
        <div style="font-size:11px;font-weight:800;color:${dotColor};margin-bottom:10px">${status === 'Dead' ? 'Empty' : status === 'No Data' ? 'No reports yet' : status} ${recentCount > 0 ? '· ' + recentCount + ' reports' : ''}</div>
        <div style="display:flex;gap:6px">
          <button onclick="handleVote(event,${i},'Dead');this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click()" style="flex:1;padding:6px 0;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:8px;color:#22c55e;font-size:11px;font-weight:800;cursor:pointer">Empty</button>
          <button onclick="handleVote(event,${i},'Busy');this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click()" style="flex:1;padding:6px 0;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:8px;color:#f59e0b;font-size:11px;font-weight:800;cursor:pointer">Busy</button>
          <button onclick="handleVote(event,${i},'Packed');this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click()" style="flex:1;padding:6px 0;background:rgba(255,45,120,0.1);border:1px solid rgba(255,45,120,0.2);border-radius:8px;color:#ff2d78;font-size:11px;font-weight:800;cursor:pointer">Packed</button>
        </div>
        <button onclick="openBarPage(${i});this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click()" style="width:100%;margin-top:6px;padding:7px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.2);border-radius:8px;color:#ffd700;font-size:11px;font-weight:800;cursor:pointer">View Bar Page →</button>
      </div>`;

    marker.bindPopup(popupHtml, {
      className: 'dtslo-popup',
      closeButton: true,
      maxWidth: 220
    });

    leafletMarkers.push(marker);
  });
}

// ── FEED VIEW ──
function renderFeedView() {
  const c = document.getElementById('feed-entries');
  const empty = document.getElementById('feed-empty');
  if (!c) return;
  const all = [];
  bars.forEach(bar => bar.reports.forEach(r => all.push({ ...r, barName: bar.name, barEmoji: bar.emoji })));
  all.sort((a, b) => b.time - a.time);
  const recent = all.filter(r => r.time > Date.now() - 2 * 60 * 60 * 1000).slice(0, 30);

  if (!recent.length) {
    c.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  c.innerHTML = recent.map(r => {
    const { barColor, text } = statusLabel(r.status);
    const initial = r.user_id ? r.user_id.slice(0,2).toUpperCase() : '??';
    return `<div class="feed-entry">
      <div class="feed-entry-avatar" style="background:${barColor}">${initial}</div>
      <div class="feed-entry-body">
        <div class="feed-entry-bar">${r.barEmoji} ${r.barName}</div>
        <div class="feed-entry-meta">${timeAgo(r.time)}</div>
      </div>
      <div class="feed-entry-badge" style="background:${barColor}22;color:${barColor}">${text}</div>
    </div>`;
  }).join('');
}

function setView(v) {
  currentView = v;
  const views = { list:'bars-list', grid2:'bars-grid2', grid3:'bars-grid3', map:'bars-map', feed:'bars-feed' };
  Object.entries(views).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = key === v ? 'block' : 'none';
  });
  ['list','grid2','grid3','map','feed'].forEach(key => {
    const btn = document.getElementById('view-' + key + '-btn');
    if (btn) btn.classList.toggle('active', key === v);
  });
  if (v === 'grid2') renderGrid2();
  if (v === 'grid3') renderGrid3();
  if (v === 'map')   renderRealMap();
  if (v === 'feed')  renderFeedView();
}

// ── LOAD REPORTS ──
async function loadReports() {
  await loadBarsFromDB();
  if (!document.getElementById('bars')) return;
  document.getElementById('bars').innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  try {
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseClient
      .from('reports').select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false });
    if (error) throw error;
    bars.forEach(b => b.reports = []);
    data.forEach(r => {
      const bar = bars.find(b => b.name === r.bar);
      if (bar) bar.reports.push({ status: r.status, time: new Date(r.created_at).getTime(), user_id: r.user_id });
    });
  } catch (e) { console.error(e); showToast('❌ Could not load reports'); }
  renderBars();
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(loadReports, 60000);
  const rs = document.getElementById('refresh-status');
  if (rs) rs.textContent = `Updated ${new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })} · Auto-refresh in 60s`;
}

// ── VOTE / REPORT ──
function handleVote(event, i, status) {
  popVoteBtn(event.currentTarget);
  const card = event.currentTarget.closest('.bar-card-v2');
  if (card) spawnBarParticles(card, status);
  report(i, status);
}

async function report(i, status, headcount) {
  if (!currentUser) { showToast('⚠️ Please sign in to report'); return; }
  const bar = bars[i];
  // Verify location before submitting
  verifyLocation(bar.name, async (allowed) => {
    if (!allowed) return;
    bar.reports = bar.reports.filter(r => !(r.user_id === currentUser.id && r.time > Date.now() - 30*60*1000));
    bar.reports.unshift({ status, time: Date.now(), user_id: currentUser.id, headcount: headcount || null });
    renderBars();
  try {
    await supabaseClient.from('reports').insert([{
      bar: bar.name, status, user_id: currentUser.id,
      headcount: headcount || null
    }]);
    gainXP(10); reportCount++;
    showToast(`✅ ${bar.name} — ${status} · +10 XP`);
  } catch (e) { showToast('❌ Failed to submit'); }
  }); // end verifyLocation
}

// ══════════════════════════════════════════════
// CHECK-IN SYSTEM
// ══════════════════════════════════════════════
let ciBarIndex = null;
let ciBarName  = '';
let ciType     = '';
let ciStatus   = '';
let ciHeadcount = 0;
let nudgeTimer  = null;
let checkinDurationInterval = null;
let activeCheckins = {};
let waitTimeData = {};

function openCheckinModal(barIndex) {
  ciBarIndex  = barIndex;
  ciBarName   = bars[barIndex].name;
  document.getElementById('ci-bar-name').textContent = 'Check In · ' + ciBarName;
  showCiStep(1);
  document.getElementById('checkin-modal').classList.add('open');
}

function closeCheckinModal() {
  document.getElementById('checkin-modal').classList.remove('open');
}

function showCiStep(n) {
  document.querySelectorAll('.checkin-modal-step').forEach(s => s.classList.remove('active'));
  document.getElementById('ci-step-' + n).classList.add('active');
}

function ciChooseType(type) {
  ciType = type;
  if (type === 'inside') {
    confirmCheckin('inside', null, 0);
  } else {
    showCiStep(2);
  }
}

function ciChooseStatus(status) {
  ciStatus = status;
  report(ciBarIndex, status);
  if (status === 'Busy' || status === 'Packed') {
    const grid = document.getElementById('headcount-grid');
    grid.innerHTML = '';
    ciHeadcount = 0;
    for (let n = 5; n <= 60; n += 5) {
      const btn = document.createElement('button');
      btn.className = 'hc-btn';
      btn.textContent = n === 60 ? '60+' : n;
      btn.onclick = () => { ciHeadcount = n; confirmCheckin('line', ciStatus, ciHeadcount); };
      grid.appendChild(btn);
    }
    showCiStep(3);
  } else {
    confirmCheckin('line', status, 0);
  }
}

function ciSkipHeadcount() {
  confirmCheckin('line', ciStatus, 0);
}

async function confirmCheckin(type, status, headcount) {
  closeCheckinModal();

  verifyLocation(ciBarName, async (allowed) => {
    if (!allowed) return;

  const now = Date.now();
  activeCheckins[ciBarName] = {
    type, barName: ciBarName, barIndex: ciBarIndex,
    checkedInAt: now, status
  };

  let xpGained = 15;
  if (headcount > 0) xpGained += 20;
  gainXP(xpGained);
  reportCount++;

  if (headcount > 0) bars[ciBarIndex].headcountAvg = headcount;

  try {
    await supabaseClient.from('checkins').insert([{
      user_id: currentUser.id, bar: ciBarName, type,
      headcount: headcount || null,
      checked_in_at: new Date(now).toISOString()
    }]);
  } catch(e) { console.log('Checkin save failed:', e.message); }

  showToast(`📍 Checked in at ${ciBarName} · +${xpGained} XP`);

  // Award bar stamp collectible on first visit
  try { awardBarStamp(ciBarName, bars[ciBarIndex]); } catch(e) {}
  renderBars();

  if (type === 'line') startNudgeTimer();
  startDurationTicker();
  }); // end verifyLocation
}

function startNudgeTimer() {
  clearTimeout(nudgeTimer);
  nudgeTimer = setTimeout(() => {
    const ci = activeCheckins[ciBarName] || Object.values(activeCheckins).find(c => c.type === 'line');
    if (!ci) return;
    document.getElementById('nudge-title').textContent = `Still in line at ${ci.barName}?`;
    document.getElementById('nudge-sub').textContent   = `You checked in ${getCheckinDuration(ci.checkedInAt)} ago`;
    document.getElementById('nudge-modal').classList.add('open');
  }, 10 * 60 * 1000);
}

function nudgeStillInLine() {
  document.getElementById('nudge-modal').classList.remove('open');
  showToast('👍 Still tracking your wait');
  startNudgeTimer();
}

function nudgeNowInside() {
  document.getElementById('nudge-modal').classList.remove('open');
  const ci = Object.values(activeCheckins).find(c => c.type === 'line');
  if (!ci) return;
  const waitMins = Math.round((Date.now() - ci.checkedInAt) / 60000);
  logWaitTime(ci.barName, waitMins);
  ci.type = 'inside';
  activeCheckins[ci.barName] = ci;
  gainXP(25);
  showToast(`🎉 Enjoy! Wait was ~${waitMins}min · +25 XP`);
  renderBars();
  clearTimeout(nudgeTimer);
}

function nudgeLeft() {
  document.getElementById('nudge-modal').classList.remove('open');
  const ci = Object.values(activeCheckins).find(c => c.type === 'line');
  if (ci) leaveCheckin(ci.barName);
}

function leaveCheckin(barName) {
  const ci = activeCheckins[barName];
  if (!ci) return;
  if (ci.type === 'inside') logWaitTime(barName, Math.round((Date.now() - ci.checkedInAt) / 60000));
  delete activeCheckins[barName];
  clearTimeout(nudgeTimer);
  showToast('👋 Checked out of ' + barName);
  renderBars();
}

function logWaitTime(barName, minutes) {
  if (!waitTimeData[barName]) waitTimeData[barName] = [];
  waitTimeData[barName].push(minutes);
  if (waitTimeData[barName].length > 10) waitTimeData[barName].shift();
}

function getAvgWaitTime(barName) {
  const data = waitTimeData[barName];
  if (!data || !data.length) return 0;
  return Math.round(data.reduce((a, b) => a + b, 0) / data.length);
}

function getCheckinDuration(checkedInAt) {
  const mins = Math.floor((Date.now() - checkedInAt) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm';
  return Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
}

function startDurationTicker() {
  clearInterval(checkinDurationInterval);
  checkinDurationInterval = setInterval(() => {
    document.querySelectorAll('.checkin-timer').forEach(el => {
      const ci = Object.values(activeCheckins)[0];
      if (ci) el.textContent = getCheckinDuration(ci.checkedInAt);
    });
  }, 30000);
}

// Auto-expire old checkins
setInterval(() => {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  let changed = false;
  Object.keys(activeCheckins).forEach(k => {
    if (activeCheckins[k].checkedInAt < cutoff) { delete activeCheckins[k]; changed = true; }
  });
  if (changed) renderBars();
}, 60000);

// ── BAR STAMP COLLECTIBLES ──
async function awardBarStamp(barName, bar) {
  if (!currentUser || !supabaseClient) return;

  // Build slug from bar name
  var slug = barName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  var stampKey = 'stamp_' + slug;

  // Check if already earned (localStorage first for speed)
  var earned = JSON.parse(localStorage.getItem('dtslo_stamps') || '{}');
  if (earned[slug]) return; // already have it

  // Check Supabase — look for existing stamp in inventory
  try {
    var res = await supabaseClient
      .from('player_inventory')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('source', stampKey)
      .limit(1);

    if (res.data && res.data.length) {
      // Already in DB — mark locally and return
      earned[slug] = true;
      localStorage.setItem('dtslo_stamps', JSON.stringify(earned));
      return;
    }

    // Find the reward_items entry for this bar's stamp
    var itemRes = await supabaseClient
      .from('reward_items')
      .select('id,name,emoji')
      .eq('source_value', slug)
      .eq('source', 'bar_checkin')
      .eq('is_active', true)
      .limit(1);

    var itemId = null;
    var itemName = barName + ' Stamp';
    var itemEmoji = bar && bar.emoji ? bar.emoji : '🏅';

    if (itemRes.data && itemRes.data.length) {
      itemId = itemRes.data[0].id;
      itemName = itemRes.data[0].name;
      itemEmoji = itemRes.data[0].emoji || itemEmoji;
    }

    // Grant to inventory
    await supabaseClient.from('player_inventory').insert({
      user_id: currentUser.id,
      item_id: itemId,
      quantity: 1,
      source: stampKey,
      earned_at: new Date().toISOString(),
    });

    // Mark locally
    earned[slug] = true;
    localStorage.setItem('dtslo_stamps', JSON.stringify(earned));

    // Celebrate — show stamp earned toast after the check-in toast
    setTimeout(function() {
      if (typeof showToast === 'function') {
        showToast(itemEmoji + ' ' + itemName + ' stamp earned!');
      }
    }, 2000);

    // Award bonus XP for first visit
    try { gainXP(25); } catch(e) {}

  } catch(e) {
    console.warn('[stamps]', e.message);
  }
}
