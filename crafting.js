// ══════════════════════════════════════════════
// CRAFTING.JS — Materials + Item Crafting System
// ══════════════════════════════════════════════

var MATERIAL_DEFS = {
  bar_token:      { label:'Bar Token',        emoji:'🍺', color:'#f59e0b', desc:'Earned by checking in at bars' },
  xp_shard:       { label:'XP Shard',         emoji:'⚡', color:'#06b6d4', desc:'Drops when you gain XP' },
  event_ticket:   { label:'Event Ticket',     emoji:'🎟', color:'#b44fff', desc:'Attend SLO events to collect' },
  game_chip:      { label:'Game Chip',        emoji:'🎮', color:'#22c55e', desc:'Win bar games to earn chips' },
  menny_fragment: { label:'Menny Fragment',   emoji:'🪙', color:'#ffd700', desc:'Fragment when you spend Mennys' },
};

// Rarity colors
var RARITY_COLORS = {
  common:    '#aaaacc',
  uncommon:  '#22c55e',
  rare:      '#06b6d4',
  legendary: '#ffd700',
};

// ── MATERIALS WALLET (localStorage + Supabase) ──

async function getMaterials() {
  // Load from localStorage first
  var local = JSON.parse(localStorage.getItem('dtslo_materials') || '{}');
  // Try sync from Supabase if logged in
  if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseClient !== 'undefined') {
    try {
      var res = await supabaseClient.from('player_materials').select('material,quantity').eq('user_id', currentUser.id);
      if (res.data) {
        res.data.forEach(function(row) { local[row.material] = row.quantity; });
        localStorage.setItem('dtslo_materials', JSON.stringify(local));
      }
    } catch(e) {}
  }
  return local;
}

async function addMaterial(materialKey, qty, source) {
  qty = qty || 1;
  var wallet = JSON.parse(localStorage.getItem('dtslo_materials') || '{}');
  wallet[materialKey] = (wallet[materialKey] || 0) + qty;
  localStorage.setItem('dtslo_materials', JSON.stringify(wallet));

  // Sync to Supabase
  if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseClient !== 'undefined') {
    try {
      await supabaseClient.from('player_materials').upsert({
        user_id: currentUser.id,
        material: materialKey,
        quantity: wallet[materialKey],
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,material' });
    } catch(e) {}
  }

  var def = MATERIAL_DEFS[materialKey.replace(/_[a-z_]+$/, '')] || MATERIAL_DEFS[materialKey] || { emoji:'🔮', label:materialKey };
  if (typeof showToast === 'function') showToast(def.emoji + ' +' + qty + ' ' + def.label + '!');
}
window.addMaterial = addMaterial;

// ── AWARD MATERIALS FROM GAME EVENTS ──

function awardBarCheckIn(barId) {
  var key = 'bar_token_' + (barId || 'generic');
  addMaterial(key, 1, 'checkin');
  // Generic bar token too
  addMaterial('bar_token', 1, 'checkin');
}
window.awardBarCheckIn = awardBarCheckIn;

function awardGameWin() {
  addMaterial('game_chip', 1, 'game_win');
}
window.awardGameWin = awardGameWin;

function awardXPShard(xpAmount) {
  var shards = Math.floor((xpAmount || 10) / 10);
  if (shards > 0) addMaterial('xp_shard', shards, 'xp_gain');
}
window.awardXPShard = awardXPShard;

function awardEventTicket() {
  addMaterial('event_ticket', 1, 'event');
}
window.awardEventTicket = awardEventTicket;

function awardMennyFragment(amount) {
  var frags = Math.floor((amount || 5) / 5);
  if (frags > 0) addMaterial('menny_fragment', frags, 'menny_spend');
}
window.awardMennyFragment = awardMennyFragment;

// ── INVENTORY ──

async function getInventory() {
  var local = JSON.parse(localStorage.getItem('dtslo_inventory') || '[]');
  if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseClient !== 'undefined') {
    try {
      var res = await supabaseClient
        .from('player_inventory')
        .select('*, reward_items(*)')
        .eq('user_id', currentUser.id);
      if (res.data) {
        local = res.data;
        localStorage.setItem('dtslo_inventory', JSON.stringify(local));
      }
    } catch(e) {}
  }
  return local;
}

async function awardItem(itemId, source) {
  if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseClient !== 'undefined') {
    try {
      await supabaseClient.from('player_inventory').insert({
        user_id: currentUser.id,
        item_id: itemId,
        source: source || 'earned',
        earned_at: new Date().toISOString()
      });
    } catch(e) {}
  }
  // Also in localStorage
  var inv = JSON.parse(localStorage.getItem('dtslo_inventory') || '[]');
  inv.push({ item_id: itemId, source, earned_at: Date.now() });
  localStorage.setItem('dtslo_inventory', JSON.stringify(inv));
}
window.awardItem = awardItem;

// ── CRAFTING BENCH UI ──

async function openCraftingBench() {
  var existing = document.getElementById('crafting-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'crafting-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:8200;background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center';

  modal.innerHTML =
    '<div id="crafting-inner" style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:28px 28px 0 0;border-top:2px solid rgba(180,79,255,0.4);padding:16px 20px 52px;max-height:90vh;overflow-y:auto;transform:translateY(30px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 14px;cursor:pointer" onclick="closeCraftingBench()"></div>' +

      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
        '<div style="font-size:28px">⚗️</div>' +
        '<div><div style="font-size:20px;font-weight:800;font-family:Georgia,serif">Crafting Bench</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Combine materials to forge items</div></div>' +
        '<button onclick="closeCraftingBench()" style="margin-left:auto;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +

      // Tabs
      '<div style="display:flex;gap:6px;margin-bottom:16px">' +
        '<button class="crafting-tab active" onclick="craftingTab(this,\'materials\')" data-tab="materials">🧪 Materials</button>' +
        '<button class="crafting-tab" onclick="craftingTab(this,\'recipes\')" data-tab="recipes">📜 Recipes</button>' +
        '<button class="crafting-tab" onclick="craftingTab(this,\'inventory\')" data-tab="inventory">🎒 Inventory</button>' +
      '</div>' +

      '<div id="crafting-content"><div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3)">Loading...</div></div>' +
    '</div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) closeCraftingBench(); });

  // Inject CSS
  if (!document.getElementById('crafting-css')) {
    var s = document.createElement('style');
    s.id = 'crafting-css';
    s.textContent = [
      '.crafting-tab{padding:8px 16px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.crafting-tab.active{background:rgba(180,79,255,0.15);border-color:rgba(180,79,255,0.5);color:#b44fff}',
      '.mat-card{padding:12px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;display:flex;align-items:center;gap:12px;margin-bottom:8px}',
      '.recipe-card{padding:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;margin-bottom:10px}',
      '.craft-btn{padding:10px 16px;border-radius:12px;border:none;font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer}',
      '.craft-btn.can-craft{background:linear-gradient(135deg,#b44fff,#7c3aed);color:white}',
      '.craft-btn.cannot-craft{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.3)}',
    ].join('');
    document.head.appendChild(s);
  }

  setTimeout(function() {
    document.getElementById('crafting-inner').style.transform = 'translateY(0)';
    craftingLoadTab('materials');
  }, 30);
}
window.openCraftingBench = openCraftingBench;

function closeCraftingBench() {
  var modal = document.getElementById('crafting-modal');
  if (!modal) return;
  var inner = document.getElementById('crafting-inner');
  if (inner) inner.style.transform = 'translateY(100%)';
  setTimeout(function() { modal.remove(); }, 350);
}
window.closeCraftingBench = closeCraftingBench;

function craftingTab(el, tab) {
  document.querySelectorAll('.crafting-tab').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  craftingLoadTab(tab);
}
window.craftingTab = craftingTab;

async function craftingLoadTab(tab) {
  var content = document.getElementById('crafting-content');
  if (!content) return;
  content.innerHTML = '<div style="text-align:center;padding:30px;color:rgba(255,255,255,0.3);font-size:13px">Loading...</div>';

  if (tab === 'materials') {
    var wallet = await getMaterials();
    var html = '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">YOUR MATERIALS</div>';

    // Show all material types
    var shown = false;
    Object.keys(MATERIAL_DEFS).forEach(function(key) {
      var def = MATERIAL_DEFS[key];
      var qty = wallet[key] || 0;
      shown = true;
      html += '<div class="mat-card">' +
        '<div style="font-size:28px;flex-shrink:0">' + def.emoji + '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:800">' + def.label + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + def.desc + '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div style="font-size:22px;font-weight:900;color:' + def.color + '">' + qty + '</div>' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3)">owned</div>' +
        '</div>' +
      '</div>';
    });

    // Bar-specific tokens
    var barKeys = Object.keys(wallet).filter(function(k) { return k.startsWith('bar_token_'); });
    if (barKeys.length) {
      html += '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin:14px 0 8px">BAR TOKENS</div>';
      barKeys.forEach(function(key) {
        var barName = key.replace('bar_token_','').replace(/_/g,' ');
        html += '<div class="mat-card">' +
          '<div style="font-size:24px">🍺</div>' +
          '<div style="flex:1"><div style="font-size:13px;font-weight:800">' + barName.charAt(0).toUpperCase() + barName.slice(1) + ' Token</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">From checking in at ' + barName + '</div></div>' +
          '<div style="font-size:22px;font-weight:900;color:#f59e0b">' + wallet[key] + '</div>' +
        '</div>';
      });
    }

    html += '<div style="margin-top:16px;padding:12px;background:rgba(180,79,255,0.06);border:1px solid rgba(180,79,255,0.15);border-radius:12px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.6">' +
      '💡 Check in at bars, win games, and attend events to collect more materials.' +
    '</div>';

    content.innerHTML = html;

  } else if (tab === 'recipes') {
    // Load craftable items from Supabase
    var recipes = [];
    if (typeof supabaseClient !== 'undefined') {
      try {
        var res = await supabaseClient.from('reward_items').select('*').eq('source','craft').eq('is_active',true);
        recipes = res.data || [];
      } catch(e) {}
    }

    var wallet2 = await getMaterials();

    if (!recipes.length) {
      content.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No craft recipes available yet</div>';
      return;
    }

    content.innerHTML = recipes.map(function(item) {
      var recipe = [];
      try { recipe = JSON.parse(item.craft_recipe || '[]'); } catch(e) {}
      var color = RARITY_COLORS[item.rarity] || '#aaaacc';

      var canCraft = recipe.every(function(req) {
        return (wallet2[req.material] || 0) >= req.qty;
      });

      var ingredientHtml = recipe.map(function(req) {
        var def = MATERIAL_DEFS[req.material] || { emoji:'🔮', label:req.material };
        var have = wallet2[req.material] || 0;
        var ok = have >= req.qty;
        return '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:' + (ok?'#22c55e':'rgba(255,255,255,0.4)') + '">' +
          def.emoji + ' ' + req.qty + 'x ' + def.label +
          ' <span style="color:rgba(255,255,255,0.25)">(' + have + ' owned)</span>' +
        '</div>';
      }).join('');

      return '<div class="recipe-card">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<div style="font-size:32px">' + (item.emoji||'🎁') + '</div>' +
          '<div style="flex:1">' +
            '<div style="font-size:15px;font-weight:800">' + item.name + '</div>' +
            '<div style="font-size:10px;font-weight:700;color:' + color + '">' + (item.rarity||'').toUpperCase() + '</div>' +
            (item.description ? '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">' + item.description + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">' + ingredientHtml + '</div>' +
        '<button class="craft-btn ' + (canCraft?'can-craft':'cannot-craft') + '" onclick="craftItem(' + item.id + ')" ' + (canCraft?'':'disabled') + '>' +
          (canCraft ? '⚗️ Craft Now' : '🔒 Missing materials') +
        '</button>' +
      '</div>';
    }).join('');

  } else if (tab === 'inventory') {
    var inv = await getInventory();

    if (!inv.length) {
      content.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No items yet — craft or earn your first item!</div>';
      return;
    }

    content.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">' +
      inv.map(function(entry) {
        var item = entry.reward_items || entry;
        var color = RARITY_COLORS[item.rarity] || '#aaaacc';
        return '<div style="padding:12px 8px;background:rgba(255,255,255,0.04);border:1px solid ' + color + '33;border-radius:14px;text-align:center">' +
          '<div style="font-size:32px;margin-bottom:6px">' + (item.emoji||'🎁') + '</div>' +
          '<div style="font-size:11px;font-weight:800;color:rgba(255,255,255,0.8)">' + (item.name||'Item') + '</div>' +
          '<div style="font-size:9px;font-weight:700;color:' + color + ';margin-top:3px">' + (item.rarity||'').toUpperCase() + '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }
}
window.craftingLoadTab = craftingLoadTab;

async function craftItem(itemId) {
  // Load item
  var item = null;
  try {
    var res = await supabaseClient.from('reward_items').select('*').eq('id', itemId).single();
    item = res.data;
  } catch(e) { showToast('❌ Could not load item'); return; }

  var recipe = [];
  try { recipe = JSON.parse(item.craft_recipe || '[]'); } catch(e) {}

  var wallet = await getMaterials();

  // Check requirements
  for (var i = 0; i < recipe.length; i++) {
    if ((wallet[recipe[i].material] || 0) < recipe[i].qty) {
      showToast('❌ Not enough ' + (MATERIAL_DEFS[recipe[i].material]||{label:recipe[i].material}).label);
      return;
    }
  }

  // Deduct materials
  recipe.forEach(function(req) {
    wallet[req.material] = (wallet[req.material] || 0) - req.qty;
  });
  localStorage.setItem('dtslo_materials', JSON.stringify(wallet));

  // Sync materials to Supabase
  if (typeof currentUser !== 'undefined' && currentUser) {
    try {
      var upserts = Object.keys(wallet).map(function(mat) {
        return { user_id: currentUser.id, material: mat, quantity: wallet[mat] };
      });
      await supabaseClient.from('player_materials').upsert(upserts, { onConflict: 'user_id,material' });
    } catch(e) {}
  }

  // Award item
  await awardItem(itemId, 'crafted');

  // Celebrate
  showToast('⚗️ Crafted: ' + (item.emoji||'🎁') + ' ' + item.name + '!');
  if (typeof addXP === 'function') addXP(25);
  craftingLoadTab('recipes');
}
window.craftItem = craftItem;
