// ══════════════════════════════════════════════
// MAP_HUB.JS — Interactive SLO Map
// MapLibre · Bars · Landmarks · Hikes · Beaches
// ══════════════════════════════════════════════

var MAP_LAYERS = [
  { id:'bars',      label:'Bars',       emoji:'🍸', color:'#ff2d78' },
  { id:'food',      label:'Food',       emoji:'🍽', color:'#ff6b35' },
  { id:'nature',    label:'Nature',     emoji:'🌿', color:'#22c55e' },
  { id:'culture',   label:'Culture',    emoji:'🏛', color:'#00f5ff' },
  { id:'beer',      label:'Breweries',  emoji:'🍺', color:'#f59e0b' },
  { id:'wine',      label:'Wine',       emoji:'🍷', color:'#8b2fc9' },
  { id:'coffee',    label:'Coffee',     emoji:'☕', color:'#a16207' },
  { id:'photo',     label:'Photo Spots',emoji:'📸', color:'#ec4899' },
];

var MAP_POINTS = [
  // BARS
  { name:'SLO Brew', category:'bars', emoji:'🍺', lat:35.2787, lng:-120.6605, desc:'Iconic downtown venue with live music and craft beer' },
  { name:'Frog and Peach', category:'bars', emoji:'🍻', lat:35.2810, lng:-120.6648, desc:'British pub with 72 beers on tap. Classic SLO bar.' },
  { name:'Pappy McGregor\'s', category:'bars', emoji:'🥃', lat:35.2797, lng:-120.6642, desc:'Beloved dive bar. The heart of downtown SLO nightlife.' },
  { name:'Barcelona Bar', category:'bars', emoji:'🍷', lat:35.2801, lng:-120.6651, desc:'Wine and cocktails in a cozy downtown setting.' },
  { name:'McCarthy\'s Irish Pub', category:'bars', emoji:'🍀', lat:35.2806, lng:-120.6638, desc:'The classic downtown Irish pub. Sports and pints.' },
  { name:'Mother\'s Tavern', category:'bars', emoji:'🎵', lat:35.2798, lng:-120.6645, desc:'Live music every night. One of SLO\'s great music venues.' },
  { name:'Bull\'s Tavern', category:'bars', emoji:'🐂', lat:35.2808, lng:-120.6640, desc:'Outdoor patio and a legendary happy hour.' },
  { name:'Kreuzberg', category:'bars', emoji:'🇩🇪', lat:35.2796, lng:-120.6659, desc:'Coffee by day, cocktails and music by night.' },
  // FOOD
  { name:'Firestone Grill', category:'food', emoji:'🥩', lat:35.2806, lng:-120.6648, desc:'The tri-tip institution. Get the salsa. The line is worth it.' },
  { name:'Novo Restaurant', category:'food', emoji:'🌿', lat:35.2803, lng:-120.6652, desc:'Creekside patio dining. Best outdoor restaurant in SLO.' },
  { name:'Mistura', category:'food', emoji:'🇵🇪', lat:35.2798, lng:-120.6643, desc:'Authentic Peruvian. Best ceviche in the county.' },
  { name:'Luna Red', category:'food', emoji:'🌙', lat:35.2812, lng:-120.6650, desc:'Spanish tapas on the best patio in downtown SLO.' },
  { name:'Louisa\'s Place', category:'food', emoji:'🍳', lat:35.2793, lng:-120.6641, desc:'Classic diner on Higuera. The big breakfast after a big night.' },
  { name:'Sally Loo\'s Wholesome Cafe', category:'food', emoji:'🌱', lat:35.2824, lng:-120.6601, desc:'Beloved neighborhood cafe. Wholesome and genuinely excellent.' },
  { name:'Splash Cafe', category:'food', emoji:'🦪', lat:35.1422, lng:-120.6413, desc:'Famous clam chowder bread bowl. Pismo Beach institution.' },
  { name:'Splash Cafe SLO', category:'food', emoji:'🦪', lat:35.2800, lng:-120.6638, desc:'Downtown location of the famous clam chowder spot.' },
  // NATURE
  { name:'Bishop Peak Trailhead', category:'nature', emoji:'🏔', lat:35.2999, lng:-120.6924, desc:'Most popular hike in SLO. 1,559ft summit with 360 views.' },
  { name:'Cerro San Luis Trailhead', category:'nature', emoji:'🌄', lat:35.2763, lng:-120.6785, desc:'Madonna Mountain. Great sunrise and city views.' },
  { name:'Laguna Lake Park', category:'nature', emoji:'🦢', lat:35.2641, lng:-120.6876, desc:'Egrets, herons, and morning mist. Best birding in SLO.' },
  { name:'Irish Hills Natural Reserve', category:'nature', emoji:'🦌', lat:35.2514, lng:-120.7018, desc:'Rolling oak savanna. Deer at dawn, hawks at midday.' },
  { name:'Reservoir Canyon', category:'nature', emoji:'🌸', lat:35.3038, lng:-120.6712, desc:'Best wildflower canyon in SLO. March through May.' },
  { name:'Islay Hill Open Space', category:'nature', emoji:'🌄', lat:35.2518, lng:-120.6504, desc:'Short hike, great 360 views. Underrated Sister.' },
  { name:'Johnson Ranch Open Space', category:'nature', emoji:'🌿', lat:35.2468, lng:-120.6657, desc:'Rolling grassland and oak savanna south of town.' },
  { name:'Montana de Oro State Park', category:'nature', emoji:'🌊', lat:35.2645, lng:-120.8760, desc:'Best coastal scenery in SLO County. Clifftop bluffs, tide pools.' },
  { name:'SLO Botanical Garden', category:'nature', emoji:'🌺', lat:35.3011, lng:-120.6730, desc:'Free native plant garden along El Chorro creek.' },
  // CULTURE
  { name:'Mission San Luis Obispo', category:'culture', emoji:'⛪', lat:35.2817, lng:-120.6642, desc:'Founded 1772. One of California\'s most intact missions.' },
  { name:'Fremont Theater', category:'culture', emoji:'🎭', lat:35.2805, lng:-120.6636, desc:'1942 art deco landmark. Concerts and live events nightly.' },
  { name:'SLO Museum of Art', category:'culture', emoji:'🎨', lat:35.2798, lng:-120.6631, desc:'Free on first Wednesday of each month.' },
  { name:'History Center of SLO', category:'culture', emoji:'📚', lat:35.2793, lng:-120.6633, desc:'Original Carnegie Library building. Genuinely fascinating.' },
  { name:'Ah Louis Store', category:'culture', emoji:'🏮', lat:35.2806, lng:-120.6601, desc:'Last remaining building from SLO\'s 19th century Chinatown.' },
  { name:'Bubblegum Alley', category:'culture', emoji:'🎨', lat:35.2791, lng:-120.6644, desc:'More than 70 years of gum art. Strange and uniquely SLO.' },
  { name:'Mission Plaza', category:'culture', emoji:'🌳', lat:35.2816, lng:-120.6646, desc:'Civic heart of SLO. Creek, gardens, and the Mission.' },
  { name:'SLO Amtrak Station', category:'culture', emoji:'🚂', lat:35.2716, lng:-120.6645, desc:'1894 railroad depot. Pacific Surfliner and Coast Starlight stop here.' },
  // BREWERIES
  { name:'Libertine Brewing', category:'beer', emoji:'🍺', lat:35.2713, lng:-120.6644, desc:'Best wild ales and sours on the Central Coast.' },
  { name:'Central Coast Brewing', category:'beer', emoji:'🍺', lat:35.2798, lng:-120.6609, desc:'SLO\'s original craft brewery since 1998.' },
  { name:'Bang the Drum', category:'beer', emoji:'🥁', lat:35.2578, lng:-120.6435, desc:'Oak grove taproom. Dog friendly, great IPAs.' },
  { name:'SLO Brew Rock', category:'beer', emoji:'🎸', lat:35.2503, lng:-120.6404, desc:'Craft beer plus live music in a converted industrial space.' },
  { name:'Liquid Gravity', category:'beer', emoji:'⚗️', lat:35.2803, lng:-120.6648, desc:'Downtown taproom. West Coast IPAs done right.' },
  { name:'Ancient Owl', category:'beer', emoji:'🦉', lat:35.2797, lng:-120.6641, desc:'New generation downtown taproom. Rotating taps.' },
  { name:'Humdinger Brewing', category:'beer', emoji:'🍺', lat:35.2808, lng:-120.6635, desc:'Small batch brewing in the heart of downtown.' },
  // WINE
  { name:'Croma Vera Wines', category:'wine', emoji:'🍷', lat:35.2800, lng:-120.6648, desc:'Spanish varieties in Duncan Alley. Start your wine crawl here.' },
  { name:'Dunites Wine Co', category:'wine', emoji:'🍷', lat:35.2803, lng:-120.6651, desc:'Natural wine from the Santa Maria Valley. Small production.' },
  { name:'Stephen Ross Wines', category:'wine', emoji:'🍷', lat:35.2794, lng:-120.6640, desc:'Pinot and Chardonnay focused. Elegant downtown tasting room.' },
  { name:'Tolosa Winery', category:'wine', emoji:'🏡', lat:35.2306, lng:-120.6534, desc:'Edna Valley flagship. Exceptional Pinot and Chardonnay.' },
  { name:'Chamisal Vineyards', category:'wine', emoji:'🍇', lat:35.2156, lng:-120.6424, desc:'First commercial vines in Edna Valley, planted 1973.' },
  { name:'Wolff Vineyards', category:'wine', emoji:'🌿', lat:35.2268, lng:-120.6467, desc:'Best picnic grounds in Edna Valley. Dog friendly.' },
  { name:'Club Bubbly', category:'wine', emoji:'🥂', lat:35.2793, lng:-120.6647, desc:'SLO\'s only dedicated sparkling wine bar. Champagne, Cava, Prosecco.' },
  // COFFEE
  { name:'Scout Coffee', category:'coffee', emoji:'☕', lat:35.2808, lng:-120.6652, desc:'The best specialty coffee in SLO. Beautifully designed space.' },
  { name:'Joebella Coffee', category:'coffee', emoji:'☕', lat:35.2814, lng:-120.6640, desc:'Single origin, downtown location, serious coffee culture.' },
  { name:'Black Horse Espresso', category:'coffee', emoji:'🐴', lat:35.2798, lng:-120.6659, desc:'Strong espresso and a local following. Cash preferred.' },
  { name:'Sally Loo\'s Coffee', category:'coffee', emoji:'🌱', lat:35.2824, lng:-120.6601, desc:'Wholesome neighborhood cafe with excellent coffee.' },
  { name:'Kreuzberg Coffee', category:'coffee', emoji:'🇩🇪', lat:35.2796, lng:-120.6659, desc:'Specialty coffee by day, cocktail bar by night.' },
  // PHOTO SPOTS
  { name:'Morro Rock', category:'photo', emoji:'🪨', lat:35.3680, lng:-120.8659, desc:'Best sunrise shot on the coast. Peregrine falcons nest here.' },
  { name:'Mission Plaza at Dusk', category:'photo', emoji:'⛪', lat:35.2817, lng:-120.6642, desc:'Mission facade catches golden light perfectly at dusk.' },
  { name:'Fremont Theater Neon', category:'photo', emoji:'🎭', lat:35.2805, lng:-120.6636, desc:'Blue hour neon is the most photographed sight in SLO.' },
  { name:'Montana de Oro Bluffs', category:'photo', emoji:'🌊', lat:35.2645, lng:-120.8760, desc:'7 miles of clifftop with Pacific Ocean views.' },
  { name:'Edna Valley Vineyard Rows', category:'photo', emoji:'🍷', lat:35.2268, lng:-120.6467, desc:'Golden hour raking light across the vine rows is stunning.' },
];

var _mapHubMap = null;
var _mapHubMarkers = [];
var _mapActiveLayers = {};

function openMapHub() {
  var existing = document.getElementById('mh-map-hub');
  if (existing) existing.remove();

  // Default all layers on
  MAP_LAYERS.forEach(function(l) { _mapActiveLayers[l.id] = true; });

  if (!document.getElementById('map-hub-css')) {
    var s = document.createElement('style');
    s.id = 'map-hub-css';
    s.textContent = [
      '.maphub-btn{padding:6px 11px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s;border:none}',
      '.maphub-btn.active{opacity:1}',
      '.maphub-btn:not(.active){opacity:0.35}',
      '.maphub-popup{background:#0a0a18;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 12px;color:#fff;font-family:Helvetica Neue,sans-serif;max-width:200px}',
      '.maphub-popup .name{font-size:13px;font-weight:800;margin-bottom:3px}',
      '.maphub-popup .desc{font-size:11px;color:rgba(255,255,255,0.55);line-height:1.4}',
      '.maplibregl-popup-content{background:transparent!important;padding:0!important;box-shadow:none!important}',
      '.maplibregl-popup-tip{display:none!important}',
      '.maplibregl-ctrl-attrib{display:none}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-map-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:#06060f;opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(0,245,255,0.06) 0%,transparent 100%);position:relative;z-index:2">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<button onclick="closeMapHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">🗺 SLO Map</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Bars · Food · Nature · Culture · Breweries · Wine</div>' +
        '</div>' +
        '<button onclick="closeMapHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:10px" id="map-hub-filters">' +
        MAP_LAYERS.map(function(l) {
          return '<button class="maphub-btn active" data-mlid="' + l.id + '" onclick="mapHubToggleLayer(this,this.dataset.mlid)" style="background:' + l.color + '22;border:1px solid ' + l.color + '55;color:' + l.color + '">' + l.emoji + ' ' + l.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="mh-map-container" style="flex:1;position:relative">' +
      '<div id="mh-maplibre" style="position:absolute;inset:0"></div>' +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() {
    hub.style.opacity = '1';
    mapHubInit();
  }, 80);
}
window.openMapHub = openMapHub;
window.menuHomeOpenMapHub = openMapHub;

function closeMapHub() {
  if (_mapHubMap) { _mapHubMap.remove(); _mapHubMap = null; }
  _mapHubMarkers = [];
  var h = document.getElementById('mh-map-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeMapHub = closeMapHub;

function mapHubInit() {
  if (!window.maplibregl) { console.warn('[MapHub] MapLibre not loaded'); return; }

  _mapHubMap = new maplibregl.Map({
    container: 'mh-maplibre',
    style: 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=' + MAPTILER_KEY,
    center: [-120.6642, 35.2828],
    zoom: 13.5,
    attributionControl: false,
  });

  _mapHubMap.on('load', function() {
    mapHubPlotMarkers();
  });
}

function mapHubPlotMarkers() {
  // Clear existing
  _mapHubMarkers.forEach(function(m) { m.remove(); });
  _mapHubMarkers = [];

  var visiblePoints = MAP_POINTS.filter(function(p) { return _mapActiveLayers[p.category]; });

  visiblePoints.forEach(function(p) {
    var layer = MAP_LAYERS.find(function(l) { return l.id === p.category; });
    var color = layer ? layer.color : '#ffffff';

    // Custom marker element
    var el = document.createElement('div');
    el.style.cssText = 'width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;background:rgba(6,6,15,0.85);border:2px solid ' + color + ';box-shadow:0 0 8px ' + color + '60;transition:transform 0.15s';
    el.innerHTML = p.emoji;
    el.addEventListener('mouseenter', function() { el.style.transform = 'scale(1.2)'; });
    el.addEventListener('mouseleave', function() { el.style.transform = 'scale(1)'; });

    var popup = new maplibregl.Popup({ offset:18, closeButton:false, closeOnClick:true })
      .setHTML('<div class="maphub-popup"><div class="name">' + p.name + '</div><div class="desc">' + p.desc + '</div></div>');

    var marker = new maplibregl.Marker({ element: el })
      .setLngLat([p.lng, p.lat])
      .setPopup(popup)
      .addTo(_mapHubMap);

    _mapHubMarkers.push(marker);
  });
}

function mapHubToggleLayer(el, layerId) {
  _mapActiveLayers[layerId] = !_mapActiveLayers[layerId];
  el.classList.toggle('active', _mapActiveLayers[layerId]);
  mapHubPlotMarkers();
}
window.mapHubToggleLayer = mapHubToggleLayer;
