// ══════════════════════════════════════════════
// HOTELS_HUB.JS — Hotels & Stays
// 25 curated SLO-only accommodations
// ══════════════════════════════════════════════

var HOTEL_CATS = [
  { id:'all',      label:'All',         emoji:'🏨' },
  { id:'boutique', label:'Boutique',    emoji:'✨' },
  { id:'midrange', label:'Mid-Range',   emoji:'👍' },
  { id:'budget',   label:'Budget',      emoji:'💰' },
  { id:'camping',  label:'Camp & Glamp',emoji:'⛺' },
];

var HOTELS = [
  {
    name:'Hotel SLO',
    category:'boutique',
    emoji:'🏙',
    price:'$$$',
    location:'Downtown SLO — 210 Marsh St',
    summary:'The premier downtown hotel with a rooftop bar, farm-to-table restaurant, and rooms designed around Central Coast living. The Ox and Anchor rooftop has the best elevated view of the city.',
    highlights:['Rooftop bar with panoramic downtown views','Ox and Anchor restaurant — farm to table California cuisine','Walking distance to everything downtown','Valet parking available','Spa and fitness center on site'],
    book_url:'https://www.hotelsloca.com',
  },
  {
    name:'Madonna Inn',
    category:'boutique',
    emoji:'🌸',
    price:'$$-$$$',
    location:'South SLO — 100 Madonna Rd',
    summary:'One of the most eccentric and beloved hotels in California. Every one of its 110 rooms has a completely unique theme — from cave rooms to pink fantasy suites. A SLO institution since 1958.',
    highlights:['Every room is completely unique — browse online before booking','The Gold Rush Steakhouse is a SLO institution','Famous pink champagne cake in the bakery','The waterfall shower in the Rock Room is legendary','Beautiful grounds with gardens and creek'],
    book_url:'https://www.madonnainn.com',
  },
  {
    name:'Granada Hotel and Bistro',
    category:'boutique',
    emoji:'🎭',
    price:'$$$',
    location:'Downtown SLO — 1126 Monterey St',
    summary:'A 1920s historic building restored into a sophisticated boutique hotel steps from Higuera St. The bistro downstairs is one of the best breakfast spots in the city.',
    highlights:['Historic 1920s building with original architectural details','Bistro downstairs serves excellent breakfast and lunch','Rooftop terrace with Mission views','Prime downtown location — walk to everything','Intimate and personal service'],
    book_url:'https://granadahotelandbistro.com',
  },
  {
    name:'Petit Soleil Bed and Breakfast',
    category:'boutique',
    emoji:'🇫🇷',
    price:'$$-$$$',
    location:'Downtown SLO — 1473 Monterey St',
    summary:'A French-country inspired B&B with 16 uniquely decorated rooms and a legendary breakfast. The most personal and intimate stay in downtown SLO.',
    highlights:['Full gourmet breakfast included every morning','Each room has a unique French country design','Walking distance to all of downtown','Hosts know SLO deeply — ask for recommendations','Evening wine and cheese hour'],
    book_url:'https://petitsoleilslo.com',
  },
  {
    name:'Apple Farm Inn',
    category:'boutique',
    emoji:'🍎',
    price:'$$-$$$',
    location:'SLO — 2015 Monterey St',
    summary:'A charming country inn built around an apple orchard theme with a working grist mill, cozy fireplaces, and a beloved restaurant. A perennial SLO favorite.',
    highlights:['Working grist mill and apple orchard on property','Fireplaces and cozy country decor in many rooms','Apple Farm Restaurant — a SLO institution','Afternoon tea served daily','Beautiful gardens and creek-side setting'],
    book_url:'https://www.applefarm.com',
  },
  {
    name:'Inn at the Cove',
    category:'boutique',
    emoji:'🌿',
    price:'$$',
    location:'SLO — 1252 Peach St',
    summary:'A peaceful garden inn close to downtown with beautifully landscaped grounds, a pool, and genuinely welcoming service. A well-kept SLO secret.',
    highlights:['Beautiful garden setting with pool','Quiet residential location near downtown','Full breakfast included','Genuinely personal service','Free parking'],
    book_url:'https://www.innatcoveslo.com',
  },
  {
    name:'Kinney SLO',
    category:'midrange',
    emoji:'🎨',
    price:'$$',
    location:'South SLO — 1800 Monterey St',
    summary:'A playful, art-forward hotel with a mid-century California aesthetic, heated pool, and genuine personality. One of the most Instagram-worthy hotels on the Central Coast.',
    highlights:['Heated outdoor pool and fire pits','Carefully curated art throughout the property','Friendly local vibe — not a chain experience','Good value for the quality and design','Close to downtown and Higuera St'],
    book_url:'https://www.thekinney.com/slo',
  },
  {
    name:'Garden Street Inn',
    category:'midrange',
    emoji:'🌺',
    price:'$$',
    location:'Downtown SLO — 1212 Garden St',
    summary:'A historic Victorian B&B in the heart of downtown SLO. Beautifully restored rooms, a generous breakfast, and a location you cannot beat.',
    highlights:['Full breakfast included each morning','Beautiful Victorian architecture','Walking distance to Mission Plaza and Higuera','Afternoon wine and cheese hour','Free parking on site'],
    book_url:'https://gardenstreetinn.com',
  },
  {
    name:'Courtyard Marriott SLO',
    category:'midrange',
    emoji:'🏨',
    price:'$$',
    location:'Downtown SLO — 1605 Calle Joaquin',
    summary:'A well-maintained Marriott property with a pool and fitness center close to downtown. Reliable quality and good value for families and business travelers.',
    highlights:['Pool and fitness center on site','Close to downtown and Cal Poly','Free parking','Reliable Marriott quality standards','Good for families and groups'],
    book_url:'https://www.marriott.com',
  },
  {
    name:'Holiday Inn Express SLO',
    category:'midrange',
    emoji:'🏨',
    price:'$$',
    location:'SLO — 1800 Monterey St',
    summary:'A clean, reliable mid-range property with free breakfast, a pool, and easy access to downtown and Cal Poly. Good for families and budget-conscious travelers who want a reliable base.',
    highlights:['Free hot breakfast included','Outdoor pool and fitness center','Free parking','Close to Cal Poly and downtown','Pet friendly'],
    book_url:'https://www.ihg.com',
  },
  {
    name:'Sands Suites and Motel',
    category:'midrange',
    emoji:'🏡',
    price:'$$',
    location:'SLO — 1930 Monterey St',
    summary:'A SLO independent property with suite options, a pool, and a friendly local feel. Good for longer stays with kitchenette suites available.',
    highlights:['Kitchenette suites available — good for longer stays','Outdoor pool','Free parking','Close to downtown','Friendly independent property — not a chain'],
    book_url:'https://www.sandssuites.com',
  },
  {
    name:'SLO Inn',
    category:'midrange',
    emoji:'🏠',
    price:'$$',
    location:'SLO — 1333 Madonna Rd',
    summary:'A comfortable, independently owned motel near the Madonna Inn with good value and easy highway access.',
    highlights:['Good location near US-101','Free parking','Clean and reliable','Pet friendly','Close to Madonna Inn and shopping'],
    book_url:'https://slomotel.com',
  },
  {
    name:'Best Western Royal Oak Hotel',
    category:'midrange',
    emoji:'🌳',
    price:'$$',
    location:'SLO — 214 Madonna Rd',
    summary:'A well-regarded Best Western property with a pool, restaurant on site, and convenient location near shopping and the freeway.',
    highlights:['Pool and hot tub on site','Restaurant and lounge on property','Free parking','Close to Madonna Rd shopping','Consistent quality for the brand'],
    book_url:'https://www.bestwestern.com',
  },
  {
    name:'Hampton Inn SLO',
    category:'midrange',
    emoji:'🏨',
    price:'$$',
    location:'SLO — 1800 Monterey St',
    summary:'A reliable Hampton Inn with free breakfast, pool, and a location that gives easy access to both downtown and Cal Poly.',
    highlights:['Free hot breakfast included','Outdoor pool','Free parking','Cal Poly and downtown accessible','Consistent Hilton quality'],
    book_url:'https://www.hilton.com',
  },
  {
    name:'Springhill Suites SLO',
    category:'midrange',
    emoji:'🏨',
    price:'$$',
    location:'SLO — 1321 Calle Joaquin',
    summary:'An all-suite Marriott property with more space than a standard hotel room. Good for families and longer stays.',
    highlights:['All-suite property — more space','Free breakfast included','Pool and fitness center','Free parking','Close to downtown'],
    book_url:'https://www.marriott.com',
  },
  {
    name:'Embassy Suites SLO',
    category:'midrange',
    emoji:'🏢',
    price:'$$-$$$',
    location:'SLO — 333 Madonna Rd',
    summary:'A full-service Embassy Suites with an atrium lobby, complimentary evening reception with drinks and snacks, and all-suite accommodations.',
    highlights:['All-suite accommodations','Complimentary evening reception — free drinks and snacks','Full hot breakfast included','Atrium pool and fitness center','Free parking'],
    book_url:'https://www.hilton.com',
  },
  {
    name:'La Quinta by Wyndham SLO',
    category:'budget',
    emoji:'💼',
    price:'$',
    location:'South SLO — 1585 Calle Joaquin',
    summary:'Clean, reliable, and well-located for the price. Good pool, free breakfast, and easy freeway access. The best straightforward budget option near downtown.',
    highlights:['Free breakfast included','Outdoor pool','5 min from downtown by car','Pet friendly','Free parking'],
    book_url:'https://www.wyndhamhotels.com',
  },
  {
    name:'HI San Luis Obispo Hostel',
    category:'budget',
    emoji:'🎒',
    price:'$',
    location:'Downtown SLO — 1617 Santa Rosa St',
    summary:'A true downtown hostel in a historic Victorian building. Private and dorm rooms available. Best budget option within walking distance of everything.',
    highlights:['Walking distance to Higuera St and Mission','Private rooms and dorm beds available','Community kitchen','Social atmosphere — meet other travelers','Free parking'],
    book_url:'https://www.hiusa.org/hostels/california/san-luis-obispo',
  },
  {
    name:'Motel 6 SLO',
    category:'budget',
    emoji:'🛏',
    price:'$',
    location:'SLO — 1433 Calle Joaquin',
    summary:'The most affordable chain option in SLO. Clean, no-frills, and well-located for highway access. Pet friendly.',
    highlights:['Lowest price point in SLO','Pet friendly','Free parking','Pool on site','Close to US-101'],
    book_url:'https://www.motel6.com',
  },
  {
    name:'Super 8 by Wyndham SLO',
    category:'budget',
    emoji:'🏨',
    price:'$',
    location:'SLO — 1951 Monterey St',
    summary:'An affordable budget property with free breakfast and parking close to downtown and Cal Poly.',
    highlights:['Free continental breakfast','Free parking','Pet friendly','Close to Cal Poly','Basic but clean'],
    book_url:'https://www.wyndhamhotels.com',
  },
  {
    name:'Travelodge SLO',
    category:'budget',
    emoji:'🛏',
    price:'$',
    location:'SLO — 1517 Monterey St',
    summary:'A no-frills budget option with free parking and a location on Monterey St that gives walkable access to downtown.',
    highlights:['Free parking','Walking distance to downtown','Budget-friendly price','Basic amenities','Close to Cal Poly'],
    book_url:'https://www.wyndhamhotels.com',
  },
  {
    name:'Avila Hot Springs Campground',
    category:'camping',
    emoji:'♨️',
    price:'$',
    location:'SLO — 250 Avila Beach Dr',
    summary:'Camp at a natural hot springs resort with geothermal pools included. The Bob Jones Trail to Avila Beach starts here. A genuinely unique SLO camping experience.',
    highlights:['Natural geothermal hot springs pools included','Bob Jones Trail to beach starts here','RV and tent sites available','Year-round open','15 min from downtown SLO'],
    book_url:'https://www.avilahotsprings.com',
  },
  {
    name:'El Chorro Regional Park Campground',
    category:'camping',
    emoji:'⛺',
    price:'$',
    location:'SLO — Highway 1 north of SLO',
    summary:'A county campground in a beautiful oak woodland setting just north of the city. Great base for hiking the surrounding open space.',
    highlights:['Oak woodland setting','Close to SLO and Morro Bay','RV hookups and tent sites','Day use area with BBQ facilities','Good base for hiking'],
    book_url:'https://www.slocountyparks.com',
  },
  {
    name:'Montana de Oro State Park Campground',
    category:'camping',
    emoji:'🌊',
    price:'$',
    location:'Los Osos — near SLO — Pecho Valley Rd',
    summary:'The most spectacular campground near SLO. Primitive sites among coastal bluffs. Seven miles of clifftop trail starts here. Book months in advance.',
    highlights:['Coastal bluffs and Pacific views from camp','7 miles of clifftop trails from site','Sea caves and tide pools nearby','No entrance fee','Dark sky — excellent star gazing'],
    book_url:'https://www.reservecalifornia.com',
  },
  {
    name:'Creekside RV Park SLO',
    category:'camping',
    emoji:'🚐',
    price:'$-$$',
    location:'SLO — 4765 Santa Margarita Lake Rd',
    summary:'A full-service RV park with hookups, a pool, and a pleasant setting near Santa Margarita Lake east of SLO.',
    highlights:['Full RV hookups available','Pool on site','Santa Margarita Lake nearby','Quiet rural setting','30 min east of downtown SLO'],
    book_url:'https://www.creeksidervpark.com',
  },
];
var _hotelCat = 'all';

function openHotelsHub() {
  var existing = document.getElementById('mh-hotels-hub');
  if (existing) existing.remove();

  if (!document.getElementById('hotels-hub-css')) {
    var s = document.createElement('style');
    s.id = 'hotels-hub-css';
    s.textContent = [
      '.hh3-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(139,92,246,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.hh3-filter.active{background:rgba(139,92,246,0.12);border-color:#8b5cf6;color:#c4b5fd}',
      '.hh3-card{padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 0.15s}',
      '.hh3-card:active{transform:scale(0.98)}',
    ].join('');
    document.head.appendChild(s);
  }

  _hotelCat = 'all';
  var hub = document.createElement('div');
  hub.id = 'mh-hotels-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(139,92,246,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeHotelsHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">🏨 Hotels & Stays</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">25 curated SLO accommodations · All budgets</div>' +
        '</div>' +
        '<button onclick="closeHotelsHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        HOTEL_CATS.map(function(c, i) {
          return '<button class="hh3-filter' + (i===0?' active':'') + '" data-hcat="' + c.id + '" onclick="hotelsSetCat(this,this.dataset.hcat)">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="hotels-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      hotelsRenderList('all') +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('hotels');
}
window.openHotelsHub = openHotelsHub;
window.menuHomeOpenHotelsHub = openHotelsHub;

function closeHotelsHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('hotels');
  var h = document.getElementById('mh-hotels-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeHotelsHub = closeHotelsHub;

function hotelsSetCat(el, cat) {
  _hotelCat = cat;
  document.querySelectorAll('.hh3-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('hotels-content');
  if (c) c.innerHTML = hotelsRenderList(cat);
}
window.hotelsSetCat = hotelsSetCat;

function hotelsRenderList(cat) {
  var hotels = cat === 'all' ? HOTELS : HOTELS.filter(function(h) { return h.category === cat; });
  return '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:10px">' + hotels.length + ' properties</div>' +
    hotels.map(function(h) {
      return '<div class="hh3-card" data-hname="' + h.name.replace(/'/g,"&#39;") + '" onclick="hotelsOpenDetail(this.dataset.hname)">' +
        '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="font-size:28px;flex-shrink:0;line-height:1;margin-top:2px">' + h.emoji + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:3px">' +
              '<div style="font-size:13px;font-weight:800">' + h.name + '</div>' +
              '<div style="font-size:13px;font-weight:900;color:#c4b5fd;flex-shrink:0">' + h.price + '</div>' +
            '</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">📍 ' + h.location + '</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.5);line-height:1.4">' + h.summary.substring(0,75) + '...</div>' +
          '</div>' +
          '<div style="font-size:14px;color:rgba(139,92,246,0.5);flex-shrink:0;margin-top:4px">›</div>' +
        '</div>' +
      '</div>';
    }).join('');
}

function hotelsOpenDetail(name) {
  var hotel = HOTELS.find(function(h) { return h.name === name; });
  if (!hotel) return;
  var c = document.getElementById('hotels-content');
  if (!c) return;
  c.scrollTop = 0;
  c.innerHTML =
    '<button onclick="hotelsBackToList()" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;padding:0;margin-bottom:16px">← All stays</button>' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">' +
      '<div style="font-size:40px">' + hotel.emoji + '</div>' +
      '<div>' +
        '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">' + hotel.name + '</div>' +
        '<div style="font-size:13px;font-weight:800;color:#c4b5fd;margin-top:2px">' + hotel.price + ' · ' + hotel.location + '</div>' +
      '</div>' +
    '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;margin-bottom:16px">' + hotel.summary + '</div>' +
    '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Highlights</div>' +
    hotel.highlights.map(function(hl) {
      return '<div style="display:flex;gap:8px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
        '<span style="color:#c4b5fd;flex-shrink:0">→</span>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.5">' + hl + '</div>' +
      '</div>';
    }).join('') +
    '<a href="' + hotel.book_url + '" target="_blank" style="display:block;padding:14px;border-radius:13px;background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(139,92,246,0.1));border:1px solid rgba(139,92,246,0.35);color:#c4b5fd;text-align:center;font-size:14px;font-weight:800;text-decoration:none;margin-top:16px">Book Now ↗</a>' +
    '<button onclick="hotelsBackToList()" style="width:100%;margin-top:12px;padding:13px;border-radius:13px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">← Back to Hotels</button>';
}
window.hotelsOpenDetail = hotelsOpenDetail;

function hotelsBackToList() {
  var c = document.getElementById('hotels-content');
  if (c) { c.innerHTML = hotelsRenderList(_hotelCat); c.scrollTop = 0; }
}
window.hotelsBackToList = hotelsBackToList;
