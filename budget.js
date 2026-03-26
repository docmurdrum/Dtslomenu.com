// ══════════════════════════════════════════════
// BUDGET.JS — Budget Calculator + Goals + Rewards
// ══════════════════════════════════════════════

var budgetState = {
  monthly: 0,
  perNight: 0,
  category: 'nights_out',
  nightsPerMonth: 4,
  saved: [],
};

function openBudgetCalculator() {
  var existing = document.getElementById('budget-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'budget-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:8100;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center';

  modal.innerHTML =
    '<div id="budget-inner" style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:28px 28px 0 0;border-top:2px solid rgba(34,197,94,0.3);padding:16px 22px 52px;max-height:92vh;overflow-y:auto;transform:translateY(30px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="closeBudgetCalculator()"></div>' +

      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
        '<div style="font-size:28px">💰</div>' +
        '<div><div style="font-size:20px;font-weight:800;font-family:Georgia,serif">Budget Calculator</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Track spending · Set goals · Earn rewards</div></div>' +
      '</div>' +

      // Monthly budget input
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">MONTHLY BUDGET</div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
        '<div style="font-size:28px;font-weight:900;color:#22c55e">$</div>' +
        '<input id="bc-monthly" type="number" min="0" max="9999" placeholder="200" style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:12px 16px;color:white;font-size:24px;font-weight:800;font-family:inherit;outline:none;-moz-appearance:textfield" oninput="bcUpdate()">' +
      '</div>' +

      // Nights per month
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin:14px 0 8px">NIGHTS OUT PER MONTH</div>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">' +
        '<input type="range" id="bc-nights" min="1" max="20" value="4" style="flex:1;accent-color:#22c55e" oninput="bcUpdate()">' +
        '<div id="bc-nights-val" style="font-size:20px;font-weight:900;color:#22c55e;min-width:28px">4</div>' +
      '</div>' +

      // Per-night breakdown
      '<div id="bc-breakdown" style="padding:14px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:14px;margin:14px 0">' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.4)">Per night budget</div>' +
        '<div id="bc-per-night" style="font-size:32px;font-weight:900;color:#22c55e">$0</div>' +
        '<div id="bc-per-night-note" style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px">Enter a monthly budget above</div>' +
      '</div>' +

      // Spend categories
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">SPENDING BREAKDOWN</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px" id="bc-categories">' +
        bcCategoryRow('Drinks', 'drinks', 40) +
        bcCategoryRow('Food', 'food', 25) +
        bcCategoryRow('Cover', 'cover', 10) +
        bcCategoryRow('Ride', 'ride', 20) +
        bcCategoryRow('Other', 'other', 5) +
      '</div>' +

      // Goals section
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">GOALS</div>' +
      '<div id="bc-goals-list" style="margin-bottom:12px">' +
        bcDefaultGoals() +
      '</div>' +

      // Progress (loaded if logged in)
      '<div id="bc-progress-section" style="display:none">' +
        '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">THIS MONTH</div>' +
        '<div id="bc-progress-content"></div>' +
      '</div>' +

      // Buttons
      '<div style="display:flex;gap:10px;margin-top:4px">' +
        '<button onclick="closeBudgetCalculator()" style="flex:1;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Close</button>' +
        '<button onclick="saveBudget()" style="flex:1;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer">Save Budget →</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target===modal) closeBudgetCalculator(); });
  setTimeout(function() {
    document.getElementById('budget-inner').style.transform = 'translateY(0)';
  }, 30);

  // Load saved budget if exists
  bcLoadSaved();
}

function bcCategoryRow(label, id, defaultPct) {
  return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06)">' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.5);min-width:50px">' + label + '</div>' +
    '<input type="range" id="bc-cat-' + id + '" min="0" max="80" value="' + defaultPct + '" style="flex:1;accent-color:#22c55e;height:4px" oninput="bcUpdate()">' +
    '<div id="bc-cat-' + id + '-val" style="font-size:12px;font-weight:700;color:#22c55e;min-width:36px;text-align:right">' + defaultPct + '%</div>' +
    '<div id="bc-cat-' + id + '-amt" style="font-size:11px;color:rgba(255,255,255,0.3);min-width:32px;text-align:right">$0</div>' +
  '</div>';
}

function bcDefaultGoals() {
  var goals = [
    {id:'under_budget', label:'Stay under budget this month', reward:50, icon:'🎯'},
    {id:'track_3', label:'Track 3 nights in a row', reward:25, icon:'📅'},
    {id:'save_10', label:'Spend 10% under budget', reward:75, icon:'💎'},
    {id:'no_cover', label:'Have a cover-free night out', reward:10, icon:'🆓'},
  ];
  return goals.map(function(g) {
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-bottom:6px">' +
      '<div style="font-size:20px">' + g.icon + '</div>' +
      '<div style="flex:1"><div style="font-size:12px;font-weight:700">' + g.label + '</div></div>' +
      '<div style="text-align:right;flex-shrink:0"><div style="font-size:11px;font-weight:800;color:#ffd700">+' + g.reward + ' 🪙</div></div>' +
    '</div>';
  }).join('');
}

function bcUpdate() {
  var monthly = parseFloat(document.getElementById('bc-monthly')?.value) || 0;
  var nights  = parseInt(document.getElementById('bc-nights')?.value) || 4;
  document.getElementById('bc-nights-val').textContent = nights;

  var perNight = nights > 0 ? (monthly / nights) : 0;
  var pnEl = document.getElementById('bc-per-night');
  var noteEl = document.getElementById('bc-per-night-note');

  if (pnEl) pnEl.textContent = '$' + perNight.toFixed(0);
  if (noteEl) {
    if (monthly === 0) { noteEl.textContent = 'Enter a monthly budget above'; }
    else if (perNight < 20) { noteEl.textContent = 'Tight but doable — stick to drink specials'; }
    else if (perNight < 50) { noteEl.textContent = 'Solid budget for a good night out'; }
    else if (perNight < 100) { noteEl.textContent = 'Comfortable — room for food and extras'; }
    else { noteEl.textContent = 'Splurge budget — treat yourself'; }
  }

  // Update category breakdowns
  var cats = ['drinks','food','cover','ride','other'];
  cats.forEach(function(c) {
    var pct = parseInt(document.getElementById('bc-cat-' + c)?.value) || 0;
    var amt = (perNight * pct / 100);
    var valEl = document.getElementById('bc-cat-' + c + '-val');
    var amtEl = document.getElementById('bc-cat-' + c + '-amt');
    if (valEl) valEl.textContent = pct + '%';
    if (amtEl) amtEl.textContent = '$' + amt.toFixed(0);
  });

  budgetState.monthly = monthly;
  budgetState.perNight = perNight;
  budgetState.nightsPerMonth = nights;
}
window.bcUpdate = bcUpdate;

function bcLoadSaved() {
  // Load from localStorage first (fast), then sync from Supabase
  var saved = localStorage.getItem('dtslo_budget');
  if (saved) {
    try {
      var b = JSON.parse(saved);
      var monthlyEl = document.getElementById('bc-monthly');
      var nightsEl  = document.getElementById('bc-nights');
      if (monthlyEl && b.monthly) monthlyEl.value = b.monthly;
      if (nightsEl  && b.nights)  nightsEl.value  = b.nights;
      // Restore category sliders
      if (b.cats) {
        Object.keys(b.cats).forEach(function(c) {
          var el = document.getElementById('bc-cat-' + c);
          if (el) el.value = b.cats[c];
        });
      }
      bcUpdate();
      // Show progress section
      if (b.monthly > 0) bcShowProgress(b);
    } catch(e) {}
  }
}

function bcShowProgress(budget) {
  var section = document.getElementById('bc-progress-section');
  var content = document.getElementById('bc-progress-content');
  if (!section || !content) return;
  section.style.display = 'block';

  // Pull tracked spend from localStorage
  var tracked = JSON.parse(localStorage.getItem('dtslo_spend_log') || '[]');
  var now = new Date();
  var monthSpend = tracked.filter(function(t) {
    var d = new Date(t.date);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).reduce(function(sum,t) { return sum + (t.amount||0); }, 0);

  var pct = budget.monthly > 0 ? Math.min(100, (monthSpend / budget.monthly) * 100) : 0;
  var remaining = Math.max(0, budget.monthly - monthSpend);
  var barColor = pct < 70 ? '#22c55e' : pct < 90 ? '#f59e0b' : '#ef4444';

  content.innerHTML =
    '<div style="margin-bottom:12px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.5)">Spent this month</div>' +
        '<div style="font-size:12px;font-weight:800;color:' + barColor + '">$' + monthSpend.toFixed(0) + ' / $' + budget.monthly + '</div>' +
      '</div>' +
      '<div style="height:8px;border-radius:4px;background:rgba(255,255,255,0.08);overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:' + barColor + ';border-radius:4px;transition:width 0.6s ease"></div>' +
      '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:4px">$' + remaining.toFixed(0) + ' remaining</div>' +
    '</div>' +
    '<button onclick="bcLogNight()" style="width:100%;padding:11px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.6);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:8px">+ Log a Night Out</button>';
}

function bcLogNight() {
  var amount = prompt('How much did you spend tonight? ($)');
  if (!amount || isNaN(parseFloat(amount))) return;
  var log = JSON.parse(localStorage.getItem('dtslo_spend_log') || '[]');
  log.push({ amount: parseFloat(amount), date: new Date().toISOString() });
  localStorage.setItem('dtslo_spend_log', JSON.stringify(log));
  bcCheckGoals(log);
  var saved = JSON.parse(localStorage.getItem('dtslo_budget') || '{}');
  bcShowProgress(saved);
  if (typeof showToast === 'function') showToast('📝 Night logged — $' + parseFloat(amount).toFixed(0));
}
window.bcLogNight = bcLogNight;

function bcCheckGoals(log) {
  var budget = JSON.parse(localStorage.getItem('dtslo_budget') || '{}');
  if (!budget.monthly) return;

  var now = new Date();
  var monthSpend = log.filter(function(t) {
    var d = new Date(t.date);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).reduce(function(sum,t) { return sum + (t.amount||0); }, 0);

  var achieved = JSON.parse(localStorage.getItem('dtslo_budget_goals') || '{}');

  // Check: stay under budget
  if (!achieved.under_budget && monthSpend <= budget.monthly && log.length >= budget.nights) {
    achieved.under_budget = true;
    bcAwardGoal('Stayed under budget!', 50);
  }
  // Check: save 10%
  if (!achieved.save_10 && monthSpend <= budget.monthly * 0.9) {
    achieved.save_10 = true;
    bcAwardGoal('Spent 10% under budget!', 75);
  }

  localStorage.setItem('dtslo_budget_goals', JSON.stringify(achieved));
}

function bcAwardGoal(label, mennys) {
  if (typeof showToast === 'function') showToast('🎉 Goal achieved: ' + label + ' +' + mennys + ' 🪙');
  // Award XP
  if (typeof addXP === 'function') addXP(mennys / 5);
}

async function saveBudget() {
  var monthly = parseFloat(document.getElementById('bc-monthly')?.value) || 0;
  var nights  = parseInt(document.getElementById('bc-nights')?.value) || 4;
  var cats = {};
  ['drinks','food','cover','ride','other'].forEach(function(c) {
    cats[c] = parseInt(document.getElementById('bc-cat-' + c)?.value) || 0;
  });

  var budget = { monthly: monthly, nights: nights, cats: cats, saved_at: Date.now() };

  // Save to localStorage (immediate)
  localStorage.setItem('dtslo_budget', JSON.stringify(budget));

  // Save to Supabase if logged in
  if (typeof currentUser !== 'undefined' && currentUser && typeof supabaseClient !== 'undefined') {
    try {
      await supabaseClient.from('profiles').update({
        budget_settings: JSON.stringify(budget)
      }).eq('id', currentUser.id);
      if (typeof showToast === 'function') showToast('✅ Budget saved to your profile!');
    } catch(e) {
      if (typeof showToast === 'function') showToast('✅ Budget saved locally');
    }
  } else {
    if (typeof showToast === 'function') showToast('✅ Budget saved!');
  }

  bcShowProgress(budget);
  setTimeout(closeBudgetCalculator, 800);
}
window.saveBudget = saveBudget;

function closeBudgetCalculator() {
  var modal = document.getElementById('budget-modal');
  if (modal) {
    var inner = document.getElementById('budget-inner');
    if (inner) inner.style.transform = 'translateY(100%)';
    setTimeout(function() { modal.remove(); }, 350);
  }
}
window.closeBudgetCalculator = closeBudgetCalculator;
window.openBudgetCalculator = openBudgetCalculator;
