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
    name:'Historic Downtown SLO', emoji:'🏛', time:'2 hrs', diff:'Easy', cost:'Free',
    desc:'Walk 2,500 years of history through the heart of San Luis Obispo. From the 1772 Mission to Victorian homes on Lizzie Street, SLO\'s past is everywhere you look.',
    tips:['Best in morning before crowds','Free parking on Osos or Pacific St','Combine with Thursday Farmers Market for the full SLO experience'],
    tags:['Family','Dogs OK','Free','Walking','History'],
    stops:[
      { name:'Mission San Luis Obispo de Tolosa', type:'landmark', mins:20, cost:'Free', tip:'Founded 1772 by Father Serra — the 5th California mission. Walk the gardens and peek into the small museum.' },
      { name:'Mission Plaza', type:'landmark', mins:10, cost:'Free', tip:'Community heart of SLO. Creekside setting with concerts and events throughout the year.' },
      { name:'History Center of SLO County', type:'museum', mins:30, cost:'Free', tip:'Fascinating local history exhibits in a beautiful Carnegie library building. Often overlooked — worth 30 minutes.' },
      { name:'SLO County Courthouse', type:'landmark', mins:10, cost:'Free', tip:'Stunning Mission Revival architecture from 1941. Walk the grounds and admire the tiled fountain.' },
      { name:'Ah Louis Store', type:'landmark', mins:10, cost:'Free', tip:'SLO\'s oldest brick building (1874). Center of a once-thriving Chinese community. Historical plaque out front.' },
      { name:'Lizzie Street Historic District', type:'landmark', mins:15, cost:'Free', tip:'Two blocks of beautifully preserved Victorian homes from the 1880s-1890s. Best photographed in afternoon light.' },
      { name:'Bubblegum Alley', type:'landmark', mins:10, cost:'Free', tip:'70 feet of chewed gum since the 1950s. Grab a gumball from Rocket Fizz around the corner first.' },
      { name:'Fremont Theater', type:'landmark', mins:10, cost:'Free', tip:'Art deco masterpiece built 1942. Best photographed at night when the neon sign is lit.' },
    ]
  },
  bishop: {
    name:'Bishop Peak Summit', emoji:'🥾', time:'2.5–3 hrs', diff:'Hard', cost:'Free',
    desc:'The tallest of the Nine Sisters volcanic morros at 1,559ft. 3.5 miles round trip with 950ft elevation gain. Unmatched 360° views of SLO, Morro Bay, and the Pacific.',
    tips:['Start by 8am in summer — gets brutally hot','Bring at least 2L of water per person','Dogs must be leashed the entire trail','Patricia Drive trailhead has the most parking — fills by 9am on weekends'],
    tags:['Dogs OK','Views','Workout','Free','Hiking'],
    stops:[
      { name:'Patricia Drive Trailhead', type:'activity', mins:5, cost:'Free', tip:'Free parking. Arrive early on weekends — it fills fast. Sunscreen on before you start.' },
      { name:'Ferrini Open Space', type:'activity', mins:30, cost:'Free', tip:'Wide trail through oak woodland. Steady climb begins here. Great wildflower displays in spring.' },
      { name:'Bishop Peak Summit (1,559ft)', type:'landmark', mins:90, cost:'Free', tip:'360° views: Morro Bay to the west, Pismo to the south, all of SLO below. Bring a snack and take it in.' },
      { name:'Descent + Cool Down', type:'activity', mins:40, cost:'Free', tip:'Take the alternate trail down for different views. Legs will be tired — take your time.' },
      { name:'High Street Deli', type:'restaurant', mins:45, cost:'$10-18', tip:'You earned it. Half-price sandwiches after 4:20pm. Cold drinks and outdoor seating.' },
    ]
  },
  food: {
    name:'SLO Food Tour', emoji:'🍕', time:'4–5 hrs', diff:'Easy', cost:'$40–90',
    desc:'A crawl through the restaurants and food spots that define SLO dining culture. From the legendary Firestone tri-tip to creekside dinner at Novo — this is the full SLO culinary experience.',
    tips:['Thursday nights add the Farmers Market to the route','Book Novo in advance for weekend dinner','High Street Deli half off after 4:20pm','Pace yourself — this is a marathon not a sprint'],
    tags:['Family','Popular','Downtown','Food'],
    stops:[
      { name:'Scout Coffee Co.', type:'cafe', mins:20, cost:'$5-10', tip:'Start with coffee. Best espresso in downtown SLO. Grab a table on Garden Street and people watch.' },
      { name:'Firestone Grill', type:'restaurant', mins:40, cost:'$12-18', tip:'The Cal Poly institution since 1981. Tri-tip sandwich with salsa and Santa Maria beans. Line moves fast.' },
      { name:'Old San Luis BBQ Co.', type:'restaurant', mins:15, cost:'$10-16', tip:'Smoked meats and Central Coast BBQ. Great for a quick sample mid-tour. Try the pulled pork.' },
      { name:'Bubblegum Alley', type:'landmark', mins:10, cost:'Free', tip:'Quick photo stop between eats. Grab a gumball at Rocket Fizz — it\'s part of the ritual.' },
      { name:'McConnells Ice Cream', type:'restaurant', mins:15, cost:'$6-10', tip:'Santa Barbara artisan ice cream. Eureka Lemon & Marionberry is the iconic SLO flavor. Do not skip this.' },
      { name:'Mistura', type:'restaurant', mins:60, cost:'$18-35', tip:'Peruvian-inspired cuisine on Higuera. Ceviche and lomo saltado are standouts. Great cocktails.' },
      { name:'Novo Restaurant & Lounge', type:'restaurant', mins:75, cost:'$30-55', tip:'Finish creekside under the oaks. California fusion with global influences. Book ahead on weekends.' },
    ]
  },
  edna_wine: {
    name:'Edna Valley Wine Trail', emoji:'🍷', time:'4–5 hrs', diff:'Easy', cost:'$50–120',
    desc:'World-class Chardonnay and Pinot Noir just 10 minutes from downtown SLO. Edna Valley is one of California\'s coolest growing regions — ocean breezes keep temps mild and wines elegant.',
    tips:['Book a driver or use Uber/Lyft — do not drink and drive','Most tasting rooms open 11am–5pm','Tolosa and Chamisal are the standouts','Call ahead for private tastings at Center of Effort'],
    tags:['21+','Romantic','Drive','Wine','Edna Valley'],
    stops:[
      { name:'Tolosa Winery', type:'winery', mins:60, cost:'$20-35', tip:'Stunning modern facility. Unoaked Chardonnay is a revelation. Rotating food pairings available.' },
      { name:'Chamisal Vineyards', type:'winery', mins:60, cost:'$20-30', tip:'First vineyard planted in Edna Valley (1973). Estate Chardonnay from 50-year-old vines is world class.' },
      { name:'Center of Effort', type:'winery', mins:45, cost:'$18-28', tip:'Sustainable farming, farm views, and serious Pinot Noir. One of the valley\'s most thoughtful producers.' },
      { name:'Wolff Vineyards', type:'winery', mins:45, cost:'$15-20', tip:'Hilltop setting with sweeping valley views and roaming peacocks. Dog friendly. Bring a picnic.' },
      { name:'Baileyana Winery', type:'winery', mins:45, cost:'$18-25', tip:'Classic Edna Valley estate. Ask about their True Myth label — same quality fruit at an approachable price.' },
    ]
  },
  beach: {
    name:'Central Coast Beach Day', emoji:'🌊', time:'All day', diff:'Easy', cost:'$0–50',
    desc:'Three distinct beach personalities within 20 minutes of SLO. Avila for calm water and families, Pismo for the classic boardwalk, Shell Beach for dramatic cliffs and tide pools.',
    tips:['Avila has the calmest water for swimming','Pismo Pier area has the most parking','Bring layers — coast runs 10–15°F cooler than SLO','Bob Jones Trail connects SLO to Avila by bike — 8 miles one way'],
    tags:['Family','Dogs OK','Summer','Swimming','Free'],
    stops:[
      { name:'Bob Jones City to Sea Trail', type:'activity', mins:60, cost:'Free', tip:'Bike or walk the 8-mile paved trail from SLO through oak forest to the coast. Rent bikes at SLO Bike Hub.' },
      { name:'Avila Beach', type:'beach', mins:120, cost:'Free', tip:'Calm protected cove. Volleyball, kayak rentals, warmest water on the coast. Most family-friendly beach in SLO County.' },
      { name:'Avila Beach Pier & Shops', type:'activity', mins:30, cost:'Free', tip:'Small shops and ocean pier. Custom House restaurant has great fish tacos with ocean views.' },
      { name:'Pismo Beach Pier', type:'landmark', mins:30, cost:'Free', tip:'Classic California boardwalk energy. Clam chowder bread bowl from Splash Cafe is mandatory.' },
      { name:'Shell Beach', type:'beach', mins:60, cost:'Free', tip:'More dramatic and less crowded. Tide pools at low tide. Surfers and stunning cliff scenery.' },
    ]
  },
  morro: {
    name:'Morro Bay Escape', emoji:'🦦', time:'Half day', diff:'Easy', cost:'$20–80',
    desc:'Sea otters, Morro Rock, and the freshest chowder on the California coast. 30 minutes north on the 101. One of the most scenic small towns on the entire Pacific Coast.',
    tips:['Morning is best for otter spotting near the estuary','Sub-Sub Sandwiches is a local institution','Kayak around Morro Rock for the best water-level views','Watch for otters floating in kelp near the embarcadero'],
    tags:['Wildlife','Seafood','Drive','Family','Views'],
    stops:[
      { name:'Morro Rock', type:'landmark', mins:30, cost:'Free', tip:'576ft volcanic plug visible for miles. Drive to the base — peregrine falcons nest here. No climbing allowed.' },
      { name:'Morro Bay Embarcadero', type:'activity', mins:45, cost:'Free', tip:'Waterfront boardwalk with shops and restaurants. Watch sea otters from the dock — they\'re almost always there.' },
      { name:'Central Coast Kayaks', type:'activity', mins:90, cost:'$35-55', tip:'Kayak tour around Morro Rock. Wildlife sightings nearly guaranteed — otters, dolphins, great blue herons.' },
      { name:'Sub-Sub Sandwiches', type:'restaurant', mins:30, cost:'$10-15', tip:'Local institution since forever. Get the sandwich, sit outside, watch the boats. Cash preferred.' },
      { name:'Morro Bay State Park', type:'activity', mins:45, cost:'Free', tip:'World-class birdwatching. Great blue herons, pelicans, shorebirds. The heron rookery is unforgettable.' },
    ]
  },
  brewery: {
    name:'SLO Brewery Hop', emoji:'🍺', time:'3–4 hrs', diff:'Easy', cost:'$30–70',
    desc:'SLO\'s craft beer scene is genuinely world-class with eight distinct breweries across the city. Start downtown, head to midtown, and finish in south SLO with some of the most unique beers on the Central Coast.',
    tips:['Uber between spots if you plan to drink seriously','Libertine has the most adventurous and experimental beers','Ancient Owl is the newest addition — worth checking out','Central Coast Brewing has been anchoring SLO\'s beer scene for years'],
    tags:['21+','Local','Craft Beer','Walking'],
    stops:[
      { name:'Libertine Brewing Co.', type:'bar', mins:60, cost:'$15-25', tip:'Wild ales, sours, and experimental beers. Most adventurous in SLO. Try whatever is seasonal — they rotate constantly.' },
      { name:'Ancient Owl Beer Garden', type:'bar', mins:50, cost:'$14-22', tip:'Newest addition to downtown SLO. Great beer garden atmosphere. Food-friendly and dog welcoming.' },
      { name:'Humdinger Brewing', type:'bar', mins:45, cost:'$12-20', tip:'Neighborhood brewery with a tight lineup of well-crafted beers. Chill vibe, loyal local crowd.' },
      { name:'Central Coast Brewing', type:'bar', mins:50, cost:'$14-22', tip:'SLO beer institution on Monterey St. Solid core lineup plus rotating seasonals. Great patio.' },
      { name:'Liquid Gravity Brewing', type:'bar', mins:50, cost:'$14-22', tip:'South SLO anchor. Known for hop-forward IPAs and creative seasonals. Spacious taproom and outdoor area.' },
      { name:'Oak & Otter Brewing', type:'bar', mins:50, cost:'$14-22', tip:'Barrel-aged and mixed fermentation specialists on Tank Farm Rd. Worth the short drive from downtown.' },
    ]
  },
  bike: {
    name:'Bob Jones City-to-Sea Trail', emoji:'🚴', time:'2–3 hrs', diff:'Easy', cost:'$15–30',
    desc:'8 miles of flat paved trail from downtown SLO through Avila Valley\'s farmland and ancient oak forests all the way to Avila Beach. One of the best and most scenic bike rides on the entire Central Coast.',
    tips:['Rent from SLO Bike Hub downtown','Bring a lock to stop at Avila Beach','One way is 8 miles — Uber back if needed','Avila Hot Springs at the trailhead for a post-ride soak'],
    tags:['Family','Trail','Dogs OK','Active','Bikes'],
    stops:[
      { name:'SLO Bike Hub (Rental)', type:'activity', mins:15, cost:'$15-30', tip:'Rent bikes downtown. Reserve ahead on busy weekends. E-bikes available for those who want a boost.' },
      { name:'Bob Jones City to Sea Trail', type:'activity', mins:10, cost:'Free', tip:'Paved flat trail starts near Avila Hot Springs. One of the most scenic urban trails in California.' },
      { name:'San Luis Creek Section', type:'activity', mins:30, cost:'Free', tip:'Creek views, towering oaks, birding opportunities. Most photographed stretch of the trail.' },
      { name:'Avila Valley Barn', type:'activity', mins:20, cost:'Free', tip:'Mid-route stop for fresh produce, apple cider donuts, and a quick break. Kids love the petting zoo.' },
      { name:'Avila Beach', type:'beach', mins:60, cost:'Free', tip:'Lock your bike and hit the beach. Volleyball, swimming, shops, and cold drinks at the pier.' },
      { name:'Custom House Restaurant', type:'restaurant', mins:45, cost:'$15-30', tip:'Reward lunch with ocean views. Great fish tacos and local beers before the ride back.' },
    ]
  },
  arts: {
    name:'SLO Arts & Culture Tour', emoji:'🎨', time:'3–4 hrs', diff:'Easy', cost:'Free–$20',
    desc:'SLO punches far above its weight for arts and culture. This tour hits the public art trail, world-class small museums, independent theaters, and the galleries that make downtown feel alive.',
    tips:['SLOMA is free on first Wednesday of each month','The Public Art Trail map is available at the Visitors Center','Palm Theatre shows independent and foreign films — check their schedule','Steynberg is the heartbeat of SLO\'s bohemian arts scene'],
    tags:['Arts','Culture','Walking','Free','Museums'],
    stops:[
      { name:'SLO Visitors Center', type:'landmark', mins:10, cost:'Free', tip:'Pick up a free Public Art Walking Trail map here. The staff know everything about local culture.' },
      { name:'SLO Museum of Art', type:'museum', mins:45, cost:'Free–$5', tip:'Rotating exhibits featuring Central Coast and California artists. Small but genuinely world-class curation.' },
      { name:'SLO Public Art Walking Trail', type:'activity', mins:60, cost:'Free', tip:'20+ permanent artworks integrated throughout downtown. The map from the Visitors Center shows every piece.' },
      { name:'Steynberg Gallery', type:'arts', mins:30, cost:'Free', tip:'SLO\'s most eclectic gallery and performance space. Live music, spoken word, and rotating visual art exhibits.' },
      { name:'History Center of SLO County', type:'museum', mins:30, cost:'Free', tip:'Beautifully curated exhibits on SLO history in the original Carnegie library building. Genuinely fascinating.' },
      { name:'Fremont Theater', type:'landmark', mins:15, cost:'Free', tip:'1942 art deco landmark. Walk past at night when the neon is lit — one of the most photographed spots in SLO.' },
      { name:'Palm Theatre', type:'venue', mins:0, cost:'$10-14', tip:'California\'s oldest operating solar-powered cinema. Check what\'s playing — indie and foreign films only.' },
    ]
  },
  morros: {
    name:'Nine Sisters Morros Loop', emoji:'⛰️', time:'Half day', diff:'Easy–Hard', cost:'Free',
    desc:'SLO sits inside a chain of 9 ancient volcanic plugs stretching from Morro Bay to San Luis Obispo. This car tour with optional hikes hits four of the most dramatic, each with its own character.',
    tips:['Do Cerro San Luis at sunrise for the best light','Bishop Peak requires the most effort but has the best payoff','Islay Hill is the easiest and most rewarding for families','The full loop is about 25 miles of driving with stops'],
    tags:['Geology','Views','Hiking','Free','Unique'],
    stops:[
      { name:'Cerro San Luis (Madonna Mountain)', type:'landmark', mins:90, cost:'Free', tip:'Start here at sunrise. 2.1 mile round trip, 900ft gain. The "M" is visible from all over SLO. Best views of downtown.' },
      { name:'Bishop Peak', type:'landmark', mins:120, cost:'Free', tip:'The tallest Sister at 1,559ft. Most challenging hike but the 360° views are unmatched on the Central Coast.' },
      { name:'Islay Hill Open Space', type:'landmark', mins:60, cost:'Free', tip:'Easiest of the four Sisters. Short hike with massive payoff. Great for families and dogs. No leash required on trail.' },
      { name:'Cerro Romauldo', type:'landmark', mins:75, cost:'Free', tip:'The most underrated Sister. Fewer crowds, excellent views north toward Morro Bay. Trailhead off Foothill Blvd.' },
      { name:'Madonna Inn', type:'landmark', mins:30, cost:'Free', tip:'End with a slice of the famous pink champagne cake. The interior alone is worth the stop — pure Americana kitsch.' },
    ]
  },
  wine_crawl: {
    name:'Downtown Wine Crawl', emoji:'🥂', time:'2–3 hrs', diff:'Easy', cost:'$30–70',
    desc:'SLO\'s Urban Wine Trail puts six world-class tasting rooms within a 10-minute walk of each other downtown. No designated driver needed — walk between every stop.',
    tips:['Start at Croma Vera in Duncan Alley and work your way to Higuera','Region SLO\'s self-pour wine wall is unlike anything else in SLO','Central Coast Wines pours local winemakers in person most Thursday evenings','Club Bubbly is SLO\'s only dedicated sparkling wine bar — a genuine one-of-a-kind'],
    tags:['21+','Walkable','Wine','Downtown','Romantic'],
    stops:[
      { name:'Croma Vera Wines', type:'winery', mins:50, cost:'$15-20', tip:'Start in Duncan Alley. Spanish varietals, dog-friendly patio, and vegan bites pairings. One of SLO\'s highest-rated rooms.' },
      { name:'Dunites Wine Company', type:'winery', mins:45, cost:'$15-20', tip:'Natural wines, organic grapes, minimal intervention. Cozy Garden Street room next to La Locanda. Perfect pre-dinner stop.' },
      { name:'Pour Choices Wine Bar', type:'wine_bar', mins:45, cost:'$12-20', tip:'Casual and unpretentious on Higuera. Rotating by-the-glass selection emphasizing local producers. No attitude.' },
      { name:'Club Bubbly', type:'wine_bar', mins:45, cost:'$15-25', tip:'SLO\'s only sparkling wine bar in the Creamery. Champagne, Cava, Prosecco, and local bubbles. A genuinely unique stop.' },
      { name:'Central Coast Wines', type:'wine_bar', mins:45, cost:'$12-18', tip:'Best curated selection of small-production Central Coast wines in one place. Owner Miya is a walking encyclopedia.' },
      { name:'Region SLO', type:'wine_bar', mins:45, cost:'$15-25', tip:'Self-pour wine wall with 50+ wines. Load a card and graze at your own pace. The most unique wine experience in SLO.' },
    ]
  },
  paso: {
    name:'Paso Robles Wine Country', emoji:'🏰', time:'Full day', diff:'Easy', cost:'$80–180',
    desc:'45 minutes north of SLO, Paso Robles is California\'s most exciting wine region — bold Cabernets, Rhone blends, and biodynamic pioneers. Book a driver and make a full day of it.',
    tips:['Book tastings in advance — DAOU and Justin fill up','Hire a driver or use a wine tour company — do not drink and drive','Tablas Creek is a must for wine nerds — biodynamic Rhone varieties','Sculpterra has a sculpture garden — bring the camera'],
    tags:['21+','Drive','Wine','Paso Robles','Full Day'],
    stops:[
      { name:'DAOU Vineyards', type:'winery', mins:75, cost:'$30-50', tip:'Mountain estate with jaw-dropping views. Allocated Cabernet only available here. Reserve the seated experience.' },
      { name:'Tablas Creek Vineyard', type:'winery', mins:60, cost:'$25-40', tip:'Biodynamic farming, Rhone varieties, and the most intellectually stimulating tasting in Paso. A wine nerd\'s dream.' },
      { name:'Epoch Estate Wines', type:'winery', mins:60, cost:'$25-40', tip:'Hilltop estate on York Mountain. Grenache and Syrah from one of Paso\'s most scenic properties.' },
      { name:'Adelaida Cellars', type:'winery', mins:60, cost:'$20-35', tip:'Historic estate with Viking White and Rhone blends. Beautiful grounds and one of the region\'s oldest producers.' },
      { name:'Sculpterra Winery', type:'winery', mins:45, cost:'$15-25', tip:'Sculpture garden filled with massive bronze works alongside approachable wines. The most visually stunning winery in Paso.' },
      { name:'Justin Winery', type:'winery', mins:60, cost:'$25-40', tip:'Finish with Justin\'s iconic ISOSCELES Bordeaux blend. Upscale estate experience with optional on-site dinner.' },
    ]
  },
  campus: {
    name:'Cal Poly Campus Tour', emoji:'🎓', time:'2–3 hrs', diff:'Easy', cost:'Free',
    desc:'One of the most beautiful university campuses in America, set against the Santa Lucia mountains. This self-guided tour hits the architectural highlights, hidden viewpoints, and the student farm market.',
    tips:['Visitor parking is available at Parking Structure 131 near the Welcome Center','The Serenity Swing at the top of campus has the best views','Cal Poly Farmers Market runs Thursday afternoons — time it right','Poly Canyon Design Village is unlike anything at any other university'],
    tags:['Family','Free','Walking','Education','Views'],
    stops:[
      { name:'Cal Poly Visitors Center', type:'landmark', mins:15, cost:'Free', tip:'Pick up a campus map and get oriented. Student ambassadors offer guided tours on select days.' },
      { name:'Kennedy Library', type:'landmark', mins:20, cost:'Free', tip:'Beautiful building with panoramic mountain views from the upper floors. Open to visitors during regular hours.' },
      { name:'Performing Arts Center Cal Poly', type:'venue', mins:15, cost:'Free', tip:'World-class concert hall. Check the schedule — student rush tickets are sometimes available 30 minutes before showtime.' },
      { name:'Cal Poly Farmers Market', type:'market', mins:45, cost:'$5-20', tip:'Student-run market selling produce from Cal Poly\'s own farms. Thursday afternoons. The dairy products are exceptional.' },
      { name:'Cal Poly Poly Canyon', type:'landmark', mins:45, cost:'Free', tip:'Architecture students\' experimental design village hidden in a canyon on campus. Completely unique — worth the walk in.' },
      { name:'Rec Center', type:'landmark', mins:15, cost:'Free', tip:'Impressively equipped facility. Walk the exterior and check out the climbing wall visible through the windows.' },
    ]
  },
  family: {
    name:'SLO Family Day', emoji:'👨‍👩‍👧', time:'Full day', diff:'Easy', cost:'$20–60',
    desc:'A full day built around the things that make SLO great for families — interactive museums, a botanical garden, the city\'s beloved creek trail, and the Thursday Farmers Market for dinner.',
    tips:['SLO Children\'s Museum is best for kids under 10','Laguna Lake has a playground, duck pond, and flat walking path','Thursday Farmers Market runs 6–9pm — plan dinner there','McConnells ice cream is mandatory — do not let anyone talk you out of it'],
    tags:['Family','Kids','Free','Dogs OK','All Ages'],
    stops:[
      { name:'SLO Children\'s Museum', type:'museum', mins:90, cost:'$8-12', tip:'Interactive hands-on exhibits designed for kids 2–10. One of the best children\'s museums on the Central Coast.' },
      { name:'Mission Plaza', type:'landmark', mins:20, cost:'Free', tip:'Creekside park in the heart of downtown. Kids love the creek walk and the ducks. Great for a picnic break.' },
      { name:'SLO Botanical Garden', type:'nature', mins:60, cost:'Free', tip:'Free admission to 5 acres of California native plants along San Luis Creek. Peaceful and educational for all ages.' },
      { name:'Laguna Lake Park', type:'nature', mins:45, cost:'Free', tip:'Flat walking path around the lake, playground, and duck pond. Bring bread for the ducks. Dogs welcome on leash.' },
      { name:'McConnells Ice Cream', type:'restaurant', mins:20, cost:'$6-10', tip:'The best ice cream stop in SLO. Seasonal flavors and the iconic Eureka Lemon & Marionberry. Kids go wild.' },
      { name:'Farmers Market Thursday Night', type:'market', mins:60, cost:'$15-30', tip:'Thursday only, 6–9pm. Five blocks of Higuera shut down. BBQ, kettle corn, live music, and every kind of food imaginable.' },
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


// ══════════════════════════════════════════════
// TOURS HUB — Full screen tour browser
// ══════════════════════════════════════════════

var TOUR_FILTERS = [
  { id: 'all',      label: 'All',       emoji: '🗺' },
  { id: 'walking',  label: 'Walking',   emoji: '🚶' },
  { id: 'driving',  label: 'Driving',   emoji: '🚗' },
  { id: 'wine',     label: 'Wine',      emoji: '🍷' },
  { id: 'outdoors', label: 'Outdoors',  emoji: '🌿' },
  { id: 'family',   label: 'Family',    emoji: '👨‍👩‍👧' },
  { id: 'food',     label: 'Food',      emoji: '🍕' },
];

var TOUR_FILTER_MAP = {
  historic:   ['walking'],
  bishop:     ['outdoors'],
  food:       ['walking','food'],
  edna_wine:  ['driving','wine'],
  beach:      ['outdoors','family'],
  morro:      ['driving','outdoors'],
  brewery:    ['walking'],
  bike:       ['outdoors'],
  arts:       ['walking'],
  morros:     ['driving','outdoors'],
  wine_crawl: ['walking','wine'],
  paso:       ['driving','wine'],
  campus:     ['walking','family'],
  family:     ['walking','family'],
};

var _tourFilter = 'all';

function openToursHub() {
  var existing = document.getElementById('mh-tours-hub');
  if (existing) existing.remove();

  if (!document.getElementById('tours-hub-css')) {
    var s = document.createElement('style');
    s.id = 'tours-hub-css';
    s.textContent = [
      '.th-filter{padding:7px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.th-filter.active{background:rgba(255,215,0,0.12);border-color:rgba(255,215,0,0.5);color:#ffd700}',
      '.th-card{padding:14px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:10px;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}',
      '.th-card:active{transform:scale(0.98);background:rgba(255,215,0,0.06)}',
      '.th-tag{padding:3px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);color:rgba(255,215,0,0.7)}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-tours-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(255,215,0,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="closeToursHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🗺 SLO Tours</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + Object.keys(TOUR_DATA).length + ' curated self-guided tours</div>' +
        '</div>' +
        '<button onclick="closeToursHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div id="th-filter-bar" style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        toursRenderFilters() +
      '</div>' +
    '</div>' +
    '<div id="th-list" style="flex:1;overflow-y:auto;padding:12px 20px 48px">' +
      toursRenderList(_tourFilter) +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('tours');
}
window.openToursHub = openToursHub;
window.menuHomeOpenToursHub = openToursHub;

function closeToursHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('tours');
  var h = document.getElementById('mh-tours-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeToursHub = closeToursHub;

function toursRenderFilters() {
  return TOUR_FILTERS.map(function(f) {
    return '<button class="th-filter' + (f.id === _tourFilter ? ' active' : '') + '" data-tf="' + f.id + '" onclick="toursSetFilter(this.dataset.tf)">' + f.emoji + ' ' + f.label + '</button>';
  }).join('');
}

function toursSetFilter(filterId) {
  _tourFilter = filterId;
  var bar = document.getElementById('th-filter-bar');
  if (bar) bar.innerHTML = toursRenderFilters();
  var list = document.getElementById('th-list');
  if (list) list.innerHTML = toursRenderList(filterId);
}
window.toursSetFilter = toursSetFilter;

function toursRenderList(filterId) {
  var keys = Object.keys(TOUR_DATA).filter(function(k) {
    if (filterId === 'all') return true;
    var cats = TOUR_FILTER_MAP[k] || [];
    return cats.indexOf(filterId) !== -1;
  });

  if (!keys.length) {
    return '<div style="text-align:center;padding:48px 20px;color:rgba(255,255,255,0.3);font-size:13px">No tours in this category</div>';
  }

  return keys.map(function(k) {
    var t = TOUR_DATA[k];
    var totalStops = t.stops ? t.stops.length : 0;
    var totalCost = t.cost || 'Free';
    var diffColor = t.diff === 'Hard' ? '#ef4444' : t.diff === 'Easy' ? '#22c55e' : '#f59e0b';

    return '<div class="th-card" data-tour="' + k + '" onclick="toursOpenDetail(this.dataset.tour)">' +
      '<div style="display:flex;align-items:flex-start;gap:12px">' +
        '<div style="font-size:36px;flex-shrink:0;line-height:1">' + t.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:15px;font-weight:800;margin-bottom:3px">' + t.name + '</div>' +
          '<div style="display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap">' +
            '<span style="font-size:11px;color:rgba(255,255,255,0.45)">⏱ ' + t.time + '</span>' +
            '<span style="font-size:11px;color:' + diffColor + ';font-weight:700">' + t.diff + '</span>' +
            '<span style="font-size:11px;color:#22c55e;font-weight:700">' + totalCost + '</span>' +
            '<span style="font-size:11px;color:rgba(255,255,255,0.35)">' + totalStops + ' stops</span>' +
          '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:8px">' + t.desc.substring(0, 100) + (t.desc.length > 100 ? '…' : '') + '</div>' +
          '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
            (t.tags || []).slice(0, 4).map(function(tag) {
              return '<span class="th-tag">' + tag + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function toursOpenDetail(tourKey) {
  var t = TOUR_DATA[tourKey];
  if (!t) return;

  var existing = document.getElementById('mh-tour-detail-v2');
  if (existing) existing.remove();

  var diffColor = t.diff === 'Hard' ? '#ef4444' : t.diff === 'Easy' ? '#22c55e' : '#f59e0b';
  var totalMins = t.stops ? t.stops.reduce(function(a, s) { return a + (s.mins || 0); }, 0) : 0;
  var totalHrs = Math.floor(totalMins / 60);
  var totalRem = totalMins % 60;
  var durationStr = totalHrs ? totalHrs + 'h' + (totalRem ? ' ' + totalRem + 'm' : '') : totalRem + 'm';

  var sheet = document.createElement('div');
  sheet.id = 'mh-tour-detail-v2';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:11000;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var stopsHtml = (t.stops || []).map(function(s, i) {
    var stopColors = { landmark:'#a5b4fc', activity:'#22c55e', beach:'#06b6d4', winery:'#b44fff', restaurant:'#f59e0b', cafe:'#f59e0b', bar:'#f59e0b', museum:'#ec4899', market:'#ffd700', nature:'#22c55e', wine_bar:'#b44fff' };
    var sc = stopColors[s.type] || 'rgba(255,255,255,0.4)';
    return '<div style="display:flex;gap:12px;margin-bottom:12px">' +
      '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">' +
        '<div style="width:28px;height:28px;border-radius:50%;background:' + sc + '20;border:2px solid ' + sc + ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:' + sc + '">' + (i + 1) + '</div>' +
        (i < (t.stops.length - 1) ? '<div style="width:2px;flex:1;background:rgba(255,255,255,0.06);margin:4px 0;min-height:16px"></div>' : '') +
      '</div>' +
      '<div style="flex:1;padding-bottom:4px">' +
        '<div style="font-size:13px;font-weight:800;margin-bottom:2px">' + s.name + '</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:4px">' +
          '<span style="font-size:11px;color:rgba(255,255,255,0.4)">⏱ ' + s.mins + ' min</span>' +
          (s.cost ? '<span style="font-size:11px;color:#22c55e;font-weight:700">' + s.cost + '</span>' : '') +
        '</div>' +
        (s.tip ? '<div style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.5;padding:6px 10px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:2px solid rgba(255,215,0,0.3)">💡 ' + s.tip + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  var tipsHtml = (t.tips || []).map(function(tip) {
    return '<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
      '<span style="color:#ffd700;flex-shrink:0">→</span>' +
      '<span style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + tip + '</span>' +
    '</div>';
  }).join('');

  sheet.innerHTML =
    '<div style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:14px 20px 52px;max-height:90vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px"></div>' +

      '<div style="font-size:42px;margin-bottom:10px">' + t.emoji + '</div>' +
      '<div style="font-size:22px;font-weight:800;font-family:Georgia,serif;margin-bottom:10px">' + t.name + '</div>' +

      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' +
        '<div style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);text-align:center">' +
          '<div style="font-size:13px;font-weight:800">⏱ ' + t.time + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:1px">Duration</div>' +
        '</div>' +
        '<div style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);text-align:center">' +
          '<div style="font-size:13px;font-weight:800;color:' + diffColor + '">' + t.diff + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:1px">Difficulty</div>' +
        '</div>' +
        '<div style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);text-align:center">' +
          '<div style="font-size:13px;font-weight:800;color:#22c55e">' + t.cost + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:1px">Cost/person</div>' +
        '</div>' +
        '<div style="padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);text-align:center">' +
          '<div style="font-size:13px;font-weight:800">' + (t.stops ? t.stops.length : 0) + ' stops</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:1px">' + durationStr + ' total</div>' +
        '</div>' +
      '</div>' +

      '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;margin-bottom:16px">' + t.desc + '</div>' +

      (t.tags && t.tags.length ? '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:16px">' + t.tags.map(function(tag) { return '<span class="th-tag">' + tag + '</span>'; }).join('') + '</div>' : '') +

      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">The Route</div>' +
      stopsHtml +

      (tipsHtml ? '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;margin-top:4px">Pro Tips</div>' + tipsHtml : '') +

      '<div style="display:flex;gap:8px;margin-top:16px">' +
        '<button data-tourkey="' + tourKey + '" onclick="toursAddAllToItinerary(this.dataset.tourkey)" style="flex:1;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#000;font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">🗓 Add to Itinerary</button>' +
        '<button onclick="toursCloseDetail()" style="padding:13px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
      '</div>' +
    '</div>';

  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    sheet.querySelector('div').style.transform = 'translateY(0)';
  }, 30);

  sheet.addEventListener('click', function(e) { if (e.target === sheet) toursCloseDetail(); });
}
window.toursOpenDetail = toursOpenDetail;

function toursCloseDetail() {
  var s = document.getElementById('mh-tour-detail-v2');
  if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); }, 300); }
}
window.toursCloseDetail = toursCloseDetail;

function toursAddAllToItinerary(tourKey) {
  var t = TOUR_DATA[tourKey];
  if (!t || typeof itin === 'undefined') return;
  var stops = (t.stops || []).map(function(s) {
    return {
      name: s.name, type: s.type || 'stop',
      description: s.tip || '', tip: s.tip || '',
      cost: s.cost || '', estimated_mins: s.mins || 30,
      actual_mins: null, status: 'pending', coords: null, address: '',
    };
  });
  var plan = { headline: t.name, stops: stops.map(function(s) {
    return { name: s.name, type: s.type, description: s.tip, tip: s.tip, cost: s.cost, duration_mins: s.estimated_mins };
  }), total_cost: t.cost, pro_tip: (t.tips || [])[0] || '' };
  var newItin = itinFromPlan(plan, { groupSize: 2, usingRideshare: false });
  itin.current = newItin;
  itin.saved.unshift(newItin);
  toursCloseDetail();
  if (typeof showToast === 'function') showToast(t.name + ' added to itinerary ✅');
}
window.toursAddAllToItinerary = toursAddAllToItinerary;
