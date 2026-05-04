// ══════════════════════════════════════════════
// THRILL_HUB.JS — SLO Adventure & Thrill Hub
// Data sourced from Supabase thrill_spots table
// ══════════════════════════════════════════════

var THRILL_SPOTS = []; // populated from Supabase on open

async function loadThrillSpots(catId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('thrill_spots').select('*').eq('city_id','slo').eq('active',true).order('sort_order',{ascending:true});
    if (catId && catId !== 'all') q = q.eq('category', catId);
    var res = await q;
    if (res.error) throw res.error;
    return (res.data || []).map(function(r) {
      return {
        id:         String(r.id),
        name:       r.name,
        emoji:      r.emoji || '⚡',
        category:   r.category || 'adventure',
        price:      r.price_note || '',
        drive:      '',
        duration:   r.duration || '',
        coords:     (r.lng && r.lat) ? [r.lng, r.lat] : null,
        phone:      r.phone || null,
        website:    r.website_url || null,
        booking:    r.booking_url || null,
        tip:        r.tip || '',
        highlights: r.tags || [],
        thrill_level: 3,
        best_for:   r.tags ? r.tags.slice(0,3) : [],
        booking_required: r.reservations === 'Required',
        difficulty: r.difficulty || 'All levels',
        age_min:    r.age_minimum || null,
        seasonal:   r.seasonal || false,
        season_note:r.season_note || '',
      };
    });
  } catch(e) {
    console.warn('[ThrillHub] Supabase load failed:', e);
    return [];
  }
}

var THRILL_CATEGORIES = [
  { id:'all',      label:'All',       emoji:'⚡' },
  { id:'water',    label:'Water',     emoji:'🌊' },
  { id:'atv',      label:'Dunes/ATV', emoji:'🏍' },
  { id:'air',      label:'Air',       emoji:'🪂' },
  { id:'climbing', label:'Climbing',  emoji:'🧗' },
  { id:'ranch',    label:'Ranch',     emoji:'🐎' },
  { id:'land',     label:'Land',      emoji:'🚵' },
];

function openThrillHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('thrill');
  var existing = document.getElementById('mh-thrill-hub');
  if (existing) existing.remove();

  if (!document.getElementById('thrill-hub-css')) {
    var s = document.createElement('style');
    s.id = 'thrill-hub-css';
    s.textContent = [
      '.thrill-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.thrill-filter.active{background:rgba(239,68,68,0.15);border-color:#ef4444;color:#ef4444}',
      '.thrill-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.thrill-card:active{background:rgba(239,68,68,0.06);transform:scale(0.98)}',
      '@keyframes thrill-shimmer{0%,100%{opacity:0.5}50%{opacity:1}}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-thrill-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseThrillHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">⚡ Thrill Hub</div>' +
          '<div id="thrill-hub-count" style="font-size:11px;color:rgba(255,255,255,0.4)">Ziplines · ATVs · Skydiving</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseThrillHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        THRILL_CATEGORIES.map(function(f,i) {
          return '<button class="thrill-filter' + (i===0?' active':'') + '" onclick="thrillFilter(this,\'' + f.id + '\')" data-id="' + f.id + '">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="thrill-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      thrillRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('thrill');

  loadThrillSpots('all').then(function(spots) {
    THRILL_SPOTS = spots;
    var content = document.getElementById('thrill-content');
    var countEl = document.getElementById('thrill-hub-count');
    if (content) content.innerHTML = thrillRenderList(spots);
    if (countEl) countEl.textContent = 'Ziplines · ATVs · Skydiving · ' + spots.length + ' adventures';
  });
}
window.menuHomeOpenThrillHub = openThrillHub;

function closeThrillHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('thrill');
  var h = document.getElementById('mh-thrill-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseThrillHub = closeThrillHub;

function thrillFilter(el, filterId) {
  document.querySelectorAll('.thrill-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('thrill-content');
  if (content) content.innerHTML = thrillRenderLoading();
  loadThrillSpots(filterId).then(function(spots) {
    THRILL_SPOTS = spots;
    if (content) content.innerHTML = thrillRenderList(spots);
  });
}
window.thrillFilter = thrillFilter;

function thrillRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4].map(function() {
      return '<div style="height:80px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);animation:thrill-shimmer 1.4s infinite"></div>';
    }).join('') + '</div>';
}

function thrillRenderList(spots) {
  if (!spots.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No adventures in this category</div>';
  return spots.map(function(s) {
    var thrillDots = '';
    for (var i = 0; i < 5; i++) {
      thrillDots += '<span style="color:' + (i < s.thrill_level ? '#ef4444' : 'rgba(255,255,255,0.15)') + ';font-size:10px">⚡</span>';
    }
    return '<div class="thrill-card" onclick="thrillOpenDetail(\'' + s.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div style="font-size:28px;flex-shrink:0">' + s.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + s.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45)">' + s.difficulty + ' · ' + s.price + '</div>' +
        '</div>' +
        '<div>' + thrillDots + '</div>' +
      '</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        s.best_for.slice(0,3).map(function(t) {
          return '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.15);color:rgba(239,68,68,0.7)">' + t + '</span>';
        }).join('') +
        (s.booking_required ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4)">Book ahead</span>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function thrillOpenDetail(id) {
  var s = THRILL_SPOTS.find(function(x) { return x.id === id; });
  if (!s) return; // cache miss — data should already be loaded
  var existing = document.getElementById('mh-thrill-detail');
  if (existing) existing.remove();

  var thrillDots = '';
  for (var i = 0; i < 5; i++) {
    thrillDots += '<span style="font-size:16px;color:' + (i < s.thrill_level ? '#ef4444' : 'rgba(255,255,255,0.15)') + '">⚡</span>';
  }

  var sheet = document.createElement('div');
  sheet.id = 'mh-thrill-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
  sheet.innerHTML =
    '<div id="mh-td-inner" style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(239,68,68,0.25);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="document.getElementById(\'mh-thrill-detail\').remove()"></div>' +
      '<div style="font-size:36px;margin-bottom:8px">' + s.emoji + '</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
        '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">' + s.name + '</div>' +
        '<div>' + thrillDots + '</div>' +
      '</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:14px">' + s.category.replace('_',' ').toUpperCase() + '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
          '<div style="font-size:13px;font-weight:800;color:#ef4444">' + s.price + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">PRICE</div>' +
        '</div>' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
          '<div style="font-size:11px;font-weight:800">' + s.drive + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">DRIVE</div>' +
        '</div>' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
          '<div style="font-size:11px;font-weight:800">' + s.duration + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">DURATION</div>' +
        '</div>' +
      '</div>' +

      '<div style="padding:12px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:12px;margin-bottom:14px">' +
        '<div style="font-size:11px;font-weight:700;color:#ef4444;margin-bottom:4px">💡 Insider tip</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + s.tip + '</div>' +
      '</div>' +

      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' +
        s.highlights.map(function(h) {
          return '<span style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444">' + h + '</span>';
        }).join('') +
      '</div>' +

      '<div style="display:flex;gap:8px">' +
        '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(s.name + ' San Luis Obispo CA') + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444;text-decoration:none;font-size:12px;font-weight:800;text-align:center">Directions ↗</a>' +
        (s.website ? '<a href="https://' + s.website + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);text-decoration:none;font-size:12px;font-weight:800;text-align:center">Book Now ↗</a>' : '') +
      '</div>' +
    '</div>';

  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-td-inner').style.transform = 'translateY(0)';
  }, 30);
  sheet.addEventListener('click', function(e) { if(e.target===sheet) sheet.remove(); });
}
window.thrillOpenDetail = thrillOpenDetail;
