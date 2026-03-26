// ══════════════════════════════════════════════
// CALPOLY_HUB.JS — Cal Poly Student Life Hub
// Campus essentials · Local favorites · Events
// ══════════════════════════════════════════════

var CALPOLY_SECTIONS = [
  {
    id: 'student_bars',
    label: 'Student Bars',
    emoji: '🍺',
    items: [
      { name: "Bull's Tavern", desc: 'Est. 1935. SLO institution — every Cal Poly class since WWII has called this home. Cheap beer, no pretense, classic starting point.', tag: 'Classic', coords: [-120.6662, 35.2816] },
      { name: 'Black Sheep Bar & Grill', desc: 'Lively downtown bar with an outdoor patio. Popular with students for its energy and proximity to everything else.', tag: 'Lively', coords: [-120.6639, 35.2793] },
      { name: 'BA Start Arcade Bar', desc: 'Retro arcade games + craft cocktails. Perfect for a group that wants something different than the usual bar scene.', tag: 'Unique', coords: [-120.6640, 35.2800] },
      { name: 'Frog & Peach Pub', desc: 'Live music almost every night. Irish pub vibe, great patio along the creek. The move if you want bands.', tag: 'Live Music', coords: [-120.6661, 35.2815] },
      { name: 'SLO Brew Rock', desc: 'Best live music venue in SLO. Local and national touring acts. Show up early — it fills up fast.', tag: 'Shows', coords: [-120.6659, 35.2815] },
    ]
  },
  {
    id: 'eats',
    label: 'Student Eats',
    emoji: '🌮',
    items: [
      { name: 'Firestone Grill', desc: 'The Cal Poly classic. Tri-tip sandwiches that students have been eating since 1981. Long lines, worth every minute.', tag: 'Must Try', coords: [-120.6651, 35.2802] },
      { name: "Woodstock's Pizza", desc: 'Poly students\' go-to pizza spot. Late-night slices, student deals, always a good time. Groups love the booths.', tag: 'Late Night', coords: [-120.6648, 35.2800] },
      { name: 'Taqueria Santa Cruz', desc: 'Best Mexican in SLO. No-frills tacos and all-you-can-eat chips and salsa. Budget friendly and absolutely delicious.', tag: 'Budget', coords: [-120.6620, 35.2785] },
      { name: 'Scout Coffee Co.', desc: 'The student coffee spot. Great for study sessions, freelance work, and meeting people. Multiple locations downtown.', tag: 'Study Spot', coords: [-120.6645, 35.2800] },
      { name: "Louisa's Place", desc: 'Vintage diner vibes. The classic big breakfast after a late night. Waffles, eggs, all of it. Cash preferred.', tag: 'Breakfast', coords: [-120.6632, 35.2780] },
    ]
  },
  {
    id: 'campus',
    label: 'Campus Life',
    emoji: '🎓',
    items: [
      { name: 'Thursday Farmers Market', desc: 'The weekly SLO ritual. Five blocks of Higuera shut down — BBQ, live music, the whole city shows up. Every Thursday 6–9pm.', tag: 'Free Weekly', coords: [-120.6650, 35.2800] },
      { name: 'Serenity Swing', desc: 'Hidden viewpoint on Cal Poly campus. A swing at the top of a hill with one of the best views of SLO. Worth the hike.', tag: 'Hidden Gem', coords: [-120.6587, 35.3010] },
      { name: 'Poly Canyon Village', desc: 'On-campus student housing and gathering spot. Lots of events, markets, and student life activity centered here.', tag: 'On Campus', coords: [-120.6560, 35.3020] },
      { name: 'SLO Transit (Free with ID)', desc: 'Free bus system with valid Cal Poly student ID. Connects campus to downtown, Pismo Beach, and the rest of SLO.', tag: 'Free Transit', coords: [-120.6590, 35.2990] },
      { name: 'Performing Arts Center', desc: 'World-class venue on campus. Student rush tickets 30min before showtime — sometimes 50% off Broadway shows.', tag: 'Student Deals', coords: [-120.6587, 35.2994] },
    ]
  },
  {
    id: 'study',
    label: 'Study Spots',
    emoji: '📚',
    items: [
      { name: 'SLO City Library', desc: 'Beautiful downtown library with study rooms, printing, and archives. Free to use. Open late on weekdays.', tag: 'Free', coords: [-120.6648, 35.2795] },
      { name: 'Scout Coffee Co.', desc: 'Best coffee shop atmosphere for studying. Good wifi, lots of seating, and they won\'t kick you out after one drink.', tag: 'WiFi + Coffee', coords: [-120.6645, 35.2800] },
      { name: 'Kennedy Library (Cal Poly)', desc: 'The main Cal Poly library. 24/7 access with ID. Quiet floors, group study rooms, and panoramic campus views.', tag: 'On Campus', coords: [-120.6590, 35.3010] },
      { name: 'Active Coffee Co.', desc: 'Cozy downtown coffee shop popular with students. Good food menu alongside great espresso drinks.', tag: 'Local Fave', coords: [-120.6640, 35.2795] },
    ]
  },
];

var _cpSection = 'student_bars';

function openCalPolyHub() {
  var existing = document.getElementById('mh-calpoly-hub');
  if (existing) existing.remove();

  if (!document.getElementById('calpoly-css')) {
    var s = document.createElement('style');
    s.id = 'calpoly-css';
    s.textContent = [
      '.cp-tab{padding:8px 14px;border-radius:20px;border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.cp-tab.active{background:rgba(99,102,241,0.15);border-color:#6366f1;color:#a5b4fc}',
      '.cp-item{padding:12px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.cp-item:active{background:rgba(99,102,241,0.08);transform:scale(0.98)}',
      '.cp-tag{padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-calpoly-hub';
  hub.style.cssText = 'position:absolute;inset:0;z-index:22;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseCalPolyHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🎓 Cal Poly Hub</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Student life · Bars · Eats · Campus</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseCalPolyHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        CALPOLY_SECTIONS.map(function(s) {
          return '<button class="cp-tab' + (s.id === _cpSection ? ' active' : '') + '" onclick="cpTab(this,\'' + s.id + '\')">' + s.emoji + ' ' + s.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="cp-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      cpRenderSection(_cpSection) +
    '</div>';

  document.getElementById('menu-home').appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
}
window.menuHomeOpenCalPolyHub = openCalPolyHub;

function closeCalPolyHub() {
  var h = document.getElementById('mh-calpoly-hub');
  if (h) { h.style.opacity = '0'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseCalPolyHub = closeCalPolyHub;

function cpTab(el, sectionId) {
  document.querySelectorAll('.cp-tab').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  _cpSection = sectionId;
  document.getElementById('cp-content').innerHTML = cpRenderSection(sectionId);
}
window.cpTab = cpTab;

function cpRenderSection(sectionId) {
  var section = CALPOLY_SECTIONS.find(function(s) { return s.id === sectionId; });
  if (!section) return '';
  return section.items.map(function(item) {
    return '<div class="cp-item" onclick="cpOpenMaps(\'' + encodeURIComponent(item.name) + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="flex:1">' +
          '<div style="font-size:14px;font-weight:800">' + item.name + '</div>' +
        '</div>' +
        '<span class="cp-tag">' + item.tag + '</span>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5">' + item.desc + '</div>' +
    '</div>';
  }).join('');
}

function cpOpenMaps(name) {
  var decoded = decodeURIComponent(name);
  window.open('https://www.google.com/maps/search/' + encodeURIComponent(decoded + ' San Luis Obispo CA'), '_blank');
}
window.cpOpenMaps = cpOpenMaps;
