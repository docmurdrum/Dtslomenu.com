// ══════════════════════════════════════════════
// MENU_HOME.JS — Hub Selection Screen v2
// Interactive 3D map with bottom toolbar
// ══════════════════════════════════════════════

(function() {

  var MAPTILER_KEY = 'kiFBCC0bWlsukNO2sHf7';
  var homeMap      = null;
  var homeDone     = false;
  var activeDrawer = null;

  // ── PUBLIC API ──
  window.menuHomeInit        = init;
  window.menuHomeEnterDTSLO  = enterDTSLO;
  window.menuHomeSkipToggle  = skipToggle;
  window.menuHomePromptYes   = promptYes;
  window.menuHomePromptNo    = promptNo;
  window.menuHomeOpenDrawer  = openDrawer;
  window.menuHomeCloseDrawer = closeDrawer;
  window.menuHomeFindHubs    = findHubs;

  function init() {
    try {
      var count = parseInt(localStorage.getItem('menu_open_count') || '0') + 1;
      localStorage.setItem('menu_open_count', count);

      if (localStorage.getItem('menu_skip_to_dtslo') === '1') {
        revealApp(); return;
      }

      injectCSS();
      injectHTML();

      var el = document.getElementById('menu-home');
      if (!el) { revealApp(); return; }
      el.style.display = 'block';
      loadHomeMap();

      if (count === 2) setTimeout(showSkipPrompt, 4000);
    } catch(e) {
      console.warn('[MenuHome]', e);
      revealApp();
    }
  }

  function enterDTSLO() {
    closeDrawer();
    closeToolSheet();
    // Building animation then transition
    animateHubEntry([-120.6650, 35.2803], function() {
      var el = document.getElementById('menu-home');
      if (el) {
        el.style.transition = 'opacity 0.6s ease';
        el.style.opacity = '0';
        setTimeout(function() {
          el.style.display = 'none';
          if (homeMap) { try { homeMap.remove(); } catch(e) {} homeMap = null; }
          revealApp();
        }, 620);
      } else { revealApp(); }
    });
  }

  function revealApp() {
    var el = document.getElementById('menu-home');
    if (el) el.style.display = 'none';
  }

  function skipToggle(on) { localStorage.setItem('menu_skip_to_dtslo', on ? '1' : '0'); }
  function promptYes() { localStorage.setItem('menu_skip_to_dtslo', '1'); hidePrompt(); }
  function promptNo()  { localStorage.setItem('menu_skip_to_dtslo', '0'); hidePrompt(); }

  function showSkipPrompt() {
    var p = document.getElementById('mh-skip-prompt');
    if (p) { p.style.display = 'flex'; setTimeout(function() { p.style.opacity = '1'; }, 50); }
  }
  function hidePrompt() {
    var p = document.getElementById('mh-skip-prompt');
    if (p) { p.style.opacity = '0'; setTimeout(function() { p.style.display = 'none'; }, 350); }
  }

  // ── DRAWER ──
  function openDrawer(id) {
    if (id === 'travel') { setTimeout(function() { try { menuHomeTravelLoadVenues(); } catch(e) {} }, 100); }
    // Close any open drawer first
    ['mh-drawer-hubs','mh-drawer-travel','mh-drawer-tools','mh-drawer-dev'].forEach(function(d) {
      var el = document.getElementById(d);
      if (el) el.classList.remove('mh-drawer-open');
    });
    ['mh-tab-hubs','mh-tab-travel','mh-tab-tools','mh-tab-dev'].forEach(function(t) {
      var el = document.getElementById(t);
      if (el) el.classList.remove('mh-tab-active');
    });

    if (activeDrawer === id) {
      activeDrawer = null;
      return;
    }
    activeDrawer = id;
    var drawer = document.getElementById('mh-drawer-' + id);
    var tab    = document.getElementById('mh-tab-' + id);
    if (drawer) drawer.classList.add('mh-drawer-open');
    if (tab)    tab.classList.add('mh-tab-active');
  }


  function hubPreview(id) {
    // Beach hub is live — open beach selector instead of coming soon
    if (id === 'beach') { openBeachHub(); return; }
    if (id === 'restaurant') { openRestaurantHub(); return; }
    var hubs = {
      beach: {
        name: 'Beach Hub', emoji: '🏖', color: 'linear-gradient(135deg,#06b6d4,#0ea5e9)',
        tagline: 'Surf conditions, beach cams, coastal trails and more',
        features: ['🌊 Live surf cams & conditions','🚗 Beach traffic & parking','🥾 Coastal hiking trails','🏄 Rental & activity bookings','📍 Beach geo caches','🌅 Sunset alerts'],
        suggestions: ['Surf conditions','Beach parking','Rentals','Events','Tide charts','Other'],
        isLive: true
      },
      calpoly: {
        name: 'Cal Poly Hub', emoji: '🎓', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        tagline: 'Campus life, events, sports and student resources',
        features: ['🏈 Mustang sports & tickets','📅 Campus events calendar','🍕 Dining & late night food','🎭 Performing Arts Center','📚 Study spots & library','🎓 Campus tours'],
        suggestions: ['Sports & events','Dining','Study spots','Campus map','Student deals','Other']
      },
      city: {
        name: 'City Hub', emoji: '🏛', color: 'linear-gradient(135deg,#00f5ff,#00ff88)',
        tagline: 'Community marketplace, civic events and local services',
        features: ['🛒 Local marketplace','💼 Gig work & odd jobs','📅 City events & permits','🌳 Parks & recreation','🗳 Community board','🤝 Volunteer opportunities'],
        suggestions: ['Marketplace','Gig work','City events','Parks','Community board','Other']
      }
    };
    var hub = hubs[id];
    if (!hub) return;

    var existing = document.getElementById('mh-hub-preview');
    if (existing) existing.remove();

    var selectedTags = [];

    var sheet = document.createElement('div');
    sheet.id = 'mh-hub-preview';
    sheet.innerHTML = [
      '<div id="mh-hub-preview-inner">',
        '<div class="mh-sheet-handle" id="mh-preview-handle"></div>',
        '<div style="width:56px;height:56px;border-radius:16px;background:' + hub.color + ';display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:12px">' + hub.emoji + '</div>',
        '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:6px">' + hub.name + '</div>',
        '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:16px;line-height:1.5">' + hub.tagline + '</div>',
        '<div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">COMING SOON</div>',
        hub.features.map(function(f) {
          return '<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:13px;color:rgba(255,255,255,0.7)">' + f + '</div>';
        }).join(''),
        // Suggestion section
        '<div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.03);border-radius:16px;border:1px solid rgba(255,255,255,0.08)">',
          '<div style="font-size:13px;font-weight:800;margin-bottom:4px">💬 What do YOU want to see?</div>',
          '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:12px">Your input shapes what we build first</div>',
          '<div id="mh-suggestion-tags" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">',
            hub.suggestions.map(function(s) {
              return '<div class="mh-suggestion-tag" data-tag="' + s + '" onclick="menuHomeToggleSuggestionTag(this)">' + s + '</div>';
            }).join(''),
          '</div>',
          '<textarea id="mh-suggestion-text" placeholder="What would you love to see here..." style="width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:white;font-size:13px;font-family:Helvetica Neue,sans-serif;resize:none;height:80px;outline:none"></textarea>',
          '<button id="mh-suggestion-submit" onclick="menuHomeSubmitSuggestion(this.dataset.hub)" data-hub="' + id + '" style="width:100%;margin-top:10px;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05));color:white;font-size:14px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">Send Feedback →</button>',
          '<div id="mh-suggestion-thanks" style="display:none;text-align:center;padding:12px;font-size:13px;color:#22c55e;font-weight:700">✅ Thanks! Your input helps us build better.</div>',
        '</div>',
        '<button id="mh-preview-close-btn" style="width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>',
      '</div>',
    ].join('');

    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() {
      sheet.classList.add('show');
      var handle = document.getElementById('mh-preview-handle');
      var closeBtn = document.getElementById('mh-preview-close-btn');
      var closeSheet = function() { sheet.remove(); };
      if (handle) handle.addEventListener('click', closeSheet);
      if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    }, 50);
  }

  window.menuHomeHubPreview = hubPreview;
  function toggleSuggestionTag(el) {
    el.classList.toggle('mh-suggestion-tag-sel');
  }
  window.menuHomeToggleSuggestionTag = toggleSuggestionTag;

  async function submitSuggestion(hubId) {
    var tags = [];
    document.querySelectorAll('.mh-suggestion-tag-sel').forEach(function(t) {
      tags.push(t.dataset.tag);
    });
    var text = document.getElementById('mh-suggestion-text');
    var textVal = text ? text.value.trim() : '';
    var submitBtn = document.getElementById('mh-suggestion-submit');
    var thanks = document.getElementById('mh-suggestion-thanks');

    if (!tags.length && !textVal) {
      text.style.borderColor = 'rgba(255,45,120,0.5)';
      setTimeout(function() { text.style.borderColor = 'rgba(255,255,255,0.1)'; }, 1500);
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitBtn) submitBtn.textContent = 'Sending...';

    try {
      var payload = {
        hub_id: hubId,
        tags: tags,
        suggestion: textVal,
        created_at: new Date().toISOString()
      };

      // Try Supabase insert
      if (window.supabaseClient) {
        await window.supabaseClient.from('hub_suggestions').insert([payload]);
      }

      if (submitBtn) submitBtn.style.display = 'none';
      if (thanks) thanks.style.display = 'block';
      // Clear tags
      document.querySelectorAll('.mh-suggestion-tag-sel').forEach(function(t) {
        t.classList.remove('mh-suggestion-tag-sel');
      });
      if (text) text.value = '';
    } catch(e) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Feedback →'; }
      console.warn('[Suggestion]', e);
    }
  }
  window.menuHomeSubmitSuggestion = submitSuggestion;



  function closeThenShowPlanIt() {
    closeDrawer();
    // Plan It will be wired in next build
    setTimeout(function() {
      if (typeof revealApp === 'function') revealApp();
    }, 300);
  }
  window.menuHomeCloseThenShowPlanIt = closeThenShowPlanIt;



  // ══════════════════════════════════════════════
  // BEACH HUB
  // ══════════════════════════════════════════════

  var BEACHES = [
    {
      id: 'avila', name: 'Avila Beach', emoji: '🏖', drive: '10 min', miles: 8,
      vibe: 'Calm & family-friendly', rating: 'Good', surf: '1-2 ft',
      wind: 'Light offshore', water: '58°F', uv: 6, tide: 'Incoming',
      color: '#22c55e', coords: [-120.7319, 35.1797],
      parking: [
        {name:'Front Beach Lot', cost:'$2/hr', status:'Open'},
        {name:'Avila Village Lot', cost:'Free 2hr', status:'Open'},
        {name:'Harford Pier Lot', cost:'$1/hr', status:'Busy'},
      ],
      trails: [
        {name:'Bob Jones Trail', dist:'3.5 mi one way', diff:'Easy', dogs:true, notes:'Paved, connects SLO to Avila'},
        {name:'Cave Landing Trail', dist:'1.2 mi', diff:'Easy', dogs:true, notes:'Ocean views and sea caves'},
      ],
      rentals: [
        {name:'Central Coast Kayaks', type:'Kayak/SUP', price:'$20/hr', link:'https://centralcoastkayaks.com'},
        {name:'Avila Beach Surf School', type:'Surf lessons', price:'$75', link:'https://avilabeachsurfschool.com'},
        {name:'Avila Bike Rentals', type:'Bikes', price:'$15/hr', link:''},
      ],
      eat: [
        {name:'Custom House Restaurant', vibe:'Seafood on the pier', price:'$$$'},
        {name:'Old Custom House', vibe:'Casual beachfront', price:'$$'},
        {name:'Avila Grocery', vibe:'Deli & snacks', price:'$'},
      ],
      cams: ['https://www.805webcams.com/avila-beach'],
      bus: {route:'Route 6 - Avila Beach', fare:1.50, freq:'Hourly'},
      sunrise: '6:42 AM', sunset: '7:28 PM',
    },
    {
      id: 'pismo', name: 'Pismo Beach', emoji: '🌊', drive: '15 min', miles: 12,
      vibe: 'Classic boardwalk vibes', rating: 'Fair', surf: '2-3 ft',
      wind: 'W swell, light winds', water: '57°F', uv: 7, tide: 'Outgoing',
      color: '#06b6d4', coords: [-120.6413, 35.1427],
      parking: [
        {name:'Pismo Pier Lot', cost:'$2/hr', status:'Busy'},
        {name:'Price St Lot', cost:'$1.50/hr', status:'Open'},
        {name:'Dolliver St Parking', cost:'Free 2hr', status:'Open'},
      ],
      trails: [
        {name:'Pismo Beach Boardwalk', dist:'0.5 mi', diff:'Easy', dogs:true, notes:'Flat beachfront walk'},
        {name:'Pismo Preserve Trail', dist:'5.5 mi loop', diff:'Moderate', dogs:true, notes:'Oak woodland and ocean views'},
        {name:'Monarch Butterfly Grove', dist:'0.3 mi', diff:'Easy', dogs:false, notes:'Oct-Feb only — thousands of monarchs'},
      ],
      rentals: [
        {name:'Pismo Beach Surf Shop', type:'Board rentals', price:'$15/hr', link:''},
        {name:'Pismo Surf School', type:'Surf lessons', price:'$80', link:''},
        {name:'Beach Rentals SLO', type:'Bikes/boards/chairs', price:'$10/hr', link:''},
      ],
      eat: [
        {name:'Splash Cafe', vibe:'Famous clam chowder', price:'$$'},
        {name:'Old West Cinnamon Rolls', vibe:'Local institution', price:'$'},
        {name:'Cracked Crab', vibe:'Seafood buckets', price:'$$$'},
      ],
      cams: ['https://www.805webcams.com/pismo-beach'],
      bus: {route:'Route 10 - Pismo Beach', fare:1.50, freq:'Every 2 hrs'},
      sunrise: '6:42 AM', sunset: '7:29 PM',
    },
    {
      id: 'shell', name: 'Shell Beach', emoji: '🪨', drive: '12 min', miles: 10,
      vibe: 'Dramatic cliffs, local fave', rating: 'Fair', surf: '2-4 ft',
      wind: 'NW swell, choppy', water: '56°F', uv: 6, tide: 'Outgoing',
      color: '#f59e0b', coords: [-120.6600, 35.1552],
      parking: [
        {name:'Shell Beach Rd Lot', cost:'Free', status:'Open'},
        {name:'Cliff Ave Parking', cost:'Free', status:'Open'},
      ],
      trails: [
        {name:'Pelican Point Trail', dist:'1.5 mi', diff:'Easy', dogs:true, notes:'Dramatic ocean bluff walk'},
        {name:'Spyglass Park Loop', dist:'2 mi', diff:'Easy', dogs:true, notes:'Hidden coves and tide pools'},
      ],
      rentals: [
        {name:'See Pismo/Avila for nearest surf rentals', type:'None local', price:'', link:''},
      ],
      eat: [
        {name:'Sea Venture Restaurant', vibe:'Oceanfront fine dining', price:'$$$'},
        {name:'Shell Beach Bar & Grill', vibe:'Casual coastal', price:'$$'},
      ],
      cams: ['https://www.805webcams.com'],
      bus: {route:'Route 10 via Pismo', fare:1.50, freq:'Every 2 hrs'},
      sunrise: '6:42 AM', sunset: '7:28 PM',
    },
    {
      id: 'morro', name: 'Morro Bay', emoji: '🦦', drive: '30 min', miles: 14,
      vibe: 'Wildlife & Morro Rock', rating: 'Poor', surf: '3-4 ft',
      wind: 'Cross-shore winds', water: '55°F', uv: 5, tide: 'Incoming',
      color: '#b44fff', coords: [-120.8500, 35.3658],
      parking: [
        {name:'Embarcadero Lot', cost:'$1.50/hr', status:'Open'},
        {name:'Coleman Park Lot', cost:'Free', status:'Open'},
        {name:'Morro Strand Lot', cost:'$10/day', status:'Open'},
      ],
      trails: [
        {name:'Morro Strand State Beach', dist:'3 mi', diff:'Easy', dogs:true, notes:'Wide flat beach, good for walking'},
        {name:'Black Hill Trail', dist:'2 mi', diff:'Moderate', dogs:true, notes:'Views of Morro Rock and bay'},
        {name:'Cerro Cabrillo Peak', dist:'3.5 mi', diff:'Moderate', dogs:true, notes:'One of the Nine Sisters'},
      ],
      rentals: [
        {name:'Central Coast Outdoors', type:'Kayak tours', price:'$65', link:''},
        {name:'Rock Kayak', type:'Kayak rentals', price:'$25/hr', link:''},
        {name:'Morro Bay Bike Rentals', type:'Bikes', price:'$12/hr', link:''},
      ],
      eat: [
        {name:'Taco Temple', vibe:'Best fish tacos on coast', price:'$'},
        {name:'Dockside Too', vibe:'Waterfront seafood', price:'$$'},
        {name:'Sub-Sub Sandwich', vibe:'Local legend', price:'$'},
      ],
      cams: ['https://www.805webcams.com/morro-bay'],
      bus: {route:'RTA Route 12 - Morro Bay', fare:1.75, freq:'Every 90 min'},
      sunrise: '6:44 AM', sunset: '7:31 PM',
    },
    {
      id: 'cayucos', name: 'Cayucos', emoji: '🏄', drive: '35 min', miles: 20,
      vibe: 'Old California charm', rating: 'Good', surf: '2-3 ft',
      wind: 'NW offshore', water: '56°F', uv: 5, tide: 'Incoming',
      color: '#22c55e', coords: [-120.8939, 35.4426],
      parking: [
        {name:'Cayucos Pier Lot', cost:'Free', status:'Open'},
        {name:'Ocean Ave Street', cost:'Free', status:'Open'},
      ],
      trails: [
        {name:'Cayucos to Morro Bay Beach Walk', dist:'5 mi one way', diff:'Easy', dogs:true, notes:'Flat beach walk between towns'},
      ],
      rentals: [
        {name:'Good Clean Fun Surf Shop', type:'Surf/board rentals', price:'$15/hr', link:''},
      ],
      eat: [
        {name:'Cayucos Scoop', vibe:'Best ice cream on the coast', price:'$'},
        {name:'Hoppe\'s Garden Bistro', vibe:'Upscale farm to table', price:'$$$'},
        {name:'Sea Shanty', vibe:'Classic beachside diner', price:'$$'},
      ],
      cams: ['https://www.805webcams.com'],
      bus: {route:'RTA Route 12', fare:1.75, freq:'Limited'},
      sunrise: '6:44 AM', sunset: '7:31 PM',
    },
    {
      id: 'cambria', name: 'Cambria', emoji: '🌲', drive: '55 min', miles: 35,
      vibe: 'Artist colony, wild coast', rating: 'Fair', surf: '3-5 ft',
      wind: 'NW winds, rough', water: '54°F', uv: 4, tide: 'Outgoing',
      color: '#06b6d4', coords: [-121.1025, 35.5641],
      parking: [
        {name:'Moonstone Beach Lot', cost:'Free', status:'Open'},
        {name:'Santa Rosa Creek Lot', cost:'Free', status:'Open'},
      ],
      trails: [
        {name:'Moonstone Beach Boardwalk', dist:'1.5 mi', diff:'Easy', dogs:true, notes:'Dramatic rocky coast, great for tidepooling'},
        {name:'Fiscalini Ranch Preserve', dist:'4 mi loop', diff:'Moderate', dogs:true, notes:'Old growth Monterey pines and coastal bluffs'},
      ],
      rentals: [
        {name:'Limited local rentals - bring your own', type:'', price:'', link:''},
      ],
      eat: [
        {name:'Robin\'s Restaurant', vibe:'World cuisine, local legend', price:'$$$'},
        {name:'Linn\'s Restaurant', vibe:'Famous for ollalieberry pie', price:'$$'},
        {name:'Wild Ginger Cafe', vibe:'Asian fusion', price:'$$'},
      ],
      cams: ['https://www.805webcams.com'],
      bus: {route:'RTA Route 12 (limited)', fare:2.00, freq:'Very limited'},
      sunrise: '6:45 AM', sunset: '7:32 PM',
    },
    {
      id: 'oceano', name: 'Oceano Dunes', emoji: '🏜', drive: '18 min', miles: 13,
      vibe: 'OHV dunes, wide open beach', rating: 'Fair', surf: '2-3 ft',
      wind: 'NW onshore', water: '57°F', uv: 7, tide: 'Outgoing',
      color: '#f59e0b', coords: [-120.6214, 35.1052],
      parking: [
        {name:'Oceano SVRA Day Use', cost:'$5/day', status:'Open'},
        {name:'Pismo State Beach', cost:'$10/day', status:'Open'},
      ],
      trails: [
        {name:'Oso Flaco Lake Trail', dist:'2.5 mi RT', diff:'Easy', dogs:false, notes:'Freshwater lake through sand dunes to ocean'},
        {name:'Oceano Dunes SVRA Walk', dist:'Variable', diff:'Easy', dogs:true, notes:'Drive or walk on beach — 5 miles of open sand'},
      ],
      rentals: [
        {name:'Arnie\'s ATV Rentals', type:'OHV/ATV rentals', price:'$50/hr', link:''},
        {name:'Steve\'s ATV Rentals', type:'Quads & bikes', price:'$45/hr', link:''},
      ],
      eat: [
        {name:'Oceano Depot', vibe:'Historic train depot restaurant', price:'$$'},
        {name:'Mango Mango', vibe:'Tropical smoothies & bowls', price:'$'},
      ],
      cams: ['https://www.805webcams.com'],
      bus: {route:'Route 10 - Oceano', fare:1.50, freq:'Hourly'},
      sunrise: '6:42 AM', sunset: '7:28 PM',
    },
    {
      id: 'mdo', name: 'Montana de Oro', emoji: '🌿', drive: '40 min', miles: 16,
      vibe: 'Wild untouched coastline', rating: 'Poor', surf: '4-7 ft',
      wind: 'Strong NW', water: '54°F', uv: 4, tide: 'Outgoing',
      color: '#22c55e', coords: [-120.8894, 35.2659],
      parking: [
        {name:'Spooners Cove Lot', cost:'Free', status:'Open'},
        {name:'Hazard Canyon Lot', cost:'Free', status:'Open'},
        {name:'Bluff Trail Lot', cost:'Free', status:'Open'},
      ],
      trails: [
        {name:'Bluff Trail', dist:'3 mi RT', diff:'Easy', dogs:true, notes:'Most dramatic coastal scenery in SLO County'},
        {name:'Valencia Peak', dist:'4 mi RT', diff:'Hard', dogs:true, notes:'1347ft — 360 degree views on clear day'},
        {name:'Hazard Canyon Reef', dist:'1 mi RT', diff:'Easy', dogs:true, notes:'Excellent tide pools at low tide'},
        {name:'Dune Trail', dist:'2 mi loop', diff:'Easy', dogs:true, notes:'Sand dunes through beach scrub'},
      ],
      rentals: [
        {name:'No rentals on site — self-contained trip', type:'', price:'', link:''},
      ],
      eat: [
        {name:'No food on site — bring your own', vibe:'Pack a lunch', price:''},
        {name:'Nearest food in Los Osos (5 min)', vibe:'Small town diners', price:'$'},
      ],
      cams: ['https://www.805webcams.com'],
      bus: {route:'No direct bus — drive only', fare:0, freq:'None'},
      sunrise: '6:44 AM', sunset: '7:30 PM',
    },
  ];

  // ── OPEN BEACH HUB (beach selector) ──
  function openBeachHub() {
    var existing = document.getElementById('mh-beach-hub');
    if (existing) existing.remove();

    var sheet = document.createElement('div');
    sheet.id = 'mh-beach-hub';
    sheet.style.cssText = 'position:absolute;inset:0;z-index:22;display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px)';

    var ratingColor = {Good:'#22c55e', Fair:'#f59e0b', Poor:'#ef4444'};

    sheet.innerHTML =
      '<div id="mh-bh-inner" style="width:100%;background:linear-gradient(180deg,rgba(2,15,25,0.99),rgba(4,20,35,0.99));border-radius:24px 24px 0 0;border-top:2px solid rgba(6,182,212,0.3);padding:12px 20px 48px;max-height:88vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
        '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 14px;cursor:pointer" onclick="menuHomeCloseBeachHub()"></div>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
          '<div style="font-size:22px;font-weight:800;font-family:Georgia,serif;color:white">🏖 Beach Hub</div>' +
          '<div style="font-size:11px;color:rgba(6,182,212,0.7);font-weight:700">CENTRAL COAST</div>' +
        '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px">Choose a beach to see conditions, trails, parking & more</div>' +

        // Quick filter row
        '<div style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;margin-bottom:16px;scrollbar-width:none">' +
          '<button class="mh-bh-filter active" onclick="menuHomeBhFilter(this,\'all\')">All</button>' +
          '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'close\')">Closest</button>' +
          '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'good\')">🟢 Good surf</button>' +
          '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'dogs\')">🐕 Dog friendly</button>' +
          '<button class="mh-bh-filter" onclick="menuHomeBhFilter(this,\'trails\')">🥾 Trails</button>' +
        '</div>' +

        '<div id="mh-bh-beach-list">' +
          BEACHES.map(function(b) {
            var rc = ratingColor[b.rating] || 'rgba(255,255,255,0.4)';
            return '<div class="mh-bh-card" onclick="menuHomeOpenBeach(\'' + b.id + '\')" data-id="' + b.id + '" data-rating="' + b.rating + '" data-drive="' + b.miles + '">' +
              '<div style="display:flex;align-items:center;gap:12px">' +
                '<div style="font-size:32px;flex-shrink:0">' + b.emoji + '</div>' +
                '<div style="flex:1;min-width:0">' +
                  '<div style="font-size:14px;font-weight:800">' + b.name + '</div>' +
                  '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">' + b.vibe + '</div>' +
                '</div>' +
                '<div style="text-align:right;flex-shrink:0">' +
                  '<div style="font-size:13px;font-weight:800;color:' + rc + '">' + b.surf + '</div>' +
                  '<div style="font-size:10px;font-weight:700;color:' + rc + '">' + b.rating + '</div>' +
                  '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:1px">🚗 ' + b.drive + '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';

    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() {
      sheet.style.opacity = '1';
      document.getElementById('mh-bh-inner').style.transform = 'translateY(0)';
    }, 30);
    sheet.addEventListener('click', function(e) { if (e.target === sheet) menuHomeCloseBeachHub(); });

    // Inject beach hub CSS once
    if (!document.getElementById('mh-bh-css')) {
      var s = document.createElement('style');
      s.id = 'mh-bh-css';
      s.textContent = [
        '.mh-bh-filter{padding:7px 14px;border-radius:20px;border:1px solid rgba(6,182,212,0.2);background:rgba(6,182,212,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
        '.mh-bh-filter.active{background:rgba(6,182,212,0.15);border-color:rgba(6,182,212,0.5);color:#06b6d4}',
        '.mh-bh-card{padding:14px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);cursor:pointer;margin-bottom:8px;transition:all 0.15s}',
        '.mh-bh-card:active{background:rgba(6,182,212,0.08);border-color:rgba(6,182,212,0.3);transform:scale(0.98)}',
        '.mh-beach-tab{padding:8px 14px;border-radius:20px;border:1px solid rgba(6,182,212,0.15);background:rgba(6,182,212,0.04);color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
        '.mh-beach-tab.active{background:rgba(6,182,212,0.15);border-color:#06b6d4;color:#06b6d4}',
        '.mh-beach-section{margin-bottom:20px}',
        '.mh-beach-sec-title{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(6,182,212,0.6);margin-bottom:10px}',
        '.mh-cond-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}',
        '.mh-cond-card{padding:10px 8px;border-radius:12px;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.12);text-align:center}',
        '.mh-cond-val{font-size:16px;font-weight:900;color:#06b6d4}',
        '.mh-cond-lbl{font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}',
        '.mh-info-row{padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;font-size:13px}',
        '.mh-trail-card{padding:11px 12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px}',
        '.mh-rental-card{padding:11px 12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between}',
        '.mh-eat-row{padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;font-size:13px}',
        '.mh-cost-calc{padding:16px;background:rgba(6,182,212,0.05);border:1px solid rgba(6,182,212,0.15);border-radius:16px;margin-bottom:16px}',
      ].join('');
      document.head.appendChild(s);
    }
  }
  window.menuHomeOpenBeachHub = openBeachHub;

  function closeBeachHub() {
    var s = document.getElementById('mh-beach-hub');
    if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); }, 300); }
  }
  window.menuHomeCloseBeachHub = closeBeachHub;

  function bhFilter(el, type) {
    document.querySelectorAll('.mh-bh-filter').forEach(function(b) { b.classList.remove('active'); });
    el.classList.add('active');
    var cards = document.querySelectorAll('.mh-bh-card');
    cards.forEach(function(c) {
      var show = true;
      if (type === 'close')  show = parseInt(c.dataset.drive) <= 18;
      if (type === 'good')   show = c.dataset.rating === 'Good';
      if (type === 'dogs')   show = ['avila','pismo','shell','morro','cayucos','mdo'].indexOf(c.dataset.id) >= 0;
      if (type === 'trails') show = ['avila','pismo','morro','cayucos','cambria','oceano','mdo'].indexOf(c.dataset.id) >= 0;
      c.style.display = show ? 'block' : 'none';
    });
  }
  window.menuHomeBhFilter = bhFilter;

  // ── INDIVIDUAL BEACH HUB ──
  function openBeach(id) {
    var beach = null;
    for (var i = 0; i < BEACHES.length; i++) { if (BEACHES[i].id === id) { beach = BEACHES[i]; break; } }
    if (!beach) return;

    // Fly map to beach
    if (homeMap) {
      try {
        homeMap.flyTo({ center: beach.coords, zoom: 14, pitch: 50, bearing: 0, duration: 1200 });
      } catch(e) {}
    }

    // Close selector, open beach hub
    closeBeachHub();
    setTimeout(function() { showBeachDetail(beach); }, 400);
  }
  window.menuHomeOpenBeach = openBeach;

  function showBeachDetail(b) {
    var existing = document.getElementById('mh-beach-detail');
    if (existing) existing.remove();

    var ratingColor = {Good:'#22c55e', Fair:'#f59e0b', Poor:'#ef4444'};
    var rc = ratingColor[b.rating] || '#ffffff';

    var sheet = document.createElement('div');
    sheet.id = 'mh-beach-detail';
    sheet.style.cssText = 'position:absolute;inset:0;z-index:23;display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(2,15,25,0.97),rgba(4,20,35,0.97));opacity:0;transition:opacity 0.4s';

    sheet.innerHTML =
      // Header
      '<div style="padding:52px 20px 0;flex-shrink:0">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
          '<button onclick="menuHomeCloseBeachDetail()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
          '<div style="flex:1">' +
            '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">' + b.emoji + ' ' + b.name + '</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + b.vibe + '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div style="font-size:14px;font-weight:900;color:' + rc + '">' + b.surf + '</div>' +
            '<div style="font-size:10px;font-weight:700;color:' + rc + '">' + b.rating + '</div>' +
          '</div>' +
        '</div>' +

        // Tab bar
        '<div style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;scrollbar-width:none">' +
          '<button class="mh-beach-tab active" onclick="menuHomeBeachTab(this,\'conditions\')" data-tab="conditions">🌊 Conditions</button>' +
          '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'getting-there\')" data-tab="getting-there">🚗 Getting There</button>' +
          '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'trails\')" data-tab="trails">🥾 Trails</button>' +
          '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'rentals\')" data-tab="rentals">🏄 Rentals</button>' +
          '<button class="mh-beach-tab" onclick="menuHomeBeachTab(this,\'eat\')" data-tab="eat">🍽 Eat</button>' +
        '</div>' +
      '</div>' +

      // Scrollable content
      '<div id="mh-bd-content" style="flex:1;overflow-y:auto;padding:16px 20px 48px">' +

        // CONDITIONS TAB
        '<div id="mh-bd-conditions" class="mh-bd-tab">' +
          '<div class="mh-cond-grid">' +
            '<div class="mh-cond-card"><div class="mh-cond-val">' + b.surf + '</div><div class="mh-cond-lbl">Surf</div></div>' +
            '<div class="mh-cond-card"><div class="mh-cond-val">' + b.water + '</div><div class="mh-cond-lbl">Water</div></div>' +
            '<div class="mh-cond-card"><div class="mh-cond-val">UV ' + b.uv + '</div><div class="mh-cond-lbl">Index</div></div>' +
            '<div class="mh-cond-card"><div class="mh-cond-val">' + b.tide + '</div><div class="mh-cond-lbl">Tide</div></div>' +
            '<div class="mh-cond-card"><div class="mh-cond-val">' + b.sunrise + '</div><div class="mh-cond-lbl">Sunrise</div></div>' +
            '<div class="mh-cond-card"><div class="mh-cond-val">' + b.sunset + '</div><div class="mh-cond-lbl">Sunset</div></div>' +
          '</div>' +
          '<div class="mh-info-row"><span>Wind</span><span style="color:rgba(255,255,255,0.6)">' + b.wind + '</span></div>' +
          '<div class="mh-info-row"><span style="color:#ffd700">⚠️ Rip current risk</span><span style="color:#ffd700">Low</span></div>' +
          '<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">' +
            '<a href="https://www.surfline.com/surf-reports-forecasts-cams/united-states/california/san-luis-obispo-county/5392329" target="_blank" style="display:block;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Surfline Full Forecast ↗</a>' +
            '<a href="https://www.805webcams.com" target="_blank" style="display:block;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);text-decoration:none;font-size:13px;font-weight:700;text-align:center">805 Live Beach Cams ↗</a>' +
          '</div>' +
        '</div>' +

        // GETTING THERE TAB
        '<div id="mh-bd-getting-there" class="mh-bd-tab" style="display:none">' +
          '<div class="mh-beach-sec-title">PARKING</div>' +
          b.parking.map(function(p) {
            var sc = p.status === 'Open' ? '#22c55e' : p.status === 'Busy' ? '#f59e0b' : '#ef4444';
            return '<div class="mh-info-row"><div><div style="font-size:13px;font-weight:700">' + p.name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + p.cost + '</div></div><span style="color:' + sc + ';font-size:12px;font-weight:700">' + p.status + '</span></div>';
          }).join('') +
          '<div style="margin-top:16px"><div class="mh-beach-sec-title">TRANSIT</div>' +
          '<div class="mh-info-row"><span>Bus route</span><span style="color:rgba(255,255,255,0.6);font-size:12px">' + b.bus.route + '</span></div>' +
          (b.bus.fare > 0 ? '<div class="mh-info-row"><span>Fare</span><span style="color:#22c55e">$' + b.bus.fare.toFixed(2) + '/person</span></div>' : '') +
          (b.bus.freq !== 'None' ? '<div class="mh-info-row"><span>Frequency</span><span style="color:rgba(255,255,255,0.5)">' + b.bus.freq + '</span></div>' : '<div class="mh-info-row"><span style="color:rgba(255,255,255,0.4)">No bus service — drive or rideshare</span></div>') +
          '</div>' +
          // Trip cost calculator
          '<div class="mh-cost-calc" style="margin-top:16px">' +
            '<div class="mh-beach-sec-title" style="color:rgba(255,215,0,0.7)">💰 TRIP COST CALCULATOR</div>' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
              '<span style="font-size:13px;color:rgba(255,255,255,0.6)">Group size</span>' +
              '<input type="range" id="bh-group-' + b.id + '" min="1" max="8" value="2" style="flex:1;accent-color:#06b6d4" oninput="menuHomeCalcTrip(\'' + b.id + '\',this.value)">' +
              '<span id="bh-gval-' + b.id + '" style="font-size:16px;font-weight:900;color:#06b6d4;min-width:20px">2</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="bh-costs-' + b.id + '">' +
              buildCostCards(b, 2) +
            '</div>' +
          '</div>' +
          '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(b.name + ' CA') + '" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);color:#06b6d4;text-decoration:none;font-size:13px;font-weight:800;text-align:center;margin-top:12px">Get Directions ↗</a>' +
        '</div>' +

        // TRAILS TAB
        '<div id="mh-bd-trails" class="mh-bd-tab" style="display:none">' +
          b.trails.map(function(t) {
            return '<div class="mh-trail-card">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
                '<div style="font-size:13px;font-weight:800">' + t.name + '</div>' +
                '<div style="font-size:10px;font-weight:700;color:' + (t.diff==='Easy'?'#22c55e':t.diff==='Moderate'?'#f59e0b':'#ef4444') + '">' + t.diff + '</div>' +
              '</div>' +
              '<div style="display:flex;gap:12px;font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:6px">' +
                '<span>📏 ' + t.dist + '</span>' +
                '<span>' + (t.dogs ? '🐕 Dogs OK' : '🚫 No dogs') + '</span>' +
              '</div>' +
              '<div style="font-size:12px;color:rgba(255,255,255,0.55)">' + t.notes + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        // RENTALS TAB
        '<div id="mh-bd-rentals" class="mh-bd-tab" style="display:none">' +
          b.rentals.map(function(r) {
            if (!r.price) return '<div class="mh-rental-card"><div style="font-size:12px;color:rgba(255,255,255,0.4)">' + r.name + '</div></div>';
            return '<div class="mh-rental-card">' +
              '<div><div style="font-size:13px;font-weight:800">' + r.name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + r.type + '</div></div>' +
              '<div style="text-align:right">' +
                '<div style="font-size:13px;font-weight:800;color:#22c55e">' + r.price + '</div>' +
                (r.link ? '<a href="' + r.link + '" target="_blank" style="font-size:10px;color:#06b6d4;text-decoration:none">Book ↗</a>' : '') +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +

        // EAT TAB
        '<div id="mh-bd-eat" class="mh-bd-tab" style="display:none">' +
          b.eat.map(function(e) {
            if (!e.price) return '<div class="mh-eat-row"><span style="color:rgba(255,255,255,0.4)">' + e.name + '</span></div>';
            return '<div class="mh-eat-row">' +
              '<div><div style="font-size:13px;font-weight:800">' + e.name + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + e.vibe + '</div></div>' +
              '<span style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.5)">' + e.price + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +

      '</div>';

    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() { sheet.style.opacity = '1'; }, 30);
  }

  function buildCostCards(b, group) {
    var miles = b.miles;
    var busFare = b.bus.fare > 0 ? (b.bus.fare * group).toFixed(2) : null;
    var uberEst = (miles * 1.5 * group * 0.3 + 8).toFixed(0);
    var lyftEst = (miles * 1.4 * group * 0.3 + 7).toFixed(0);
    var driveEst = (miles * 2 * 0.18).toFixed(2);
    return [
      '<div class="mh-cond-card"><div class="mh-cond-val">$' + (busFare || '—') + '</div><div class="mh-cond-lbl">Bus (' + group + 'ppl)</div></div>',
      '<div class="mh-cond-card"><div class="mh-cond-val">~$' + uberEst + '</div><div class="mh-cond-lbl">Uber (est)</div></div>',
      '<div class="mh-cond-card"><div class="mh-cond-val">~$' + lyftEst + '</div><div class="mh-cond-lbl">Lyft (est)</div></div>',
      '<div class="mh-cond-card"><div class="mh-cond-val">$' + driveEst + '</div><div class="mh-cond-lbl">Gas (est)</div></div>',
    ].join('');
  }

  function calcTrip(beachId, group) {
    var beach = null;
    for (var i = 0; i < BEACHES.length; i++) { if (BEACHES[i].id === beachId) { beach = BEACHES[i]; break; } }
    if (!beach) return;
    var n = parseInt(group);
    document.getElementById('bh-gval-' + beachId).textContent = n;
    var el = document.getElementById('bh-costs-' + beachId);
    if (el) el.innerHTML = buildCostCards(beach, n);
  }
  window.menuHomeCalcTrip = calcTrip;

  function beachTab(el, id) {
    document.querySelectorAll('.mh-beach-tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    document.querySelectorAll('.mh-bd-tab').forEach(function(p) { p.style.display = 'none'; });
    var panel = document.getElementById('mh-bd-' + id);
    if (panel) panel.style.display = 'block';
  }
  window.menuHomeBeachTab = beachTab;

  function closeBeachDetail() {
    var s = document.getElementById('mh-beach-detail');
    if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); openBeachHub(); }, 400); }
  }
  window.menuHomeCloseBeachDetail = closeBeachDetail;

  // ── TRAVEL DRAWER ──

  // Tab switcher
  function travelTab(el, id) {
    document.querySelectorAll('.mh-travel-tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    var sections = ['tours','food','hotels','beaches'];
    sections.forEach(function(s) {
      var sec = document.getElementById('mh-tsec-' + s);
      if (sec) sec.style.display = (id === 'all' || id === s) ? 'block' : 'none';
    });
  }
  window.menuHomeTravelTab = travelTab;

  // Load venues from Supabase when travel drawer opens
  var travelVenuesLoaded = false;
  function loadTravelVenues() {
    if (travelVenuesLoaded) return;
    travelVenuesLoaded = true;
    loadRestaurants();
    loadHotels();
  }
  window.menuHomeTravelLoadVenues = loadTravelVenues;

  async function loadRestaurants() {
    var list = document.getElementById('mh-restaurant-list');
    if (!list) return;
    try {
      var sb = window.supabaseClient;
      if (!sb) { list.innerHTML = renderFallbackRestaurants(); return; }
      var result = await sb.from('venues')
        .select('name,category,price_range,rating,description,tags')
        .eq('type','restaurant')
        .order('rating', { ascending: false })
        .limit(6);
      if (result.error || !result.data || !result.data.length) {
        list.innerHTML = renderFallbackRestaurants(); return;
      }
      list.innerHTML = result.data.map(function(v) {
        var price = '$'.repeat(v.price_range || 2);
        var stars = v.rating ? v.rating.toFixed(1) + '⭐' : '';
        var emoji = getCategoryEmoji(v.category);
        return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
          '<span class="mh-venue-emoji">' + emoji + '</span>' +
          '<div class="mh-venue-info">' +
            '<div class="mh-venue-name">' + v.name + '</div>' +
            '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + price + (stars ? ' · ' + stars : '') + '</div>' +
          '</div>' +
          '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
        '</div>';
      }).join('');
    } catch(e) {
      list.innerHTML = renderFallbackRestaurants();
    }
  }

  function renderFallbackRestaurants() {
    var items = [
      {name:'Novo Restaurant',category:'world fusion',price:3,rating:4.5,emoji:'🌊'},
      {name:"Giuseppe's Cucina",category:'italian',price:3,rating:4.4,emoji:'🍕'},
      {name:'Firestone Grill',category:'american',price:1,rating:4.3,emoji:'🥩'},
      {name:'Luna Red',category:'tapas',price:2,rating:4.2,emoji:'🌮'},
      {name:"Nate's on Marsh",category:'upscale',price:4,rating:4.7,emoji:'⭐'},
      {name:'Bear & The Wren',category:'pizza',price:2,rating:4.5,emoji:'🍕'},
    ];
    return items.map(function(v) {
      return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
        '<span class="mh-venue-emoji">' + v.emoji + '</span>' +
        '<div class="mh-venue-info">' +
          '<div class="mh-venue-name">' + v.name + '</div>' +
          '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + '$'.repeat(v.price) + ' · ' + v.rating + '⭐</div>' +
        '</div>' +
        '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
      '</div>';
    }).join('');
  }

  async function loadHotels() {
    var list = document.getElementById('mh-hotel-list');
    if (!list) return;
    try {
      var sb = window.supabaseClient;
      if (!sb) { list.innerHTML = renderFallbackHotels(); return; }
      var result = await sb.from('venues')
        .select('name,category,price_range,rating,description,tags')
        .eq('type','hotel')
        .order('rating', { ascending: false })
        .limit(5);
      if (result.error || !result.data || !result.data.length) {
        list.innerHTML = renderFallbackHotels(); return;
      }
      list.innerHTML = result.data.map(function(v) {
        var price = '$'.repeat(v.price_range || 3);
        var stars = v.rating ? v.rating.toFixed(1) + '⭐' : '';
        var emoji = getHotelEmoji(v.category);
        return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
          '<span class="mh-venue-emoji">' + emoji + '</span>' +
          '<div class="mh-venue-info">' +
            '<div class="mh-venue-name">' + v.name + '</div>' +
            '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + price + (stars ? ' · ' + stars : '') + '</div>' +
          '</div>' +
          '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
        '</div>';
      }).join('');
    } catch(e) {
      list.innerHTML = renderFallbackHotels();
    }
  }

  function renderFallbackHotels() {
    var items = [
      {name:'Hotel SLO',category:'luxury',price:4,rating:4.7,emoji:'✨'},
      {name:'Hotel Cerro',category:'boutique',price:4,rating:4.6,emoji:'🌿'},
      {name:'Granada Hotel',category:'historic',price:3,rating:4.5,emoji:'🏛'},
      {name:'SLO Creek Lodge',category:'boutique',price:3,rating:4.6,emoji:'🌲'},
      {name:'The Wayfarer',category:'boutique',price:3,rating:4.3,emoji:'🏡'},
    ];
    return items.map(function(v) {
      return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
        '<span class="mh-venue-emoji">' + v.emoji + '</span>' +
        '<div class="mh-venue-info">' +
          '<div class="mh-venue-name">' + v.name + '</div>' +
          '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + '$'.repeat(v.price) + ' · ' + v.rating + '⭐</div>' +
        '</div>' +
        '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
      '</div>';
    }).join('');
  }

  function getCategoryEmoji(cat) {
    var map = {
      'world fusion':'🌊','italian':'🍕','american':'🥩','tapas':'🌮',
      'upscale':'⭐','pizza':'🍕','bbq':'🔥','japanese':'🍱','sushi':'🍣',
      'mexican':'🌮','cafe':'☕','greek':'🥙','deli':'🥪','peruvian':'🌶',
      'steakhouse':'🥩','french':'🥐','seafood':'🐟'
    };
    return map[cat] || '🍽';
  }

  function getHotelEmoji(cat) {
    var map = {
      'luxury':'✨','boutique':'🌿','historic':'🏛','inn':'🏡',
      'bed-and-breakfast':'🌅','chain':'🏨','iconic':'🌟'
    };
    return map[cat] || '🏨';
  }

  function cap(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Tour detail sheet
  var TOUR_DATA = {
    historic: { name:'Historic Downtown SLO', emoji:'🏛', time:'90 min', diff:'Easy', cost:'Free', desc:'Walk 2,500 years of history from the 1772 Mission to Bubblegum Alley. Passes Chinatown, Fremont Theater, and Mission Plaza.', tips:['Best in morning before crowds','Free parking on side streets','Thursday adds Farmers Market'], tags:['Family','Dogs OK','Free','Walking'] },
    bishop:   { name:'Bishop Peak Summit', emoji:'🥾', time:'2.5-3 hrs', diff:'Hard', cost:'Free', desc:'The tallest of the Nine Sisters volcanic morros. 3.5 miles round trip, 950ft elevation gain. 360° views from the top.', tips:['Start early — gets hot','Bring 2L water minimum','Dogs must be leashed'], tags:['Dogs OK','Views','Workout','Free'] },
    food:     { name:'SLO Food Tour', emoji:'🍕', time:'3 hrs', diff:'Easy', cost:'$40-100', desc:'Hit the iconic spots — Firestone tri-tip, Novo creekside, High Street Deli half-off after 4:20pm. SLO has a serious food scene.', tips:['Thursday nights add Farmers Market stops','High Street Deli half off after 4:20pm','Book Novo in advance'], tags:['Family','Popular','Downtown'] },
    farmers:  { name:'Farmers Market', emoji:'🌽', time:'2 hrs', diff:'Easy', cost:'Free', desc:"Every Thursday 6-9pm Higuera Street becomes one of California's most beloved weekly street fairs. Fresh produce, live music, local food.", tips:['Thursday only, year-round','Gets crowded 7-8pm','Bring cash for vendors'], tags:['Weekly','Family','Thursday'] },
    bike:     { name:'Downtown Bike Loop', emoji:'🚴', time:'90 min', diff:'Easy', cost:'$15-30', desc:'Rent a bike and cruise the Bob Jones Trail, downtown Higuera, and along the creek. Mostly flat, beginner friendly.', tips:['Rent from SLO Bike Hub','Bob Jones Trail is paved','Creek path connects downtown to Avila'], tags:['Rental','Trail','Family'] },
    wine:     { name:'Edna Valley Wine Trail', emoji:'🍷', time:'4 hrs', diff:'Easy', cost:'$30-100', desc:"World-class Chardonnay and Pinot 10 minutes from downtown. Edna Valley is one of California's coolest growing regions.", tips:['Book a driver or use Uber','Tolosa and Laetitia are standouts','Most tasting rooms open 11am-5pm'], tags:['21+','Romantic','Drive'] },
    beach:    { name:'Central Coast Beach Day', emoji:'🌊', time:'All day', diff:'Easy', cost:'$0-50', desc:'Avila for calm water and families, Pismo for the classic boardwalk vibe, Shell Beach for dramatic cliffs and surf.', tips:['Avila has the calmest water','Pismo Pier area has parking','Bring layers — coast can be foggy'], tags:['Family','Dogs OK','Summer'] },
    morro:    { name:'Morro Bay Escape', emoji:'🦦', time:'Half day', diff:'Easy', cost:'$20-80', desc:'Sea otters, Morro Rock, fresh chowder on the Embarcadero. 30 minutes north. One of the most scenic towns on the Central Coast.', tips:['Kayak around Morro Rock','Sub-Sub is a local sandwich legend','Watch for otters near the estuary'], tags:['Wildlife','Seafood','Drive'] },
    brewery:  { name:'SLO Brewery Hop', emoji:'🍺', time:'3 hrs', diff:'Easy', cost:'$20-60', desc:"SLO Brew, Libertine Brewing, Barrelhouse — SLO has a thriving craft beer scene. All walkable from downtown.", tips:['Start at Libertine for sours','SLO Brew has live music','Barrelhouse has the best patio'], tags:['21+','Local','Walking'] },
  };

  function tourDetail(el) {
    var id = el ? el.dataset.tour : null;
    var tour = TOUR_DATA[id];
    if (!tour) return;

    var existing = document.getElementById('mh-tour-detail');
    if (existing) existing.remove();

    var sheet = document.createElement('div');
    sheet.id = 'mh-tour-detail';
    sheet.style.cssText = 'position:absolute;inset:0;z-index:23;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
    sheet.innerHTML = '<div id="mh-td-inner" style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="closeTourDetail()"></div>' +
      '<div style="font-size:36px;margin-bottom:8px">' + tour.emoji + '</div>' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + tour.name + '</div>' +
      '<div style="display:flex;gap:12px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.5)">' +
        '<span>⏱ ' + tour.time + '</span>' +
        '<span>💪 ' + tour.diff + '</span>' +
        '<span>💰 ' + tour.cost + '</span>' +
      '</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:16px">' + tour.desc + '</div>' +
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">INSIDER TIPS</div>' +
      tour.tips.map(function(t) {
        return '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:rgba(255,255,255,0.6)">💡 ' + t + '</div>';
      }).join('') +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">' +
        tour.tags.map(function(t) {
          return '<span style="padding:4px 10px;border-radius:20px;background:rgba(255,255,255,0.06);font-size:11px;font-weight:700;color:rgba(255,255,255,0.5)">' + t + '</span>';
        }).join('') +
      '</div>' +
      '<button onclick="closeTourDetail()" style="width:100%;margin-top:16px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
    '</div>';

    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() {
      sheet.style.opacity = '1';
      document.getElementById('mh-td-inner').style.transform = 'translateY(0)';
    }, 30);
    sheet.addEventListener('click', function(e) { if (e.target === sheet) closeTourDetail(); });
  }
  window.menuHomeTourDetail = tourDetail;
  window.menuHomeCloseViewAll  = function() { var s = document.getElementById('mh-viewall-sheet'); if(s) s.remove(); };
  window.menuHomeCloseBeachSheet = function() { var s = document.getElementById('mh-beach-sheet'); if(s) s.remove(); };
  window.menuHomeClosePlanIt   = function() { var s = document.getElementById('mh-planit-sheet'); if(s) s.remove(); };



  function closeTourDetail() {
    var sheet = document.getElementById('mh-tour-detail');
    if (sheet) { sheet.style.opacity = '0'; setTimeout(function() { sheet.remove(); }, 300); }
  }
  window.menuHomeCloseTourDetail = closeTourDetail;

  // Venue detail sheet
  function venueDetail(el) {
    var name = el ? el.dataset.name : null;
    if (!name) return;
    var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(name + ' San Luis Obispo');
    window.open(searchUrl, '_blank');
  }
  window.menuHomeTravelVenueDetail = venueDetail;

  // View all sheet
  function travelViewAll(type) {
    var sheet = document.createElement('div');
    sheet.id = 'mh-viewall-sheet';
    sheet.style.cssText = 'position:absolute;inset:0;z-index:23;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
    var title = type === 'food' ? '🍽 All Restaurants' : '🏨 All Hotels';
    sheet.innerHTML = '<div style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)" id="mh-va-inner">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="menuHomeCloseViewAll()"></div>' +
      '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;margin-bottom:16px">' + title + '</div>' +
      '<div id="mh-va-list"><div style="padding:20px;text-align:center;color:rgba(255,255,255,0.3)">Loading...</div></div>' +
    '</div>';
    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() {
      sheet.style.opacity = '1';
      document.getElementById('mh-va-inner').style.transform = 'translateY(0)';
      loadAllVenues(type);
    }, 30);
    sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  }
  window.menuHomeTravelViewAll = function(type) {
    if (type === 'food') { openRestaurantHub(); return; }
    travelViewAll(type);
  };
  var _travelViewAll = travelViewAll;

  async function loadAllVenues(type) {
    var list = document.getElementById('mh-va-list');
    if (!list) return;
    try {
      var sb = window.supabaseClient;
      if (!sb) { list.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Connect to load venues</div>'; return; }
      var vtype = type === 'food' ? 'restaurant' : 'hotel';
      var result = await sb.from('venues')
        .select('name,category,price_range,rating,address,description')
        .eq('type', vtype)
        .order('rating', { ascending: false });
      if (result.error || !result.data) { list.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Error loading venues</div>'; return; }
      var getEmoji = type === 'food' ? getCategoryEmoji : getHotelEmoji;
      list.innerHTML = result.data.map(function(v) {
        var price = '$'.repeat(v.price_range || 2);
        var stars = v.rating ? v.rating.toFixed(1) + '⭐' : '';
        return '<div class="mh-venue-row" onclick="menuHomeTravelVenueDetail(this)" data-name="' + v.name + '">' +
          '<span class="mh-venue-emoji">' + getEmoji(v.category) + '</span>' +
          '<div class="mh-venue-info">' +
            '<div class="mh-venue-name">' + v.name + '</div>' +
            '<div class="mh-venue-sub">' + cap(v.category) + ' · ' + price + (stars ? ' · ' + stars : '') + '</div>' +
          '</div>' +
          '<span style="color:rgba(255,255,255,0.3);font-size:16px">›</span>' +
        '</div>';
      }).join('');
    } catch(e) {
      list.innerHTML = '<div style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">Error: ' + e.message + '</div>';
    }
  }

  // Beach detail
  var BEACH_DATA = {
    avila:   { name:'Avila Beach', emoji:'🏖', drive:'10 min', vibe:'Calm, protected, family-friendly', surf:'1-2ft', notes:'Pier fishing, Avila Village shops nearby. Warmest water on the coast.', maps:'Avila+Beach+CA' },
    pismo:   { name:'Pismo Beach', emoji:'🌊', drive:'15 min', vibe:'Classic boardwalk, active beach', surf:'2-3ft', notes:'Pismo Pier, beach bonfires with permit, clam chowder at Old West Cinnamon Rolls.', maps:'Pismo+Beach+CA' },
    shell:   { name:'Shell Beach', emoji:'🪨', drive:'12 min', vibe:'Dramatic cliffs, local favorite', surf:'2-4ft', notes:'Rocky coves good for snorkeling. Pelican Point has great cliff walks.', maps:'Shell+Beach+CA' },
    morro:   { name:'Morro Bay Beach', emoji:'🦦', drive:'30 min', vibe:'Wild, scenic, wildlife-rich', surf:'3-4ft', notes:'Sea otters in the estuary. Morro Rock is a 23 million year old volcanic plug.', maps:'Morro+Bay+Beach+CA' },
    montano: { name:'Montana de Oro', emoji:'🌿', drive:'45 min', vibe:'Wild coastal park, rugged', surf:'4-6ft', notes:'Hazard Canyon has tide pools. Bluff Trail is 3 miles of dramatic clifftop walking.', maps:'Montana+de+Oro+State+Park' },
  };

  function travelBeach(id) {
    var b = BEACH_DATA[id];
    if (!b) return;
    var sheet = document.createElement('div');
    sheet.id = 'mh-beach-sheet';
    sheet.style.cssText = 'position:absolute;inset:0;z-index:23;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
    sheet.innerHTML = '<div style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding:12px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)" id="mh-beach-inner">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="menuHomeCloseBeachSheet()"></div>' +
      '<div style="font-size:36px;margin-bottom:8px">' + b.emoji + '</div>' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + b.name + '</div>' +
      '<div style="display:flex;gap:12px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.5)">' +
        '<span>🚗 ' + b.drive + '</span>' +
        '<span>🌊 ' + b.surf + ' surf</span>' +
      '</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:12px">' + b.vibe + '</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:16px">' + b.notes + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<a href="https://www.google.com/maps/search/' + b.maps + '" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Get Directions ↗</a>' +
        '<a href="https://www.surfline.com" target="_blank" style="display:block;padding:13px;border-radius:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;font-weight:700;text-align:center">Live Surf Report ↗</a>' +
      '</div>' +
      '<button onclick="menuHomeCloseBeachSheet()" style="width:100%;margin-top:12px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Close</button>' +
    '</div>';
    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() {
      sheet.style.opacity = '1';
      document.getElementById('mh-beach-inner').style.transform = 'translateY(0)';
    }, 30);
    sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  }
  window.menuHomeTravelBeach = travelBeach;

  // Plan It placeholder
  function openTravelPlanIt() {
    var sheet = document.createElement('div');
    sheet.id = 'mh-planit-sheet';
    sheet.style.cssText = 'position:absolute;inset:0;z-index:23;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';
    sheet.innerHTML = '<div style="width:100%;background:rgba(8,8,20,0.98);border-radius:24px 24px 0 0;border-top:1px solid rgba(255,215,0,0.2);padding:20px 20px 48px;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)" id="mh-pi-inner">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 20px;cursor:pointer" onclick="menuHomeClosePlanIt()"></div>' +
      '<div style="font-size:28px;margin-bottom:8px">✨</div>' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">Plan It</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;line-height:1.5">Tell us about your group and what you are looking for — we will build a personalized outing plan.</div>' +
      '<div style="padding:16px;background:rgba(255,215,0,0.05);border:1px solid rgba(255,215,0,0.15);border-radius:14px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:16px">' +
        '🚧 Claude AI-powered planning coming next build. Will ask about group size, budget, vibe, time of day and generate a custom itinerary.' +
      '</div>' +
      '<button onclick="menuHomeClosePlanIt()" style="width:100%;padding:13px;border-radius:14px;border:none;background:rgba(255,215,0,0.1);color:rgba(255,215,0,0.7);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">Got it</button>' +
    '</div>';
    document.getElementById('menu-home').appendChild(sheet);
    setTimeout(function() {
      sheet.style.opacity = '1';
      document.getElementById('mh-pi-inner').style.transform = 'translateY(0)';
    }, 30);
    sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  }
  window.menuHomeOpenTravelPlanIt = openTravelPlanIt;

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

  // ── MAP ──
  function loadHomeMap() {
    if (!window.maplibregl) return;
    var container = document.getElementById('mh-map');
    if (!container) return;

    homeMap = new maplibregl.Map({
      container:        'mh-map',
      style:            'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=' + MAPTILER_KEY,
      center:           [-120.6650, 35.2803],
      zoom:             15,
      pitch:            62,
      bearing:          -25,
      antialias:        true,
      attributionControl: false,
      // Enable user interaction
      scrollZoom:       true,
      boxZoom:          true,
      dragRotate:       true,
      dragPan:          true,
      touchZoomRotate:  true,
      touchPitch:       true,
      doubleClickZoom:  true,
    });

    // Add navigation control
    homeMap.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'top-right');

    homeMap.on('load', function() {
      // Find first symbol layer for building insertion
      var style  = homeMap.getStyle();
      var layers = style && style.layers ? style.layers : [];
      var labelLayer = null;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') { labelLayer = layers[i].id; break; }
      }

      // Check available sources for buildings
      var sources = style.sources || {};
      var buildingSource = null;
      var buildingLayer  = 'building';
      if (sources['openmaptiles'])  buildingSource = 'openmaptiles';
      else if (sources['maptiler_planet']) { buildingSource = 'maptiler_planet'; }
      else {
        // Find any source with building layer
        Object.keys(sources).forEach(function(src) { if (!buildingSource) buildingSource = src; });
      }

      // Add 3D buildings
      if (buildingSource) {
        try {
          homeMap.addLayer({
            id: 'mh-3d-buildings',
            source: buildingSource,
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': [
                'interpolate', ['linear'], ['get', 'render_height'],
                0, '#111827', 15, '#1a2a45', 40, '#1e3060', 80, '#243570'
              ],
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                13, 0, 14.5, ['get', 'render_height']
              ],
              'fill-extrusion-base':    ['get', 'render_min_height'],
              'fill-extrusion-opacity': 0.85
            }
          }, labelLayer || undefined);
        } catch(e) { console.warn('[3D buildings]', e); }
      }

      // Hub markers
      try { addHubMarkers(); } catch(e) {}

      // Slow auto-rotation (stops when user interacts)
      var bearing = -25;
      var rotating = true;
      homeMap.on('mousedown', function() { rotating = false; });
      homeMap.on('touchstart', function() { rotating = false; });
      var rot = function() {
        if (!rotating || !homeMap) return;
        bearing += 0.015;
        try { homeMap.setBearing(bearing); } catch(e) { return; }
        requestAnimationFrame(rot);
      };
      setTimeout(rot, 800);

      // Fade map in
      var overlay = document.getElementById('mh-map-overlay');
      if (overlay) overlay.style.opacity = '0';
    });

    homeMap.on('error', function(e) { console.warn('[Map error]', e); });
  }

  function addHubMarkers() {
    var hubs = [
      { coords: [-120.6650, 35.2803], icon: '🌃', label: 'DTSLO',        sub: 'Nightlife',   color: 'linear-gradient(135deg,#ff2d78,#b44fff)', active: true,  onclick: 'menuHomeEnterDTSLO()' },
      { coords: [-120.6750, 35.2680], icon: '🏖',  label: 'Beach Hub',    sub: 'Coming Soon', color: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', active: false },
      { coords: [-120.6655, 35.2808], icon: '🍽',  label: 'Restaurants',  sub: 'Browse & dine', color: 'linear-gradient(135deg,#ff2d78,#ef4444)', active: true, action: 'restaurant' },
      { coords: [-120.6540, 35.2980], icon: '🎓', label: 'Cal Poly',      sub: 'Coming Soon', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', active: false },
      { coords: [-120.6590, 35.2840], icon: '🏛',  label: 'City Hub',     sub: 'Coming Soon', color: 'linear-gradient(135deg,#00f5ff,#00ff88)', active: false },
    ];

    hubs.forEach(function(hub) {
      var el = document.createElement('div');
      el.className = 'mh-hub-marker';
      el.innerHTML = [
        '<div class="mh-hub-pin' + (hub.active ? ' mh-hub-active' : ' mh-hub-dim') + '"',
          hub.active ? ' onclick="' + hub.onclick + '"' : '',
          '>',
          '<div class="mh-hub-dot" style="background:' + hub.color + '">',
            '<span class="mh-hub-icon">' + hub.icon + '</span>',
          '</div>',
          '<div class="mh-hub-label">' + hub.label + '</div>',
          hub.active ? '<div class="mh-hub-enter">Tap to Enter →</div>' : '<div class="mh-hub-sub">' + hub.sub + '</div>',
        '</div>'
      ].join('');
      new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(hub.coords).addTo(homeMap);
    });
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
          '<div class="mh-hub-card mh-hub-card-active" onclick="menuHomeEnterDTSLO()">',
            '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#ff2d78,#b44fff)">🌃</div>',
            '<div class="mh-hub-card-info"><div class="mh-hub-card-name">DTSLO</div><div class="mh-hub-card-sub">Nightlife · Active Now</div></div>',
            '<div class="mh-hub-card-arrow" style="color:#ffd700">→</div>',
          '</div>',
          '<div class="mh-hub-card mh-hub-card-soon" onclick="menuHomeHubPreview(this.dataset.hub)" data-hub="beach">',
            '<div class="mh-hub-card-icon" style="background:linear-gradient(135deg,#06b6d4,#0ea5e9)">🏖</div>',
            '<div class="mh-hub-card-info"><div class="mh-hub-card-name">Beach Hub</div><div class="mh-hub-card-sub">Surf · Beaches · Coastal</div></div>',
            '<div class="mh-hub-card-arrow" style="color:rgba(255,255,255,0.2)">›</div>',
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
        '<div class="mh-tools-grid">',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="rides"><div class="mh-tool-icon">🚗</div><div>Rides</div></button>',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="surf"><div class="mh-tool-icon">🏄</div><div>Surf</div></button>',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="weather"><div class="mh-tool-icon">🌤</div><div>Weather</div></button>',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="atms"><div class="mh-tool-icon">🏧</div><div>ATMs</div></button>',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="parking"><div class="mh-tool-icon">🅿️</div><div>Parking</div></button>',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="traffic"><div class="mh-tool-icon">📡</div><div>Traffic</div></button>',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="transit"><div class="mh-tool-icon">🚌</div><div>Transit</div></button>',
          '<button class="mh-tool-btn" onclick="menuHomeOpenTool(this.dataset.tool)" data-tool="gas"><div class="mh-tool-icon">⛽</div><div>Gas</div></button>',
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
        '<button class="mh-tab" id="mh-tab-travel" onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="travel">',
          '<span class="mh-tab-icon">🗺</span>',
          '<span class="mh-tab-label">Travel</span>',
        '</button>',
        '<button class="mh-tab" id="mh-tab-tools"  onclick="menuHomeOpenDrawer(this.dataset.id)" data-id="tools">',
          '<span class="mh-tab-icon">⚡</span>',
          '<span class="mh-tab-label">Tools</span>',
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

})();
