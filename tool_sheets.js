// References to menu_home.js globals
var homeMap = null; // shared via window.homeMap
var MAPTILER_KEY = window.MAPTILER_KEY || "kiFBCC0bWlsukNO2sHf7";

// ══════════════════════════════════════════════
// TOOL SHEETS.JS
// ══════════════════════════════════════════════

// ── TOOL SHEETS ──
function openTool(id) {
  // Remove existing tool sheet
  var existing = document.getElementById('mh-tool-sheet');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-tool-sheet';
  sheet.style.cssText = 'position:absolute;inset:0;z-index:22;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
  sheet.innerHTML = '<div id="mh-tool-inner" style="width:100%;background:rgba(8,8,20,0.97);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 48px;max-height:80vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' + getToolContent(id) + '</div>';

  document.getElementById('menu-home').appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-tool-inner').style.transform = 'translateY(0)';
  }, 30);

  sheet.addEventListener('click', function(e) {
    if (e.target === sheet) closeToolSheet();
  });
}
window.menuHomeOpenTool = openTool;

function closeToolSheet() {
  var sheet = document.getElementById('mh-tool-sheet');
  if (sheet) {
    sheet.style.opacity = '0';
    setTimeout(function() { sheet.remove(); }, 300);
  }
}
window.menuHomeCloseToolSheet = closeToolSheet;

function getToolContent(id) {
  var handle = '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="menuHomeCloseToolSheet()"></div>';


  if (id === 'uv') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">☀️ UV Index</div>',
      '<div style="text-align:center;padding:20px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,255,255,0.07);margin-bottom:16px">',
        '<div style="font-size:56px;font-weight:900;color:#f59e0b">6</div>',
        '<div style="font-size:14px;font-weight:700;color:#f59e0b;margin-top:4px">High</div>',
        '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:8px">Protection needed · Sunscreen SPF 30+ recommended</div>',
      '</div>',
      '<div style="font-size:11px;color:rgba(255,255,255,0.3);text-align:center">San Luis Obispo · Updates daily</div>',
    ].join('');
  }

  if (id === 'tides') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🌊 Tide Chart</div>',
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between"><span>Low tide</span><span style="color:#06b6d4;font-weight:700">6:24 AM · 0.8 ft</span></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between"><span>High tide</span><span style="color:#ff2d78;font-weight:700">12:42 PM · 5.2 ft</span></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between"><span>Low tide</span><span style="color:#06b6d4;font-weight:700">6:58 PM · 1.1 ft</span></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between"><span>High tide</span><span style="color:#ff2d78;font-weight:700">11:34 PM · 4.8 ft</span></div>',
      '</div>',
      '<a href="https://tidesandcurrents.noaa.gov/stationhome.html?id=9412110" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">NOAA Full Tide Chart ↗</a>',
    ].join('');
  }

  if (id === 'restrooms') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🚻 Public Restrooms</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Mission Plaza</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Chorro & Monterey · Always open</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Marsh St Parking Garage</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Ground floor · Garage hours</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Mitchell Park</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Broad & Pismo · Park hours</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">SLO Farmers Market</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Thursday nights · Higuera St</div></div>',
      '</div>',
    ].join('');
  }

  if (id === 'wifi') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">📶 Free WiFi</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Downtown SLO</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Network: SLO_Free · No password</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">SLO Public Library</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">995 Palm St · Library hours</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Mission Plaza</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">City WiFi · Outdoor coverage</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Most Coffee Shops</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Scout Coffee, Joebella — ask staff</div></div>',
      '</div>',
    ].join('');
  }

  if (id === 'events') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">📅 Events This Week</div>',
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:10px;color:#ffd700;font-weight:700;margin-bottom:2px">THURSDAY</div><div style="font-size:13px;font-weight:800">Farmers Market</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">6-9pm · Higuera St · Free</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:10px;color:#06b6d4;font-weight:700;margin-bottom:2px">WEEKLY</div><div style="font-size:13px;font-weight:800">SLO Safe Ride</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Thu-Sat 10pm-3am · Free</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:10px;color:#22c55e;font-weight:700;margin-bottom:2px">ONGOING</div><div style="font-size:13px;font-weight:800">SLO Brew Live Music</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">736 Higuera · Check schedule</div></div>',
      '</div>',
      '<a href="https://www.downtownslo.com/events" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Downtown SLO Events ↗</a>',
    ].join('');
  }

  if (id === 'farmers_market') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">🌽 Farmers Market</div>',
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px">Every Thursday · Higuera Street</div>',
      '<div style="padding:16px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.15);border-radius:14px;margin-bottom:16px">',
        '<div style="font-size:13px;font-weight:800;color:#ffd700;margin-bottom:8px">Tonight?</div>',
        '<div style="font-size:24px;font-weight:900;color:white">6:00 PM – 9:00 PM</div>',
        '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:4px">Higuera St closes to cars at 5:30pm</div>',
      '</div>',
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">',
        '<div style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);font-size:12px;color:rgba(255,255,255,0.6)">🎸 Live music every week</div>',
        '<div style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);font-size:12px;color:rgba(255,255,255,0.6)">🌽 Local produce, crafts, street food</div>',
        '<div style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);font-size:12px;color:rgba(255,255,255,0.6)">🍺 Beer & wine garden</div>',
        '<div style="padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);font-size:12px;color:rgba(255,255,255,0.6)">🆓 Always free to attend</div>',
      '</div>',
    ].join('');
  }

  if (id === 'live_music') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🎸 Live Music Tonight</div>',
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">SLO Brew Rock</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">736 Higuera · slobrewrock.com</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Fremont Theater</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">1035 Monterey · fremonttheater.com</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Frog & Peach Pub</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">728 Higuera · Live music weekends</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">McCarthys Irish Pub</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">600 Marsh · Traditional live nights</div></div>',
      '</div>',
    ].join('');
  }

  if (id === 'happy_hour') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🍹 Happy Hour Guide</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Luna Red</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">3-6pm daily · $2 off drinks + HH bites</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Novo Restaurant</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Wed wine nights · 50% off select bottles</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">High Street Deli</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">After 4:20pm · Half off sandwiches</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">SLO Brew</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Daily 3-5pm · $1 off pints</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Libertine Brewing</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Weekdays 4-6pm · Pint specials</div></div>',
      '</div>',
    ].join('');
  }

  if (id === 'safe_ride') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">🌙 SLO Safe Ride</div>',
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px">Free late-night rides · No excuses</div>',
      '<div style="padding:16px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:14px;margin-bottom:16px">',
        '<div style="font-size:13px;font-weight:800;color:#22c55e;margin-bottom:8px">🆓 Completely Free</div>',
        '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6">Thu–Sat nights · 10pm to 3am<br>For anyone who has been drinking<br>No judgment, no questions asked</div>',
      '</div>',
      '<div style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;font-size:12px;color:rgba(255,255,255,0.6)">📞 Call: (805) 543-RIDE</div>',
      '<div style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.6)">📍 Pickup anywhere in SLO city limits</div>',
    ].join('');
  }

  if (id === 'emergency') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🚨 Emergency</div>',
      '<div style="display:flex;flex-direction:column;gap:10px">',
        '<a href="tel:911" style="display:block;padding:16px;border-radius:14px;background:rgba(239,68,68,0.1);border:2px solid rgba(239,68,68,0.4);color:#ef4444;text-decoration:none;font-size:16px;font-weight:800;text-align:center">📞 Call 911</a>',
        '<a href="tel:8057815000" style="display:block;padding:14px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">SLO Police Non-Emergency: (805) 781-5000</a>',
        '<a href="tel:8055431234" style="display:block;padding:14px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Sierra Vista Hospital: (805) 543-1234</a>',
        '<a href="tel:8005228700" style="display:block;padding:14px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Crisis Line: 1-800-522-8700</a>',
      '</div>',
    ].join('');
  }

  if (id === 'hospital') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🏥 Medical</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Sierra Vista Hospital</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">1010 Murray Ave · ER 24/7</div><a href="tel:8055431234" style="font-size:11px;color:#06b6d4;text-decoration:none">(805) 543-1234</a></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">French Hospital</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">1911 Johnson Ave · ER 24/7</div><a href="tel:8054430501" style="font-size:11px;color:#06b6d4;text-decoration:none">(805) 443-0501</a></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Urgent Care SLO</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">1941 Johnson Ave · Mon-Fri 8am-8pm</div></div>',
      '</div>',
    ].join('');
  }

  if (id === 'pharmacy') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">💊 Pharmacies</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">CVS Pharmacy</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">687 Marsh St · Open late</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Walgreens</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">1126 Chorro St · 24hr pharmacy</div></div>',
        '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)"><div style="font-size:13px;font-weight:800">Rite Aid</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">299 Madonna Rd · Open late</div></div>',
      '</div>',
    ].join('');
  }

  if (id === 'hub_placement') {
    menuHomeClosePinMover();
    openPinMover();
    return handle + '';
  }
  if (id === 'rides') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">🚗 Rides</div>',
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:20px">Get home safe tonight</div>',
      // Group size
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Group size</div>',
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">',
        '<input type="range" id="mh-ride-group" min="1" max="12" value="2" style="flex:1;accent-color:#ffd700" oninput="updateRideGroup(this.value)">',
        '<div id="mh-ride-group-val" style="font-size:20px;font-weight:900;color:#ffd700;min-width:30px">2</div>',
      '</div>',
      '<div id="mh-ride-type-note" style="padding:8px 12px;border-radius:10px;font-size:12px;margin-bottom:16px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e">✅ Standard Uber fits 2 people</div>',
      // Destination
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Destination (optional)</div>',
      '<select id="mh-ride-dest" style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:white;font-family:inherit;font-size:13px;margin-bottom:16px">',
        '<option value="">From my location</option>',
        '<option value="Black Sheep Bar Cafe">Black Sheep Bar Cafe</option>',
        '<option value="Frog &amp; Peach Pub">Frog &amp; Peach Pub</option>',
        '<option value="Nightcap">Nightcap</option>',
        '<option value="The Library">The Library</option>',
        '<option value="McCarthys Irish Pub">McCarthys Irish Pub</option>',
        '<option value="Bulls Tavern">Bulls Tavern</option>',
        '<option value="High Bar">High Bar</option>',
        '<option value="The Mark">The Mark</option>',
        '<option value="Sidecar">Sidecar</option>',
        '<option value="BA Start Arcade Bar">BA Start Arcade Bar</option>',
      '</select>',
      // Ride buttons
      '<div style="display:flex;flex-direction:column;gap:10px">',
        '<button onclick="menuHomeCallRide(this.dataset.app)" data-app="uber" style="padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#000,#1a1a1a);color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:space-between">',
          '<span>🚗 Open Uber</span><span id="mh-uber-type" style="font-size:11px;color:rgba(255,255,255,0.4)">Standard</span>',
        '</button>',
        '<button onclick="menuHomeCallRide(this.dataset.app)" data-app="lyft" style="padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#e91e8c,#c2185b);color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:space-between">',
          '<span>🩷 Open Lyft</span><span id="mh-lyft-type" style="font-size:11px;color:rgba(255,255,255,0.7)">Standard</span>',
        '</button>',
      '</div>',
      '<div style="margin-top:12px;padding:10px 12px;background:rgba(0,255,136,0.05);border-radius:10px;border:1px solid rgba(0,255,136,0.1);font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6">🛡 Always verify your driver and car before getting in.</div>',
    ].join('');
  }

  if (id === 'surf') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">🏄 Surf Conditions</div>',
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px">Central Coast — updated regularly</div>',
      // Beach cards
      '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">',
        mhSurfCard('Pismo Beach',  '🌊', '2-3 ft', 'Fair', 'W swell • Light winds', '#06b6d4'),
        mhSurfCard('Avila Beach',  '🏖', '1-2 ft', 'Good', 'Protected • Calm',     '#22c55e'),
        mhSurfCard('Shell Beach',  '🪨', '2-4 ft', 'Fair', 'NW swell • Choppy',    '#f59e0b'),
        mhSurfCard('Morro Bay',    '🦦', '3-4 ft', 'Poor', 'Cross-shore winds',    '#ef4444'),
      '</div>',
      // Links
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Live Cams</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        '<a href="https://www.surfline.com/surf-reports-forecasts-cams/united-states/california/san-luis-obispo-county/5392329" target="_blank" style="padding:11px 14px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:space-between">Surfline SLO County <span style="color:rgba(255,255,255,0.3)">↗</span></a>',
        '<a href="https://www.805webcams.com/" target="_blank" style="padding:11px 14px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:space-between">805 Live Webcams <span style="color:rgba(255,255,255,0.3)">↗</span></a>',
        '<a href="https://www.slocounty.info/webcams.html" target="_blank" style="padding:11px 14px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:space-between">SLO County Cams <span style="color:rgba(255,255,255,0.3)">↗</span></a>',
      '</div>',
    ].join('');
  }

  if (id === 'weather') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🌤 SLO Weather</div>',
      '<div style="text-align:center;padding:20px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,255,255,0.07);margin-bottom:16px">',
        '<div style="font-size:64px;margin-bottom:8px">🌤</div>',
        '<div style="font-size:32px;font-weight:900;color:#ffd700">68°F</div>',
        '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px">Partly Cloudy · San Luis Obispo</div>',
        '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:8px">Hi 72° · Lo 54° · Wind 8 mph W</div>',
      '</div>',
      '<a href="https://forecast.weather.gov/MapClick.php?CityName=San+Luis+Obispo&state=CA" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Full Forecast ↗</a>',
    ].join('');
  }

  if (id === 'parking') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🅿️ Downtown Parking</div>',
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">',
        mhParkingCard('Marsh St Garage',   '$1.25/hr', 'Available', '#22c55e'),
        mhParkingCard('Palm St Garage',    '$1.25/hr', 'Busy',      '#f59e0b'),
        mhParkingCard('Garden St Lot',     'Free 2hr', 'Available', '#22c55e'),
        mhParkingCard('Nipomo St Lot',     '$1.00/hr', 'Available', '#22c55e'),
        mhParkingCard('Monterey St Lot',   '$1.25/hr', 'Full',      '#ef4444'),
      '</div>',
      '<div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center">Status approximate — tap for live map</div>',
    ].join('');
  }

  if (id === 'traffic') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">📡 Traffic & Roads</div>',
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">',
        mhTrafficCard('101 N through SLO',     '🟢', 'Clear'),
        mhTrafficCard('101 S toward Pismo',    '🟡', 'Light delays'),
        mhTrafficCard('Price Canyon Rd',       '🟢', 'Clear'),
        mhTrafficCard('Higuera St Downtown',   '🟡', 'Event traffic'),
      '</div>',
      '<a href="https://quickmap.dot.ca.gov/" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Caltrans QuickMap ↗</a>',
    ].join('');
  }

  if (id === 'transit') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🚌 SLO Transit</div>',
      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">',
        '<div style="padding:12px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08)"><div style="font-size:13px;font-weight:800;margin-bottom:2px">SLO City Bus</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Routes 1-9 · Downtown hub at Palm & Osos</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08)"><div style="font-size:13px;font-weight:800;margin-bottom:2px">SLO Safe Ride</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Free late-night rides · Thu-Sat 10pm-3am</div></div>',
        '<div style="padding:12px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08)"><div style="font-size:13px;font-weight:800;margin-bottom:2px">Amtrak Pacific Surfliner</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">SLO Station · 1011 Railroad Ave</div></div>',
      '</div>',
      '<a href="https://www.slocitybuses.com/" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">SLO City Buses ↗</a>',
    ].join('');
  }

  if (id === 'atms') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">🏧 Nearby ATMs</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        mhATMCard('Chase Bank',         '864 Higuera St',    '0.1 mi'),
        mhATMCard('Bank of America',    '901 Higuera St',    '0.2 mi'),
        mhATMCard('Wells Fargo',        '1029 Chorro St',    '0.3 mi'),
        mhATMCard('US Bank',            '849 Monterey St',   '0.2 mi'),
        mhATMCard('Star ATM (fee)',     '726 Higuera St',    '0.0 mi'),
      '</div>',
    ].join('');
  }

  if (id === 'gas') {
    return handle + [
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">⛽ Gas Stations</div>',
      '<div style="display:flex;flex-direction:column;gap:8px">',
        mhGasCard('Chevron',   'S Higuera & Tank Farm',  '$4.79', 'Regular'),
        mhGasCard('Shell',     'Los Osos Valley Rd',     '$4.82', 'Regular'),
        mhGasCard('76',        'Broad St & Tank Farm',   '$4.75', 'Regular'),
        mhGasCard('Costco',    'Costco Way',             '$4.49', 'Members'),
      '</div>',
      '<div style="font-size:10px;color:rgba(255,255,255,0.3);text-align:center;margin-top:10px">Prices approximate</div>',
    ].join('');
  }

  return handle + '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.4);font-size:13px">Coming soon</div>';
}

// Helper card builders
function mhSurfCard(name, icon, height, rating, desc, color) {
  var ratingColors = {'Good':'#22c55e','Fair':'#f59e0b','Poor':'#ef4444'};
  var rc = ratingColors[rating] || '#ffffff';
  return '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:14px;border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px">' +
    '<div style="font-size:28px;flex-shrink:0">' + icon + '</div>' +
    '<div style="flex:1"><div style="font-size:13px;font-weight:800">' + name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:1px">' + desc + '</div></div>' +
    '<div style="text-align:right"><div style="font-size:14px;font-weight:900;color:' + color + '">' + height + '</div><div style="font-size:10px;color:' + rc + ';font-weight:700">' + rating + '</div></div>' +
  '</div>';
}

function mhParkingCard(name, rate, status, color) {
  return '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between">' +
    '<div><div style="font-size:13px;font-weight:800">' + name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + rate + '</div></div>' +
    '<div style="padding:4px 10px;border-radius:20px;background:' + color + '22;border:1px solid ' + color + '44;font-size:11px;font-weight:700;color:' + color + '">' + status + '</div>' +
  '</div>';
}

function mhTrafficCard(name, dot, status) {
  return '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:10px">' +
    '<div style="font-size:16px">' + dot + '</div>' +
    '<div><div style="font-size:13px;font-weight:800">' + name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + status + '</div></div>' +
  '</div>';
}

function mhATMCard(name, address, dist) {
  return '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between">' +
    '<div><div style="font-size:13px;font-weight:800">' + name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + address + '</div></div>' +
    '<div style="font-size:11px;font-weight:700;color:#ffd700">' + dist + '</div>' +
  '</div>';
}

function mhGasCard(name, address, price, grade) {
  return '<div style="padding:11px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:space-between">' +
    '<div><div style="font-size:13px;font-weight:800">' + name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + address + ' · ' + grade + '</div></div>' +
    '<div style="font-size:15px;font-weight:900;color:#22c55e">' + price + '</div>' +
  '</div>';
}

// Ride group update
function updateRideGroup(val) {
  var n = parseInt(val);
  var note = document.getElementById('mh-ride-type-note');
  var utype = document.getElementById('mh-uber-type');
  var ltype = document.getElementById('mh-lyft-type');
  document.getElementById('mh-ride-group-val').textContent = val;
  if (n <= 4) {
    if (note) { note.style.background='rgba(34,197,94,0.08)'; note.style.borderColor='rgba(34,197,94,0.2)'; note.style.color='#22c55e'; note.textContent='✅ Standard fits '+n+' — normal pricing'; }
    if (utype) utype.textContent = 'Standard';
    if (ltype) ltype.textContent = 'Standard';
  } else if (n <= 6) {
    if (note) { note.style.background='rgba(255,215,0,0.08)'; note.style.borderColor='rgba(255,215,0,0.2)'; note.style.color='#ffd700'; note.textContent='🚐 '+n+' people — Uber XL recommended (~1.7× cost)'; }
    if (utype) utype.textContent = 'Uber XL';
    if (ltype) ltype.textContent = 'Lyft XL';
  } else if (n <= 10) {
    if (note) { note.style.background='rgba(255,45,120,0.08)'; note.style.borderColor='rgba(255,45,120,0.2)'; note.style.color='#ff2d78'; note.textContent='⚠️ '+n+' people — split into 2 vehicles'; }
    if (utype) utype.textContent = 'Multiple';
    if (ltype) ltype.textContent = 'Multiple';
  } else {
    if (note) { note.style.background='rgba(180,79,255,0.08)'; note.style.borderColor='rgba(180,79,255,0.2)'; note.style.color='#b44fff'; note.textContent='🚌 '+n+' people — consider a party bus or charter van'; }
  }
}
window.updateRideGroup = updateRideGroup;

function callRide(app) {
  var dest = document.getElementById('mh-ride-dest');
  var destVal = dest ? dest.value : '';
  var group = document.getElementById('mh-ride-group');
  var n = group ? parseInt(group.value) : 1;
  var useXL = n >= 5 && n <= 6;

  if (app === 'uber') {
    var url = useXL ? 'uber://?action=setPickup&product_id=821415d8-3bf5-4054-9c5e-64fb21b72706' : 'uber://';
    if (destVal) url = 'uber://?action=setPickup&dropoff[nickname]=' + encodeURIComponent(destVal);
    window.location.href = url;
    setTimeout(function() { window.open('https://m.uber.com', '_blank'); }, 1000);
  } else {
    window.location.href = 'lyft://ridetype?id=' + (useXL ? 'lyft_plus' : 'lyft');
    setTimeout(function() { window.open('https://lyft.com', '_blank'); }, 1000);
  }
}
window.menuHomeCallRide = callRide;

// ── BUILDING ANIMATIONS ──
function animateHubEntry(coords, callback) {
  if (!homeMap) { if (callback) callback(); return; }

  // Stop rotation
  var bearing = homeMap.getBearing();

  // Animate buildings rising — change extrusion height to 0 first then animate up
  try {
    if (homeMap.getLayer('mh-3d-buildings')) {
      homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-base-transition', { duration: 0 });
      homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-height-transition', { duration: 1200, delay: 200 });
      homeMap.setPaintProperty('mh-3d-buildings', 'fill-extrusion-color', [
        'interpolate', ['linear'], ['get', 'render_height'],
        0, '#111827', 15, '#1e3a8a', 40, '#1e40af', 80, '#2563eb'
      ]);
    }
  } catch(e) {}

  // Fly camera to hub
  homeMap.flyTo({
    center: coords,
    zoom: 16.5,
    pitch: 72,
    bearing: bearing + 45,
    duration: 1400,
    easing: function(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  });

  homeMap.once('moveend', function() {
    // Brief pause then slow spin
    var spinBearing = bearing + 45;
    var spinInterval = setInterval(function() {
      if (!homeMap) { clearInterval(spinInterval); return; }
      spinBearing += 0.8;
      try { homeMap.setBearing(spinBearing); } catch(e) { clearInterval(spinInterval); }
    }, 16);

    // After 1.2 seconds fire callback
    setTimeout(function() {
      clearInterval(spinInterval);
      if (callback) callback();
    }, 1200);
  });
}
window.menuHomeAnimateHubEntry = animateHubEntry;

function closeDrawer() {
  ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools','mh-drawer-dev'].forEach(function(d) {
    var el = document.getElementById(d);
    if (el) el.classList.remove('mh-drawer-open');
  });
  ['mh-tab-hubs','mh-tab-travel','mh-tab-tools','mh-tab-dev'].forEach(function(t) {
    var el = document.getElementById(t);
    if (el) el.classList.remove('mh-tab-active');
  });
  activeDrawer = null;
}

function findHubs() {
  if (homeMap) homeMap.flyTo({ center: [-120.6650, 35.2803], zoom: 14.5, pitch: 62, bearing: -25, duration: 1000 });
}

// ── INJECT HTML ──
function injectHTML() {
  if (document.getElementById('menu-home')) return;
  var div = document.createElement('div');
  div.id = 'menu-home';

  var isDevMode = localStorage.getItem('dtslo_dev_mode') === '1';

  div.innerHTML = [
    '<div id="mh-map"></div>',
    '<div id="mh-map-overlay"></div>',

    // Header
    '<div id="mh-header">',
      '<div id="mh-logo">MENU</div>',
      '<div id="mh-city">San Luis Obispo</div>',
    '</div>',

    // Find hubs button
    '<button id="mh-find-hubs" onclick="menuHomeFindHubs()">📍 Find Hubs</button>',

    // Drawers
    '<div id="mh-drawer-hubs" class="mh-drawer">',
      '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
      '<div class="mh-drawer-title">Hubs</div>',
      '<div class="mh-hub-cards">',
        '<div class="mh-hub-card mh-hub-card-active" onclick="menuHomeRequireAuth()">',
          '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#ff2d78,#b44fff)">🌃</div>',
          '<div class="mh-hub-card-info"><div class="mh-hub-card-name">DTSLO</div><div class="mh-hub-card-sub">Nightlife · Active Now</div></div>',
          '<div class="mh-hub-card-arrow" style="color:#ffd700">→</div>',
        '</div>',
        '<div class="mh-hub-card mh-hub-card-active" onclick="menuHomeOpenRestaurantHub()">',
          '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#ff2d78,#ef4444)">🍽</div>',
          '<div class="mh-hub-card-info"><div class="mh-hub-card-name">Restaurants</div><div class="mh-hub-card-sub">38 spots · Browse & dine</div></div>',
          '<div class="mh-hub-card-arrow" style="color:#ffd700">→</div>',
        '</div>',
        '<div class="mh-hub-card mh-hub-card-active" onclick="menuHomeHubPreview(this.dataset.hub)" data-hub="beach">',
          '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#06b6d4,#0ea5e9)">🏖</div>',
          '<div class="mh-hub-card-info"><div class="mh-hub-card-name">Beach Hub</div><div class="mh-hub-card-sub">8 beaches · Surf · Trails</div></div>',
          '<div class="mh-hub-card-arrow" style="color:#ffd700">→</div>',
        '</div>',
        '<div class="mh-hub-card mh-hub-card-soon" onclick="menuHomeHubPreview(this.dataset.hub)" data-hub="calpoly">',
          '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">🎓</div>',
          '<div class="mh-hub-card-info"><div class="mh-hub-card-name">Cal Poly</div><div class="mh-hub-card-sub">Campus · Events · Sports</div></div>',
          '<div class="mh-hub-card-arrow" style="color:rgba(255,255,255,0.2)">›</div>',
        '</div>',
        '<div class="mh-hub-card mh-hub-card-soon" onclick="menuHomeHubPreview(this.dataset.hub)" data-hub="city">',
          '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#00f5ff,#00ff88)">🏛</div>',
          '<div class="mh-hub-card-info"><div class="mh-hub-card-name">City Hub</div><div class="mh-hub-card-sub">Community · Events · Civic</div></div>',
          '<div class="mh-hub-card-arrow" style="color:rgba(255,255,255,0.2)">›</div>',
        '</div>',
      '</div>',
    '</div>',

    '<div id="mh-drawer-travel" class="mh-drawer">',
      '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
      '<div class="mh-drawer-title">✨ Travel Guide</div>',

      // Plan It CTA
      '<button class="mh-plan-btn" onclick="menuHomeOpenTravelPlanIt()">',
        '<span style="font-size:18px">✨</span>',
        '<div style="text-align:left;flex:1">',
          '<div style="font-size:14px;font-weight:800">Plan It</div>',
          '<div style="font-size:11px;color:rgba(255,255,255,0.5)">Build your perfect outing with AI</div>',
        '</div>',
        '<span style="color:rgba(255,255,255,0.3)">›</span>',
      '</button>',

      // Category filter tabs
      '<div class="mh-travel-tabs" id="mh-travel-tabs">',
        '<button class="mh-travel-tab active" onclick="menuHomeTravelTab(this,\'all\')">All</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'tours\')">🗺 Tours</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'food\')">🍽 Food</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'hotels\')">🏨 Hotels</button>',
        '<button class="mh-travel-tab" onclick="menuHomeTravelTab(this,\'beaches\')">🌊 Beaches</button>',
      '</div>',

      // Tours section
      '<div class="mh-travel-section" id="mh-tsec-tours">',
        '<div class="mh-section-label">🗺 SELF-GUIDED TOURS</div>',
        '<div class="mh-tour-grid" id="mh-tour-grid">',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="historic">',
            '<div class="mh-tour-icon">🏛</div>',
            '<div class="mh-tour-name">Historic SLO</div>',
            '<div class="mh-tour-meta">90 min · Walking · Free</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">Family</span><span class="mh-tag">Dogs OK</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="bishop">',
            '<div class="mh-tour-icon">🥾</div>',
            '<div class="mh-tour-name">Bishop Peak</div>',
            '<div class="mh-tour-meta">2.5 hrs · Hard · Free</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">Dogs OK</span><span class="mh-tag">Views</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="food">',
            '<div class="mh-tour-icon">🍕</div>',
            '<div class="mh-tour-name">Food Tour</div>',
            '<div class="mh-tour-meta">3 hrs · Easy · $40-100</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">Family</span><span class="mh-tag">Popular</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="farmers">',
            '<div class="mh-tour-icon">🌽</div>',
            '<div class="mh-tour-name">Farmers Market</div>',
            '<div class="mh-tour-meta">2 hrs · Easy · Free</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">Thu Only</span><span class="mh-tag">Family</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="bike">',
            '<div class="mh-tour-icon">🚴</div>',
            '<div class="mh-tour-name">Bike Loop</div>',
            '<div class="mh-tour-meta">90 min · Easy · $15-30</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">Rental</span><span class="mh-tag">Trail</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="wine">',
            '<div class="mh-tour-icon">🍷</div>',
            '<div class="mh-tour-name">Wine Trail</div>',
            '<div class="mh-tour-meta">4 hrs · Drive · $30-100</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">21+</span><span class="mh-tag">Romantic</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="beach">',
            '<div class="mh-tour-icon">🌊</div>',
            '<div class="mh-tour-name">Beach Day</div>',
            '<div class="mh-tour-meta">All day · Drive · Free</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">Family</span><span class="mh-tag">Dogs OK</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="morro">',
            '<div class="mh-tour-icon">🦦</div>',
            '<div class="mh-tour-name">Morro Bay</div>',
            '<div class="mh-tour-meta">Half day · Drive · Free</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">Wildlife</span><span class="mh-tag">Seafood</span></div>',
          '</div>',
          '<div class="mh-tour-card" onclick="menuHomeTourDetail(this)" data-tour="brewery">',
            '<div class="mh-tour-icon">🍺</div>',
            '<div class="mh-tour-name">Brewery Hop</div>',
            '<div class="mh-tour-meta">3 hrs · Walking · $20-60</div>',
            '<div class="mh-tour-tags"><span class="mh-tag">21+</span><span class="mh-tag">Local</span></div>',
          '</div>',
        '</div>',
      '</div>',

      // Restaurants section
      '<div class="mh-travel-section" id="mh-tsec-food">',
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">',
          '<div class="mh-section-label" style="margin-bottom:0">🍽 RESTAURANTS</div>',
          '<button onclick="menuHomeTravelViewAll(\'food\')" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">View all 38 →</button>',
        '</div>',
        '<div id="mh-restaurant-list"><div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);font-size:12px">Loading...</div></div>',
      '</div>',

      // Hotels section
      '<div class="mh-travel-section" id="mh-tsec-hotels">',
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">',
          '<div class="mh-section-label" style="margin-bottom:0">🏨 HOTELS</div>',
          '<button onclick="menuHomeTravelViewAll(\'hotels\')" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">View all →</button>',
        '</div>',
        '<div id="mh-hotel-list"><div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3);font-size:12px">Loading...</div></div>',
      '</div>',

      // Beaches section
      '<div class="mh-travel-section" id="mh-tsec-beaches">',
        '<div class="mh-section-label">🌊 BEACHES NEARBY</div>',
        '<div class="mh-venue-list">',
          '<div class="mh-venue-row" onclick="menuHomeTravelBeach(\'avila\')">',
            '<span class="mh-venue-emoji">🏖</span>',
            '<div class="mh-venue-info"><div class="mh-venue-name">Avila Beach</div><div class="mh-venue-sub">10 min · Calm water · Dog friendly</div></div>',
            '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>',
          '</div>',
          '<div class="mh-venue-row" onclick="menuHomeTravelBeach(\'pismo\')">',
            '<span class="mh-venue-emoji">🌊</span>',
            '<div class="mh-venue-info"><div class="mh-venue-name">Pismo Beach</div><div class="mh-venue-sub">15 min · Classic vibe · Pier & pier</div></div>',
            '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>',
          '</div>',
          '<div class="mh-venue-row" onclick="menuHomeTravelBeach(\'shell\')">',
            '<span class="mh-venue-emoji">🪨</span>',
            '<div class="mh-venue-info"><div class="mh-venue-name">Shell Beach</div><div class="mh-venue-sub">12 min · Dramatic cliffs · Surfing</div></div>',
            '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>',
          '</div>',
          '<div class="mh-venue-row" onclick="menuHomeTravelBeach(\'morro\')">',
            '<span class="mh-venue-emoji">🦦</span>',
            '<div class="mh-venue-info"><div class="mh-venue-name">Morro Bay Beach</div><div class="mh-venue-sub">30 min · Sea otters · Morro Rock</div></div>',
            '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>',
          '</div>',
          '<div class="mh-venue-row" onclick="menuHomeTravelBeach(\'montano\')">',
            '<span class="mh-venue-emoji">🌿</span>',
            '<div class="mh-venue-info"><div class="mh-venue-name">Montana de Oro</div><div class="mh-venue-sub">45 min · Wild cliffs · Hiking</div></div>',
            '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>',
          '</div>',
        '</div>',
      '</div>',

    '</div>',

    '<div id="mh-drawer-tools" class="mh-drawer">',
      '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
      '<div class="mh-drawer-title">Tools</div>',

      '<div class="mh-section-label">🚗 TRANSPORT</div>',
      '<div class="mh-tools-grid">',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="rides"><div class="mh-tool-icon">🚗</div><div>Rides</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="transit"><div class="mh-tool-icon">🚌</div><div>Transit</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="gas"><div class="mh-tool-icon">⛽</div><div>Gas</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="parking"><div class="mh-tool-icon">🅿️</div><div>Parking</div></button>',
      '</div>',
      '<div class="mh-section-label">📍 MAP TOOLS</div>',
      '<div class="mh-tools-grid">',
        '<button class="mh-tool-btn" onclick="menuHomePinMover()"><div class="mh-tool-icon">📍</div><div>Move Pin</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="hub_placement"><div class="mh-tool-icon">🏙</div><div>Hub Pins</div></button>',
      '</div>',

      '<div class="mh-section-label">🏙 DOWNTOWN</div>',
      '<div class="mh-tools-grid">',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="parking"><div class="mh-tool-icon">🅿️</div><div>Parking</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="atms"><div class="mh-tool-icon">🏧</div><div>ATMs</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="traffic"><div class="mh-tool-icon">📡</div><div>Traffic</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="wifi"><div class="mh-tool-icon">📶</div><div>Free WiFi</div></button>',
      '</div>',

      '<div class="mh-section-label">🛡 SAFETY & EMERGENCY</div>',
      '<div class="mh-tools-grid">',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="safe_ride"><div class="mh-tool-icon">🌙</div><div>Safe Ride</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="emergency"><div class="mh-tool-icon">🚨</div><div>Emergency</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="hospital"><div class="mh-tool-icon">🏥</div><div>Hospital</div></button>',
        '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="pharmacy"><div class="mh-tool-icon">💊</div><div>Pharmacy</div></button>',
      '</div>',

    '</div>',

    isDevMode ? [
      '<div id="mh-drawer-dev" class="mh-drawer">',
        '<div class="mh-drawer-handle" onclick="menuHomeCloseDrawer()"></div>',
        '<div class="mh-drawer-title">🐛 Dev Tools</div>',
        '<div style="color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:12px">Map Position</div>',
        '<div id="mh-dev-coords" style="font-size:10px;color:#b44fff;font-family:monospace;margin-bottom:12px"></div>',
        '<button class="mh-tool-btn" onclick="menuHomeEnterDTSLO()">→ Skip to DTSLO</button>',
      '</div>'
    ].join('') : '',

    // Bottom toolbar
    '<div id="mh-toolbar">',
      '<button class="mh-tab" id="mh-tab-hubs"   onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="hubs">',
        '<span class="mh-tab-icon">🌐</span>',
        '<span class="mh-tab-label">Hubs</span>',
      '</button>',
      '<button class="mh-tab" id="mh-tab-tools"  onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="tools">',
        '<span class="mh-tab-icon">⚡</span>',
        '<span class="mh-tab-label">Tools</span>',
      '</button>',
      '<button class="mh-tab" id="mh-tab-travel" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="travel">',
        '<span class="mh-tab-icon">🗺</span>',
        '<span class="mh-tab-label">Travel</span>',
      '</button>',
      isDevMode ? [
        '<button class="mh-tab" id="mh-tab-dev" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="dev">',
          '<span class="mh-tab-icon">🐛</span>',
          '<span class="mh-tab-label">Dev</span>',
        '</button>'
      ].join('') : '',
    '</div>',

    // Skip prompt
    '<div id="mh-skip-prompt">',
      '<div id="mh-skip-sheet">',
        '<div class="mh-sheet-handle"></div>',
        '<div id="mh-skip-title">Go straight to DTSLO?</div>',
        '<div id="mh-skip-body">Skip the hub screen on future opens. Change this anytime in your profile settings.</div>',
        '<button class="mh-skip-btn mh-skip-yes" onclick="menuHomePromptYes()">Yes, go straight to DTSLO</button>',
        '<button class="mh-skip-btn mh-skip-no"  onclick="menuHomePromptNo()">No, show me the hub screen</button>',
      '</div>',
    '</div>',

  ].join('');
  document.body.insertBefore(div, document.body.firstChild);

  // Update dev coords display
  if (isDevMode && homeMap) {
    setInterval(function() {
      var el = document.getElementById('mh-dev-coords');
      if (el && homeMap) {
        var c = homeMap.getCenter();
        el.textContent = 'Center: ' + c.lat.toFixed(4) + ', ' + c.lng.toFixed(4) +
          '\nZoom: ' + homeMap.getZoom().toFixed(1) +
          '\nPitch: ' + homeMap.getPitch().toFixed(0) +
          '\nBearing: ' + homeMap.getBearing().toFixed(0);
      }
    }, 500);
  }
}

// ── INJECT CSS ──
function injectCSS() {
  if (document.getElementById('mh-css')) return;
  var s = document.createElement('style');
  s.id = 'mh-css';
  s.textContent = [
    '#menu-home{position:fixed;inset:0;z-index:9998;background:#000;display:none}',
    '#mh-map{position:absolute;inset:0}',
    '#mh-map-overlay{position:absolute;inset:0;z-index:2;background:#000;opacity:1;transition:opacity 1.5s ease;pointer-events:none}',

    // Header
    '#mh-header{position:absolute;top:52px;left:0;right:0;z-index:10;text-align:center;pointer-events:none}',
    '#mh-logo{font-family:Georgia,serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-1px;text-shadow:0 2px 20px rgba(0,0,0,0.8)}',
    '#mh-city{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-top:3px;font-family:Helvetica Neue,sans-serif}',

    // Find hubs button
    '#mh-find-hubs{position:absolute;top:120px;right:16px;z-index:10;background:rgba(8,8,20,0.75);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.8);padding:7px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;backdrop-filter:blur(8px);font-family:Helvetica Neue,sans-serif}',

    // Hub pins on map
    '.mh-hub-marker{background:none;border:none}',
    '.mh-hub-pin{display:flex;flex-direction:column;align-items:center;transition:transform 0.2s}',
    '.mh-hub-active{cursor:pointer}',
    '.mh-hub-active:active{transform:scale(0.95)}',
    '.mh-hub-dim{opacity:0.3;cursor:default}',
    '.mh-hub-dot{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.5)}',
    '.mh-hub-active .mh-hub-dot{animation:mh-float 3s ease-in-out infinite;box-shadow:0 4px 24px rgba(0,0,0,0.5),0 0 30px rgba(255,45,120,0.4)}',
    '@keyframes mh-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
    '.mh-hub-icon{font-size:22px}',
    '.mh-hub-label{margin-top:4px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,0.9);white-space:nowrap;font-family:Helvetica Neue,sans-serif}',
    '.mh-hub-sub{font-size:9px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif;white-space:nowrap}',
    '.mh-hub-enter{font-size:9px;color:#ffd700;font-family:Helvetica Neue,sans-serif;font-weight:800;white-space:nowrap}',

    // Bottom toolbar
    '#mh-toolbar{position:absolute;bottom:0;left:0;right:0;z-index:20;display:flex;background:rgba(6,6,15,0.7);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.08);padding:8px 0 28px}',
    '.mh-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;padding:8px 4px;border-radius:12px;transition:all 0.15s;font-family:Helvetica Neue,sans-serif}',
    '.mh-tab-icon{font-size:22px}',
    '.mh-tab-label{font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}',
    '.mh-tab-active{color:#ffd700}',
    '.mh-tab-active .mh-tab-icon{filter:drop-shadow(0 0 6px rgba(255,215,0,0.6))}',

    // Drawers
    '.mh-drawer{position:absolute;bottom:72px;left:0;right:0;z-index:15;background:rgba(6,6,15,0.92);backdrop-filter:blur(24px);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 20px;transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);max-height:60vh;overflow-y:auto}',
    '.mh-drawer-open{transform:translateY(0)}',
    '.mh-drawer-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin:0 auto 14px;cursor:pointer}',
    '.mh-drawer-title{font-size:16px;font-weight:800;color:#fff;margin-bottom:14px;font-family:Georgia,serif}',

    // Hub cards in drawer
    '.mh-hub-cards{display:flex;flex-direction:column;gap:8px}',
    '.mh-hub-card{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);cursor:pointer;transition:all 0.15s}',
    '.mh-hub-card-active{border-color:rgba(255,45,120,0.3);background:rgba(255,45,120,0.06)}',
    '.mh-hub-card-active:active{transform:scale(0.98)}',
    '.mh-hub-card-soon{opacity:0.45;cursor:default}',
    '.mh-hub-card-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}',
    '.mh-hub-card-info{flex:1}',
    '.mh-hub-card-name{font-size:14px;font-weight:800;color:#fff;font-family:Helvetica Neue,sans-serif}',
    '.mh-hub-card-sub{font-size:11px;color:rgba(255,255,255,0.4);font-family:Helvetica Neue,sans-serif}',
    '.mh-hub-card-arrow{font-size:18px;color:#ffd700}',

    // Tools grid
    '.mh-tools-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.mh-tool-btn{padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;transition:all 0.15s;text-align:left}',
    '.mh-tool-btn:active{transform:scale(0.97)}',

    // Skip prompt
    '#mh-skip-prompt{position:absolute;inset:0;z-index:25;background:rgba(0,0,0,0.6);display:none;align-items:flex-end;opacity:0;transition:opacity 0.35s;backdrop-filter:blur(4px)}',
    '#mh-skip-sheet{width:100%;background:rgba(8,8,20,0.97);border-radius:24px 24px 0 0;padding:20px 24px 52px;border-top:1px solid rgba(255,255,255,0.08)}',
    '.mh-sheet-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 20px}',
    '#mh-skip-title{font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;font-family:Georgia,serif}',
    '#mh-skip-body{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:24px;line-height:1.6;font-family:Helvetica Neue,sans-serif}',
    '.mh-skip-btn{width:100%;padding:15px;border-radius:14px;border:none;font-size:15px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer;margin-bottom:10px}',
    '.mh-skip-yes{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000}',
    '.mh-skip-no{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.1)!important}',
    // Travel drawer CSS
    '.mh-plan-btn{width:100%;padding:14px 16px;border-radius:16px;border:1px solid rgba(255,215,0,0.3);background:rgba(255,215,0,0.07);color:white;font-family:Helvetica Neue,sans-serif;cursor:pointer;display:flex;align-items:center;gap:12px;margin-bottom:16px;transition:all 0.15s}',
    '.mh-plan-btn:active{transform:scale(0.98)}',
    '.mh-travel-tabs{display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;margin-bottom:16px;scrollbar-width:none}',
    '.mh-travel-tabs::-webkit-scrollbar{display:none}',
    '.mh-travel-tab{padding:7px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
    '.mh-travel-tab.active{background:rgba(255,45,120,0.12);border-color:rgba(255,45,120,0.4);color:#ff2d78}',
    '.mh-travel-section{margin-bottom:4px}',
    '.mh-tour-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}',
    '.mh-tour-card{padding:12px;border-radius:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;transition:all 0.15s}',
    '.mh-tour-card:active{transform:scale(0.97);background:rgba(255,255,255,0.07)}',
    '.mh-tour-icon{font-size:24px;margin-bottom:6px}',
    '.mh-tour-name{font-size:12px;font-weight:800;margin-bottom:3px;line-height:1.3}',
    '.mh-tour-meta{font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:6px}',
    '.mh-tour-tags{display:flex;gap:4px;flex-wrap:wrap}',
    '.mh-tag{padding:2px 6px;border-radius:10px;background:rgba(255,255,255,0.06);font-size:9px;font-weight:700;color:rgba(255,255,255,0.4)}',
    '.mh-venue-list{display:flex;flex-direction:column;gap:2px;margin-bottom:16px}',
    '.mh-venue-row{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);cursor:pointer;transition:all 0.15s}',
    '.mh-venue-row:active{background:rgba(255,255,255,0.07)}',
    '.mh-venue-emoji{font-size:22px;flex-shrink:0}',
    '.mh-venue-info{flex:1;min-width:0}',
    '.mh-venue-name{font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.mh-venue-sub{font-size:11px;color:rgba(255,255,255,0.4);margin-top:1px}',
    '.mh-venue-badge{padding:3px 8px;border-radius:20px;font-size:10px;font-weight:800;flex-shrink:0}',

    '.mh-suggestion-tag{padding:7px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:Helvetica Neue,sans-serif}',
    '.mh-suggestion-tag-sel{background:rgba(0,245,255,0.12);border-color:rgba(0,245,255,0.4);color:#00f5ff}',
  ].join('');
  document.head.appendChild(s);
}

