// ══════════════════════════════════════════════
// PIN_MOVER.JS — Hub Pin Repositioning
// Drag to move · Saves to Supabase · Live update
// ══════════════════════════════════════════════

var pinMoverTarget  = null;
var pinMoverMarkers = {};  // live draggable markers while tool is open
var pinMoverCoords  = {};  // current working coords per hub id

// Hub definitions — source of truth for the tool
var HUB_PIN_DEFS = [
  { id:'dtslo',       label:'DTSLO',        icon:'🌃', color:'#ff2d78', defaultCoords:[-120.6650, 35.2803] },
  { id:'restaurants', label:'Restaurants',  icon:'🍽',  color:'#ef4444', defaultCoords:[-120.6655, 35.2808] },
  { id:'beach',       label:'Beach Hub',    icon:'🏖',  color:'#06b6d4', defaultCoords:[-120.6750, 35.2680] },
  { id:'wine',        label:'Wine Country', icon:'🍷',  color:'#b44fff', defaultCoords:[-120.8200, 35.3600] },
  { id:'brewery',     label:'Craft Beer',   icon:'🍺',  color:'#f59e0b', defaultCoords:[-120.6595, 35.2808] },
  { id:'calpoly',     label:'Cal Poly',     icon:'🎓',  color:'#6366f1', defaultCoords:[-120.6540, 35.2980] },
  { id:'city',        label:'City Hub',     icon:'🏛',  color:'#00f5ff', defaultCoords:[-120.6590, 35.2820] },
];

// ── LOAD SAVED COORDS FROM SUPABASE ──
async function loadSavedPinCoords() {
  var coords = {};
  // Set defaults first
  HUB_PIN_DEFS.forEach(function(h) { coords[h.id] = h.defaultCoords; });

  try {
    var sb = window.supabaseClient;
    if (!sb) return coords;
    var res = await sb.from('app_settings').select('key,value').like('key','hub_pin_%');
    if (res.data) {
      res.data.forEach(function(row) {
        var id = row.key.replace('hub_pin_', '');
        try {
          var v = JSON.parse(row.value);
          if (v && v.coords && v.coords.length === 2) {
            coords[id] = v.coords;
          }
        } catch(e) {}
      });
    }
  } catch(e) {}

  return coords;
}
window.loadSavedPinCoords = loadSavedPinCoords;

// ── OPEN PIN MOVER ──
function openPinMover() {
  var existing = document.getElementById('mh-pin-mover');
  if (existing) existing.remove();

  try { if (typeof closeDrawer === 'function') closeDrawer(); } catch(e) {}

  // Load current coords then build UI
  loadSavedPinCoords().then(function(savedCoords) {
    pinMoverCoords = savedCoords;
    buildPinMoverUI();
    spawnDraggableMarkers();
  }).catch(function() {
    // Use defaults if Supabase fails
    pinMoverCoords = {};
    HUB_PIN_DEFS.forEach(function(h) { pinMoverCoords[h.id] = h.defaultCoords.slice(); });
    buildPinMoverUI();
    spawnDraggableMarkers();
  });
}
window.menuHomePinMover = openPinMover;

function buildPinMoverUI() {
  var sheet = document.createElement('div');
  sheet.id = 'mh-pin-mover';
  sheet.style.cssText = [
    'position:absolute;bottom:0;left:0;right:0;z-index:23',
    'background:rgba(8,8,20,0.96)',
    'border-radius:20px 20px 0 0',
    'border-top:2px solid rgba(255,215,0,0.3)',
    'padding:12px 16px 32px',
    'max-height:50vh',
    'overflow-y:auto',
  ].join(';');

  sheet.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 12px"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
      '<div>' +
        '<div style="font-size:15px;font-weight:800;font-family:Georgia,serif">📍 Pin Mover</div>' +
        '<div id="mh-pm-status" style="font-size:11px;color:rgba(255,215,0,0.7);margin-top:2px">Drag any pin on the map to reposition it</div>' +
      '</div>' +
      '<button onclick="menuHomeClosePinMover()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:30px;height:30px;border-radius:50%;font-size:14px;cursor:pointer">✕</button>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px" id="mh-pm-pins">' +
      HUB_PIN_DEFS.map(function(h) {
        var coords = pinMoverCoords[h.id] || h.defaultCoords;
        return '<div id="pm-hub-' + h.id + '" style="padding:8px 10px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);font-size:11px">' +
          '<div style="font-weight:800;margin-bottom:2px">' + h.icon + ' ' + h.label + '</div>' +
          '<div id="pm-coords-' + h.id + '" style="font-size:9px;color:rgba(255,255,255,0.3);font-family:monospace">' +
            coords[1].toFixed(4) + ', ' + coords[0].toFixed(4) +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>' +

    '<div style="display:flex;gap:8px">' +
      '<button onclick="pmResetAll()" style="padding:10px 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Reset All</button>' +
      '<button onclick="menuHomeSavePinPositions()" id="mh-pm-save-btn" style="flex:1;padding:10px;border-radius:12px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">Save All Pins</button>' +
    '</div>';

  var menuHome = document.getElementById('menu-home');
  if (menuHome) menuHome.appendChild(sheet);
}

// ── SPAWNING DRAGGABLE MARKERS ──
function spawnDraggableMarkers() {
  // Remove any existing pin mover markers
  Object.keys(pinMoverMarkers).forEach(function(id) {
    try { pinMoverMarkers[id].remove(); } catch(e) {}
  });
  pinMoverMarkers = {};

  if (!homeMap || !window.maplibregl) return;

  HUB_PIN_DEFS.forEach(function(hub) {
    var coords = pinMoverCoords[hub.id] || hub.defaultCoords;

    // Create a visually distinct draggable marker
    var el = document.createElement('div');
    el.style.cssText = [
      'width:44px;height:44px',
      'border-radius:50%',
      'background:rgba(8,8,20,0.9)',
      'border:3px solid ' + hub.color,
      'box-shadow:0 0 16px ' + hub.color + ',0 0 4px rgba(0,0,0,0.8)',
      'display:flex;align-items:center;justify-content:center',
      'font-size:20px',
      'cursor:grab',
      'transition:transform 0.1s,box-shadow 0.1s',
      'user-select:none',
      '-webkit-user-select:none',
    ].join(';');
    el.textContent = hub.icon;
    el.title = 'Drag to move ' + hub.label;

    // Visual feedback on drag
    el.addEventListener('mousedown',  function() { el.style.transform='scale(1.2)'; el.style.cursor='grabbing'; });
    el.addEventListener('touchstart', function() { el.style.transform='scale(1.2)'; });

    try {
      var marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
        draggable: true,
      })
      .setLngLat(coords)
      .addTo(homeMap);

      // On drag end — update coords and UI
      marker.on('dragend', function() {
        el.style.transform = 'scale(1)';
        el.style.cursor = 'grab';
        var lngLat = marker.getLngLat();
        var newCoords = [
          parseFloat(lngLat.lng.toFixed(5)),
          parseFloat(lngLat.lat.toFixed(5))
        ];
        pinMoverCoords[hub.id] = newCoords;

        // Update the coordinate display in the sheet
        var coordsEl = document.getElementById('pm-coords-' + hub.id);
        if (coordsEl) coordsEl.textContent = newCoords[1].toFixed(4) + ', ' + newCoords[0].toFixed(4);

        // Highlight the row that changed
        var rowEl = document.getElementById('pm-hub-' + hub.id);
        if (rowEl) {
          rowEl.style.borderColor = hub.color;
          rowEl.style.background = hub.color + '12';
        }

        // Update status
        var status = document.getElementById('mh-pm-status');
        if (status) status.textContent = hub.label + ' moved — tap Save to apply';
      });

      pinMoverMarkers[hub.id] = marker;

    } catch(e) {
      console.warn('[PinMover] marker error:', e);
    }
  });
}

// ── SAVE ALL ──
async function savePinPositions() {
  var saveBtn = document.getElementById('mh-pm-save-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

  var sb = window.supabaseClient;
  if (!sb) {
    if (typeof showToast === 'function') showToast('❌ Not connected');
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save All Pins'; }
    return;
  }

  try {
    // Build upsert array for all hubs
    var upserts = Object.keys(pinMoverCoords).map(function(id) {
      return {
        key: 'hub_pin_' + id,
        value: JSON.stringify({ coords: pinMoverCoords[id] })
      };
    });

    await sb.from('app_settings').upsert(upserts);

    // NOW update the live markers on the actual hub map
    // Remove old static markers and re-add with new coords
    rebuildHubMarkersFromCoords(pinMoverCoords);

    if (typeof showToast === 'function') showToast('✅ Pin positions saved!');

    var status = document.getElementById('mh-pm-status');
    if (status) status.textContent = 'All pins saved ✅';
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save All Pins'; }

  } catch(e) {
    if (typeof showToast === 'function') showToast('❌ Save failed: ' + e.message);
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save All Pins'; }
  }
}
window.menuHomeSavePinPositions = savePinPositions;

// ── REBUILD LIVE HUB MARKERS WITH NEW COORDS ──
function rebuildHubMarkersFromCoords(coordsMap) {
  if (!homeMap || !window.maplibregl) return;

  // Remove all existing hub markers
  var existingMarkers = document.querySelectorAll('.mh-hub-marker');
  existingMarkers.forEach(function(el) {
    // MapLibre markers aren't easy to remove by DOM — track them
  });

  // The cleanest approach: update existing marker positions
  // But since addHubMarkers doesn't track markers, we need to call it fresh
  // First remove all .mh-hub-marker elements from the map canvas
  var markerEls = homeMap.getCanvasContainer().querySelectorAll('.mh-hub-marker');
  markerEls.forEach(function(el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  // Also remove maplibre-gl marker wrappers
  var wrappers = homeMap.getCanvasContainer().querySelectorAll('.maplibregl-marker');
  wrappers.forEach(function(el) {
    // Only remove hub markers (not the pin mover draggable ones)
    if (el.querySelector('.mh-hub-marker') || el.querySelector('.mh-hub-pin')) {
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  });

  // Re-add with updated coords
  // Temporarily patch HUB_PIN_DEFS with new coords
  if (typeof addHubMarkersWithCoords === 'function') {
    addHubMarkersWithCoords(coordsMap);
  } else if (typeof addHubMarkers === 'function') {
    addHubMarkers(coordsMap);
  }
}
window.rebuildHubMarkersFromCoords = rebuildHubMarkersFromCoords;

// ── RESET ALL ──
function pmResetAll() {
  HUB_PIN_DEFS.forEach(function(h) {
    pinMoverCoords[h.id] = h.defaultCoords.slice();
    var marker = pinMoverMarkers[h.id];
    if (marker) marker.setLngLat(h.defaultCoords);
    var coordsEl = document.getElementById('pm-coords-' + h.id);
    if (coordsEl) coordsEl.textContent = h.defaultCoords[1].toFixed(4) + ', ' + h.defaultCoords[0].toFixed(4);
    var rowEl = document.getElementById('pm-hub-' + h.id);
    if (rowEl) { rowEl.style.borderColor = 'rgba(255,255,255,0.08)'; rowEl.style.background = 'rgba(255,255,255,0.04)'; }
  });
  var status = document.getElementById('mh-pm-status');
  if (status) status.textContent = 'All pins reset to defaults — tap Save to apply';
  if (typeof showToast === 'function') showToast('↩️ Pins reset to defaults');
}
window.pmResetAll = pmResetAll;

// ── CLOSE ──
function closePinMover() {
  // Remove draggable markers
  Object.keys(pinMoverMarkers).forEach(function(id) {
    try { pinMoverMarkers[id].remove(); } catch(e) {}
  });
  pinMoverMarkers = {};

  var s = document.getElementById('mh-pin-mover');
  if (s) s.remove();

  if (homeMap) homeMap.getCanvas().style.cursor = 'default';
  pinMoverTarget = null;
  window._newPinCoords = null;
}
window.menuHomeClosePinMover = closePinMover;
