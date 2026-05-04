// ══════════════════════════════════════════════
// HOUSING_HUB.JS — Housing & Rentals
// Curated links + in-app listings
// ══════════════════════════════════════════════

var HOUSING_LINKS = [
  { name:'Craigslist SLO Housing',    url:'https://slo.craigslist.org/search/apa',           emoji:'📋', desc:'Biggest local rental board. Check daily — good places go fast.' },
  { name:'Facebook Marketplace',      url:'https://www.facebook.com/marketplace/slo/propertyrentals', emoji:'📘', desc:'Rooms and sublets from locals. Often no broker fee.' },
  { name:'Zillow SLO Rentals',        url:'https://www.zillow.com/san-luis-obispo-ca/rentals/', emoji:'🏠', desc:'Aggregated listings with photos, maps, and price history.' },
  { name:'Apartments.com SLO',        url:'https://www.apartments.com/san-luis-obispo-ca/',    emoji:'🏢', desc:'Larger apartment complexes and managed properties.' },
  { name:'Cal Poly Off-Campus Housing',url:'https://housing.calpoly.edu/off-campus-housing',   emoji:'🎓', desc:'Official Cal Poly off-campus housing board. Student-specific.' },
  { name:'SLO Rental Resource',       url:'https://www.slocity.org/government/department-directory/community-development/housing', emoji:'🏛', desc:'City of SLO housing programs, tenant rights, and assistance.' },
];

var HOUSING_AREAS = [
  { id:'all',        label:'All Areas' },
  { id:'downtown',   label:'Downtown' },
  { id:'cal_poly',   label:'Near Cal Poly' },
  { id:'north_slo',  label:'North SLO' },
  { id:'south_slo',  label:'South SLO' },
  { id:'edna',       label:'Edna Valley' },
];

var HOUSING_RENT_GUIDE = [
  { area:'Downtown SLO',    studio:'$1,400–1,800', one_br:'$1,800–2,400', two_br:'$2,400–3,200' },
  { area:'Near Cal Poly',   studio:'$1,200–1,600', one_br:'$1,600–2,200', two_br:'$2,200–3,000' },
  { area:'North SLO',       studio:'$1,300–1,700', one_br:'$1,700–2,200', two_br:'$2,200–2,900' },
  { area:'South SLO',       studio:'$1,200–1,600', one_br:'$1,600–2,100', two_br:'$2,000–2,800' },
  { area:'Shared Room',     studio:'$700–950',     one_br:'—',            two_br:'—' },
];

var _housingArea = 'all';
var _housingListings = [];
var _housingShowPost = false;

async function housingLoadListings(area) {
  try {
    var sb = window.supabaseClient;
    if (!sb) return [];
    var q = sb.from('listings')
      .select('*')
      .eq('hub_type', 'housing')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(30);
    if (area && area !== 'all') q = q.eq('area', area);
    var res = await q;
    return res.data || [];
  } catch(e) { return []; }
}

function openHousingHub() {
  var existing = document.getElementById('mh-housing-hub');
  if (existing) existing.remove();

  if (!document.getElementById('housing-hub-css')) {
    var s = document.createElement('style');
    s.id = 'housing-hub-css';
    s.textContent = [
      '.hh-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(16,185,129,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.hh-filter.active{background:rgba(16,185,129,0.12);border-color:#10b981;color:#10b981}',
      '.hh-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '.hh-card:active{transform:scale(0.98);background:rgba(16,185,129,0.05)}',
      '.hh-link{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;display:flex;align-items:center;gap:12px;text-decoration:none;-webkit-tap-highlight-color:transparent}',
      '.hh-link:active{transform:scale(0.98)}',
      '.hh-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;font-family:Helvetica Neue,sans-serif}',
      '.hh-input:focus{border-color:rgba(16,185,129,0.4)}',
    ].join('');
    document.head.appendChild(s);
  }

  _housingArea = 'all';
  _housingShowPost = false;

  var hub = document.createElement('div');
  hub.id = 'mh-housing-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(16,185,129,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeHousingHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🏠 Housing & Rentals</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">SLO apartments · rooms · sublets</div>' +
        '</div>' +
        '<button onclick="closeHousingHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        HOUSING_AREAS.map(function(a, i) {
          return '<button class="hh-filter' + (i===0?' active':'') + '" data-harea="' + a.id + '" onclick="housingSetArea(this,this.dataset.harea)">' + a.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="housing-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      housingRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('housing');

  housingLoadListings('all').then(function(data) {
    _housingListings = data;
    var c = document.getElementById('housing-content');
    if (c) c.innerHTML = housingRenderContent(data);
  });
}
window.openHousingHub = openHousingHub;
window.menuHomeOpenHousingHub = openHousingHub;

function closeHousingHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('housing');
  var h = document.getElementById('mh-housing-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeHousingHub = closeHousingHub;
window.menuHomeCloseHousingHub = closeHousingHub;

function housingSetArea(el, area) {
  _housingArea = area;
  document.querySelectorAll('.hh-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('housing-content');
  if (c) c.innerHTML = housingRenderLoading();
  housingLoadListings(area).then(function(data) {
    _housingListings = data;
    if (c) c.innerHTML = housingRenderContent(data);
  });
}
window.housingSetArea = housingSetArea;

function housingRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3].map(function() { return '<div style="height:80px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)"></div>'; }).join('') +
  '</div>';
}

function housingRenderContent(listings) {
  var html = '';

  // Post button
  html += '<button onclick="housingTogglePost()" style="width:100%;padding:13px;border-radius:14px;border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.08);color:#10b981;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif;margin-bottom:16px">+ Post a Listing</button>';

  // Post form
  if (_housingShowPost) {
    html += housingRenderPostForm();
  }

  // In-app listings
  if (listings.length) {
    html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">📋 Community Listings</div>';
    html += listings.map(function(l) {
      return '<div class="hh-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">' +
          '<div style="font-size:14px;font-weight:800;flex:1;margin-right:8px">' + (l.title||'') + '</div>' +
          '<div style="font-size:14px;font-weight:900;color:#10b981;flex-shrink:0">' + (l.price||'') + '</div>' +
        '</div>' +
        (l.description ? '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:8px">' + l.description.substring(0,120) + (l.description.length>120?'…':'') + '</div>' : '') +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          (l.area ? '<span style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#10b981">📍 ' + l.area + '</span>' : '') +
          (l.category ? '<span style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5)">' + l.category + '</span>' : '') +
          (l.contact ? '<a href="' + (l.contact.indexOf('@')>-1?'mailto:':'tel:') + l.contact + '" style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);color:#06b6d4;text-decoration:none">Contact</a>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    html += '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.3);font-size:12px;margin-bottom:16px">No listings yet in this area — be the first to post.</div>';
  }

  // Rent guide
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:8px">📊 SLO Rent Guide</div>';
  html += '<div style="overflow-x:auto;margin-bottom:16px"><table style="width:100%;border-collapse:collapse;font-size:11px">' +
    '<tr style="color:rgba(255,255,255,0.4)">' +
      '<th style="text-align:left;padding:6px 8px;font-weight:700">Area</th>' +
      '<th style="text-align:center;padding:6px 8px;font-weight:700">Studio</th>' +
      '<th style="text-align:center;padding:6px 8px;font-weight:700">1BR</th>' +
      '<th style="text-align:center;padding:6px 8px;font-weight:700">2BR</th>' +
    '</tr>' +
    HOUSING_RENT_GUIDE.map(function(r, i) {
      return '<tr style="border-top:1px solid rgba(255,255,255,0.05);background:' + (i%2===0?'rgba(255,255,255,0.02)':'transparent') + '">' +
        '<td style="padding:8px;font-weight:700;font-size:11px">' + r.area + '</td>' +
        '<td style="padding:8px;text-align:center;color:rgba(255,255,255,0.55);font-size:10px">' + r.studio + '</td>' +
        '<td style="padding:8px;text-align:center;color:rgba(255,255,255,0.55);font-size:10px">' + r.one_br + '</td>' +
        '<td style="padding:8px;text-align:center;color:rgba(255,255,255,0.55);font-size:10px">' + r.two_br + '</td>' +
      '</tr>';
    }).join('') +
  '</table></div>';

  // Curated links
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🔗 Search Online</div>';
  html += HOUSING_LINKS.map(function(l) {
    return '<a href="' + l.url + '" target="_blank" class="hh-link">' +
      '<div style="font-size:26px;flex-shrink:0">' + l.emoji + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:800;color:#fff">' + l.name + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;line-height:1.4">' + l.desc + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(16,185,129,0.7);font-weight:700;flex-shrink:0">↗</div>' +
    '</a>';
  }).join('');

  return html;
}

function housingRenderPostForm() {
  return '<div style="padding:14px;border-radius:14px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);margin-bottom:16px">' +
    '<div style="font-size:13px;font-weight:800;color:#10b981;margin-bottom:12px">Post a Housing Listing</div>' +
    '<input class="hh-input" id="hh-post-title" placeholder="Title (e.g. 1BR near Cal Poly, available June 1)" style="margin-bottom:8px"><br>' +
    '<input class="hh-input" id="hh-post-price" placeholder="Monthly rent (e.g. $1,400/mo)" style="margin-bottom:8px"><br>' +
    '<select class="hh-input" id="hh-post-area" style="margin-bottom:8px">' +
      '<option value="">Select area...</option>' +
      HOUSING_AREAS.filter(function(a){return a.id!=='all';}).map(function(a){return '<option value="'+a.id+'">'+a.label+'</option>';}).join('') +
    '</select><br>' +
    '<select class="hh-input" id="hh-post-cat" style="margin-bottom:8px">' +
      '<option value="">Type of listing...</option>' +
      ['Studio','1BR','2BR','3BR+','Room in Shared House','Sublet','Short-term'].map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('') +
    '</select><br>' +
    '<textarea class="hh-input" id="hh-post-desc" rows="3" placeholder="Description — include details like furnished, pets, parking, utilities..." style="margin-bottom:8px;resize:none"></textarea>' +
    '<input class="hh-input" id="hh-post-contact" placeholder="Contact (phone or email)" style="margin-bottom:12px"><br>' +
    '<button onclick="housingSubmitPost()" style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif">Submit Listing</button>' +
  '</div>';
}

function housingTogglePost() {
  _housingShowPost = !_housingShowPost;
  var c = document.getElementById('housing-content');
  if (c) c.innerHTML = housingRenderContent(_housingListings);
  if (_housingShowPost) {
    var c2 = document.getElementById('housing-content');
    if (c2) c2.scrollTop = 0;
  }
}
window.housingTogglePost = housingTogglePost;

async function housingSubmitPost() {
  var title   = (document.getElementById('hh-post-title')||{}).value || '';
  var price   = (document.getElementById('hh-post-price')||{}).value || '';
  var area    = (document.getElementById('hh-post-area')||{}).value || '';
  var cat     = (document.getElementById('hh-post-cat')||{}).value || '';
  var desc    = (document.getElementById('hh-post-desc')||{}).value || '';
  var contact = (document.getElementById('hh-post-contact')||{}).value || '';
  if (!title || !contact) { if (typeof showToast==='function') showToast('Title and contact are required'); return; }
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No connection');
    var userId = (typeof getEffectiveUserId==='function') ? getEffectiveUserId() : 'guest';
    await sb.from('listings').insert({ user_id:userId, hub_type:'housing', title:title, price:price, area:area, category:cat, description:desc, contact:contact });
    if (typeof showToast==='function') showToast('Listing posted ✅');
    _housingShowPost = false;
    var data = await housingLoadListings(_housingArea);
    _housingListings = data;
    var c = document.getElementById('housing-content');
    if (c) c.innerHTML = housingRenderContent(data);
  } catch(e) { if (typeof showToast==='function') showToast('Post failed — try again'); }
}
window.housingSubmitPost = housingSubmitPost;
