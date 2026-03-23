// ══════════════════════════════════════════════
// BAR.JS — Full Venue Hub Page
// ══════════════════════════════════════════════

let currentBarIndex = null;

// ── BAR METADATA ──
const BAR_META = {
  "Black Sheep Bar & Grill":  { hours: "4pm–2am", phone: "(805) 544-7366", address: "1117 Higuera St", tags: ["Sports Bar","Beer","Cocktails"], cover: null },
  "Bull's Tavern":            { hours: "3pm–2am", phone: "(805) 544-5515", address: "709 Higuera St",  tags: ["Dive Bar","Shots","Late Night"], cover: null },
  "Frog & Peach Pub":        { hours: "3pm–2am", phone: "(805) 595-3764", address: "728 Higuera St",  tags: ["Live Music","Craft Beer","Patio"], cover: null },
  "High Bar":                 { hours: "5pm–1am", phone: "(805) 549-7000", address: "Hotel SLO Rooftop", tags: ["Rooftop","Cocktails","Views"], cover: null },
  "Nightcap":                 { hours: "7pm–2am", phone: null,             address: "Downtown SLO",    tags: ["Cocktails","Intimate","Late Night"], cover: null },
  "Feral Kitchen & Lounge":  { hours: "5pm–2am", phone: null,             address: "Downtown SLO",    tags: ["Cocktails","Food","Lounge"], cover: null },
  "The Library":              { hours: "2pm–2am", phone: "(805) 545-0686", address: "996 Higuera St",  tags: ["Beer","Pool","Casual"], cover: null },
  "The Mark":                 { hours: "4pm–2am", phone: null,             address: "Downtown SLO",    tags: ["Cocktails","Modern","Bar Bites"], cover: null },
  "McCarthy's Irish Pub":    { hours: "11am–2am", phone: "(805) 544-0158", address: "600 Higuera St",  tags: ["Irish Pub","Live Music","Beer"], cover: null },
  "Sidecar SLO":              { hours: "5pm–2am", phone: null,             address: "Downtown SLO",    tags: ["Craft Cocktails","Speakeasy"], cover: null },
  "Eureka!":                  { hours: "11am–2am", phone: "(805) 439-3000", address: "1141 Higuera St",tags: ["Burgers","Beer","Casual"], cover: null },
  "Finney's Crafthouse":     { hours: "11am–2am", phone: "(805) 439-3070", address: "1141 Higuera St",tags: ["Craft Beer","Sports","Food"], cover: null },
  "Novo Restaurant & Lounge":{ hours: "11am–2am", phone: "(805) 543-3986", address: "726 Higuera St",  tags: ["Upscale","Cocktails","Creek Views"], cover: null },
  "BA Start Arcade Bar":     { hours: "3pm–2am", phone: null,             address: "Downtown SLO",    tags: ["Arcade","Beer","Fun"], cover: null },
  "The Carrisa":              { hours: "5pm–1am", phone: "(805) 547-2700", address: "Downtown SLO",    tags: ["Hotel Bar","Cocktails","Upscale"], cover: null },
};

// ── OPEN BAR PAGE ──
function openBarPage(barIndex) {
  currentBarIndex = barIndex;
  const bar  = bars[barIndex];
  const meta = BAR_META[bar.name] || {};
  const status = getStatus(bar);
  const { text, vibe, barColor } = statusLabel(status);

  // Update bar page header
  document.getElementById('bar-page-emoji').textContent  = bar.emoji;
  document.getElementById('bar-page-name').textContent   = bar.name;
  document.getElementById('bar-page-address').textContent = meta.address || bar.address;
  document.getElementById('bar-page-hours').textContent  = meta.hours   || 'Hours not listed';
  document.getElementById('bar-page-status').textContent = text;
  document.getElementById('bar-page-status').className   = 'bar-page-status-badge status-' + status.replace(' ','');

  // Tags
  const tagsEl = document.getElementById('bar-page-tags');
  tagsEl.innerHTML = (meta.tags || []).map(t =>
    `<span class="bar-page-tag">${t}</span>`
  ).join('');

  // Vibe meter
  const vibeEl = document.getElementById('bar-page-vibe');
  if (vibeEl) {
    const color = status === 'Packed' ? '#ff2d78' : status === 'Busy' ? '#f59e0b' : '#22c55e';
    const segs  = Array.from({length:12}, (_,i) => {
      const active = i < Math.round(vibe/100*12);
      return `<div class="vibe-seg-new ${active?'active':''}" style="${active?`background:${color}`:''}"></div>`;
    }).join('');
    vibeEl.innerHTML = `
      <div class="vibe-row-new">
        <div class="vibe-label-new">Vibe</div>
        <div class="vibe-segs-wrap">${segs}</div>
        <div style="font-size:13px;font-weight:800;color:${color}">${vibe >= 80 ? '🔥' : vibe + '%'}</div>
      </div>`;
  }

  // Reports feed
  renderBarReports(bar);

  // Missions for this bar
  renderBarMissions(bar.name);

  // Friends at this bar
  renderBarFriends(bar.name);

  // Show bar page
  showPage('bar');
}

// ── RENDER REPORTS FEED ──
function renderBarReports(bar) {
  const el = document.getElementById('bar-page-reports');
  if (!el) return;
  const recent = bar.reports.filter(r => r.time > Date.now() - 60*60*1000).slice(0,10);
  if (!recent.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:12px 0;text-align:center">No reports yet tonight — be the first!</div>';
    return;
  }
  el.innerHTML = recent.map(r => {
    const ago = timeAgo(r.time);
    const icon = r.status === 'Packed' ? '🔴' : r.status === 'Busy' ? '🟡' : '🟢';
    return `<div class="bar-report-row">
      <span class="bar-report-icon">${icon}</span>
      <span class="bar-report-status">${r.status}</span>
      <span class="bar-report-time">${ago}</span>
    </div>`;
  }).join('');
}

// ── RENDER BAR MISSIONS ──
function renderBarMissions(barName) {
  const el = document.getElementById('bar-page-missions');
  if (!el) return;
  const missions = (typeof SAMPLE_MISSIONS !== 'undefined' ? SAMPLE_MISSIONS : [])
    .filter(m => m.bar === barName && m.active);
  if (!missions.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:8px 0">No active missions at this bar</div>';
    return;
  }
  el.innerHTML = missions.map(m => `
    <div class="bar-mission-row" onclick="openMissionDetail(${m.id})">
      <div class="bar-mission-info">
        <div class="bar-mission-name">${m.title}</div>
        <div class="bar-mission-reward">🎁 ${m.reward} · +${m.xp} XP</div>
      </div>
      <div class="bar-mission-arrow">›</div>
    </div>`).join('');
}

// ── RENDER FRIENDS AT BAR ──
function renderBarFriends(barName) {
  const el = document.getElementById('bar-page-friends');
  if (!el) return;
  // Find friends checked in at this bar
  const friends = getFriendsAtBar(barName);
  if (!friends.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:8px 0">None of your friends are here yet</div>';
    return;
  }
  el.innerHTML = friends.map(f => `
    <div class="bar-friend-row">
      <div class="bar-friend-av" style="background:${f.color}">${f.username[0].toUpperCase()}</div>
      <div class="bar-friend-name">${f.username}</div>
      <div class="bar-friend-status">${f.type === 'inside' ? '🎉 Inside' : '🚶 In line'}</div>
    </div>`).join('');
}

function getFriendsAtBar(barName) {
  if (!window.friendsCheckins) return [];
  return window.friendsCheckins.filter(f => f.barName === barName);
}

// ── MISSION DETAIL MODAL ──
function openMissionDetail(missionId) {
  const mission = (typeof SAMPLE_MISSIONS !== 'undefined' ? SAMPLE_MISSIONS : [])
    .find(m => m.id === missionId);
  if (!mission) return;

  document.getElementById('md-title').textContent    = mission.title;
  document.getElementById('md-bar').textContent      = '📍 ' + mission.bar;
  document.getElementById('md-desc').textContent     = mission.description || '';
  document.getElementById('md-reward').textContent   = '🎁 ' + mission.reward;
  document.getElementById('md-xp').textContent       = '+' + mission.xp + ' XP';
  document.getElementById('md-type').textContent     = mission.type || 'Tonight';
  document.getElementById('mission-detail-modal').style.display = 'flex';
}

function closeMissionDetail() {
  document.getElementById('mission-detail-modal').style.display = 'none';
}

function completeMissionFromDetail() {
  const titleEl = document.getElementById('md-title');
  if (!titleEl) return;
  closeMissionDetail();
  // Trigger mission completion flow
  const mission = (typeof SAMPLE_MISSIONS !== 'undefined' ? SAMPLE_MISSIONS : [])
    .find(m => m.title === titleEl.textContent);
  if (mission && typeof completeMission === 'function') completeMission(mission.id);
}
