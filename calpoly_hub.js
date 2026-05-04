// ══════════════════════════════════════════════
// CALPOLY_HUB.JS — Cal Poly Student Hub v2
// Supabase-driven · Links · Campus Map · Resources
// ══════════════════════════════════════════════

var CALPOLY_DATA = [];

var CP_SECTIONS = [
  { id: 'all',       label: 'All',         emoji: '🎓' },
  { id: 'portal',   label: 'Portal',       emoji: '💻' },
  { id: 'campus',   label: 'Campus Life',  emoji: '🏫' },
  { id: 'health',   label: 'Health',       emoji: '🏥' },
  { id: 'transit',  label: 'Getting Around', emoji: '🚌' },
  { id: 'resources',label: 'Resources',    emoji: '💰' },
  { id: 'services', label: 'Services',     emoji: '🛒' },
];

async function loadCalPolyItems(catId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var q = sb.from('landmarks')
      .select('id, name, category, description, short_desc, emoji, website_url, tip, tags, address')
      .eq('hub_id', 'calpoly')
      .eq('city_id', 'slo')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (catId && catId !== 'all') q = q.eq('category', catId);
    var res = await q;
    if (res.error) throw res.error;
    return res.data || [];
  } catch(e) {
    console.warn('[CalPolyHub] load failed:', e);
    throw e;
  }
}

function cpRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4].map(function() {
      return '<div style="height:80px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)"></div>';
    }).join('') + '</div>';
}

function openCalPolyHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('calpoly');
  var existing = document.getElementById('mh-calpoly-hub');
  if (existing) existing.remove();

  if (!document.getElementById('calpoly-css')) {
    var s = document.createElement('style');
    s.id = 'calpoly-css';
    s.textContent = [
      '.cp-tab{padding:7px 13px;border-radius:20px;border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.cp-tab.active{background:rgba(99,102,241,0.15);border-color:#6366f1;color:#a5b4fc}',
      '.cp-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;transition:all 0.15s}',
      '.cp-card:active{background:rgba(99,102,241,0.08);transform:scale(0.98)}',
      '.cp-tag{padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc}',
      '.cp-link-btn{display:block;width:100%;padding:10px;border-radius:10px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);color:#a5b4fc;text-decoration:none;font-size:12px;font-weight:800;text-align:center;margin-top:8px;cursor:pointer}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-calpoly-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseCalPolyHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🎓 Cal Poly</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Campus · Resources · Student Life</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseCalPolyHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +

      // Campus Map Button
      '<a href="https://experience.arcgis.com/experience/5d3c7ce97866487eac63664dff9fb946" target="_blank" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05));border:1px solid rgba(99,102,241,0.3);text-decoration:none;margin-bottom:12px">' +
        '<div style="font-size:24px">🗺</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:800;color:#a5b4fc">Campus Map</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Interactive map of all campus buildings</div>' +
        '</div>' +
        '<div style="font-size:12px;color:#a5b4fc;font-weight:700">Open ↗</div>' +
      '</a>' +

      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        CP_SECTIONS.map(function(f, i) {
          return '<button class="cp-tab' + (i===0?' active':'') + '" data-id="' + f.id + '" onclick="cpFilter(this,this.dataset.id)">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="cp-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      cpRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('calpoly');

  loadCalPolyItems('all').then(function(items) {
    CALPOLY_DATA = items;
    var content = document.getElementById('cp-content');
    if (content) content.innerHTML = cpRenderList(items);
  }).catch(function(err) {
    var content = document.getElementById('cp-content');
    if (content) content.innerHTML =
      '<div style="padding:20px;background:rgba(255,45,120,0.1);border:1px solid rgba(255,45,120,0.3);border-radius:12px;font-size:12px;color:rgba(255,255,255,0.7)">' +
        '<div style="font-weight:800;color:#ff2d78;margin-bottom:8px">Error loading resources</div>' +
        '<div>' + (err && err.message ? err.message : String(err)) + '</div>' +
      '</div>';
  });
}
window.menuHomeOpenCalPolyHub = openCalPolyHub;

function closeCalPolyHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('calpoly');
  var h = document.getElementById('mh-calpoly-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseCalPolyHub = closeCalPolyHub;

function cpFilter(el, catId) {
  document.querySelectorAll('.cp-tab').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('cp-content');
  if (content) content.innerHTML = cpRenderLoading();
  loadCalPolyItems(catId).then(function(items) {
    CALPOLY_DATA = items;
    if (content) content.innerHTML = cpRenderList(items);
  }).catch(function(err) {
    if (content) content.innerHTML =
      '<div style="padding:20px;background:rgba(255,45,120,0.1);border:1px solid rgba(255,45,120,0.3);border-radius:12px;font-size:12px;color:rgba(255,255,255,0.7)">' +
        '<div style="font-weight:800;color:#ff2d78;margin-bottom:8px">Error</div>' +
        '<div>' + (err && err.message ? err.message : String(err)) + '</div>' +
      '</div>';
  });
}
window.cpFilter = cpFilter;

function cpRenderList(items) {
  if (!items.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No resources found</div>';
  return items.map(function(r) {
    return '<div class="cp-card" data-id="' + r.id + '" onclick="cpOpenDetail(this.dataset.id)">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="font-size:26px;flex-shrink:0">' + (r.emoji || '📌') + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + (r.name || '') + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.4">' + (r.short_desc || '') + '</div>' +
        '</div>' +
        (r.website_url ? '<div style="font-size:10px;color:#a5b4fc;font-weight:700;flex-shrink:0">↗</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

function cpOpenDetail(id) {
  var r = CALPOLY_DATA.find(function(x) { return String(x.id) === String(id); });
  if (!r) return;

  var existing = document.getElementById('mh-cp-detail');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'mh-cp-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:11000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.id = 'mh-cp-inner';
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(99,102,241,0.3);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="cpCloseDetail()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + (r.emoji || '📌') + '</div>' +
    '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">' + (r.name || '') + '</div>' +
    (r.tags && r.tags.length ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' + r.tags.map(function(t){ return '<span class="cp-tag">' + t + '</span>'; }).join('') + '</div>' : '') +
    (r.description ? '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:14px">' + r.description + '</div>' : '') +
    (r.tip ? '<div style="padding:10px 12px;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:12px;margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:#a5b4fc;margin-bottom:3px">💡 TIP</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + r.tip + '</div>' +
    '</div>' : '') +
    (r.website_url ? '<a href="' + r.website_url + '" target="_blank" class="cp-link-btn">Open Website ↗</a>' : '') +
    '<button onclick="cpCloseDetail()" style="display:block;width:100%;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;margin-top:8px">Close</button>';

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);

  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
  }, 30);

  sheet.addEventListener('click', function(e) { if (e.target === sheet) cpCloseDetail(); });
}
window.cpOpenDetail = cpOpenDetail;

function cpCloseDetail() {
  var s = document.getElementById('mh-cp-detail');
  if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); }, 300); }
}
window.cpCloseDetail = cpCloseDetail;
