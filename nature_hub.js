// ══════════════════════════════════════════════
// NATURE_HUB.JS — SLO Nature & Outdoors Hub
// Hiking, parks, trails, wildlife
// ══════════════════════════════════════════════

var NATURE_SPOTS = [
  {
    id: 'bishop_peak',
    name: 'Bishop Peak',
    emoji: '⛰️',
    category: 'hike',
    difficulty: 'Moderate',
    distance: '4.4 mi roundtrip',
    elevation: '1,200 ft gain',
    drive: '10 min from downtown',
    coords: [-120.6785, 35.2920],
    tip: 'Start at Patricia Drive trailhead. Go early — gets crowded by 9am. 360° views of SLO, Morro Bay and the Pacific.',
    dog_friendly: true,
    free: true,
    highlights: ['Nine Sisters volcanic peak','Panoramic summit views','Multiple trailheads'],
    best_for: ['Views','Workout','Sunrise/Sunset'],
  },
  {
    id: 'cerro_san_luis',
    name: 'Cerro San Luis (The M)',
    emoji: '🏔',
    category: 'hike',
    difficulty: 'Moderate',
    distance: '4.3 mi loop',
    elevation: '1,100 ft gain',
    drive: '5 min from downtown',
    coords: [-120.6698, 35.2756],
    tip: 'Trailhead at Fernandez Lane — walkable from downtown. Hike to the iconic M on the hillside. Views of the city are stunning at dusk.',
    dog_friendly: true,
    free: true,
    highlights: ['Iconic M landmark','Downtown views','Dog friendly'],
    best_for: ['Locals favorite','Quick hike','Sunset'],
  },
  {
    id: 'montana_de_oro',
    name: 'Montaña de Oro',
    emoji: '🌊',
    category: 'park',
    difficulty: 'Easy to Hard',
    distance: 'Multiple trails',
    elevation: 'Varies',
    drive: '20 min from downtown',
    coords: [-120.8760, 35.2645],
    tip: 'The crown jewel of SLO nature. Bluffs Trail for coastal views, Valencia Peak for serious hikers, Coon Creek for shade on hot days. Free entry.',
    dog_friendly: true,
    free: true,
    highlights: ['Ocean bluffs','9 major trails','Wildflowers in spring','Tide pools'],
    best_for: ['All skill levels','Photography','Families'],
  },
  {
    id: 'reservoir_canyon',
    name: 'Reservoir Canyon',
    emoji: '🔔',
    category: 'hike',
    difficulty: 'Strenuous',
    distance: '5.35 mi out & back',
    elevation: '1,350 ft gain',
    drive: '10 min from downtown',
    coords: [-120.6420, 35.2950],
    tip: 'Summit has an old bell tower you can ring with a pebble. Waterfall in winter. 360° panoramic view is worth every step of that last brutal mile.',
    dog_friendly: true,
    free: true,
    highlights: ['Bell tower summit','Panoramic views','Waterfall (seasonal)','Oak groves'],
    best_for: ['Challenge seekers','Photographers','Locals'],
  },
  {
    id: 'laguna_lake',
    name: 'Laguna Lake Park',
    emoji: '🦆',
    category: 'park',
    difficulty: 'Easy',
    distance: '2.3 mi loop',
    elevation: 'Minimal',
    drive: '5 min from downtown',
    coords: [-120.6950, 35.2760],
    tip: 'Perfect for a relaxed morning. Diverse ecosystems, great birdwatching. Bring bread for the ducks. Easy enough for all ages.',
    dog_friendly: true,
    free: true,
    highlights: ['Lakeside loop','Birdwatching','Family friendly','Dog park nearby'],
    best_for: ['Families','Easy walks','Birdwatching'],
  },
  {
    id: 'johnson_ranch',
    name: 'Johnson Ranch Open Space',
    emoji: '🌿',
    category: 'hike',
    difficulty: 'Easy-Moderate',
    distance: '3.5 mi',
    elevation: '725 ft gain',
    drive: '10 min from downtown',
    coords: [-120.7050, 35.2600],
    tip: 'Shared hiking and biking trails. Lush greenery, shady tree at the summit with swings. Hidden gem — much less crowded than Bishop Peak.',
    dog_friendly: true,
    free: true,
    highlights: ['Summit swing','Shaded trails','Bike friendly','Hidden gem'],
    best_for: ['Families','Mountain bikers','Quiet hike'],
  },
  {
    id: 'irish_hills',
    name: 'Irish Hills Natural Reserve',
    emoji: '☘️',
    category: 'hike',
    difficulty: 'Moderate',
    distance: 'Multiple loops',
    elevation: 'Varies',
    drive: '15 min from downtown',
    coords: [-120.7200, 35.2700],
    tip: 'Old mining roads, stream crossings, gorgeous views of San Luis Valley. Mountain bikers love this one. Go after rain for the creeks.',
    dog_friendly: true,
    free: true,
    highlights: ['Valley views','Stream crossings','Mountain biking','Wildlife'],
    best_for: ['Mountain bikers','Trail runners','Wildlife spotting'],
  },
  {
    id: 'bob_jones_trail',
    name: 'Bob Jones City-to-Sea Trail',
    emoji: '🚴',
    category: 'trail',
    difficulty: 'Easy',
    distance: '8 mi one way',
    elevation: 'Flat',
    drive: 'Starts near downtown',
    coords: [-120.6500, 35.2580],
    tip: 'Flat paved trail from SLO to Avila Beach. Perfect for bikes, joggers, strollers. Ends at the beach — bring a cooler and make a day of it.',
    dog_friendly: true,
    free: true,
    highlights: ['Beach destination','Bike/run/walk','Farmland and oaks','Creek views'],
    best_for: ['Cyclists','Families','Beach day'],
  },
  {
    id: 'morro_bay',
    name: 'Morro Bay State Park',
    emoji: '🦅',
    category: 'park',
    difficulty: 'Easy',
    distance: 'Various',
    elevation: 'Minimal',
    drive: '25 min from downtown',
    coords: [-120.8450, 35.3640],
    tip: 'Morro Rock is iconic. Kayak rentals available at the harbor. World-class birdwatching — great blue herons, pelicans, otters. Black Hill hike for views.',
    dog_friendly: true,
    free: true,
    highlights: ['Morro Rock','Kayaking','Birdwatching','Sea otters'],
    best_for: ['Kayakers','Birdwatchers','Day trips'],
  },
  {
    id: 'avila_hot_springs',
    name: 'Avila Hot Springs',
    emoji: '♨️',
    category: 'wellness',
    difficulty: 'None',
    distance: 'N/A',
    elevation: 'N/A',
    drive: '15 min from downtown',
    coords: [-120.7290, 35.1890],
    tip: 'Natural mineral hot springs. Outdoor pool, slides, camping. Perfect after a hard hike. $12-15 entry. Cash or card.',
    dog_friendly: false,
    free: false,
    price: '$12-15',
    highlights: ['Natural hot springs','Waterslides','Camping','Post-hike recovery'],
    best_for: ['Post-hike soak','Couples','Camping'],
  },
];

var NATURE_CATEGORIES = [
  { id:'all',      label:'All',      emoji:'🌿' },
  { id:'hike',     label:'Hikes',    emoji:'⛰️' },
  { id:'park',     label:'Parks',    emoji:'🌳' },
  { id:'trail',    label:'Trails',   emoji:'🚴' },
  { id:'wellness', label:'Wellness', emoji:'♨️' },
  { id:'easy',     label:'Easy',     emoji:'😊' },
  { id:'hard',     label:'Challenge',emoji:'💪' },
];

function openNatureHub() {
  var existing = document.getElementById('mh-nature-hub');
  if (existing) existing.remove();

  if (!document.getElementById('nature-hub-css')) {
    var s = document.createElement('style');
    s.id = 'nature-hub-css';
    s.textContent = [
      '.nature-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(34,197,94,0.2);background:rgba(34,197,94,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.nature-filter.active{background:rgba(34,197,94,0.15);border-color:#22c55e;color:#22c55e}',
      '.nature-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.nature-card:active{background:rgba(34,197,94,0.06);transform:scale(0.98)}',
      '.nature-badge{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e}',
      '.nature-badge.mod{background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.2);color:#f59e0b}',
      '.nature-badge.hard{background:rgba(239,68,68,0.1);border-color:rgba(239,68,68,0.2);color:#ef4444}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-nature-hub';
  hub.style.cssText = 'position:absolute;inset:0;z-index:22;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseNatureHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🌿 Nature Hub</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Hikes · Parks · Trails · ' + NATURE_SPOTS.length + ' spots</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseNatureHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        NATURE_CATEGORIES.map(function(f,i) {
          return '<button class="nature-filter' + (i===0?' active':'') + '" onclick="natureFilter(this,\'' + f.id + '\')" data-id="' + f.id + '">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="nature-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      natureRenderList(NATURE_SPOTS) +
    '</div>';

  document.getElementById('menu-home').appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);

  // If opened via Find Hubs, sort nearest spots first
  if (window._findHubsUserCenter) {
    var uLat = window._findHubsUserCenter[0];
    var uLng = window._findHubsUserCenter[1];
    var sorted = NATURE_SPOTS.slice().sort(function(a, b) {
      if (!a.coords || !b.coords) return 0;
      var da = typeof geoDistance === 'function' ? geoDistance(uLat, uLng, a.coords[1], a.coords[0]) : 0;
      var db = typeof geoDistance === 'function' ? geoDistance(uLat, uLng, b.coords[1], b.coords[0]) : 0;
      return da - db;
    });
    var _cEl = document.getElementById('nature-content');
    if (_cEl) _cEl.innerHTML = natureRenderList(sorted);
    window._findHubsUserCenter = null;
  }
}
window.menuHomeOpenNatureHub = openNatureHub;

function closeNatureHub() {
  var h = document.getElementById('mh-nature-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseNatureHub = closeNatureHub;

function natureFilter(el, filterId) {
  document.querySelectorAll('.nature-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var filtered = NATURE_SPOTS;
  if (filterId === 'hike')     filtered = NATURE_SPOTS.filter(function(s) { return s.category === 'hike'; });
  if (filterId === 'park')     filtered = NATURE_SPOTS.filter(function(s) { return s.category === 'park'; });
  if (filterId === 'trail')    filtered = NATURE_SPOTS.filter(function(s) { return s.category === 'trail'; });
  if (filterId === 'wellness') filtered = NATURE_SPOTS.filter(function(s) { return s.category === 'wellness'; });
  if (filterId === 'easy')     filtered = NATURE_SPOTS.filter(function(s) { return /easy/i.test(s.difficulty); });
  if (filterId === 'hard')     filtered = NATURE_SPOTS.filter(function(s) { return /stren|hard/i.test(s.difficulty); });
  var content = document.getElementById('nature-content');
  if (content) content.innerHTML = natureRenderList(filtered);
}
window.natureFilter = natureFilter;

function natureRenderList(spots) {
  if (!spots.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No spots in this category</div>';
  return spots.map(function(s) {
    var diffColor = /easy/i.test(s.difficulty) ? '#22c55e' : /mod/i.test(s.difficulty) ? '#f59e0b' : '#ef4444';
    var diffClass = /easy/i.test(s.difficulty) ? '' : /mod/i.test(s.difficulty) ? ' mod' : ' hard';
    return '<div class="nature-card" onclick="natureOpenDetail(\'' + s.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div style="font-size:28px;flex-shrink:0">' + s.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + s.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45)">' + s.distance + ' · ' + s.drive + '</div>' +
        '</div>' +
        '<span class="nature-badge' + diffClass + '">' + s.difficulty.split(' ')[0] + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        s.best_for.slice(0,3).map(function(t) {
          return '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.15);color:rgba(34,197,94,0.7)">' + t + '</span>';
        }).join('') +
        (s.dog_friendly ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.4)">🐕 Dogs OK</span>' : '') +
        (s.free ? '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.15);color:#22c55e">Free</span>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function natureOpenDetail(id) {
  var s = NATURE_SPOTS.find(function(x) { return x.id === id; });
  if (!s) return;
  var existing = document.getElementById('mh-nature-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-nature-detail';
  sheet.style.cssText = 'position:absolute;inset:0;z-index:24;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  sheet.innerHTML =
    '<div id="mh-nd-inner" style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(34,197,94,0.25);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="document.getElementById(\'mh-nature-detail\').remove()"></div>' +
      '<div style="font-size:36px;margin-bottom:8px">' + s.emoji + '</div>' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + s.name + '</div>' +

      // Stats row
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
          '<div style="font-size:12px;font-weight:800">' + s.distance + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">DISTANCE</div>' +
        '</div>' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
          '<div style="font-size:12px;font-weight:800">' + (s.elevation || 'N/A') + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">ELEVATION</div>' +
        '</div>' +
        '<div style="padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;text-align:center">' +
          '<div style="font-size:12px;font-weight:800">' + s.drive + '</div>' +
          '<div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px">FROM SLO</div>' +
        '</div>' +
      '</div>' +

      // Tip
      '<div style="padding:12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:12px;margin-bottom:14px">' +
        '<div style="font-size:11px;font-weight:700;color:#22c55e;margin-bottom:4px">💡 Local tip</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + s.tip + '</div>' +
      '</div>' +

      // Highlights
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' +
        s.highlights.map(function(h) {
          return '<span style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e">' + h + '</span>';
        }).join('') +
      '</div>' +

      '<div style="display:flex;gap:8px">' +
        '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(s.name + ' San Luis Obispo CA') + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#22c55e;text-decoration:none;font-size:12px;font-weight:800;text-align:center">Get Directions ↗</a>' +
        '<a href="https://www.alltrails.com/search?q=' + encodeURIComponent(s.name) + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);text-decoration:none;font-size:12px;font-weight:800;text-align:center">AllTrails ↗</a>' +
      '</div>' +
    '</div>';

  document.getElementById('menu-home').appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-nd-inner').style.transform = 'translateY(0)';
    if (homeMap && s.coords) {
      try { homeMap.flyTo({ center: s.coords, zoom: 13, duration: 800 }); } catch(e) {}
    }
  }, 30);
  sheet.addEventListener('click', function(e) { if(e.target===sheet) sheet.remove(); });
}
window.natureOpenDetail = natureOpenDetail;
