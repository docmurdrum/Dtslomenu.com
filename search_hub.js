// ══════════════════════════════════════════════
// SEARCH_HUB.JS — Universal SLO Search
// In-app results + curated external links
// ══════════════════════════════════════════════

// ── IN-APP INDEX ─────────────────────────────
var SEARCH_INDEX = [
  // HUBS
  { type:'hub', title:'DTSLO Nightlife', desc:'Bars, crowd levels, check-in, line skip', tags:['bar','bars','nightlife','drinks','downtown','night','club'], action:'menuHomeOpenDTSLO', tab:0 },
  { type:'hub', title:'Restaurants', desc:'Browse and discover SLO dining', tags:['food','eat','dinner','lunch','restaurant','dining'], action:'menuHomeOpenRestaurantHub', tab:0 },
  { type:'hub', title:'Beach Hub', desc:'8 beaches, surf, trails, tides', tags:['beach','surf','ocean','swim','avila','pismo','shell'], action:'menuHomeOpenBeachHub', tab:0 },
  { type:'hub', title:'Craft Beer', desc:'9 SLO breweries', tags:['beer','brewery','brew','ipa','tap','libertine','slo brew'], action:'menuHomeOpenBreweryHub', tab:0 },
  { type:'hub', title:'Wine Country', desc:'Edna Valley and Paso Robles wineries', tags:['wine','winery','tasting','edna','paso','chardonnay','pinot'], action:'menuHomeOpenWineHub', tab:0 },
  { type:'hub', title:'Nature', desc:'Hikes, parks, trails, Bishop Peak', tags:['hike','hiking','trail','nature','outdoors','bishop','park','walk'], action:'menuHomeOpenNatureHub', tab:0 },
  { type:'hub', title:'Events', desc:'Concerts, markets, festivals in SLO', tags:['event','concert','show','festival','market','live','music'], action:'menuHomeOpenEventsHub', tab:0 },
  { type:'hub', title:'Cal Poly', desc:'Campus, bars, eats near Cal Poly', tags:['cal poly','calpoly','campus','student','mustang','college'], action:'menuHomeOpenCalPolyHub', tab:0 },
  { type:'hub', title:'Thrill', desc:'Adventure, zipline, ATV, outdoor thrills', tags:['thrill','adventure','zipline','atv','extreme','adrenaline'], action:'menuHomeOpenThrillHub', tab:0 },
  { type:'hub', title:'Explore SLO', desc:'Landmarks, culture, art, architecture', tags:['explore','landmark','art','culture','history','mission','architecture'], action:'menuHomeOpenCityHub', tab:0 },
  { type:'hub', title:'Tours', desc:'14 self-guided SLO tours', tags:['tour','self-guided','walk','walking','drive','route'], action:'menuHomeOpenToursHub', tab:1 },
  { type:'hub', title:'Learn SLO', desc:'History, geology, culture deep dives', tags:['learn','history','geology','chumash','nine sisters','edna','culture'], action:'menuHomeOpenLearnSLO', tab:1 },
  { type:'hub', title:'Bucket List', desc:'100 things to do in SLO', tags:['bucket','list','things to do','activities','todo'], action:'menuHomeOpenBucketList', tab:1 },
  { type:'hub', title:'Plan It', desc:'AI-powered outing planner', tags:['plan','planner','outing','tonight','idea','ai','suggest'], action:'menuHomeOpenTravelPlanIt', tab:1 },
  { type:'hub', title:'Day Trips', desc:'10 curated drives from SLO', tags:['day trip','drive','hearst','big sur','solvang','cambria','paso','santa barbara'], action:'menuHomeOpenDayTrips', tab:1 },
  { type:'hub', title:'Shot List', desc:'100 best photo spots in SLO', tags:['photo','photography','shot','picture','instagram','camera','spot'], action:'menuHomeOpenShotList', tab:1 },
  { type:'hub', title:'Hotels & Stays', desc:'25 curated SLO accommodations', tags:['hotel','stay','motel','airbnb','camping','lodge','inn','bed and breakfast'], action:'menuHomeOpenHotelsHub', tab:1 },
  { type:'hub', title:'SLO Transit', desc:'Bus, Amtrak, bike, airport', tags:['bus','transit','amtrak','train','bike','airport','ride','transport'], action:'menuHomeOpenTransitHub', tab:1 },
  { type:'hub', title:'Civic Hub', desc:'Government, utilities, permits', tags:['civic','government','city hall','permit','utility','dmv','court'], action:'menuHomeOpenCivicHub', tab:2 },
  { type:'hub', title:'Housing & Rentals', desc:'Apartments, rooms, sublets in SLO', tags:['housing','rent','apartment','room','sublet','landlord','lease'], action:'menuHomeOpenHousingHub', tab:2 },
  { type:'hub', title:'Jobs & Gigs', desc:'Local jobs, internships, gig work', tags:['job','work','gig','internship','hire','career','employment'], action:'menuHomeOpenJobsHub', tab:2 },
  { type:'hub', title:'Buy & Sell', desc:'Local marketplace and free stuff', tags:['buy','sell','marketplace','free','trade','used','craigslist'], action:'menuHomeOpenBuySellHub', tab:2 },
  { type:'hub', title:'Fitness', desc:'Gyms, trails, classes in SLO', tags:['gym','fitness','workout','yoga','crossfit','run','swim','class'], action:'menuHomeOpenFitnessHub', tab:2 },
  { type:'hub', title:'Emergency & Safety', desc:'One-tap contacts, safe locations', tags:['emergency','911','police','fire','crisis','help','safety','urgent'], action:'menuHomeOpenEmergencyHub', tab:2 },
  { type:'hub', title:'Health Navigator', desc:'Triage, appointments, providers', tags:['health','doctor','dentist','urgent care','medical','clinic','appointment','sick'], action:'menuHomeOpenHealthHub', tab:3 },
  { type:'hub', title:'Know Your Rights', desc:'Legal rights, police encounters, SLO law', tags:['law','legal','rights','police','arrest','lawyer','attorney','court'], action:'menuHomeOpenLegalHub', tab:3 },
  { type:'hub', title:'Budget', desc:'Track spending, goals, SLO costs', tags:['budget','money','spend','finance','track','cost','expense'], action:'menuHomeOpenBudget', tab:3 },
  { type:'hub', title:'Itinerary', desc:'Plan, track and share your SLO trip', tags:['itinerary','plan','trip','schedule','agenda'], action:'menuHomeOpenItinerary', tab:3 },
  { type:'hub', title:'Line Skip', desc:'Skip the wait at SLO bars', tags:['line','skip','wait','queue','vip'], action:'menuHomeOpenLineSkip', tab:3 },

  // BUCKET LIST HIGHLIGHTS
  { type:'activity', title:'Summit Bishop Peak', desc:'Tallest of the Nine Sisters. Best views on the Central Coast.', tags:['bishop peak','hike','summit','nine sisters','outdoor'], action:'menuHomeOpenBucketList', tab:1 },
  { type:'activity', title:'Bike the Bob Jones Trail', desc:'8 miles of flat trail through oak forest to Avila Beach.', tags:['bike','cycling','bob jones','avila','trail'], action:'menuHomeOpenBucketList', tab:1 },
  { type:'activity', title:'Watch Monarch Butterflies at Pismo', desc:'Thousands of monarchs overwinter in the eucalyptus grove.', tags:['monarch','butterfly','pismo','wildlife','seasonal'], action:'menuHomeOpenBucketList', tab:1 },
  { type:'activity', title:'Thursday Farmers Market', desc:'Five blocks close to cars every Thursday 6-9pm.', tags:['farmers market','thursday','market','food','downtown'], action:'menuHomeOpenBucketList', tab:1 },
  { type:'activity', title:'SLO Mardi Gras Parade', desc:'Biggest Mardi Gras parade outside New Orleans.', tags:['mardi gras','parade','festival','carnival'], action:'menuHomeOpenBucketList', tab:1 },
  { type:'activity', title:'Camp at Montana de Oro', desc:'Dramatic cliffs, tide pools, wildflower bluffs.', tags:['camp','camping','montana de oro','coast','overnight'], action:'menuHomeOpenBucketList', tab:1 },

  // LEARN SLO ARTICLES
  { type:'article', title:'The Nine Sisters: Volcanic Legacy', desc:'Nine ancient volcanic plugs stretching from Morro Bay to SLO.', tags:['nine sisters','morro rock','geology','volcano','bishop peak'], action:'menuHomeOpenLearnSLO', tab:1 },
  { type:'article', title:'The Chumash People', desc:'10,000 years of history on the Central Coast.', tags:['chumash','native','indigenous','history','culture'], action:'menuHomeOpenLearnSLO', tab:1 },
  { type:'article', title:'How SLO Became a City', desc:'Mission outpost to railroad junction to university town.', tags:['history','mission','railroad','city','slo history'], action:'menuHomeOpenLearnSLO', tab:1 },
  { type:'article', title:'Why Edna Valley Wine is World Class', desc:'Pacific fog, volcanic soils, a gap in the mountains.', tags:['edna valley','wine','chardonnay','pinot','fog'], action:'menuHomeOpenLearnSLO', tab:1 },
  { type:'article', title:'The Fremont Theater', desc:'1942 Art Deco landmark still hosting shows every week.', tags:['fremont','theater','art deco','neon','concert'], action:'menuHomeOpenLearnSLO', tab:1 },

  // DAY TRIPS
  { type:'trip', title:'Hearst Castle Day Trip', desc:'45 miles north. Book tickets in advance.', tags:['hearst castle','castle','san simeon','tours'], action:'menuHomeOpenDayTrips', tab:1 },
  { type:'trip', title:'Big Sur Day Trip', desc:'90 miles north. Most dramatic coastline in California.', tags:['big sur','highway 1','bixby','mcway falls','coast'], action:'menuHomeOpenDayTrips', tab:1 },
  { type:'trip', title:'Solvang Day Trip', desc:'Danish village in wine country. 75 miles south.', tags:['solvang','danish','wine','santa ynez','day trip'], action:'menuHomeOpenDayTrips', tab:1 },

  // EMERGENCY
  { type:'contact', title:'Call 911', desc:'Police, fire, or medical emergency', tags:['911','emergency','police','fire','ambulance','help'], action:'menuHomeOpenEmergencyHub', tab:2 },
  { type:'contact', title:'SLO Crisis Line', desc:'24/7 mental health crisis support — (805) 781-4357', tags:['crisis','mental health','suicide','help','counseling'], action:'menuHomeOpenEmergencyHub', tab:2 },
  { type:'contact', title:'French Hospital ER', desc:'1911 Johnson Ave — SLO main hospital emergency', tags:['hospital','er','emergency room','urgent','french hospital'], action:'menuHomeOpenEmergencyHub', tab:2 },

  // LEGAL PRESETS
  { type:'legal', title:'Being Pulled Over', desc:'Your rights during a traffic stop', tags:['pulled over','traffic stop','police','car','rights'], action:'menuHomeOpenLegalHub', tab:3 },
  { type:'legal', title:'Tenant Rights', desc:'SLO landlord entry, habitability, eviction', tags:['tenant','landlord','rent','eviction','housing rights'], action:'menuHomeOpenLegalHub', tab:3 },
  { type:'legal', title:'Recording Police', desc:'Fully legal in California — your rights explained', tags:['record','recording','film','police','video','rights'], action:'menuHomeOpenLegalHub', tab:3 },
  { type:'legal', title:'Workplace Rights', desc:'Wages, breaks, discrimination, final paycheck', tags:['work','job','employer','fired','wages','discrimination'], action:'menuHomeOpenLegalHub', tab:3 },
];

// ── EXTERNAL LINKS ────────────────────────────
var SEARCH_EXTERNAL = [
  { keywords:['parking','park'], links:[
    { title:'SLO Parking App', url:'https://downtownslo.com/parking', emoji:'🅿️', desc:'Real-time downtown SLO parking availability' },
    { title:'SLO Parking Map', url:'https://www.slocity.org/government/department-directory/public-works-and-transportation/transportation-planning/parking', emoji:'🗺', desc:'City of SLO official parking map and rates' },
  ]},
  { keywords:['uber','lyft','ride','rideshare'], links:[
    { title:'Uber SLO', url:'https://www.uber.com', emoji:'🚗', desc:'Request a ride in San Luis Obispo' },
    { title:'Lyft SLO', url:'https://www.lyft.com', emoji:'🚙', desc:'Alternative rideshare in SLO' },
    { title:'SLO Safe Ride', url:'https://asl.calpoly.edu/safe-ride', emoji:'🛡', desc:'Free late-night rides for Cal Poly students' },
  ]},
  { keywords:['weather','forecast','surf','wave','tide'], links:[
    { title:'SLO Weather — NWS', url:'https://forecast.weather.gov/MapClick.php?CityName=San+Luis+Obispo&state=CA', emoji:'🌤', desc:'Official National Weather Service SLO forecast' },
    { title:'Surfline Central Coast', url:'https://www.surfline.com/surf-report/san-luis-obispo-county/5842041f4e65fad6a7708964', emoji:'🌊', desc:'Surf forecast, wave height, and water temp' },
    { title:'Tides Near Me — NOAA', url:'https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9412110', emoji:'🌙', desc:'NOAA tide predictions for Port San Luis' },
  ]},
  { keywords:['ticket','tickets','show','concert','event','festival'], links:[
    { title:'Eventbrite SLO', url:'https://www.eventbrite.com/d/ca--san-luis-obispo/events/', emoji:'🎫', desc:'Local events and tickets in SLO' },
    { title:'Cal Poly PAC Tickets', url:'https://pac.calpoly.edu', emoji:'🎭', desc:'Cal Poly Performing Arts Center shows' },
    { title:'Fremont Theater Events', url:'https://www.fremontslо.com', emoji:'🎵', desc:'Upcoming concerts at the Fremont Theater' },
  ]},
  { keywords:['trail','hike','hiking','alltrails','topo'], links:[
    { title:'AllTrails — SLO', url:'https://www.alltrails.com/us/california/san-luis-obispo', emoji:'🥾', desc:'Trail maps, reviews, and conditions for SLO County' },
    { title:'Cal Poly Open Space', url:'https://openspace.slocal.com', emoji:'🌿', desc:'SLO County open space map and trail info' },
  ]},
  { keywords:['restaurant','food','eat','dinner','lunch','yelp','menu'], links:[
    { title:'Yelp SLO Restaurants', url:'https://www.yelp.com/search?find_desc=restaurants&find_loc=San+Luis+Obispo%2C+CA', emoji:'⭐', desc:'Reviews and ratings for SLO restaurants' },
    { title:'OpenTable SLO', url:'https://www.opentable.com/s?metroId=12&regionIds=4982', emoji:'🍽', desc:'Make restaurant reservations in SLO' },
    { title:'Eater LA — SLO Coverage', url:'https://la.eater.com/san-luis-obispo', emoji:'🍴', desc:'Food journalism and restaurant coverage' },
  ]},
  { keywords:['news','local news','tribune','new times'], links:[
    { title:'SLO Tribune', url:'https://www.sanluisobispo.com', emoji:'📰', desc:'Local news from the San Luis Obispo Tribune' },
    { title:'New Times SLO', url:'https://www.newtimesslo.com', emoji:'🗞', desc:'Alternative weekly news and events coverage' },
    { title:'KSBY News', url:'https://www.ksby.com', emoji:'📺', desc:'Local TV news for the Central Coast' },
  ]},
  { keywords:['housing','rent','apartment','sublet','zillow','craigslist'], links:[
    { title:'Zillow SLO Rentals', url:'https://www.zillow.com/san-luis-obispo-ca/rentals/', emoji:'🏠', desc:'SLO rental listings with photos and maps' },
    { title:'Craigslist SLO Housing', url:'https://slo.craigslist.org/search/apa', emoji:'📋', desc:'Local rental classifieds — check daily' },
    { title:'Cal Poly Off-Campus Housing', url:'https://housing.calpoly.edu/off-campus-housing', emoji:'🎓', desc:'Official Cal Poly off-campus housing board' },
  ]},
  { keywords:['job','jobs','work','hire','handshake','indeed','career'], links:[
    { title:'Indeed SLO', url:'https://www.indeed.com/l-San-Luis-Obispo,-CA-jobs.html', emoji:'💼', desc:'Full-time, part-time, and remote jobs in SLO' },
    { title:'Handshake — Cal Poly', url:'https://app.joinhandshake.com', emoji:'🎓', desc:'Cal Poly student and alumni job board' },
    { title:'SLO City Jobs', url:'https://www.slocity.org/government/human-resources/job-opportunities', emoji:'🏙', desc:'Municipal jobs with the City of SLO' },
  ]},
  { keywords:['law','lawyer','attorney','legal help','legal aid'], links:[
    { title:'Justia Legal Search', url:'https://www.justia.com/search?q=California+rights', emoji:'⚖️', desc:'Free legal database — California and federal law' },
    { title:'SLO County Bar Association', url:'https://www.slobar.org', emoji:'🏛', desc:'Find a licensed attorney in SLO County' },
    { title:'California Legal Aid', url:'https://lawhelpca.org', emoji:'🤝', desc:'Free legal help for low-income Californians' },
  ]},
  { keywords:['doctor','dentist','clinic','health','medical','sick','insurance'], links:[
    { title:'Zocdoc SLO', url:'https://www.zocdoc.com/search?address=San+Luis+Obispo%2C+CA', emoji:'🩺', desc:'Find and book SLO doctors and dentists online' },
    { title:'SLO Free Clinic', url:'https://slofreeclinic.org', emoji:'❤️', desc:'Free medical care regardless of insurance status' },
    { title:'SLO County Public Health', url:'https://www.slocounty.ca.gov/departments/health-agency/public-health', emoji:'🏥', desc:'County health services, immunizations, testing' },
  ]},
  { keywords:['bus','transit','amtrak','train','schedule','route'], links:[
    { title:'SLO City Bus', url:'https://www.slocitybus.com', emoji:'🚌', desc:'Routes, schedules, and real-time arrival info' },
    { title:'Amtrak SLO Station', url:'https://www.amtrak.com/stations/slo', emoji:'🚂', desc:'Pacific Surfliner and Coast Starlight schedules' },
    { title:'Google Maps Transit', url:'https://www.google.com/maps/dir/?api=1&travelmode=transit', emoji:'🗺', desc:'Door-to-door transit directions in SLO' },
  ]},
  { keywords:['hotel','stay','motel','airbnb','book','accommodation','room'], links:[
    { title:'Booking.com SLO', url:'https://www.booking.com/searchresults.html?ss=San+Luis+Obispo', emoji:'🏨', desc:'Compare hotels and book in San Luis Obispo' },
    { title:'Airbnb SLO', url:'https://www.airbnb.com/s/San-Luis-Obispo--CA', emoji:'🏠', desc:'Unique stays and local hosts in SLO' },
    { title:'TripAdvisor SLO Hotels', url:'https://www.tripadvisor.com/Hotels-g32697-San_Luis_Obispo_California', emoji:'⭐', desc:'Reviews and rankings for SLO accommodations' },
  ]},
  { keywords:['buy','sell','marketplace','used','trade','offerup'], links:[
    { title:'Facebook Marketplace SLO', url:'https://www.facebook.com/marketplace/slo', emoji:'📘', desc:'Most active local buy and sell in SLO' },
    { title:'Craigslist SLO For Sale', url:'https://slo.craigslist.org/search/sss', emoji:'📋', desc:'Classic local classifieds for buying and selling' },
    { title:'OfferUp SLO', url:'https://offerup.com', emoji:'📦', desc:'App-based local marketplace with ratings' },
  ]},
  { keywords:['winery','wine tasting','edna','paso','vineyard'], links:[
    { title:'SLO Wine Country', url:'https://www.slowine.com', emoji:'🍷', desc:'Official SLO wine country guide and tasting room map' },
    { title:'Paso Robles Wine Alliance', url:'https://pasowine.com', emoji:'🍇', desc:'Paso Robles winery directory and events' },
    { title:'Wine Maps', url:'https://www.winecountry.com/destinations/san-luis-obispo', emoji:'🗺', desc:'Central Coast wine region guide and maps' },
  ]},
];

// ── STATE ─────────────────────────────────────
var _searchQuery = '';
var _searchDebounce = null;

// ── OPEN / CLOSE ─────────────────────────────
function openSearchHub() {
  var existing = document.getElementById('mh-search-hub');
  if (existing) {
    // Re-focus the input if already open
    var inp = document.getElementById('search-hub-input');
    if (inp) inp.focus();
    return;
  }

  if (!document.getElementById('search-hub-css')) {
    var s = document.createElement('style');
    s.id = 'search-hub-css';
    s.textContent = [
      '.sh-result{padding:11px 14px;border-radius:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:7px;cursor:pointer;display:flex;align-items:center;gap:11px;-webkit-tap-highlight-color:transparent;transition:all 0.12s}',
      '.sh-result:active{transform:scale(0.98);background:rgba(0,245,255,0.06)}',
      '.sh-ext{padding:11px 14px;border-radius:13px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);margin-bottom:7px;display:flex;align-items:center;gap:11px;text-decoration:none;-webkit-tap-highlight-color:transparent;transition:all 0.12s}',
      '.sh-ext:active{transform:scale(0.98)}',
      '.sh-section{font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:1.5px;text-transform:uppercase;margin:14px 0 8px}',
      '.sh-badge{font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;flex-shrink:0}',
    ].join('');
    document.head.appendChild(s);
  }

  _searchQuery = '';
  var hub = document.createElement('div');
  hub.id = 'mh-search-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.98);backdrop-filter:blur(12px);opacity:0;transition:opacity 0.25s';

  hub.innerHTML =
    '<div style="padding:52px 20px 14px;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="closeSearchHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1;position:relative">' +
          '<input id="search-hub-input" placeholder="Search SLO — hubs, activities, legal rights, places..." ' +
            'style="width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(0,245,255,0.25);border-radius:14px;padding:12px 40px 12px 16px;color:#fff;font-size:14px;outline:none;box-sizing:border-box;font-family:Helvetica Neue,sans-serif" ' +
            'oninput="searchHubQuery(this.value)">' +
          '<div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none">🔍</div>' +
        '</div>' +
        '<button onclick="closeSearchHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer;flex-shrink:0">✕</button>' +
      '</div>' +
    '</div>' +
    '<div id="search-hub-results" style="flex:1;overflow-y:auto;padding:0 20px 80px">' +
      searchHubRenderEmpty() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() {
    hub.style.opacity = '1';
    var inp = document.getElementById('search-hub-input');
    if (inp) inp.focus();
  }, 60);
}
window.openSearchHub = openSearchHub;
window.menuHomeOpenSearchHub = openSearchHub;

function closeSearchHub() {
  var h = document.getElementById('mh-search-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 250); }
}
window.closeSearchHub = closeSearchHub;

// ── QUERY ─────────────────────────────────────
function searchHubQuery(val) {
  _searchQuery = val;
  clearTimeout(_searchDebounce);
  _searchDebounce = setTimeout(function() { searchHubRender(val.trim().toLowerCase()); }, 120);
}
window.searchHubQuery = searchHubQuery;

function searchHubRender(q) {
  var el = document.getElementById('search-hub-results');
  if (!el) return;
  if (!q) { el.innerHTML = searchHubRenderEmpty(); return; }

  var inApp = searchHubInApp(q);
  var external = searchHubExternal(q);

  if (!inApp.length && !external.length) {
    el.innerHTML = searchHubRenderNoResults(q);
    return;
  }

  var html = '';

  if (inApp.length) {
    html += '<div class="sh-section">In App</div>';
    html += inApp.map(function(r) {
      var icon = r.type === 'hub' ? '⚡' : r.type === 'activity' ? '🏆' : r.type === 'article' ? '📚' : r.type === 'trip' ? '🗺' : r.type === 'contact' ? '📞' : r.type === 'legal' ? '⚖️' : '•';
      var badgeColor = r.type === 'hub' ? 'rgba(0,245,255,0.15);color:#00f5ff;border:1px solid rgba(0,245,255,0.3)' :
                       r.type === 'activity' ? 'rgba(255,215,0,0.12);color:#ffd700;border:1px solid rgba(255,215,0,0.25)' :
                       r.type === 'article' ? 'rgba(139,92,246,0.12);color:#c4b5fd;border:1px solid rgba(139,92,246,0.25)' :
                       r.type === 'legal' ? 'rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25)' :
                       r.type === 'contact' ? 'rgba(239,68,68,0.12);color:#ef4444;border:1px solid rgba(239,68,68,0.25)' :
                       'rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.12)';
      return '<div class="sh-result" data-saction="' + r.action + '" data-stab="' + (r.tab||0) + '" onclick="searchHubOpen(this.dataset.saction,this.dataset.stab)">' +
        '<div style="font-size:20px;flex-shrink:0">' + icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:800;margin-bottom:2px">' + r.title + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.4">' + r.desc + '</div>' +
        '</div>' +
        '<span class="sh-badge" style="background:' + badgeColor + '">' + r.type + '</span>' +
      '</div>';
    }).join('');
  }

  if (external.length) {
    html += '<div class="sh-section">Helpful Links</div>';
    html += external.map(function(l) {
      return '<a class="sh-ext" href="' + l.url + '" target="_blank">' +
        '<div style="font-size:22px;flex-shrink:0">' + l.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:2px">' + l.title + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4);line-height:1.4">' + l.desc + '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:rgba(0,245,255,0.6);font-weight:700;flex-shrink:0">↗</div>' +
      '</a>';
    }).join('');
  }

  // Always add Google fallback at the bottom
  html += '<div class="sh-section">Search the Web</div>';
  html += '<a class="sh-ext" href="https://www.google.com/search?q=' + encodeURIComponent('San Luis Obispo ' + _searchQuery) + '" target="_blank">' +
    '<div style="font-size:22px;flex-shrink:0">🌐</div>' +
    '<div style="flex:1;min-width:0">' +
      '<div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:2px">Google: "San Luis Obispo ' + _searchQuery + '"</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Search Google with local context</div>' +
    '</div>' +
    '<div style="font-size:11px;color:rgba(0,245,255,0.6);font-weight:700;flex-shrink:0">↗</div>' +
  '</a>';

  el.innerHTML = html;
}

// ── IN-APP SEARCH ─────────────────────────────
function searchHubInApp(q) {
  var words = q.split(' ').filter(function(w) { return w.length > 1; });
  var results = [];
  var seen = {};

  SEARCH_INDEX.forEach(function(item) {
    if (seen[item.title]) return;
    var score = 0;
    var haystack = (item.title + ' ' + item.desc + ' ' + item.tags.join(' ')).toLowerCase();
    words.forEach(function(w) {
      if (haystack.indexOf(w) > -1) score++;
      if (item.title.toLowerCase().indexOf(w) > -1) score += 2; // title match bonus
    });
    if (score > 0) {
      results.push({ item: item, score: score });
      seen[item.title] = true;
    }
  });

  results.sort(function(a, b) { return b.score - a.score; });
  return results.slice(0, 8).map(function(r) { return r.item; });
}

// ── EXTERNAL SEARCH ───────────────────────────
function searchHubExternal(q) {
  var results = [];
  var seen = {};
  var words = q.split(' ');

  SEARCH_EXTERNAL.forEach(function(category) {
    var matched = category.keywords.some(function(kw) {
      return words.some(function(w) { return kw.indexOf(w) > -1 || w.indexOf(kw) > -1; });
    });
    if (matched) {
      category.links.forEach(function(link) {
        if (!seen[link.url]) {
          results.push(link);
          seen[link.url] = true;
        }
      });
    }
  });

  return results.slice(0, 6);
}

// ── HUB OPEN ─────────────────────────────────
function searchHubOpen(action, tab) {
  closeSearchHub();
  // Switch to the right tab first if needed
  var tabNum = parseInt(tab) || 0;
  if (typeof mhTab !== 'undefined' && mhTab !== tabNum) {
    if (typeof mhSwitchTab === 'function') mhSwitchTab(tabNum);
  }
  setTimeout(function() {
    if (typeof window[action] === 'function') window[action]();
  }, 200);
}
window.searchHubOpen = searchHubOpen;

// ── RENDER HELPERS ────────────────────────────
function searchHubRenderEmpty() {
  var suggestions = [
    { q:'hike', label:'Hiking' },
    { q:'bar', label:'Bars' },
    { q:'wine', label:'Wine' },
    { q:'beach', label:'Beach' },
    { q:'job', label:'Jobs' },
    { q:'rent', label:'Housing' },
    { q:'event', label:'Events' },
    { q:'rights', label:'Know Rights' },
    { q:'doctor', label:'Health' },
    { q:'photo', label:'Photo Spots' },
    { q:'bus', label:'Transit' },
    { q:'hotel', label:'Hotels' },
  ];
  return '<div style="padding-top:8px">' +
    '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Quick Searches</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">' +
      suggestions.map(function(s) {
        return '<button data-sq="' + s.q + '" onclick="document.getElementById(\'search-hub-input\').value=this.dataset.sq;searchHubQuery(this.dataset.sq)" ' +
          'style="padding:8px 14px;border-radius:20px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">' +
          s.label + '</button>';
      }).join('') +
    '</div>' +
    '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Everything in the App</div>' +
    SEARCH_INDEX.filter(function(r) { return r.type === 'hub'; }).map(function(r) {
      return '<div class="sh-result" data-saction="' + r.action + '" data-stab="' + (r.tab||0) + '" onclick="searchHubOpen(this.dataset.saction,this.dataset.stab)">' +
        '<div style="font-size:18px;flex-shrink:0">⚡</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:800">' + r.title + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + r.desc + '</div>' +
        '</div>' +
        '<div style="font-size:12px;color:rgba(0,245,255,0.5)">›</div>' +
      '</div>';
    }).join('') +
  '</div>';
}

function searchHubRenderNoResults(q) {
  return '<div style="text-align:center;padding:40px 20px">' +
    '<div style="font-size:36px;margin-bottom:12px">🔍</div>' +
    '<div style="font-size:15px;font-weight:800;margin-bottom:6px">No results for "' + q + '"</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:20px">Try a different word or search Google below.</div>' +
  '</div>' +
  '<a class="sh-ext" href="https://www.google.com/search?q=' + encodeURIComponent('San Luis Obispo ' + q) + '" target="_blank">' +
    '<div style="font-size:22px;flex-shrink:0">🌐</div>' +
    '<div style="flex:1">' +
      '<div style="font-size:13px;font-weight:800;color:#fff">Google: "San Luis Obispo ' + q + '"</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Search with local context</div>' +
    '</div>' +
    '<div style="font-size:11px;color:rgba(0,245,255,0.6);font-weight:700">↗</div>' +
  '</a>';
}
