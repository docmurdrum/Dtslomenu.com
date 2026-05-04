// ══════════════════════════════════════════════
// CIVIC_HUB.JS — SLO Civic Resources Hub
// Government · Utilities · Permits · Transit
// Data sourced from Supabase civic_resources table
// ══════════════════════════════════════════════

var CIVIC_RESOURCES = []; // populated from Supabase on open

var CIVIC_CATEGORIES = [
  { id: 'all',        label: 'All',         emoji: '🏛' },
  { id: 'government', label: 'Government',  emoji: '🏢' },
  { id: 'dmv',        label: 'DMV',         emoji: '🪪' },
  { id: 'utilities',  label: 'Utilities',   emoji: '💧' },
  { id: 'permits',    label: 'Permits',     emoji: '📋' },
  { id: 'transit',    label: 'Transit',     emoji: '🚌' },
  { id: 'courts',     label: 'Courts',      emoji: '⚖️' },
  { id: 'emergency',  label: 'Emergency',   emoji: '🚨' },
  { id: 'housing',    label: 'Housing',     emoji: '🏠' },
];

async function loadCivicResources(catId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('civic_resources')
      .select('*')
      .eq('city_id', 'slo')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (catId && catId !== 'all') {
      q = q.eq('category', catId);
    }
    var res = await q;
    if (res.error) throw res.error;
    return res.data || [];
  } catch(e) {
    console.warn('[CivicHub] Supabase load failed:', e);
    return [];
  }
}

function openCivicHub() {
  var existing = document.getElementById('mh-civic-hub');
  if (existing) existing.remove();

  if (!document.getElementById('civic-hub-css')) {
    var s = document.createElement('style');
    s.id = 'civic-hub-css';
    s.textContent = [
      '.civic-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.civic-filter.active{background:rgba(99,102,241,0.15);border-color:#6366f1;color:#6366f1}',
      '.civic-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.civic-card:active{background:rgba(99,102,241,0.06);transform:scale(0.98)}',
      '.civic-tag{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.18);color:rgba(99,102,241,0.8)}',
      '.civic-badge-appt{padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);color:#f59e0b}',
      '.civic-badge-online{padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e}',
      '@keyframes civic-shimmer{0%,100%{opacity:0.5}50%{opacity:1}}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-civic-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseCivicHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🏛 Civic Hub</div>' +
          '<div id="civic-hub-count" style="font-size:11px;color:rgba(255,255,255,0.4)">Government · Utilities · Permits</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseCivicHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        CIVIC_CATEGORIES.map(function(c, i) {
          return '<button class="civic-filter' + (i === 0 ? ' active' : '') + '" onclick="civicFilter(this,\'' + c.id + '\')">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="civic-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      civicRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('civic');

  loadCivicResources('all').then(function(resources) {
    CIVIC_RESOURCES = resources;
    var content = document.getElementById('civic-content');
    var countEl = document.getElementById('civic-hub-count');
    if (content) content.innerHTML = civicRenderList(resources);
    if (countEl) countEl.textContent = 'Government · Utilities · Permits · ' + resources.length + ' resources';
  });
}
window.menuHomeOpenCivicHub = openCivicHub;

function closeCivicHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('civic');
  var h = document.getElementById('mh-civic-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseCivicHub = closeCivicHub;

function civicFilter(el, catId) {
  document.querySelectorAll('.civic-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('civic-content');
  if (content) content.innerHTML = civicRenderLoading();
  loadCivicResources(catId).then(function(resources) {
    CIVIC_RESOURCES = resources;
    if (content) content.innerHTML = civicRenderList(resources);
  });
}
window.civicFilter = civicFilter;

function civicRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4,5].map(function() {
      return '<div style="height:72px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);animation:civic-shimmer 1.4s infinite"></div>';
    }).join('') + '</div>';
}

function civicRenderList(resources) {
  if (!resources.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No resources in this category</div>';
  return resources.map(function(r) {
    var badges = '';
    if (r.appointment) badges += '<span class="civic-badge-appt">📅 Appt Required</span> ';
    if (r.online_only)  badges += '<span class="civic-badge-online">🌐 Online Only</span> ';
    if (!r.appointment && !r.online_only && r.walk_in) badges += '<span class="civic-badge-online">✅ Walk-In OK</span> ';
    return '<div class="civic-card" onclick="civicOpenDetail(\'' + r.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="font-size:26px;flex-shrink:0">' + (r.emoji || '🏛') + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:1px">' + r.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + (r.department || '') + '</div>' +
        '</div>' +
      '</div>' +
      (r.hours ? '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:6px">🕐 ' + r.hours + '</div>' : '') +
      '<div style="display:flex;gap:4px;flex-wrap:wrap">' + badges + '</div>' +
    '</div>';
  }).join('');
}

function civicOpenDetail(id) {
  var cached = CIVIC_RESOURCES.find(function(x) { return String(x.id) === String(id); });
  if (cached) { civicShowDetail(cached); return; }
  window.supabaseClient.from('civic_resources').select('*').eq('id', id).limit(1).then(function(res) {
    if (res.data && res.data[0]) civicShowDetail(res.data[0]);
  });
}
window.civicOpenDetail = civicOpenDetail;

function civicShowDetail(r) {
  var existing = document.getElementById('mh-civic-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-civic-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(99,102,241,0.3);padding:14px 20px 52px;max-height:88vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  // Build action buttons
  var actions = '';
  if (r.phone) {
    actions += '<a href="tel:' + r.phone + '" style="flex:1;padding:12px;border-radius:12px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);color:#6366f1;text-decoration:none;font-size:12px;font-weight:800;text-align:center">📞 Call</a>';
  }
  if (r.website_url) {
    actions += '<a href="' + r.website_url + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);text-decoration:none;font-size:12px;font-weight:800;text-align:center">🌐 Website ↗</a>';
  }
  if (r.address) {
    actions += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(r.address + ' San Luis Obispo CA') + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);text-decoration:none;font-size:12px;font-weight:800;text-align:center">📍 Directions</a>';
  }

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="document.getElementById(\'mh-civic-detail\').remove()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + (r.emoji || '🏛') + '</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:2px">' + r.name + '</div>' +
    '<div style="font-size:12px;color:rgba(99,102,241,0.7);font-weight:700;margin-bottom:12px">' + (r.department || '') + '</div>' +
    (r.description ? '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin-bottom:14px">' + r.description + '</div>' : '') +

    // Info grid
    '<div style="display:flex;flex-direction:column;gap:0;margin-bottom:14px;background:rgba(255,255,255,0.02);border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">' +
      (r.hours   ? '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:12px;color:rgba(255,255,255,0.4)">Hours</span><span style="font-size:12px;font-weight:700">' + r.hours + '</span></div>' : '') +
      (r.address ? '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:12px;color:rgba(255,255,255,0.4)">Address</span><span style="font-size:12px;font-weight:700;text-align:right;max-width:60%">' + r.address + '</span></div>' : '') +
      (r.phone   ? '<div style="display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05)"><span style="font-size:12px;color:rgba(255,255,255,0.4)">Phone</span><span style="font-size:12px;font-weight:700">' + r.phone + '</span></div>' : '') +
      '<div style="display:flex;gap:8px;padding:10px 14px">' +
        (r.appointment ? '<span style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);color:#f59e0b">📅 Appt Required</span>' : '') +
        (r.online_only  ? '<span style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e">🌐 Online Only</span>' : '') +
        (!r.appointment && !r.online_only && r.walk_in ? '<span style="font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e">✅ Walk-In OK</span>' : '') +
      '</div>' +
    '</div>' +

    (r.tip ? '<div style="padding:12px;background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.15);border-radius:12px;margin-bottom:14px"><div style="font-size:10px;font-weight:700;color:#6366f1;margin-bottom:4px">💡 TIP</div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + r.tip + '</div></div>' : '') +

    (actions ? '<div style="display:flex;gap:8px;flex-wrap:wrap">' + actions + '</div>' : '');

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
    if (homeMap && r.lat && r.lng) {
      try { homeMap.flyTo({ center: [r.lng, r.lat], zoom: 16, duration: 800 }); } catch(e) {}
    }
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.civicShowDetail = civicShowDetail;
