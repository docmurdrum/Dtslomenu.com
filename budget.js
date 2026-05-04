// ══════════════════════════════════════════════
// BUDGET.JS — SLO Budget Pro
// Full premium budget app — 7 tabs
// ══════════════════════════════════════════════

var budgetData = {
  income: 0,
  budgets: { housing: 0, food: 0, transport: 0, entertainment: 0, shopping: 0, health: 0, savings: 0, other: 0 },
  expenses: [],
  goals: [],
  activeChallenge: null,
  streak: 0,
  preset: null,
  notifs: { master: false, budget: false, weekly: false, streak: false, bills: false, insights: false },
  activeTab: 'Dashboard',
  showAddExpense: false,
  newExp: { desc: '', amount: '', category: 'food' },
};

var BUDGET_CATS = [
  { id: 'housing', label: 'Housing', emoji: '🏠', color: '#6366f1' },
  { id: 'food', label: 'Food & Dining', emoji: '🍽', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', emoji: '🚗', color: '#06b6d4' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎭', color: '#ec4899' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍', color: '#10b981' },
  { id: 'health', label: 'Health', emoji: '🏥', color: '#f97316' },
  { id: 'savings', label: 'Savings', emoji: '💰', color: '#ffd700' },
  { id: 'other', label: 'Other', emoji: '📦', color: '#8b5cf6' },
];

var BUDGET_PRESETS = [
  { id: 'student', label: 'Cal Poly Student', emoji: '🎓', income: 1200, budgets: { housing: 700, food: 250, transport: 80, entertainment: 100, shopping: 50, health: 20, savings: 0, other: 0 } },
  { id: 'resident', label: 'SLO Resident', emoji: '🏡', income: 4500, budgets: { housing: 1800, food: 600, transport: 300, entertainment: 300, shopping: 200, health: 150, savings: 500, other: 350 } },
  { id: 'visitor', label: 'Weekend Visitor', emoji: '🧳', income: 0, budgets: { housing: 300, food: 150, transport: 80, entertainment: 120, shopping: 100, health: 0, savings: 0, other: 50 } },
];

var BUDGET_CHALLENGES = [
  { id: 'noUber', label: 'No Uber Week', emoji: '🚶', desc: 'Walk or transit only for 7 days', reward: '🏅 Green Commuter' },
  { id: 'cookHome', label: 'Cook at Home', emoji: '🍳', desc: '5 home-cooked meals this week', reward: '🏅 Home Chef' },
  { id: 'farmersMarket', label: 'Farmers Market Only', emoji: '🥕', desc: 'Buy all produce at the market', reward: '🏅 Local Legend' },
  { id: 'savingsBlitz', label: 'Savings Blitz', emoji: '💰', desc: 'Save 20% of income this month', reward: '🏅 SLO Saver' },
];

var BUDGET_BADGES = [
  { id: 'streak7', label: '7-Day Streak', emoji: '🔥', earned: true },
  { id: 'underBudget', label: 'Under Budget', emoji: '✅', earned: true },
  { id: 'sloSaver', label: 'SLO Saver', emoji: '🏅', earned: false },
  { id: 'localLegend', label: 'Local Legend', emoji: '🌟', earned: false },
  { id: 'greenCommuter', label: 'Green Commuter', emoji: '🚌', earned: false },
  { id: 'homeChef', label: 'Home Chef', emoji: '🍳', earned: false },
];

var BUDGET_SLO_COSTS = [
  { label: 'Average 1BR Rent', value: '$1,800–2,400/mo', emoji: '🏠' },
  { label: 'Grocery Run (1 week)', value: '$60–90', emoji: '🛒' },
  { label: 'Wine Tasting', value: '$20–35/person', emoji: '🍷' },
  { label: 'Dinner Downtown', value: '$25–55/person', emoji: '🍽' },
  { label: 'Uber to Downtown', value: '$8–14', emoji: '🚗' },
  { label: 'Farmers Market', value: '$20–40', emoji: '🥕' },
  { label: 'SLO Transit (student)', value: 'Free with ID', emoji: '🚌' },
  { label: 'Bishop Peak Hike', value: 'Free', emoji: '⛰️' },
  { label: 'Craft Beer Flight', value: '$14–20', emoji: '🍺' },
  { label: 'Fremont Theater Show', value: '$25–45', emoji: '🎬' },
];

var BUDGET_WEEK = [18, 32, 55, 24, 41, 67, 29];
var BUDGET_WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var BUDGET_HEATMAP = [0,18,0,32,55,0,0,24,11,41,0,67,29,7,0,0,22,14,0,38,0,0,19,8,0,44,0,27,0,12];
var BUDGET_TABS = ['Dashboard', 'Budget', 'Expenses', 'Goals', 'Social', 'SLO Guide', 'Settings'];
var BUDGET_TAB_EMOJIS = ['📊', '💰', '📝', '🎯', '👥', '🗺', '⚙️'];

// ── helpers ────────────────────────────────────────────────
function budgetTotalBudget() { return Object.values(budgetData.budgets).reduce(function(a,b){return a+b;},0); }
function budgetTotalSpent() { return budgetData.expenses.reduce(function(a,e){return a+e.amount;},0); }
function budgetCatSpent(catId) { return budgetData.expenses.filter(function(e){return e.category===catId;}).reduce(function(a,e){return a+e.amount;},0); }
function budgetHealthScore() {
  var pct = Math.min(100, Math.round((budgetTotalSpent()/budgetTotalBudget())*100));
  var rem = budgetData.income - budgetTotalBudget();
  return Math.max(20, Math.round(100 - pct*0.5 - (rem<0?30:0)));
}
function budgetGrade(score) { return score>=90?'A+':score>=80?'A':score>=70?'B':score>=60?'C':'D'; }
function budgetGradeColor(score) { return score>=80?'#22c55e':score>=60?'#f59e0b':'#ef4444'; }
function budgetRingColor(pct) { return pct<60?'#22c55e':pct<85?'#f59e0b':'#ef4444'; }

// ── Itinerary integration helpers ──────────────────────────────
function budgetGetItinerarySummary() {
  try {
    if (typeof itinGetBudgetSummary === 'function') return itinGetBudgetSummary();
  } catch(e) {}
  return null;
}

function budgetGetItineraryInsight() {
  var summary = budgetGetItinerarySummary();
  if (!summary) return null;
  var entBudget = budgetData.budgets.entertainment || 0;
  var entSpent  = budgetCatSpent('entertainment');
  var entLeft   = entBudget - entSpent;
  var cost      = summary.costPerPerson || 0;
  var delta     = entLeft - cost;
  var insight   = {};

  if (cost === 0) {
    insight.emoji = '🗓';
    insight.color = '#06b6d4';
    insight.title = 'Active Itinerary: ' + summary.name;
    insight.body  = summary.stops + ' stops planned · Cost estimate unavailable';
    insight.tip   = null;
  } else if (delta >= 0) {
    insight.emoji = '✅';
    insight.color = '#22c55e';
    insight.title = 'Your plan fits your budget';
    insight.body  = summary.name + ' will cost ~$' + cost + '/person · You have $' + Math.round(entLeft) + ' left in entertainment';
    insight.tip   = delta < 20 ? 'Cutting it close — consider one less stop to stay comfortable.' : 'You are in great shape. Enjoy the night!';
  } else {
    insight.emoji = '⚠️';
    insight.color = '#f59e0b';
    insight.title = 'Itinerary exceeds entertainment budget';
    insight.body  = summary.name + ' costs ~$' + cost + '/person · You are $' + Math.abs(Math.round(delta)) + ' over your entertainment budget';
    insight.tip   = 'Try removing one stop or bumping your entertainment budget in the Budget tab.';
  }
  insight.cost    = cost;
  insight.stops   = summary.stops;
  insight.name    = summary.name;
  insight.canLog  = true;
  return insight;
}

function budgetRenderItineraryCard() {
  var insight = budgetGetItineraryInsight();
  if (!insight) {
    // No active itinerary — show a soft prompt
    return '<div style="padding:12px 14px;border-radius:14px;background:rgba(0,245,255,0.05);border:1px solid rgba(0,245,255,0.12);margin-bottom:14px;display:flex;align-items:center;gap:12px">' +
      '<div style="font-size:26px;flex-shrink:0">🗓</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:800;color:rgba(0,245,255,0.8)">No Active Itinerary</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px;line-height:1.4">Build a plan in the Itinerary hub and your costs will appear here automatically.</div></div>' +
      '<button onclick="menuHomeOpenItinerary && menuHomeOpenItinerary()" style="padding:7px 10px;border-radius:10px;border:1px solid rgba(0,245,255,0.25);background:rgba(0,245,255,0.08);color:rgba(0,245,255,0.8);font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0;font-family:Helvetica Neue,sans-serif">Plan →</button>' +
      '</div>';
  }

  var html = '<div style="padding:14px;border-radius:14px;background:' + insight.color + '10;border:1px solid ' + insight.color + '30;margin-bottom:14px">';
  html += '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">';
  html += '<div style="font-size:24px;flex-shrink:0">' + insight.emoji + '</div>';
  html += '<div style="flex:1"><div style="font-size:13px;font-weight:800;color:' + insight.color + '">' + insight.title + '</div>';
  html += '<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:3px;line-height:1.5">' + insight.body + '</div>';
  if (insight.tip) html += '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:5px;font-style:italic">💡 ' + insight.tip + '</div>';
  html += '</div></div>';
  // Log button
  html += '<div style="display:flex;gap:8px">';
  html += '<button onclick="budgetLogItineraryCosts()" style="flex:1;padding:10px;border-radius:10px;border:none;background:' + insight.color + '20;color:' + insight.color + ';font-size:12px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif;border:1px solid ' + insight.color + '30">📥 Log Costs to Expenses</button>';
  html += '<button onclick="menuHomeOpenItinerary && menuHomeOpenItinerary()" style="padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">View Plan</button>';
  html += '</div></div>';
  return html;
}

function budgetSection(label) {
  return '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">' + label + '</div>';
}

function budgetCard(content, extra) {
  return '<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px' + (extra||'') + '">' + content + '</div>';
}

function budgetToggle(key, val) {
  return '<div onclick="budgetToggleNotif(\'' + key + '\')" style="width:44px;height:24px;border-radius:12px;background:' + (val?'#6366f1':'rgba(255,255,255,0.1)') + ';cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0"><div style="width:18px;height:18px;border-radius:9px;background:#fff;position:absolute;top:3px;left:' + (val?'23':'3') + 'px;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div></div>';
}

// ── render tabs ─────────────────────────────────────────────
function budgetRenderTabs() {
  return '<div style="display:flex;gap:4px;padding:10px 20px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch" id="budget-tab-bar">' +
    BUDGET_TABS.map(function(t,i) {
      var active = budgetData.activeTab === t;
      return '<button data-btab="' + t + '" onclick="budgetSwitchTab(this.dataset.btab)" style="padding:6px 11px;border-radius:20px;border:1px solid ' + (active?'rgba(99,102,241,0.6)':'rgba(255,255,255,0.08)') + ';background:' + (active?'rgba(99,102,241,0.15)':'transparent') + ';color:' + (active?'#a5b4fc':'rgba(255,255,255,0.35)') + ';font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif">' + BUDGET_TAB_EMOJIS[i] + ' ' + t + '</button>';
    }).join('') +
  '</div>';
}

// ── Dashboard ───────────────────────────────────────────────
function budgetRenderDashboard() {
  var score = budgetHealthScore();
  var grade = budgetGrade(score);
  var gc = budgetGradeColor(score);
  var total = budgetTotalBudget();
  var spent = budgetTotalSpent();
  var pct = Math.min(100, Math.round((spent/total)*100));
  var rc = budgetRingColor(pct);
  var rem = budgetData.income - total;
  var maxW = Math.max.apply(null, BUDGET_WEEK);
  var maxH = Math.max.apply(null, BUDGET_HEATMAP.concat([1]));

  var html = '';

  // Itinerary integration card — always first
  html += budgetSection('🗓 Itinerary');
  html += budgetRenderItineraryCard();

  // Health score
  html += '<div style="padding:14px 16px;border-radius:16px;background:linear-gradient(135deg,' + gc + '15,' + gc + '08);border:1px solid ' + gc + '30;margin-bottom:14px;display:flex;align-items:center;gap:14px">';
  html += '<div style="width:52px;height:52px;border-radius:14px;background:' + gc + '20;display:flex;align-items:center;justify-content:center;flex-shrink:0"><div style="font-size:20px;font-weight:900;color:' + gc + ';line-height:1">' + grade + '</div></div>';
  html += '<div style="flex:1"><div style="font-size:14px;font-weight:800">Budget Health Score</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px">' + (score>=80?'You\'re crushing it — on track for all goals':'Watch food spending — trending over budget') + '</div><div style="margin-top:8px;height:4px;border-radius:2px;background:rgba(255,255,255,0.08);overflow:hidden"><div style="height:100%;width:' + score + '%;background:' + gc + ';border-radius:2px"></div></div></div>';
  html += '<div style="font-size:20px;font-weight:900;color:' + gc + '">' + score + '</div></div>';

  // Ring + stats
  html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">';
  html += '<div style="position:relative;flex-shrink:0">';
  html += '<svg width="110" height="110" style="transform:rotate(-90deg)">';
  html += '<circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="9"/>';
  var circ = 2 * Math.PI * 44;
  html += '<circle cx="55" cy="55" r="44" fill="none" stroke="' + rc + '" stroke-width="9" stroke-dasharray="' + circ + '" stroke-dashoffset="' + (circ*(1-pct/100)) + '" stroke-linecap="round"/>';
  html += '</svg>';
  html += '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:17px;font-weight:900">' + pct + '%</div><div style="font-size:9px;color:rgba(255,255,255,0.35)">used</div></div></div>';
  html += '<div style="flex:1"><div style="font-size:26px;font-weight:900">$' + spent + '</div><div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:8px">of $' + total + ' budget</div>';
  html += '<div style="font-size:11px;color:' + rc + ';font-weight:700;padding:3px 10px;border-radius:20px;background:' + rc + '15;border:1px solid ' + rc + '30;display:inline-block">' + (pct<60?'✅ On track':pct<85?'⚠️ Watch spending':'🚨 Over budget soon') + '</div></div></div>';

  // Insight
  html += '<div style="padding:12px 14px;border-radius:14px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);margin-bottom:14px">';
  html += '<div style="font-size:12px;font-weight:800;color:#f59e0b;margin-bottom:3px">⚡ Predictive Insight</div>';
  html += '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">At this rate you\'ll exceed your food budget by <strong style="color:#fff">Apr 18</strong>. Farmers Market this Thursday saves ~$25.</div></div>';

  // Stats row
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">';
  [{ label:'Income', value:'$'+budgetData.income.toLocaleString(), color:'#22c55e' }, { label:'Budgeted', value:'$'+total.toLocaleString(), color:'#6366f1' }, { label: rem>=0?'Free':'Over', value:'$'+Math.abs(rem), color:rem>=0?'#a5b4fc':'#ef4444' }].forEach(function(s) {
    html += '<div style="padding:12px 8px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);text-align:center"><div style="font-size:15px;font-weight:900;color:' + s.color + '">' + s.value + '</div><div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px">' + s.label + '</div></div>';
  });
  html += '</div>';

  // Week chart
  html += budgetSection('This Week');
  html += '<div style="display:flex;align-items:flex-end;gap:5px;height:72px;margin-bottom:14px">';
  BUDGET_WEEK.forEach(function(v,i) {
    html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">';
    html += '<div style="font-size:8px;color:rgba(255,255,255,0.3);font-weight:700">$' + v + '</div>';
    html += '<div style="width:100%;height:' + Math.round((v/maxW)*50) + 'px;border-radius:5px;background:' + (i===6?'rgba(255,255,255,0.08)':'linear-gradient(180deg,#6366f1,#8b5cf6)') + '"></div>';
    html += '<div style="font-size:8px;color:rgba(255,255,255,0.3);font-weight:700">' + BUDGET_WEEK_LABELS[i] + '</div>';
    html += '</div>';
  });
  html += '</div>';

  // Category bars
  html += budgetSection('By Category');
  BUDGET_CATS.forEach(function(c) {
    if (!budgetData.budgets[c.id]) return;
    var sp = budgetCatSpent(c.id);
    var p = Math.min(100, Math.round((sp/budgetData.budgets[c.id])*100));
    html += '<div style="margin-bottom:9px">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:12px;font-weight:700">' + c.emoji + ' ' + c.label + '</span><span style="font-size:11px;color:' + (p>90?'#ef4444':'rgba(255,255,255,0.45)') + '">$' + sp + ' / $' + budgetData.budgets[c.id] + '</span></div>';
    html += '<div style="height:5px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden"><div style="height:100%;width:' + p + '%;border-radius:3px;background:' + (p>90?'#ef4444':c.color) + '"></div></div>';
    html += '</div>';
  });

  // Heatmap
  html += budgetSection('April Spending Calendar');
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:14px">';
  BUDGET_HEATMAP.forEach(function(v,i) {
    var opacity = v===0 ? '' : (0.1 + (v/maxH)*0.8).toFixed(2);
    html += '<div style="aspect-ratio:1;border-radius:5px;background:' + (v===0?'rgba(255,255,255,0.04)':'rgba(99,102,241,'+opacity+')') + ';display:flex;align-items:center;justify-content:center">';
    html += '<span style="font-size:7px;color:rgba(255,255,255,0.35);font-weight:700">' + (i+1) + '</span></div>';
  });
  html += '</div>';

  // Badges
  html += budgetSection('Achievements');
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">';
  BUDGET_BADGES.forEach(function(b) {
    html += '<div style="padding:12px 8px;border-radius:14px;background:' + (b.earned?'rgba(99,102,241,0.1)':'rgba(255,255,255,0.03)') + ';border:1px solid ' + (b.earned?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.06)') + ';text-align:center;opacity:' + (b.earned?1:0.35) + '">';
    html += '<div style="font-size:22px;margin-bottom:4px">' + b.emoji + '</div>';
    html += '<div style="font-size:9px;font-weight:700;color:' + (b.earned?'#a5b4fc':'rgba(255,255,255,0.4)') + '">' + b.label + '</div></div>';
  });
  html += '</div>';

  // Recent
  html += budgetSection('Recent Expenses');
  budgetData.expenses.slice(0,5).forEach(function(e) {
    var cat = BUDGET_CATS.find(function(c){return c.id===e.category;});
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">';
    html += '<div style="width:36px;height:36px;border-radius:10px;background:' + cat.color + '20;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">' + cat.emoji + '</div>';
    html += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + e.desc + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + e.date + '</div></div>';
    html += '<div style="font-size:14px;font-weight:800;color:' + (e.amount===0?'#22c55e':'#ef4444') + '">' + (e.amount===0?'Free':'-$'+e.amount) + '</div></div>';
  });

  return html;
}

// ── Budget tab ───────────────────────────────────────────────
function budgetRenderBudgetTab() {
  var total = budgetTotalBudget();
  var rem = budgetData.income - total;
  var html = '';

  html += budgetSection('Quick Start Presets');
  html += '<div style="display:flex;gap:8px;margin-bottom:14px">';
  BUDGET_PRESETS.forEach(function(p) {
    var active = budgetData.preset === p.id;
    html += '<button data-bpreset="' + p.id + '" onclick="budgetApplyPreset(this.dataset.bpreset)" style="flex:1;padding:12px 6px;border-radius:14px;border:1px solid ' + (active?'rgba(99,102,241,0.5)':'rgba(255,255,255,0.08)') + ';background:' + (active?'rgba(99,102,241,0.15)':'rgba(255,255,255,0.03)') + ';cursor:pointer;text-align:center;font-family:Helvetica Neue,sans-serif">';
    html += '<div style="font-size:22px">' + p.emoji + '</div><div style="font-size:9px;font-weight:700;color:' + (active?'#a5b4fc':'rgba(255,255,255,0.45)') + ';margin-top:4px">' + p.label + '</div></button>';
  });
  html += '</div>';

  html += budgetSection('Monthly Income');
  html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);margin-bottom:14px">';
  html += '<span style="font-size:20px">💵</span>';
  html += '<input type="number" id="budget-income-input" value="' + budgetData.income + '" onchange="budgetUpdateIncome(this.value)" style="flex:1;background:none;border:none;outline:none;color:#22c55e;font-size:22px;font-weight:900;font-family:Helvetica Neue,sans-serif;width:100%">';
  html += '<span style="font-size:12px;color:rgba(255,255,255,0.4)">/month</span></div>';

  html += budgetSection('Category Budgets');
  BUDGET_CATS.forEach(function(c) {
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">';
    html += '<div style="width:34px;height:34px;border-radius:10px;background:' + c.color + '20;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0">' + c.emoji + '</div>';
    html += '<div style="flex:1"><div style="font-size:12px;font-weight:700;margin-bottom:3px">' + c.label + '</div>';
    html += '<input type="range" min="0" max="3000" step="25" value="' + budgetData.budgets[c.id] + '" data-bcat="' + c.id + '" oninput="budgetUpdateCat(this.dataset.bcat,this.value)" style="width:100%;accent-color:' + c.color + ';cursor:pointer"></div>';
    html += '<div id="budget-cat-val-' + c.id + '" style="font-size:14px;font-weight:900;color:' + c.color + ';min-width:48px;text-align:right">$' + budgetData.budgets[c.id] + '</div></div>';
  });

  html += '<div style="padding:14px;border-radius:14px;background:' + (rem>=0?'rgba(99,102,241,0.08)':'rgba(239,68,68,0.08)') + ';border:1px solid ' + (rem>=0?'rgba(99,102,241,0.2)':'rgba(239,68,68,0.2)') + ';display:flex;justify-content:space-between">';
  html += '<div><div style="font-size:11px;color:rgba(255,255,255,0.4)">Total Budgeted</div><div style="font-size:22px;font-weight:900">$' + total.toLocaleString() + '</div></div>';
  html += '<div style="text-align:right"><div style="font-size:11px;color:rgba(255,255,255,0.4)">' + (rem>=0?'Unallocated':'Over Budget') + '</div><div style="font-size:22px;font-weight:900;color:' + (rem>=0?'#22c55e':'#ef4444') + '">$' + Math.abs(rem).toLocaleString() + '</div></div></div>';

  return html;
}

// ── Expenses tab ─────────────────────────────────────────────
function budgetRenderExpenses() {
  var html = '';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' + budgetSection('All Expenses');
  html += '<button onclick="budgetToggleAddExpense()" style="padding:6px 14px;border-radius:20px;border:1px solid rgba(99,102,241,0.4);background:rgba(99,102,241,0.12);color:#a5b4fc;font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">+ Add</button></div>';

  if (budgetData.showAddExpense) {
    html += '<div style="padding:14px;border-radius:14px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);margin-bottom:12px">';
    html += '<input id="budget-new-desc" placeholder="Description (e.g. Firestone Grill)" value="' + budgetData.newExp.desc + '" oninput="budgetData.newExp.desc=this.value" style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;margin-bottom:8px;outline:none;box-sizing:border-box;font-family:Helvetica Neue,sans-serif">';
    html += '<div style="display:flex;gap:8px;margin-bottom:8px">';
    html += '<input id="budget-new-amount" type="number" placeholder="$Amount" value="' + budgetData.newExp.amount + '" oninput="budgetData.newExp.amount=this.value" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;font-family:Helvetica Neue,sans-serif">';
    html += '<select id="budget-new-cat" onchange="budgetData.newExp.category=this.value" style="flex:1;background:rgba(15,15,30,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 8px;color:#fff;font-size:12px;outline:none">';
    BUDGET_CATS.forEach(function(c) { html += '<option value="' + c.id + '"' + (budgetData.newExp.category===c.id?' selected':'') + '>' + c.emoji + ' ' + c.label + '</option>'; });
    html += '</select></div>';
    html += '<button onclick="budgetSaveExpense()" style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif">Save Expense</button></div>';
  }

  budgetData.expenses.forEach(function(e) {
    var cat = BUDGET_CATS.find(function(c){return c.id===e.category;});
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">';
    html += '<div style="width:38px;height:38px;border-radius:11px;background:' + cat.color + '20;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0">' + cat.emoji + '</div>';
    html += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + e.desc + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:1px">' + e.date + ' · ' + cat.label + '</div></div>';
    html += '<div style="font-size:14px;font-weight:800;color:' + (e.amount===0?'#22c55e':'#ef4444') + '">' + (e.amount===0?'Free':'-$'+e.amount) + '</div></div>';
  });

  return html;
}

// ── Goals tab ────────────────────────────────────────────────
function budgetRenderGoals() {
  var html = '';
  html += budgetSection('Savings Goals');
  budgetData.goals.forEach(function(g) {
    var p = Math.round((g.saved/g.target)*100);
    html += '<div style="padding:14px;border-radius:16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:12px">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:8px">';
    html += '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:22px">' + g.emoji + '</span><div><div style="font-size:14px;font-weight:800">' + g.label + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4)">$' + g.saved + ' of $' + g.target + '</div></div></div>';
    html += '<div style="font-size:22px;font-weight:900;color:' + g.color + '">' + p + '%</div></div>';
    html += '<div style="height:8px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden"><div style="height:100%;width:' + p + '%;border-radius:4px;background:linear-gradient(90deg,' + g.color + ',' + g.color + '88)"></div></div>';
    html += '<div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.3)">$' + (g.target-g.saved) + ' to go · Est. ' + Math.ceil((g.target-g.saved)/150) + ' months at current rate</div></div>';
  });
  html += '<button onclick="budgetAddGoal()" style="width:100%;padding:13px;border-radius:14px;border:1px dashed rgba(99,102,241,0.3);background:transparent;color:#a5b4fc;font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;margin-bottom:20px">+ Add Goal</button>';

  html += budgetSection('Monthly Challenges');
  BUDGET_CHALLENGES.forEach(function(c) {
    var active = budgetData.activeChallenge === c.id;
    html += '<div data-bchal="' + c.id + '" onclick="budgetToggleChallenge(this.dataset.bchal)" style="padding:14px;border-radius:14px;background:' + (active?'rgba(99,102,241,0.12)':'rgba(255,255,255,0.03)') + ';border:1px solid ' + (active?'rgba(99,102,241,0.35)':'rgba(255,255,255,0.07)') + ';margin-bottom:8px;cursor:pointer">';
    html += '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:22px">' + c.emoji + '</span>';
    html += '<div style="flex:1"><div style="font-size:13px;font-weight:800">' + c.label + '</div><div style="font-size:11px;color:rgba(255,255,255,0.45)">' + c.desc + '</div></div>';
    html += '<div style="font-size:10px;font-weight:700;color:' + (active?'#a5b4fc':'rgba(255,255,255,0.3)') + ';padding:4px 8px;border-radius:10px;background:' + (active?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.05)') + '">' + (active?'Active':'Start') + '</div></div>';
    if (active) html += '<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#ffd700">🏅 Reward: ' + c.reward + '</div>';
    html += '</div>';
  });

  return html;
}

// ── Social tab ───────────────────────────────────────────────
function budgetRenderSocial() {
  var splits = [
    { desc: 'Wine tasting — Tolosa', total: 112, people: ['You','Alex','Jordan','Sam'], paid: [28,28,28,28] },
    { desc: 'Dinner at Luna Red', total: 88, people: ['You','Alex'], paid: [44,44] },
  ];
  var html = '';
  html += budgetSection('Split Expenses');
  splits.forEach(function(s) {
    html += '<div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:12px">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><div style="font-size:14px;font-weight:800">' + s.desc + '</div><div style="font-size:14px;font-weight:900;color:#22c55e">$' + s.total + '</div></div>';
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    s.people.forEach(function(p,i) {
      html += '<div style="padding:6px 10px;border-radius:10px;background:' + (i===0?'rgba(99,102,241,0.15)':'rgba(255,255,255,0.05)') + ';border:1px solid ' + (i===0?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.08)') + '">';
      html += '<div style="font-size:10px;font-weight:700;color:' + (i===0?'#a5b4fc':'rgba(255,255,255,0.45)') + '">' + p + '</div>';
      html += '<div style="font-size:12px;font-weight:900">$' + s.paid[i] + '</div></div>';
    });
    html += '</div></div>';
  });
  html += '<button style="width:100%;padding:13px;border-radius:14px;border:1px dashed rgba(99,102,241,0.3);background:transparent;color:#a5b4fc;font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;margin-bottom:20px">+ Split a New Expense</button>';

  html += budgetSection('Export & Share');
  ['📄 Export Monthly Report (PDF)', '📊 Share Budget Summary', '📧 Email Weekly Report'].forEach(function(item) {
    html += budgetCard('<div style="font-size:13px;font-weight:700;cursor:pointer">' + item + '</div>');
  });
  return html;
}

// ── SLO Guide tab ────────────────────────────────────────────
function budgetRenderSLOGuide() {
  var html = '';
  html += '<div style="padding:12px 14px;border-radius:14px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);margin-bottom:14px">';
  html += '<div style="font-size:12px;font-weight:800;color:#a5b4fc;margin-bottom:3px">💡 SLO Money Tip</div>';
  html += '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">Cal Poly students ride SLO Transit free with student ID. Saves ~$80–120/month vs driving.</div></div>';

  html += budgetSection('Cost of Living in SLO');
  BUDGET_SLO_COSTS.forEach(function(item) {
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">';
    html += '<span style="font-size:22px">' + item.emoji + '</span><div style="flex:1;font-size:13px;font-weight:700">' + item.label + '</div>';
    html += '<div style="font-size:13px;font-weight:800;color:#a5b4fc">' + item.value + '</div></div>';
  });

  html += '<div style="margin-top:16px">' + budgetSection('Trip Budget Templates') + '</div>';
  [
    { label: 'Wine Country Day', emoji: '🍷', total: '$120–200', items: '3 tastings + lunch + Uber' },
    { label: 'Weekend Getaway', emoji: '🏖', total: '$350–550', items: 'Hotel + food + activities' },
    { label: 'Student Week', emoji: '🎓', total: '$150–250', items: 'Food + transit + entertainment' },
    { label: 'Hearst Castle Day', emoji: '🏰', total: '$80–140', items: 'Tickets + gas + lunch' },
    { label: 'Edna Valley Wine Tour', emoji: '🚗', total: '$100–180', items: '4 tastings + designated driver' },
  ].forEach(function(t) {
    html += '<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:3px"><div style="font-size:14px;font-weight:800">' + t.emoji + ' ' + t.label + '</div><div style="font-size:14px;font-weight:800;color:#22c55e">' + t.total + '</div></div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.4)">' + t.items + '</div></div>';
  });
  return html;
}

// ── Settings tab ─────────────────────────────────────────────
function budgetRenderSettings() {
  var html = '';
  html += budgetSection('🔔 Notifications <span style="color:rgba(255,255,255,0.2);font-weight:400">(all off by default)</span>');
  var notifItems = [
    { key: 'master', label: 'Enable Notifications', desc: 'Master toggle for all alerts' },
    { key: 'budget', label: 'Budget Alerts', desc: 'Alert when nearing a category limit' },
    { key: 'weekly', label: 'Weekly Summary', desc: 'Sunday spending recap' },
    { key: 'streak', label: 'Streak Reminder', desc: 'Daily log-in nudge' },
    { key: 'bills', label: 'Bill Reminders', desc: 'Upcoming payment alerts' },
    { key: 'insights', label: 'Spending Insights', desc: 'Predictive spending tips' },
  ];
  notifItems.forEach(function(s) {
    var disabled = s.key !== 'master' && !budgetData.notifs.master;
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;opacity:' + (disabled?0.4:1) + '">';
    html += '<div style="flex:1"><div style="font-size:13px;font-weight:700">' + s.label + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:1px">' + s.desc + '</div></div>';
    html += budgetToggle(s.key, budgetData.notifs[s.key]) + '</div>';
  });

  html += '<div style="margin-bottom:20px"><br>' + budgetSection('⚙️ Preferences');
  [{ label: 'Currency', options: ['USD','EUR','GBP','CAD'] }, { label: 'Budget Period', options: ['Monthly','Weekly','Biweekly'] }].forEach(function(s) {
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">';
    html += '<div style="flex:1;font-size:13px;font-weight:700">' + s.label + '</div>';
    html += '<select style="background:rgba(15,15,30,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:6px 10px;color:#a5b4fc;font-size:12px;font-weight:700;outline:none">';
    s.options.forEach(function(o) { html += '<option>' + o + '</option>'; });
    html += '</select></div>';
  });
  html += '</div>';

  html += budgetSection('📂 Data');
  ['📄 Export All Data (CSV)', '📥 Import from CSV', '🗑 Clear All Expenses', '↩️ Reset to Defaults'].forEach(function(item, i) {
    html += '<div style="padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid ' + (i>=2?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.07)') + ';margin-bottom:8px;font-size:13px;font-weight:700;color:' + (i>=2?'rgba(239,68,68,0.75)':'rgba(255,255,255,0.8)') + ';cursor:pointer">' + item + '</div>';
  });
  html += '<div style="text-align:center;margin-top:24px;font-size:11px;color:rgba(255,255,255,0.18)">SLO Budget Pro · v1.0</div>';
  return html;
}

// ── render content ───────────────────────────────────────────
function budgetRenderContent() {
  switch(budgetData.activeTab) {
    case 'Dashboard': return budgetRenderDashboard();
    case 'Budget':    return budgetRenderBudgetTab();
    case 'Expenses':  return budgetRenderExpenses();
    case 'Goals':     return budgetRenderGoals();
    case 'Social':    return budgetRenderSocial();
    case 'SLO Guide': return budgetRenderSLOGuide();
    case 'Settings':  return budgetRenderSettings();
    default: return '';
  }
}

// ── open/close ───────────────────────────────────────────────
function openBudgetSheet() {
  var existing = document.getElementById('mh-budget-hub');
  if (existing) existing.remove();

  if (!document.getElementById('budget-hub-css')) {
    var s = document.createElement('style');
    s.id = 'budget-hub-css';
    s.textContent = '#budget-tab-bar::-webkit-scrollbar{display:none}';
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-budget-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  var month = new Date().toLocaleString('en-US',{month:'long',year:'numeric'});
  hub.innerHTML =
    '<div style="padding:48px 20px 0;background:linear-gradient(180deg,rgba(99,102,241,0.1) 0%,transparent 100%);flex-shrink:0">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div><div style="font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:2px;text-transform:uppercase">SLO Budget Pro</div>' +
        '<div id="budget-hub-title" style="font-size:20px;font-weight:900;font-family:Georgia,serif">💸 Dashboard</div></div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<button onclick="budgetShowWalkthrough()" style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.35);color:#a5b4fc;width:32px;height:32px;border-radius:50%;font-size:14px;font-weight:900;cursor:pointer">?</button>' +
          '<button onclick="closeBudgetSheet()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    budgetRenderTabs() +
    '<div id="budget-content" style="flex:1;overflow-y:auto;padding:0 20px 80px">' + budgetRenderContent() + '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('budget');

  // Show walkthrough on first open
  if (!localStorage.getItem('budget_onboarding_seen')) {
    setTimeout(function() { budgetShowWalkthrough(); }, 400);
  }
}
window.openBudgetSheet = openBudgetSheet;

function closeBudgetSheet() {
  hubDeactivateMapMode();
  tipsRemoveButton('budget');
  var h = document.getElementById('mh-budget-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeBudgetSheet = closeBudgetSheet;

// ── interactions ─────────────────────────────────────────────
function budgetSwitchTab(tabName) {
  budgetData.activeTab = tabName;
  var title = document.getElementById('budget-hub-title');
  if (title) title.textContent = '💸 ' + tabName;
  var bar = document.getElementById('budget-tab-bar');
  if (bar) {
    bar.querySelectorAll('button').forEach(function(btn) {
      var active = btn.dataset.btab === tabName;
      btn.style.borderColor = active ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)';
      btn.style.background = active ? 'rgba(99,102,241,0.15)' : 'transparent';
      btn.style.color = active ? '#a5b4fc' : 'rgba(255,255,255,0.35)';
    });
  }
  var content = document.getElementById('budget-content');
  if (content) content.innerHTML = budgetRenderContent();
}
window.budgetSwitchTab = budgetSwitchTab;

function budgetApplyPreset(presetId) {
  var p = BUDGET_PRESETS.find(function(x){return x.id===presetId;});
  if (!p) return;
  budgetData.preset = presetId;
  if (p.income) budgetData.income = p.income;
  budgetData.budgets = Object.assign({}, p.budgets);
  var content = document.getElementById('budget-content');
  if (content) content.innerHTML = budgetRenderBudgetTab();
}
window.budgetApplyPreset = budgetApplyPreset;

function budgetUpdateIncome(val) {
  budgetData.income = Number(val);
}
window.budgetUpdateIncome = budgetUpdateIncome;

function budgetUpdateCat(catId, val) {
  budgetData.budgets[catId] = Number(val);
  var el = document.getElementById('budget-cat-val-' + catId);
  if (el) el.textContent = '$' + val;
}
window.budgetUpdateCat = budgetUpdateCat;

function budgetToggleAddExpense() {
  budgetData.showAddExpense = !budgetData.showAddExpense;
  var content = document.getElementById('budget-content');
  if (content) content.innerHTML = budgetRenderExpenses();
}
window.budgetToggleAddExpense = budgetToggleAddExpense;

function budgetSaveExpense() {
  var desc = budgetData.newExp.desc;
  var amount = parseFloat(budgetData.newExp.amount);
  if (!desc || isNaN(amount)) return;
  budgetData.expenses.unshift({ id: Date.now(), desc: desc, amount: amount, category: budgetData.newExp.category, date: 'Today' });
  budgetData.newExp = { desc: '', amount: '', category: 'food' };
  budgetData.showAddExpense = false;
  var content = document.getElementById('budget-content');
  if (content) content.innerHTML = budgetRenderExpenses();
}
window.budgetSaveExpense = budgetSaveExpense;

function budgetToggleChallenge(id) {
  budgetData.activeChallenge = budgetData.activeChallenge === id ? null : id;
  var content = document.getElementById('budget-content');
  if (content) content.innerHTML = budgetRenderGoals();
}
window.budgetToggleChallenge = budgetToggleChallenge;

function budgetAddGoal() {
  // placeholder — would open a modal in full implementation
  if (typeof showToast === 'function') showToast('Goal creation coming soon!');
}
window.budgetAddGoal = budgetAddGoal;

function budgetToggleNotif(key) {
  if (key !== 'master' && !budgetData.notifs.master) return;
  budgetData.notifs[key] = !budgetData.notifs[key];
  var content = document.getElementById('budget-content');
  if (content) content.innerHTML = budgetRenderSettings();
}
window.budgetToggleNotif = budgetToggleNotif;

// ── Walkthrough ──────────────────────────────────────────────
var BUDGET_WALK_STEPS = [
  {
    emoji: '💸',
    title: 'Welcome to SLO Budget Pro',
    body: 'Your personal finance tool built for SLO life. Track spending, set goals, split expenses, and explore real SLO cost data — all in one place.',
    action: 'Get Started →',
  },
  {
    emoji: '🎯',
    title: 'Pick Your Profile',
    body: 'Start with a preset that matches your life — Cal Poly Student, SLO Resident, or Weekend Visitor. You can customize everything after.',
    action: 'Next →',
  },
  {
    emoji: '📊',
    title: 'Track Every Dollar',
    body: 'Log expenses as you go. The Dashboard shows your spending ring, weekly chart, category breakdowns, and a monthly heatmap calendar.',
    action: 'Next →',
  },
  {
    emoji: '🏅',
    title: 'Earn Badges & Hit Goals',
    body: 'Set savings goals, take on monthly challenges, and earn achievement badges. The longer your streak, the better your Budget Health Score.',
    action: "Let's Go! 🎉",
  },
];

var budgetWalkStep = 0;

function budgetShowWalkthrough() {
  var existing = document.getElementById('budget-walk-overlay');
  if (existing) existing.remove();
  budgetWalkStep = 0;
  budgetRenderWalkStep();
}
window.budgetShowWalkthrough = budgetShowWalkthrough;

function budgetRenderWalkStep() {
  var existing = document.getElementById('budget-walk-overlay');
  if (existing) existing.remove();

  var step = BUDGET_WALK_STEPS[budgetWalkStep];
  var total = BUDGET_WALK_STEPS.length;

  var overlay = document.createElement('div');
  overlay.id = 'budget-walk-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:11000;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity 0.3s';

  overlay.innerHTML =
    '<div style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:28px 28px 0 0;border-top:2px solid rgba(99,102,241,0.35);padding:24px 24px 48px">' +

      // Progress dots
      '<div style="display:flex;justify-content:center;gap:6px;margin-bottom:24px">' +
        BUDGET_WALK_STEPS.map(function(_,i) {
          return '<div style="width:' + (i===budgetWalkStep?24:6) + 'px;height:6px;border-radius:3px;background:' + (i===budgetWalkStep?'#6366f1':'rgba(255,255,255,0.15)') + ';transition:width 0.3s ease"></div>';
        }).join('') +
      '</div>' +

      // Content
      '<div style="text-align:center;margin-bottom:28px">' +
        '<div style="font-size:56px;margin-bottom:16px">' + step.emoji + '</div>' +
        '<div style="font-size:22px;font-weight:900;font-family:Georgia,serif;margin-bottom:12px">' + step.title + '</div>' +
        '<div style="font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;max-width:300px;margin:0 auto">' + step.body + '</div>' +
      '</div>' +

      // Preset picker on step 2
      (budgetWalkStep === 1 ?
        '<div style="display:flex;gap:8px;margin-bottom:20px">' +
          BUDGET_PRESETS.map(function(p) {
            return '<button data-bpreset="' + p.id + '" onclick="budgetWalkPickPreset(this.dataset.bpreset)" style="flex:1;padding:12px 6px;border-radius:14px;border:1px solid rgba(99,102,241,0.3);background:rgba(99,102,241,0.08);cursor:pointer;text-align:center;font-family:Helvetica Neue,sans-serif"><div style="font-size:24px">' + p.emoji + '</div><div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.6);margin-top:4px">' + p.label + '</div></button>';
          }).join('') +
        '</div>'
      : '') +

      // Buttons
      '<button onclick="budgetWalkNext()" style="width:100%;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:15px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif;margin-bottom:12px">' + step.action + '</button>' +
      '<button onclick="budgetWalkSkip()" style="width:100%;padding:12px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.35);font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">Don\'t show again</button>' +

    '</div>';

  document.body.appendChild(overlay);
  setTimeout(function() { overlay.style.opacity = '1'; }, 20);
}

function budgetWalkNext() {
  budgetWalkStep++;
  if (budgetWalkStep >= BUDGET_WALK_STEPS.length) {
    budgetWalkDone();
  } else {
    budgetRenderWalkStep();
  }
}
window.budgetWalkNext = budgetWalkNext;

function budgetWalkSkip() {
  budgetWalkDone();
}
window.budgetWalkSkip = budgetWalkSkip;

function budgetWalkPickPreset(presetId) {
  budgetApplyPreset(presetId);
  // Highlight selected
  var overlay = document.getElementById('budget-walk-overlay');
  if (overlay) {
    overlay.querySelectorAll('[data-bpreset]').forEach(function(btn) {
      var active = btn.dataset.bpreset === presetId;
      btn.style.borderColor = active ? '#6366f1' : 'rgba(99,102,241,0.3)';
      btn.style.background = active ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)';
    });
  }
}
window.budgetWalkPickPreset = budgetWalkPickPreset;

function budgetWalkDone() {
  localStorage.setItem('budget_onboarding_seen', '1');
  var overlay = document.getElementById('budget-walk-overlay');
  if (overlay) { overlay.style.opacity = '0'; setTimeout(function() { overlay.remove(); }, 300); }
  // Refresh budget content if budget tab is open
  var content = document.getElementById('budget-content');
  if (content) content.innerHTML = budgetRenderContent();
}
window.budgetWalkDone = budgetWalkDone;

// ── Itinerary cost logging ────────────────────────────────────
function budgetLogItineraryCosts() {
  if (typeof itinLogToBudget !== 'function') {
    if (typeof showToast === 'function') showToast('No itinerary loaded');
    return;
  }
  var logged = itinLogToBudget();
  if (!logged) {
    if (typeof showToast === 'function') showToast('No itinerary stops to log');
    return;
  }
  if (typeof showToast === 'function') showToast(logged + ' stops logged to expenses ✅');
  // Refresh dashboard
  var content = document.getElementById('budget-content');
  if (content && budgetData.activeTab === 'Dashboard') content.innerHTML = budgetRenderDashboard();
  if (content && budgetData.activeTab === 'Expenses')  content.innerHTML = budgetRenderExpenses();
}
window.budgetLogItineraryCosts = budgetLogItineraryCosts;
