// ══════════════════════════════════════════════
// LEARN_SLO.JS — Learn SLO Hub
// Supabase-driven articles · Categories · Reading mode
// ══════════════════════════════════════════════

var LEARN_CATS = [
  { id:'all',        label:'All',         emoji:'📚' },
  { id:'geology',    label:'Geology',     emoji:'🏔' },
  { id:'history',    label:'History',     emoji:'🏛' },
  { id:'nature',     label:'Nature',      emoji:'🌿' },
  { id:'culture',    label:'Culture',     emoji:'🎨' },
  { id:'wine',       label:'Wine',        emoji:'🍷' },
  { id:'food_drink', label:'Food & Drink',emoji:'🍺' },
  { id:'calpoly',    label:'Cal Poly',    emoji:'🎓' },
];

var LEARN_EMOJI_MAP = {
  mountain:'🏔', native:'🌿', city:'🏙', wine:'🍷', history:'📜',
  nature:'🌿', graduation:'🎓', building:'🏗', sun:'☀️', music:'🎵',
  beer:'🍺', water:'💧', theater:'🎭', farm:'🌾', mission:'⛪',
  book:'📚', art:'🎨', photo:'📸', food:'🍽',
};

var _learnArticles = [];
var _learnCat = 'all';

function learnEmoji(key) {
  return LEARN_EMOJI_MAP[key] || '📖';
}

async function learnLoadArticles(cat) {
  try {
    var sb = window.supabaseClient;
    if (!sb) return [];
    var q = sb.from('learn_slo_articles')
      .select('id, title, category, emoji, summary, read_time, sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (cat && cat !== 'all') q = q.eq('category', cat);
    var res = await q;
    return res.data || [];
  } catch(e) { console.warn('[LearnSLO] load failed:', e); return []; }
}

async function learnLoadArticle(id) {
  try {
    var sb = window.supabaseClient;
    if (!sb) return null;
    var res = await sb.from('learn_slo_articles').select('*').eq('id', id).single();
    return res.data || null;
  } catch(e) { return null; }
}

function openLearnSLO() {
  var existing = document.getElementById('mh-learn-hub');
  if (existing) existing.remove();

  if (!document.getElementById('learn-hub-css')) {
    var s = document.createElement('style');
    s.id = 'learn-hub-css';
    s.textContent = [
      '.ls-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(139,92,246,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.ls-filter.active{background:rgba(139,92,246,0.15);border-color:#8b5cf6;color:#c4b5fd}',
      '.ls-card{padding:16px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:10px;cursor:pointer;transition:all 0.15s;-webkit-tap-highlight-color:transparent}',
      '.ls-card:active{transform:scale(0.98);background:rgba(139,92,246,0.06)}',
      '.ls-article-body{font-size:14px;line-height:1.85;color:rgba(255,255,255,0.75)}',
      '.ls-article-body p{margin:0 0 16px 0}',
    ].join('');
    document.head.appendChild(s);
  }

  _learnCat = 'all';

  var hub = document.createElement('div');
  hub.id = 'mh-learn-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(139,92,246,0.08) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeLearnSLO()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:2px;text-transform:uppercase">DTSLO</div>' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">📚 Learn SLO</div>' +
        '</div>' +
        '<button onclick="closeLearnSLO()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        LEARN_CATS.map(function(c, i) {
          return '<button class="ls-filter' + (i===0?' active':'') + '" data-lcat="' + c.id + '" onclick="learnSetCat(this,this.dataset.lcat)">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="learn-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      learnRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('learn_slo');

  learnLoadArticles('all').then(function(data) {
    _learnArticles = data;
    var c = document.getElementById('learn-content');
    if (c) c.innerHTML = learnRenderList(data);
  });
}
window.openLearnSLO = openLearnSLO;
window.menuHomeOpenLearnSLO = openLearnSLO;

function closeLearnSLO() {
  hubDeactivateMapMode();
  tipsRemoveButton('learn_slo');
  var h = document.getElementById('mh-learn-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeLearnSLO = closeLearnSLO;

function learnSetCat(el, cat) {
  _learnCat = cat;
  document.querySelectorAll('.ls-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('learn-content');
  if (c) c.innerHTML = learnRenderLoading();
  learnLoadArticles(cat).then(function(data) {
    _learnArticles = data;
    if (c) c.innerHTML = learnRenderList(data);
  });
}
window.learnSetCat = learnSetCat;

function learnRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:10px">' +
    [1,2,3].map(function() {
      return '<div style="height:100px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)"></div>';
    }).join('') + '</div>';
}

function learnRenderList(articles) {
  if (!articles.length) return '<div style="text-align:center;padding:48px;color:rgba(255,255,255,0.3);font-size:13px">No articles in this category yet.</div>';
  return articles.map(function(a) {
    return '<div class="ls-card" data-lid="' + a.id + '" onclick="learnOpenArticle(this.dataset.lid)">' +
      '<div style="display:flex;gap:12px;align-items:flex-start">' +
        '<div style="font-size:32px;flex-shrink:0;line-height:1;margin-top:2px">' + learnEmoji(a.emoji) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:15px;font-weight:800;margin-bottom:4px;line-height:1.3">' + a.title + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:8px">' + (a.summary||'').substring(0,100) + (a.summary && a.summary.length>100?'…':'') + '</div>' +
          '<div style="display:flex;gap:8px;align-items:center">' +
            '<span style="font-size:10px;color:rgba(139,92,246,0.8);font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2)">' + (a.category||'').replace('_',' ') + '</span>' +
            '<span style="font-size:10px;color:rgba(255,255,255,0.35)">⏱ ' + (a.read_time||5) + ' min read</span>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:14px;color:rgba(139,92,246,0.6);flex-shrink:0">›</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function learnOpenArticle(id) {
  var hub = document.getElementById('mh-learn-hub');
  if (!hub) return;

  var content = document.getElementById('learn-content');
  if (content) content.innerHTML = learnRenderLoading();

  var article = await learnLoadArticle(id);
  if (!article) {
    if (content) content.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.4)">Article not found.</div>';
    return;
  }

  // Convert newlines to paragraphs
  var bodyHtml = article.content.split('\n\n').map(function(p) {
    return '<p>' + p.trim() + '</p>';
  }).join('');

  if (content) content.innerHTML =
    '<button onclick="learnBackToList()" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;padding:0;margin-bottom:16px">← Back to articles</button>' +
    '<div style="font-size:32px;margin-bottom:10px">' + learnEmoji(article.emoji) + '</div>' +
    '<div style="font-size:10px;color:rgba(139,92,246,0.7);font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">' + (article.category||'').replace('_',' ') + ' · ' + (article.read_time||5) + ' min read</div>' +
    '<div style="font-size:22px;font-weight:900;font-family:Georgia,serif;line-height:1.3;margin-bottom:16px">' + article.title + '</div>' +
    '<div style="padding:12px 14px;border-radius:12px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.15);margin-bottom:20px">' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;font-style:italic">' + (article.summary||'') + '</div>' +
    '</div>' +
    '<div class="ls-article-body">' + bodyHtml + '</div>' +
    '<div style="margin-top:24px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);line-height:1.6;text-align:center">Content researched and written for DTSLO. Information is accurate to the best of our knowledge but may not reflect recent changes.</div>' +
    '<button onclick="learnBackToList()" style="width:100%;margin-top:16px;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">← Back to Articles</button>';
}
window.learnOpenArticle = learnOpenArticle;

function learnBackToList() {
  var c = document.getElementById('learn-content');
  if (c) c.innerHTML = learnRenderList(_learnArticles);
}
window.learnBackToList = learnBackToList;
