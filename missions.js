// ══════════════════════════════════════════════
// MISSIONS.JS — Missions Page
// ══════════════════════════════════════════════

// ── STATE ──
let missionsCatFilter = 'all';
let missionsBarFilter = 'all';
let completedMissions = new Set();
try { completedMissions = new Set(JSON.parse((typeof safeStore !== 'undefined' ? safeStore.get('completed_missions') : null) || '[]')); } catch(e) {}
let redemptionTimer   = null;
let redemptionSeconds = 600;

// ── MISSION DATA (populated from Supabase in production) ──
// For now, seeded with sample missions — admin tool will manage these
const SAMPLE_MISSIONS = [];

// ── INIT ──
function initMissionsPage() {
  loadMissions();
  renderBarChips();
}

async function loadMissions() {
  try {
    const { data, error } = await supabaseClient
      .from('missions')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (data && data.length) {
      // Normalize Supabase column names to what renderMissions expects
      const normalized = data.map(function(m) {
        return {
          id:       m.id,
          title:    m.title || '',
          bar:      m.bar_name || null,
          barEmoji: m.bar_name ? '🍺' : '🎯',
          desc:     m.description || m.mission_desc || '',
          cat:      m.category || m.cat || 'tonight',
          type:     m.type || 'solo',
          expiry:   m.end_at ? new Date(m.end_at).toLocaleDateString('en-US', { weekday:'short', hour:'numeric', minute:'2-digit' }) : 'Ongoing',
          rewards:  Array.isArray(m.rewards) ? m.rewards : buildRewardsArray(m),
          spots:    m.max_completions ? { total: m.max_completions, claimed: m.spots_claimed || 0 } : null,
          condition:   m.condition || 'checkin_one',
          condition_n: m.condition_n || null,
          condition_time: m.condition_time || null,
          badge_emoji: m.badge_emoji || '🏅',
          badge_image_url: m.badge_image_url || null,
          badge_name: m.badge_name || null,
          visibility: m.visibility || 'all',
        };
      });
      renderMissions(normalized);
    } else {
      renderMissionsEmpty();
    }
  } catch(e) {
    console.warn('[missions]', e.message);
    renderMissionsEmpty();
  }
}

function buildRewardsArray(m) {
  var rewards = [];
  if (m.xp_reward)        rewards.push({ label: '+' + m.xp_reward + ' XP', type: 'xp' });
  if (m.mennys_reward)    rewards.push({ label: m.mennys_reward + ' Mennys', type: 'mennys' });
  if (m.prize_description) rewards.push({ label: m.prize_description, type: 'prize' });
  if (m.badge_name)       rewards.push({ label: (m.badge_emoji || '🏅') + ' ' + m.badge_name, type: 'badge' });
  return rewards;
}

function renderMissionsEmpty() {
  const list = document.getElementById('missions-list');
  if (!list) return;
  list.innerHTML =
    '<div style="text-align:center;padding:48px 24px">' +
      '<div style="font-size:48px;margin-bottom:16px">🎯</div>' +
      '<div style="font-size:17px;font-weight:900;margin-bottom:8px">Missions dropping soon</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6">The DTSLO team is crafting missions<br>with real rewards at real bars.<br>Check back Friday night.</div>' +
    '</div>';
}

// ── BAR CHIPS ──
const MISSION_BARS = [
  { name: "Frog & Peach Pub", emoji: "🐸" },
  { name: "Bull's Tavern", emoji: "🐂" },
  { name: "McCarthy's Irish Pub", emoji: "🍀" },
  { name: "BA Start Arcade Bar", emoji: "🕹️" },
  { name: "High Bar", emoji: "🌆" },
  { name: "Feral Kitchen & Lounge", emoji: "🌿" },
  { name: "Nightcap", emoji: "🌙" },
];

function renderBarChips() {
  const row = document.getElementById('missions-bar-filter');
  if (!row) return;
  row.innerHTML = `<button class="bar-chip active" onclick="filterMissionsBar('all', this)">All Bars</button>` +
    MISSION_BARS.map(b =>
      `<button class="bar-chip" onclick="filterMissionsBar('${b.name.replace(/'/g,"\\'")}', this)">${b.emoji} ${b.name.split(' ')[0]}</button>`
    ).join('');
}

let _loadedMissions = [];

// ── FILTER ──
function filterMissionsCat(cat, btn) {
  missionsCatFilter = cat;
  document.querySelectorAll('.missions-filter-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (_loadedMissions.length) renderMissions(_loadedMissions);
  else renderMissionsEmpty();
}

function filterMissionsBar(bar, btn) {
  missionsBarFilter = bar;
  document.querySelectorAll('.bar-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (_loadedMissions.length) renderMissions(_loadedMissions);
  else renderMissionsEmpty();
}

// ── RENDER ──
function renderMissions(missions) {
  _loadedMissions = missions || [];
  const list = document.getElementById('missions-list');
  if (!list) return;

  const filtered = missions.filter(m => {
    const catOk = missionsCatFilter === 'all' || m.cat === missionsCatFilter;
    const barOk = missionsBarFilter === 'all' || m.bar === missionsBarFilter;
    return catOk && barOk && m.active;
  });

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="missions-empty">
        <div class="missions-empty-icon">🎯</div>
        <div class="missions-empty-title">No missions here right now</div>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(m => buildMissionCard(m)).join('');
}

function buildMissionCard(m) {
  const catClass   = m.cat;
  const badgeClass = { tonight:'badge-tonight', week:'badge-week', group:'badge-group', competitive:'badge-compete', repeatable:'badge-repeat' }[m.cat] || 'badge-week';
  const catLabel   = { tonight:'Tonight', week:'This Week', group:'Group', competitive:'Competitive', repeatable:'Repeatable' }[m.cat] || '';
  const isDone     = completedMissions.has(m.id);

  const rewards = m.rewards.map(r => {
    const cls = r.type === 'xp' ? 'reward-xp' : r.type === 'prize' ? 'reward-prize' : 'reward-badge';
    return `<span class="reward-chip ${cls}">${r.label}</span>`;
  }).join('');

  let extra = '';

  // Competitive
  if (m.spots) {
    const pct = (m.spots.claimed / m.spots.total) * 100;
    extra += `
      <div class="comp-stats-grid">
        <div class="comp-stat">
          <div class="comp-stat-val" style="color:var(--gold)">${m.spots.total - m.spots.claimed}</div>
          <div class="comp-stat-label">Spots Left</div>
        </div>
        <div class="comp-stat">
          <div class="comp-stat-val" style="color:var(--neon-cyan)">${m.countdown}</div>
          <div class="comp-stat-label">Time Left</div>
        </div>
      </div>
      <div class="comp-progress"><div class="comp-progress-fill" style="width:${pct}%"></div></div>`;
  }

  // Group
  if (m.group) {
    const slots = Array.from({ length: m.group.needed }, (_, i) => {
      const joined = i < m.group.joined;
      const label  = i === 0 ? 'Y' : joined ? '?' : '+';
      return `<div class="group-avatar ${joined ? '' : 'empty'}">${joined ? label : '+'}</div>`;
    }).join('');
    extra += `
      <div class="group-members-row">
        ${slots}
        <span class="group-status-label">${m.group.joined}/${m.group.needed} joined</span>
      </div>`;
  }

  // Streak
  if (m.streak !== undefined) {
    extra += `<div class="mission-streak-pill">🔥 ${m.streak} week streak</div><br>`;
  }

  const btn = isDone
    ? `<button class="mission-action-btn" disabled>✓ Done</button>`
    : `<button class="mission-action-btn" onclick="completeMission(${m.id})">Complete →</button>`;

  return `
    <div class="mission-card ${catClass} ${isDone ? 'completed' : ''}">
      <div class="mission-top">
        <div class="mission-bar-label">
          <span>${m.barEmoji}</span><span>${m.bar || 'General Mission'}</span>
        </div>
        <span class="mission-type-badge ${badgeClass}">${catLabel}</span>
      </div>
      <div class="mission-title">${m.title}</div>
      <div class="mission-desc">${m.desc}</div>
      ${extra}
      <div class="mission-rewards">${rewards}</div>
      <div class="mission-footer">
        <div class="mission-expiry">⏰ ${m.expiry}</div>
        ${btn}
      </div>
    </div>`;
}

// ── COMPLETE MISSION ──
function completeMission(id) {
  const mission = _loadedMissions.find(m => m.id === id);
  if (!mission || completedMissions.has(id)) return;

  // Award XP
  const xpReward = mission.rewards ? mission.rewards.find(r => r.type === 'xp') : null;
  const xpAmount = xpReward ? (parseInt(xpReward.label.replace(/\D/g, '')) || 25) : 0;
  if (xpAmount && currentUser) {
    try { gainXP(xpAmount); } catch(e) {}
    try { awardXP(xpAmount, 'mission_complete'); } catch(e) {}
  }

  // Mark completed
  completedMissions.add(id);
  try { safeStore.set('completed_missions', JSON.stringify([...completedMissions])); } catch(e) {}

  // Record completion in Supabase
  if (currentUser) {
    supabaseClient.from('mission_completions').insert({
      mission_id: id,
      user_id: currentUser.id,
      completed_at: new Date().toISOString()
    }).catch(function() {});
  }

  // Show celebration popup
  showMissionComplete(mission, xpAmount);

  // Re-render
  if (_loadedMissions.length) renderMissions(_loadedMissions); else renderMissionsEmpty();
  try { checkAchievements(); } catch(e) {}
}
window.completeMission = completeMission;

// ── MISSION COMPLETE CELEBRATION ──
function showMissionComplete(mission, xpAmount) {
  var existing = document.getElementById('mission-complete-overlay');
  if (existing) existing.remove();

  var prize = mission.rewards ? mission.rewards.filter(r => r.type === 'prize').map(r => r.label).join(', ') : '';
  var badgeEmoji = mission.badge_emoji || '🏅';
  var badgeName  = mission.badge_name || '';
  var badgeImg   = mission.badge_image_url || '';

  var overlay = document.createElement('div');
  overlay.id = 'mission-complete-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9700;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:24px';

  overlay.innerHTML =
    '<div style="width:100%;max-width:360px;background:#0e0e1a;border-radius:24px;border:1px solid rgba(255,215,0,0.25);padding:32px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.6)">' +

      // Badge
      (badgeImg
        ? '<img src="' + badgeImg + '" style="width:80px;height:80px;border-radius:20px;object-fit:cover;margin:0 auto 16px;display:block;border:2px solid rgba(255,215,0,0.3)">'
        : '<div style="font-size:64px;margin-bottom:16px">' + badgeEmoji + '</div>') +

      '<div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#ffd700;text-transform:uppercase;margin-bottom:8px">Mission Complete!</div>' +
      '<div style="font-size:22px;font-weight:900;margin-bottom:6px;letter-spacing:-0.3px">' + mission.title + '</div>' +

      // XP earned
      (xpAmount ? '<div style="display:inline-block;background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.3);border-radius:20px;padding:6px 16px;font-size:15px;font-weight:900;color:#ffd700;margin-bottom:16px">+' + xpAmount + ' XP earned</div>' : '') +

      // Prize if any
      (prize ? '<div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:8px">🎁 ' + prize + '</div>' : '') +

      // Badge unlocked
      (badgeName ? '<div style="display:flex;align-items:center;gap:8px;justify-content:center;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);border-radius:12px;padding:10px 14px;margin:12px 0">' +
        '<span style="font-size:18px">' + badgeEmoji + '</span>' +
        '<div><div style="font-size:9px;color:rgba(255,255,255,0.4);font-weight:700;letter-spacing:1px;text-transform:uppercase">Badge Unlocked</div>' +
        '<div style="font-size:13px;font-weight:800;color:#ffd700">' + badgeName + '</div></div>' +
      '</div>' : '') +

      '<button onclick="closeMissionComplete()" style="width:100%;margin-top:16px;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer">🎉 Awesome!</button>' +
    '</div>';

  document.body.appendChild(overlay);

  // Confetti
  try { triggerConfetti && triggerConfetti(); } catch(e) {}
}
window.showMissionComplete = showMissionComplete;

function closeMissionComplete() {
  var el = document.getElementById('mission-complete-overlay');
  if (el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(function() { el.remove(); }, 300);
  }
}
window.closeMissionComplete = closeMissionComplete;



function updateRedemptionTimer() {
  const m = Math.floor(redemptionSeconds / 60);
  const s = redemptionSeconds % 60;
  const el = document.getElementById('redemption-timer-display');
  if (el) el.textContent = `⏱ Expires in ${m}:${String(s).padStart(2, '0')}`;
}

function closeRedemptionModal() {
  document.getElementById('redemption-overlay').classList.remove('show');
  clearInterval(redemptionTimer);
}

// ── RESOURCES PAGE ──
const RESOURCES = [
  {
    id: 'delivery',
    icon: '🛒',
    name: 'Quick Delivery',
    desc: 'Water, Red Bull, chargers delivered to you',
    cls: 'coming',
    action: null,
    coming: true,
  },
  {
    id: 'lost',
    icon: '🔍',
    name: 'Lost & Found',
    desc: 'Post or find lost items downtown',
    cls: 'lost',
    action: () => showPage('lost'),
  },
  {
    id: 'missed',
    icon: '💘',
    name: 'Missed Connections',
    desc: 'Saw someone special tonight?',
    cls: 'missed',
    action: () => showPage('missed'),
  },
  {
    id: 'rides',
    icon: '🚗',
    name: 'Rides',
    desc: 'Get home safe — Uber & Lyft',
    cls: 'rides',
    action: () => showPage('rides'),
  },
  {
    id: 'food',
    icon: '🍕',
    name: 'Late Night Food',
    desc: 'Best spots open after midnight',
    cls: 'coming',
    action: null,
    coming: true,
  },
  {
    id: 'events',
    icon: '🎵',
    name: 'Events & Concerts',
    desc: 'SLO live music, bar events & more',
    cls: 'coming',
    action: null,
    coming: true,
  },
];

function renderResources() {
  const grid = document.getElementById('resources-grid');
  if (!grid) return;
  grid.innerHTML = RESOURCES.map(r => `
    <div class="resource-card ${r.cls}" onclick="${r.action && !r.coming ? `resourceAction('${r.id}')` : ''}">
      ${r.coming ? '<div class="resource-card-coming-label">Coming Soon</div>' : ''}
      <div class="resource-card-icon">${r.icon}</div>
      <div class="resource-card-name">${r.name}</div>
      <div class="resource-card-desc">${r.desc}</div>
    </div>`).join('');
}

function resourceAction(id) {
  const r = RESOURCES.find(x => x.id === id);
  if (r && r.action) r.action();
}

// ══════════════════════════════════════════════
// EVENTS
// ══════════════════════════════════════════════
let eventsData    = [];
let eventsFilter  = 'all';

async function initEvents() {
  await loadEvents();
  renderEvents();
}

async function loadEvents() {
  try {
    const now = new Date().toISOString();
    const { data } = await supabaseClient
      .from('events')
      .select('*')
      .gte('event_date', now.split('T')[0])
      .order('event_date', { ascending: true });
    eventsData = data || [];
  } catch(e) { eventsData = []; }
}

function filterEvents(cat, btn) {
  eventsFilter = cat;
  document.querySelectorAll('.missions-filter-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderEvents();
}

function renderEvents() {
  const el = document.getElementById('events-feed');
  if (!el) return;
  const filtered = eventsFilter === 'all' ? eventsData
    : eventsData.filter(e => e.category === eventsFilter);
  if (!filtered.length) {
    el.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text2)">
      <div style="font-size:32px;margin-bottom:8px">🎵</div>
      <div style="font-size:14px;font-weight:700">No events found</div>
      <div style="font-size:12px;margin-top:4px">Check back soon</div>
    </div>`;
    return;
  }
  el.innerHTML = filtered.map(ev => {
    const date = new Date(ev.event_date);
    const dateStr = date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
    const timeStr = ev.event_time || '';
    return `
    <div class="event-card">
      ${ev.image_url ? `<div class="event-img"><img src="${ev.image_url}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.style.display='none'"></div>` : ''}
      <div class="event-body">
        <div class="event-date-badge">${dateStr}${timeStr ? ' · ' + timeStr : ''}</div>
        <div class="event-title">${ev.title}</div>
        <div class="event-venue">📍 ${ev.venue || 'Downtown SLO'}</div>
        ${ev.price ? `<div class="event-price">${ev.price === '0' || ev.price === 'free' ? '🎟 Free' : '🎟 ' + ev.price}</div>` : ''}
        ${ev.ticket_url ? `<a href="${ev.ticket_url}" target="_blank" class="event-ticket-btn">Get Tickets →</a>` : ''}
      </div>
    </div>`;
  }).join('');
}


// ══════════════════════════════════════════════
// RIDES
// ══════════════════════════════════════════════
let ridesSelectedApp = null;

function initRides() {
  const sel = document.getElementById('rides-destination');
  if (!sel) return;

  // Populate dropdown with bars + live status
  const statusEmoji = { Packed: '🔴', Busy: '🟡', Dead: '🟢', 'No Data': '⚪' };
  sel.innerHTML = '<option value="">— Just from my location —</option>';
  bars.forEach((bar, i) => {
    const status = typeof getStatus === 'function' ? getStatus(bar) : 'No Data';
    const dot = statusEmoji[status] || '⚪';
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = dot + ' ' + bar.name;
    sel.appendChild(opt);
  });
}

function ridesUpdateDestination() {
  const sel     = document.getElementById('rides-destination');
  const statusEl = document.getElementById('rides-bar-status');
  const uberLbl  = document.getElementById('uber-dest-label');
  const lyftLbl  = document.getElementById('lyft-dest-label');

  if (!sel.value) {
    if (statusEl) statusEl.style.display = 'none';
    if (uberLbl)  uberLbl.textContent = 'From your location';
    if (lyftLbl)  lyftLbl.textContent = 'From your location';
    return;
  }

  const bar    = bars[parseInt(sel.value)];
  const status = typeof getStatus === 'function' ? getStatus(bar) : 'No Data';
  const colors = { Packed: '#ff2d78', Busy: '#f59e0b', Dead: '#22c55e', 'No Data': 'var(--text2)' };
  const labels = { Packed: '🔴 Packed right now', Busy: '🟡 Getting busy', Dead: '🟢 Pretty quiet', 'No Data': '⚪ No reports yet' };

  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = '<span style="font-weight:800;color:' + (colors[status]||'var(--text2)') + '">' + bar.name + '</span> — ' + (labels[status] || status);
  }
  const destText = 'To ' + bar.name;
  if (uberLbl) uberLbl.textContent = destText;
  if (lyftLbl) lyftLbl.textContent = destText;
}

function openRideApp(app) {
  ridesSelectedApp = app;
  const sel      = document.getElementById('rides-destination');
  const titleEl  = document.getElementById('rides-confirm-title');
  const subEl    = document.getElementById('rides-confirm-sub');
  const overlay  = document.getElementById('rides-confirm-overlay');

  const appName = app === 'uber' ? 'Uber' : 'Lyft';
  let destText  = 'from your current location';

  if (sel && sel.value) {
    const bar = bars[parseInt(sel.value)];
    if (bar) destText = 'to ' + bar.name;
  }

  if (titleEl) titleEl.textContent = 'Open ' + appName + '?';
  if (subEl)   subEl.textContent   = 'Requesting a ride ' + destText;
  if (overlay) { overlay.style.display = 'flex'; }
}

function ridesConfirm() {
  ridesCancel();
  const sel = document.getElementById('rides-destination');
  let destAddr = '';
  let destName = '';

  if (sel && sel.value) {
    const bar = bars[parseInt(sel.value)];
    if (bar) {
      destAddr = encodeURIComponent((bar.address || bar.name) + ', San Luis Obispo, CA');
      destName = encodeURIComponent(bar.name);
    }
  }

  if (ridesSelectedApp === 'uber') {
    const deepLink = destAddr
      ? 'uber://?action=setPickup&pickup=my_location&dropoff[nickname]=' + destName + '&dropoff[formatted_address]=' + destAddr
      : 'uber://';
    const webLink  = destAddr
      ? 'https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[nickname]=' + destName + '&dropoff[formatted_address]=' + destAddr
      : 'https://m.uber.com';
    window.location.href = deepLink;
    setTimeout(() => window.open(webLink, '_blank'), 1500);
  } else {
    const deepLink = destAddr
      ? 'lyft://ridetype?id=lyft&destination[latitude]=&destination[longitude]='
      : 'lyft://';
    const webLink  = destAddr
      ? 'https://www.lyft.com/ride?destination[address]=' + destAddr
      : 'https://www.lyft.com';
    window.location.href = deepLink;
    setTimeout(() => window.open(webLink, '_blank'), 1500);
  }
}

function ridesCancel() {
  const overlay = document.getElementById('rides-confirm-overlay');
  if (overlay) overlay.style.display = 'none';
  ridesSelectedApp = null;
}

