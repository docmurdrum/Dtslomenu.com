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
const SAMPLE_MISSIONS = [
  {
    id: 1,
    bar: "Frog & Peach Pub", barEmoji: "🐸",
    cat: "tonight",
    title: "First Round at the Frog",
    desc: "Check in at Frog & Peach tonight before 10pm and claim a free pint.",
    rewards: [{ label: "+50 XP", type: "xp" }, { label: "🍺 Free Pint", type: "prize" }, { label: "🏅 Frog Regular", type: "badge" }],
    expiry: "Tonight · Ends 10:00 PM",
    active: true,
  },
  {
    id: 2,
    bar: "Bull's Tavern", barEmoji: "🐂",
    cat: "competitive",
    title: "Bull's Night Champion",
    desc: "Be one of the first 5 to check in at Bull's Tavern tonight. Winners get a free round.",
    rewards: [{ label: "+75 XP", type: "xp" }, { label: "🥃 Free Round", type: "prize" }],
    expiry: "Tonight · Ends 2:00 AM",
    active: true,
    spots: { claimed: 3, total: 5 },
    countdown: "2h 41m",
  },
  {
    id: 3,
    bar: "McCarthy's Irish Pub", barEmoji: "🍀",
    cat: "group",
    title: "Squad Night at McCarthy's",
    desc: "Bring 3 friends to McCarthy's. All 4 check in together and get 10% off your tab.",
    rewards: [{ label: "+100 XP each", type: "xp" }, { label: "💸 10% off tab", type: "prize" }],
    expiry: "This Week",
    active: true,
    group: { needed: 4, joined: 2 },
  },
  {
    id: 4,
    bar: "BA Start Arcade Bar", barEmoji: "🕹️",
    cat: "week",
    title: "High Score Night",
    desc: "Visit BA Start this week and challenge someone to a game. Check in to claim your reward.",
    rewards: [{ label: "+40 XP", type: "xp" }, { label: "🎮 Arcade Warrior", type: "badge" }],
    expiry: "This Week · 4 days left",
    active: true,
  },
  {
    id: 5,
    bar: "High Bar", barEmoji: "🌆",
    cat: "repeatable",
    title: "Thursday Rooftop Regular",
    desc: "Check in at High Bar every Thursday night. Keep your streak for escalating XP.",
    rewards: [{ label: "+30 XP/week", type: "xp" }, { label: "🔥 Streak bonus", type: "badge" }],
    expiry: "Every Thursday",
    active: true,
    streak: 2,
  },
  {
    id: 6,
    bar: "Frog & Peach Pub", barEmoji: "🐸",
    cat: "week",
    title: "Late Night Frog",
    desc: "Check in at Frog & Peach after midnight this week. Night owls get rewarded.",
    rewards: [{ label: "+60 XP", type: "xp" }, { label: "🦉 Night Owl", type: "badge" }],
    expiry: "This Week · 4 days left",
    active: true,
  },
];

// ── INIT ──
function initMissionsPage() {
  loadMissions();
  renderBarChips();
}

async function loadMissions() {
  // In production: fetch from Supabase missions table
  // For now use sample data
  renderMissions(SAMPLE_MISSIONS);
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

// ── FILTER ──
function filterMissionsCat(cat, btn) {
  missionsCatFilter = cat;
  document.querySelectorAll('.missions-filter-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMissions(SAMPLE_MISSIONS);
}

function filterMissionsBar(bar, btn) {
  missionsBarFilter = bar;
  document.querySelectorAll('.bar-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMissions(SAMPLE_MISSIONS);
}

// ── RENDER ──
function renderMissions(missions) {
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
          <span>${m.barEmoji}</span><span>${m.bar}</span>
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
  const mission = SAMPLE_MISSIONS.find(m => m.id === id);
  if (!mission || completedMissions.has(id)) return;

  // Generate one-time code
  const code = 'DT-' + Math.floor(1000 + Math.random() * 9000);
  const prize = mission.rewards.filter(r => r.type === 'prize').map(r => r.label).join(', ');

  document.getElementById('redemption-mission-title').textContent = mission.title;
  document.getElementById('redemption-bar-name').textContent = `${mission.barEmoji} ${mission.bar}`;
  document.getElementById('redemption-prize').textContent = prize || 'your reward';
  document.getElementById('redemption-code-display').textContent = code;

  // Start countdown
  redemptionSeconds = 600;
  clearInterval(redemptionTimer);
  updateRedemptionTimer();
  redemptionTimer = setInterval(() => {
    redemptionSeconds--;
    updateRedemptionTimer();
    if (redemptionSeconds <= 0) clearInterval(redemptionTimer);
  }, 1000);

  // Award XP
  const xpReward = mission.rewards.find(r => r.type === 'xp');
  if (xpReward && currentUser) {
    const xpAmount = parseInt(xpReward.label.replace(/\D/g, '')) || 25;
    gainXP(xpAmount);
    awardXP(xpAmount, 'mission_complete');
  }

  // Mark completed and persist
  completedMissions.add(id);
  safeStore.set('completed_missions', JSON.stringify([...completedMissions]));

  // Show modal
  document.getElementById('redemption-overlay').classList.add('show');
  renderMissions(SAMPLE_MISSIONS);

  // Check achievements
  checkAchievements();
}

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
    cls: 'events',
    action: () => showPage('events'),
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

