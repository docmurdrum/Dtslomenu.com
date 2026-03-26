// ══════════════════════════════════════════════
// BEACH HUB.JS
// ══════════════════════════════════════════════

// BEACH HUB
// ══════════════════════════════════════════════

var BEACHES = [
  {
    id: 'avila', name: 'Avila Beach', emoji: '🏖', drive: '10 min', miles: 8,
    vibe: 'Calm & family-friendly', rating: 'Good', surf: '1-2 ft',
    wind: 'Light offshore', water: '58°F', uv: 6, tide: 'Incoming',
    color: '#22c55e', coords: [-120.7319, 35.1797],
    parking: [
      {name:'Front Beach Lot', cost:'$2/hr', status:'Open'},
      {name:'Avila Village Lot', cost:'Free 2hr', status:'Open'},
      {name:'Harford Pier Lot', cost:'$1/hr', status:'Busy'},
    ],
    trails: [
      {name:'Bob Jones Trail', dist:'3.5 mi one way', diff:'Easy', dogs:true, notes:'Paved, connects SLO to Avila'},
      {name:'Cave Landing Trail', dist:'1.2 mi', diff:'Easy', dogs:true, notes:'Ocean views and sea caves'},
    ],
    rentals: [
      {name:'Central Coast Kayaks', type:'Kayak/SUP', price:'$20/hr', link:'https://centralcoastkayaks.com'},
      {name:'Avila Beach Surf School', type:'Surf lessons', price:'$75', link:'https://avilabeachsurfschool.com'},
      {name:'Avila Bike Rentals', type:'Bikes', price:'$15/hr', link:''},
    ],
    eat: [
      {name:'Custom House Restaurant', vibe:'Seafood on the pier', price:'$$$'},
      {name:'Old Custom House', vibe:'Casual beachfront', price:'$$'},
      {name:'Avila Grocery', vibe:'Deli & snacks', price:'$'},
    ],
    cams: ['https://www.805webcams.com/avila-beach'],
    bus: {route:'Route 6 - Avila Beach', fare:1.50, freq:'Hourly'},
    sunrise: '6:42 AM', sunset: '7:28 PM',
  },
  {
    id: 'pismo', name: 'Pismo Beach', emoji: '🌊', drive: '15 min', miles: 12,
    vibe: 'Classic boardwalk vibes', rating: 'Fair', surf: '2-3 ft',
    wind: 'W swell, light winds', water: '57°F', uv: 7, tide: 'Outgoing',
    color: '#06b6d4', coords: [-120.6413, 35.1427],
    parking: [
      {name:'Pismo Pier Lot', cost:'$2/hr', status:'Busy'},
      {name:'Price St Lot', cost:'$1.50/hr', status:'Open'},
      {name:'Dolliver St Parking', cost:'Free 2hr', status:'Open'},
    ],
    trails: [
      {name:'Pismo Beach Boardwalk', dist:'0.5 mi', diff:'Easy', dogs:true, notes:'Flat beachfront walk'},
      {name:'Pismo Preserve Trail', dist:'5.5 mi loop', diff:'Moderate', dogs:true, notes:'Oak woodland and ocean views'},
      {name:'Monarch Butterfly Grove', dist:'0.3 mi', diff:'Easy', dogs:false, notes:'Oct-Feb only — thousands of monarchs'},
    ],
    rentals: [
      {name:'Pismo Beach Surf Shop', type:'Board rentals', price:'$15/hr', link:''},
      {name:'Pismo Surf School', type:'Surf lessons', price:'$80', link:''},
      {name:'Beach Rentals SLO', type:'Bikes/boards/chairs', price:'$10/hr', link:''},
    ],
    eat: [
      {name:'Splash Cafe', vibe:'Famous clam chowder', price:'$$'},
      {name:'Old West Cinnamon Rolls', vibe:'Local institution', price:'$'},
      {name:'Cracked Crab', vibe:'Seafood buckets', price:'$$$'},
    ],
    cams: ['https://www.805webcams.com/pismo-beach'],
    bus: {route:'Route 10 - Pismo Beach', fare:1.50, freq:'Every 2 hrs'},
    sunrise: '6:42 AM', sunset: '7:29 PM',
  },
  {
    id: 'shell', name: 'Shell Beach', emoji: '🪨', drive: '12 min', miles: 10,
    vibe: 'Dramatic cliffs, local fave', rating: 'Fair', surf: '2-4 ft',
    wind: 'NW swell, choppy', water: '56°F', uv: 6, tide: 'Outgoing',
    color: '#f59e0b', coords: [-120.6600, 35.1552],
    parking: [
      {name:'Shell Beach Rd Lot', cost:'Free', status:'Open'},
      {name:'Cliff Ave Parking', cost:'Free', status:'Open'},
    ],
    trails: [
      {name:'Pelican Point Trail', dist:'1.5 mi', diff:'Easy', dogs:true, notes:'Dramatic ocean bluff walk'},
      {name:'Spyglass Park Loop', dist:'2 mi', diff:'Easy', dogs:true, notes:'Hidden coves and tide pools'},
    ],
    rentals: [
      {name:'See Pismo/Avila for nearest surf rentals', type:'None local', price:'', link:''},
    ],
    eat: [
      {name:'Sea Venture Restaurant', vibe:'Oceanfront fine dining', price:'$$$'},
      {name:'Shell Beach Bar & Grill', vibe:'Casual coastal', price:'$$'},
    ],
    cams: ['https://www.805webcams.com'],
    bus: {route:'Route 10 via Pismo', fare:1.50, freq:'Every 2 hrs'},
    sunrise: '6:42 AM', sunset: '7:28 PM',
  },
  {
    id: 'morro', name: 'Morro Bay', emoji: '🦦', drive: '30 min', miles: 14,
    vibe: 'Wildlife & Morro Rock', rating: 'Poor', surf: '3-4 ft',
    wind: 'Cross-shore winds', water: '55°F', uv: 5, tide: 'Incoming',
    color: '#b44fff', coords: [-120.8500, 35.3658],
    parking: [
      {name:'Embarcadero Lot', cost:'$1.50/hr', status:'Open'},
      {name:'Coleman Park Lot', cost:'Free', status:'Open'},
      {name:'Morro Strand Lot', cost:'$10/day', status:'Open'},
    ],
    trails: [
      {name:'Morro Strand State Beach', dist:'3 mi', diff:'Easy', dogs:true, notes:'Wide flat beach, good for walking'},
      {name:'Black Hill Trail', dist:'2 mi', diff:'Moderate', dogs:true, notes:'Views of Morro Rock and bay'},
      {name:'Cerro Cabrillo Peak', dist:'3.5 mi', diff:'Moderate', dogs:true, notes:'One of the Nine Sisters'},
    ],
    rentals: [
      {name:'Central Coast Outdoors', type:'Kayak tours', price:'$65', link:''},
      {name:'Rock Kayak', type:'Kayak rentals', price:'$25/hr', link:''},
      {name:'Morro Bay Bike Rentals', type:'Bikes', price:'$12/hr', link:''},
    ],
    eat: [
      {name:'Taco Temple', vibe:'Best fish tacos on coast', price:'$'},
      {name:'Dockside Too', vibe:'Waterfront seafood', price:'$$'},
      {name:'Sub-Sub Sandwich', vibe:'Local legend', price:'$'},
    ],
    cams: ['https://www.805webcams.com/morro-bay'],
    bus: {route:'RTA Route 12 - Morro Bay', fare:1.75, freq:'Every 90 min'},
    sunrise: '6:44 AM', sunset: '7:31 PM',
  },
  {
    id: 'cayucos', name: 'Cayucos', emoji: '🏄', drive: '35 min', miles: 20,
    vibe: 'Old California charm', rating: 'Good', surf: '2-3 ft',
    wind: 'NW offshore', water: '56°F', uv: 5, tide: 'Incoming',
    color: '#22c55e', coords: [-120.8939, 35.4426],
    parking: [
      {name:'Cayucos Pier Lot', cost:'Free', status:'Open'},
      {name:'Ocean Ave Street', cost:'Free', status:'Open'},
    ],
    trails: [
      {name:'Cayucos to Morro Bay Beach Walk', dist:'5 mi one way', diff:'Easy', dogs:true, notes:'Flat beach walk between towns'},
    ],
    rentals: [
      {name:'Good Clean Fun Surf Shop', type:'Surf/board rentals', price:'$15/hr', link:''},
    ],
    eat: [
      {name:'Cayucos Scoop', vibe:'Best ice cream on the coast', price:'$'},
      {name:'Hoppe\'s Garden Bistro', vibe:'Upscale farm to table', price:'$$$'},
      {name:'Sea Shanty', vibe:'Classic beachside diner', price:'$$'},
    ],
    cams: ['https://www.805webcams.com'],
    bus: {route:'RTA Route 12', fare:1.75, freq:'Limited'},
    sunrise: '6:44 AM', sunset: '7:31 PM',
  },
  {
    id: 'cambria', name: 'Cambria', emoji: '🌲', drive: '55 min', miles: 35,
    vibe: 'Artist colony, wild coast', rating: 'Fair', surf: '3-5 ft',
    wind: 'NW winds, rough', water: '54°F', uv: 4, tide: 'Outgoing',
    color: '#06b6d4', coords: [-121.1025, 35.5641],
    parking: [
      {name:'Moonstone Beach Lot', cost:'Free', status:'Open'},
      {name:'Santa Rosa Creek Lot', cost:'Free', status:'Open'},
    ],
    trails: [
      {name:'Moonstone Beach Boardwalk', dist:'1.5 mi', diff:'Easy', dogs:true, notes:'Dramatic rocky coast, great for tidepooling'},
      {name:'Fiscalini Ranch Preserve', dist:'4 mi loop', diff:'Moderate', dogs:true, notes:'Old growth Monterey pines and coastal bluffs'},
    ],
    rentals: [
      {name:'Limited local rentals - bring your own', type:'', price:'', link:''},
    ],
    eat: [
      {name:'Robin\'s Restaurant', vibe:'World cuisine, local legend', price:'$$$'},
      {name:'Linn\'s Restaurant', vibe:'Famous for ollalieberry pie', price:'$$'},
      {name:'Wild Ginger Cafe', vibe:'Asian fusion', price:'$$'},
    ],
    cams: ['https://www.805webcams.com'],
    bus: {route:'RTA Route 12 (limited)', fare:2.00, freq:'Very limited'},
    sunrise: '6:45 AM', sunset: '7:32 PM',
  },
  {
    id: 'oceano', name: 'Oceano Dunes', emoji: '🏜', drive: '18 min', miles: 13,
    vibe: 'OHV dunes, wide open beach', rating: 'Fair', surf: '2-3 ft',
    wind: 'NW onshore', water: '57°F', uv: 7, tide: 'Outgoing',
    color: '#f59e0b', coords: [-120.6214, 35.1052],
    parking: [
      {name:'Oceano SVRA Day Use', cost:'$5/day', status:'Open'},
      {name:'Pismo State Beach', cost:'$10/day', status:'Open'},
    ],
    trails: [
      {name:'Oso Flaco Lake Trail', dist:'2.5 mi RT', diff:'Easy', dogs:false, notes:'Freshwater lake through sand dunes to ocean'},
      {name:'Oceano Dunes SVRA Walk', dist:'Variable', diff:'Easy', dogs:true, notes:'Drive or walk on beach — 5 miles of open sand'},
    ],
    rentals: [
      {name:'Arnie\'s ATV Rentals', type:'OHV/ATV rentals', price:'$50/hr', link:''},
      {name:'Steve\'s ATV Rentals', type:'Quads & bikes', price:'$45/hr', link:''},
    ],
    eat: [
      {name:'Oceano Depot', vibe:'Historic train depot restaurant', price:'$$'},
      {name:'Mango Mango', vibe:'Tropical smoothies & bowls', price:'$'},
    ],
    cams: ['https://www.805webcams.com'],
    bus: {route:'Route 10 - Oceano', fare:1.50, freq:'Hourly'},
    sunrise: '6:42 AM', sunset: '7:28 PM',
  },
  {
    id: 'mdo', name: 'Montana de Oro', emoji: '🌿', drive: '40 min', miles: 16,
    vibe: 'Wild untouched coastline', rating: 'Poor', surf: '4-7 ft',
    wind: 'Strong NW', water: '54°F', uv: 4, tide: 'Outgoing',
    color: '#22c55e', coords: [-120.8894, 35.2659],
    parking: [
      {name:'Spooners Cove Lot', cost:'Free', status:'Open'},
      {name:'Hazard Canyon Lot', cost:'Free', status:'Open'},
      {name:'Bluff Trail Lot', cost:'Free', status:'Open'},
    ],
    trails: [
      {name:'Bluff Trail', dist:'3 mi RT', diff:'Easy', dogs:true, notes:'Most dramatic coastal scenery in SLO County'},
      {name:'Valencia Peak', dist:'4 mi RT', diff:'Hard', dogs:true, notes:'1347ft — 360 degree views on clear day'},
      {name:'Hazard Canyon Reef', dist:'1 mi RT', diff:'Easy', dogs:true, notes:'Excellent tide pools at low tide'},
      {name:'Dune Trail', dist:'2 mi loop', diff:'Easy', dogs:true, notes:'Sand dunes through beach scrub'},
    ],
    rentals: [
      {name:'No rentals on site — self-contained trip', type:'', price:'', link:''},
    ],
    eat: [
      {name:'No food on site — bring your own', vibe:'Pack a lunch', price:''},
      {name:'Nearest food in Los Osos (5 min)', vibe:'Small town diners', price:'$'},
    ],
    cams: ['https://www.805webcams.com'],
    bus: {route:'No direct bus — drive only', fare:0, freq:'None'},
    sunrise: '6:44 AM', sunset: '7:30 PM',
  },
];

// ── OPEN BEACH HUB (beach selector) ──
function openBeachHub() {
  var existing = document.getElementById('mh-Beachhub');
  if (existing) existing.remove();

  // Show spot picker on map, then open hub
  if (typeof hubShowSpotPicker === 'function') {
    var _spots = (typeof BEACH_DATA !== 'undefined' ? BEACH_DATA : [])
      .filter(function(s) { return s.coords; })
      .map(function(s) { return { id: s.id || s.name, name: s.name, emoji: s.emoji || '🏖', coords: s.coords, meta: s.difficulty || s.type || '' }; });
    hubShowSpotPicker(_spots, '#06b6d4', '🏖 Beach Hub',
      function() {
        // Sort by proximity if user tapped a spot
        if (window._findHubsUserCenter && typeof sortByProximity === 'function') {
          _spots = sortByProximity(_spots, window._findHubsUserCenter[0], window._findHubsUserCenter[1]);
        }
        openBeachHub('_open');
      }
    );
    if (arguments[0] !== '_open') return;
  }




  var sheet = document.createElement('div');
  sheet.id = 'mh-beach-hub';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px)';

  var ratingColor = {Good:'#22c55e', Fair:'#f59e0b', Poor:'#ef4444'};

  sheet.innerHTML =
    '<div id="mh-bh-inner" style="width:100%;background:linear-gradient(180deg,rgba(2,15,25,0.99),rgba(4,20,35,0.99));border-radius:24px 24px 0 0;border-top:2px solid rgba(6,182,212,0.3);padding:12px 20px 48px;max-height:88vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +'<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);flex:1"></div>' +'<button onclick="menuHomeCloseBeachHub()" style="background:rgba(255,255,255,0.1);border:none;color:rgba(255,255,255,0.6);width:30px;height:30px;border-radius:50%;font-size:14px;cursor:pointer;margin-left:8px">✕</button>' +'</div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
        '<div style="font-size:22px;font-weight:800;font-family:Georgia,serif;color:white">🏖 Beach Hub</div>' +
        '<div style="font-size:11px;color:rgba(6,182,212,0.7);font-weight:700">CENTRAL COAST</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px">Choose a beach to see conditions, trails, parking & more</div>' +

      // Quick filter row
      '<div style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;margin-bottom:16px;scrollbar-width:none">' +
        '<button class="mh-bh-filter active" onclick="menuHomeBhFilter(this,\'all\')">All</button>' +
        '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'close\')">Closest</button>' +
        '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'good\')">🟢 Good surf</button>' +
        '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'dogs\')">🐕 Dog friendly</button>' +
        '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'trails\')">🥾 Trails</button>' +
      '</div>' +

      '<div id="mh-bh-beach-list">' +
        BEACHES.map(function(b) {
          var rc = ratingColor[b.rating] || 'rgba(255,255,255,0.4)';
          return '<div class="mh-bh-card" onclick="menuHomeOpenBeach(\'' + b.id + '\')" data-id="' + b.id + '" data-rating="' + b.rating + '" data-drive="' + b.miles + '">' +
            '<div style="display:flex;align-items:center;gap:12px">' +
              '<div style="font-size:32px;flex-shrink:0">' + b.emoji + '</div>' +
              '<div style="flex:1;min-width:0">' +
                '<div style="font-size:14px;font-weight:800">' + b.name + '</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">' + b.vibe + '</div>' +
              '</div>' +
              '<div style="text-align:right;flex-shrink:0">' +
                '<div style="font-size:13px;font-weight:800;color:' + rc + '">' + b.surf + '</div>' +
                '<div style="font-size:10px;font-weight:700;color:' + rc + '">' + b.rating + '</div>' +
                '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:1px">🚗 ' + b.drive + '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';

  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-bh-inner').style.transform = 'translateY(0)';
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) menuHomeCloseBeachHub(); });

  // Inject beach hub CSS once
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
    ].join('');
    document.head.appendChild(s);
  }
}
window.menuHomeOpenBeachHub = openBeachHub;

function closeBeachHub() {
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

// ── INDIVIDUAL BEACH HUB ──
function openBeach(id) {
  var beach = null;
  for (var i = 0; i < BEACHES.length; i++) { if (BEACHES[i].id === id) { beach = BEACHES[i]; break; } }
  if (!beach) return;

  // Fly map to beach
  if (homeMap) {
    try {
      homeMap.flyTo({ center: beach.coords, zoom: 14, pitch: 50, bearing: 0, duration: 1200 });
    } catch(e) {}
  }

  // Close selector, open beach hub
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

