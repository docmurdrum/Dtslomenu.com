// ══════════════════════════════════════════════
// BUCKET_LIST.JS — SLO Bucket List
// 100 things to do · Check off · Badges · Progress
// ══════════════════════════════════════════════

var BUCKET_CATS = [
  { id:'all',        label:'All',          emoji:'🏆' },
  { id:'outdoors',   label:'Outdoors',     emoji:'🏔' },
  { id:'food_drink', label:'Food & Drink', emoji:'🍽' },
  { id:'culture',    label:'Culture',      emoji:'🎨' },
  { id:'calpoly',    label:'Cal Poly',     emoji:'🎓' },
  { id:'hidden',     label:'Hidden Gems',  emoji:'💎' },
  { id:'seasonal',   label:'Seasonal',     emoji:'🌸' },
];

var BUCKET_DIFF_COLOR = { easy:'#22c55e', moderate:'#f59e0b', hard:'#ef4444' };

var BUCKET_BADGES = [
  { id:'first',     label:'First Step',     emoji:'👣', desc:'Complete your first item',                  req:1 },
  { id:'ten',       label:'Getting Started', emoji:'🔟', desc:'Complete 10 items',                         req:10 },
  { id:'quarter',   label:'Quarter Way',    emoji:'🥉', desc:'Complete 25 items',                         req:25 },
  { id:'halfway',   label:'Halfway There',  emoji:'🥈', desc:'Complete 50 items',                         req:50 },
  { id:'almost',    label:'Almost Local',   emoji:'🥇', desc:'Complete 75 items',                         req:75 },
  { id:'complete',  label:'True SLO Local', emoji:'🏆', desc:'Complete all 100 items',                    req:100 },
  { id:'outdoors5', label:'Trail Blazer',   emoji:'🥾', desc:'Complete 5 outdoor items',                  req:5, cat:'outdoors' },
  { id:'foodie5',   label:'SLO Foodie',     emoji:'🍴', desc:'Complete 5 food and drink items',           req:5, cat:'food_drink' },
  { id:'hidden3',   label:'Secret Keeper',  emoji:'🔑', desc:'Find 3 hidden gems',                        req:3, cat:'hidden' },
];

var _bucketItems = [];
var _bucketCompleted = {};
var _bucketCat = 'all';
var _bucketTab = 'list'; // list | progress

// Load completed items from localStorage
function bucketLoadCompleted() {
  try {
    var raw = localStorage.getItem('slo_bucket_completed');
    _bucketCompleted = raw ? JSON.parse(raw) : {};
  } catch(e) { _bucketCompleted = {}; }
}

function bucketSaveCompleted() {
  try { localStorage.setItem('slo_bucket_completed', JSON.stringify(_bucketCompleted)); } catch(e) {}
}

function bucketToggleItem(id) {
  id = String(id);
  if (_bucketCompleted[id]) {
    delete _bucketCompleted[id];
  } else {
    _bucketCompleted[id] = Date.now();
  }
  bucketSaveCompleted();

  // Sync to Supabase if logged in
  bucketSyncToSupabase(id, !!_bucketCompleted[id]);

  // Re-render
  var c = document.getElementById('bucket-content');
  if (c) c.innerHTML = bucketRenderContent(_bucketItems);
}
window.bucketToggleItem = bucketToggleItem;

async function bucketSyncToSupabase(itemId, completed) {
  try {
    var sb = window.supabaseClient;
    if (!sb || !window.currentUser) return;
    var userId = currentUser.id;
    if (completed) {
      await sb.from('bucket_list_completions').upsert({ user_id:userId, item_id:parseInt(itemId) }, { onConflict:'user_id,item_id' });
    } else {
      await sb.from('bucket_list_completions').delete().eq('user_id', userId).eq('item_id', parseInt(itemId));
    }
  } catch(e) {}
}

async function bucketLoadItems(cat) {
  try {
    var sb = window.supabaseClient;
    if (!sb) return [];
    var q = sb.from('bucket_list_items')
      .select('id, title, category, emoji, difficulty, cost, time_needed, description')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (cat && cat !== 'all') q = q.eq('category', cat);
    var res = await q;
    return res.data || [];
  } catch(e) { return []; }
}

function openBucketList() {
  var existing = document.getElementById('mh-bucket-hub');
  if (existing) existing.remove();
  bucketLoadCompleted();

  if (!document.getElementById('bucket-hub-css')) {
    var s = document.createElement('style');
    s.id = 'bucket-hub-css';
    s.textContent = [
      '.bl-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(255,215,0,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.bl-filter.active{background:rgba(255,215,0,0.1);border-color:#ffd700;color:#ffd700}',
      '.bl-item{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}',
      '.bl-item.done{background:rgba(34,197,94,0.05);border-color:rgba(34,197,94,0.2)}',
      '.bl-item:active{transform:scale(0.98)}',
      '.bl-check{width:24px;height:24px;border-radius:12px;border:2px solid rgba(255,255,255,0.2);flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s}',
      '.bl-check.checked{background:#22c55e;border-color:#22c55e}',
    ].join('');
    document.head.appendChild(s);
  }

  _bucketCat = 'all';
  _bucketTab = 'list';

  var hub = document.createElement('div');
  hub.id = 'mh-bucket-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  var doneCount = Object.keys(_bucketCompleted).length;

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(255,215,0,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<button onclick="closeBucketList()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">🏆 SLO Bucket List</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + doneCount + ' of 100 completed</div>' +
        '</div>' +
        '<button onclick="bucketSetTab(\'progress\')" style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);color:#ffd700;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">Progress</button>' +
        '<button onclick="closeBucketList()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="height:5px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden;margin-bottom:12px">' +
        '<div style="height:100%;width:' + doneCount + '%;background:linear-gradient(90deg,#ffd700,#f59e0b);border-radius:3px;transition:width 0.6s ease"></div>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        BUCKET_CATS.map(function(c, i) {
          return '<button class="bl-filter' + (i===0?' active':'') + '" data-bcat="' + c.id + '" onclick="bucketSetCat(this,this.dataset.bcat)">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="bucket-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      bucketRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('bucket_list');

  bucketLoadItems('all').then(function(data) {
    _bucketItems = data;
    var c = document.getElementById('bucket-content');
    if (c) c.innerHTML = bucketRenderContent(data);
  });
}
window.openBucketList = openBucketList;
window.menuHomeOpenBucketList = openBucketList;

function closeBucketList() {
  hubDeactivateMapMode();
  tipsRemoveButton('bucket_list');
  var h = document.getElementById('mh-bucket-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeBucketList = closeBucketList;

function bucketSetCat(el, cat) {
  _bucketCat = cat;
  _bucketTab = 'list';
  document.querySelectorAll('.bl-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('bucket-content');
  if (c) c.innerHTML = bucketRenderLoading();
  bucketLoadItems(cat).then(function(data) {
    _bucketItems = data;
    if (c) c.innerHTML = bucketRenderContent(data);
  });
}
window.bucketSetCat = bucketSetCat;

function bucketSetTab(tab) {
  _bucketTab = tab;
  var c = document.getElementById('bucket-content');
  if (c) c.innerHTML = tab === 'progress' ? bucketRenderProgress() : bucketRenderContent(_bucketItems);
}
window.bucketSetTab = bucketSetTab;

function bucketRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px">' +
    [1,2,3,4,5].map(function() { return '<div style="height:64px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)"></div>'; }).join('') +
  '</div>';
}

function bucketRenderContent(items) {
  if (!items.length) return '<div style="text-align:center;padding:48px;color:rgba(255,255,255,0.3);font-size:13px">No items in this category.</div>';
  return items.map(function(item) {
    var done = !!_bucketCompleted[String(item.id)];
    var dc = BUCKET_DIFF_COLOR[item.difficulty] || '#22c55e';
    return '<div class="bl-item' + (done?' done':'') + '" data-bid="' + item.id + '" onclick="bucketToggleItem(this.dataset.bid)">' +
      '<div class="bl-check' + (done?' checked':'') + '">' + (done ? '<span style="color:#fff;font-size:13px">✓</span>' : '') + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:800;' + (done?'text-decoration:line-through;color:rgba(255,255,255,0.4);':'') + 'line-height:1.3;margin-bottom:3px">' + item.title + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);line-height:1.4">' + (item.description||'').substring(0,70) + (item.description && item.description.length>70?'…':'') + '</div>' +
        '<div style="display:flex;gap:6px;margin-top:5px;flex-wrap:wrap">' +
          '<span style="font-size:9px;font-weight:700;color:' + dc + ';padding:1px 6px;border-radius:20px;background:' + dc + '15;border:1px solid ' + dc + '30">' + item.difficulty + '</span>' +
          '<span style="font-size:9px;color:rgba(255,255,255,0.35)">' + (item.cost||'') + '</span>' +
          '<span style="font-size:9px;color:rgba(255,255,255,0.35)">⏱ ' + (item.time_needed||'') + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function bucketRenderProgress() {
  var total = Object.keys(_bucketCompleted).length;
  var pct = total;

  var badgesHtml = BUCKET_BADGES.map(function(b) {
    var earned = b.cat
      ? (Object.keys(_bucketCompleted).filter(function(id) {
          var item = _bucketItems.find(function(x) { return String(x.id) === id; });
          return item && item.category === b.cat;
        }).length >= b.req)
      : total >= b.req;
    return '<div style="padding:12px 10px;border-radius:14px;background:' + (earned?'rgba(255,215,0,0.08)':'rgba(255,255,255,0.02)') + ';border:1px solid ' + (earned?'rgba(255,215,0,0.25)':'rgba(255,255,255,0.06)') + ';text-align:center;opacity:' + (earned?1:0.35) + '">' +
      '<div style="font-size:24px;margin-bottom:4px">' + b.emoji + '</div>' +
      '<div style="font-size:10px;font-weight:800;color:' + (earned?'#ffd700':'rgba(255,255,255,0.4)') + '">' + b.label + '</div>' +
      '<div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px">' + b.desc + '</div>' +
    '</div>';
  }).join('');

  // Category breakdown
  var catBreakdown = BUCKET_CATS.filter(function(c){return c.id!=='all';}).map(function(cat) {
    var catItems = _bucketItems.filter(function(i){return i.category===cat.id;});
    var catDone = catItems.filter(function(i){return !!_bucketCompleted[String(i.id)];}).length;
    var catTotal = catItems.length;
    var catPct = catTotal ? Math.round((catDone/catTotal)*100) : 0;
    return '<div style="margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:3px">' +
        '<span style="font-size:12px;font-weight:700">' + cat.emoji + ' ' + cat.label + '</span>' +
        '<span style="font-size:11px;color:rgba(255,255,255,0.45)">' + catDone + '/' + catTotal + '</span>' +
      '</div>' +
      '<div style="height:5px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden">' +
        '<div style="height:100%;width:' + catPct + '%;background:linear-gradient(90deg,#ffd700,#f59e0b);border-radius:3px"></div>' +
      '</div>' +
    '</div>';
  }).join('');

  return '<button onclick="bucketSetTab(\'list\')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;padding:0;margin-bottom:16px">← Back to list</button>' +
    '<div style="text-align:center;padding:20px 0 24px">' +
      '<div style="font-size:56px;font-weight:900;color:#ffd700;line-height:1">' + total + '</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.45);margin-top:4px">of 100 completed</div>' +
      '<div style="height:8px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden;margin-top:12px">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#ffd700,#f59e0b);border-radius:4px;transition:width 0.8s ease"></div>' +
      '</div>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">By Category</div>' +
    catBreakdown +
    '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;margin-top:8px">Badges</div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + badgesHtml + '</div>';
}
