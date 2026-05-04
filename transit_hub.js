// ══════════════════════════════════════════════
// TRANSIT_HUB.JS — SLO Transit
// Bus · Amtrak · RTA · Bike · Airport
// ══════════════════════════════════════════════

var TRANSIT_ROUTES = [
  {
    number:'1',
    name:'Downtown / Cal Poly',
    color:'#ef4444',
    frequency:'Every 15 min peak, 30 min off-peak',
    hours:'6am – 10pm daily',
    key_stops:['Downtown Transit Center','Foothill & Santa Rosa','Cal Poly (Via Carta)','Madonna Plaza','South Higuera'],
    notes:'Most used route in the system. Cal Poly students ride free with ID.',
  },
  {
    number:'2',
    name:'Downtown / LOVR / Airport',
    color:'#f97316',
    frequency:'Every 30 min',
    hours:'6am – 9pm daily',
    key_stops:['Downtown Transit Center','Los Osos Valley Rd','SLO Airport','Dalidio Dr'],
    notes:'Best way to get from downtown to the airport without a car. $1.75 fare.',
  },
  {
    number:'3',
    name:'Cal Poly / North SLO',
    color:'#6366f1',
    frequency:'Every 30 min',
    hours:'7am – 9pm daily',
    key_stops:['Downtown Transit Center','Cal Poly','Foothill Shopping Center','North SLO'],
    notes:'Connects Cal Poly to north SLO neighborhoods.',
  },
  {
    number:'4',
    name:'Madonna / Target / Hospital',
    color:'#22c55e',
    frequency:'Every 30 min',
    hours:'7am – 8pm daily',
    key_stops:['Downtown Transit Center','Madonna Rd','French Hospital','Los Osos Valley Rd'],
    notes:'Good for reaching French Hospital and the Madonna shopping corridor.',
  },
  {
    number:'6',
    name:'Broad St / South SLO',
    color:'#f59e0b',
    frequency:'Every 30 min',
    hours:'7am – 8pm daily',
    key_stops:['Downtown Transit Center','Broad St','Tank Farm Rd','Edna Valley Rd'],
    notes:'Reaches south SLO neighborhoods.',
  },
  {
    number:'901',
    name:'RTA — SLO to Morro Bay',
    color:'#06b6d4',
    frequency:'Every 60 min',
    hours:'6am – 10pm daily',
    key_stops:['Downtown SLO','Los Osos','Morro Bay Embarcadero','Cayucos'],
    notes:'Regional route. Connects SLO to Morro Bay and Cayucos. $3 fare.',
  },
  {
    number:'904',
    name:'RTA — SLO to Pismo/Grover',
    color:'#ec4899',
    frequency:'Every 60 min',
    hours:'6am – 9pm daily',
    key_stops:['Downtown SLO','Edna Valley','Arroyo Grande','Pismo Beach','Grover Beach'],
    notes:'Regional route south to the Five Cities area. $3 fare.',
  },
];

var AMTRAK_TRAINS = [
  {
    train:'Pacific Surfliner — Northbound',
    destinations:['Paso Robles','Salinas','Oakland','Sacramento'],
    departures:['7:09 AM','12:44 PM','5:42 PM'],
    notes:'Scenic coastal route. Book online at amtrak.com. Bike reservations available.',
  },
  {
    train:'Pacific Surfliner — Southbound',
    destinations:['Santa Barbara','Los Angeles','San Diego'],
    departures:['9:33 AM','2:58 PM','7:23 PM'],
    notes:'Los Angeles is 5.5 hours. Santa Barbara is 2 hours. One of the most scenic train routes in the US.',
  },
  {
    train:'Coast Starlight — Northbound',
    destinations:['Oakland','Portland','Seattle'],
    departures:['11:20 AM (daily)'],
    notes:'Long-distance overnight train. Seattle is 30 hours north. Dining car and sleeping cars available.',
  },
  {
    train:'Coast Starlight — Southbound',
    destinations:['Los Angeles','(connects to Southwest Chief)'],
    departures:['5:56 PM (daily)'],
    notes:'Los Angeles is 9 hours south. One of Amtrak\'s most scenic routes — the ocean appears at Surf.',
  },
];

var TRANSIT_OTHER = [
  {
    name:'SLO Safe Ride',
    emoji:'🚕',
    desc:'Free late-night safe rides for Cal Poly students on Thursday, Friday, and Saturday nights. Run by Associated Students.',
    contact:'(805) 783-7433',
    url:'https://asl.calpoly.edu/safe-ride',
  },
  {
    name:'SLO Bike Share',
    emoji:'🚲',
    desc:'Electric and standard bikes available at stations throughout downtown SLO and Cal Poly campus.',
    contact:'',
    url:'https://slo.bcycle.com',
  },
  {
    name:'SLO Regional Airport (SBP)',
    emoji:'✈️',
    desc:'Small regional airport with daily flights to LAX, SFO, PHX, and DEN. Route 2 bus connects downtown to the airport.',
    contact:'(805) 781-5205',
    url:'https://sloairport.com',
  },
  {
    name:'Uber / Lyft in SLO',
    emoji:'📱',
    desc:'Both are active in SLO. Surge pricing applies on Thursday nights during Farmers Market and on weekend nights downtown. Estimated wait: 3-8 min.',
    contact:'',
    url:'https://www.uber.com',
  },
  {
    name:'Enterprise Rent-A-Car',
    emoji:'🚗',
    desc:'Main car rental option in SLO. Located near the airport and downtown. Reserve in advance for weekends.',
    contact:'(805) 544-2244',
    url:'https://www.enterprise.com',
  },
];

function openTransitHub() {
  var existing = document.getElementById('mh-transit-hub');
  if (existing) existing.remove();

  if (!document.getElementById('transit-hub-css')) {
    var s = document.createElement('style');
    s.id = 'transit-hub-css';
    s.textContent = [
      '.tr-route{padding:13px;border-radius:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px}',
      '.tr-train{padding:13px;border-radius:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-transit-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(6,182,212,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="closeTransitHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">🚌 SLO Transit</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Bus · Amtrak · Bike · Airport · Rideshare</div>' +
        '</div>' +
        '<button onclick="closeTransitHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:12px 20px 80px">' + transitRenderContent() + '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('transit');
}
window.openTransitHub = openTransitHub;
window.menuHomeOpenTransitHub = openTransitHub;

function closeTransitHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('transit');
  var h = document.getElementById('mh-transit-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeTransitHub = closeTransitHub;

function transitRenderContent() {
  var html = '';

  // SLO Transit fares + trip planner link
  html += '<div style="padding:13px;border-radius:13px;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.2);margin-bottom:16px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<div style="font-size:13px;font-weight:800;color:#06b6d4">SLO Transit</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.5)">$1.75 · Students FREE</div>' +
    '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:10px;line-height:1.5">Cal Poly students ride free with ID. Day passes $4. SLO Transit app has real-time arrivals.</div>' +
    '<div style="display:flex;gap:8px">' +
      '<a href="https://www.slocitybus.com" target="_blank" style="flex:1;padding:10px;border-radius:9px;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.25);color:#06b6d4;text-align:center;font-size:12px;font-weight:800;text-decoration:none">slocitybus.com ↗</a>' +
      '<a href="https://www.google.com/maps/dir/?api=1&travelmode=transit" target="_blank" style="flex:1;padding:10px;border-radius:9px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);text-align:center;font-size:12px;font-weight:800;text-decoration:none">Trip Planner ↗</a>' +
    '</div>' +
  '</div>';

  // Bus routes
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🚌 Bus Routes</div>';
  html += TRANSIT_ROUTES.map(function(r) {
    return '<div class="tr-route">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="width:32px;height:32px;border-radius:8px;background:' + r.color + ';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;flex-shrink:0">' + r.number + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:800">' + r.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + r.frequency + '</div>' +
        '</div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.35);text-align:right">' + r.hours + '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:5px">' + r.key_stops.join(' → ') + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.3)">' + r.notes + '</div>' +
    '</div>';
  }).join('');

  // Amtrak
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:16px">🚂 Amtrak — SLO Station</div>';
  html += '<div style="padding:10px 13px;border-radius:11px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);margin-bottom:10px;font-size:12px;color:rgba(255,255,255,0.5)">SLO Amtrak Station — 1011 Railroad St. Free parking. Book at amtrak.com. Times are approximate — check real-time schedules.</div>';
  html += AMTRAK_TRAINS.map(function(t) {
    return '<div class="tr-train">' +
      '<div style="font-size:13px;font-weight:800;margin-bottom:4px">' + t.train + '</div>' +
      '<div style="font-size:11px;color:rgba(6,182,212,0.8);margin-bottom:4px">→ ' + t.destinations.join(' · ') + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">' +
        t.departures.map(function(d) {
          return '<span style="padding:2px 8px;border-radius:20px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);color:#06b6d4;font-size:10px;font-weight:700">' + d + '</span>';
        }).join('') +
      '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.35)">' + t.notes + '</div>' +
    '</div>';
  }).join('');

  // Other transit
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:16px">🚕 Getting Around</div>';
  html += TRANSIT_OTHER.map(function(o) {
    return '<div style="padding:12px 13px;border-radius:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;display:flex;gap:10px;align-items:flex-start">' +
      '<div style="font-size:24px;flex-shrink:0">' + o.emoji + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:800;margin-bottom:3px">' + o.name + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:6px">' + o.desc + '</div>' +
        (o.url ? '<a href="' + o.url + '" target="_blank" style="font-size:11px;color:#06b6d4;font-weight:700;text-decoration:none">Learn more ↗</a>' : '') +
        (o.contact ? '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:3px">' + o.contact + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  return html;
}
