
// ── UBER BUTTON ──
function openUberToBar() {
  if (currentBarIndex === null) return;
  const bar  = bars[currentBarIndex];
  const meta = BAR_META[bar.name] || {};
  const dest = encodeURIComponent((meta.address || bar.address) + ', San Luis Obispo, CA');

  // Try Uber deep link first (opens app if installed)
  // Falls back to uber.com
  const uberDeepLink = `uber://?action=setPickup&pickup=my_location&dropoff[nickname]=${encodeURIComponent(bar.name)}&dropoff[formatted_address]=${dest}`;
  const uberWebLink  = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[nickname]=${encodeURIComponent(bar.name)}&dropoff[formatted_address]=${dest}`;

  // Try deep link — if it doesn't open in 1.5s, fall back to web
  const start = Date.now();
  window.location.href = uberDeepLink;
  setTimeout(() => {
    if (Date.now() - start < 2000) {
      window.open(uberWebLink, '_blank');
    }
  }, 1500);
}

// ══════════════════════════════════════════════
// BAR.JS — Full Venue Hub Page
// ══════════════════════════════════════════════

// currentBarIndex declared in globals.js

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
  // Reset bar leaderboard cache for fresh load
  barLbCache = {};
  barLbRange = 3;
  barLbTab   = 'checkins';
  currentBarIndex = barIndex;
  const bar  = bars[barIndex];
  const meta = BAR_META[bar.name] || {};
  const status = getStatus(bar);
  const { text, vibe, barColor } = statusLabel(status);

  // Update bar page header
  const emojiEl = document.getElementById('bar-page-emoji');
  if (bar.emblem_url) {
    emojiEl.innerHTML = `<img src="${bar.emblem_url}" style="width:56px;height:56px;object-fit:cover;border-radius:14px">`;
  } else {
    emojiEl.textContent = bar.emoji;
  }
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

  // Vibe meter removed

  // Reports feed
  renderBarReports(bar);

  // Missions for this bar
  renderBarMissions(bar.name);

  // Friends at this bar
  renderBarFriends(bar.name);
  // Lost & Found at this bar
  renderBarLostFound(bar.name);

  // Show bar page
  showPage('bar');
  setTimeout(() => { try { loadBarLeaderboard(); } catch(e) {} }, 300);
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
  const missions = (typeof _loadedMissions !== 'undefined' ? _loadedMissions : [])
    .filter(m => m.bar === barName && m.active);
  if (!missions.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:8px 0">No active missions at this bar</div>';
    return;
  }
  el.innerHTML = missions.map(m => `
    <div class="bar-mission-row" onclick="openMissionDetail(${m.id})">
      <div class="bar-mission-info">
        <div class="bar-mission-name">${m.title}</div>
        <div class="bar-mission-reward">🎁 ${(m.rewards||[]).filter(r=>r.type==='prize').map(r=>r.label).join(', ')||'Reward'} · ${(m.rewards||[]).find(r=>r.type==='xp')?.label||''}</div>
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
  const mission = (typeof _loadedMissions !== 'undefined' ? _loadedMissions : [])
    .find(m => m.id === missionId);
  if (!mission) return;

  const prizes = (mission.rewards || []).filter(r => r.type === 'prize').map(r => r.label).join(', ');
  const xpLabel = (mission.rewards || []).find(r => r.type === 'xp')?.label || '';

  document.getElementById('md-title').textContent    = mission.title;
  document.getElementById('md-bar').textContent      = '📍 ' + mission.bar;
  document.getElementById('md-desc').textContent     = mission.desc || '';
  document.getElementById('md-reward').textContent   = '🎁 ' + (prizes || 'Reward');
  document.getElementById('md-xp').textContent       = xpLabel;
  document.getElementById('md-type').textContent     = mission.cat || 'Tonight';
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
  const mission = (typeof _loadedMissions !== 'undefined' ? _loadedMissions : [])
    .find(m => m.title === titleEl.textContent);
  if (mission && typeof completeMission === 'function') completeMission(mission.id);
}

// ── BAR LOST & FOUND FEED ──
async function renderBarLostFound(barName) {
  const el = document.getElementById('bar-page-lostfound');
  if (!el) return;
  try {
    const { data } = await supabaseClient
      .from('lost_found')
      .select('*')
      .eq('location', barName)
      .order('created_at', { ascending: false })
      .limit(5);
    if (!data || !data.length) {
      el.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:8px 0">No lost & found posts for this bar</div>';
      return;
    }
    el.innerHTML = data.map(item => `
      <div class="bar-report-row">
        <span class="bar-report-icon">${item.type === 'lost' ? '🔴' : '🟢'}</span>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700">${item.title}</div>
          <div style="font-size:11px;color:var(--text2)">${item.type === 'lost' ? 'Lost' : 'Found'} · ${timeAgo(new Date(item.created_at).getTime())}</div>
        </div>
      </div>`).join('');
  } catch(e) { el.innerHTML = '<div style="font-size:12px;color:var(--text2)">Could not load</div>'; }
}

// ── MERCH SHELF ──
function openBarMerch(barIndex) {
  var b = bars[barIndex];
  if (!b) return;
  if (typeof openBarMerchShelf === 'function') {
    openBarMerchShelf(
      b.name.toLowerCase().replace(/[^a-z0-9]/g,'-'),
      b.name,
      b.color
    );
  }
}
window.openBarMerch = openBarMerch;

// ══════════════════════════════════════════════
// BAR PAGE TABS — Menu / Merch / Info
// ══════════════════════════════════════════════


var BAR_WEBSITES = {
  "Black Sheep Bar & Grill":   'blacksheepslo.com',
  "Bull's Tavern":              'bullstavernslo.com',
  "Frog & Peach Pub":          'frogandpeach.com',
  "High Bar":                   'hotelslo.com/highbar',
  "Nightcap":                   null,
  "Feral Kitchen & Lounge":    'feralslo.com',
  "The Library":                'thelibraryslo.com',
  "The Mark":                   'themarkslo.com',
  "McCarthy's Irish Pub":      'mccarthysslo.com',
  "Sidecar SLO":                'sidecarslo.com',
  "Eureka!":                    'eurekarestaurantgroup.com',
  "Finney's Crafthouse":       'finneyspub.com',
  "Novo Restaurant & Lounge":  'novorestaurant.com',
  "BA Start Arcade Bar":       'baslo.com',
  "The Carrisa":                'thecarrisa.com',
};

// ── TAB SWITCHING ──
function barSwitchTab(tab) {
  var tabs = ['menu','merch','info'];
  tabs.forEach(function(t) {
    var btn = document.getElementById('bar-tab-' + t);
    var panel = document.getElementById('bar-panel-' + t);
    var classic = document.getElementById('bar-classic-sections');
    if (btn) btn.classList.toggle('active', t === tab);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    if (classic) classic.style.display = tab === 'info' ? 'block' : 'none';
  });
}
window.barSwitchTab = barSwitchTab;

// ── RENDER MENU ──
function renderBarMenu(barIndex) {
  var bar = bars[barIndex];
  if (!bar) return;
  var el = document.getElementById('bar-page-menu');
  if (!el) return;

  var website = BAR_WEBSITES[bar.name];
  el.innerHTML =
    '<div class="bar-no-menu">' +
      '<div class="bar-no-menu-icon">🍽</div>' +
      '<div class="bar-no-menu-title">Menu coming soon</div>' +
      '<div class="bar-no-menu-sub">We are partnering with ' + bar.name + ' to bring you their full menu. Check back soon.</div>' +
      (website
        ? '<a href="https://' + website + '" target="_blank" class="bar-website-link">🌐 View their website →</a>'
        : '') +
    '</div>';
}
window.renderBarMenu = renderBarMenu;

// ── RENDER INFO PANEL ──
function renderBarInfo(barIndex) {
  var bar = bars[barIndex];
  if (!bar) return;
  var el = document.getElementById('bar-page-info-content');
  if (!el) return;
  var meta = BAR_META[bar.name] || {};
  var website = BAR_WEBSITES[bar.name];

  el.innerHTML =
    (meta.hours ? '<div class="bar-info-row"><span class="bar-info-icon">🕐</span><div><div class="bar-info-label">Hours</div><div class="bar-info-value">' + meta.hours + '</div></div></div>' : '') +
    (meta.address ? '<div class="bar-info-row"><span class="bar-info-icon">📍</span><div><div class="bar-info-label">Address</div><div class="bar-info-value">' + meta.address + ', San Luis Obispo</div></div></div>' : '') +
    (meta.phone ? '<div class="bar-info-row"><span class="bar-info-icon">📞</span><div><div class="bar-info-label">Phone</div><div class="bar-info-value">' + meta.phone + '</div></div></div>' : '') +
    (meta.tags && meta.tags.length ? '<div class="bar-info-row"><span class="bar-info-icon">🎭</span><div><div class="bar-info-label">Vibe</div><div class="bar-info-value">' + meta.tags.join(' · ') + '</div></div></div>' : '') +
    (website ? '<a href="https://' + website + '" target="_blank" class="bar-website-link" style="margin-top:8px">🌐 ' + website + ' →</a>' : '');
}
window.renderBarInfo = renderBarInfo;

// ── RENDER MERCH PANEL ──
function renderBarMerchPanel(barIndex) {
  var bar = bars[barIndex];
  if (!bar) return;
  var el = document.getElementById('bar-page-merch-content');
  if (!el) return;
  // Stub — will connect to Printful when merch store is set up per bar
  el.innerHTML =
    '<div class="bar-no-menu">' +
      '<div class="bar-no-menu-icon">👕</div>' +
      '<div class="bar-no-menu-title">Merch coming soon</div>' +
      '<div class="bar-no-menu-sub">Official ' + bar.name + ' merch will be available here.</div>' +
    '</div>';
}
window.renderBarMerchPanel = renderBarMerchPanel;

// ── SAVED ITEMS (localStorage until Supabase table exists) ──
function getBarSavedItems(barName) {
  try {
    var all = JSON.parse(localStorage.getItem('dtslo_saved_items') || '{}');
    return all[barName] || [];
  } catch(e) { return []; }
}

function toggleSaveMenuItem(itemId, barName) {
  try {
    var all = JSON.parse(localStorage.getItem('dtslo_saved_items') || '{}');
    if (!all[barName]) all[barName] = [];
    var idx = all[barName].indexOf(itemId);
    if (idx === -1) {
      all[barName].push(itemId);
    } else {
      all[barName].splice(idx, 1);
    }
    localStorage.setItem('dtslo_saved_items', JSON.stringify(all));

    // Update UI in place
    var el = document.getElementById('bmi-' + itemId);
    var btn = el && el.querySelector('.bmi-save-btn');
    var saved = idx === -1;
    if (el) el.classList.toggle('bmi-saved', saved);
    if (btn) { btn.textContent = saved ? '✓ Saved' : '+ Save'; btn.classList.toggle('saved', saved); }

    updateMenuTabBadge(barName);
    if (typeof showToast === 'function') showToast(saved ? '🛍 Saved to your visit list' : 'Removed from list');
  } catch(e) { console.warn('[menu save]', e.message); }
}
window.toggleSaveMenuItem = toggleSaveMenuItem;

function updateMenuTabBadge(barName) {
  var saved = getBarSavedItems(barName);
  var btn = document.getElementById('bar-tab-menu');
  if (!btn) return;
  var existing = btn.querySelector('.bar-tab-badge');
  if (saved.length > 0) {
    if (!existing) {
      var badge = document.createElement('span');
      badge.className = 'bar-tab-badge';
      btn.appendChild(badge);
      existing = badge;
    }
    existing.textContent = saved.length;
  } else {
    if (existing) existing.remove();
  }
}
window.updateMenuTabBadge = updateMenuTabBadge;

// ── HOOK INTO openBarPage ── patch to also render menu/info/merch and reset tabs
var _origOpenBarPage = openBarPage;
openBarPage = function(barIndex) {
  _origOpenBarPage(barIndex);
  // Reset to menu tab
  barSwitchTab('menu');
  renderBarMenu(barIndex);
  renderBarInfo(barIndex);
  renderBarMerchPanel(barIndex);
};
