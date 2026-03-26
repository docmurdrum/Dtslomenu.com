// ══════════════════════════════════════════════
// WINE_HUB.JS — Wine Country Hub
// Paso Robles + SLO Wine region
// ══════════════════════════════════════════════

var WINE_REGIONS = [
  {
    id: 'paso', name: 'Paso Robles', emoji: '🍷', color: '#7c2d8e',
    desc: '200+ wineries · 45 min north', drive: '45 min',
    coords: [-120.6908, 35.6244],
    highlights: ['Cabernet capital of CA', 'Hot days, cool nights', 'Old vine Zinfandel'],
    wineries: [
      { name: 'Justin Winery',          vibe: 'Upscale estate',        price: '$$$', hours: '10am-6pm', tip: 'Book the ISOSCELES tasting' },
      { name: 'Tablas Creek',            vibe: 'Rhone varieties, biodynamic', price: '$$', hours: '10am-5pm', tip: 'Best for wine nerds' },
      { name: 'Epoch Estate',            vibe: 'Hilltop views',         price: '$$$', hours: '11am-5pm', tip: 'Incredible Grenache' },
      { name: 'Daou Vineyards',          vibe: 'Mountain views, stunning', price: '$$$', hours: '10am-5pm', tip: 'Go for the views alone' },
      { name: 'Adelaida Cellars',        vibe: 'Historic estate',       price: '$$',  hours: '10am-5pm', tip: 'Vikings White is a must' },
      { name: 'Sculpterra',              vibe: 'Sculpture garden + wine', price: '$', hours: '10am-5pm', tip: 'Wildly underrated' },
    ],
    food: [
      { name: 'La Cosecha',    vibe: 'Farm-to-table, downtown Paso',  price: '$$$' },
      { name: 'Thomas Hill Organics', vibe: 'Organic bistro',         price: '$$$' },
      { name: 'McPhee\'s Grill', vibe: 'Casual wine country lunch',   price: '$$'  },
    ],
  },
  {
    id: 'slo_wine', name: 'SLO Wine', emoji: '🌿', color: '#b44fff',
    desc: 'Edna Valley · Arroyo Grande', drive: '15-25 min',
    coords: [-120.5950, 35.2200],
    highlights: ['Cool coastal influence', 'Chardonnay & Pinot country', 'Close to town'],
    wineries: [
      { name: 'Talley Vineyards',        vibe: 'Family estate, elegant',  price: '$$$', hours: '10:30am-4:30pm', tip: 'Best Pinot in the county' },
      { name: 'Edna Valley Vineyard',    vibe: 'Classic, approachable',   price: '$$',  hours: '10am-5pm',       tip: 'Great intro to the region' },
      { name: 'Claiborne & Churchill',   vibe: 'Alsatian style',          price: '$$',  hours: '11am-5pm',       tip: 'Amazing dry Riesling' },
      { name: 'Center of Effort',        vibe: 'Sustainable, modern',     price: '$$',  hours: '10am-5pm',       tip: 'Farm views are stunning' },
      { name: 'Tolosa Winery',           vibe: 'Contemporary estate',     price: '$$$', hours: '10am-5pm',       tip: 'No-Oak Chardonnay is iconic' },
    ],
    food: [
      { name: 'Ciopinot',        vibe: 'Seafood meets wine country',  price: '$$$' },
      { name: 'Spirit of San Luis', vibe: 'Overlooking Edna Valley', price: '$$$' },
    ],
  },
  {
    id: 'downtown_wine', name: 'Downtown SLO Wine', emoji: '🥂', color: '#ff2d78',
    desc: 'Wine bars & tasting rooms in DTSLO', drive: 'Walking',
    coords: [-120.6640, 35.2800],
    highlights: ['Walk between spots', 'Local pours', 'Happy hour deals'],
    wineries: [
      { name: 'SLO Wine Tasting Lounge', vibe: 'All local wines, no pretension', price: '$$', hours: '12pm-9pm', tip: 'Best intro to the region' },
      { name: 'Bon Temps',               vibe: 'French inspired wine bar',        price: '$$$', hours: '4pm-10pm', tip: 'Perfect date spot' },
      { name: 'Pour Choices Wine Bar',   vibe: 'Casual, great by-the-glass',      price: '$$',  hours: '3pm-11pm', tip: 'Best rotating selection' },
      { name: 'Luna Red',                vibe: 'Tapas + wine list',               price: '$$$', hours: '11am-10pm', tip: 'Patio on warm evenings' },
    ],
    food: [
      { name: 'Luna Red',         vibe: 'Best tapas pairing in SLO',  price: '$$$' },
      { name: 'Novo Restaurant',  vibe: 'Creekside, excellent list',   price: '$$$' },
    ],
  },
];

var WINE_FILTERS = [
  { id:'all',      label:'All',          emoji:'🍷' },
  { id:'paso',     label:'Paso Robles',  emoji:'🏔' },
  { id:'slo_wine', label:'Edna Valley',  emoji:'🌿' },
  { id:'downtown_wine', label:'Downtown', emoji:'🥂' },
  { id:'tour',     label:'Plan a Tour',  emoji:'✨' },
];

function openWineHub() {
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
  hub.style.cssText = 'position:absolute;inset:0;z-index:22;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

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
      whRenderAll() +
    '</div>';

  document.getElementById('menu-home').appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
}
window.menuHomeOpenWineHub = openWineHub;

function closeWineHub() {
  var h = document.getElementById('mh-wine-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseWineHub = closeWineHub;

function whFilter(el, filterId) {
  document.querySelectorAll('.wh-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('wh-content');
  if (!content) return;

  if (filterId === 'tour') {
    content.innerHTML = whRenderTourPlanner();
  } else if (filterId === 'all') {
    content.innerHTML = whRenderAll();
  } else {
    var region = WINE_REGIONS.find(function(r) { return r.id === filterId; });
    content.innerHTML = region ? whRenderRegion(region) : whRenderAll();
  }
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
