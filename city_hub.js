// ══════════════════════════════════════════════
// CITY_HUB.JS — SLO City Hub
// Landmarks · Culture · Art · Must-See
// ══════════════════════════════════════════════

var CITY_SPOTS = [
  {
    id: 'mission',
    name: 'Mission San Luis Obispo de Tolosa',
    emoji: '⛪',
    category: 'landmark',
    free: true,
    address: '751 Palm St',
    coords: [-120.6642, 35.2797],
    desc: 'Founded in 1772 by Father Junipero Serra. The mission that gave SLO its name. The surrounding Mission Plaza hosts concerts, wine tastings, and community events year-round.',
    tip: 'Free to walk the grounds and gardens. Small donation requested for the museum inside. The plaza benches are the best free seat in downtown.',
    tags: ['Historic', 'Free', 'Gardens'],
  },
  {
    id: 'bubblegum_alley',
    name: 'Bubblegum Alley',
    emoji: '🫧',
    category: 'weird',
    free: true,
    address: '733 Higuera St (between Broad & Garden)',
    coords: [-120.6648, 35.2806],
    desc: '70-foot alley completely covered in chewed gum since the 1950s. Equal parts disgusting and iconic. A SLO rite of passage — grab a gumball at Rocket Fizz and add your mark.',
    tip: 'Open 24/7. Best photos in daylight. Do NOT touch your face after. The wall has been growing for 70+ years and has been featured on The Tonight Show.',
    tags: ['Iconic', 'Free', '24/7'],
  },
  {
    id: 'slo_museum_art',
    name: 'SLO Museum of Art',
    emoji: '🖼',
    category: 'museum',
    free: true,
    address: '1010 Broad St',
    coords: [-120.6630, 35.2797],
    desc: 'The cultural heart of the Central Coast. Contemporary California artists, rotating exhibits, art classes, and lectures. Free admission — one of SLO\'s best kept secrets.',
    tip: 'Free suggested donation. Art After Dark events quarterly on Friday evenings — galleries open late, free wine, live music. Check their calendar.',
    tags: ['Free', 'Art', 'Local Culture'],
  },
  {
    id: 'fremont_theater',
    name: 'Fremont Theater',
    emoji: '🎭',
    category: 'venue',
    free: false,
    address: '1035 Monterey St',
    coords: [-120.6648, 35.2813],
    desc: 'Art deco masterpiece built in 1942. 950-seat intimate venue for live music, comedy, and events. The neon sign is one of the most photographed spots in SLO.',
    tip: 'Even if you\'re not seeing a show, walk past at night for the neon sign photo. The box office is open day-of for remaining tickets.',
    tags: ['Live Music', 'Historic', 'Iconic'],
  },
  {
    id: 'higuera_street',
    name: 'Higuera Street',
    emoji: '🌆',
    category: 'street',
    free: true,
    address: 'Higuera St, Downtown SLO',
    coords: [-120.6650, 35.2800],
    desc: 'The spine of downtown SLO. Bars, restaurants, boutiques, and street life from Garden to Nipomo. Shuts down every Thursday night for Farmers Market. The place to be.',
    tip: 'Parking structures on Palm and Marsh are free after 5pm. The whole strip is walkable in 10 minutes but you\'ll spend hours if you let yourself.',
    tags: ['Walkable', 'Nightlife', 'Shopping'],
  },
  {
    id: 'san_luis_creek',
    name: 'San Luis Obispo Creek',
    emoji: '🌿',
    category: 'nature',
    free: true,
    address: 'Creek Walk, Downtown SLO',
    coords: [-120.6655, 35.2810],
    desc: 'A hidden gem running right through downtown. The creekside path connects Novo\'s patio, Mission Plaza, and the natural corridor of oaks and willows. Surprisingly peaceful.',
    tip: 'Best walked in the morning before the bars open. Look for herons and ducks. Novo Restaurant has the best creek views in the city — worth a drink just for the patio.',
    tags: ['Free', 'Peaceful', 'Hidden Gem'],
  },
  {
    id: 'madonna_inn',
    name: 'Madonna Inn',
    emoji: '🏰',
    category: 'landmark',
    free: false,
    address: '100 Madonna Rd',
    coords: [-120.6820, 35.2640],
    desc: '110 uniquely themed rooms — no two alike. The pink steakhouse, the cave-themed dining room, the waterfall urinal in the men\'s room. An American original. Worth a visit even without staying.',
    tip: 'You can walk in and explore the lobby, gift shop, and restaurant without staying. The Gold Rush Steak House is worth a special dinner. Genuinely one of a kind.',
    tags: ['Iconic', 'Unique', 'Must See'],
  },
  {
    id: 'slo_childrens_museum',
    name: 'SLO Children\'s Museum',
    emoji: '🧒',
    category: 'museum',
    free: false,
    address: '1010 Nipomo St',
    coords: [-120.6620, 35.2785],
    desc: 'Hands-on interactive museum for families. One of the top family attractions in California — inventive exhibits and creative programs for kids of all ages.',
    tip: 'Check their event calendar for special programs. Free for kids under 1. Great for families visiting SLO who need to keep kids entertained.',
    tags: ['Families', 'Kids', 'Interactive'],
  },
  {
    id: 'palm_theatre',
    name: 'Palm Theatre',
    emoji: '🎬',
    category: 'venue',
    free: false,
    address: '817 Palm St',
    coords: [-120.6635, 35.2793],
    desc: 'First solar-powered movie theater in the US. Independent, arthouse, and foreign films. SLO\'s answer to multiplex culture — intimate, smart, and community-run.',
    tip: 'SLO Film Festival screens here every April — biggest cultural event of the year. Check their calendar for cult classics and indie premieres.',
    tags: ['Film', 'Independent', 'Local'],
  },
  {
    id: 'ah_louis_store',
    name: 'Ah Louis Store',
    emoji: '🏛',
    category: 'landmark',
    free: true,
    address: '800 Palm St',
    coords: [-120.6630, 35.2793],
    desc: 'Built in 1874, the oldest brick store in SLO. Originally a general store serving Chinese railroad workers. Now a historic landmark — SLO\'s tiny Chinatown and a window into forgotten history.',
    tip: 'Exterior only to view. Best paired with the VoiceMap Downtown SLO audio tour which tells the full story of this block and its history.',
    tags: ['Free', 'Historic', 'Hidden History'],
  },
];

var CITY_CATEGORIES = [
  { id: 'all',      label: 'All',      emoji: '🏙' },
  { id: 'landmark', label: 'Landmarks', emoji: '📍' },
  { id: 'museum',   label: 'Museums',  emoji: '🖼' },
  { id: 'weird',    label: 'Weird',    emoji: '🫧' },
  { id: 'venue',    label: 'Venues',   emoji: '🎭' },
  { id: 'free',     label: 'Free',     emoji: '🆓' },
];

function openCityHub() {
  var existing = document.getElementById('mh-Cityhub');
  if (existing) existing.remove();

  // Show spot picker on map, then open hub
  if (typeof hubShowSpotPicker === 'function') {
    var _spots = (typeof CITY_SPOTS !== 'undefined' ? CITY_SPOTS : [])
      .filter(function(s) { return s.coords; })
      .map(function(s) { return { id: s.id || s.name, name: s.name, emoji: s.emoji || '🏛', coords: s.coords, meta: s.difficulty || s.type || '' }; });
    hubShowSpotPicker(_spots, '#00f5ff', '🏛 City Hub',
      function() {
        // Sort by proximity if user tapped a spot
        if (window._findHubsUserCenter && typeof sortByProximity === 'function') {
          _spots = sortByProximity(_spots, window._findHubsUserCenter[0], window._findHubsUserCenter[1]);
        }
        openCityHub('_open');
      }
    );
    if (arguments[0] !== '_open') return;
  }




  if (!document.getElementById('city-hub-css')) {
    var s = document.createElement('style');
    s.id = 'city-hub-css';
    s.textContent = [
      '.city-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(0,245,255,0.2);background:rgba(0,245,255,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.city-filter.active{background:rgba(0,245,255,0.12);border-color:#00f5ff;color:#00f5ff}',
      '.city-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.city-card:active{background:rgba(0,245,255,0.05);transform:scale(0.98)}',
      '.city-tag{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.15);color:rgba(0,245,255,0.7)}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-city-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseCityHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🏛 City Hub</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Landmarks · Culture · Art · ' + CITY_SPOTS.length + ' spots</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseCityHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        CITY_CATEGORIES.map(function(c,i) {
          return '<button class="city-filter' + (i===0?' active':'') + '" onclick="cityFilter(this,\'' + c.id + '\')">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="city-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      cityRenderList(CITY_SPOTS) +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
}
window.menuHomeOpenCityHub = openCityHub;

function closeCityHub() {
  hubDeactivateMapMode();
  var h = document.getElementById('mh-city-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseCityHub = closeCityHub;

function cityFilter(el, catId) {
  document.querySelectorAll('.city-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var filtered = catId === 'all' ? CITY_SPOTS :
    catId === 'free' ? CITY_SPOTS.filter(function(s) { return s.free; }) :
    CITY_SPOTS.filter(function(s) { return s.category === catId; });
  document.getElementById('city-content').innerHTML = cityRenderList(filtered);
}
window.cityFilter = cityFilter;

function cityRenderList(spots) {
  if (!spots.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No spots in this category</div>';
  return spots.map(function(s) {
    return '<div class="city-card" onclick="cityOpenDetail(\'' + s.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="font-size:26px;flex-shrink:0">' + s.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:1px">' + s.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + s.address + '</div>' +
        '</div>' +
        (s.free ? '<span class="city-tag" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.2);color:#22c55e">Free</span>' : '') +
      '</div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        s.tags.map(function(t) { return '<span class="city-tag">' + t + '</span>'; }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

function cityOpenDetail(id) {
  var s = CITY_SPOTS.find(function(x) { return x.id === id; });
  if (!s) return;
  var existing = document.getElementById('mh-city-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-city-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(0,245,255,0.2);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="document.getElementById(\'mh-city-detail\').remove()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + s.emoji + '</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + s.name + '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:14px">' + s.address + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:14px">' + s.desc + '</div>' +
    '<div style="padding:12px;background:rgba(0,245,255,0.04);border:1px solid rgba(0,245,255,0.12);border-radius:12px;margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:#00f5ff;margin-bottom:4px">💡 LOCAL TIP</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + s.tip + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">' +
      s.tags.map(function(t) { return '<span class="city-tag">' + t + '</span>'; }).join('') +
      (s.free ? '<span class="city-tag" style="background:rgba(34,197,94,0.1);border-color:rgba(34,197,94,0.2);color:#22c55e">Free Entry</span>' : '') +
    '</div>' +
    '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(s.address + ' San Luis Obispo CA') + '" target="_blank" style="display:block;width:100%;padding:13px;border-radius:14px;background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.2);color:#00f5ff;text-decoration:none;font-size:13px;font-weight:800;text-align:center">Get Directions ↗</a>';

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
    if (homeMap && s.coords) {
      try { homeMap.flyTo({ center: s.coords, zoom: 16, duration: 800 }); } catch(e) {}
    }
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.cityOpenDetail = cityOpenDetail;
