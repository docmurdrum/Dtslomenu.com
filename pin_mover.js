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
  { id:'nature',      label:'Nature Hub',   icon:'🌿',  color:'#22c55e', defaultCoords:[-120.6785, 35.2920] },
  { id:'thrill',      label:'Thrill Hub',   icon:'⚡',  color:'#ef4444', defaultCoords:[-120.6595, 35.2750] },
  { id:'events',      label:'Events Hub',   icon:'🎭',  color:'#ffd700', defaultCoords:[-120.6590, 35.2820] },
];

// ── LOAD SAVED COORDS FROM SUPABASE ──
async function loadSavedPinCoords() {
  var coords = {};
  // Set defaults first
  HUB_PIN_DEFS.forEach(function(h) { coords[h.id] = h.defaultCoords; });

  // Layer 1: localStorage (instant, no network)
  try {
    var local = JSON.parse(localStorage.getItem('dtslo_hub_pins') || '{}');
    Object.keys(local).forEach(function(id) {
      if (local[id] && local[id].length === 2) coords[id] = local[id];
    });
  } catch(e) {}

  // Layer 2: Supabase (authoritative, overwrites local)
  try {
    var sb = supabaseClient;
    if (!sb) return coords;
    var res = await sb.from('app_settings').select('key,value').like('key','hub_pin_%');
    if (res.data && res.data.length) {
      res.data.forEach(function(row) {
        var id = row.key.replace('hub_pin_', '');
        try {
          var v = JSON.parse(row.value);
          if (v && v.coords && v.coords.length === 2) {
            coords[id] = v.coords;
          }
        } catch(e) {}
      });
      // Mirror to localStorage for offline use
      var toStore = {};
      Object.keys(coords).forEach(function(id) { toStore[id] = coords[id]; });
      localStorage.setItem('dtslo_hub_pins', JSON.stringify(toStore));
    }
  } catch(e) {
    console.warn('[pin_mover] Supabase load failed, using localStorage');
  }

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
  // Inject CSS once
  if (!document.getElementById('pm-css')) {
    var s = document.createElement('style');
    s.id = 'pm-css';
    s.textContent = [
      '.pm-hub-tile{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;',
        'background:rgba(255,255,255,0.03);border:1.5px solid rgba(255,255,255,0.08);',
        'cursor:pointer;transition:all 0.15s;margin-bottom:6px}',
      '.pm-hub-tile.active{background:rgba(255,215,0,0.08);border-color:rgba(255,215,0,0.4);}',
      '.pm-hub-tile:active{transform:scale(0.97)}',
      '.pm-hub-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;',
        'justify-content:center;font-size:18px;flex-shrink:0}',
      '.pm-hub-coords{font-size:9px;color:rgba(255,255,255,0.3);font-family:monospace;margin-top:2px}',
      '.pm-hub-moved{font-size:9px;font-weight:700;color:#ffd700;margin-top:2px}',
    ].join('');
    document.head.appendChild(s);
  }

  var sheet = document.createElement('div');
  sheet.id = 'mh-pin-mover';
  sheet.style.cssText = 'position:absolute;bottom:0;left:0;right:0;z-index:23;' +
    'background:rgba(8,8,20,0.97);border-radius:24px 24px 0 0;' +
    'border-top:2px solid rgba(255,215,0,0.3);padding:12px 16px 36px;' +
    'max-height:60vh;overflow-y:auto;backdrop-filter:blur(12px)';

  // Header
  var header = document.createElement('div');
  header.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 14px"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
      '<div>' +
        '<div style="font-size:16px;font-weight:800;font-family:Georgia,serif">📍 Pin Mover</div>' +
        '<div id="mh-pm-status" style="font-size:11px;color:rgba(255,215,0,0.7);margin-top:2px">Drag a glowing pin on the map to reposition</div>' +
      '</div>' +
      '<button onclick="menuHomeClosePinMover()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:14px;cursor:pointer;flex-shrink:0">✕</button>' +
    '</div>';
  sheet.appendChild(header);

  // Hub tiles
  var tilesDiv = document.createElement('div');
  tilesDiv.id = 'mh-pm-pins';

  HUB_PIN_DEFS.forEach(function(h) {
    var coords = pinMoverCoords[h.id] || h.defaultCoords;
    var isDefault = !pinMoverCoords[h.id] ||
      (pinMoverCoords[h.id][0] === h.defaultCoords[0] &&
       pinMoverCoords[h.id][1] === h.defaultCoords[1]);

    var tile = document.createElement('div');
    tile.className = 'pm-hub-tile';
    tile.id = 'pm-hub-' + h.id;

    tile.innerHTML =
      '<div class="pm-hub-icon" style="background:' + (h.color || '#ff2d78') + '22;border:1.5px solid ' + (h.color || '#ff2d78') + '44">' +
        h.icon +
      '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:12px;font-weight:800;margin-bottom:1px">' + h.label + '</div>' +
        '<div id="pm-coords-' + h.id + '" class="pm-hub-coords">' +
          coords[1].toFixed(4) + ', ' + coords[0].toFixed(4) +
        '</div>' +
        (!isDefault ? '<div class="pm-hub-moved">● repositioned</div>' : '') +
      '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.2)">⠿</div>';

    // Tap to fly map to this hub
    tile.addEventListener('click', function() {
      document.querySelectorAll('.pm-hub-tile').forEach(function(t) { t.classList.remove('active'); });
      tile.classList.add('active');
      var c = pinMoverCoords[h.id] || h.defaultCoords;
      if (homeMap) {
        try { homeMap.flyTo({ center: c, zoom: 15, duration: 600 }); } catch(e) {}
      }
      var status = document.getElementById('mh-pm-status');
      if (status) status.textContent = h.label + ' selected — drag the glowing pin to move';
    });

    tilesDiv.appendChild(tile);
  });
  sheet.appendChild(tilesDiv);

  // Buttons
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;margin-top:10px';
  btnRow.innerHTML =
    '<button onclick="pmResetAll()" style="padding:11px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer;flex-shrink:0">Reset All</button>' +
    '<button onclick="menuHomeSavePinPositions()" id="mh-pm-save-btn" style="flex:1;padding:11px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:14px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">💾 Save All Pins</button>';
  sheet.appendChild(btnRow);

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
          rowEl.style.borderColor = hub.color || '#ffd700';
          rowEl.style.background = (hub.color || '#ffd700') + '15';
          var movedEl = rowEl.querySelector('.pm-hub-moved');
          if (!movedEl) {
            var badge = document.createElement('div');
            badge.className = 'pm-hub-moved';
            badge.textContent = '● repositioned';
            var infoDiv = rowEl.querySelector('div[style*="flex:1"]');
            if (infoDiv) infoDiv.appendChild(badge);
          }
          document.querySelectorAll('.pm-hub-tile').forEach(function(t) { t.classList.remove('active'); });
          rowEl.classList.add('active');
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

  var sb = supabaseClient;
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

    var result = await sb.from('app_settings')
      .upsert(upserts, { onConflict: 'key' });

    if (result.error) throw result.error;

    // Mirror to localStorage immediately
    try {
      var toStore = {};
      Object.keys(pinMoverCoords).forEach(function(id) { toStore[id] = pinMoverCoords[id]; });
      localStorage.setItem('dtslo_hub_pins', JSON.stringify(toStore));
    } catch(e) {}

    // Rebuild live markers with new coords immediately
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
