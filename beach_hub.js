// ══════════════════════════════════════════════
// BEACH HUB.JS
// Data sourced from Supabase beaches table
// ══════════════════════════════════════════════

var BEACHES = []; // populated from Supabase on open

async function loadBeaches(filterId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('beaches').select('*').eq('city_id', 'slo').eq('active', true).order('sort_order', { ascending: true });
    if (filterId === 'close')  q = q.lte('distance_miles', 18);
    if (filterId === 'dogs')   q = q.eq('dogs_allowed', true);
    if (filterId === 'surf')   q = q.eq('surfing', true);
    var res = await q;
    if (res.error) throw res.error;
    return (res.data || []).map(function(r) {
      return {
        id:       String(r.id),
        name:     r.name,
        emoji:    r.emoji || '🏖',
        drive:    r.drive_time || '',
        miles:    r.distance_miles || 0,
        vibe:     r.short_desc || '',
        rating:   'Good',
        surf:     '—',
        wind:     '—',
        water:    r.water_temp || '—',
        uv:       '—',
        tide:     '—',
        color:    '#06b6d4',
        coords:   (r.lng && r.lat) ? [r.lng, r.lat] : null,
        parking:  r.parking ? [{ name: r.parking, cost: r.parking_fee || '', status: 'Open' }] : [],
        trails:   [],
        rentals:  [],
        eat:      r.nearby_eats ? [{ name: r.nearby_eats, vibe: '', price: '' }] : [],
        bus:      { route: 'Check SLO Transit', fare: 0, freq: 'Varies' },
        sunrise:  '—',
        sunset:   '—',
        tip:      r.tip || '',
        tags:     r.tags || [],
        dogs:     r.dogs_allowed !== false,
        swimming: r.swimming !== false,
        surfing:  r.surfing === true,
        facilities: r.facilities || [],
        best_for: r.best_for || [],
      };
    });
  } catch(e) {
    console.warn('[BeachHub] Supabase load failed:', e);
    return [];
  }
}

// ── OPEN BEACH HUB (beach selector) ──
function openBeachHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('beach');
  var existing = document.getElementById('mh-beach-hub');
  if (existing) existing.remove();

  if (!document.getElementById('mh-bh-css')) {
    var s = document.createElement('style');
    s.id = 'mh-bh-css';
    s.textContent = [
      '.mh-bh-filter{padding:7px 14px;border-radius:20px;border:1px solid rgba(6,182,212,0.2);background:rgba(6,182,212,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.mh-bh-filter.active{background:rgba(6,182,212,0.15);border-color:rgba(6,182,212,0.5);color:#06b6d4}',
      '.mh-bh-card{padding:14px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);cursor:pointer;margin-bottom:8px;transition:all 0.15s}',
      '.mh-bh-card:active{background:rgba(6,182,212,0.08);border-color:rgba(6,182,212,0.3);transform:scale(0.98)}',
      '.mh-beach-tab{padding:8px 14px;border-radius:20px;border:1px solid rgba(6,182,212,0.15);background:rgba(6,182,212,0.04);color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.mh-beach-tab.active{background:rgba(6,182,212,0.15);border-color:#06b6d4;color:#06b6d4}',
      '.mh-beach-section{margin-bottom:20px}',
      '.mh-beach-sec-title{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(6,182,212,0.6);margin-bottom:10px}',
      '.mh-cond-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}',
      '.mh-cond-card{padding:10px 8px;border-radius:12px;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.12);text-align:center}',
      '.mh-cond-val{font-size:16px;font-weight:900;color:#06b6d4}',
      '.mh-cond-lbl{font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}',
      '.mh-info-row{padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;font-size:13px}',
      '.mh-trail-card{padding:11px 12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px}',
      '.mh-rental-card{padding:11px 12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between}',
      '.mh-eat-row{padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;font-size:13px}',
      '.mh-cost-calc{padding:16px;background:rgba(6,182,212,0.05);border:1px solid rgba(6,182,212,0.15);border-radius:16px;margin-bottom:16px}',
      '@keyframes bh-shimmer{0%,100%{opacity:0.5}50%{opacity:1}}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-beach-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseBeachHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🏖 Beach Hub</div>' +
          '<div id="bh-count" style="font-size:11px;color:rgba(255,255,255,0.4)">Beaches · Surf · Trails</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseBeachHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        '<button class="mh-bh-filter active" onclick="bhFilterLoad(this,\'all\')">🌊 All</button>' +
        '<button class="mh-bh-filter" onclick="bhFilterLoad(this,\'close\')">📍 Closest</button>' +
        '<button class="mh-bh-filter" onclick="bhFilterLoad(this,\'dogs\')">🐕 Dogs OK</button>' +
        '<button class="mh-bh-filter" onclick="bhFilterLoad(this,\'surf\')">🏄 Surfing</button>' +
      '</div>' +
    '</div>' +
    '<div id="bh-list" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      bhRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('beach');

  loadBeaches('all').then(function(beaches) {
    BEACHES = beaches;
    var listEl = document.getElementById('bh-list');
    var countEl = document.getElementById('bh-count');
    if (listEl) listEl.innerHTML = bhRenderList(beaches);
    if (countEl) countEl.textContent = 'Beaches · Surf · Trails · ' + beaches.length + ' beaches';
  });
}
window.menuHomeOpenBeachHub = openBeachHub;

function bhRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4].map(function() {
      return '<div style="height:80px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);animation:bh-shimmer 1.4s infinite"></div>';
    }).join('') + '</div>';
}

function bhRenderList(beaches) {
  if (!beaches.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No beaches found</div>';
  return beaches.map(function(b) {
    return '<div class="mh-bh-card" data-id="' + b.id + '" data-drive="' + b.miles + '" onclick="openBeach(\'' + b.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="font-size:32px">' + b.emoji + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:15px;font-weight:800">' + b.name + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px">' + b.vibe + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">' +
            (b.tags||[]).slice(0,3).map(function(t) {
              return '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.18);color:rgba(6,182,212,0.8)">' + t + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
          '<div style="font-size:13px;font-weight:800;color:#06b6d4">' + b.drive + '</div>' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3)">' + b.miles + ' mi</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function bhFilterLoad(el, type) {
  document.querySelectorAll('.mh-bh-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var listEl = document.getElementById('bh-list');
  if (listEl) listEl.innerHTML = bhRenderLoading();
  loadBeaches(type).then(function(beaches) {
    BEACHES = beaches;
    if (listEl) listEl.innerHTML = bhRenderList(beaches);
  });
}
window.menuHomeBhFilter = bhFilterLoad;

function closeBeachHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('beach');
  var s = document.getElementById('mh-beach-hub');
  if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); }, 300); }
}
window.menuHomeCloseBeachHub = closeBeachHub;

function bhFilter(el, type) {
  document.querySelectorAll('.mh-bh-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var cards = document.querySelectorAll('.mh-bh-card');
  cards.forEach(function(c) {
    var show = true;
    if (type === 'close')  show = parseInt(c.dataset.drive) <= 18;
    if (type === 'good')   show = c.dataset.rating === 'Good';
    if (type === 'dogs')   show = ['avila','pismo','shell','morro','cayucos','mdo'].indexOf(c.dataset.id) >= 0;
    if (type === 'trails') show = ['avila','pismo','morro','cayucos','cambria','oceano','mdo'].indexOf(c.dataset.id) >= 0;
    c.style.display = show ? 'block' : 'none';
  });
}
window.menuHomeBhFilter = bhFilter;

// ── INDIVIDUAL BEACH DETAIL ──
function openBeach(id) {
  var beach = BEACHES.find(function(b) { return b.id === id; });
  if (!beach) {
    // Fallback — fetch directly
    window.supabaseClient.from('beaches').select('*').eq('id', id).limit(1).then(function(res) {
      if (res.data && res.data[0]) {
        var r = res.data[0];
        var b = {
          id: String(r.id), name: r.name, emoji: r.emoji || '🏖',
          drive: r.drive_time || '', miles: r.distance_miles || 0,
          vibe: r.short_desc || '', rating: 'Good', surf: '—', wind: '—',
          water: r.water_temp || '—', uv: '—', tide: '—', color: '#06b6d4',
          coords: (r.lng && r.lat) ? [r.lng, r.lat] : null,
          parking: r.parking ? [{ name: r.parking, cost: r.parking_fee || '', status: 'Open' }] : [],
          trails: [], rentals: [],
          eat: r.nearby_eats ? [{ name: r.nearby_eats, vibe: '', price: '' }] : [],
          bus: { route: 'Check SLO Transit', fare: 0, freq: 'Varies' },
          sunrise: '—', sunset: '—', tip: r.tip || '', tags: r.tags || [],
        };
        closeBeachHub();
        setTimeout(function() { showBeachDetail(b); }, 400);
      }
    });
    return;
  }
  if (homeMap && beach.coords) {
    try { homeMap.flyTo({ center: beach.coords, zoom: 14, pitch: 50, bearing: 0, duration: 1200 }); } catch(e) {}
  }
  closeBeachHub();
  setTimeout(function() { showBeachDetail(beach); }, 400);
}
window.menuHomeOpenBeach = openBeach;

function showBeachDetail(b) {
  var existing = document.getElementById('mh-beach-detail');
  if (existing) existing.remove();

  var ratingColor = {Good:'#22c55e', Fair:'#f59e0b', Poor:'#ef4444'};
  var rc = ratingColor[b.rating] || '#ffffff';

  var sheet = document.createElement('div');
  sheet.id = 'mh-beach-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(2,15,25,0.97),rgba(4,20,35,0.97));opacity:0;transition:opacity 0.4s';

  sheet.innerHTML =
    // Header
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseBeachDetail()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">' + b.emoji + ' ' + b.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + b.vibe + '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div style="font-size:14px;font-weight:900;color:' + rc + '">' + b.surf + '</div>' +
          '<div style="font-size:10px;font-weight:700;color:' + rc + '">' + b.rating + '</div>' +
        '</div>' +
      '</div>' +

      // Tab bar
      '<div style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;scrollbar-width:none">' +
        '<button class="mh-beach-tab active" onclick="menuHomeBeachTab(this,\'conditions\')" data-tab="conditions">🌊 Conditions</button>' +
        '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'getting-there\')" data-tab="getting-there">🚗 Getting There</button>' +
        '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'trails\')" data-tab="trails">🥾 Trails</button>' +
        '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'rentals\')" data-tab="rentals">🏄 Rentals</button>' +
        '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'eat\')" data-tab="eat">🍽 Eat</button>' +
      '</div>' +
    '</div>' +

    // Scrollable content
    '<div id="mh-bd-content" style="flex:1;overflow-y:auto;padding:16px 20px 48px">' +

      // CONDITIONS TAB
      '<div id="mh-bd-conditions" class="mh-bd-tab">' +
        '<div class="mh-cond-grid">' +
          '<div class="mh-cond-card"><div class="mh-cond-val">' + b.surf + '</div><div class="mh-cond-lbl">Surf</div></div>' +
          '<div class="mh-cond-card"><div class="mh-cond-val">' + b.water + '</div><div class="mh-cond-lbl">Water</div></div>' +
          '<div class="mh-cond-card"><div class="mh-cond-val">UV ' + b.uv + '</div><div class="mh-cond-lbl">Index</div></div>' +
          '<div class="mh-cond-card"><div class="mh-cond-val">' + b.tide + '</div><div class="mh-cond-lbl">Tide</div></div>' +
          '<div class="mh-cond-card"><div class="mh-cond-val">' + b.sunrise + '</div><div class="mh-cond-lbl">Sunrise</div></div>' +
          '<div class="mh-cond-card"><div class="mh-cond-val">' + b.sunset + '</div><div class="mh-cond-lbl">Sunset</div></div>' +
        '</div>' +
        '<div class="mh-info-row"><span>Wind</span><span style="color:rgba(255,255,255,0.6)">' + b.wind + '</span></div>' +
        '<div class="mh-info-row"><span style="color:#ffd700">⚠️ Rip current risk</span><span style="color:#ffd700">Low</span></div>' +
        '<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">' +
          '<a href="https://www.surfline.com/surf-reports-forecasts-cams/united-states/california/san-luis-obispo-county/5392329" target="_blank" style="display:block;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Surfline Full Forecast ↗</a>' +
          '<a href="https://www.805webcams.com" target="_blank" style="display:block;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);text-decoration:none;font-size:13px;font-weight:700;text-align:center">805 Live Beach Cams ↗</a>' +
        '</div>' +
      '</div>' +

      // GETTING THERE TAB
      '<div id="mh-bd-getting-there" class="mh-bd-tab" style="display:none">' +
        '<div class="mh-beach-sec-title">PARKING</div>' +
        b.parking.map(function(p) {
          var sc = p.status === 'Open' ? '#22c55e' : p.status === 'Busy' ? '#f59e0b' : '#ef4444';
          return '<div class="mh-info-row"><div><div style="font-size:13px;font-weight:700">' + p.name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + p.cost + '</div></div><span style="color:' + sc + ';font-size:12px;font-weight:700">' + p.status + '</span></div>';
        }).join('') +
        '<div style="margin-top:16px"><div class="mh-beach-sec-title">TRANSIT</div>' +
        '<div class="mh-info-row"><span>Bus route</span><span style="color:rgba(255,255,255,0.6);font-size:12px">' + b.bus.route + '</span></div>' +
        (b.bus.fare > 0 ? '<div class="mh-info-row"><span>Fare</span><span style="color:#22c55e">$' + b.bus.fare.toFixed(2) + '/person</span></div>' : '') +
        (b.bus.freq !== 'None' ? '<div class="mh-info-row"><span>Frequency</span><span style="color:rgba(255,255,255,0.5)">' + b.bus.freq + '</span></div>' : '<div class="mh-info-row"><span style="color:rgba(255,255,255,0.4)">No bus service — drive or rideshare</span></div>') +
        '</div>' +
        // Trip cost calculator
        '<div class="mh-cost-calc" style="margin-top:16px">' +
          '<div class="mh-beach-sec-title" style="color:rgba(255,215,0,0.7)">💰 TRIP COST CALCULATOR</div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
            '<span style="font-size:13px;color:rgba(255,255,255,0.6)">Group size</span>' +
            '<input type="range" id="bh-group-' + b.id + '" min="1" max="8" value="2" style="flex:1;accent-color:#06b6d4" oninput="menuHomeCalcTrip(\'' + b.id + '\',this.value)">' +
            '<span id="bh-gval-' + b.id + '" style="font-size:16px;font-weight:900;color:#06b6d4;min-width:20px">2</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="bh-costs-' + b.id + '">' +
            buildCostCards(b, 2) +
          '</div>' +
        '</div>' +
        '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(b.name + ' CA') + '" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);color:#06b6d4;text-decoration:none;font-size:13px;font-weight:800;text-align:center;margin-top:12px">Get Directions ↗</a>' +
      '</div>' +

      // TRAILS TAB
      '<div id="mh-bd-trails" class="mh-bd-tab" style="display:none">' +
        b.trails.map(function(t) {
          return '<div class="mh-trail-card">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
              '<div style="font-size:13px;font-weight:800">' + t.name + '</div>' +
              '<div style="font-size:10px;font-weight:700;color:' + (t.diff==='Easy'?'#22c55e':t.diff==='Moderate'?'#f59e0b':'#ef4444') + '">' + t.diff + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:12px;font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px">' +
              '<span>📏 ' + t.dist + '</span>' +
              '<span>' + (t.dogs ? '🐕 Dogs OK' : '🚫 No dogs') + '</span>' +
            '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,0.55)">' + t.notes + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +

      // RENTALS TAB
      '<div id="mh-bd-rentals" class="mh-bd-tab" style="display:none">' +
        b.rentals.map(function(r) {
          if (!r.price) return '<div class="mh-rental-card"><div style="font-size:12px;color:rgba(255,255,255,0.4)">' + r.name + '</div></div>';
          return '<div class="mh-rental-card">' +
            '<div><div style="font-size:13px;font-weight:800">' + r.name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + r.type + '</div></div>' +
            '<div style="text-align:right">' +
              '<div style="font-size:13px;font-weight:800;color:#22c55e">' + r.price + '</div>' +
              (r.link ? '<a href="' + r.link + '" target="_blank" style="font-size:10px;color:#06b6d4;text-decoration:none">Book ↗</a>' : '') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +

      // EAT TAB
      '<div id="mh-bd-eat" class="mh-bd-tab" style="display:none">' +
        b.eat.map(function(e) {
          if (!e.price) return '<div class="mh-eat-row"><span style="color:rgba(255,255,255,0.4)">' + e.name + '</span></div>';
          return '<div class="mh-eat-row">' +
            '<div><div style="font-size:13px;font-weight:800">' + e.name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + e.vibe + '</div></div>' +
            '<span style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.5)">' + e.price + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +

    '</div>';

  getHubParent().appendChild(sheet);
  setTimeout(function() { sheet.style.opacity = '1'; }, 30);
}

function buildCostCards(b, group) {
  var miles = b.miles;
  var busFare = b.bus.fare > 0 ? (b.bus.fare * group).toFixed(2) : null;
  var uberEst = (miles * 1.5 * group * 0.3 + 8).toFixed(0);
  var lyftEst = (miles * 1.4 * group * 0.3 + 7).toFixed(0);
  var driveEst = (miles * 2 * 0.18).toFixed(2);
  return [
    '<div class="mh-cond-card"><div class="mh-cond-val">$' + (busFare || '—') + '</div><div class="mh-cond-lbl">Bus (' + group + 'ppl)</div></div>',
    '<div class="mh-cond-card"><div class="mh-cond-val">~$' + uberEst + '</div><div class="mh-cond-lbl">Uber (est)</div></div>',
    '<div class="mh-cond-card"><div class="mh-cond-val">~$' + lyftEst + '</div><div class="mh-cond-lbl">Lyft (est)</div></div>',
    '<div class="mh-cond-card"><div class="mh-cond-val">$' + driveEst + '</div><div class="mh-cond-lbl">Gas (est)</div></div>',
  ].join('');
}

function calcTrip(beachId, group) {
  var beach = null;
  for (var i = 0; i < BEACHES.length; i++) { if (BEACHES[i].id === beachId) { beach = BEACHES[i]; break; } }
  if (!beach) return;
  var n = parseInt(group);
  document.getElementById('bh-gval-' + beachId).textContent = n;
  var el = document.getElementById('bh-costs-' + beachId);
  if (el) el.innerHTML = buildCostCards(beach, n);
}
window.menuHomeCalcTrip = calcTrip;

function beachTab(el, id) {
  document.querySelectorAll('.mh-beach-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  document.querySelectorAll('.mh-bd-tab').forEach(function(p) { p.style.display = 'none'; });
  var panel = document.getElementById('mh-bd-' + id);
  if (panel) panel.style.display = 'block';
}
window.menuHomeBeachTab = beachTab;

function closeBeachDetail() {
  var s = document.getElementById('mh-beach-detail');
  if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); openBeachHub(); }, 400); }
}
window.menuHomeCloseBeachDetail = closeBeachDetail;

