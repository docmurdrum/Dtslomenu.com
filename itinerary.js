// ══════════════════════════════════════════════
// ITINERARY.JS — Plan A + Plan B
// Live tracker + Saved planner + Share pages
// ══════════════════════════════════════════════


// ── GUEST MODE ──
function getGuestId() {
  var id = localStorage.getItem('dtslo_guest_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('dtslo_guest_id', id);
  }
  return id;
}

function isGuest() {
  return typeof currentUser === 'undefined' || !currentUser;
}

function getEffectiveUserId() {
  return currentUser ? currentUser.id : getGuestId();
}


// ── STATE ──
var itin = {
  current: null,      // active itinerary object
  saved: [],          // all saved itineraries
  mode: 'planned',    // 'planned' | 'live'
  activeStopIdx: 0,
  liveTimer: null,
  liveElapsed: 0,     // seconds at current stop
};

// ── INIT FROM PLAN IT RESULT ──
function itinFromPlan(plan, options) {
  options = options || {};
  var startTime = options.startTime || '9:00 PM';
  var usingRide = options.usingRideshare || false;
  var groupSize = options.groupSize || 2;

  var stops = (plan.stops || []).map(function(s) {
    return {
      name:           s.name || '',
      type:           s.type || 'stop',
      description:    s.description || '',
      tip:            s.tip || '',
      cost:           s.cost || '',
      estimated_mins: parseInt(s.duration_mins) || 60,
      actual_mins:    null,
      status:         'pending',
      coords:         null,
      address:        '',
    };
  });

  return {
    id:             Math.random().toString(36).slice(2, 10),
    share_id:       Math.random().toString(36).slice(2, 10),
    name:           plan.headline || 'My Plan',
    mode:           'planned',
    start_time:     startTime,
    using_rideshare:usingRide,
    group_size:     groupSize,
    stops:          stops,
    total_cost:     plan.total_cost || '',
    ride_note:      plan.ride_note || '',
    pro_tip:        plan.pro_tip || '',
    created:        Date.now(),
  };
}
window.itinFromPlan = itinFromPlan;

// ── COST CALCULATIONS ──
function itinCalcCostPerPerson(it) {
  if (!it || !it.stops || !it.stops.length) return '';
  var stops = it.stops;
  // Parse cost strings like "$15-25" into midpoint number
  function parseMid(costStr) {
    if (!costStr) return 0;
    var nums = costStr.match(/\d+/g);
    if (!nums) return 0;
    if (nums.length >= 2) return (parseInt(nums[0]) + parseInt(nums[1])) / 2;
    return parseInt(nums[0]);
  }
  var totalPerPerson = stops.reduce(function(a, s) { return a + parseMid(s.cost); }, 0);
  // Add rideshare costs if enabled
  if (it.using_rideshare) {
    totalPerPerson += stops.length * 4; // ~$4 avg per ride
  }
  return Math.round(totalPerPerson);
}

function itinCalcTotalCost(it) {
  var pp = itinCalcCostPerPerson(it);
  if (!pp) return '';
  var group = it.group_size || 2;
  return pp * group;
}


// ── SAVE / LOAD ──
function itinGetSaved() {
  try { return JSON.parse(localStorage.getItem('dtslo_itineraries') || '[]'); }
  catch(e) { return []; }
}

function itinSave(itinObj) {
  var saved = itinGetSaved();
  var existing = saved.findIndex(function(s) { return s.id === itinObj.id; });
  if (existing >= 0) saved[existing] = itinObj;
  else saved.unshift(itinObj);
  localStorage.setItem('dtslo_itineraries', JSON.stringify(saved));
  // Sync to Supabase via sync layer (debounced)
  if (typeof syncPushItinerary === 'function') syncPushItinerary(itinObj);
}

function itinCheckLimit() {
  var saved = itinGetSaved();
  var unlocked = localStorage.getItem('dtslo_itin_unlocked') === '1' || window._itinUnlocked;
  return unlocked || saved.length < ITINERARY_FREE_LIMIT;
}

// ── OPEN ITINERARY BUILDER ──
function openItineraryBuilder(itinObj, startInLiveMode) {
  itin.current = itinObj;
  itin.mode = startInLiveMode ? 'live' : 'planned';
  itin.activeStopIdx = 0;
  // Set first stop active if going live
  if (startInLiveMode && itinObj.stops.length) {
    itinObj.stops[0].status = 'active';
  }
  itinRenderModal();
}
window.openItineraryBuilder = openItineraryBuilder;

// Open from saved list
function openItinFromSaved() {
  var existing = document.getElementById('itin-modal');
  if (existing) existing.remove();

  var saved = itinGetSaved();
  var modal = document.createElement('div');
  modal.id = 'itin-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:8400;background:rgba(0,0,0,0.88);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center';

  if (!saved.length) {
    modal.innerHTML = itinWrap(
      '<div style="text-align:center;padding:40px 20px">' +
        '<div style="font-size:40px;margin-bottom:12px">🗓</div>' +
        '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:8px">No saved plans yet</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:24px">Use Plan It to generate your first night out plan</div>' +
        '<button onclick="closeItinerary()" style="width:100%;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">Open Plan It</button>' +
      '</div>'
    );
  } else {
    var limitNote = '';

    modal.innerHTML = itinWrap(
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:14px">🗓 My Itineraries</div>' +
      limitNote +
      saved.map(function(s) {
        var stopCount = (s.stops||[]).length;
        var date = new Date(s.created).toLocaleDateString('en-US',{month:'short',day:'numeric'});
        return '<div style="padding:13px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;margin-bottom:8px;cursor:pointer" onclick="itinOpen(\'' + s.id + '\')">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
            '<div style="font-size:14px;font-weight:800">' + (s.name||'My Plan') + '</div>' +
            '<div style="display:flex;gap:8px;align-items:center">' +
              '<div style="font-size:10px;color:rgba(255,255,255,0.3)">' + date + '</div>' +
              '<button onclick="event.stopPropagation();itinDelete(\'' + s.id + '\')" style="background:none;border:none;color:rgba(255,255,255,0.2);cursor:pointer;font-size:14px;padding:0">✕</button>' +
            '</div>' +
          '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">⏰ ' + s.start_time + ' · ' + stopCount + ' stops' + (s.total_cost?' · '+s.total_cost:'') + '</div>' +
          '<div style="display:flex;gap:6px;margin-top:8px">' +
            '<button onclick="event.stopPropagation();itinOpenLive(\'' + s.id + '\')" style="flex:1;padding:8px;border-radius:10px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer">▶ Go Live</button>' +
            '<button onclick="event.stopPropagation();itinShare(\'' + s.id + '\')" style="padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;font-family:inherit;cursor:pointer">Share ↗</button>' +
          '</div>' +
        '</div>';
      }).join('') +

      '<button onclick="closeItinerary()" style="width:100%;margin-top:8px;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Close</button>'
    );
  }

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if(e.target===modal) closeItinerary(); });
  setTimeout(function() {
    var inner = modal.querySelector('#itin-inner');
    if (inner) inner.style.transform = 'translateY(0)';
  }, 30);
}
window.openItinFromSaved = openItinFromSaved;

function itinOpen(id) {
  var saved = itinGetSaved();
  var found = saved.find(function(s) { return s.id === id; });
  if (found) openItineraryBuilder(found, false);
}
window.itinOpen = itinOpen;

function itinOpenLive(id) {
  var saved = itinGetSaved();
  var found = saved.find(function(s) { return s.id === id; });
  if (found) {
    found.stops.forEach(function(s) { s.status = 'pending'; s.actual_mins = null; });
    found.stops[0].status = 'active';
    openItineraryBuilder(found, true);
  }
}
window.itinOpenLive = itinOpenLive;

function itinDelete(id) {
  var saved = itinGetSaved().filter(function(s) { return s.id !== id; });
  localStorage.setItem('dtslo_itineraries', JSON.stringify(saved));
  openItinFromSaved();
}
window.itinDelete = itinDelete;

// ── RENDER MAIN MODAL ──
function itinRenderModal() {
  var existing = document.getElementById('itin-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'itin-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:8400;background:rgba(0,0,0,0.88);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center';

  modal.innerHTML = itinWrap(
    itin.mode === 'live' ? itinRenderLive() : itinRenderPlanned()
  );

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if(e.target===modal) closeItinerary(); });
  setTimeout(function() {
    var inner = modal.querySelector('#itin-inner');
    if (inner) inner.style.transform = 'translateY(0)';
    if (itin.mode === 'live') itinStartLiveTimer();
    // Check for group notifications
    try { itinCheckGroupNotifs(); } catch(e) {}
  }, 30);
}

function itinWrap(body) {
  return '<div id="itin-inner" style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:28px 28px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:14px 20px 48px;max-height:92vh;overflow-y:auto;transform:translateY(30px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12)"></div>' +
      '<button onclick="closeItinerary()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:30px;height:30px;border-radius:50%;font-size:14px;cursor:pointer">✕</button>' +
    '</div>' +
    body +
  '</div>';
}

// ── PLANNED MODE ──
function itinRenderPlanned() {
  var it = itin.current;
  if (!it) return '';

  var times = itinCalcTimes(it);
  var totalMins = it.stops.reduce(function(a,s){return a+(s.estimated_mins||60);},0);
  var totalHrs = Math.floor(totalMins/60);
  var totalRem = totalMins%60;

  var html =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">' +
      '<div style="font-size:22px">🗓</div>' +
      '<div style="flex:1">' +
        '<input id="itin-name-input" value="' + (it.name||'My Plan') + '" style="background:none;border:none;color:white;font-size:16px;font-weight:800;font-family:Georgia,serif;width:100%;outline:none" onchange="itin.current.name=this.value">' +
      '</div>' +
      '<button onclick="itinGoLive()" style="padding:7px 14px;border-radius:20px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;font-size:12px;font-weight:800;font-family:inherit;cursor:pointer">▶ Go Live</button>' +
    '</div>' +

    // Start time + rideshare row
    '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Starts</div>' +
      '<input id="itin-start" type="time" value="' + itinTo24(it.start_time) + '" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white;font-size:12px;font-weight:700;padding:4px 8px;font-family:inherit;outline:none" onchange="itinUpdateStart(this.value)">' +
      '<div style="flex:1"></div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.4)">👥</div>' +
      '<select id="itin-group-size" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white;font-size:12px;font-weight:700;padding:4px 6px;font-family:inherit;outline:none" onchange="itin.current.group_size=parseInt(this.value);itinRenderModal()">' +
        [1,2,3,4,5,6,7,8].map(function(n){ return '<option value="'+n+'"'+(n===(it.group_size||2)?' selected':'')+'>'+n+'</option>'; }).join('') +
      '</select>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.4)">🚗</div>' +
      '<label style="display:flex;align-items:center">' +
        '<input type="checkbox" id="itin-ride-check" ' + (it.using_rideshare?'checked':'') + ' onchange="itin.current.using_rideshare=this.checked;itinRenderModal()" style="accent-color:#22c55e">' +
      '</label>' +
    '</div>' +

    // Summary row
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">' +
      itinSummaryCard('Stops', it.stops.length + '') +
      itinSummaryCard('Duration', totalHrs + 'h' + (totalRem?totalRem+'m':'')) +
      itinSummaryCard('Per Person', itinCalcCostPerPerson(it) ? '$'+itinCalcCostPerPerson(it) : '—') +
      itinSummaryCard('Total (' + (it.group_size||2) + ')', itinCalcTotalCost(it) ? '$'+itinCalcTotalCost(it) : '—') +
    '</div>' +

    // Stop list
    '<div id="itin-stops-list">' +
      itinRenderStops(it, times) +
    '</div>' +

    // Add stop button
    '<button onclick="itinAddCustomStop()" style="width:100%;padding:11px;border-radius:12px;border:1px dashed rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:12px">+ Add Stop</button>' +

    // Action row
    '<div style="display:flex;gap:8px">' +
      '<button onclick="itinSaveAndClose()" style="flex:1;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer">Save Plan</button>' +
      '<button onclick="itinShare(itin.current.id)" style="padding:13px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Share ↗</button>' +
    '</div>' +

    // Order preview card
    itinRenderOrderPreview(it);

  return html;
}

function itinSummaryCard(label, value) {
  return '<div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07);text-align:center">' +
    '<div style="font-size:16px;font-weight:900;color:white">' + value + '</div>' +
    '<div style="font-size:9px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.5px;margin-top:2px">' + label + '</div>' +
  '</div>';
}

function itinRenderStops(it, times) {
  return it.stops.map(function(s, i) {
    var arrivalTime = times[i] || '';
    var dur = s.estimated_mins || 60;
    var durLabel = Math.floor(dur/60) > 0 ? Math.floor(dur/60)+'h'+(dur%60?dur%60+'m':'') : dur+'min';

    // Rideshare cost to next stop
    var rideSegment = '';
    if (it.using_rideshare && i < it.stops.length - 1) {
      var rideCost = itinEstRideCost(s, it.stops[i+1]);
      rideSegment = '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;margin:4px 0;background:rgba(34,197,94,0.05);border-radius:8px;font-size:11px;color:rgba(255,255,255,0.4)">' +
        '<span>🚗 Ride to next stop</span>' +
        '<span style="margin-left:auto;color:#22c55e;font-weight:700">~' + rideCost + '</span>' +
      '</div>';
    }

    // Wishlist chip
    var savedItems = itinGetStopSavedItems(s.name);
    var hasSaves = savedItems.length > 0;
    var borderStyle = hasSaves
      ? 'border:1px solid rgba(255,215,0,0.3)'
      : 'border:1px solid rgba(255,255,255,0.08)';

    var wishlistChip = hasSaves
      ? '<div style="display:flex;align-items:center;gap:8px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2);border-radius:10px;padding:7px 10px;margin-top:8px">' +
          '<span style="font-size:14px">🛍</span>' +
          '<span style="font-size:12px;font-weight:700;color:#ffd700;flex:1">' + savedItems.length + ' item' + (savedItems.length !== 1 ? 's' : '') + ' saved</span>' +
          '<span style="font-size:10px;color:rgba(255,255,255,0.3)">Tap bar name to view</span>' +
        '</div>'
      : '';

    // Find bar index for tap-through
    var barIdx = -1;
    if (typeof bars !== 'undefined') {
      for (var b = 0; b < bars.length; b++) {
        if (bars[b].name === s.name) { barIdx = b; break; }
      }
    }
    var nameClickable = barIdx >= 0
      ? 'style="font-size:13px;font-weight:800;flex:1;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(255,255,255,0.2)" onclick="openBarPage(' + barIdx + ')"'
      : 'style="font-size:13px;font-weight:800;flex:1"';

    return '<div style="margin-bottom:4px">' +
      '<div style="padding:12px;background:rgba(255,255,255,0.04);' + borderStyle + ';border-radius:12px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
          '<div style="font-size:10px;font-weight:800;color:#ffd700;background:rgba(255,215,0,0.1);padding:3px 8px;border-radius:20px;white-space:nowrap">' + arrivalTime + '</div>' +
          '<div ' + nameClickable + '>' + s.name + (barIdx >= 0 ? ' <span style="opacity:0.4;font-size:11px">›</span>' : '') + '</div>' +
          '<button onclick="itinEditStop(' + i + ')" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:13px;padding:2px">✏️</button>' +
          '<button onclick="itinRemoveStop(' + i + ')" style="background:none;border:none;color:rgba(255,255,255,0.2);cursor:pointer;font-size:13px;padding:2px">✕</button>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.35)">' +
          '<span>' + (s.type||'') + '</span>' +
          '<span style="display:flex;gap:8px">' +
            (s.cost ? '<span style="color:#22c55e;font-weight:700">' + s.cost + '</span>' : '') +
            '<span>⏱ ' + durLabel + '</span>' +
            '<button onclick="itinAdjustDur(' + i + ',-15)" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.4);border-radius:4px;padding:1px 5px;font-size:10px;cursor:pointer">-15</button>' +
            '<button onclick="itinAdjustDur(' + i + ',15)" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.4);border-radius:4px;padding:1px 5px;font-size:10px;cursor:pointer">+15</button>' +
            '<button onclick="itinAdjustDur(' + i + ',60)" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.4);border-radius:4px;padding:1px 5px;font-size:10px;cursor:pointer">+1h</button>' +
          '</span>' +
        '</div>' +
        (s.tip ? '<div style="font-size:10px;color:#ffd700;margin-top:4px">💡 ' + s.tip + '</div>' : '') +
        wishlistChip +
      '</div>' +
      rideSegment +
    '</div>';
  }).join('');
}

// ── LIVE MODE ──
function itinRenderLive() {
  var it = itin.current;
  if (!it) return '';

  var times = itinCalcTimes(it);
  var activeIdx = it.stops.findIndex(function(s) { return s.status === 'active'; });
  if (activeIdx < 0) activeIdx = itin.activeStopIdx;
  var activeStop = it.stops[activeIdx];
  if (!activeStop) return itinRenderLiveComplete();

  var nextStop = it.stops[activeIdx + 1];
  var doneCount = it.stops.filter(function(s){return s.status==='done';}).length;
  var totalStops = it.stops.length;

  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">' +
    '<div style="font-size:20px">▶</div>' +
    '<div style="flex:1"><div style="font-size:16px;font-weight:800;font-family:Georgia,serif">' + it.name + '</div>' +
    '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Stop ' + (doneCount+1) + ' of ' + totalStops + '</div></div>' +
    '<button onclick="itinExitLive()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.4);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer">Exit Live</button>' +
  '</div>' +

  // Progress bar
  '<div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-bottom:16px;overflow:hidden">' +
    '<div style="height:100%;background:linear-gradient(90deg,#22c55e,#ffd700);border-radius:2px;transition:width 0.5s;width:' + Math.round((doneCount/totalStops)*100) + '%"></div>' +
  '</div>' +

  // Current stop hero
  '<div style="padding:16px;background:rgba(34,197,94,0.08);border:2px solid rgba(34,197,94,0.3);border-radius:16px;margin-bottom:12px">' +
    '<div style="font-size:10px;font-weight:700;color:#22c55e;letter-spacing:1px;margin-bottom:6px">📍 YOU ARE HERE</div>' +
    '<div style="font-size:18px;font-weight:800;margin-bottom:4px">' + activeStop.name + '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:10px">' + (activeStop.description||activeStop.type||'') + '</div>' +
    // Timer
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
      '<div>' +
        '<div id="itin-live-timer" style="font-size:28px;font-weight:900;color:#22c55e;font-family:monospace">0:00</div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.3)">Time here · Est. ' + (activeStop.estimated_mins||60) + 'min</div>' +
      '</div>' +
      '<div style="text-align:right">' +
        (activeStop.cost ? '<div style="font-size:15px;font-weight:800;color:#22c55e">' + activeStop.cost + '</div>' +
        '<div style="font-size:9px;color:rgba(255,255,255,0.3)">per person</div>' : '') +
        (it.group_size > 1 && activeStop.cost ?
          (function(){
            var nums = (activeStop.cost||'').match(/\d+/g);
            if (nums && nums.length >= 2) {
              var mid = Math.round((parseInt(nums[0])+parseInt(nums[1]))/2);
              return '<div style="font-size:12px;color:#22c55e;font-weight:700;margin-top:2px">~$' + (mid*(it.group_size||2)) + ' total</div>' +
                     '<div style="font-size:9px;color:rgba(255,255,255,0.3)">group of ' + (it.group_size||2) + '</div>';
            }
            return '';
          })()
        : '') +
      '</div>' +
    '</div>' +
    (activeStop.tip ? '<div style="font-size:11px;color:#ffd700;padding:6px 8px;background:rgba(255,215,0,0.06);border-radius:8px">💡 ' + activeStop.tip + '</div>' : '') +
  '</div>' +

  // Add time buttons
  '<div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:1px;margin-bottom:6px">RUNNING LATE? ADD TIME</div>' +
  '<div style="display:flex;gap:8px;margin-bottom:14px">' +
    '<button onclick="itinAddTime(15)" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,165,0,0.2);background:rgba(255,165,0,0.06);color:#f59e0b;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer">+15 min</button>' +
    '<button onclick="itinAddTime(30)" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,165,0,0.2);background:rgba(255,165,0,0.06);color:#f59e0b;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer">+30 min</button>' +
    '<button onclick="itinAddTime(60)" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,165,0,0.2);background:rgba(255,165,0,0.06);color:#f59e0b;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer">+1 hour</button>' +
  '</div>' +

  // Next stop preview
  (nextStop ?
    '<div style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:12px;display:flex;align-items:center;gap:10px">' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.35)">NEXT</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + nextStop.name + '</div>' +
      '<div style="font-size:10px;color:rgba(255,255,255,0.35)">' + (times[activeIdx+1]||'') + (nextStop.cost?' · '+nextStop.cost:'') + '</div></div>' +
      (it.using_rideshare ? '<div style="font-size:11px;color:#22c55e;font-weight:700">' + itinEstRideCost(activeStop, nextStop) + '</div>' : '') +
    '</div>' : '') +

  // Next stop button
  '<button onclick="itinNextStop()" style="width:100%;padding:15px;border-radius:16px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer">' +
    (nextStop ? 'Next Stop →' : '🏁 Finish Night') +
  '</button>';
}

function itinRenderLiveComplete() {
  var it = itin.current;
  var totalActual = it.stops.reduce(function(a,s){return a+(s.actual_mins||s.estimated_mins||0);},0);
  var hrs = Math.floor(totalActual/60), mins = totalActual%60;
  return '<div style="text-align:center;padding:20px">' +
    '<div style="font-size:48px;margin-bottom:12px">🏁</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:8px">Night complete!</div>' +
    '<div style="font-size:14px;color:rgba(255,255,255,0.5);margin-bottom:20px">You hit ' + it.stops.length + ' stops in ' + hrs + 'h ' + mins + 'min</div>' +
    '<button onclick="closeItinerary()" style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer">Done 🎉</button>' +
  '</div>';
}

// ── LIVE TIMER ──
function itinStartLiveTimer() {
  itin.liveElapsed = 0;
  if (itin.liveTimer) clearInterval(itin.liveTimer);
  itin.liveTimer = setInterval(function() {
    itin.liveElapsed++;
    var el = document.getElementById('itin-live-timer');
    if (!el) { clearInterval(itin.liveTimer); return; }
    var mins = Math.floor(itin.liveElapsed / 60);
    var secs = itin.liveElapsed % 60;
    el.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    // Color warning if over estimated time
    var activeStop = itin.current && itin.current.stops.find(function(s){return s.status==='active';});
    if (activeStop && itin.liveElapsed > (activeStop.estimated_mins||60)*60) {
      el.style.color = '#f59e0b';
    }
  }, 1000);
}

// ── ACTIONS ──
function itinAddTime(mins) {
  if (!itin.current) return;
  // Push estimated time at current and all future stops
  var activeIdx = itin.current.stops.findIndex(function(s){return s.status==='active';});
  if (activeIdx < 0) activeIdx = itin.activeStopIdx;
  itin.current.stops[activeIdx].estimated_mins = (itin.current.stops[activeIdx].estimated_mins || 60) + mins;
  if (typeof showToast === 'function') showToast('⏱ +' + mins + ' min added — schedule pushed back');
  itinRenderModal();
}
window.itinAddTime = itinAddTime;

function itinNextStop() {
  if (!itin.current) return;
  var activeIdx = itin.current.stops.findIndex(function(s){return s.status==='active';});
  if (activeIdx < 0) return;

  // Record actual time
  var actualMins = Math.round(itin.liveElapsed / 60);
  itin.current.stops[activeIdx].actual_mins = actualMins;
  itin.current.stops[activeIdx].status = 'done';
  if (itin.liveTimer) { clearInterval(itin.liveTimer); itin.liveTimer = null; }

  // Log dwell time (anonymous data)
  itinLogDwell(itin.current.stops[activeIdx], actualMins);

  var nextIdx = activeIdx + 1;
  if (nextIdx < itin.current.stops.length) {
    // Show rideshare prompt if needed
    if (itin.current.using_rideshare) {
      itinShowRidePrompt(itin.current.stops[activeIdx], itin.current.stops[nextIdx], function() {
        itin.current.stops[nextIdx].status = 'active';
        itin.activeStopIdx = nextIdx;
        itinSave(itin.current);
        itinRenderModal();
      });
    } else {
      itin.current.stops[nextIdx].status = 'active';
      itin.activeStopIdx = nextIdx;
      itinSave(itin.current);
      itinRenderModal();
    }
  } else {
    // All done
    itinSave(itin.current);
    itinRenderModal();
  }
}
window.itinNextStop = itinNextStop;

function itinShowRidePrompt(fromStop, toStop, onContinue) {
  var existing = document.getElementById('itin-ride-prompt');
  if (existing) existing.remove();

  var rideCost = itinEstRideCost(fromStop, toStop);
  var walkMins = itinEstWalkMins(fromStop, toStop);

  var prompt = document.createElement('div');
  prompt.id = 'itin-ride-prompt';
  prompt.style.cssText = 'position:fixed;inset:0;z-index:8500;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center';
  prompt.innerHTML =
    '<div style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(34,197,94,0.3);padding:20px 20px 40px">' +
      '<div style="font-size:16px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">Getting to ' + toStop.name + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px">Choose how you want to get there</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:10px">' +
        '<a href="https://m.uber.com/ul/?action=setPickup&pickup=my_location" target="_blank" style="flex:1;padding:13px;border-radius:12px;border:none;background:rgba(0,0,0,0.8);color:white;font-size:13px;font-weight:800;text-align:center;text-decoration:none;border:1px solid rgba(255,255,255,0.1)">🚗 Uber<br><span style="font-size:10px;color:rgba(255,255,255,0.4)">~' + rideCost + '</span></a>' +
        '<a href="https://lyft.com/ride" target="_blank" style="flex:1;padding:13px;border-radius:12px;border:none;background:rgba(233,30,140,0.2);color:white;font-size:13px;font-weight:800;text-align:center;text-decoration:none;border:1px solid rgba(233,30,140,0.3)">🩷 Lyft<br><span style="font-size:10px;color:rgba(255,255,255,0.4)">~' + rideCost + '</span></a>' +
        (walkMins <= 12 ?
          '<button onclick="document.getElementById(\'itin-ride-prompt\').remove();(' + onContinue.toString() + ')()" style="flex:1;padding:13px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.6);font-size:12px;font-weight:800;font-family:inherit;cursor:pointer">🚶 Walk<br><span style="font-size:10px;color:rgba(255,255,255,0.35)">' + walkMins + ' min</span></button>' : '') +
      '</div>' +
      '<button onclick="document.getElementById(\'itin-ride-prompt\').remove();(' + onContinue.toString() + ')()" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Skip — I\'ll figure it out</button>' +
    '</div>';

  document.body.appendChild(prompt);
  // Clicking outside also continues
  prompt.addEventListener('click', function(e) {
    if (e.target === prompt) { prompt.remove(); onContinue(); }
  });
}

function itinAdjustDur(idx, deltaMins) {
  if (!itin.current) return;
  var s = itin.current.stops[idx];
  s.estimated_mins = Math.max(15, (s.estimated_mins||60) + deltaMins);
  itinRenderModal();
}
window.itinAdjustDur = itinAdjustDur;

function itinUpdateStart(timeVal) {
  if (!itin.current || !timeVal) return;
  // Convert 24h to 12h
  var parts = timeVal.split(':');
  var h = parseInt(parts[0]), m = parseInt(parts[1]||0);
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h > 12 ? h-12 : h === 0 ? 12 : h;
  itin.current.start_time = h12 + ':' + (m<10?'0':'') + m + ' ' + ampm;
  // Re-render just the stops list
  var stopsEl = document.getElementById('itin-stops-list');
  if (stopsEl) stopsEl.innerHTML = itinRenderStops(itin.current, itinCalcTimes(itin.current));
}
window.itinUpdateStart = itinUpdateStart;

function itinRemoveStop(idx) {
  if (!itin.current) return;
  itin.current.stops.splice(idx, 1);
  itinRenderModal();
}
window.itinRemoveStop = itinRemoveStop;

function itinEditStop(idx) {
  var s = itin.current && itin.current.stops[idx];
  if (!s) return;
  var newName = prompt('Stop name:', s.name);
  if (newName !== null) s.name = newName || s.name;
  var newDur = prompt('Duration (minutes):', s.estimated_mins || 60);
  if (newDur !== null) s.estimated_mins = parseInt(newDur) || s.estimated_mins;
  itinRenderModal();
}
window.itinEditStop = itinEditStop;

function itinAddCustomStop() {
  var name = prompt('Stop name (bar, restaurant, etc.):');
  if (!name) return;
  var dur = parseInt(prompt('How long? (minutes)', '60')) || 60;
  var cost = prompt('Cost per person? (e.g. $15-25, or leave blank)') || '';
  itin.current.stops.push({
    name: name, type: 'custom',
    estimated_mins: dur, actual_mins: null,
    cost: cost, tip: '', status: 'pending',
  });
  itinRenderModal();
}
window.itinAddCustomStop = itinAddCustomStop;

function itinGoLive() {
  if (!itin.current) return;
  itin.current.stops.forEach(function(s){s.status='pending';s.actual_mins=null;});
  if (itin.current.stops.length) itin.current.stops[0].status = 'active';
  itin.mode = 'live';
  itin.activeStopIdx = 0;
  itin.liveElapsed = 0;
  itinRenderModal();
}
window.itinGoLive = itinGoLive;

function itinExitLive() {
  if (itin.liveTimer) { clearInterval(itin.liveTimer); itin.liveTimer = null; }
  itin.mode = 'planned';
  // Reset stop statuses
  if (itin.current) itin.current.stops.forEach(function(s){s.status='pending';});
  itinRenderModal();
}
window.itinExitLive = itinExitLive;

function itinSaveAndClose() {
  if (!itin.current) { closeItinerary(); return; }
  var saved = itinGetSaved();
  var unlocked = localStorage.getItem('dtslo_itin_unlocked') === '1';
  var isNew = !saved.find(function(s){return s.id===itin.current.id;});
  if (isNew && saved.length >= ITINERARY_FREE_LIMIT && !unlocked) {
    itinUnlockPrompt();
    return;
  }
  itinSave(itin.current);
  if (typeof showToast === 'function') showToast('✅ ' + (itin.current.name||'Plan') + ' saved!');
  closeItinerary();
}
window.itinSaveAndClose = itinSaveAndClose;

function itinUnlockPrompt() {
  var existing = document.getElementById('itin-unlock-modal');
  if (existing) existing.remove();
  var m = document.createElement('div');
  m.id = 'itin-unlock-modal';
  m.style.cssText = 'position:fixed;inset:0;z-index:8600;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px';
  m.innerHTML =
    '<div style="background:rgba(8,8,20,0.99);border-radius:24px;border:1px solid rgba(180,79,255,0.3);padding:28px 24px;max-width:340px;width:100%;text-align:center">' +
      '<div style="font-size:40px;margin-bottom:12px">✨</div>' +
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:8px">Unlock Unlimited Plans</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:20px">You\'ve used your 3 free itinerary slots. Unlock unlimited saved plans for a one-time fee.</div>' +
      '<div style="font-size:32px;font-weight:900;color:#b44fff;margin-bottom:4px">$2.99</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:20px">One-time · Keep forever</div>' +
      '<button onclick="itinProcessUnlock()" style="width:100%;padding:14px;border-radius:14px;border:none;background:linear-gradient(135deg,#b44fff,#7c3aed);color:white;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;margin-bottom:8px">Unlock Now — $2.99</button>' +
      '<button onclick="document.getElementById(\'itin-unlock-modal\').remove()" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Not now</button>' +
    '</div>';
  document.body.appendChild(m);
}
window.itinUnlockPrompt = itinUnlockPrompt;

function itinProcessUnlock() {
  // Payment placeholder — set flag locally for now
  // Real implementation: Stripe Checkout or Apple/Google IAP
  localStorage.setItem('dtslo_itin_unlocked', '1');
  window._itinUnlocked = true;
  if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseClient !== 'undefined') {
    supabaseClient.from('profiles').update({ itinerary_unlocked: true }).eq('id', currentUser.id).then(function(){}).catch(function(){});
    supabaseClient.from('itinerary_unlocks').insert({ user_id: currentUser.id, price: '$2.99' }).then(function(){}).catch(function(){});
  }
  document.getElementById('itin-unlock-modal')?.remove();
  if (typeof showToast === 'function') showToast('✨ Unlimited itineraries unlocked!');
  if (itin.current) itinSaveAndClose();
}
window.itinProcessUnlock = itinProcessUnlock;

function itinShare(id) {
  var saved = itinGetSaved();
  var it = saved.find(function(s){return s.id===id;}) || itin.current;
  if (!it) return;
  var shareUrl = 'https://dtslomenu.com/plan/' + (it.share_id || it.id);
  if (navigator.share) {
    navigator.share({ title: it.name, text: 'Check out tonight\'s plan!', url: shareUrl }).catch(function(){});
  } else {
    navigator.clipboard.writeText(shareUrl).then(function(){
      if (typeof showToast === 'function') showToast('📋 Share link copied!');
    }).catch(function(){
      if (typeof showToast === 'function') showToast('Share: ' + shareUrl);
    });
  }
}
window.itinShare = itinShare;

function closeItinerary() {
  if (itin.liveTimer) { clearInterval(itin.liveTimer); itin.liveTimer = null; }
  var m = document.getElementById('itin-modal');
  if (m) {
    var inner = m.querySelector('#itin-inner');
    if (inner) inner.style.transform = 'translateY(100%)';
    setTimeout(function(){m.remove();}, 350);
  }
}
window.closeItinerary = closeItinerary;

// ── HELPERS ──
function itinCalcTimes(it) {
  var times = [];
  var baseTime = itinParseTime(it.start_time || '9:00 PM');
  var current = baseTime;
  it.stops.forEach(function(s, i) {
    times.push(itinFormatTime(current));
    current += (s.estimated_mins || 60);
  });
  return times;
}

function itinParseTime(str) {
  // Returns minutes since midnight
  var m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 21 * 60; // default 9pm
  var h = parseInt(m[1]), min = parseInt(m[2]), ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

function itinFormatTime(totalMins) {
  var h = Math.floor(totalMins / 60) % 24;
  var m = totalMins % 60;
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h > 12 ? h-12 : h === 0 ? 12 : h;
  return h12 + ':' + (m<10?'0':'') + m + ' ' + ampm;
}

function itinTo24(str) {
  var m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return '21:00';
  var h = parseInt(m[1]), min = parseInt(m[2]), ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return (h<10?'0':'') + h + ':' + (m[2]||'00');
}

function itinEstRideCost(fromStop, toStop) {
  // Rough estimate — SLO is small, most rides $8-15
  var baseCost = 8 + Math.random() * 6;
  return '$' + Math.floor(baseCost) + '-' + Math.ceil(baseCost + 4);
}

function itinEstWalkMins(fromStop, toStop) {
  // SLO downtown is walkable — most spots 5-12 min
  return 5 + Math.floor(Math.random() * 8);
}

function itinLogDwell(stop, actualMins) {
  if (!actualMins || actualMins < 1) return;
  var now = new Date();
  var data = {
    venue_name: stop.name,
    venue_type: stop.type || 'bar',
    estimated_mins: stop.estimated_mins || 60,
    actual_mins: actualMins,
    day_of_week: now.getDay(),
    hour_of_day: now.getHours(),
  };
  if (typeof currentUser !== 'undefined' && currentUser) data.user_id = currentUser.id;
  if (typeof supabaseClient !== 'undefined') {
    supabaseClient.from('dwell_logs').insert(data).then(function(){}).catch(function(){});
  }
}

function itinShowSignupForUpgrade() {
  // Close unlock modal
  var m = document.getElementById('itin-unlock-modal');
  if (m) m.remove();
  // Show auth screen with pending upgrade flag
  window._pendingItinUpgrade = true;
  window._pendingDTSLOEntry = false;
  var authEl = document.getElementById('auth-screen');
  if (authEl) {
    authEl.style.display  = 'flex';
    authEl.style.zIndex   = '9999';
    authEl.style.position = 'fixed';
    authEl.style.inset    = '0';
  }
  if (typeof maybeShowAuthBackBtn === 'function') maybeShowAuthBackBtn();
}
window.itinShowSignupForUpgrade = itinShowSignupForUpgrade;

// ── ADD BUSINESS TO ITINERARY (called from bar/business pages) ──
function itinAddBusinessStop(name, type, estimatedMins, costRange, tip) {
  // Create itinerary if none exists
  if (!itin.current) {
    itin.current = {
      id: 'itin_' + Date.now(),
      share_id: Math.random().toString(36).slice(2,10),
      name: 'Tonight',
      mode: 'planned',
      start_time: '9:00 PM',
      using_rideshare: false,
      stops: [],
      total_cost: '',
    };
  }

  var stop = {
    name: name || 'Stop',
    type: type || 'bar',
    estimated_mins: estimatedMins || 60,
    actual_mins: null,
    cost: costRange || '',
    tip: tip || '',
    status: 'pending',
  };

  itin.current.stops.push(stop);
  itinSaveLocal();

  if (typeof showToast === 'function') {
    showToast('✅ ' + name + ' added to itinerary!');
  }

  // Show option to open itinerary
  setTimeout(function() {
    if (typeof showToast === 'function') showToast('Tap 🗓 to view your plan');
  }, 2000);
}
window.itinAddBusinessStop = itinAddBusinessStop;

// Quick Plan It — opens mini sheet from bar/business page
// itinPlanItFor — shows quick action sheet then delegates to universal openPlanIt
function itinPlanItFor(name, type) {
  var existing = document.getElementById('itin-quick-sheet');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'itin-quick-sheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.2);padding:16px 20px 48px';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px"></div>' +
    '<div style="font-size:16px;font-weight:800;margin-bottom:4px">✨ Plan It</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:20px">Build tonight around <strong style="color:rgba(255,255,255,0.8)">' + name + '</strong></div>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
      '<button id="itin-quick-add" style="padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#f59e0b);color:#000;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">🗓 Add to Itinerary</button>' +
      '<button id="itin-quick-plan" style="padding:13px;border-radius:14px;border:1px solid rgba(180,79,255,0.3);background:rgba(180,79,255,0.06);color:#b44fff;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">✨ Plan Full Night with AI</button>' +
      '<button id="itin-quick-cancel" style="padding:11px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Cancel</button>' +
    '</div>';

  sheet.appendChild(inner);
  document.body.appendChild(sheet);

  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('itin-quick-add').onclick = function() {
      sheet.remove();
      itinAddBusinessStop(name, type || 'bar', 60, '', '');
    };
    document.getElementById('itin-quick-plan').onclick = function() {
      sheet.remove();
      if (typeof openPlanIt === 'function') openPlanIt();
    };
    document.getElementById('itin-quick-cancel').onclick = function() { sheet.remove(); };
  }, 30);

  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
}
window.itinPlanItFor = itinPlanItFor;

// ══════════════════════════════════════════════
// ITINERARY CHECK-IN INTEGRATION
// Called from lines.js when user checks in at a bar
// Only active when itinerary is in live mode
// ══════════════════════════════════════════════

function itinHandleCheckin(barName) {
  // Only fire in live mode with an active itinerary
  if (!itin.current || itin.mode !== 'live') return;

  var stops = itin.current.stops;
  var activeIdx = stops.findIndex(function(s) { return s.status === 'active'; });
  if (activeIdx < 0) activeIdx = itin.activeStopIdx;

  // Normalize bar name for comparison
  var normalize = function(s) { return (s||'').toLowerCase().replace(/[^a-z0-9]/g,''); };
  var checkedIn = normalize(barName);

  // Find matching stop
  var matchIdx = stops.findIndex(function(s) { return normalize(s.name) === checkedIn; });

  if (matchIdx === activeIdx) {
    // Checking in at current stop — already active, nothing to do
    return;
  }

  if (matchIdx > activeIdx) {
    // Checking in at a LATER stop — skipping some stops
    itinSkipToStop(matchIdx, activeIdx);
  } else if (matchIdx < 0) {
    // Bar is NOT on the plan — ask how long, then insert it
    itinPromptUnplannedStop(barName, activeIdx);
  }
  // matchIdx < activeIdx = already been there, ignore
}
window.itinHandleCheckin = itinHandleCheckin;

// Skip stops between current and target, activate target
function itinSkipToStop(targetIdx, fromIdx) {
  var stops = itin.current.stops;

  // Mark everything in between as skipped
  for (var i = fromIdx; i < targetIdx; i++) {
    if (stops[i].status !== 'done') {
      stops[i].status = 'skipped';
    }
  }

  // Activate the target stop
  stops[targetIdx].status = 'active';
  itin.activeStopIdx = targetIdx;

  // Recalculate times from now
  itinRecalcFromNow(targetIdx);

  // Save + re-render
  itinSave(itin.current);
  itinRenderModal();

  var skipped = targetIdx - fromIdx;
  showToast('📍 Advanced to ' + stops[targetIdx].name + (skipped > 0 ? ' · ' + skipped + ' stop' + (skipped>1?'s':'') + ' skipped' : ''));

  // Notify group
  itinNotifyGroup('skipped_ahead', stops[targetIdx].name);
}

// Prompt user for how long they plan to stay at an unplanned stop
function itinPromptUnplannedStop(barName, currentIdx) {
  var existing = document.getElementById('itin-unplanned-prompt');
  if (existing) existing.remove();

  var prompt = document.createElement('div');
  prompt.id = 'itin-unplanned-prompt';
  prompt.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center';

  prompt.innerHTML =
    '<div style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:20px 20px 48px">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px"></div>' +
      '<div style="font-size:16px;font-weight:800;margin-bottom:4px">📍 ' + barName + ' isn\'t on your plan</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px">How long are you planning to stay? We\'ll push your schedule back.</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px" id="itin-unplanned-grid"></div>' +
      '<button onclick="document.getElementById(\'itin-unplanned-prompt\').remove()" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Skip — don\'t add</button>' +
    '</div>';

  document.body.appendChild(prompt);

  var grid = document.getElementById('itin-unplanned-grid');
  [30, 45, 60, 90].forEach(function(mins) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:12px 8px;border-radius:12px;border:1px solid rgba(255,215,0,0.2);background:rgba(255,215,0,0.06);color:#ffd700;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer';
    btn.textContent = mins < 60 ? mins + 'min' : (mins/60) + 'hr';
    btn.onclick = function() {
      prompt.remove();
      itinInsertUnplannedStop(barName, currentIdx, mins);
    };
    grid.appendChild(btn);
  });

  prompt.addEventListener('click', function(e) { if (e.target === prompt) prompt.remove(); });
}

// Insert unplanned stop at current position and recalculate
function itinInsertUnplannedStop(barName, afterIdx, estimatedMins) {
  var stops = itin.current.stops;

  // Mark current stop done if it was active
  if (stops[afterIdx] && stops[afterIdx].status === 'active') {
    stops[afterIdx].status = 'done';
    stops[afterIdx].actual_mins = itin.liveElapsed ? Math.round(itin.liveElapsed / 60) : estimatedMins;
  }

  // Build new stop
  var newStop = {
    name: barName,
    type: 'bar',
    description: 'Added from check-in',
    tip: '',
    cost: '',
    estimated_mins: estimatedMins,
    actual_mins: null,
    status: 'active',
    coords: null,
    address: '',
    unplanned: true,
  };

  // Insert after current position
  stops.splice(afterIdx + 1, 0, newStop);
  itin.activeStopIdx = afterIdx + 1;

  // Recalculate all future times from now
  itinRecalcFromNow(afterIdx + 1);

  // Reset live timer
  itin.liveElapsed = 0;
  if (itin.liveTimer) { clearInterval(itin.liveTimer); itin.liveTimer = null; }

  itinSave(itin.current);
  itinRenderModal();
  if (itin.mode === 'live') itinStartLiveTimer();

  showToast('✅ ' + barName + ' added · schedule updated');

  // Notify group
  itinNotifyGroup('stop_added', barName);
}

// Recalculate all stop times from a given index using current time
function itinRecalcFromNow(fromIdx) {
  if (!itin.current) return;
  var stops = itin.current.stops;
  var now = new Date();
  var h = now.getHours(), m = now.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  itin.current.start_time = h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;

  // Cascade times forward from fromIdx
  var runningMins = 0;
  for (var i = fromIdx + 1; i < stops.length; i++) {
    if (stops[i].status === 'skipped') continue;
    runningMins += stops[i-1] ? (stops[i-1].estimated_mins || 60) : 60;
    // Store offset for display (itinCalcTimes uses start_time + offsets)
  }
}

// Notify group members of itinerary changes
function itinNotifyGroup(eventType, detail) {
  if (!itin.current || !currentUser) return;

  var msg = '';
  if (eventType === 'skipped_ahead') msg = currentUser.user_metadata && currentUser.user_metadata.username ? currentUser.user_metadata.username + ' skipped ahead to ' + detail : 'Someone skipped ahead to ' + detail;
  if (eventType === 'stop_added')    msg = (currentUser.user_metadata && currentUser.user_metadata.username ? currentUser.user_metadata.username : 'Someone') + ' added ' + detail + ' to the plan';

  // Store notification in localStorage for group members to pick up
  try {
    var key = 'dtslo_itin_notif_' + itin.current.id;
    var notifs = JSON.parse(localStorage.getItem(key) || '[]');
    notifs.unshift({ msg: msg, type: eventType, ts: Date.now() });
    if (notifs.length > 10) notifs = notifs.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(notifs));
  } catch(e) {}

  // Push to Supabase for other group members
  try {
    if (supabaseClient && itin.current.share_id) {
      supabaseClient.from('itineraries').update({
        updated_at: new Date().toISOString(),
        last_event: JSON.stringify({ type: eventType, detail: detail, user: currentUser.id, ts: Date.now() })
      }).eq('share_id', itin.current.share_id).then(function(){}).catch(function(){});
    }
  } catch(e) {}

  // Send push notification
  if (typeof sendPushNotification === 'function') {
    sendPushNotification(msg);
  }
}
window.itinNotifyGroup = itinNotifyGroup;

// Check for pending group notifications when opening itinerary
function itinCheckGroupNotifs() {
  if (!itin.current) return;
  try {
    var key = 'dtslo_itin_notif_' + itin.current.id;
    var notifs = JSON.parse(localStorage.getItem(key) || '[]');
    // Show unseen ones
    var unseen = notifs.filter(function(n) { return !n.seen && n.ts > Date.now() - 2*60*60*1000; });
    unseen.forEach(function(n, i) {
      setTimeout(function() {
        if (typeof showToast === 'function') showToast('🔔 ' + n.msg);
      }, i * 1500);
      n.seen = true;
    });
    if (unseen.length) localStorage.setItem(key, JSON.stringify(notifs));
  } catch(e) {}
}
window.itinCheckGroupNotifs = itinCheckGroupNotifs;

// ══════════════════════════════════════════════
// WISHLIST / ORDER PREVIEW
// ══════════════════════════════════════════════

function itinGetStopSavedItems(barName) {
  try {
    var all = JSON.parse(localStorage.getItem('dtslo_saved_items') || '{}');
    var ids = all[barName] || [];
    if (!ids.length) return [];
    // Look up item details from SAMPLE_MENU_ITEMS
    if (typeof SAMPLE_MENU_ITEMS === 'undefined') return ids.map(function(id){ return {id:id,name:id,price:''}; });
    var items = SAMPLE_MENU_ITEMS[barName] || [];
    return ids.map(function(id) {
      return items.find(function(it){ return it.id === id; }) || {id:id, name:id, price:''};
    }).filter(Boolean);
  } catch(e) { return []; }
}
window.itinGetStopSavedItems = itinGetStopSavedItems;

function itinRenderOrderPreview(it) {
  if (!it || !it.stops || !it.stops.length) return '';

  // Collect all saved items across stops
  var groups = [];
  it.stops.forEach(function(s) {
    var items = itinGetStopSavedItems(s.name);
    if (items.length) groups.push({ bar: s.name, items: items });
  });

  if (!groups.length) return '';

  var rows = groups.map(function(g) {
    var itemRows = g.items.map(function(item) {
      return '<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
        '<span>' + item.name + '</span>' +
        '<span style="color:#22c55e;font-weight:700">' + (item.price || '') + '</span>' +
      '</div>';
    }).join('');
    return '<div style="margin-bottom:10px">' +
      '<div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">' + g.bar + '</div>' +
      itemRows +
    '</div>';
  }).join('');

  return '<div style="margin-top:14px;background:var(--surface);border:1px solid rgba(255,215,0,0.2);border-radius:16px;padding:14px;position:relative;overflow:hidden">' +
    '<div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,215,0,0.04),transparent);pointer-events:none"></div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<div style="font-size:14px;font-weight:900">🛍 Order Preview</div>' +
      '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(255,255,255,0.4);cursor:pointer" onclick="itinToggleShareOrder(this)">' +
        '<span id="itin-share-label">Private</span>' +
        '<div style="width:32px;height:18px;background:rgba(255,255,255,0.1);border-radius:9px;position:relative;transition:background .2s" id="itin-share-toggle">' +
          '<div style="position:absolute;top:2px;left:2px;width:14px;height:14px;background:white;border-radius:50%;transition:transform .2s" id="itin-share-knob"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    rows +
    '<div style="display:flex;justify-content:space-between;padding-top:8px;margin-top:4px;border-top:1px solid rgba(255,255,255,0.08);font-size:13px;font-weight:800">' +
      '<span>Est. Total (you)</span>' +
      '<span style="color:#ffd700">See items above</span>' +
    '</div>' +
  '</div>';
}
window.itinRenderOrderPreview = itinRenderOrderPreview;

function itinToggleShareOrder(el) {
  var toggle = document.getElementById('itin-share-toggle');
  var knob   = document.getElementById('itin-share-knob');
  var label  = document.getElementById('itin-share-label');
  if (!toggle) return;
  var on = toggle.style.background !== 'rgb(34, 197, 94)';
  toggle.style.background = on ? '#22c55e' : 'rgba(255,255,255,0.1)';
  if (knob) knob.style.transform = on ? 'translateX(14px)' : 'translateX(0)';
  if (label) label.textContent = on ? 'Shared' : 'Private';
}
window.itinToggleShareOrder = itinToggleShareOrder;
