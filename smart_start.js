// ══════════════════════════════════════════════
// SMART_START.JS
// Three systems that help users know where to start:
//   1. Time-Based — highlights the right hub for the hour
//   2. Social Proof — shows live activity on the map
//   3. Mood-First — one question before the map loads
// All default ON. Settings readable from app_settings table.
// ══════════════════════════════════════════════

// ── SETTINGS (defaults — overridden by app_settings on load) ──
var SS = {
  // Time-based
  timeEnabled:    true,
  timeWindows: {
    morning:   'restaurant',   // 6-11am
    afternoon: 'beach',        // 11am-5pm
    evening:   'restaurant',   // 5-9pm
    night:     'dtslo',        // 9pm-2am
    latenight: 'dtslo',        // 2-6am
  },
  timeDimInactive:  true,
  timeDimOpacity:   0.3,
  timeGlowBoost:    1.4,       // multiply glow intensity for active hub

  // Social proof
  socialEnabled:    true,
  socialBanner:     true,
  socialBannerText: '{n} people out in SLO right now',
  socialDots:       true,
  socialDotDecay:   45,        // minutes before dot fades
  socialMinCheckins: 1,
  socialHotThreshold: 5,

  // Mood-first
  moodEnabled:      true,
  moodFirstOnly:    false,     // show every time (can throttle later)
  moodEveryN:       5,
  moodStyle:        'bottom_sheet',
};

// Load settings from app_settings table
async function ssLoadSettings() {
  if (!window.supabaseClient) return;
  try {
    var res = await supabaseClient
      .from('app_settings')
      .select('value')
      .eq('key', 'map_settings')
      .single();
    if (res.data && res.data.value) {
      var saved = typeof res.data.value === 'string'
        ? JSON.parse(res.data.value)
        : res.data.value;
      if (saved.smart_start_time !== undefined) SS.timeEnabled   = saved.smart_start_time;
      if (saved.social_proof     !== undefined) SS.socialEnabled = saved.social_proof;
      if (saved.mood_enabled     !== undefined) SS.moodEnabled   = saved.mood_enabled;
      if (saved.time_morning)   SS.timeWindows.morning   = saved.time_morning;
      if (saved.time_afternoon) SS.timeWindows.afternoon = saved.time_afternoon;
      if (saved.time_evening)   SS.timeWindows.evening   = saved.time_evening;
      if (saved.time_night)     SS.timeWindows.night     = saved.time_night;
      if (saved.time_dim_inactive !== undefined) SS.timeDimInactive = saved.time_dim_inactive;
      if (saved.social_banner !== undefined)     SS.socialBanner    = saved.social_banner;
      if (saved.social_dots !== undefined)       SS.socialDots      = saved.social_dots;
      if (saved.social_dot_decay)                SS.socialDotDecay  = saved.social_dot_decay;
      if (saved.social_banner_text)              SS.socialBannerText = saved.social_banner_text;
    }
  } catch(e) { /* use defaults */ }
}

// ── MASTER INIT — called after map loads ──
async function smartStartInit() {
  await ssLoadSettings();
  if (SS.moodEnabled)   ssMoodFirst();    // Mood prompt — first, sets context
  if (SS.timeEnabled)   ssTimeBased();    // Time-based hub highlighting
  if (SS.socialEnabled) ssSocialProof();  // Social proof layer + banner
}
window.smartStartInit = smartStartInit;


// ══════════════════════════════════════════════
// 1. TIME-BASED INTELLIGENCE
// Pulses the right hub pin brighter for the current time
// Dims all others
// ══════════════════════════════════════════════

function ssGetCurrentWindow() {
  var h = new Date().getHours();
  if (h >= 6  && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  if (h >= 21 || h < 2 ) return 'night';
  return 'latenight';
}

function ssTimeBased() {
  if (!SS.timeEnabled || !homeMap) return;

  var window_key = ssGetCurrentWindow();
  var activeHubId = SS.timeWindows[window_key] || 'dtslo';

  // Apply to hub pins — brighten active, dim others
  setTimeout(function() {
    document.querySelectorAll('.mh-hub-pin.mh-hub-active').forEach(function(pin) {
      var marker = pin.closest('[data-hub-id]');
      var hubId = marker ? marker.dataset.hubId : null;
      if (!hubId) return;
      if (hubId === activeHubId) {
        pin.style.filter = 'brightness(1.5) drop-shadow(0 0 12px rgba(255,215,0,0.8))';
        pin.style.transform = 'scale(1.12)';
        // Add "Hot now" badge
        if (!pin.querySelector('.ss-time-badge')) {
          var badge = document.createElement('div');
          badge.className = 'ss-time-badge';
          badge.textContent = ssTimeBadgeLabel(window_key);
          badge.style.cssText = 'position:absolute;top:-8px;right:-8px;background:#ffd700;color:#000;font-size:8px;font-weight:900;padding:2px 5px;border-radius:20px;white-space:nowrap;font-family:Helvetica Neue,sans-serif;pointer-events:none';
          pin.style.position = 'relative';
          pin.appendChild(badge);
        }
      } else if (SS.timeDimInactive) {
        pin.style.opacity = SS.timeDimOpacity;
      }
    });
  }, 800); // after markers finish rendering

  // Also boost that hub's glow layer
  if (typeof setHubGlowVisible === 'function' && typeof HUB_SPOT_DEFS !== 'undefined') {
    HUB_SPOT_DEFS.forEach(function(hub) {
      if (hub.id === activeHubId && homeMap.getLayer('hgl-ring-' + hub.id)) {
        try {
          homeMap.setPaintProperty('hgl-ring-' + hub.id, 'circle-opacity', 0.35);
          homeMap.setPaintProperty('hgl-ring-' + hub.id, 'circle-radius', 36);
        } catch(e) {}
      }
    });
  }
}

function ssTimeBadgeLabel(window_key) {
  var labels = { morning:'☀️ Morning', afternoon:'🌤 Now', evening:'🌆 Dinner Time', night:'🔥 Hot Tonight', latenight:'🌙 Late Night' };
  return labels[window_key] || '🔥 Now';
}


// ══════════════════════════════════════════════
// 2. SOCIAL PROOF
// Shows a user count banner + check-in dots on map
// ══════════════════════════════════════════════

var _socialInterval = null;

async function ssSocialProof() {
  if (!SS.socialEnabled) return;

  await ssFetchActivity();
  // Refresh every 2 minutes
  _socialInterval = setInterval(ssFetchActivity, 120000);
}

async function ssFetchActivity() {
  if (!window.supabaseClient) return;

  try {
    var cutoff = new Date(Date.now() - SS.socialDotDecay * 60 * 1000).toISOString();
    var res = await supabaseClient
      .from('checkins')
      .select('bar, checked_in_at')
      .gte('checked_in_at', cutoff);

    if (res.error || !res.data) return;

    var checkins = res.data;
    var totalCount = checkins.length;

    // Show banner
    if (SS.socialBanner) ssShowBanner(totalCount);

    // Show dots on map
    if (SS.socialDots && homeMap) ssRenderCheckinDots(checkins);

  } catch(e) { console.warn('[SmartStart] social proof:', e.message); }
}

function ssShowBanner(count) {
  // Remove existing
  var existing = document.getElementById('ss-social-banner');
  if (existing) existing.remove();
  if (count < SS.socialMinCheckins) return;

  var banner = document.createElement('div');
  banner.id = 'ss-social-banner';
  banner.style.cssText = [
    'position:absolute;top:160px;left:50%;transform:translateX(-50%);',
    'z-index:12;',
    'background:rgba(8,8,20,0.85);backdrop-filter:blur(12px);',
    'border:1px solid rgba(255,215,0,0.2);border-radius:20px;',
    'padding:6px 14px;',
    'font-size:12px;font-weight:700;color:rgba(255,255,255,0.8);',
    'white-space:nowrap;',
    'font-family:Helvetica Neue,sans-serif;',
    'pointer-events:none;',
    'opacity:0;transition:opacity 0.4s;',
  ].join('');

  var text = SS.socialBannerText.replace('{n}', count);
  banner.innerHTML = '<span style="color:#22c55e;margin-right:4px">●</span>' + text;

  var menuHome = document.getElementById('menu-home');
  if (menuHome) menuHome.appendChild(banner);

  setTimeout(function() { banner.style.opacity = '1'; }, 50);

  // Auto-hide after 8 seconds
  setTimeout(function() {
    banner.style.opacity = '0';
    setTimeout(function() { banner.remove(); }, 400);
  }, 8000);
}

// Bar coords lookup for check-in dots
var SS_BAR_COORDS = {
  'Black Sheep Bar & Grill':  [-120.6638, 35.2795],
  'Bulls Tavern':             [-120.6644, 35.2797],
  'Frog & Peach Pub':         [-120.6640, 35.2793],
  'High Bar':                 [-120.6648, 35.2800],
  'Nightcap':                 [-120.6636, 35.2791],
  'Feral Kitchen & Lounge':   [-120.6632, 35.2789],
  'The Library':              [-120.6650, 35.2801],
  'The Mark':                 [-120.6642, 35.2796],
  'McCarthys Irish Pub':      [-120.6646, 35.2798],
  'Sidecar SLO':              [-120.6635, 35.2792],
  'Eureka!':                  [-120.6630, 35.2788],
  'Finneys Crafthouse':       [-120.6628, 35.2786],
  'Novo Restaurant & Lounge': [-120.6660, 35.2815],
  'BA Start Arcade Bar':      [-120.6655, 35.2808],
  'The Carrisa':              [-120.6652, 35.2806],
};

function ssRenderCheckinDots(checkins) {
  // Count per bar
  var counts = {};
  checkins.forEach(function(c) {
    counts[c.bar] = (counts[c.bar] || 0) + 1;
  });

  // Build GeoJSON features
  var features = [];
  Object.keys(counts).forEach(function(bar) {
    var coords = SS_BAR_COORDS[bar];
    if (!coords) return;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: { count: counts[bar], bar: bar }
    });
  });

  if (!features.length) return;

  var data = { type: 'FeatureCollection', features: features };

  try {
    if (homeMap.getSource('ss-checkin-src')) {
      homeMap.getSource('ss-checkin-src').setData(data);
    } else {
      homeMap.addSource('ss-checkin-src', { type: 'geojson', data: data });

      // Outer pulse ring
      homeMap.addLayer({
        id: 'ss-checkin-ring',
        type: 'circle',
        source: 'ss-checkin-src',
        paint: {
          'circle-radius': ['interpolate',['linear'],['get','count'], 1,14, 5,22, 10,30],
          'circle-color': '#22c55e',
          'circle-opacity': 0.18,
          'circle-blur': 0.6,
        }
      });

      // Inner dot — size by count
      homeMap.addLayer({
        id: 'ss-checkin-dot',
        type: 'circle',
        source: 'ss-checkin-src',
        paint: {
          'circle-radius': ['interpolate',['linear'],['get','count'], 1,5, 5,9, 10,14],
          'circle-color': '#22c55e',
          'circle-opacity': 0.9,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
        }
      });

      // Pulse animation
      var r = 12, growing = true;
      setInterval(function() {
        if (!homeMap || !homeMap.getLayer('ss-checkin-ring')) return;
        r += growing ? 1 : -1;
        if (r > 20) growing = false;
        if (r < 12) growing = true;
        homeMap.setPaintProperty('ss-checkin-ring', 'circle-opacity', 0.1 + (r-12)/100);
      }, 80);
    }
  } catch(e) { console.warn('[SmartStart] checkin dots:', e.message); }
}


// ══════════════════════════════════════════════
// 3. MOOD-FIRST PROMPT
// Slides up before the map finishes loading
// User picks a vibe → matching hubs brighten
// ══════════════════════════════════════════════

var MOOD_OPTIONS = [
  { id: 'eat',        label: 'Eat',         emoji: '🍕', hubs: ['restaurant'] },
  { id: 'drink',      label: 'Drink',       emoji: '🍺', hubs: ['dtslo','brewery'] },
  { id: 'experience', label: 'Experience',  emoji: '🎭', hubs: ['events','city'] },
  { id: 'outdoors',   label: 'Outdoors',    emoji: '🌿', hubs: ['nature','thrill','beach'] },
  { id: 'campus',     label: 'Campus',      emoji: '🎓', hubs: ['calpoly'] },
  { id: 'wine',       label: 'Wine & Scenic', emoji: '🍷', hubs: ['wine'] },
];

function ssMoodFirst() {
  if (!SS.moodEnabled) return;

  // Check if we should show (throttle logic)
  var lastMoodTs = parseInt(localStorage.getItem('dtslo_mood_ts') || '0');
  var openCount = parseInt(localStorage.getItem('menu_open_count') || '0');
  var lastMood = localStorage.getItem('dtslo_last_mood');
  var msSinceLastMood = Date.now() - lastMoodTs;

  // Show if: never shown, OR been more than 30 minutes since last shown
  var shouldShow = !lastMoodTs || msSinceLastMood > 30 * 60 * 1000;
  if (!shouldShow) {
    // Still apply the last mood silently
    if (lastMood) ssMoodApply(lastMood, true);
    return;
  }

  // Build prompt
  var existing = document.getElementById('ss-mood-prompt');
  if (existing) existing.remove();

  var prompt = document.createElement('div');
  prompt.id = 'ss-mood-prompt';
  prompt.style.cssText = [
    'position:absolute;bottom:72px;left:0;right:0;z-index:18;',
    'background:rgba(6,6,15,0.95);backdrop-filter:blur(20px);',
    'border-radius:24px 24px 0 0;',
    'border-top:1px solid rgba(255,255,255,0.08);',
    'padding:16px 20px 20px;',
    'transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.34,1.2,0.64,1);',
    'font-family:Helvetica Neue,sans-serif;',
  ].join('');

  prompt.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<div>' +
        '<div style="font-size:15px;font-weight:800;color:#fff">What are you feeling?</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">We\'ll highlight the best spots</div>' +
      '</div>' +
      '<button id="ss-mood-skip" style="background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.4);padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">Skip</button>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px" id="ss-mood-grid"></div>';

  var mh = document.getElementById('menu-home');
  if (!mh) return;
  mh.appendChild(prompt);

  // Build mood buttons
  var grid = document.getElementById('ss-mood-grid');
  MOOD_OPTIONS.forEach(function(mood) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:12px 8px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;transition:all 0.15s;display:flex;flex-direction:column;align-items:center;gap:4px';
    btn.innerHTML = '<span style="font-size:22px">' + mood.emoji + '</span><span>' + mood.label + '</span>';
    btn.addEventListener('click', function() {
      ssMoodSelect(mood.id);
    });
    grid.appendChild(btn);
  });

  // Animate in
  setTimeout(function() { prompt.style.transform = 'translateY(0)'; }, 100);

  // Skip button
  document.getElementById('ss-mood-skip').addEventListener('click', function() {
    ssMoodDismiss();
  });

  // Auto-dismiss after 12 seconds
  setTimeout(function() {
    var p = document.getElementById('ss-mood-prompt');
    if (p) ssMoodDismiss();
  }, 12000);
}

function ssMoodSelect(moodId) {
  // Save
  localStorage.setItem('dtslo_last_mood', moodId);
  localStorage.setItem('dtslo_mood_ts', Date.now().toString());

  // Visual feedback — flash selected button
  var grid = document.getElementById('ss-mood-grid');
  if (grid) {
    var btns = grid.querySelectorAll('button');
    btns.forEach(function(b, i) {
      if (MOOD_OPTIONS[i] && MOOD_OPTIONS[i].id === moodId) {
        b.style.background = 'rgba(255,215,0,0.15)';
        b.style.borderColor = 'rgba(255,215,0,0.4)';
        b.style.color = '#ffd700';
      }
    });
  }

  // Dismiss and apply
  setTimeout(function() {
    ssMoodDismiss();
    ssMoodApply(moodId, false);
  }, 300);
}

function ssMoodApply(moodId, silent) {
  var mood = MOOD_OPTIONS.find(function(m) { return m.id === moodId; });
  if (!mood) return;

  var activeHubs = mood.hubs;

  // Brighten matching hub pins, dim others
  setTimeout(function() {
    document.querySelectorAll('.mh-hub-pin.mh-hub-active').forEach(function(pin) {
      var marker = pin.closest('[data-hub-id]');
      var hubId = marker ? marker.dataset.hubId : null;
      if (!hubId) return;
      if (activeHubs.includes(hubId)) {
        pin.style.filter = 'brightness(1.4) drop-shadow(0 0 10px rgba(255,215,0,0.7))';
        pin.style.transform = 'scale(1.1)';
        if (!silent) {
          // Add mood badge
          if (!pin.querySelector('.ss-mood-badge')) {
            var badge = document.createElement('div');
            badge.className = 'ss-mood-badge';
            badge.textContent = '✓ Match';
            badge.style.cssText = 'position:absolute;top:-8px;right:-8px;background:#ffd700;color:#000;font-size:8px;font-weight:900;padding:2px 5px;border-radius:20px;white-space:nowrap;font-family:Helvetica Neue,sans-serif;pointer-events:none';
            pin.style.position = 'relative';
            pin.appendChild(badge);
          }
        }
      } else {
        pin.style.opacity = '0.35';
      }
    });
  }, 400);

  // Boost glow for matching hub spot layers
  if (homeMap && typeof HUB_SPOT_DEFS !== 'undefined') {
    HUB_SPOT_DEFS.forEach(function(hub) {
      var ringId = 'hgl-ring-' + hub.id;
      if (!homeMap.getLayer(ringId)) return;
      try {
        if (activeHubs.includes(hub.id)) {
          homeMap.setPaintProperty(ringId, 'circle-opacity', 0.4);
          homeMap.setPaintProperty(ringId, 'circle-radius', 34);
        } else {
          homeMap.setPaintProperty(ringId, 'circle-opacity', 0.04);
        }
      } catch(e) {}
    });
  }

  if (!silent && typeof showToast === 'function') {
    var label = mood.emoji + ' Showing ' + mood.label + ' spots';
    // Use a subtle version — don't spam toasts
    setTimeout(function() { showToast(label); }, 600);
  }
}

function ssMoodDismiss() {
  var p = document.getElementById('ss-mood-prompt');
  if (!p) return;
  p.style.transform = 'translateY(100%)';
  setTimeout(function() { p.remove(); }, 400);
}
window.ssMoodDismiss = ssMoodDismiss;
