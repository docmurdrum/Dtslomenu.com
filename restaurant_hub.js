// ══════════════════════════════════════════════
// RESTAURANT HUB.JS
// ══════════════════════════════════════════════

// RESTAURANT HUB
// ══════════════════════════════════════════════

var RESTAURANT_CATEGORIES = [
  {id:'all',label:'All',emoji:'🍽',color:'#ff2d78'},
  {id:'italian',label:'Italian',emoji:'🍕',color:'#ef4444'},
  {id:'american',label:'American',emoji:'🥩',color:'#f59e0b'},
  {id:'mexican',label:'Mexican',emoji:'🌮',color:'#22c55e'},
  {id:'japanese',label:'Japanese',emoji:'🍱',color:'#06b6d4'},
  {id:'tapas',label:'Tapas',emoji:'🫒',color:'#a855f7'},
  {id:'cafe',label:'Cafe',emoji:'☕',color:'#d97706'},
  {id:'pizza',label:'Pizza',emoji:'🍕',color:'#dc2626'},
  {id:'bbq',label:'BBQ',emoji:'🔥',color:'#ea580c'},
  {id:'peruvian',label:'Peruvian',emoji:'🌶',color:'#16a34a'},
  {id:'steakhouse',label:'Steakhouse',emoji:'🥩',color:'#92400e'},
  {id:'deli',label:'Deli',emoji:'🥪',color:'#65a30d'},
  {id:'greek',label:'Greek',emoji:'🫙',color:'#0284c7'},
  {id:'upscale',label:'Upscale',emoji:'⭐',color:'#ffd700'},
];

var RESTAURANT_COORDS = {
  'Novo Restaurant & Lounge':   [-120.6660,35.2815],
  'Mistura':                    [-120.6663,35.2818],
  "Giuseppe's Cucina Rustica":  [-120.6630,35.2800],
  'Luna Red':                   [-120.6642,35.2797],
  "Nate's on Marsh":            [-120.6635,35.2786],
  'Firestone Grill':            [-120.6638,35.2792],
  'Bear & The Wren':            [-120.6663,35.2818],
  'Flour House SLO':            [-120.6661,35.2816],
  'High Street Deli':           [-120.6599,35.2746],
  'Scout Coffee Co.':           [-120.6640,35.2791],
  'Ox + Anchor':                [-120.6638,35.2797],
  "Mama's Meatball":            [-120.6637,35.2792],
  'Old San Luis BBQ Co.':       [-120.6662,35.2817],
  'Goshi Japanese Restaurant':  [-120.6663,35.2817],
  'Greek Bistro':               [-120.6637,35.2792],
  'The Naked Fish':             [-120.6655,35.2808],
  'Kombu Sushi':                [-120.6650,35.2800],
  'San Luis Taqueria':          [-120.6654,35.2800],
  "Sally Loo's Wholesome Cafe": [-120.6622,35.2810],
  "Louisa's Place":             [-120.6648,35.2801],
  'Buona Tavola':               [-120.6632,35.2800],
  'Cafe Roma':                  [-120.6622,35.2780],
};

var restaurantVenueCache = null;
var restaurantMarkersActive = [];
var rhCurrentFilter = 'all';

function openRestaurantHub() {
  var existing = document.getElementById('mh-restaurant-hub');
  if (existing) existing.remove();

  if (!document.getElementById('mh-rh-css')) {
    var s = document.createElement('style');
    s.id = 'mh-rh-css';
    s.textContent = [
      '.mh-rh-cat-row{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:0 20px 2px;scrollbar-width:none;margin-bottom:12px}',
      '.mh-rh-cat-row::-webkit-scrollbar{display:none}',
      '.mh-rh-cat-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 12px;border-radius:14px;border:1.5px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);cursor:pointer;flex-shrink:0;transition:all 0.2s;min-width:56px}',
      '.mh-rh-cat-btn:active{transform:scale(0.95)}',
      '.mh-rh-cat-emoji{font-size:22px}',
      '.mh-rh-cat-label{font-size:9px;font-weight:700;color:rgba(255,255,255,0.4);white-space:nowrap}',
      '.mh-rh-venue-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:all 0.15s;margin-bottom:8px;animation:rh-slide 0.3s ease both}',
      '.mh-rh-venue-card:active{background:rgba(255,45,120,0.08);transform:scale(0.98)}',
      '@keyframes rh-slide{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}',
      '.mh-rh-venue-emoji{font-size:26px;flex-shrink:0;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center}',
      '.mh-rh-filter-row{display:flex;gap:6px;padding:0 20px;margin-bottom:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}',
      '.mh-rh-filter-row::-webkit-scrollbar{display:none}',
      '.mh-rh-filter{padding:5px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.mh-rh-filter.rh-f-active{background:rgba(255,45,120,0.1);border-color:rgba(255,45,120,0.4);color:#ff2d78}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-restaurant-hub';
  hub.style.cssText = 'position:absolute;inset:0;z-index:22;display:flex;flex-direction:column;background:rgba(6,6,15,0.95);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';
  // Floating X close button
  var rhClose = document.createElement('button');
  rhClose.style.cssText = 'position:absolute;top:56px;right:16px;z-index:25;background:rgba(255,255,255,0.12);border:none;color:white;width:34px;height:34px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  rhClose.textContent = '✕';
  rhClose.onclick = function() { menuHomeCloseRestaurantHub(); };
  hub.appendChild(rhClose);

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseRestaurantHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1"><div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🍽 Restaurants</div>' +
        '<div id="mh-rh-subtitle" style="font-size:11px;color:rgba(255,255,255,0.4)">Select a category</div></div>' +
        '<div id="mh-rh-count" style="font-size:12px;color:rgba(255,255,255,0.3)"></div>' +
      '</div>' +
      '<div class="mh-rh-cat-row" id="mh-rh-cats">' +
        RESTAURANT_CATEGORIES.map(function(c,i) {
          return '<div class="mh-rh-cat-btn' + (i===0?' mh-rh-cat-active':'') + '" onclick="menuHomeRhSelectCat(this,this.dataset.cat)" data-cat="' + c.id + '" style="' + (i===0?'border-color:'+c.color+';background:'+c.color+'18':'') + '">' +
            '<div class="mh-rh-cat-emoji">' + c.emoji + '</div>' +
            '<div class="mh-rh-cat-label">' + c.label + '</div></div>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="mh-rh-building-zone" style="height:0;overflow:hidden;transition:height 0.4s ease;flex-shrink:0">' +
      '<div style="padding:8px 20px;display:flex;gap:8px;align-items:flex-end" id="mh-rh-buildings"></div>' +
    '</div>' +
    '<div class="mh-rh-filter-row">' +
      '<div class="mh-rh-filter rh-f-active" onclick="menuHomeRhFilter(this,\'all\')">All</div>' +
      '<div class="mh-rh-filter" onclick="menuHomeRhFilter(this,\'top\')">⭐ Top Rated</div>' +
      '<div class="mh-rh-filter" onclick="menuHomeRhFilter(this,\'cheap\')">💰 Budget</div>' +
      '<div class="mh-rh-filter" onclick="menuHomeRhFilter(this,\'romantic\')">💑 Romantic</div>' +
      '<div class="mh-rh-filter" onclick="menuHomeRhFilter(this,\'patio\')">🌿 Patio</div>' +
      '<div class="mh-rh-filter" onclick="menuHomeRhFilter(this,\'happy_hour\')">🍹 Happy Hour</div>' +
    '</div>' +
    '<div id="mh-rh-list" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">Loading restaurants...</div>' +
    '</div>';

  document.getElementById('menu-home').appendChild(hub);
  setTimeout(function() {
    hub.style.opacity = '1';
    loadRestaurantHubVenues('all');
  }, 30);
}
window.menuHomeOpenRestaurantHub = openRestaurantHub;

function closeRestaurantHub() {
  var h = document.getElementById('mh-restaurant-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 300); }
  restaurantMarkersActive.forEach(function(m) { try { m.remove(); } catch(e) {} });
  restaurantMarkersActive = [];
}
window.menuHomeCloseRestaurantHub = closeRestaurantHub;

function rhSelectCat(el, catId) {
  document.querySelectorAll('.mh-rh-cat-btn').forEach(function(b) {
    b.classList.remove('mh-rh-cat-active');
    b.style.borderColor = 'rgba(255,255,255,0.08)';
    b.style.background = 'rgba(255,255,255,0.04)';
  });
  var cat = null;
  for (var i=0;i<RESTAURANT_CATEGORIES.length;i++) { if (RESTAURANT_CATEGORIES[i].id===catId) { cat=RESTAURANT_CATEGORIES[i]; break; } }
  el.classList.add('mh-rh-cat-active');
  if (cat) { el.style.borderColor = cat.color; el.style.background = cat.color + '18'; }
  rhTriggerBuildingPop(catId, cat ? cat.color : '#ff2d78');
  loadRestaurantHubVenues(catId);
}
window.menuHomeRhSelectCat = rhSelectCat;

function rhTriggerBuildingPop(catId, color) {
  var zone = document.getElementById('mh-rh-building-zone');
  var bldgs = document.getElementById('mh-rh-buildings');
  if (!zone || !bldgs) return;
  var venues = restaurantVenueCache || [];
  var sample = (catId==='all' ? venues : venues.filter(function(v){return v.category===catId;})).slice(0,7);
  if (!sample.length) { zone.style.height='0'; return; }
  zone.style.height = '80px';
  if (!document.getElementById('rh-bldg-kf')) {
    var s = document.createElement('style');
    s.id = 'rh-bldg-kf';
    s.textContent = '@keyframes rh-bpop{from{opacity:0;transform:scaleY(0) translateY(8px)}to{opacity:1;transform:scaleY(1) translateY(0)}}';
    document.head.appendChild(s);
  }
  bldgs.innerHTML = sample.map(function(v,i) {
    var h = 30 + Math.floor(Math.random()*28);
    var emoji = getRhEmoji(v.category);
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex-shrink:0;animation:rh-bpop 0.4s ease '+((i*0.06).toFixed(2))+'s both">' +
      '<div style="font-size:12px">' + emoji + '</div>' +
      '<div style="width:32px;height:'+h+'px;border-radius:5px 5px 0 0;background:linear-gradient(180deg,'+color+'55,'+color+'22);border:1px solid '+color+'44;display:flex;align-items:flex-start;justify-content:center;padding-top:3px">' +
        '<div style="width:6px;height:6px;border-radius:50%;background:'+color+';box-shadow:0 0 5px '+color+'"></div></div></div>';
  }).join('');
  rhAddMapPins(sample, color);
  if (window._rhBldgTimer) clearTimeout(window._rhBldgTimer);
  window._rhBldgTimer = setTimeout(function() { zone.style.height='0'; }, 1800);
}

function rhAddMapPins(venues, color) {
  restaurantMarkersActive.forEach(function(m) { try { m.remove(); } catch(e) {} });
  restaurantMarkersActive = [];
  if (!homeMap || !window.maplibregl) return;
  venues.forEach(function(v) {
    var coords = RESTAURANT_COORDS[v.name];
    if (!coords) return;
    var el = document.createElement('div');
    el.style.cssText = 'width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 0 8px '+color+';border:2px solid '+color+';background:rgba(6,6,15,0.9);cursor:pointer';
    el.textContent = getRhEmoji(v.category);
    el.title = v.name;
    el.onclick = function() { rhShowVenueDetail(v); };
    try {
      var marker = new maplibregl.Marker({element:el,anchor:'center'}).setLngLat(coords).addTo(homeMap);
      restaurantMarkersActive.push(marker);
    } catch(e) {}
  });
}

function getRhEmoji(cat) {
  var map = {'world fusion':'🌊','italian':'🍕','american':'🥩','tapas':'🫒','upscale':'⭐','pizza':'🍕','bbq':'🔥','japanese':'🍱','sushi':'🍣','mexican':'🌮','cafe':'☕','greek':'🫙','deli':'🥪','peruvian':'🌶','steakhouse':'🥩','seafood':'🐟'};
  return map[(cat||'').toLowerCase()] || '🍽';
}

function rhFilter(el, filterId) {
  document.querySelectorAll('.mh-rh-filter').forEach(function(f) { f.classList.remove('rh-f-active'); });
  el.classList.add('rh-f-active');
  rhCurrentFilter = filterId;
  rhRenderList(restaurantVenueCache || [], filterId);
}
window.menuHomeRhFilter = rhFilter;

var RH_HAPPY_HOUR  = ['Luna Red','Novo Restaurant & Lounge'];
var RH_PATIO       = ['Novo Restaurant & Lounge','Luna Red','Flour House SLO'];
var RH_ROMANTIC    = ["Nate's on Marsh","Mistura","Giuseppe's Cucina Rustica","Novo Restaurant & Lounge"];

async function loadRestaurantHubVenues(catId) {
  var list = document.getElementById('mh-rh-list');
  var sub  = document.getElementById('mh-rh-subtitle');
  var cnt  = document.getElementById('mh-rh-count');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);font-size:12px">Loading...</div>';
  try {
    var sb = supabaseClient;
    var q = sb.from('businesses').select('*').eq('type','restaurant').eq('is_active',true).order('name',{ascending:true});
    if (catId !== 'all') q = q.eq('category', catId);
    var result = await q;
    var venues = result.data || [];
    restaurantVenueCache = venues;
    var catObj = null;
    for (var i=0;i<RESTAURANT_CATEGORIES.length;i++) { if (RESTAURANT_CATEGORIES[i].id===catId) { catObj=RESTAURANT_CATEGORIES[i]; break; } }
    if (sub) sub.textContent = catId==='all' ? 'All restaurants in SLO' : (catObj ? catObj.label+' restaurants' : '');
    if (cnt) cnt.textContent = venues.length + ' spots';
    rhTriggerBuildingPop(catId, catObj ? catObj.color : '#ff2d78');
    rhRenderList(venues, rhCurrentFilter);
  } catch(e) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);font-size:12px">Could not load — check connection</div>';
  }
}

function rhRenderList(venues, filter) {
  var list = document.getElementById('mh-rh-list');
  if (!list) return;
  var filtered = venues;
  if (filter==='top')        filtered = venues.filter(function(v){return (v.rating||0)>=4.4;});
  if (filter==='cheap')      filtered = venues.filter(function(v){return (v.price_level||3)<=1;});
  if (filter==='romantic')   filtered = venues.filter(function(v){return RH_ROMANTIC.indexOf(v.name)>=0;});
  if (filter==='patio')      filtered = venues.filter(function(v){return RH_PATIO.indexOf(v.name)>=0;});
  if (filter==='happy_hour') filtered = venues.filter(function(v){return RH_HAPPY_HOUR.indexOf(v.name)>=0;});
  if (!filtered.length) { list.innerHTML = '<div style="padding:30px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px">No matches</div>'; return; }
  list.innerHTML = filtered.map(function(v,i) {
    var price = '$'.repeat(v.price_level||2);
    var rating = v.rating||0;
    var stars = '';
    for (var s=1;s<=5;s++) stars += '<div style="width:7px;height:7px;border-radius:50%;background:'+(s<=Math.round(rating)?'#ffd700':'rgba(255,255,255,0.15)')+';margin-right:2px;display:inline-block"></div>';
    return '<div class="mh-rh-venue-card" onclick="menuHomeRhVenueDetail(this)" data-idx="'+i+'" style="animation-delay:'+(i*0.04)+'s">' +
      '<div class="mh-rh-venue-emoji">'+getRhEmoji(v.category)+'</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:800;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+v.name+'</div>' +
        '<div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">'+stars+'<span style="font-size:10px;color:rgba(255,255,255,0.35)">'+( rating>0?rating.toFixed(1):'' )+'</span></div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.35)">'+(v.category?v.category.charAt(0).toUpperCase()+v.category.slice(1):'') +' · '+price+'</div>' +
      '</div>' +
      '<span style="color:rgba(255,255,255,0.2);font-size:18px">›</span></div>';
  }).join('');
  // Store for detail lookup
  window._rhCurrentList = filtered;
}

function rhVenueDetail(el) {
  var idx = parseInt(el.dataset.idx);
  var venue = window._rhCurrentList && window._rhCurrentList[idx];
  if (!venue) return;
  rhShowVenueDetail(venue);
}
window.menuHomeRhVenueDetail = rhVenueDetail;

function rhShowVenueDetail(venue) {
  var existing = document.getElementById('mh-rh-detail');
  if (existing) existing.remove();
  var price = '$'.repeat(venue.price_range||2);
  var sheet = document.createElement('div');
  sheet.id = 'mh-rh-detail';
  sheet.style.cssText = 'position:absolute;inset:0;z-index:24;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
  sheet.innerHTML =
    '<div id="mh-rh-det-inner" style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,45,120,0.2);padding:12px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="menuHomeRhCloseDetail()"></div>' +
    '<div style="font-size:32px;margin-bottom:8px">'+getRhEmoji(venue.category)+'</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">'+venue.name+'</div>' +
    '<div style="display:flex;gap:10px;margin-bottom:12px;font-size:12px;color:rgba(255,255,255,0.5)">' +
      '<span>'+(venue.category?venue.category.charAt(0).toUpperCase()+venue.category.slice(1):'')+'</span>' +
      '<span>'+price+'</span>' +
      (venue.rating ? '<span>⭐ '+venue.rating.toFixed(1)+'</span>' : '') +
    '</div>' +
    (venue.description ? '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin-bottom:12px">'+venue.description+'</div>' : '') +
    (venue.address ? '<div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:16px">📍 '+venue.address+'</div>' : '') +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
      '<a href="https://www.google.com/maps/search/'+encodeURIComponent((venue.name||'')+' San Luis Obispo CA')+'" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Get Directions ↗</a>' +
      '<a href="https://www.google.com/search?q='+encodeURIComponent((venue.name||'')+' San Luis Obispo reservation')+'" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,45,120,0.08);border:1px solid rgba(255,45,120,0.25);color:#ff2d78;text-decoration:none;font-size:13px;font-weight:700;text-align:center">Reserve a Table ↗</a>' +
    '</div>' +
    '<button onclick="menuHomeRhCloseDetail()" style="width:100%;margin-top:10px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
    '</div>';
  document.getElementById('menu-home').appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-rh-det-inner').style.transform = 'translateY(0)';
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target===sheet) menuHomeRhCloseDetail(); });
}

function rhCloseDetail() {
  var s = document.getElementById('mh-rh-detail');
  if (s) { s.style.opacity='0'; setTimeout(function(){s.remove();},300); }
}
window.menuHomeRhCloseDetail = rhCloseDetail;

