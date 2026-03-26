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
  historic: {
    name:'Historic Downtown SLO', emoji:'🏛', time:'90 min', diff:'Easy', cost:'Free',
    desc:'Walk 2,500 years of history from the 1772 Mission to Bubblegum Alley. Passes Chinatown, Fremont Theater, and Mission Plaza.',
    tips:['Best in morning before crowds','Free parking on side streets','Thursday nights add Farmers Market'],
    tags:['Family','Dogs OK','Free','Walking'],
    stops:[
      { name:'Mission San Luis Obispo de Tolosa', type:'landmark', mins:20, cost:'Free', tip:'Walk the gardens and museum. Founded 1772 by Father Serra.' },
      { name:'Mission Plaza', type:'landmark', mins:10, cost:'Free', tip:'Community heart of SLO. Events and concerts held here.' },
      { name:'Bubblegum Alley', type:'landmark', mins:15, cost:'Free', tip:'70ft of chewed gum since the 1950s. Grab a gumball from Rocket Fizz first.' },
      { name:'Fremont Theater', type:'landmark', mins:10, cost:'Free', tip:'Art deco landmark built 1942. Best photographed at night for the neon sign.' },
      { name:'Ah Louis Store', type:'landmark', mins:10, cost:'Free', tip:'SLO oldest brick building (1874) and tiny Chinatown history.' },
      { name:'Higuera Street Stroll', type:'activity', mins:20, cost:'Free', tip:'Browse boutiques, coffee shops, and soak up the downtown energy.' },
    ]
  },
  bishop: {
    name:'Bishop Peak Summit', emoji:'🥾', time:'2.5-3 hrs', diff:'Hard', cost:'Free',
    desc:'The tallest of the Nine Sisters volcanic morros at 1,559ft. 3.5 miles round trip with 950ft elevation gain. 360° views of SLO, Morro Bay and the Pacific.',
    tips:['Start by 8am in summer — gets very hot','Bring at least 2L water','Dogs must be leashed','Patricia Drive trailhead has the most parking'],
    tags:['Dogs OK','Views','Workout','Free'],
    stops:[
      { name:'Patricia Drive Trailhead', type:'activity', mins:5, cost:'Free', tip:'Free parking. Get here early on weekends — fills by 9am.' },
      { name:'Ferrini Open Space', type:'activity', mins:30, cost:'Free', tip:'Wide trail through oak woodland. Steady climb begins here.' },
      { name:'Bishop Peak Summit (1,559ft)', type:'landmark', mins:90, cost:'Free', tip:'360° panoramic views. Morro Bay, Pismo Beach, SLO valley all visible. Bring a snack.' },
      { name:'Descent + Cool Down', type:'activity', mins:45, cost:'Free', tip:'Take the alternate trail down for different views.' },
      { name:'SLO Brew or High Street Deli', type:'restaurant', mins:45, cost:'$15-25', tip:'You earned it. High Street Deli half-off after 4:20pm.' },
    ]
  },
  food: {
    name:'SLO Food Tour', emoji:'🍕', time:'3-4 hrs', diff:'Easy', cost:'$40-80',
    desc:'Hit the iconic spots that define SLO dining. Firestone tri-tip, Novo creekside patio, McConnells ice cream, and the Thursday night Farmers Market food stalls.',
    tips:['Thursday nights add Farmers Market stops','High Street Deli half off after 4:20pm','Book Novo in advance for weekend dinner'],
    tags:['Family','Popular','Downtown','Food'],
    stops:[
      { name:'Scout Coffee Co.', type:'cafe', mins:20, cost:'$5-10', tip:'Start with coffee. Best espresso in downtown SLO. Great patio.' },
      { name:'Firestone Grill', type:'restaurant', mins:40, cost:'$12-18', tip:'The Cal Poly classic. Tri-tip sandwich and salad. Line moves fast.' },
      { name:'Bubblegum Alley', type:'landmark', mins:10, cost:'Free', tip:'Quick photo stop between eats. Grab a gumball at Rocket Fizz.' },
      { name:'McConnells Ice Cream', type:'restaurant', mins:15, cost:'$6-10', tip:'Santa Barbara-based artisan ice cream. Eureka Lemon & Marionberry is iconic.' },
      { name:'Novo Restaurant & Lounge', type:'restaurant', mins:75, cost:'$30-55', tip:'Creekside patio under the oaks. California fusion. Book ahead on weekends.' },
      { name:'Farmers Market (Thursday)', type:'activity', mins:45, cost:'$10-20', tip:'Thursday only, 6-9pm. Five blocks of Higuera. BBQ, kettle corn, live music.' },
    ]
  },
  wine: {
    name:'Edna Valley Wine Trail', emoji:'🍷', time:'4-5 hrs', diff:'Easy', cost:'$40-100',
    desc:'World-class Chardonnay and Pinot Noir just 10 minutes from downtown. Edna Valley is one of the coolest growing regions in California — ocean breezes keep temps mild.',
    tips:['Book a driver or use Uber — do not drink and drive','Most tasting rooms open 11am-5pm','Tolosa and Laetitia are the standouts','Call ahead to book private tastings'],
    tags:['21+','Romantic','Drive','Wine'],
    stops:[
      { name:'Tolosa Winery', type:'winery', mins:60, cost:'$20-35', tip:'Stunning modern facility. Pinot and Chardonnay focused. Rotating food pairings.' },
      { name:'Laetitia Vineyard', type:'winery', mins:60, cost:'$15-25', tip:'French Champagne heritage. Sparkling wines are exceptional. Beautiful grounds.' },
      { name:'Saucelito Canyon', type:'winery', mins:45, cost:'$15-20', tip:'Family-run, Zinfandel specialists. More intimate than the big producers.' },
      { name:'Wolff Vineyards', type:'winery', mins:45, cost:'$15', tip:'Relaxed picnic-friendly atmosphere. Great views of the valley.' },
      { name:'Lunch at Edna Valley', type:'restaurant', mins:60, cost:'$20-35', tip:'Most wineries allow picnics. Or head to Avila Beach for lunch with an ocean view.' },
    ]
  },
  beach: {
    name:'Central Coast Beach Day', emoji:'🌊', time:'All day', diff:'Easy', cost:'$0-50',
    desc:'Three distinct beach personalities within 20 minutes: Avila for calm water and families, Pismo for the classic boardwalk, Shell Beach for dramatic cliffs and surf.',
    tips:['Avila has the calmest water for swimming','Pismo Pier area has the most parking','Bring layers — the coast runs 10-15°F cooler than SLO','Bob Jones Trail connects SLO to Avila by bike'],
    tags:['Family','Dogs OK','Summer','Swimming'],
    stops:[
      { name:'Avila Beach', type:'beach', mins:120, cost:'Free', tip:'Calm protected cove. Volleyball, kayak rentals, warm water. Most family-friendly.' },
      { name:'Avila Beach Pier & Shops', type:'activity', mins:30, cost:'Free', tip:'Small shops, Custom House restaurant. Try the fish tacos.' },
      { name:'Pismo Beach Pier', type:'landmark', mins:30, cost:'Free', tip:'Classic California boardwalk. Clam chowder is the move. ' },
      { name:'Shell Beach', type:'beach', mins:60, cost:'Free', tip:'More dramatic, less crowded. Tide pools at low tide. Surfers and scenery.' },
      { name:'Splash Cafe', type:'restaurant', mins:30, cost:'$10-20', tip:'Famous clam chowder bread bowl in Pismo. Get there before the line.' },
    ]
  },
  morro: {
    name:'Morro Bay Escape', emoji:'🦦', time:'Half day', diff:'Easy', cost:'$20-80',
    desc:'Sea otters, Morro Rock, fresh chowder on the Embarcadero. 30 minutes north on the 101. One of the most scenic small towns on the entire California coast.',
    tips:['Morning is best for otter spotting near the estuary','Sub-Sub sandwiches is a local legend','Kayak around Morro Rock for the best views','Watch for otters floating in the kelp'],
    tags:['Wildlife','Seafood','Drive','Family'],
    stops:[
      { name:'Morro Rock', type:'landmark', mins:30, cost:'Free', tip:'Drive to the base. 576ft volcanic plug. Peregrine falcons nest here. No climbing allowed.' },
      { name:'Morro Bay Embarcadero', type:'activity', mins:45, cost:'Free', tip:'Waterfront boardwalk with shops and restaurants. Watch sea otters from the dock.' },
      { name:'Central Coast Kayaks', type:'activity', mins:90, cost:'$35-55', tip:'Kayak tour around Morro Rock. Wildlife sightings almost guaranteed — otters, dolphins, herons.' },
      { name:'Sub-Sub Sandwiches', type:'restaurant', mins:30, cost:'$10-15', tip:'Local institution. Get the sandwich, sit outside, watch the boats.' },
      { name:'Morro Bay State Park', type:'activity', mins:45, cost:'Free', tip:'Birdwatching paradise. Great blue herons, pelicans, shorebirds. Free to walk.' },
    ]
  },
  brewery: {
    name:'SLO Brewery Hop', emoji:'🍺', time:'3-4 hrs', diff:'Easy', cost:'$25-60',
    desc:'SLOs craft beer scene is genuinely world-class. Libertine Brewing for wild ales, BarrelHouse for the outdoor patio, SLO Brew for live music. All walkable from downtown.',
    tips:['Start at Libertine for the most unique beers','SLO Brew has live music on weekends','Barrelhouse closes earlier — go mid-afternoon','Use Uber between spots if you plan to drink seriously'],
    tags:['21+','Local','Walking','Craft Beer'],
    stops:[
      { name:'Libertine Brewing Co.', type:'bar', mins:60, cost:'$15-25', tip:'Wild ales, sours, and funky experimental beers. Most adventurous of the three. Try whatever is seasonal.' },
      { name:'BarrelHouse Brewing', type:'bar', mins:60, cost:'$15-25', tip:'Best outdoor beer garden. Live music most weekends. Food trucks on site. Dog friendly.' },
      { name:'SLO Brew Rock', type:'bar', mins:60, cost:'$15-30', tip:'Check their calendar for shows. Great selection including their own brewed flagship beers.' },
      { name:'Bang the Drum Brewery', type:'bar', mins:45, cost:'$12-20', tip:'Tucked in an oak grove on the south side. Dog friendly, chill vibe, great IPAs.' },
    ]
  },
  bike: {
    name:'Bob Jones City-to-Sea Trail', emoji:'🚴', time:'2-3 hrs', diff:'Easy', cost:'$15-30',
    desc:'8 miles of flat paved trail from SLO through Avila Valley farmland and oak forests all the way to Avila Beach. One of the best bike rides on the Central Coast.',
    tips:['Rent from SLO Bike Hub downtown','Bring a lock to stop at Avila Beach','One way is 8 miles — Uber back if needed','Avila Hot Springs at the trailhead for a post-ride soak'],
    tags:['Family','Trail','Dogs OK','Active'],
    stops:[
      { name:'SLO Bike Hub (Rental)', type:'activity', mins:15, cost:'$15-30', tip:'Rent bikes downtown. Reserve ahead on weekends.' },
      { name:'Bob Jones Trailhead', type:'activity', mins:5, cost:'Free', tip:'Access near Avila Hot Springs. Paved flat trail begins here.' },
      { name:'San Luis Creek Section', type:'activity', mins:30, cost:'Free', tip:'Creek views, birding opportunities, shaded oaks. Most scenic stretch.' },
      { name:'Avila Beach Arrival', type:'beach', mins:60, cost:'Free', tip:'Lock your bike and hit the beach. Volleyball, swimming, shops on the pier.' },
      { name:'Custom House Restaurant', type:'restaurant', mins:45, cost:'$15-30', tip:'Lunch with ocean views before biking back or Ubering.' },
    ]
  },
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

  // Build stops HTML
  var stopsHtml = '';
  if (tour.stops && tour.stops.length) {
    stopsHtml =
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">FULL TRIP PLAN</div>' +
      '<div style="margin-bottom:16px">' +
      tour.stops.map(function(stop, i) {
        var typeColor = {
          landmark:'#ffd700', restaurant:'#f97316', cafe:'#a78bfa',
          activity:'#22c55e', beach:'#06b6d4', winery:'#9b2335',
          bar:'#ff2d78', gym:'#22c55e'
        }[stop.type] || '#ffffff';
        return '<div style="display:flex;gap:10px;margin-bottom:10px">' +
          '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">' +
            '<div style="width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:rgba(255,255,255,0.5)">' + (i+1) + '</div>' +
            (i < tour.stops.length-1 ? '<div style="width:1px;flex:1;background:rgba(255,255,255,0.08);margin:2px 0"></div>' : '') +
          '</div>' +
          '<div style="flex:1;padding-bottom:8px">' +
            '<div style="font-size:13px;font-weight:800;margin-bottom:2px">' + stop.name + '</div>' +
            '<div style="display:flex;gap:8px;margin-bottom:4px">' +
              '<span style="font-size:10px;font-weight:700;color:' + typeColor + '">' + stop.type.toUpperCase() + '</span>' +
              '<span style="font-size:10px;color:rgba(255,255,255,0.35)">⏱ ' + stop.mins + ' min</span>' +
              '<span style="font-size:10px;color:rgba(255,255,255,0.35)">💰 ' + stop.cost + '</span>' +
            '</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.5);line-height:1.5">' + stop.tip + '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div>';
  }

  var totalMins = tour.stops ? tour.stops.reduce(function(a, s) { return a + (s.mins || 0); }, 0) : 0;
  var totalHrs = totalMins >= 60 ? Math.floor(totalMins/60) + 'h ' + (totalMins%60 ? totalMins%60+'m' : '') : totalMins + 'min';

  var inner = document.createElement('div');
  inner.id = 'mh-td-inner';
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.2);padding:12px 20px 48px;max-height:90vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="closeTourDetail()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + tour.emoji + '</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:10px">' + tour.name + '</div>' +

    // Stats row
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">' +
      '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
        '<div style="font-size:13px;font-weight:800">' + tour.time + '</div>' +
        '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">DURATION</div>' +
      '</div>' +
      '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
        '<div style="font-size:13px;font-weight:800">' + tour.diff + '</div>' +
        '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">DIFFICULTY</div>' +
      '</div>' +
      '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
        '<div style="font-size:13px;font-weight:800">' + tour.cost + '</div>' +
        '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">COST</div>' +
      '</div>' +
    '</div>' +

    // Description
    '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin-bottom:16px">' + tour.desc + '</div>' +

    // Full stop plan
    stopsHtml +

    // Insider tips
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">INSIDER TIPS</div>' +
    '<div style="margin-bottom:16px">' +
      tour.tips.map(function(t) {
        return '<div style="padding:8px 10px;border-radius:10px;background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.1);margin-bottom:6px;font-size:12px;color:rgba(255,255,255,0.6)">💡 ' + t + '</div>';
      }).join('') +
    '</div>' +

    // Tags
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px">' +
      tour.tags.map(function(t) {
        return '<span style="padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.06);font-size:11px;font-weight:700;color:rgba(255,255,255,0.5)">' + t + '</span>';
      }).join('') +
    '</div>' +

    // Action buttons — IDs wired after render
    '<div style="display:flex;gap:8px;margin-bottom:8px">' +
      '<button id="tour-itin-btn" style="flex:1;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#000;font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">🗓 Add to Itinerary</button>' +
      '<button onclick="closeTourDetail()" style="padding:13px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
    '</div>' +
    (tour.stops && tour.stops.length ?
      '<button id="tour-all-btn" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,215,0,0.2);background:rgba(255,215,0,0.05);color:rgba(255,215,0,0.7);font-size:12px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">+ Add all ' + tour.stops.length + ' stops to itinerary</button>' : '');

  sheet.appendChild(inner);
  var parent = document.getElementById('menu-home') || document.body;
  parent.appendChild(sheet);

  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
    // Wire button events now that DOM is ready
    var itinBtn = document.getElementById('tour-itin-btn');
    if (itinBtn) itinBtn.onclick = function() { tourAddToItinerary(id); };
    var allBtn = document.getElementById('tour-all-btn');
    if (allBtn) allBtn.onclick = function() { tourAddAllStops(id); };
  }, 30);

  sheet.addEventListener('click', function(e) { if (e.target === sheet) closeTourDetail(); });
}
window.menuHomeTourDetail = tourDetail;

function closeTourDetail() {
  var s = document.getElementById('mh-tour-detail');
  if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); }, 300); }
}
window.closeTourDetail = closeTourDetail;

// Add single tour as one itinerary stop
function tourAddToItinerary(tourId) {
  var tour = TOUR_DATA[tourId];
  if (!tour) return;

  // Build a single itinerary from the full tour
  var totalMins = tour.stops ? tour.stops.reduce(function(a,s){return a+(s.mins||60);},0) : 180;

  if (typeof itinAddBusinessStop === 'function') {
    itinAddBusinessStop(tour.name, 'activity', totalMins, tour.cost, tour.tips[0] || '');
    closeTourDetail();
    if (typeof showToast === 'function') showToast('🗓 ' + tour.name + ' added!');
  } else {
    // Fallback: build itinerary object directly and open it
    var itin = {
      id: Math.random().toString(36).slice(2,10),
      share_id: Math.random().toString(36).slice(2,10),
      name: tour.name,
      mode: 'planned',
      start_time: '9:00 AM',
      using_rideshare: false,
      group_size: 2,
      total_cost: tour.cost || '',
      created: Date.now(),
      stops: (tour.stops || []).map(function(s) {
        return { name: s.name, type: s.type || 'activity', description: s.tip || '', tip: s.tip || '', cost: s.cost || '', estimated_mins: s.mins || 60, actual_mins: null, status: 'pending', coords: null, address: '' };
      })
    };
    // Save to localStorage
    try {
      var saved = JSON.parse(localStorage.getItem('dtslo_itineraries') || '[]');
      saved.unshift(itin);
      localStorage.setItem('dtslo_itineraries', JSON.stringify(saved));
    } catch(e) {}
    closeTourDetail();
    if (typeof showToast === 'function') showToast('🗓 ' + tour.name + ' saved to itinerary!');
    // Open itinerary builder if available
    setTimeout(function() {
      if (typeof openItineraryBuilder === 'function') openItineraryBuilder(itin, false);
    }, 400);
  }
}
window.tourAddToItinerary = tourAddToItinerary;

// Add each stop individually to itinerary
function tourAddAllStops(tourId) {
  var tour = TOUR_DATA[tourId];
  if (!tour || !tour.stops) return;

  if (typeof itinAddBusinessStop === 'function') {
    tour.stops.forEach(function(stop) {
      itinAddBusinessStop(stop.name, stop.type || 'activity', stop.mins || 60, stop.cost || '', stop.tip || '');
    });
    closeTourDetail();
    if (typeof showToast === 'function') showToast('✅ ' + tour.stops.length + ' stops added!');
  } else {
    // Fallback: build itinerary directly
    var itin = {
      id: Math.random().toString(36).slice(2,10),
      share_id: Math.random().toString(36).slice(2,10),
      name: tour.name,
      mode: 'planned',
      start_time: '9:00 AM',
      using_rideshare: false,
      group_size: 2,
      total_cost: tour.cost || '',
      created: Date.now(),
      stops: tour.stops.map(function(s) {
        return { name: s.name, type: s.type || 'activity', description: s.tip || '', tip: s.tip || '', cost: s.cost || '', estimated_mins: s.mins || 60, actual_mins: null, status: 'pending', coords: null, address: '' };
      })
    };
    try {
      var saved = JSON.parse(localStorage.getItem('dtslo_itineraries') || '[]');
      saved.unshift(itin);
      localStorage.setItem('dtslo_itineraries', JSON.stringify(saved));
    } catch(e) {}
    closeTourDetail();
    if (typeof showToast === 'function') showToast('✅ ' + tour.stops.length + ' stops saved!');
    setTimeout(function() {
      if (typeof openItineraryBuilder === 'function') openItineraryBuilder(itin, false);
    }, 400);
  }
}
window.tourAddAllStops = tourAddAllStops;

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

