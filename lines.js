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
async function loadBarsFromDB() {
  try {
    const { data, error } = await supabaseClient
      .from('bars')
      .select('*')
      .eq('published', true)
      .eq('hidden', false)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (data && data.length) {
      // Merge Supabase data into bars array
      data.forEach(row => {
        const idx = bars.findIndex(b => b.name === row.name);
        if (idx > -1) {
          bars[idx].color       = row.color   || bars[idx].color;
          bars[idx].emoji       = row.emoji   || bars[idx].emoji;
          bars[idx].address     = row.address || bars[idx].address;
          bars[idx].emblem_url  = row.emblem_url || null;
          bars[idx].emblem_size = row.emblem_size || 48;
          bars[idx].hours       = row.hours || '';
          bars[idx].phone       = row.phone || '';
          bars[idx].tags        = row.tags  || [];
          bars[idx].db_id       = row.id;
        }
      });
    }
  } catch(e) {
    console.warn('loadBarsFromDB:', e.message);
  }
}

// ── LOCATION VERIFICATION ──
const BAR_COORDS = {
  "Black Sheep Bar & Grill":   { lat: 35.2802, lng: -120.6615 },
  "Bull's Tavern":             { lat: 35.2800, lng: -120.6614 },
  "Frog & Peach Pub":          { lat: 35.2797, lng: -120.6609 },
  "High Bar":                  { lat: 35.2790, lng: -120.6600 },
  "Nightcap":                  { lat: 35.2796, lng: -120.6612 },
  "Feral Kitchen & Lounge":    { lat: 35.2803, lng: -120.6617 },
  "The Library":               { lat: 35.2801, lng: -120.6613 },
  "The Mark":                  { lat: 35.2798, lng: -120.6610 },
  "McCarthy's Irish Pub":      { lat: 35.2799, lng: -120.6611 },
  "Sidecar SLO":               { lat: 35.2795, lng: -120.6608 },
  "Eureka!":                   { lat: 35.2793, lng: -120.6605 },
  "Finney's Crafthouse":       { lat: 35.2804, lng: -120.6618 },
  "Novo Restaurant & Lounge":  { lat: 35.2791, lng: -120.6602 },
  "BA Start Arcade Bar":       { lat: 35.2792, lng: -120.6604 },
  "The Carrisa":               { lat: 35.2805, lng: -120.6620 },
};
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

// ── RENDER BARS ──
function renderBars() {
  const c = document.getElementById('bars');
  if (!c) return;
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
    el.className = `bar-card-v2${isPacked ? ' v2-packed' : isBusy ? ' v2-busy' : isCollapsed ? ' v2-collapsed' : ''}`;  // v3: no emoji-shake

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

    el.innerHTML = `
      <!-- Photo area -->
      <div class="bar-photo-v2 ${isCollapsed ? 'photo-collapsed' : ''}">
        <div class="bar-photo-gradient-v2" style="background:linear-gradient(135deg,${bar.color}22,${bar.color}44,#030308)">
          ${bar.emblem_url ? `<img src="${bar.emblem_url}" style="width:${bar.emblem_size||48}px;height:${bar.emblem_size||48}px;object-fit:cover;border-radius:8px;display:block">` : `<span class="bar-emoji-v2" style="filter:drop-shadow(0 0 18px ${bar.color}aa)">${bar.emoji}</span>`}
        </div>
        <div class="bar-photo-overlay-v2"></div>
        <div class="bar-status-badge-v2 status-badge-${status.replace(' ','')}">
          ${text}
        </div>
        ${recentCount > 0 ? `<div class="bar-headcount-v2">👥 ${recentCount} reports</div>` : ''}
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
        ${recentReports.length ? buildReporterAvatars(recentReports) : ''}
        ${!isCollapsed ? buildVibeSegs(vibe, status) : ''}

        ${!isCollapsed ? `<div class="bar-meta-pills">
          ${waitText ? `<span class="wait-pill-v2 ${waitText.cls}">⏱ ${waitText.t}</span>` : ''}
          ${checkinCount > 0 ? `<span class="checkin-count-v2">👤 ${checkinCount} checked in</span>` : ''}
        </div>` : `<div class="bar-no-data-label">${status === 'No Data' ? 'Be the first to report' : 'Quiet right now'}</div>`}

        ${userStatus ? `<div class="user-report-label">You reported: ${userStatus} ✓</div>` : ''}
      </div>

      <div class="vote-row">
        <button class="vote-btn dead ${userStatus==='Dead'?'selected':''}" onclick="handleVote(event,${i},'Dead')">
          <span class="vote-btn-icon">🟢</span>
          <span class="vote-btn-label">Empty</span>
        </button>
        <button class="vote-btn busy ${userStatus==='Busy'?'selected':''}" onclick="handleVote(event,${i},'Busy')">
          <span class="vote-btn-icon">🟡</span>
          <span class="vote-btn-label">Busy</span>
        </button>
        <button class="vote-btn packed ${userStatus==='Packed'?'selected':''}" onclick="handleVote(event,${i},'Packed')">
          <span class="vote-btn-icon">🔴</span>
          <span class="vote-btn-label">Packed</span>
        </button>
      </div>

      <!-- Friends at this bar -->
      ${buildFriendsAtBarRow(bar.name)}



      ${checkinStripHTML}
    `;

    c.appendChild(el);
  });

  updateSummaryStrip();
  updateTicker();
  renderHotStrip();
  if (currentView === 'map')  renderMapView();
  if (currentView === 'feed') renderFeedView();
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

// ── MAP / GRID VIEW ──
function renderMapView() {
  const g = document.getElementById('map-grid');
  if (!g) return;
  g.innerHTML = '';
  const order = { 'Packed': 0, 'Busy': 1, 'Dead': 2, 'No Data': 3 };
  const sorted = [...bars].map((bar, i) => ({ bar, i }))
    .sort((a, b) => (order[getStatus(a.bar)] ?? 3) - (order[getStatus(b.bar)] ?? 3));

  sorted.forEach(({ bar, i }) => {
    const status = getStatus(bar);
    const { text, barColor, vibe } = statusLabel(status);
    const count = getRecentCount(bar);
    const el = document.createElement('div');
    el.className = 'map-card';
    el.onclick = () => { setView('list'); setTimeout(() => document.querySelectorAll('.bar-card-v2')[i]?.scrollIntoView({ behavior:'smooth', block:'center' }), 100); };
    el.innerHTML = `
      <div class="map-card-top" style="background:${barColor}"></div>
      <div class="map-card-emoji">${bar.emoji}</div>
      <div class="map-card-name">${bar.name}</div>
      <div class="map-card-status" style="color:${barColor}">${text}</div>
      <div class="map-card-vibe"><div class="map-card-vibe-fill" style="width:${vibe}%;background:${barColor}"></div></div>
      ${count > 0 ? `<div class="map-card-count">👥 ${count} reports</div>` : '<div class="map-card-count" style="opacity:0.4">No reports</div>'}
    `;
    g.appendChild(el);
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
  const bList = document.getElementById('bars-list');
  const bMap  = document.getElementById('bars-map');
  const bFeed = document.getElementById('bars-feed');
  if (bList) bList.style.display = v === 'list' ? 'block' : 'none';
  if (bMap)  bMap.style.display  = v === 'map'  ? 'block' : 'none';
  if (bFeed) bFeed.style.display = v === 'feed' ? 'block' : 'none';
  const btnList = document.getElementById('view-list-btn');
  const btnMap  = document.getElementById('view-map-btn');
  const btnFeed = document.getElementById('view-feed-btn');
  if (btnList) btnList.classList.toggle('active', v === 'list');
  if (btnMap)  btnMap.classList.toggle('active',  v === 'map');
  if (btnFeed) btnFeed.classList.toggle('active', v === 'feed');
  if (v === 'map')  renderMapView();
  if (v === 'feed') renderFeedView();
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
