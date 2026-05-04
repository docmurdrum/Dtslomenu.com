// ══════════════════════════════════════════════
// BUYSELL_HUB.JS — Buy & Sell
// Curated links + in-app marketplace
// ══════════════════════════════════════════════

var BUYSELL_LINKS = [
  { name:'Facebook Marketplace SLO',  url:'https://www.facebook.com/marketplace/slo', emoji:'📘', desc:'Most active local marketplace. Furniture, electronics, bikes, and more.' },
  { name:'Craigslist SLO For Sale',   url:'https://slo.craigslist.org/search/sss',    emoji:'📋', desc:'Classic. Free listings. Great for large items like furniture and appliances.' },
  { name:'OfferUp SLO',               url:'https://offerup.com',                       emoji:'📦', desc:'App-based local marketplace with in-app messaging and ratings.' },
  { name:'Cal Poly Classifieds',      url:'https://www.facebook.com/groups/calpolyclassifieds', emoji:'🎓', desc:'Cal Poly student buy/sell group. Textbooks, dorm gear, bikes, and sublets.' },
];

var BUYSELL_CATS = [
  { id:'all',         label:'All',          emoji:'🛍' },
  { id:'free',        label:'Free Stuff',   emoji:'🆓' },
  { id:'furniture',   label:'Furniture',    emoji:'🛋' },
  { id:'electronics', label:'Electronics',  emoji:'📱' },
  { id:'bikes',       label:'Bikes',        emoji:'🚴' },
  { id:'textbooks',   label:'Textbooks',    emoji:'📚' },
  { id:'clothing',    label:'Clothing',     emoji:'👕' },
  { id:'cars',        label:'Vehicles',     emoji:'🚗' },
  { id:'other',       label:'Other',        emoji:'📦' },
];

var BUYSELL_MEETUP_SPOTS = [
  'SLO Public Library — 995 Palm St',
  'Starbucks Downtown — 1052 Foothill Blvd',
  'Target SLO — 153 Madonna Rd',
  'Whole Foods SLO — 269 Madonna Rd',
  'SLO Police Station — 1042 Walnut St (safest option)',
];

var _bsCat = 'all';
var _bsListings = [];
var _bsShowPost = false;

async function bsLoadListings(cat) {
  try {
    var sb = window.supabaseClient;
    if (!sb) return [];
    var q = sb.from('listings')
      .select('*')
      .eq('hub_type', 'buy_sell')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(40);
    if (cat && cat !== 'all') q = q.eq('category', cat);
    var res = await q;
    return res.data || [];
  } catch(e) { return []; }
}

function openBuySellHub() {
  var existing = document.getElementById('mh-buysell-hub');
  if (existing) existing.remove();

  if (!document.getElementById('buysell-hub-css')) {
    var s = document.createElement('style');
    s.id = 'buysell-hub-css';
    s.textContent = [
      '.bs-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(236,72,153,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.bs-filter.active{background:rgba(236,72,153,0.12);border-color:#ec4899;color:#ec4899}',
      '.bs-filter[data-bscat="free"].active{background:rgba(34,197,94,0.12);border-color:#22c55e;color:#22c55e}',
      '.bs-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;-webkit-tap-highlight-color:transparent}',
      '.bs-link{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;display:flex;align-items:center;gap:12px;text-decoration:none;-webkit-tap-highlight-color:transparent}',
      '.bs-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;font-family:Helvetica Neue,sans-serif}',
      '.bs-input:focus{border-color:rgba(236,72,153,0.4)}',
      '.bs-free-badge{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:900;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#22c55e}',
    ].join('');
    document.head.appendChild(s);
  }

  _bsCat = 'all';
  _bsShowPost = false;

  var hub = document.createElement('div');
  hub.id = 'mh-buysell-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(236,72,153,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeBuySellHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🛍 Buy & Sell</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">SLO marketplace · free stuff · local deals</div>' +
        '</div>' +
        '<button onclick="closeBuySellHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        BUYSELL_CATS.map(function(c, i) {
          return '<button class="bs-filter' + (i===0?' active':'') + '" data-bscat="' + c.id + '" onclick="bsSetCat(this,this.dataset.bscat)">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="buysell-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      bsRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('buy_sell');

  bsLoadListings('all').then(function(data) {
    _bsListings = data;
    var c = document.getElementById('buysell-content');
    if (c) c.innerHTML = bsRenderContent(data);
  });
}
window.openBuySellHub = openBuySellHub;
window.menuHomeOpenBuySellHub = openBuySellHub;

function closeBuySellHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('buy_sell');
  var h = document.getElementById('mh-buysell-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeBuySellHub = closeBuySellHub;
window.menuHomeCloseBuySellHub = closeBuySellHub;

function bsSetCat(el, cat) {
  _bsCat = cat;
  document.querySelectorAll('.bs-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('buysell-content');
  if (c) c.innerHTML = bsRenderLoading();
  bsLoadListings(cat).then(function(data) {
    _bsListings = data;
    if (c) c.innerHTML = bsRenderContent(data);
  });
}
window.bsSetCat = bsSetCat;

function bsRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px">' +
    [1,2,3,4].map(function() { return '<div style="height:80px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)"></div>'; }).join('') +
  '</div>';
}

function bsRenderContent(listings) {
  var html = '';

  // Post button
  html += '<button onclick="bsTogglePost()" style="width:100%;padding:13px;border-radius:14px;border:1px solid rgba(236,72,153,0.35);background:rgba(236,72,153,0.08);color:#ec4899;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif;margin-bottom:16px">+ Post an Item</button>';

  if (_bsShowPost) html += bsRenderPostForm();

  // Free stuff spotlight if not filtered
  var freeItems = listings.filter(function(l) { return l.category==='free' || l.price==='Free' || l.price==='$0'; });
  if (freeItems.length && _bsCat === 'all') {
    html += '<div style="font-size:11px;font-weight:700;color:#22c55e;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🆓 Free Stuff</div>';
    html += freeItems.map(function(l) { return bsRenderCard(l); }).join('');
    html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:16px">📋 All Listings</div>';
    var nonFree = listings.filter(function(l) { return l.category!=='free' && l.price!=='Free' && l.price!=='$0'; });
    if (nonFree.length) {
      html += nonFree.map(function(l) { return bsRenderCard(l); }).join('');
    } else {
      html += '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:12px">No other listings yet.</div>';
    }
  } else if (listings.length) {
    html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">📋 Listings</div>';
    html += listings.map(function(l) { return bsRenderCard(l); }).join('');
  } else {
    html += '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.3);font-size:12px;margin-bottom:16px">No listings yet — be the first to post.</div>';
  }

  // Safe meetup spots
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:8px">📍 Safe Meetup Spots</div>';
  html += '<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);margin-bottom:16px">' +
    BUYSELL_MEETUP_SPOTS.map(function(spot) {
      return '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
        '<span style="color:#ec4899;flex-shrink:0">→</span>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.55)">' + spot + '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  // Links
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🔗 Search Online</div>';
  html += BUYSELL_LINKS.map(function(l) {
    return '<a href="' + l.url + '" target="_blank" class="bs-link">' +
      '<div style="font-size:26px;flex-shrink:0">' + l.emoji + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:800;color:#fff">' + l.name + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;line-height:1.4">' + l.desc + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(236,72,153,0.7);font-weight:700;flex-shrink:0">↗</div>' +
    '</a>';
  }).join('');

  return html;
}

function bsRenderCard(l) {
  var isFree = l.category==='free' || l.price==='Free' || l.price==='$0';
  var cat = BUYSELL_CATS.find(function(c){return c.id===l.category;}) || { emoji:'📦' };
  return '<div class="bs-card">' +
    '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:6px">' +
      '<div style="font-size:22px;flex-shrink:0">' + cat.emoji + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + (l.title||'') + '</div>' +
        (l.description ? '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5">' + l.description.substring(0,100) + (l.description.length>100?'…':'') + '</div>' : '') +
      '</div>' +
      '<div style="flex-shrink:0;text-align:right">' +
        (isFree ? '<span class="bs-free-badge">FREE</span>' : (l.price ? '<div style="font-size:15px;font-weight:900;color:#ec4899">' + l.price + '</div>' : '')) +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
      (l.contact ? '<a href="' + (l.contact.indexOf('@')>-1?'mailto:':'tel:') + l.contact + '" style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);color:#ec4899;text-decoration:none">Contact</a>' : '') +
    '</div>' +
  '</div>';
}

function bsRenderPostForm() {
  return '<div style="padding:14px;border-radius:14px;background:rgba(236,72,153,0.06);border:1px solid rgba(236,72,153,0.2);margin-bottom:16px">' +
    '<div style="font-size:13px;font-weight:800;color:#ec4899;margin-bottom:12px">Post an Item</div>' +
    '<input class="bs-input" id="bs-post-title" placeholder="What are you selling? (e.g. Trek bike, barely used)" style="margin-bottom:8px"><br>' +
    '<input class="bs-input" id="bs-post-price" placeholder="Price (e.g. $50, Free, OBO)" style="margin-bottom:8px"><br>' +
    '<select class="bs-input" id="bs-post-cat" style="margin-bottom:8px">' +
      '<option value="">Category...</option>' +
      BUYSELL_CATS.filter(function(c){return c.id!=='all';}).map(function(c){return '<option value="'+c.id+'">'+c.emoji+' '+c.label+'</option>';}).join('') +
    '</select><br>' +
    '<textarea class="bs-input" id="bs-post-desc" rows="2" placeholder="Description, condition, any details..." style="margin-bottom:8px;resize:none"></textarea>' +
    '<input class="bs-input" id="bs-post-contact" placeholder="Contact (phone or email)" style="margin-bottom:12px"><br>' +
    '<button onclick="bsSubmitPost()" style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#ec4899,#db2777);color:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif">Post Item</button>' +
  '</div>';
}

function bsTogglePost() {
  _bsShowPost = !_bsShowPost;
  var c = document.getElementById('buysell-content');
  if (c) c.innerHTML = bsRenderContent(_bsListings);
  if (_bsShowPost) { var c2 = document.getElementById('buysell-content'); if (c2) c2.scrollTop = 0; }
}
window.bsTogglePost = bsTogglePost;

async function bsSubmitPost() {
  var title   = (document.getElementById('bs-post-title')||{}).value || '';
  var price   = (document.getElementById('bs-post-price')||{}).value || '';
  var cat     = (document.getElementById('bs-post-cat')||{}).value || '';
  var desc    = (document.getElementById('bs-post-desc')||{}).value || '';
  var contact = (document.getElementById('bs-post-contact')||{}).value || '';
  if (!title || !contact) { if (typeof showToast==='function') showToast('Title and contact are required'); return; }
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No connection');
    var userId = (typeof getEffectiveUserId==='function') ? getEffectiveUserId() : 'guest';
    await sb.from('listings').insert({ user_id:userId, hub_type:'buy_sell', title:title, price:price, category:cat, description:desc, contact:contact });
    if (typeof showToast==='function') showToast('Item posted ✅');
    _bsShowPost = false;
    var data = await bsLoadListings(_bsCat);
    _bsListings = data;
    var c = document.getElementById('buysell-content');
    if (c) c.innerHTML = bsRenderContent(data);
  } catch(e) { if (typeof showToast==='function') showToast('Post failed — try again'); }
}
window.bsSubmitPost = bsSubmitPost;
