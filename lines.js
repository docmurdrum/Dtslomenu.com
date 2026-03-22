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
    return `<div class="hot-card" onclick="document.querySelectorAll('.bar-card')[${i}]?.scrollIntoView({behavior:'smooth',block:'center'})">
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

function updateTicker() {
  const all = [];
  bars.forEach(bar => bar.reports.slice(0, 3).forEach(r => all.push({ bar: bar.name, status: r.status, time: r.time })));
  all.sort((a, b) => b.time - a.time);
  const el = document.getElementById('ticker-track');
  if (!el) return;
  if (!all.length) { el.textContent = 'No reports yet tonight — be the first to report!'; return; }
  el.textContent = all.slice(0, 6).map(r => `${r.bar}: ${r.status} (${timeAgo(r.time)})`).join('   ·   ');
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

  sorted.forEach(({ bar, i }) => {
    const last        = bar.reports[0] ? timeAgo(bar.reports[0].time) : 'No reports yet';
    const status      = getStatus(bar);
    const { text, cls, vibe, barColor } = statusLabel(status);
    const recentCount = getRecentCount(bar);
    const recent3     = bar.reports.slice(0, 3);
    const userReport  = bar.reports.find(r => r.user_id === currentUser?.id && r.time > Date.now() - 30*60*1000);
    const userStatus  = userReport?.status;

    const rank = sorted.indexOf(sorted.find(s => s.i === i));
    const el = document.createElement('div');
    el.className = 'bar-card' + (status === 'Packed' ? ' is-packed' : status === 'Busy' ? ' is-busy' : '');
    el.innerHTML = `
      <div class="bar-card-flood" style="background:${barColor}"></div>
      <div class="bar-status-bar" style="background:${barColor}"></div>
      <div class="bar-card-inner">
        <div class="bar-header">
          <div class="bar-name-row">
            <div class="bar-emoji-circle">${bar.emoji}</div>
            <div class="bar-name-block">
              <div class="bar-name">${bar.name}</div>
              <div class="bar-address">📍 ${bar.address}</div>
            </div>
          </div>
          <div class="bar-meta">
            <div class="bar-time">${last}</div>
            ${recentCount > 0 ? `<div class="bar-report-badge">👥 ${recentCount}</div>` : ''}
          </div>
        </div>

        <div class="bar-status-row">
          <div class="status-pill ${cls}"><div class="dot"></div>${text}</div>
          ${userStatus ? `<div style="font-size:11px;color:var(--text2);font-weight:600">You: ${userStatus} ✓</div>` : ''}
        </div>

        <div class="vibe-wrap">
          <div class="vibe-labels"><span>Empty</span><span>Vibe Meter</span><span>Packed</span></div>
          <div class="vibe-track" id="vibe-${i}"></div>
        </div>
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

      ${recent3.length ? `
      <div class="bar-feed">
        ${recent3.map(r => {
          const { barColor: rc } = statusLabel(r.status);
          const initial = r.user_id ? r.user_id.slice(0,1).toUpperCase() : '?';
          return `<div class="feed-item">
            <div class="feed-avatar" style="background:${rc}">${initial}</div>
            <span class="feed-status-text" style="color:${rc}">${r.status}</span>
            ${r.headcount ? `<span style="font-size:11px;color:var(--text2)">· ~${r.headcount} people</span>` : ''}
            <span>· ${timeAgo(r.time)}</span>
          </div>`;
        }).join('')}
      </div>` : ''}

      ${(() => {
        const ci = activeCheckins[bar.name];
        const avgWait = getAvgWaitTime(bar.name);
        const checkedInCount = Object.values(activeCheckins).filter(c => c.barName === bar.name).length;
        return `
        <div class="bar-stats-row" style="padding: 0 18px 8px;">
          ${checkedInCount > 0 ? `<div class="bar-stat">📍 <span class="bar-stat-val">${checkedInCount}</span> checked in</div>` : ''}
          ${avgWait > 0 ? `<div class="bar-stat">⏱ avg wait <span class="bar-stat-val">${avgWait}m</span></div>` : ''}
          ${bar.headcountAvg > 0 ? `<div class="bar-stat">👥 ~<span class="bar-stat-val">${bar.headcountAvg}</span> in line</div>` : ''}
        </div>
        <div class="checkin-strip">
          ${ci ? `
            <div class="checkin-active-banner" style="flex:1;display:flex;align-items:center;justify-content:space-between;padding:0">
              <span style="font-size:13px;font-weight:700">${ci.type === 'line' ? '🚶 In line' : '🎉 Inside'} at ${bar.name} · <span class="checkin-timer">${getCheckinDuration(ci.checkedInAt)}</span></span>
              <button class="checkin-leave-btn" onclick="leaveCheckin('${bar.name}')">Leave</button>
            </div>
          ` : `
            <button class="checkin-btn" onclick="openCheckinModal(${i})">
              <span class="checkin-btn-icon">📍</span>
              <span class="checkin-btn-label">Check In</span>
            </button>
          `}
        </div>`;
      })()}
    `;

    if (rank === 0 && status !== 'No Data') {
      const wrap = document.createElement('div');
      wrap.className = 'flame-wrap';
      wrap.style.position = 'relative';
      wrap.style.marginTop = '18px';
      const jackpot = document.createElement('div');
      jackpot.className = 'jackpot-label';
      jackpot.textContent = '🔥 HOTTEST SPOT';
      wrap.appendChild(jackpot);
      wrap.appendChild(el);
      c.appendChild(wrap);
    } else {
      c.appendChild(el);
    }

    const _rank = rank;
    setTimeout(() => {
      const track = document.getElementById(`vibe-${i}`);
      if (track) buildVibeSegments(track, vibe, barColor);
    }, 80 + (_rank * 40));
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
    const cards = document.querySelectorAll('.bar-card');
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
    el.onclick = () => { setView('list'); setTimeout(() => document.querySelectorAll('.bar-card')[i]?.scrollIntoView({ behavior:'smooth', block:'center' }), 100); };
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
  document.getElementById('bars-list').style.display  = v === 'list' ? 'block' : 'none';
  document.getElementById('bars-map').style.display   = v === 'map'  ? 'block' : 'none';
  document.getElementById('bars-feed').style.display  = v === 'feed' ? 'block' : 'none';
  document.getElementById('view-list-btn').classList.toggle('active', v === 'list');
  document.getElementById('view-map-btn').classList.toggle('active', v === 'map');
  document.getElementById('view-feed-btn').classList.toggle('active', v === 'feed');
  if (v === 'map')  renderMapView();
  if (v === 'feed') renderFeedView();
}

// ── LOAD REPORTS ──
async function loadReports() {
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
  const card = event.currentTarget.closest('.bar-card');
  if (card) spawnBarParticles(card, status);
  report(i, status);
}

async function report(i, status, headcount) {
  if (!currentUser) { showToast('⚠️ Please sign in to report'); return; }
  const bar = bars[i];
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
