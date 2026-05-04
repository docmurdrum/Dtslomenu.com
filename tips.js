// ══════════════════════════════════════════════
// TIPS.JS — Context-aware hub tips system
// Floating 💡 button · Supabase-driven · Profile-aware
// ══════════════════════════════════════════════

var _tipsCache = {};

// Get current user profile: 'student' | 'resident' | 'visitor' | 'all'
function tipsGetProfile() {
  try {
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.user_metadata) {
      return currentUser.user_metadata.profile || 'visitor';
    }
  } catch(e) {}
  return 'visitor';
}

// Load tips from Supabase for a given hub + profile
async function tipsLoad(hubId) {
  var profile = tipsGetProfile();
  var cacheKey = hubId + '_' + profile;
  if (_tipsCache[cacheKey]) return _tipsCache[cacheKey];

  try {
    var sb = window.supabaseClient;
    if (!sb) return [];
    var res = await sb
      .from('hub_tips')
      .select('id, tip, emoji, sort_order')
      .eq('hub_id', hubId)
      .eq('active', true)
      .in('profile', ['all', profile])
      .order('sort_order', { ascending: true })
      .limit(10);
    if (res.error || !res.data) return [];
    _tipsCache[cacheKey] = res.data;
    return res.data;
  } catch(e) {
    console.warn('[Tips] load failed:', e);
    return [];
  }
}

// Emoji map from text keys stored in DB to actual emojis
var TIPS_EMOJI_MAP = {
  'bulb':'💡','clock':'⏰','car':'🚗','map':'🗺','star':'⭐','walk':'🚶','food':'🍽',
  'calendar':'📅','beer':'🍺','dog':'🐾','music':'🎵','wave':'🌊','bike':'🚴','warning':'⚠️',
  'water':'💧','flower':'🌸','mountain':'⛰️','graduation':'🎓','bus':'🚌','book':'📚',
  'gym':'🏋️','heart':'❤️','home':'🏠','money':'💰','link':'🔗','computer':'💻',
  'wind':'💨','camera':'📷','phone':'📱','search':'🔍','fire':'🔥','check':'✅',
};

function tipsEmoji(key) {
  return TIPS_EMOJI_MAP[key] || '💡';
}

// Inject the floating tips button into a hub container
function tipsInjectButton(hubId, containerId) {
  // Remove any existing tips button/sheet for this hub
  var oldBtn = document.getElementById('hub-tips-btn-' + hubId);
  if (oldBtn) oldBtn.remove();

  var btn = document.createElement('button');
  btn.id = 'hub-tips-btn-' + hubId;
  btn.setAttribute('data-tipshub', hubId);
  btn.onclick = function() { hubTipsOpen(this.getAttribute('data-tipshub')); };
  btn.style.cssText = [
    'position:fixed',
    'bottom:80px',
    'right:16px',
    'z-index:10500',
    'width:44px',
    'height:44px',
    'border-radius:22px',
    'background:rgba(255,215,0,0.15)',
    'border:1px solid rgba(255,215,0,0.35)',
    'color:#ffd700',
    'font-size:20px',
    'cursor:pointer',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
    'transition:transform 0.15s',
    '-webkit-tap-highlight-color:transparent',
  ].join(';');
  btn.innerHTML = '💡';
  btn.addEventListener('touchstart', function() { this.style.transform = 'scale(0.92)'; }, { passive: true });
  btn.addEventListener('touchend', function() { this.style.transform = 'scale(1)'; }, { passive: true });

  // Append to hub parent so it stacks correctly
  getHubParent().appendChild(btn);
}

// Remove tips button for a hub (call on hub close)
function tipsRemoveButton(hubId) {
  var btn = document.getElementById('hub-tips-btn-' + hubId);
  if (btn) btn.remove();
  var sheet = document.getElementById('hub-tips-sheet');
  if (sheet) sheet.remove();
}
window.tipsRemoveButton = tipsRemoveButton;

// Open the tips bottom sheet
async function hubTipsOpen(hubId) {
  var existing = document.getElementById('hub-tips-sheet');
  if (existing) { existing.remove(); return; } // toggle off if already open

  var sheet = document.createElement('div');
  sheet.id = 'hub-tips-sheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:10600;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.25s';

  var inner = document.createElement('div');
  inner.style.cssText = 'width:100%;background:rgba(10,10,22,0.99);border-radius:20px 20px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:14px 20px 48px;max-height:70vh;overflow-y:auto;transform:translateY(16px);transition:transform 0.3s cubic-bezier(0.34,1.1,0.64,1)';
  inner.innerHTML = '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px"></div>' +
    '<div style="font-size:15px;font-weight:800;font-family:Georgia,serif;margin-bottom:14px;color:#ffd700">💡 Tips</div>' +
    '<div id="hub-tips-list" style="font-size:13px;color:rgba(255,255,255,0.5)">Loading...</div>';

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);

  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
  }, 20);

  sheet.addEventListener('click', function(e) {
    if (e.target === sheet) {
      sheet.style.opacity = '0';
      setTimeout(function() { sheet.remove(); }, 250);
    }
  });

  // Load tips
  var tips = await tipsLoad(hubId);
  var list = document.getElementById('hub-tips-list');
  if (!list) return;

  if (!tips.length) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:12px">No tips available yet for this hub.</div>';
    return;
  }

  list.innerHTML = tips.map(function(t) {
    return '<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
      '<div style="font-size:18px;flex-shrink:0;margin-top:1px">' + tipsEmoji(t.emoji) + '</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.55">' + t.tip + '</div>' +
    '</div>';
  }).join('');
}
window.hubTipsOpen = hubTipsOpen;
window.tipsInjectButton = tipsInjectButton;
