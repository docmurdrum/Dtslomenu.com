// ══════════════════════════════════════════════
// BREWERY_HUB.JS — SLO Craft Beer Hub
// Data sourced from Supabase venues table
// ══════════════════════════════════════════════

var SLO_BREWERIES = []; // populated from Supabase on open

async function loadBreweries(filterId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('venues')
      .select('*')
      .eq('hub_id', 'beer')
      .eq('city_id', 'slo')
      .eq('active', true)
      .order('name', { ascending: true });
    var res = await q;
    if (res.error) throw res.error;
    var data = res.data || [];
    // Client-side tag filtering
    if (filterId && filterId !== 'all' && filterId !== 'crawl') {
      var tagMap = {
        hazy:       ['Hazy', 'IPA', 'Hazy IPA', 'Double IPA'],
        sour:       ['Sour', 'Wild Ales', 'Farmhouse'],
        lager:      ['Lager'],
        stout:      ['Stout', 'Dark'],
        patio:      ['Patio', 'Beer Garden', 'Outdoor'],
        food:       ['Food'],
        live_music: ['Live Music'],
        dogs:       ['Dog Friendly'],
      };
      var tags = tagMap[filterId] || [];
      if (tags.length) {
        data = data.filter(function(b) {
          return (b.tags || []).some(function(t) {
            return tags.some(function(ft) { return t.toLowerCase().indexOf(ft.toLowerCase()) >= 0; });
          });
        });
      }
    }
    return data.map(function(r) {
      return {
        id:        String(r.id),
        name:      r.name,
        emoji:     '🍺',
        style:     r.tags ? r.tags.filter(function(t){ return ['IPA','Hazy','Sour','Lager','Stout','Pale Ale','Wheat','Farmhouse'].some(function(s){return t.indexOf(s)>=0;}); }) : [],
        vibe:      r.description ? r.description.substring(0, 80) : '',
        address:   r.address || '',
        hood:      r.category || 'slo',
        hours:     '',
        happy_hour:false,
        dogs:      (r.tags || []).some(function(t){ return t.toLowerCase().indexOf('dog') >= 0; }),
        patio:     (r.tags || []).some(function(t){ return t.toLowerCase().indexOf('patio') >= 0 || t.toLowerCase().indexOf('garden') >= 0 || t.toLowerCase().indexOf('outdoor') >= 0; }),
        food:      (r.tags || []).some(function(t){ return t.toLowerCase().indexOf('food') >= 0; }),
        live_music:(r.tags || []).some(function(t){ return t.toLowerCase().indexOf('music') >= 0; }),
        coords:    (r.lng && r.lat) ? [r.lng, r.lat] : null,
        tip:       '',
        must_try:  '',
        walkable:  r.category === 'downtown',
        tags:      r.tags || [],
        rating:    r.rating || null,
      };
    });
  } catch(e) {
    console.warn('[BreweryHub] Supabase load failed:', e);
    return [];
  }
}

function brewRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4].map(function() {
      return '<div style="height:80px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);animation:brew-shimmer 1.4s infinite"><style>@keyframes brew-shimmer{0%,100%{opacity:0.5}50%{opacity:1}}</style></div>';
    }).join('') + '</div>';
}

var BEER_STYLES = [
  { id:'all',          label:'All',       emoji:'🍺' },
  { id:'hazy',         label:'Hazy/IPA',  emoji:'🌊' },
  { id:'sour',         label:'Sour',      emoji:'🍋' },
  { id:'lager',        label:'Lager',     emoji:'🥂' },
  { id:'stout',        label:'Dark',      emoji:'🖤' },
  { id:'patio',        label:'Patio',     emoji:'🌿' },
  { id:'food',         label:'Food',      emoji:'🍔' },
  { id:'live_music',   label:'Live Music',emoji:'🎸' },
  { id:'dogs',         label:'Dog Friendly',emoji:'🐕'},
  { id:'crawl',        label:'Build Crawl',emoji:'🗺'},
];

var brewCrawlList = [];

function openBreweryHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('beer');
  var existing = document.getElementById('mh-brewery-hub');
  if (existing) existing.remove();

if (!document.getElementById('brew-hub-css')) {
    var s = document.createElement('style');
    s.id = 'brew-hub-css';
    s.textContent = [
      '.brew-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(245,158,11,0.2);background:rgba(245,158,11,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.brew-filter.active{background:rgba(245,158,11,0.15);border-color:#f59e0b;color:#f59e0b}',
      '.brew-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;transition:all 0.15s}',
      '.brew-card:active{background:rgba(245,158,11,0.06);transform:scale(0.98)}',
      '.brew-badge{padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.2);color:#f59e0b}',
      '.crawl-add-btn{padding:6px 12px;border-radius:20px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);color:#f59e0b;font-size:11px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.crawl-add-btn.added{background:rgba(34,197,94,0.12);border-color:#22c55e;color:#22c55e}',
    ].join('');
    document.head.appendChild(s);
  }

  brewCrawlList = [];

  var hub = document.createElement('div');
  hub.id = 'mh-brewery-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseBreweryHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🍺 Craft Beer</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">SLO brewing scene · ' + SLO_BREWERIES.length + ' breweries</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseBreweryHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;margin-bottom:12px">' +
        BEER_STYLES.map(function(f, i) {
          return '<button class="brew-filter' + (i===0?' active':'') + '" onclick="brewFilter(this,this.dataset.id)" data-id="' + f.id + '">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="brew-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      brewRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('beer');

  loadBreweries('all').then(function(breweries) {
    SLO_BREWERIES = breweries;
    var content = document.getElementById('brew-content');
    if (content) content.innerHTML = brewRenderList(breweries);
  });
}
window.menuHomeOpenBreweryHub = openBreweryHub;

function closeBreweryHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('beer');
  var h = document.getElementById('mh-brewery-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseBreweryHub = closeBreweryHub;

function brewFilter(el, filterId) {
  document.querySelectorAll('.brew-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('brew-content');
  if (filterId === 'crawl') {
    if (content) content.innerHTML = brewRenderCrawlBuilder();
    return;
  }
  if (content) content.innerHTML = brewRenderLoading();
  loadBreweries(filterId).then(function(breweries) {
    SLO_BREWERIES = breweries;
    if (content) content.innerHTML = brewRenderList(breweries);
  });
  return; // prevent fall-through
  if (!content) return;

  if (filterId === 'crawl') {
    content.innerHTML = brewRenderCrawlBuilder();
    return;
  }

  var filtered = SLO_BREWERIES;
  if (filterId === 'hazy')       filtered = filtered.filter(function(b) { return b.style.some(function(s) { return s.match(/hazy|ipa/i); }); });
  if (filterId === 'sour')       filtered = filtered.filter(function(b) { return b.style.some(function(s) { return s.match(/sour|wild|farmhouse/i); }); });
  if (filterId === 'lager')      filtered = filtered.filter(function(b) { return b.style.some(function(s) { return s.match(/lager|pilsner/i); }); });
  if (filterId === 'stout')      filtered = filtered.filter(function(b) { return b.style.some(function(s) { return s.match(/stout|dark|porter/i); }); });
  if (filterId === 'patio')      filtered = filtered.filter(function(b) { return b.patio; });
  if (filterId === 'food')       filtered = filtered.filter(function(b) { return b.food; });
  if (filterId === 'live_music') filtered = filtered.filter(function(b) { return b.live_music; });
  if (filterId === 'dogs')       filtered = filtered.filter(function(b) { return b.dogs; });

  content.innerHTML = brewRenderList(filtered);
}
window.brewFilter = brewFilter;

function brewRenderList(breweries) {
  if (!breweries.length) return '<div style="padding:40px;text-align:center;color:rgba(255,255,255,0.3);font-size:13px">No breweries match this filter</div>';

  return breweries.map(function(b) {
    var inCrawl = brewCrawlList.indexOf(b.id) >= 0;
    var badges = [];
    if (b.happy_hour) badges.push('HH');
    if (b.patio)      badges.push('🌿 Patio');
    if (b.food)       badges.push('🍔 Food');
    if (b.live_music) badges.push('🎸 Live Music');
    if (b.dogs)       badges.push('🐕 Dogs OK');
    if (!b.walkable)  badges.push('🚗 Drive');

    return '<div class="brew-card" onclick="brewOpenDetail(this.dataset.id)" data-id="' + b.id + '">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<div style="font-size:28px;flex-shrink:0">' + b.emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + b.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:4px">' + b.vibe + '</div>' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
            b.style.slice(0,3).map(function(s) {
              return '<span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:10px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);color:rgba(245,158,11,0.7)">' + s + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<button class="crawl-add-btn' + (inCrawl?' added':'') + '" onclick="brewToggleCrawl(event,this.dataset.id)" data-id="' + b.id + '">' +
          (inCrawl ? '✓ Added' : '+ Crawl') +
        '</button>' +
      '</div>' +
      (badges.length ? '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
        badges.map(function(badge) {
          return '<span class="brew-badge">' + badge + '</span>';
        }).join('') +
      '</div>' : '') +
    '</div>';
  }).join('');
}

function brewOpenDetail(id) {
  var b = SLO_BREWERIES.find(function(x) { return x.id === id; });
  if (!b) return; // cache miss

  var existing = document.getElementById('mh-brew-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-brew-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inCrawl = brewCrawlList.indexOf(b.id) >= 0;

  sheet.innerHTML =
    '<div id="mh-bd-inner" style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(245,158,11,0.25);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="brewCloseDetail()"></div>' +
      '<div style="font-size:36px;margin-bottom:8px">' + b.emoji + '</div>' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + b.name + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:12px">' + b.vibe + '</div>' +

      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">' +
        b.style.map(function(s) {
          return '<span style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);color:#f59e0b">' + s + '</span>';
        }).join('') +
      '</div>' +

      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">' +
        (b.address ? '<div style="font-size:12px;color:rgba(255,255,255,0.35)">📍 ' + b.address + '</div>' : '') +
        '<div style="font-size:12px;color:rgba(255,255,255,0.35)">⏰ ' + b.hours + '</div>' +
        (b.happy_hour && b.hh_details ? '<div style="font-size:12px;color:#22c55e">🍺 Happy Hour: ' + b.hh_details + '</div>' : '') +
      '</div>' +

      '<div style="padding:12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:12px;margin-bottom:16px">' +
        '<div style="font-size:11px;font-weight:700;color:#f59e0b;margin-bottom:4px">💡 Insider tip</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + b.tip + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:6px">Must try: ' + b.must_try + '</div>' +
      '</div>' +

      '<div style="display:flex;gap:8px;margin-bottom:10px">' +
        '<a href="https://www.google.com/maps/search/' + encodeURIComponent(b.name + ' ' + (b.address||'San Luis Obispo CA')) + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:12px;font-weight:700;text-align:center">Directions ↗</a>' +
        '<button onclick="brewToggleCrawl(event,\'' + b.id + '\')" style="flex:1;padding:12px;border-radius:12px;border:none;background:' + (inCrawl ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)') + ';color:' + (inCrawl ? '#22c55e' : '#f59e0b') + ';font-size:12px;font-weight:800;font-family:inherit;cursor:pointer">' + (inCrawl ? '✓ In your crawl' : '+ Add to crawl') + '</button>' +
      '</div>' +
      '<button onclick="brewCloseDetail()" style="width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Close</button>' +
    '</div>';

  getHubParent().appendChild(sheet);
  setTimeout(function() {
    sheet.style.opacity = '1';
    document.getElementById('mh-bd-inner').style.transform = 'translateY(0)';
  }, 30);
  sheet.addEventListener('click', function(e) { if (e.target===sheet) brewCloseDetail(); });

  // Fly map to brewery
  if (typeof homeMap !== 'undefined' && homeMap && b.coords) {
    try { homeMap.flyTo({ center: b.coords, zoom: 15, duration: 800 }); } catch(e) {}
  }
}
window.brewOpenDetail = brewOpenDetail;

function brewCloseDetail() {
  var s = document.getElementById('mh-brew-detail');
  if (s) { s.style.opacity='0'; setTimeout(function(){s.remove();},300); }
}
window.brewCloseDetail = brewCloseDetail;

function brewToggleCrawl(e, id) {
  e.stopPropagation();
  var idx = brewCrawlList.indexOf(id);
  if (idx >= 0) {
    brewCrawlList.splice(idx, 1);
  } else if (brewCrawlList.length < 5) {
    brewCrawlList.push(id);
  } else {
    if (typeof showToast === 'function') showToast('Max 5 stops in a crawl');
    return;
  }
  // Refresh current view
  var activeFilter = document.querySelector('.brew-filter.active');
  if (activeFilter) brewFilter(activeFilter, activeFilter.dataset.id);
  // Show crawl count badge
  if (brewCrawlList.length > 0 && typeof showToast === 'function') {
    showToast('🗺 ' + brewCrawlList.length + ' stop' + (brewCrawlList.length>1?'s':'') + ' in your crawl');
  }
}
window.brewToggleCrawl = brewToggleCrawl;

function brewRenderCrawlBuilder() {
  if (!brewCrawlList.length) {
    return '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);font-size:13px">' +
      '<div style="font-size:36px;margin-bottom:12px">🗺</div>' +
      'Tap "+ Crawl" on any brewery to add it to your route' +
    '</div>' +
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">SUGGESTED CRAWLS</div>' +
    brewSuggestedCrawls();
  }

  var stops = brewCrawlList.map(function(id) {
    return SLO_BREWERIES.find(function(b) { return b.id === id; });
  }).filter(Boolean);

  var walkable = stops.filter(function(b) { return b.walkable; });
  var driveNeeded = stops.filter(function(b) { return !b.walkable; });

  var html = '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">YOUR CRAWL (' + stops.length + ' stops)</div>';

  html += stops.map(function(b, i) {
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:12px;margin-bottom:6px">' +
      '<div style="font-size:16px;font-weight:900;color:#f59e0b;min-width:20px">' + (i+1) + '</div>' +
      '<div style="font-size:24px">' + b.emoji + '</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:800">' + b.name + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + b.address + '</div></div>' +
      '<button onclick="brewToggleCrawl(event,\'' + b.id + '\')" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:16px;padding:4px">✕</button>' +
    '</div>';
  }).join('');

  if (driveNeeded.length) {
    html += '<div style="padding:10px 12px;background:rgba(255,165,0,0.06);border:1px solid rgba(255,165,0,0.15);border-radius:10px;font-size:12px;color:rgba(255,165,0,0.7);margin-bottom:12px">🚗 ' + driveNeeded.length + ' stop' + (driveNeeded.length>1?'s require':'s requires') + ' driving — designate a driver or use Rides</div>';
  }

  var mapsUrl = 'https://www.google.com/maps/dir/' + stops.map(function(b) {
    return encodeURIComponent(b.name + ' ' + (b.address||'San Luis Obispo CA'));
  }).join('/');

  html += '<div style="display:flex;gap:8px;margin-top:4px">' +
    '<button onclick="brewCrawlList=[];brewFilter(document.querySelector(\'.brew-filter\'),\'all\')" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Clear</button>' +
    '<a href="' + mapsUrl + '" target="_blank" style="flex:2;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:13px;font-weight:800;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center">Start Crawl →</a>' +
  '</div>';

  html += '<div style="margin-top:16px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">SUGGESTED CRAWLS</div>';
  html += brewSuggestedCrawls();

  return html;
}

function brewSuggestedCrawls() {
  var crawls = [
    { name:'Downtown Walkable', desc:'3 stops, no car needed', emoji:'👟', stops:['libertine','there_does_not_exist','ancient_owl'] },
    { name:'Hazy & IPA Trail', desc:'Hop-forward all the way', emoji:'🌊', stops:['liquid_gravity','central_coast','humdinger'] },
    { name:'Full Day Local', desc:'Hit the best of SLO', emoji:'🏆', stops:['slo_brew_rock','central_coast','libertine','ancient_owl'] },
    { name:'Sour Power', desc:'Tart and funky', emoji:'🍋', stops:['libertine','there_does_not_exist'] },
  ];

  return crawls.map(function(c) {
    var stops = c.stops.map(function(id) {
      return SLO_BREWERIES.find(function(b) { return b.id === id; });
    }).filter(Boolean);

    return '<div style="padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:8px;cursor:pointer" onclick="brewLoadSuggestedCrawl(' + JSON.stringify(c.stops) + ')">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
        '<div style="font-size:20px">' + c.emoji + '</div>' +
        '<div><div style="font-size:13px;font-weight:800">' + c.name + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + c.desc + ' · ' + stops.length + ' stops</div></div>' +
      '</div>' +
      '<div style="font-size:11px;color:#f59e0b">' + stops.map(function(b){return b.emoji+' '+b.name;}).join(' → ') + '</div>' +
    '</div>';
  }).join('');
}

function brewLoadSuggestedCrawl(stops) {
  brewCrawlList = stops.slice();
  var crawlFilter = document.querySelector('[data-id="crawl"]');
  if (crawlFilter) brewFilter(crawlFilter, 'crawl');
}
window.brewLoadSuggestedCrawl = brewLoadSuggestedCrawl;
