// ══════════════════════════════════════════════
// NATURE_HUB.JS — SLO Nature & Outdoors Hub
// Hiking, parks, trails, wildlife
// Data sourced from Supabase trails table
// ══════════════════════════════════════════════

var NATURE_SPOTS = []; // populated from Supabase on open

async function loadNatureSpots(filterId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('trails').select('*').eq('city_id', 'slo').eq('active', true).order('sort_order', { ascending: true });
    if (filterId && filterId !== 'all') {
      if (filterId === 'easy')  q = q.ilike('difficulty', '%easy%');
      else if (filterId === 'hard') q = q.or('difficulty.ilike.%stren%,difficulty.ilike.%hard%');
      else q = q.eq('category', filterId);
    }
    var res = await q;
    if (res.error) throw res.error;
    return (res.data || []).map(function(r) {
      return {
        id:          String(r.id),
        name:        r.name,
        emoji:       r.emoji || '🌿',
        category:    r.category || 'hike',
        difficulty:  r.difficulty || 'Moderate',
        distance:    r.distance || '',
        elevation:   r.elevation || '',
        drive:       r.duration || '',
        coords:      (r.lng && r.lat) ? [r.lng, r.lat] : null,
        tip:         r.tip || '',
        dog_friendly:r.dogs_allowed !== false,
        free:        !r.parking || r.parking.toLowerCase().indexOf('free') !== -1,
        highlights:  r.tags || [],
        best_for:    r.tags ? r.tags.slice(0, 3) : [],
        alltrails:   r.alltrails_url || null,
        best_season: r.best_season || '',
      };
    });
  } catch(e) {
    console.warn('[NatureHub] Supabase load failed:', e);
    return [];
  }
}

var NATURE_CATEGORIES = [
  { id:'all',      label:'All',      emoji:'🌿' },
  { id:'hike',     label:'Hikes',    emoji:'⛰️' },
  { id:'park',     label:'Parks',    emoji:'🌳' },
  { id:'trail',    label:'Trails',   emoji:'🚴' },
  { id:'wellness', label:'Wellness', emoji:'♨️' },
  { id:'easy',     label:'Easy',     emoji:'😊' },
  { id:'hard',     label:'Challenge',emoji:'💪' },
];

function openNatureHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('nature');
  var existing = document.getElementById('mh-nature-hub');
  if (existing) existing.remove();

  if (!document.getElementById('nature-hub-css')) {
    var s = document.createElement('style');
    s.id = 'nature-hub-css';
    s.textContent = [
      '.nature-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(34,197,94,0.2);background:rgba(34,197,94,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.nature-filter.active{background:rgba(34,197,94,0.15);border-color:#22c55e;color:#22c55e}',
      '.nature-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.nature-card:active{background:rgba(34,197,94,0.06);transform:scale(0.98)}',
      '.nature-badge{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e}',
      '.nature-badge.mod{background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.2);color:#f59e0b}',
      '.nature-badge.hard{background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);color:#ef4444}',
      '@keyframes nature-shimmer{0%,100%{opacity:0.5}50%{opacity:1}}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-nature-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseNatureHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🌿 Nature Hub</div>' +
          '<div id="nature-hub-count" style="font-size:11px;color:rgba(255,255,255,0.4)">Hikes · Parks · Trails</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseNatureHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        NATURE_CATEGORIES.map(function(f,i) {
          return '<button class="nature-filter' + (i===0?' active':'') + '" onclick="natureFilter(this,\'' + f.id + '\')" data-id="' + f.id + '">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="nature-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      natureRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('nature');

  loadNatureSpots('all').then(function(spots) {
    NATURE_SPOTS = spots;
    var content = document.getElementById('nature-content');
    var countEl = document.getElementById('nature-hub-count');
    if (content) content.innerHTML = natureRenderList(spots);
    if (countEl) countEl.textContent = 'Hikes · Parks · Trails · ' + spots.length + ' spots';
  });
}
window.menuHomeOpenNatureHub = openNatureHub;

function closeNatureHub() {
  var h = document.getElementById('mh-nature-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
  hubDeactivateMapMode();
  tipsRemoveButton('nature');
}
window.menuHomeCloseNatureHub = closeNatureHub;

function natureFilter(el, filterId) {
  document.querySelectorAll('.nature-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('nature-content');
  if (content) content.innerHTML = natureRenderLoading();
  loadNatureSpots(filterId).then(function(spots) {
    NATURE_SPOTS = spots;
    if (content) content.innerHTML = natureRenderList(spots);
  });
}
window.natureFilter = natureFilter;

function natureRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4,5].map(function() {
      return '<div style="height:80px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);animation:nature-shimmer 1.4s infinite"></div>';
    }).join('') + '</div>';
}

function natureRenderList(spots) {
  if (!spots.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No spots in this category</div>';
  return spots.map(function(s) {
    var diffColor = /easy/i.test(s.difficulty) ? '#22c55e' : /mod/i.test(s.difficulty) ? '#f59e0b' : '#ef4444';
    var diffClass = /easy/i.test(s.difficulty) ? '' : /mod/i.test(s.difficulty) ? ' mod' : ' hard';
    return '<div class="nature-card" onclick="natureOpenDetail(\'' + s.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div style="font-size:28px;flex-shrink:0">' + s.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + s.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45)">' + s.distance + ' · ' + s.drive + '</div>' +
        '</div>' +
        '<span class="nature-badge' + diffClass + '">' + s.difficulty.split(' ')[0] + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        s.best_for.slice(0,3).map(function(t) {
          return '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.15);color:rgba(34,197,94,0.7)">' + t + '</span>';
        }).join('') +
        (s.dog_friendly ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4)">🐕 Dogs OK</span>' : '') +
        (s.free ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.15);color:#22c55e">Free</span>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function natureOpenDetail(id) {
  var cached = NATURE_SPOTS.find(function(x) { return x.id === id; });
  if (cached) { natureShowDetail(cached); return; }
  window.supabaseClient.from('trails').select('*').eq('id', id).limit(1).then(function(res) {
    if (res.data && res.data[0]) {
      var r = res.data[0];
      natureShowDetail({
        id: String(r.id), name: r.name, emoji: r.emoji || '🌿',
        category: r.category || 'hike', difficulty: r.difficulty || 'Moderate',
        distance: r.distance || '', elevation: r.elevation || '',
        drive: r.duration || '', coords: (r.lng && r.lat) ? [r.lng, r.lat] : null,
        tip: r.tip || '', dog_friendly: r.dogs_allowed !== false,
        free: !r.parking || r.parking.toLowerCase().indexOf('free') !== -1,
        highlights: r.tags || [], best_for: r.tags ? r.tags.slice(0,3) : [],
        alltrails: r.alltrails_url || null,
      });
    }
  });
}
window.natureOpenDetail = natureOpenDetail;

function natureShowDetail(s) {
  var existing = document.getElementById('mh-nature-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-nature-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  sheet.innerHTML =
    '<div id="mh-nd-inner" style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(34,197,94,0.25);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="document.getElementById(\'mh-nature-detail\').remove()"></div>' +
      '<div style="font-size:36px;margin-bottom:8px">' + s.emoji + '</div>' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + s.name + '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center"><div style="font-size:12px;font-weight:800">' + (s.distance||'—') + '</div><div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">DISTANCE</div></div>' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center"><div style="font-size:12px;font-weight:800">' + (s.elevation||'—') + '</div><div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">ELEVATION</div></div>' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center"><div style="font-size:12px;font-weight:800">' + (s.drive||'—') + '</div><div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">DURATION</div></div>' +
      '</div>' +
      (s.tip ? '<div style="padding:12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:12px;margin-bottom:14px"><div style="font-size:11px;font-weight:700;color:#22c55e;margin-bottom:4px">💡 Local tip</div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + s.tip + '</div></div>' : '') +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' +
        (s.highlights||[]).map(function(h) {
          return '<span style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e">' + h + '</span>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent((s.name||'') + ' San Luis Obispo CA') + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#22c55e;text-decoration:none;font-size:12px;font-weight:800;text-align:center">Get Directions ↗</a>' +
        '<a href="' + (s.alltrails || 'https://www.alltrails.com/search?q=' + encodeURIComponent(s.name||'')) + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);text-decoration:none;font-size:12px;font-weight:800;text-align:center">AllTrails ↗</a>' +
      '</div>' +
    '</div>';

  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    var inner = document.getElementById('mh-nd-inner');
    if (inner) inner.style.transform = 'translateY(0)';
    if (homeMap && s.coords) {
      try { homeMap.flyTo({ center: s.coords, zoom: 13, duration: 800 }); } catch(e) {}
    }
  }, 30);
  sheet.addEventListener('click', function(e) { if(e.target===sheet) sheet.remove(); });
}
