// ══════════════════════════════════════════════
// FITNESS_HUB.JS — Health & Fitness
// Gyms · Yoga · Trails · Classes · Resources
// ══════════════════════════════════════════════

var FITNESS_LINKS = [
  { name:'Cal Poly Rec Center',         url:'https://rec.calpoly.edu',                          emoji:'🏋', desc:'World-class facility included in student fees. Day passes available for non-students.' },
  { name:'SLO Swim Center',             url:'https://www.slocity.org/recreation/slo-swim-center', emoji:'🏊', desc:'City-run outdoor pool. Lap swimming, lessons, and water fitness classes.' },
  { name:'Planet Fitness SLO',          url:'https://www.planetfitness.com',                    emoji:'💪', desc:'Low-cost 24-hour gym. Multiple locations in SLO County.' },
  { name:'SLO Athletic Club',           url:'https://sloathletic.com',                          emoji:'🏃', desc:'Full-service gym with pool, classes, and personal training in SLO.' },
  { name:'Cuesta College Fitness',      url:'https://www.cuesta.edu',                           emoji:'🎓', desc:'Community college fitness center open to the public at low cost.' },
  { name:'SLO Parks and Recreation',    url:'https://www.slocity.org/recreation',               emoji:'🏙', desc:'City rec programs, sports leagues, classes, and facility rentals.' },
];

var FITNESS_TRAILS = [
  { name:'Bishop Peak', difficulty:'Hard', length:'3.5 mi RT', gain:'950 ft', desc:'Best summit hike in SLO. 1,559ft with 360 views.' },
  { name:'Cerro San Luis', difficulty:'Moderate', length:'2.1 mi RT', gain:'900 ft', desc:'Madonna Mountain. Great sunrise views of downtown.' },
  { name:'Bob Jones City to Sea', difficulty:'Easy', length:'8 mi one way', gain:'Flat', desc:'Paved trail to Avila Beach. Perfect for running or cycling.' },
  { name:'Irish Hills', difficulty:'Moderate', length:'4-8 mi', gain:'400-600 ft', desc:'Rolling oak savanna with multiple loop options.' },
  { name:'Reservoir Canyon', difficulty:'Moderate', length:'3.5 mi RT', gain:'750 ft', desc:'Wildflowers in spring. Shaded canyon walk.' },
  { name:'Islay Hill', difficulty:'Easy', length:'2 mi RT', gain:'350 ft', desc:'Best easy hike for beginners. Great views, short distance.' },
  { name:'Cerro Romauldo', difficulty:'Moderate', length:'3.2 mi RT', gain:'700 ft', desc:'Most underrated Sister. Almost no crowds.' },
  { name:'Montana de Oro Bluffs', difficulty:'Easy', length:'7 mi', gain:'Minimal', desc:'Clifftop coastal trail with Pacific Ocean views.' },
];

var FITNESS_CLASSES = [
  { type:'Yoga', emoji:'🧘', spots:['Cal Poly Rec Center','SLO Athletic Club','Multiple downtown studios'] },
  { type:'CrossFit', emoji:'💪', spots:['CrossFit SLO','Multiple affiliates in SLO County'] },
  { type:'Cycling', emoji:'🚴', spots:['Cal Poly Rec Center — spin classes','Outdoor cycling routes throughout SLO'] },
  { type:'Running', emoji:'🏃', spots:['SLO Track Club — group runs','Bob Jones Trail','Laguna Lake loop'] },
  { type:'Swimming', emoji:'🏊', spots:['SLO Swim Center','Cal Poly Rec Center pools'] },
  { type:'Rock Climbing', emoji:'🧗', spots:['Cal Poly Rec Center wall','Bishop Peak outdoor bouldering'] },
  { type:'Martial Arts', emoji:'🥋', spots:['Multiple dojos in SLO — search locally for current options'] },
  { type:'Dance', emoji:'💃', spots:['SLO Parks and Rec dance classes','Multiple private studios downtown'] },
];

function openFitnessHub() {
  var existing = document.getElementById('mh-fitness-hub');
  if (existing) existing.remove();

  if (!document.getElementById('fitness-hub-css')) {
    var s = document.createElement('style');
    s.id = 'fitness-hub-css';
    s.textContent = [
      '.fh-link{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;display:flex;align-items:center;gap:12px;text-decoration:none;-webkit-tap-highlight-color:transparent}',
      '.fh-link:active{transform:scale(0.98)}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-fitness-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(34,197,94,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="closeFitnessHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🏃 Health & Fitness</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Gyms · Trails · Classes · SLO active life</div>' +
        '</div>' +
        '<button onclick="closeFitnessHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:12px 20px 80px">' + fitnessRenderContent() + '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('fitness');
}
window.openFitnessHub = openFitnessHub;
window.menuHomeOpenFitnessHub = openFitnessHub;

function closeFitnessHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('fitness');
  var h = document.getElementById('mh-fitness-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeFitnessHub = closeFitnessHub;

function fitnessRenderContent() {
  var html = '';

  // Gyms
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🏋 Gyms & Facilities</div>';
  html += FITNESS_LINKS.map(function(l) {
    return '<a href="' + l.url + '" target="_blank" class="fh-link">' +
      '<div style="font-size:26px;flex-shrink:0">' + l.emoji + '</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:800;color:#fff">' + l.name + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;line-height:1.4">' + l.desc + '</div></div>' +
      '<div style="font-size:12px;color:rgba(34,197,94,0.7);font-weight:700;flex-shrink:0">↗</div>' +
    '</a>';
  }).join('');

  // Trails
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:16px">🥾 Top Trails for Fitness</div>';
  html += FITNESS_TRAILS.map(function(t) {
    var dc = t.difficulty === 'Hard' ? '#ef4444' : t.difficulty === 'Moderate' ? '#f59e0b' : '#22c55e';
    return '<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">' +
        '<div style="font-size:13px;font-weight:800">' + t.name + '</div>' +
        '<span style="font-size:10px;font-weight:700;color:' + dc + ';padding:2px 8px;border-radius:20px;background:' + dc + '15;border:1px solid ' + dc + '30;flex-shrink:0;margin-left:8px">' + t.difficulty + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:4px">' +
        '<span style="font-size:11px;color:rgba(255,255,255,0.4)">📏 ' + t.length + '</span>' +
        '<span style="font-size:11px;color:rgba(255,255,255,0.4)">⬆ ' + t.gain + '</span>' +
      '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.5)">' + t.desc + '</div>' +
    '</div>';
  }).join('');

  // Classes
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:16px">📋 Classes & Activities</div>';
  html += FITNESS_CLASSES.map(function(c) {
    return '<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">' +
        '<span style="font-size:20px">' + c.emoji + '</span>' +
        '<span style="font-size:13px;font-weight:800">' + c.type + '</span>' +
      '</div>' +
      c.spots.map(function(spot) {
        return '<div style="font-size:11px;color:rgba(255,255,255,0.45);padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04)">→ ' + spot + '</div>';
      }).join('') +
    '</div>';
  }).join('');

  return html;
}
