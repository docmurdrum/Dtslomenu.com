// ══════════════════════════════════════════════
// DAY_TRIPS.JS — Day Trips from SLO
// Curated drives · What to do · Tips
// ══════════════════════════════════════════════

var DAY_TRIP_CATS = [
  { id:'all',      label:'All',       emoji:'🗺' },
  { id:'coast',    label:'Coast',     emoji:'🌊' },
  { id:'inland',   label:'Inland',    emoji:'🏔' },
  { id:'culture',  label:'Culture',   emoji:'🎨' },
  { id:'nature',   label:'Nature',    emoji:'🌿' },
];

var DAY_TRIPS = [
  {
    name:'Hearst Castle',
    category:'culture',
    emoji:'🏰',
    distance:'45 miles north',
    drive:'50 min',
    best_season:'Year-round',
    cost:'$$',
    summary:'One of the most extraordinary private estates ever built. William Randolph Hearst spent 28 years constructing this hilltop palace overlooking the Pacific. The pools alone are worth the trip.',
    highlights:['Neptune Pool — one of the most photographed outdoor pools in the world','138-room main house filled with European art and antiques','Zebras and other exotic animals still roam the property','Evening tours available and highly recommended','Book tickets well in advance — sells out on weekends'],
    tips:'Book online at hearstcastle.org. The Experience Tour is the best starting point. Go on a weekday to avoid crowds. Combine with a stop in Cambria on the way back.',
    directions:'Take US-1 north from SLO through Morro Bay and Cambria.',
  },
  {
    name:'Big Sur',
    category:'nature',
    emoji:'🌁',
    distance:'90 miles north',
    drive:'2 hrs',
    best_season:'Apr–Oct',
    cost:'$',
    summary:'The most dramatic stretch of coastline in California. Cliffs plunge into the Pacific, redwoods grow to the water\'s edge, and waterfalls drop directly onto the beach. Allow a full day.',
    highlights:['Bixby Bridge — the most photographed bridge in California','McWay Falls — an 80ft waterfall that falls directly onto the beach','Pfeiffer Big Sur State Park — redwood groves and river swimming','Sand Dollar Beach — the largest sand beach in Big Sur','Nepenthe restaurant for lunch with 180-degree ocean views'],
    tips:'Go early — Highway 1 through Big Sur is slow and can close without warning. Check Caltrans for road conditions before leaving. Bring cash for state park fees.',
    directions:'Take US-101 north to Morro Bay, then Highway 1 north through Cambria and San Simeon.',
  },
  {
    name:'Solvang',
    category:'culture',
    emoji:'🇩🇰',
    distance:'75 miles south',
    drive:'1 hr 15 min',
    best_season:'Year-round',
    cost:'$$',
    summary:'A Danish village transplanted to the Santa Ynez Valley wine country. Windmills, half-timbered buildings, Danish pastries, and world-class Pinot Noir within walking distance of each other.',
    highlights:['Aebleskiver — Danish pancake balls — from the Old Danish Bakery','Wine tasting along Copenhagen Drive','Mission Santa Ines — one of the most intact California missions','Ostrichland USA nearby — feed ostriches from a bucket','Hans Christian Andersen Museum above a bookshop'],
    tips:'Park once and walk everywhere — the village is compact. Go on a weekday if possible. The Santa Ynez Valley wineries nearby are among California\'s best for Pinot and Chardonnay.',
    directions:'Take US-101 south to Santa Barbara, then Highway 246 west.',
  },
  {
    name:'Cambria',
    category:'coast',
    emoji:'🦭',
    distance:'35 miles north',
    drive:'40 min',
    best_season:'Year-round',
    cost:'$',
    summary:'A small coastal village with a genuinely artsy character, dramatic moonstone beaches, and the best place to see elephant seals in California. Easy half-day from SLO.',
    highlights:['Elephant Seal Vista Point — thousands of seals on the beach seasonally','Moonstone Beach boardwalk — free, beautiful, great for sunset','Main Street galleries and independent shops','Linn\'s Restaurant — famous for ollalieberry pie','Fiscalini Ranch Preserve — bluff trail with coastal views'],
    tips:'Elephant seal season peaks November through March. The boardwalk is always worth doing regardless. Combine with Hearst Castle for a full day up the coast.',
    directions:'Take US-101 north to Morro Bay, then Highway 1 north.',
  },
  {
    name:'Paso Robles Wine Country',
    category:'culture',
    emoji:'🍷',
    distance:'30 miles north',
    drive:'35 min',
    best_season:'Apr–Nov',
    cost:'$$$',
    summary:'Over 200 wineries across a diverse landscape of rolling hills and river valleys. Paso produces outstanding Cabernet, Zinfandel, and Rhone varieties. The downtown square is charming and walkable.',
    highlights:['DAOU Mountain — breathtaking views and world-class Cabernet','Tablas Creek — biodynamic farming, rare Rhone varieties','Justin Winery — the original Paso cult producer','Downtown Paso square — restaurants, tasting rooms, live music','Templeton Gap District — cooler climate, exceptional Grenache'],
    tips:'Book a driver or a wine tour — do not drink and drive on these country roads. Book tasting appointments in advance for the top producers. Combine with a Templeton Gap winery for variety.',
    directions:'Take US-101 north directly to Paso Robles.',
  },
  {
    name:'Morro Bay',
    category:'coast',
    emoji:'🪨',
    distance:'14 miles north',
    drive:'20 min',
    best_season:'Year-round',
    cost:'$',
    summary:'SLO\'s closest coastal neighbor. A working fishing village anchored by the dramatic 576-foot Morro Rock. Sea otters, kayaking, excellent fresh seafood, and one of the most beautiful estuaries on the Pacific Coast.',
    highlights:['Kayak or SUP around Morro Rock','Sea otters floating in the harbor most mornings','Fresh fish and chips at the embarcadero','Morro Bay State Park Museum of Natural History','Black Hill Trail for views of the rock and estuary'],
    tips:'Go early morning for sea otters — they are less active in the afternoon. Central Coast Kayaks at the embarcadero has the best rental setup. Combine with Montana de Oro just south.',
    directions:'Take Highway 1 north from SLO.',
  },
  {
    name:'Pismo Beach',
    category:'coast',
    emoji:'🏄',
    distance:'12 miles south',
    drive:'15 min',
    best_season:'Jun–Sep',
    cost:'$',
    summary:'Classic California beach town with the widest and most driveable beach in the state. Famous for clam chowder, the pier, sand dunes, and monarch butterflies in winter.',
    highlights:['Drive on the beach with a permit — Oceano Dunes SVRA','Splash Cafe famous bread bowl clam chowder','Pismo Pier at sunset','Monarch Butterfly Grove — October through February','Shell Beach tidepools just north of downtown'],
    tips:'The sand dunes at Oceano require a day permit and 4WD. The monarch grove is free. Clam chowder at Splash Cafe has a line that moves quickly.',
    directions:'Take US-101 south or Highway 1 south from SLO.',
  },
  {
    name:'Santa Barbara',
    category:'culture',
    emoji:'🌺',
    distance:'100 miles south',
    drive:'1 hr 30 min',
    best_season:'Year-round',
    cost:'$$$',
    summary:'The American Riviera. Spanish colonial architecture, a world-class wine scene, Michelin-starred restaurants, and the most beautiful courthouse in California. A proper overnight is better but a long day works.',
    highlights:['Santa Barbara County Courthouse — free, stunning, climb the clock tower','State Street and the Funk Zone wine and food district','Santa Barbara Mission overlooking the city','East Beach — wide, clean, beautiful','Channel Islands National Park visitor center — day trips to the islands available'],
    tips:'The Funk Zone near the train station has 20+ tasting rooms within walking distance. Parking on State Street fills early on weekends. Take the train from SLO for a stress-free trip.',
    directions:'Take US-101 south directly to Santa Barbara.',
  },
  {
    name:'Pinnacles National Park',
    category:'nature',
    emoji:'🦅',
    distance:'80 miles northeast',
    drive:'1 hr 30 min',
    best_season:'Oct–May (avoid summer heat)',
    cost:'$15 park fee',
    summary:'A volcanic landscape of towering spires and talus caves that is California\'s least-visited national park. California condors — the largest flying bird in North America — nest here and are commonly seen.',
    highlights:['California condors soaring overhead — frequently spotted','Bear Gulch Cave trail — hike through a talus cave with headlamp','High Peaks Trail — dramatic spires with 360 views','Balconies Cave — another talus cave accessible from the west entrance','Incredible spring wildflower displays'],
    tips:'Visit the east entrance — better facilities and more trails. Bring a headlamp for the caves. Go October through April — summer temperatures regularly exceed 100F. Download the map offline.',
    directions:'Take US-101 north to Salinas, then Highway 25 south.',
  },
  {
    name:'Montana de Oro',
    category:'nature',
    emoji:'🌊',
    distance:'12 miles west',
    drive:'20 min',
    best_season:'Mar–Jun for wildflowers',
    cost:'Free',
    summary:'The most spectacular coastal state park in SLO County and arguably on the Central Coast. Seven miles of clifftop trail overlooking the open Pacific, dramatic sea caves, and tide pools. Free to enter.',
    highlights:['Bluffs Trail — 7 miles of Pacific clifftop walking','Spooner\'s Cove — beautiful protected beach for swimming','Sea caves accessible at low tide','Spring wildflowers covering the bluffs — March through May','Camping available — book months in advance'],
    tips:'Go at low tide to explore the sea caves. The bluffs are most dramatic in the morning light. Camping here is exceptional but books up extremely fast. No entrance fee.',
    directions:'Take Los Osos Valley Road west from SLO through Los Osos.',
  },
];

var _dtCat = 'all';

function openDayTrips() {
  var existing = document.getElementById('mh-daytrips-hub');
  if (existing) existing.remove();

  if (!document.getElementById('daytrips-css')) {
    var s = document.createElement('style');
    s.id = 'daytrips-css';
    s.textContent = [
      '.dt-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(255,215,0,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.dt-filter.active{background:rgba(255,215,0,0.1);border-color:#ffd700;color:#ffd700}',
      '.dt-card{padding:16px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 0.15s}',
      '.dt-card:active{transform:scale(0.98);background:rgba(255,215,0,0.04)}',
    ].join('');
    document.head.appendChild(s);
  }

  _dtCat = 'all';
  var hub = document.createElement('div');
  hub.id = 'mh-daytrips-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(255,215,0,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeDayTrips()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">🗺 Day Trips from SLO</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">10 curated drives · coast · wine · nature</div>' +
        '</div>' +
        '<button onclick="closeDayTrips()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        DAY_TRIP_CATS.map(function(c, i) {
          return '<button class="dt-filter' + (i===0?' active':'') + '" data-dtcat="' + c.id + '" onclick="dtSetCat(this,this.dataset.dtcat)">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="dt-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      dtRenderList('all') +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('day_trips');
}
window.openDayTrips = openDayTrips;
window.menuHomeOpenDayTrips = openDayTrips;

function closeDayTrips() {
  hubDeactivateMapMode();
  tipsRemoveButton('day_trips');
  var h = document.getElementById('mh-daytrips-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeDayTrips = closeDayTrips;

function dtSetCat(el, cat) {
  _dtCat = cat;
  document.querySelectorAll('.dt-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('dt-content');
  if (c) c.innerHTML = dtRenderList(cat);
}
window.dtSetCat = dtSetCat;

function dtRenderList(cat) {
  var trips = cat === 'all' ? DAY_TRIPS : DAY_TRIPS.filter(function(t) { return t.category === cat; });
  return trips.map(function(t) {
    return '<div class="dt-card" data-dtid="' + t.name + '" onclick="dtOpenTrip(this.dataset.dtid)">' +
      '<div style="display:flex;align-items:flex-start;gap:12px">' +
        '<div style="font-size:36px;flex-shrink:0;line-height:1">' + t.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:16px;font-weight:900;margin-bottom:4px">' + t.name + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:8px">' + t.summary.substring(0,90) + '...</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<span style="font-size:10px;color:rgba(255,215,0,0.8);font-weight:700">📍 ' + t.distance + '</span>' +
            '<span style="font-size:10px;color:rgba(255,255,255,0.4)">🚗 ' + t.drive + '</span>' +
            '<span style="font-size:10px;color:rgba(255,255,255,0.4)">💰 ' + t.cost + '</span>' +
            '<span style="font-size:10px;color:rgba(255,255,255,0.4)">📅 ' + t.best_season + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:14px;color:rgba(255,215,0,0.5);flex-shrink:0">›</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function dtOpenTrip(name) {
  var trip = DAY_TRIPS.find(function(t) { return t.name === name; });
  if (!trip) return;
  var c = document.getElementById('dt-content');
  if (!c) return;
  c.scrollTop = 0;
  c.innerHTML =
    '<button onclick="dtBackToList()" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;padding:0;margin-bottom:16px">← All trips</button>' +
    '<div style="font-size:44px;margin-bottom:8px">' + trip.emoji + '</div>' +
    '<div style="font-size:24px;font-weight:900;font-family:Georgia,serif;margin-bottom:8px">' + trip.name + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' +
      '<span style="padding:4px 10px;border-radius:20px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);color:#ffd700;font-size:11px;font-weight:700">📍 ' + trip.distance + '</span>' +
      '<span style="padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:11px">🚗 ' + trip.drive + '</span>' +
      '<span style="padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:11px">💰 ' + trip.cost + '</span>' +
      '<span style="padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:11px">📅 ' + trip.best_season + '</span>' +
    '</div>' +
    '<div style="font-size:14px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:20px">' + trip.summary + '</div>' +
    '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Highlights</div>' +
    trip.highlights.map(function(h) {
      return '<div style="display:flex;gap:8px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
        '<span style="color:#ffd700;flex-shrink:0">→</span>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.5">' + h + '</div>' +
      '</div>';
    }).join('') +
    '<div style="margin-top:16px;padding:13px;border-radius:13px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2)">' +
      '<div style="font-size:11px;font-weight:700;color:#ffd700;margin-bottom:6px">💡 Local Tips</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6">' + trip.tips + '</div>' +
    '</div>' +
    '<div style="margin-top:12px;padding:13px;border-radius:13px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07)">' +
      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:6px">🚗 Directions from SLO</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:10px">' + trip.directions + '</div>' +
      '<a href="https://www.google.com/maps/dir/San+Luis+Obispo,+CA/' + encodeURIComponent(trip.name + ', California') + '" target="_blank" style="display:block;padding:11px;border-radius:10px;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);color:#ffd700;text-align:center;font-size:12px;font-weight:800;text-decoration:none">Open in Google Maps ↗</a>' +
    '</div>' +
    '<button onclick="dtBackToList()" style="width:100%;margin-top:16px;padding:13px;border-radius:13px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">← Back to All Trips</button>';
}
window.dtOpenTrip = dtOpenTrip;

function dtBackToList() {
  var c = document.getElementById('dt-content');
  if (c) { c.innerHTML = dtRenderList(_dtCat); c.scrollTop = 0; }
}
window.dtBackToList = dtBackToList;
