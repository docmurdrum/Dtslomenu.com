// ══════════════════════════════════════════════
// WINE_HUB.JS — Wine Country Hub
// Data sourced from Supabase venues table
// ══════════════════════════════════════════════

var WINE_REGIONS = []; // populated from Supabase on open
var WINE_FLAT = [];    // flat list of all wineries

async function loadWineVenues(catId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('venues')
      .select('*')
      .eq('hub_id', 'wine')
      .eq('city_id', 'slo')
      .eq('active', true)
      .order('name', { ascending: true });
    if (catId && catId !== 'all') {
      if (catId === 'paso')         q = q.eq('category', 'paso_robles');
      else if (catId === 'slo_wine') q = q.eq('category', 'edna_valley');
      else if (catId === 'downtown_wine') q = q.eq('category', 'downtown');
    }
    var res = await q;
    if (res.error) throw res.error;
    return res.data || [];
  } catch(e) {
    console.warn('[WineHub] Supabase load failed:', e);
    return [];
  }
}

function wineRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4].map(function() {
      return '<div style="height:72px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);animation:wine-shimmer 1.4s infinite"><style>@keyframes wine-shimmer{0%,100%{opacity:0.5}50%{opacity:1}}</style></div>';
    }).join('') + '</div>';
}

function wineRenderFlat(venues) {
  if (!venues.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No venues found</div>';
  return venues.map(function(v) {
    var catLabel = v.category === 'paso_robles' ? 'Paso Robles' : v.category === 'edna_valley' ? 'Edna Valley' : 'Downtown SLO';
    return '<div class="wh-winery-card" data-id="' + v.id + '" style="cursor:pointer;margin-bottom:8px" onclick="wineOpenDetail(this.dataset.id)">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="font-size:24px">🍷</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:14px;font-weight:800">' + v.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">' + (v.description ? v.description.substring(0,80) + '...' : catLabel) + '</div>' +
        '</div>' +
        '<div style="font-size:11px;font-weight:700;color:rgba(180,79,255,0.7)">' + ('$'.repeat(v.price_range || 2)) + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function wineOpenDetail(id) {
  var v = WINE_FLAT.find(function(x) { return String(x.id) === String(id); });
  if (!v) return;
  var existing = document.getElementById('mh-wine-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-wine-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(124,45,142,0.3);padding:14px 20px 52px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="wineCloseDetail()"></div>' +
    '<div style="font-size:32px;margin-bottom:8px">🍷</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + v.name + '</div>' +
    '<div style="font-size:12px;color:rgba(180,79,255,0.7);font-weight:700;margin-bottom:12px">' + ('$'.repeat(v.price_range||2)) + ' · ' + (v.category === 'paso_robles' ? 'Paso Robles' : v.category === 'edna_valley' ? 'Edna Valley' : 'Downtown SLO') + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin-bottom:14px">' + (v.description||'') + '</div>' +
    (v.tags && v.tags.length ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">' + v.tags.map(function(t){return '<span style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(124,45,142,0.1);border:1px solid rgba(124,45,142,0.25);color:rgba(180,79,255,0.8)">' + t + '</span>';}).join('') + '</div>' : '') +
    (v.address ? '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(v.address + ' CA') + '" target="_blank" style="display:block;width:100%;padding:13px;border-radius:14px;background:rgba(124,45,142,0.1);border:1px solid rgba(124,45,142,0.25);color:#b44fff;text-decoration:none;font-size:13px;font-weight:800;text-align:center">Get Directions ↗</a>' : '');

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.wineOpenDetail = wineOpenDetail;

function wineCloseDetail() {
  var d = document.getElementById('mh-wine-detail');
  if (d) d.remove();
}
window.wineCloseDetail = wineCloseDetail;

var WINE_FILTERS = [
  { id:'all',      label:'All',          emoji:'🍷' },
  { id:'paso',     label:'Paso Robles',  emoji:'🏔' },
  { id:'slo_wine', label:'Edna Valley',  emoji:'🌿' },
  { id:'downtown_wine', label:'Downtown', emoji:'🥂' },
  { id:'tour',     label:'Plan a Tour',  emoji:'✨' },
];

function openWineHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('wine');
  var existing = document.getElementById('mh-wine-hub');
  if (existing) existing.remove();

if (!document.getElementById('wine-hub-css')) {
    var s = document.createElement('style');
    s.id = 'wine-hub-css';
    s.textContent = [
      '.wh-filter{padding:7px 14px;border-radius:20px;border:1px solid rgba(124,45,142,0.25);background:rgba(124,45,142,0.06);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.wh-filter.active{background:rgba(124,45,142,0.2);border-color:#b44fff;color:#b44fff}',
      '.wh-region-card{padding:14px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);cursor:pointer;margin-bottom:10px;transition:all 0.15s}',
      '.wh-region-card:active{background:rgba(124,45,142,0.08);transform:scale(0.98)}',
      '.wh-winery-card{padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:8px}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-wine-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="menuHomeCloseWineHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🍷 Wine Country</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Paso Robles · SLO Wine · Downtown</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseWineHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;margin-bottom:14px">' +
        WINE_FILTERS.map(function(f, i) {
          return '<button class="wh-filter' + (i===0?' active':'') + '" onclick="whFilter(this,this.dataset.id)" data-id="' + f.id + '">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="wh-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      wineRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('wine');

  loadWineVenues('all').then(function(venues) {
    WINE_FLAT = venues;
    var content = document.getElementById('wh-content');
    if (content) content.innerHTML = wineRenderFlat(venues);
  });
}
window.menuHomeOpenWineHub = openWineHub;

function closeWineHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('wine');
  var h = document.getElementById('mh-wine-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseWineHub = closeWineHub;

function whFilter(el, filterId) {
  document.querySelectorAll('.wh-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('wh-content');
  if (!content) return;

  if (filterId === 'tour') {
    content.innerHTML = whRenderTourPlanner();
    return;
  }
  content.innerHTML = wineRenderLoading();
  loadWineVenues(filterId).then(function(venues) {
    WINE_FLAT = venues;
    if (content) content.innerHTML = wineRenderFlat(venues);
  });
}
window.whFilter = whFilter;

function whRenderAll() {
  return WINE_REGIONS.map(function(r) {
    return '<div class="wh-region-card" onclick="whOpenRegion(this.dataset.id)" data-id="' + r.id + '">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="font-size:32px">' + r.emoji + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:15px;font-weight:800">' + r.name + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-top:2px">' + r.desc + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:6px">' +
            r.highlights.slice(0,2).map(function(h) {
              return '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(180,79,255,0.1);border:1px solid rgba(180,79,255,0.2);color:rgba(180,79,255,0.8)">' + h + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
          '<div style="font-size:12px;font-weight:700;color:#b44fff">' + r.wineries.length + ' wineries</div>' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px">🚗 ' + r.drive + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function whOpenRegion(id) {
  var region = WINE_REGIONS.find(function(r) { return r.id === id; });
  if (!region) return;
  var content = document.getElementById('wh-content');
  if (content) content.innerHTML = whRenderRegion(region);
  // Fly map
  if (typeof homeMap !== 'undefined' && homeMap) {
    try { homeMap.flyTo({ center: region.coords, zoom: 12, pitch: 30, duration: 1000 }); } catch(e) {}
  }
}
window.whOpenRegion = whOpenRegion;

function whRenderRegion(r) {
  var html = '<button onclick="whGoBack()" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;padding:0;margin-bottom:14px;display:flex;align-items:center;gap:6px">← Back</button>';

  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
    '<div style="font-size:36px">' + r.emoji + '</div>' +
    '<div><div style="font-size:18px;font-weight:800;font-family:Georgia,serif">' + r.name + '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.4)">' + r.desc + '</div></div>' +
  '</div>';

  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">' +
    r.highlights.map(function(h) {
      return '<span style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;background:rgba(180,79,255,0.08);border:1px solid rgba(180,79,255,0.2);color:#b44fff">' + h + '</span>';
    }).join('') +
  '</div>';

  html += '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">WINERIES</div>';

  html += r.wineries.map(function(w) {
    return '<div class="wh-winery-card">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
        '<div style="font-size:13px;font-weight:800">' + w.name + '</div>' +
        '<div style="font-size:13px;font-weight:700;color:#b44fff">' + w.price + '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:4px">' + w.vibe + '</div>' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.3)">' +
        '<span>⏰ ' + w.hours + '</span>' +
      '</div>' +
      '<div style="font-size:11px;color:#ffd700;margin-top:4px">💡 ' + w.tip + '</div>' +
    '</div>';
  }).join('');

  if (r.food && r.food.length) {
    html += '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin:14px 0 8px">EAT</div>';
    html += r.food.map(function(f) {
      return '<div style="padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px;display:flex;justify-content:space-between">' +
        '<div><div style="font-size:13px;font-weight:700">' + f.name + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + f.vibe + '</div></div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.4)">' + f.price + '</div>' +
      '</div>';
    }).join('');
  }

  html += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(r.name + ' Wine Country California') + '" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(180,79,255,0.08);border:1px solid rgba(180,79,255,0.25);color:#b44fff;text-decoration:none;font-size:13px;font-weight:800;text-align:center;margin-top:12px">Get Directions ↗</a>';

  return html;
}

function whRenderTourPlanner() {
  return '<div style="padding:16px;background:rgba(180,79,255,0.06);border:1px solid rgba(180,79,255,0.2);border-radius:16px;margin-bottom:16px">' +
    '<div style="font-size:15px;font-weight:800;font-family:Georgia,serif;margin-bottom:8px">✨ Plan a Wine Tour</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:14px">Use Plan It to build a custom wine tour — we\'ll suggest wineries based on your taste, group size, and budget.</div>' +
    '<button onclick="menuHomeOpenTravelPlanIt()" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#7c2d8e,#b44fff);color:white;font-size:14px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">Open Plan It →</button>' +
  '</div>' +
  '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">QUICK TOUR IDEAS</div>' +
  [
    { name:'Morning Paso Run', desc:'3 wineries, back by 2pm', time:'9am-2pm', stops:'Tablas Creek → Sculpterra → Justin' },
    { name:'Edna Valley Half Day', desc:'Close to SLO, great Pinot', time:'11am-4pm', stops:'Talley → Center of Effort → Edna Valley' },
    { name:'Downtown Wine Walk', desc:'No driving needed', time:'Anytime', stops:'Pour Choices → Bon Temps → Luna Red' },
    { name:'Full Day Paso Tour', desc:'The classic wine country day', time:'All day', stops:'Daou → Epoch → Justin → Thomas Hill dinner' },
  ].map(function(t) {
    return '<div style="padding:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;margin-bottom:8px">' +
      '<div style="font-size:13px;font-weight:800;margin-bottom:2px">' + t.name + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:6px">' + t.desc + ' · ' + t.time + '</div>' +
      '<div style="font-size:11px;color:#b44fff">📍 ' + t.stops + '</div>' +
    '</div>';
  }).join('');
}

function whGoBack() {
  var content = document.getElementById('wh-content');
  if (content) content.innerHTML = whRenderAll();
  document.querySelectorAll('.wh-filter').forEach(function(b,i) {
    b.classList.toggle('active', i===0);
  });
}
window.whGoBack = whGoBack;
