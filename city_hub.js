// ══════════════════════════════════════════════
// EXPLORE_HUB.JS — SLO Explore Hub
// Landmarks · Culture · Art · Must-See
// Data sourced from Supabase landmarks table
// ══════════════════════════════════════════════

var CITY_SPOTS = []; // populated from Supabase on open

async function loadCitySpots(catId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('landmarks')
      .select('*')
      .eq('city_id', 'slo')
      .eq('hub_id', 'explore')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (catId && catId !== 'all' && catId !== 'free') {
      q = q.eq('category', catId);
    }
    var res = await q;
    if (res.error) throw res.error;
    var rows = res.data || [];
    // free filter applied client-side
    if (catId === 'free') {
      rows = rows.filter(function(r) { return r.price && r.price.toLowerCase().indexOf('free') !== -1; });
    }
    // Normalize to match existing shape expected by render functions
    return rows.map(function(r) {
      return {
        id:       String(r.id),
        name:     r.name,
        emoji:    r.emoji || '📍',
        category: r.category,
        free:     r.price && r.price.toLowerCase().indexOf('free') !== -1,
        address:  r.address || '',
        coords:   (r.lng && r.lat) ? [r.lng, r.lat] : null,
        desc:     r.description || '',
        tip:      r.tip || '',
        tags:     r.tags || [],
      };
    });
  } catch(e) {
    console.warn('[CityHub] Supabase load failed:', e);
    return [];
  }
}

var CITY_CATEGORIES = [
  { id: 'all',      label: 'All',      emoji: '🏙' },
  { id: 'landmark', label: 'Landmarks', emoji: '📍' },
  { id: 'museum',   label: 'Museums',  emoji: '🖼' },
  { id: 'weird',    label: 'Weird',    emoji: '🫧' },
  { id: 'venue',    label: 'Venues',   emoji: '🎭' },
  { id: 'free',     label: 'Free',     emoji: '🆓' },
];

function openCityHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('explore');
  var existing = document.getElementById('mh-city-hub');
  if (existing) existing.remove();

  if (!document.getElementById('city-hub-css')) {
    var s = document.createElement('style');
    s.id = 'city-hub-css';
    s.textContent = [
      '.city-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(0,245,255,0.2);background:rgba(0,245,255,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.city-filter.active{background:rgba(0,245,255,0.12);border-color:#00f5ff;color:#00f5ff}',
      '.city-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.city-card:active{background:rgba(0,245,255,0.05);transform:scale(0.98)}',
      '.city-tag{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.15);color:rgba(0,245,255,0.7)}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-city-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseCityHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🗺 Explore SLO</div>' +
          '<div id="city-hub-count" style="font-size:11px;color:rgba(255,255,255,0.4)">Landmarks · Culture · Art</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseCityHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        CITY_CATEGORIES.map(function(c,i) {
          return '<button class="city-filter' + (i===0?' active':'') + '" onclick="cityFilter(this,\'' + c.id + '\')">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="city-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      cityRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('explore');

  // Load data from Supabase
  loadCitySpots('all').then(function(spots) {
    CITY_SPOTS = spots;
    var content = document.getElementById('city-content');
    var countEl = document.getElementById('city-hub-count');
    if (content) content.innerHTML = cityRenderList(spots);
    if (countEl) countEl.textContent = 'Landmarks · Culture · Art · ' + spots.length + ' spots';  });
}
window.menuHomeOpenCityHub = openCityHub;

function closeCityHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('explore');
  var h = document.getElementById('mh-city-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseCityHub = closeCityHub;

function cityFilter(el, catId) {
  document.querySelectorAll('.city-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('city-content');
  if (content) content.innerHTML = cityRenderLoading();
  loadCitySpots(catId).then(function(spots) {
    CITY_SPOTS = spots;
    if (content) content.innerHTML = cityRenderList(spots);
  });
}
window.cityFilter = cityFilter;

function cityRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4,5].map(function() {
      return '<div style="height:68px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);animation:city-shimmer 1.4s infinite">' +
        '<style>@keyframes city-shimmer{0%,100%{opacity:0.5}50%{opacity:1}}</style></div>';
    }).join('') +
  '</div>';
}

function cityRenderList(spots) {
  if (!spots.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No spots in this category</div>';
  return spots.map(function(s) {
    return '<div class="city-card" onclick="cityOpenDetail(\'' + s.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="font-size:26px;flex-shrink:0">' + s.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:1px">' + s.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + s.address + '</div>' +
        '</div>' +
        (s.free ? '<span class="city-tag" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.2);color:#22c55e">Free</span>' : '') +
      '</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        s.tags.map(function(t) { return '<span class="city-tag">' + t + '</span>'; }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

function cityOpenDetail(id) {
  // First check local cache, then fall back to Supabase fetch
  var cached = CITY_SPOTS.find(function(x) { return x.id === id; });
  if (cached) {
    cityShowDetail(cached);
  } else {
    window.supabaseClient.from('landmarks').select('*').eq('id', id).limit(1).then(function(res) {
      if (res.data && res.data[0]) {
        var r = res.data[0];
        cityShowDetail({
          id: String(r.id), name: r.name, emoji: r.emoji || '📍',
          category: r.category, free: r.price && r.price.toLowerCase().indexOf('free') !== -1,
          address: r.address || '', coords: (r.lng && r.lat) ? [r.lng, r.lat] : null,
          desc: r.description || '', tip: r.tip || '', tags: r.tags || [],
        });
      }
    });
  }
}
window.cityOpenDetail = cityOpenDetail;

function cityShowDetail(s) {
  var existing = document.getElementById('mh-city-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-city-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(0,245,255,0.2);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="document.getElementById(\'mh-city-detail\').remove()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + s.emoji + '</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + s.name + '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:14px">' + s.address + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:14px">' + s.desc + '</div>' +
    (s.tip ? '<div style="padding:12px;background:rgba(0,245,255,0.04);border:1px solid rgba(0,245,255,0.12);border-radius:12px;margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:#00f5ff;margin-bottom:4px">💡 LOCAL TIP</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + s.tip + '</div>' +
    '</div>' : '') +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">' +
      (s.tags || []).map(function(t) { return '<span class="city-tag">' + t + '</span>'; }).join('') +
      (s.free ? '<span class="city-tag" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.2);color:#22c55e">Free Entry</span>' : '') +
    '</div>' +
    '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent((s.address || '') + ' San Luis Obispo CA') + '" target="_blank" style="display:block;width:100%;padding:13px;border-radius:14px;background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.2);color:#00f5ff;text-decoration:none;font-size:13px;font-weight:800;text-align:center">Get Directions ↗</a>';

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
    if (homeMap && s.coords) {
      try { homeMap.flyTo({ center: s.coords, zoom: 16, duration: 800 }); } catch(e) {}
    }
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
