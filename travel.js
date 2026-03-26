// ══════════════════════════════════════════════
// TRAVEL.JS
// ══════════════════════════════════════════════

// ── TRAVEL DRAWER ──

// Tab switcher
function travelTab(el, id) {
  document.querySelectorAll('.mh-travel-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  var sections = ['tours','food','hotels','beaches'];
  sections.forEach(function(s) {
    var sec = document.getElementById('mh-tsec-' + s);
    if (sec) sec.style.display = (id === 'all' || id === s) ? 'block' : 'none';
  });
}
window.menuHomeTravelTab = travelTab;

// Load venues from Supabase when travel drawer opens
var travelVenuesLoaded = false;
function loadTravelVenues() {
  if (travelVenuesLoaded) return;
  travelVenuesLoaded = true;
  loadRestaurants();
  loadHotels();
}
window.menuHomeTravelLoadVenues = loadTravelVenues;

async function loadRestaurants() {
  var list = document.getElementById('mh-restaurant-list');
  if (!list) return;
  try {
    var sb = window.supabaseClient;
    if (!sb) { list.innerHTML = renderFallbackRestaurants(); return; }
    var result = await sb.from('venues')
      .select('name,category,price_range,rating,description,tags')
      .eq('type','restaurant')
      .order('rating', { ascending: false })
      .limit(6);
    if (result.error || !result.data || !result.data.length) {
      list.innerHTML = renderFallbackRestaurants(); return;
    }
    list.innerHTML = result.data.map(function(v) {
      var price = '$'.repeat(v.price_range || 2);
      var stars = v.rating ? v.rating.toFixed(1) + '⭐' : '';
      var emoji = getCategoryEmoji(v.category);
      return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
        '<span class="mh-venue-emoji">' + emoji + '</span>' +
        '<div class="mh-venue-info">' +
          '<div class="mh-venue-name">' + v.name + '</div>' +
          '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + price + (stars ? ' · ' + stars : '') + '</div>' +
        '</div>' +
        '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
      '</div>';
    }).join('');
  } catch(e) {
    list.innerHTML = renderFallbackRestaurants();
  }
}

function renderFallbackRestaurants() {
  var items = [
    {name:'Novo Restaurant',category:'world fusion',price:3,rating:4.5,emoji:'🌊'},
    {name:"Giuseppe's Cucina",category:'italian',price:3,rating:4.4,emoji:'🍕'},
    {name:'Firestone Grill',category:'american',price:1,rating:4.3,emoji:'🥩'},
    {name:'Luna Red',category:'tapas',price:2,rating:4.2,emoji:'🌮'},
    {name:"Nate's on Marsh",category:'upscale',price:4,rating:4.7,emoji:'⭐'},
    {name:'Bear & The Wren',category:'pizza',price:2,rating:4.5,emoji:'🍕'},
  ];
  return items.map(function(v) {
    return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
      '<span class="mh-venue-emoji">' + v.emoji + '</span>' +
      '<div class="mh-venue-info">' +
        '<div class="mh-venue-name">' + v.name + '</div>' +
        '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + '$'.repeat(v.price) + ' · ' + v.rating + '⭐</div>' +
      '</div>' +
      '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
    '</div>';
  }).join('');
}

async function loadHotels() {
  var list = document.getElementById('mh-hotel-list');
  if (!list) return;
  try {
    var sb = window.supabaseClient;
    if (!sb) { list.innerHTML = renderFallbackHotels(); return; }
    var result = await sb.from('venues')
      .select('name,category,price_range,rating,description,tags')
      .eq('type','hotel')
      .order('rating', { ascending: false })
      .limit(5);
    if (result.error || !result.data || !result.data.length) {
      list.innerHTML = renderFallbackHotels(); return;
    }
    list.innerHTML = result.data.map(function(v) {
      var price = '$'.repeat(v.price_range || 3);
      var stars = v.rating ? v.rating.toFixed(1) + '⭐' : '';
      var emoji = getHotelEmoji(v.category);
      return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
        '<span class="mh-venue-emoji">' + emoji + '</span>' +
        '<div class="mh-venue-info">' +
          '<div class="mh-venue-name">' + v.name + '</div>' +
          '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + price + (stars ? ' · ' + stars : '') + '</div>' +
        '</div>' +
        '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
      '</div>';
    }).join('');
  } catch(e) {
    list.innerHTML = renderFallbackHotels();
  }
}

function renderFallbackHotels() {
  var items = [
    {name:'Hotel SLO',category:'luxury',price:4,rating:4.7,emoji:'✨'},
    {name:'Hotel Cerro',category:'boutique',price:4,rating:4.6,emoji:'🌿'},
    {name:'Granada Hotel',category:'historic',price:3,rating:4.5,emoji:'🏛'},
    {name:'SLO Creek Lodge',category:'boutique',price:3,rating:4.6,emoji:'🌲'},
    {name:'The Wayfarer',category:'boutique',price:3,rating:4.3,emoji:'🏡'},
  ];
  return items.map(function(v) {
    return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
      '<span class="mh-venue-emoji">' + v.emoji + '</span>' +
      '<div class="mh-venue-info">' +
        '<div class="mh-venue-name">' + v.name + '</div>' +
        '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + '$'.repeat(v.price) + ' · ' + v.rating + '⭐</div>' +
      '</div>' +
      '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
    '</div>';
  }).join('');
}

function getCategoryEmoji(cat) {
  var map = {
    'world fusion':'🌊','italian':'🍕','american':'🥩','tapas':'🌮',
    'upscale':'⭐','pizza':'🍕','bbq':'🔥','japanese':'🍱','sushi':'🍣',
    'mexican':'🌮','cafe':'☕','greek':'🥙','deli':'🥪','peruvian':'🌶',
    'steakhouse':'🥩','french':'🥐','seafood':'🐟'
  };
  return map[cat] || '🍽';
}

function getHotelEmoji(cat) {
  var map = {
    'luxury':'✨','boutique':'🌿','historic':'🏛','inn':'🏡',
    'bed-and-breakfast':'🌅','chain':'🏨','iconic':'🌟'
  };
  return map[cat] || '🏨';
}

function cap(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Tour detail sheet
var TOUR_DATA = {
  historic: { name:'Historic Downtown SLO', emoji:'🏛', time:'90 min', diff:'Easy', cost:'Free', desc:'Walk 2,500 years of history from the 1772 Mission to Bubblegum Alley. Passes Chinatown, Fremont Theater, and Mission Plaza.', tips:['Best in morning before crowds','Free parking on side streets','Thursday adds Farmers Market'], tags:['Family','Dogs OK','Free','Walking'] },
  bishop:   { name:'Bishop Peak Summit', emoji:'🥾', time:'2.5-3 hrs', diff:'Hard', cost:'Free', desc:'The tallest of the Nine Sisters volcanic morros. 3.5 miles round trip, 950ft elevation gain. 360° views from the top.', tips:['Start early — gets hot','Bring 2L water minimum','Dogs must be leashed'], tags:['Dogs OK','Views','Workout','Free'] },
  food:     { name:'SLO Food Tour', emoji:'🍕', time:'3 hrs', diff:'Easy', cost:'$40-100', desc:'Hit the iconic spots — Firestone tri-tip, Novo creekside, High Street Deli half-off after 4:20pm. SLO has a serious food scene.', tips:['Thursday nights add Farmers Market stops','High Street Deli half off after 4:20pm','Book Novo in advance'], tags:['Family','Popular','Downtown'] },
  farmers:  { name:'Farmers Market', emoji:'🌽', time:'2 hrs', diff:'Easy', cost:'Free', desc:"Every Thursday 6-9pm Higuera Street becomes one of California's most beloved weekly street fairs. Fresh produce, live music, local food.", tips:['Thursday only, year-round','Gets crowded 7-8pm','Bring cash for vendors'], tags:['Weekly','Family','Thursday'] },
  bike:     { name:'Downtown Bike Loop', emoji:'🚴', time:'90 min', diff:'Easy', cost:'$15-30', desc:'Rent a bike and cruise the Bob Jones Trail, downtown Higuera, and along the creek. Mostly flat, beginner friendly.', tips:['Rent from SLO Bike Hub','Bob Jones Trail is paved','Creek path connects downtown to Avila'], tags:['Rental','Trail','Family'] },
  wine:     { name:'Edna Valley Wine Trail', emoji:'🍷', time:'4 hrs', diff:'Easy', cost:'$30-100', desc:"World-class Chardonnay and Pinot 10 minutes from downtown. Edna Valley is one of California's coolest growing regions.", tips:['Book a driver or use Uber','Tolosa and Laetitia are standouts','Most tasting rooms open 11am-5pm'], tags:['21+','Romantic','Drive'] },
  beach:    { name:'Central Coast Beach Day', emoji:'🌊', time:'All day', diff:'Easy', cost:'$0-50', desc:'Avila for calm water and families, Pismo for the classic boardwalk vibe, Shell Beach for dramatic cliffs and surf.', tips:['Avila has the calmest water','Pismo Pier area has parking','Bring layers — coast can be foggy'], tags:['Family','Dogs OK','Summer'] },
  morro:    { name:'Morro Bay Escape', emoji:'🦦', time:'Half day', diff:'Easy', cost:'$20-80', desc:'Sea otters, Morro Rock, fresh chowder on the Embarcadero. 30 minutes north. One of the most scenic towns on the Central Coast.', tips:['Kayak around Morro Rock','Sub-Sub is a local sandwich legend','Watch for otters near the estuary'], tags:['Wildlife','Seafood','Drive'] },
  brewery:  { name:'SLO Brewery Hop', emoji:'🍺', time:'3 hrs', diff:'Easy', cost:'$20-60', desc:"SLO Brew, Libertine Brewing, Barrelhouse — SLO has a thriving craft beer scene. All walkable from downtown.", tips:['Start at Libertine for sours','SLO Brew has live music','Barrelhouse has the best patio'], tags:['21+','Local','Walking'] },
};

function tourDetail(el) {
  var id = el ? el.dataset.tour : null;
  var tour = TOUR_DATA[id];
  if (!tour) return;

  var existing = document.getElementById('mh-tour-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-tour-detail';
  sheet.style.cssText = 'position:absolute;inset:0;z-index:23;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
  sheet.innerHTML = '<div id="mh-td-inner" style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="closeTourDetail()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + tour.emoji + '</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + tour.name + '</div>' +
    '<div style="display:flex;gap:12px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.5)">' +
      '<span>⏱ ' + tour.time + '</span>' +
      '<span>💪 ' + tour.diff + '</span>' +
      '<span>💰 ' + tour.cost + '</span>' +
    '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:16px">' + tour.desc + '</div>' +
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">INSIDER TIPS</div>' +
    tour.tips.map(function(t) {
      return '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:rgba(255,255,255,0.6)">💡 ' + t + '</div>';
    }).join('') +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">' +
      tour.tags.map(function(t) {
        return '<span style="padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.06);font-size:11px;font-weight:700;color:rgba(255,255,255,0.5)">' + t + '</span>';
      }).join('') +
    '</div>' +
    '<button onclick="closeTourDetail()" style="width:100%;margin-top:16px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
  '</div>';

  document.getElementById('menu-home').appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-td-inner').style.transform = 'translateY(0)';
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) closeTourDetail(); });
}
window.menuHomeTourDetail = tourDetail;
window.menuHomeCloseViewAll  = function() { var s = document.getElementById('mh-viewall-sheet'); if(s) s.remove(); };
window.menuHomeCloseBeachSheet = function() { var s = document.getElementById('mh-beach-sheet'); if(s) s.remove(); };
window.menuHomeClosePlanIt   = function() { var s = document.getElementById('mh-planit-sheet'); if(s) s.remove(); };



function closeTourDetail() {
  var sheet = document.getElementById('mh-tour-detail');
  if (sheet) { sheet.style.opacity = '0'; setTimeout(function() { sheet.remove(); }, 300); }
}
window.menuHomeCloseTourDetail = closeTourDetail;

// Venue detail sheet
function venueDetail(el) {
  var name = el ? el.dataset.name : null;
  if (!name) return;
  var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(name + ' San Luis Obispo');
  window.open(searchUrl, '_blank');
}
window.menuHomeTravelVenueDetail = venueDetail;

// View all sheet
function travelViewAll(type) {
  var sheet = document.createElement('div');
  sheet.id = 'mh-viewall-sheet';
  sheet.style.cssText = 'position:absolute;inset:0;z-index:23;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
  var title = type === 'food' ? '🍽 All Restaurants' : '🏨 All Hotels';
  sheet.innerHTML = '<div style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)" id="mh-va-inner">' +
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="menuHomeCloseViewAll()"></div>' +
    '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">' + title + '</div>' +
    '<div id="mh-va-list"><div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3)">Loading...</div></div>' +
  '</div>';
  document.getElementById('menu-home').appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-va-inner').style.transform = 'translateY(0)';
    loadAllVenues(type);
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.menuHomeTravelViewAll = function(type) {
  if (type === 'food') { openRestaurantHub(); return; }
  travelViewAll(type);
};
var _travelViewAll = travelViewAll;

async function loadAllVenues(type) {
  var list = document.getElementById('mh-va-list');
  if (!list) return;
  try {
    var sb = window.supabaseClient;
    if (!sb) { list.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Connect to load venues</div>'; return; }
    var vtype = type === 'food' ? 'restaurant' : 'hotel';
    var result = await sb.from('venues')
      .select('name,category,price_range,rating,address,description')
      .eq('type', vtype)
      .order('rating', { ascending: false });
    if (result.error || !result.data) { list.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Error loading venues</div>'; return; }
    var getEmoji = type === 'food' ? getCategoryEmoji : getHotelEmoji;
    list.innerHTML = result.data.map(function(v) {
      var price = '$'.repeat(v.price_range || 2);
      var stars = v.rating ? v.rating.toFixed(1) + '⭐' : '';
      return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
        '<span class="mh-venue-emoji">' + getEmoji(v.category) + '</span>' +
        '<div class="mh-venue-info">' +
          '<div class="mh-venue-name">' + v.name + '</div>' +
          '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + price + (stars ? ' · ' + stars : '') + '</div>' +
        '</div>' +
        '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
      '</div>';
    }).join('');
  } catch(e) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Error: ' + e.message + '</div>';
  }
}

// Beach detail
var BEACH_DATA = {
  avila:   { name:'Avila Beach', emoji:'🏖', drive:'10 min', vibe:'Calm, protected, family-friendly', surf:'1-2ft', notes:'Pier fishing, Avila Village shops nearby. Warmest water on the coast.', maps:'Avila+Beach+CA' },
  pismo:   { name:'Pismo Beach', emoji:'🌊', drive:'15 min', vibe:'Classic boardwalk, active beach', surf:'2-3ft', notes:'Pismo Pier, beach bonfires with permit, clam chowder at Old West Cinnamon Rolls.', maps:'Pismo+Beach+CA' },
  shell:   { name:'Shell Beach', emoji:'🪨', drive:'12 min', vibe:'Dramatic cliffs, local favorite', surf:'2-4ft', notes:'Rocky coves good for snorkeling. Pelican Point has great cliff walks.', maps:'Shell+Beach+CA' },
  morro:   { name:'Morro Bay Beach', emoji:'🦦', drive:'30 min', vibe:'Wild, scenic, wildlife-rich', surf:'3-4ft', notes:'Sea otters in the estuary. Morro Rock is a 23 million year old volcanic plug.', maps:'Morro+Bay+Beach+CA' },
  montano: { name:'Montana de Oro', emoji:'🌿', drive:'45 min', vibe:'Wild coastal park, rugged', surf:'4-6ft', notes:'Hazard Canyon has tide pools. Bluff Trail is 3 miles of dramatic clifftop walking.', maps:'Montana+de+Oro+State+Park' },
};

function travelBeach(id) {
  var b = BEACH_DATA[id];
  if (!b) return;
  var sheet = document.createElement('div');
  sheet.id = 'mh-beach-sheet';
  sheet.style.cssText = 'position:absolute;inset:0;z-index:23;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
  sheet.innerHTML = '<div style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)" id="mh-beach-inner">' +
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="menuHomeCloseBeachSheet()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + b.emoji + '</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + b.name + '</div>' +
    '<div style="display:flex;gap:12px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.5)">' +
      '<span>🚗 ' + b.drive + '</span>' +
      '<span>🌊 ' + b.surf + ' surf</span>' +
    '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:12px">' + b.vibe + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:16px">' + b.notes + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
      '<a href="https://www.google.com/maps/search/' + b.maps + '" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Get Directions ↗</a>' +
      '<a href="https://www.surfline.com" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Live Surf Report ↗</a>' +
    '</div>' +
    '<button onclick="menuHomeCloseBeachSheet()" style="width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
  '</div>';
  document.getElementById('menu-home').appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-beach-inner').style.transform = 'translateY(0)';
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.menuHomeTravelBeach = travelBeach;

