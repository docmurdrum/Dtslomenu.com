// ══════════════════════════════════════════════
// BACK_HANDLER.JS — Android Back Button
// Uses History API to intercept back navigation
// Initialized AFTER app is fully loaded
// ══════════════════════════════════════════════

var _backHandlerReady = false;
var _backHandlerDepth = 0; // track how many hubs deep we are

// All hub close functions
var BACK_CLOSE_FNS = [
  function() { return tryClose('mh-thrill-hub',      'menuHomeCloseThrillHub'); },
  function() { return tryClose('mh-beach-hub',       'menuHomeCloseBeachHub'); },
  function() { return tryClose('mh-brewery-hub',     'menuHomeCloseBreweryHub'); },
  function() { return tryClose('mh-wine-hub',        'menuHomeCloseWineHub'); },
  function() { return tryClose('mh-nature-hub',      'menuHomeCloseNatureHub'); },
  function() { return tryClose('mh-events-hub',      'menuHomeCloseEventsHub'); },
  function() { return tryClose('mh-calpoly-hub',     'menuHomeCloseCalPolyHub'); },
  function() { return tryClose('mh-city-hub',        'menuHomeCloseCityHub'); },
  function() { return tryClose('mh-restaurant-hub',  'menuHomeCloseRestaurantHub'); },
  function() { return tryClose('mh-learn-hub',       'closeLearnSLO'); },
  function() { return tryClose('mh-bucket-hub',      'closeBucketList'); },
  function() { return tryClose('mh-daytrips-hub',    'closeDayTrips'); },
  function() { return tryClose('mh-shotlist-hub',    'closeShotList'); },
  function() { return tryClose('mh-hotels-hub',      'closeHotelsHub'); },
  function() { return tryClose('mh-transit-hub',     'closeTransitHub'); },
  function() { return tryClose('mh-civic-hub',       'closeCivicHub'); },
  function() { return tryClose('mh-housing-hub',     'closeHousingHub'); },
  function() { return tryClose('mh-jobs-hub',        'closeJobsHub'); },
  function() { return tryClose('mh-buysell-hub',     'closeBuySellHub'); },
  function() { return tryClose('mh-fitness-hub',     'closeFitnessHub'); },
  function() { return tryClose('mh-emergency-hub',   'closeEmergencyHub'); },
  function() { return tryClose('mh-health-hub',      'closeHealthHub'); },
  function() { return tryClose('mh-legal-hub',       'closeLegalHub'); },
  function() { return tryClose('mh-search-hub',      'closeSearchHub'); },
  function() { return tryClose('mh-tours-hub',       'closeToursHub'); },
  // Planit sheet
  function() {
    var el = document.getElementById('mh-planit-sheet');
    if (el && el.offsetParent !== null) {
      if (typeof menuHomeClosePlanIt === 'function') menuHomeClosePlanIt();
      return true;
    }
    return false;
  },
  // Thrill detail sheet
  function() {
    var el = document.getElementById('mh-thrill-detail');
    if (el) { el.remove(); return true; }
    return false;
  },
  // DTSLO app → back to hub grid
  function() {
    var app = document.getElementById('app');
    if (app && app.style.display !== 'none') {
      if (typeof authBackToMap === 'function') authBackToMap();
      return true;
    }
    return false;
  },
];

function tryClose(elId, fnName) {
  var el = document.getElementById(elId);
  // Use el existence check — offsetParent is null for position:fixed elements
  // so we can't use that. If the element exists in DOM, the hub is open.
  if (el) {
    if (typeof window[fnName] === 'function') window[fnName]();
    return true;
  }
  return false;
}

// Called by popstate — find and close the topmost open hub
function backHandlerPop() {
  if (!_backHandlerReady) return;
  var closed = false;
  for (var i = 0; i < BACK_CLOSE_FNS.length; i++) {
    if (BACK_CLOSE_FNS[i]()) { closed = true; break; }
  }
  _backHandlerDepth = Math.max(0, _backHandlerDepth - 1);
  // If nothing was closed, re-push sentinel so next back is still caught
  if (!closed && _backHandlerDepth === 0) {
    history.pushState({ slo: 'sentinel' }, '');
  }
}

// Called whenever a hub opens
function backHandlerPush() {
  if (!_backHandlerReady) return;
  _backHandlerDepth++;
  history.pushState({ slo: 'hub', depth: _backHandlerDepth }, '');
}
window.backHandlerPush = backHandlerPush;

// Init — called once after app is ready
function backHandlerInit() {
  if (_backHandlerReady) return;
  _backHandlerReady = true;
  _backHandlerDepth = 0;

  // Push initial sentinel — first back press will hit this
  history.pushState({ slo: 'sentinel' }, '');

  window.addEventListener('popstate', function(e) {
    backHandlerPop();
  });

  // Patch all hub openers to call backHandlerPush
  // Must wrap menuHomeOpen* — these are what menu_home_v3 actually calls via eval
  var toWrap = [
    'menuHomeOpenBeachHub','menuHomeOpenBreweryHub','menuHomeOpenWineHub',
    'menuHomeOpenNatureHub','menuHomeOpenEventsHub','menuHomeOpenCalPolyHub',
    'menuHomeOpenCityHub','menuHomeOpenRestaurantHub','menuHomeOpenThrillHub',
    'menuHomeOpenLearnSLO','menuHomeOpenBucketList','menuHomeOpenTravelPlanIt',
    'menuHomeOpenDayTrips','menuHomeOpenShotList','menuHomeOpenHotelsHub',
    'menuHomeOpenTransitHub','menuHomeOpenCivicHub','menuHomeOpenHousingHub',
    'menuHomeOpenJobsHub','menuHomeOpenBuySellHub','menuHomeOpenFitnessHub',
    'menuHomeOpenEmergencyHub','menuHomeOpenHealthHub','menuHomeOpenLegalHub',
    'menuHomeOpenSearchHub','menuHomeOpenToursHub','menuHomeOpenDTSLO',
  ];
  toWrap.forEach(function(name) {
    var orig = window[name];
    if (typeof orig === 'function') {
      window[name] = function() {
        var r = orig.apply(this, arguments);
        backHandlerPush();
        return r;
      };
    }
  });
}
window.backHandlerInit = backHandlerInit;

// Don't init on load — wait for menuHomeInit to call us
// This prevents interference with Supabase loads during startup
