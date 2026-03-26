// ══════════════════════════════════════════════
// THRILL_HUB.JS — SLO Adventure & Thrill Hub
// Ziplines, ATVs, skydiving, watersports
// ══════════════════════════════════════════════

var THRILL_SPOTS = [
  {
    id: 'margarita_adventures',
    name: 'Margarita Adventures',
    emoji: '🪂',
    category: 'zipline',
    price: '$89-129',
    drive: '20 min from SLO',
    duration: '3-4 hours',
    coords: [-120.6000, 35.4000],
    phone: '(805) 438-3850',
    website: 'margaritaadventures.com',
    tip: 'Six ziplines over 7,500 feet of cable, up to 400 feet in the air. Add the Zip \'n Sip package for wine tasting at Ancient Peaks after. Book ahead — sells out on weekends.',
    highlights: ['6 ziplines','Canyon suspension bridge','Wine tasting add-on','Guided tour of the ranch'],
    thrill_level: 4,
    best_for: ['Groups','Dates','Bucket list'],
    booking_required: true,
  },
  {
    id: 'vista_lago',
    name: 'Vista Lago Adventure Park',
    emoji: '🧗',
    category: 'adventure_park',
    price: '$59-69',
    drive: '20 min (Lopez Lake)',
    duration: '2-4 hours',
    coords: [-120.5600, 35.1800],
    phone: null,
    website: 'vistalagoadventurepark.com',
    tip: '3 ziplines totaling 1,800+ feet including a 40-foot free fall QuickJump. Plus 40-obstacle ropes course. Great for groups. Go All Access ($69) — worth it for bragging rights.',
    highlights: ['High-speed ziplines','40-ft free fall jump','50+ obstacle course','Wine barrel bridge'],
    thrill_level: 5,
    best_for: ['Thrill seekers','Groups','Families (5+)'],
    booking_required: true,
  },
  {
    id: 'banner_airways',
    name: 'Banner Airways Biplane Rides',
    emoji: '✈️',
    category: 'air',
    price: '$100-200+',
    drive: '30 min (Pismo Beach Airport)',
    duration: '15-30 min flights',
    coords: [-120.6230, 35.1420],
    phone: null,
    website: 'bannerairways.com',
    tip: 'Open cockpit WWII biplane over Pismo Beach and the Oceano Dunes. Top Gun vibes, zero training required. One of the most unique experiences on the Central Coast.',
    highlights: ['Open cockpit WWII biplane','Pismo Beach aerial views','Oceano Dunes tour','Multiple route options'],
    thrill_level: 3,
    best_for: ['Unique experience','Dates','Photography'],
    booking_required: true,
  },
  {
    id: 'wingEnvy',
    name: 'WingEnvy Paragliding',
    emoji: '🪂',
    category: 'air',
    price: '$175-225',
    drive: '30 min (Cayucos)',
    duration: '15-20 min flight',
    coords: [-120.8950, 35.4430],
    phone: null,
    website: 'wingenvyparagliding.com',
    tip: 'Tandem paragliding — launch off a 700ft mountain and land on Cayucos beach. Zero experience needed. Less intense than skydiving but genuinely exhilarating. Stunning coastal views.',
    highlights: ['700ft launch point','Beach landing','Tandem — no experience needed','Coastal views'],
    thrill_level: 4,
    best_for: ['Adventure seekers','Couples','First-timers'],
    booking_required: true,
  },
  {
    id: 'oceano_atv',
    name: 'Steve\'s ATV Rentals',
    emoji: '🏍',
    category: 'atv',
    price: '$50-80/hr',
    drive: '30 min (Oceano Dunes)',
    duration: 'By the hour',
    coords: [-120.6200, 35.0900],
    phone: '(805) 481-0597',
    website: null,
    tip: 'Rent ATVs and rip through the Oceano Dunes SVRA — the only coastal dunes open to vehicles in California. Go at sunset for golden hour views across the dunes and ocean.',
    highlights: ['Only CA coastal dune park','Sunset rides','Multiple rental sizes','Family friendly'],
    thrill_level: 3,
    best_for: ['Groups','Sunset rides','Families'],
    booking_required: false,
  },
  {
    id: 'central_coast_kayaks',
    name: 'Central Coast Kayaks',
    emoji: '🛶',
    category: 'water',
    price: '$25-65',
    drive: '30 min (Avila Beach)',
    duration: '1-5 hours',
    coords: [-120.7320, 35.1800],
    phone: '(805) 773-3500',
    website: 'centralcoastkayaks.com',
    tip: 'Kayak tours of sea caves, dinosaur caves at Pismo, and open ocean wildlife. Sea otters, dolphins, elephant seals. 5-hour ocean discovery tour is the real deal.',
    highlights: ['Sea cave kayaking','Wildlife sightings','SUP rentals','Guided tours'],
    thrill_level: 2,
    best_for: ['Wildlife lovers','Couples','Beginners'],
    booking_required: false,
  },
  {
    id: 'surf_lessons_slo',
    name: 'SLO Surf Lessons',
    emoji: '🏄',
    category: 'water',
    price: '$75-120',
    drive: '25 min (Avila/Pismo)',
    duration: '1.5-2 hours',
    coords: [-120.7050, 35.1700],
    phone: null,
    website: null,
    tip: 'Private lessons at Avila Beach — calmer water than Pismo, perfect for beginners. Most people get up on their first lesson. Surf boards and wetsuit included.',
    highlights: ['Beginner friendly','Board & wetsuit included','Private lessons','Calm water beach'],
    thrill_level: 2,
    best_for: ['Beginners','Families','First timers'],
    booking_required: true,
  },
  {
    id: 'skydive_santa_barbara',
    name: 'Skydive Santa Barbara',
    emoji: '🪂',
    category: 'skydive',
    price: '$199-259',
    drive: '1 hr from SLO',
    duration: 'Half day',
    coords: [-120.4500, 34.8300],
    phone: '(805) 740-9099',
    website: 'skydivesantabarbara.com',
    tip: 'Closest skydiving to SLO. Tandem jump from 10,000-15,000 feet over the Central Coast. Book the video package — you\'ll want proof. Must book 48hrs in advance.',
    highlights: ['Tandem jump','Coastal views','Video available','Most popular skydive near SLO'],
    thrill_level: 5,
    best_for: ['Bucket list','Groups','Celebrations'],
    booking_required: true,
  },
  {
    id: 'horseback_slo',
    name: 'Central Coast Trailrides',
    emoji: '🐎',
    category: 'ranch',
    price: '$75-150',
    drive: '25 min',
    duration: '1-2 hours',
    coords: [-120.6300, 35.3200],
    phone: null,
    website: 'centralcoasttrailrides.com',
    tip: 'Horseback through vineyards in Paso Robles or technical mountain trails at Santa Margarita Lake. Vineyard ride + wine tasting combo is the move for groups.',
    highlights: ['Vineyard rides','Mountain trails','Wine tasting combo','Beginner friendly'],
    thrill_level: 2,
    best_for: ['Couples','Groups','Unique experience'],
    booking_required: true,
  },
];

var THRILL_CATEGORIES = [
  { id:'all',      label:'All',       emoji:'⚡' },
  { id:'zipline',  label:'Zipline',   emoji:'🪂' },
  { id:'air',      label:'Air',       emoji:'✈️' },
  { id:'water',    label:'Water',     emoji:'🌊' },
  { id:'atv',      label:'ATV/Dunes', emoji:'🏍' },
  { id:'skydive',  label:'Skydive',   emoji:'🪂' },
  { id:'ranch',    label:'Ranch',     emoji:'🐎' },
];

function openThrillHub() {
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
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Ziplines · ATVs · Skydiving · ' + THRILL_SPOTS.length + ' adventures</div>' +
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
      thrillRenderList(THRILL_SPOTS) +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);

  // If opened via Find Hubs, sort nearest spots first
  if (window._findHubsUserCenter) {
    var uLat = window._findHubsUserCenter[0];
    var uLng = window._findHubsUserCenter[1];
    var sorted = THRILL_SPOTS.slice().sort(function(a, b) {
      if (!a.coords || !b.coords) return 0;
      var da = typeof geoDistance === 'function' ? geoDistance(uLat, uLng, a.coords[1], a.coords[0]) : 0;
      var db = typeof geoDistance === 'function' ? geoDistance(uLat, uLng, b.coords[1], b.coords[0]) : 0;
      return da - db;
    });
    var _cEl = document.getElementById('thrill-content');
    if (_cEl) _cEl.innerHTML = thrillRenderList(sorted);
    window._findHubsUserCenter = null;
  }
}
window.menuHomeOpenThrillHub = openThrillHub;

function closeThrillHub() {
  hubDeactivateMapMode();
  var h = document.getElementById('mh-thrill-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseThrillHub = closeThrillHub;

function thrillFilter(el, filterId) {
  document.querySelectorAll('.thrill-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var filtered = filterId === 'all' ? THRILL_SPOTS :
    THRILL_SPOTS.filter(function(s) { return s.category === filterId; });
  var content = document.getElementById('thrill-content');
  if (content) content.innerHTML = thrillRenderList(filtered);
}
window.thrillFilter = thrillFilter;

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
          '<div style="font-size:11px;color:rgba(255,255,255,0.45)">' + s.drive + ' · ' + s.price + '</div>' +
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
  if (!s) return;
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
