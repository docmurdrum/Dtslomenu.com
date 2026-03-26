// ══════════════════════════════════════════════
// EVENTS_HUB.JS — SLO Events Hub
// Concerts · Markets · Festivals · Venues
// ══════════════════════════════════════════════

var EVENTS_VENUES = [
  {
    id: 'fremont_theater',
    name: 'Fremont Theater',
    emoji: '🎭',
    type: 'theater',
    address: '1035 Monterey St, SLO',
    coords: [-120.6648, 35.2813],
    desc: 'Art deco landmark built in 1942. SLO\'s premier live music and events venue — intimate 950-seat theater with incredible acoustics. International headliners play here regularly.',
    tip: 'Check Fremont Theater on Instagram for show announcements. Floor shows sell out fast — buy day-of-announcement.',
    website: 'fremontslo.com',
    free: false,
    recurring: false,
  },
  {
    id: 'concerts_plaza',
    name: 'Concerts in the Plaza',
    emoji: '🎵',
    type: 'concert_series',
    address: 'Mission Plaza, 989 Chorro St',
    coords: [-120.6642, 35.2797],
    desc: 'The Central Coast\'s biggest FREE concert series. Every Friday June–September at Mission Plaza. 29 years running. Local bands, dancing, drinks — pure SLO magic.',
    tip: 'Starts at 5pm with opening act, main act 6–8pm. After-parties at Libertine Brewing at 8:30pm. Bring a blanket and get there early for good grass.',
    website: 'downtownslo.com',
    free: true,
    recurring: true,
    schedule: 'Fridays June–September, 5–8pm',
  },
  {
    id: 'slo_brew',
    name: 'SLO Brew Rock',
    emoji: '🍺',
    type: 'music_venue',
    address: '736 Higuera St, SLO',
    coords: [-120.6659, 35.2815],
    desc: 'SLO\'s most active live music venue. Intimate shows, great beer, and a crowd that actually knows the music. Regional and national touring acts play here weekly.',
    tip: 'Floor is standing room for shows. Come early to grab the seated balcony if you want a view. Check their calendar — always something good on weekends.',
    website: 'slobrew.com',
    free: false,
    recurring: false,
  },
  {
    id: 'farmers_market',
    name: 'Thursday Night Farmers Market',
    emoji: '🥕',
    type: 'market',
    address: 'Higuera St (Garden to Nipomo)',
    coords: [-120.6650, 35.2800],
    desc: 'Five blocks of Higuera shut down every Thursday evening. BBQ, fresh produce, live music, street performers, and the whole SLO community. One of the best farmers markets in California.',
    tip: 'Go hungry. Tri-tip from Jaffa Cafe, kettle corn, fresh tamales, and crepes are the moves. Hits peak energy around 7pm. Free parking after 5pm in downtown structures.',
    website: 'downtownslo.com',
    free: true,
    recurring: true,
    schedule: 'Every Thursday, 6–9pm year-round',
  },
  {
    id: 'festival_mozaic',
    name: 'Festival Mozaic',
    emoji: '🎻',
    type: 'festival',
    address: 'Various SLO venues',
    coords: [-120.6600, 35.2800],
    desc: 'World-class classical music festival held every July. 25+ concerts over 10 days including chamber music, orchestral performances, and "Baroque in the Vines" at local wineries.',
    tip: 'The winery concerts sell out months ahead — book early. Free concerts at Mission Plaza during the festival week. July 17–26 annually.',
    website: 'festivalmozaic.com',
    free: false,
    recurring: true,
    schedule: 'July annually',
  },
  {
    id: 'alex_madonna_expo',
    name: 'Alex Madonna Expo Center',
    emoji: '🎪',
    type: 'expo',
    address: '100 Madonna Rd, SLO',
    coords: [-120.6820, 35.2640],
    desc: 'SLO\'s largest indoor event space. Hosts fairs, expos, home shows, and major public events. The SLO County Fair happens here every July — rides, food, livestock, concerts.',
    tip: 'SLO County Fair is the highlight — check dates in July. Parking is free. The fair grandstand has free concerts included with admission.',
    website: 'slofair.com',
    free: false,
    recurring: false,
  },
  {
    id: 'pac_cal_poly',
    name: 'Performing Arts Center',
    emoji: '🎼',
    type: 'theater',
    address: '1 Grand Ave, Cal Poly SLO',
    coords: [-120.6587, 35.2994],
    desc: 'Cal Poly\'s world-class performing arts venue. Classical, Broadway touring shows, comedy, and more. One of the finest facilities on the Central Coast.',
    tip: 'Student rush tickets available 30 min before showtime — sometimes 50% off. Check the PAC calendar for Broadway touring shows which come through regularly.',
    website: 'pac.calpoly.edu',
    free: false,
    recurring: false,
  },
  {
    id: 'barrelhouse_brewery',
    name: 'BarrelHouse Brewing Events',
    emoji: '🛢',
    type: 'music_venue',
    address: '3055 Limestone Way, SLO',
    coords: [-120.6520, 35.2750],
    desc: 'SLO\'s original outdoor brewery event space. Live music on weekends, food trucks, dog-friendly beer garden. Great vibe for an afternoon.',
    tip: 'Weekend afternoons are peak time. Food trucks vary — check their Instagram. Great spot for a group that wants beer + live music without bar cover charges.',
    website: 'barrelhousebrewing.com',
    free: true,
    recurring: true,
    schedule: 'Live music most weekends',
  },
  {
    id: 'mission_plaza',
    name: 'Mission Plaza Events',
    emoji: '⛪',
    type: 'outdoor_venue',
    address: '751 Palm St, SLO',
    coords: [-120.6642, 35.2797],
    desc: 'The heart of downtown SLO. Hosts wine tastings, art shows, holiday events, and free community gatherings throughout the year. The mission backdrop is iconic.',
    tip: 'Art After Dark happens quarterly on Friday evenings — galleries open late, free wine, community feel. Check Downtown SLO for the calendar.',
    website: 'downtownslo.com',
    free: true,
    recurring: true,
    schedule: 'Various events year-round',
  },
  {
    id: 'libertine_brewing',
    name: 'Libertine Brewing Events',
    emoji: '🎸',
    type: 'music_venue',
    address: '1234 Broad St, SLO',
    coords: [-120.6630, 35.2790],
    desc: 'Official after-party venue for Concerts in the Plaza. Books live acts every Friday during summer. Wild ales, sour beers, and a funky vibe.',
    tip: 'After Concerts in the Plaza ends at 8pm, head straight here. The after-party crowd is lively and the acts are different from the plaza lineup. 21+ only.',
    website: 'libertinebrewing.com',
    free: false,
    recurring: true,
    schedule: 'Fridays during summer (Concerts season)',
  },
];

var EVENTS_FILTERS = [
  { id: 'all',     label: 'All',      emoji: '🎭' },
  { id: 'free',    label: 'Free',     emoji: '🆓' },
  { id: 'music',   label: 'Music',    emoji: '🎵' },
  { id: 'market',  label: 'Markets',  emoji: '🥕' },
  { id: 'theater', label: 'Theater',  emoji: '🎪' },
  { id: 'regular', label: 'Regular',  emoji: '📅' },
];

function openEventsHub() {
  var existing = document.getElementById('mh-events-hub');
  if (existing) existing.remove();

  // Map mode: show glowing spots, open hub on tap
  var menuHome = document.getElementById('menu-home');
  var onMap = menuHome && menuHome.style.display !== 'none';
  if (onMap && arguments[0] !== 'direct') {
    var mapSpots = (typeof EVENTS_VENUES !== 'undefined' ? EVENTS_VENUES : [])
      .filter(function(s) { return s.coords; })
      .map(function(s) { return { id: s.id || s.name, name: s.name, emoji: s.emoji || '🎭', coords: s.coords }; });
    if (mapSpots.length) {
      hubActivateMapMode(mapSpots, '#ffd700', function() { openEventsHub('direct'); });
      return;
    }
  }
  hubDeactivateMapMode();


  if (!document.getElementById('events-hub-css')) {
    var s = document.createElement('style');
    s.id = 'events-hub-css';
    s.textContent = [
      '.ev-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(255,215,0,0.2);background:rgba(255,215,0,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.ev-filter.active{background:rgba(255,215,0,0.15);border-color:#ffd700;color:#ffd700}',
      '.ev-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.ev-card:active{background:rgba(255,215,0,0.06);transform:scale(0.98)}',
      '.ev-badge{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:800}',
      '.ev-badge-free{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e}',
      '.ev-badge-recurring{background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.2);color:#ffd700}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-events-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseEventsHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🎭 Events Hub</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Concerts · Markets · Festivals · ' + EVENTS_VENUES.length + ' venues</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseEventsHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        EVENTS_FILTERS.map(function(f,i) {
          return '<button class="ev-filter' + (i===0?' active':'') + '" onclick="evFilter(this,\'' + f.id + '\')">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="events-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      evRenderList(EVENTS_VENUES) +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
}
window.menuHomeOpenEventsHub = openEventsHub;

function closeEventsHub() {
  hubDeactivateMapMode();
  var h = document.getElementById('mh-events-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseEventsHub = closeEventsHub;

function evFilter(el, filterId) {
  document.querySelectorAll('.ev-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var filtered = EVENTS_VENUES;
  if (filterId === 'free')    filtered = EVENTS_VENUES.filter(function(v) { return v.free; });
  if (filterId === 'music')   filtered = EVENTS_VENUES.filter(function(v) { return v.type === 'music_venue' || v.type === 'concert_series'; });
  if (filterId === 'market')  filtered = EVENTS_VENUES.filter(function(v) { return v.type === 'market'; });
  if (filterId === 'theater') filtered = EVENTS_VENUES.filter(function(v) { return v.type === 'theater' || v.type === 'expo'; });
  if (filterId === 'regular') filtered = EVENTS_VENUES.filter(function(v) { return v.recurring; });
  document.getElementById('events-content').innerHTML = evRenderList(filtered);
}
window.evFilter = evFilter;

function evRenderList(venues) {
  if (!venues.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No venues in this category</div>';
  return venues.map(function(v) {
    return '<div class="ev-card" onclick="evOpenDetail(\'' + v.id + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div style="font-size:28px;flex-shrink:0">' + v.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + v.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45)">' + (v.schedule || v.type.replace(/_/g,' ')) + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end">' +
          (v.free ? '<span class="ev-badge ev-badge-free">Free</span>' : '') +
          (v.recurring ? '<span class="ev-badge ev-badge-recurring">Regular</span>' : '') +
        '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);line-height:1.4">' + v.desc.slice(0,100) + '...</div>' +
    '</div>';
  }).join('');
}

function evOpenDetail(id) {
  var v = EVENTS_VENUES.find(function(x) { return x.id === id; });
  if (!v) return;
  var existing = document.getElementById('mh-ev-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-ev-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.id = 'mh-ev-inner';
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="document.getElementById(\'mh-ev-detail\').remove()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + v.emoji + '</div>' +
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px">' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;flex:1">' + v.name + '</div>' +
      '<div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px;margin-top:4px">' +
        (v.free ? '<span class="ev-badge ev-badge-free">Free</span>' : '') +
        (v.recurring ? '<span class="ev-badge ev-badge-recurring">Regular</span>' : '') +
      '</div>' +
    '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:14px">' + v.address + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:14px">' + v.desc + '</div>' +
    (v.schedule ? '<div style="padding:10px 12px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.15);border-radius:12px;margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:#ffd700;margin-bottom:3px">📅 SCHEDULE</div>' +
      '<div style="font-size:13px">' + v.schedule + '</div>' +
    '</div>' : '') +
    '<div style="padding:10px 12px;background:rgba(255,215,0,0.04);border:1px solid rgba(255,215,0,0.1);border-radius:12px;margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:#ffd700;margin-bottom:3px">💡 LOCAL TIP</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + v.tip + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px">' +
      '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(v.address + ' San Luis Obispo CA') + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);color:#ffd700;text-decoration:none;font-size:12px;font-weight:800;text-align:center">Directions ↗</a>' +
      (v.website ? '<a href="https://' + v.website + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);text-decoration:none;font-size:12px;font-weight:800;text-align:center">Website ↗</a>' : '') +
    '</div>';

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
    if (homeMap && v.coords) {
      try { homeMap.flyTo({ center: v.coords, zoom: 15, duration: 800 }); } catch(e) {}
    }
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.evOpenDetail = evOpenDetail;
