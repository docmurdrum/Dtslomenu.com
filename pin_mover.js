// ══════════════════════════════════════════════
// PIN MOVER.JS
// ══════════════════════════════════════════════

// ── PIN MOVER TOOL ──
var pinMoverActive = false;
var pinMoverTarget = null;

function openPinMover() {
  var existing = document.getElementById('mh-pin-mover');
  if (existing) existing.remove();

  // Close tools drawer
  closeDrawer();

  var sheet = document.createElement('div');
  sheet.id = 'mh-pin-mover';
  sheet.style.cssText = 'position:absolute;bottom:0;left:0;right:0;z-index:23;background:rgba(8,8,20,0.97);border-radius:20px 20px 0 0;border-top:2px solid rgba(255,215,0,0.3);padding:14px 20px 36px;transition:transform 0.3s ease';

  // Get all hub pins on map
  var hubPins = [
    {id:'dtslo',   label:'DTSLO',       coords:[-120.6650,35.2803]},
    {id:'beach',   label:'Beach Hub',   coords:[-120.6750,35.2680]},
    {id:'restaurants', label:'Restaurants', coords:[-120.6655,35.2808]},
    {id:'calpoly', label:'Cal Poly',    coords:[-120.6600,35.3050]},
    {id:'city',    label:'City Hub',    coords:[-120.6590,35.2820]},
  ];

  sheet.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 14px"></div>' +
    '<div style="font-size:16px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">📍 Pin Mover</div>' +
    '<div id="mh-pm-status" style="font-size:12px;color:rgba(255,215,0,0.7);margin-bottom:14px">Select a pin to reposition it on the map</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px" id="mh-pm-pins">' +
      hubPins.map(function(p) {
        return '<div class="mh-pm-pin-btn" onclick="menuHomeSelectPinToMove(this,this.dataset.id)" data-id="' + p.id + '" style="padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:all 0.15s">' +
          '<span style="font-size:13px;font-weight:700">' + p.label + '</span>' +
          '<span style="font-size:11px;color:rgba(255,255,255,0.3)">' + p.coords[1].toFixed(4) + ', ' + p.coords[0].toFixed(4) + '</span>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div style="display:flex;gap:8px">' +
      '<button onclick="menuHomeClosePinMover()" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Cancel</button>' +
      '<button id="mh-pm-save-btn" onclick="menuHomeSavePinPosition()" style="display:none;flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">Save Position</button>' +
    '</div>';

  document.getElementById('menu-home').appendChild(sheet);

  // Tap on map to place pin
  if (homeMap) {
    homeMap.getCanvas().style.cursor = 'default';
  }
}
window.menuHomePinMover = openPinMover;

function selectPinToMove(el, pinId) {
  document.querySelectorAll('.mh-pm-pin-btn').forEach(function(b) {
    b.style.background = 'rgba(255,255,255,0.04)';
    b.style.borderColor = 'rgba(255,255,255,0.08)';
  });
  el.style.background = 'rgba(255,215,0,0.1)';
  el.style.borderColor = 'rgba(255,215,0,0.4)';
  pinMoverTarget = pinId;

  var status = document.getElementById('mh-pm-status');
  if (status) status.textContent = 'Tap anywhere on the map to place the ' + pinId + ' pin';

  // Enable map tap listener
  if (homeMap) {
    homeMap.getCanvas().style.cursor = 'crosshair';
    homeMap.once('click', function(e) {
      var lng = e.lngLat.lng.toFixed(4);
      var lat = e.lngLat.lat.toFixed(4);
      if (status) status.textContent = pinId + ' pin moved to ' + lat + ', ' + lng;
      homeMap.getCanvas().style.cursor = 'default';
      window._newPinCoords = [parseFloat(lng), parseFloat(lat)];
      // Show save button
      var saveBtn = document.getElementById('mh-pm-save-btn');
      if (saveBtn) saveBtn.style.display = 'block';
    });
  }
}
window.menuHomeSelectPinToMove = selectPinToMove;

async function savePinPosition() {
  if (!pinMoverTarget || !window._newPinCoords) return;
  var saveBtn = document.getElementById('mh-pm-save-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }
  try {
    var sb = window.supabaseClient;
    if (sb) {
      await sb.from('app_settings').upsert({
        key: 'hub_pin_' + pinMoverTarget,
        value: JSON.stringify({ coords: window._newPinCoords })
      });
    }
    if (typeof showToast === 'function') showToast('📍 Pin position saved!');
    menuHomeClosePinMover();
  } catch(e) {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Position'; }
    if (typeof showToast === 'function') showToast('❌ Save failed');
  }
}
window.menuHomeSavePinPosition = savePinPosition;

function closePinMover() {
  var s = document.getElementById('mh-pin-mover');
  if (s) s.remove();
  if (homeMap) homeMap.getCanvas().style.cursor = 'default';
  pinMoverActive = false;
  pinMoverTarget = null;
  window._newPinCoords = null;
}
window.menuHomeClosePinMover = closePinMover;

// Hub Placement tool handler
