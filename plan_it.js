// ══════════════════════════════════════════════
// PLAN IT.JS
// ══════════════════════════════════════════════

// ── PLAN IT — Claude AI Powered ──
// Expose to window for inline onclick handlers
var piState = {
  step: 0,  // 0=form, 1=loading, 2=result
  groupSize: 2,
  budget: 'medium',
  vibe: '',
  time: 'tonight',
  imPaying: false,
  familyFriendly: false,
  soberFriendly: false,
  result: null,
};

function openTravelPlanIt() {
  var existing = document.getElementById('mh-planit-sheet');
  if (existing) existing.remove();

  piState.step = 0;
  piState.result = null;

  var sheet = document.createElement('div');
  sheet.id = 'mh-planit-sheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:8500;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  // Works from both hub screen and inside the app
  var parent = document.getElementById('menu-home') || document.body;
  parent.appendChild(sheet);
  setTimeout(function() { sheet.style.opacity = '1'; piRender(); }, 30);
  sheet.addEventListener('click', function(e) {
    if (e.target === sheet) menuHomeClosePlanIt();
  });
}
window.menuHomeOpenTravelPlanIt = openTravelPlanIt;

function piRender() {
  var sheet = document.getElementById('mh-planit-sheet');
  if (!sheet) return;

  if (piState.step === 0) {
    sheet.innerHTML =
      '<div id="mh-pi-inner" style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:16px 20px 48px;max-height:90vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)">' +

        '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 14px;cursor:pointer" onclick="menuHomeClosePlanIt()"></div>' +

        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">' +
          '<div style="font-size:28px">✨</div>' +
          '<div><div style="font-size:20px;font-weight:800;font-family:Georgia,serif">Plan It</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">AI-powered outing planner for SLO</div></div>' +
        '</div>' +

        // Group size
        '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">GROUP SIZE</div>' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
          '<input type="range" id="pi-group-slider" min="1" max="12" value="2" style="flex:1;accent-color:#ffd700" oninput="piUpdateGroup(this.value)">' +
          '<div id="pi-group-display" style="font-size:22px;font-weight:900;color:#ffd700;min-width:28px">2</div>' +
        '</div>' +
        '<div id="pi-group-note" style="padding:8px 12px;border-radius:10px;font-size:11px;margin-bottom:16px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#22c55e">✅ Perfect for a couple or pair</div>' +

        // Budget
        '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">BUDGET</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:16px">' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="budget" data-pval="cheap" data-val="cheap">💰 Cheap</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="budget" data-pval="medium" data-val="medium" style="background:rgba(255,215,0,0.12);border-color:rgba(255,215,0,0.4);color:#ffd700">💵 Medium</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="budget" data-pval="splurge" data-val="splurge">💎 Splurge</button>' +
        '</div>' +

        // Vibe
        '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">VIBE</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="vibe" data-pval="chill" data-val="chill">😌 Chill</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="vibe" data-pval="rowdy" data-val="rowdy">🎉 Rowdy</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="vibe" data-pval="romantic" data-val="romantic">💑 Romantic</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="vibe" data-pval="adventurous" data-val="adventurous">🧗 Adventure</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="vibe" data-pval="foodie" data-val="foodie">🍽 Foodie</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="vibe" data-pval="outdoor" data-val="outdoor">🌿 Outdoor</button>' +
        '</div>' +

        // Time
        '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">WHEN</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:16px">' +
          '<button class="pi-opt pi-opt-active" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="time" data-pval="tonight" data-val="tonight">🌙 Tonight</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="time" data-pval="daytime" data-val="daytime">☀️ Daytime</button>' +
          '<button class="pi-opt" onclick="piSelect(this,this.dataset.pfield,this.dataset.pval)" data-pfield="time" data-pval="weekend" data-val="weekend">📅 Weekend</button>' +
        '</div>' +

        // Toggles
        '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)">' +
            '<span style="font-size:13px">💳 I am paying for the group</span>' +
            '<label class="toggle-switch"><input type="checkbox" id="pi-im-paying-toggle" onchange="piState.imPaying=this.checked"><span class="toggle-slider"></span></label>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)">' +
            '<span style="font-size:13px">👨‍👩‍👧 Family friendly</span>' +
            '<label class="toggle-switch"><input type="checkbox" id="pi-family-toggle" onchange="piState.familyFriendly=this.checked"><span class="toggle-slider"></span></label>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.07)">' +
            '<span style="font-size:13px">🧃 Sober friendly</span>' +
            '<label class="toggle-switch"><input type="checkbox" id="pi-sober-toggle" onchange="piState.soberFriendly=this.checked"><span class="toggle-slider"></span></label>' +
          '</div>' +
        '</div>' +

        '<button onclick="piGenerate()" id="pi-go-btn" style="width:100%;padding:15px;border-radius:16px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:15px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">✨ Build My Plan</button>' +
      '</div>';

    setTimeout(function() {
      var inner = document.getElementById('mh-pi-inner');
      if (inner) inner.style.transform = 'translateY(0)';
    }, 30);

    // Inject pi CSS
    if (!document.getElementById('pi-css')) {
      var s = document.createElement('style');
      s.id = 'pi-css';
      s.textContent = '.pi-opt{padding:8px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.5);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}.pi-opt-active,.pi-opt.pi-opt-active{background:rgba(255,215,0,0.12);border-color:rgba(255,215,0,0.4);color:#ffd700}';
      document.head.appendChild(s);
    }

  } else if (piState.step === 1) {
    // Loading state
    sheet.innerHTML =
      '<div style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:40px 20px 60px;display:flex;flex-direction:column;align-items:center;gap:16px">' +
        '<div style="font-size:48px;animation:pi-spin 2s linear infinite">✨</div>' +
        '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif;color:white">Building your plan...</div>' +
        '<div id="pi-loading-msg" style="font-size:13px;color:rgba(255,255,255,0.4);text-align:center">Thinking about your vibe...</div>' +
      '</div>';
    if (!document.getElementById('pi-spin-css')) {
      var s2 = document.createElement('style');
      s2.id = 'pi-spin-css';
      s2.textContent = '@keyframes pi-spin{0%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.2) rotate(180deg)}100%{transform:scale(1) rotate(360deg)}}';
      document.head.appendChild(s2);
    }
    // Cycle loading messages
    var msgs = ['Checking the vibe...','Scanning SLO spots...','Calculating ride costs...','Crafting your perfect night...'];
    var mi = 0;
    var msgInterval = setInterval(function() {
      mi = (mi+1) % msgs.length;
      var el = document.getElementById('pi-loading-msg');
      if (el) el.textContent = msgs[mi];
      else clearInterval(msgInterval);
    }, 1200);

  } else if (piState.step === 2 && piState.result) {
    piRenderResult(piState.result);
  }
}

function piUpdateGroup(val) {
  piState.groupSize = parseInt(val);
  var display = document.getElementById('pi-group-display');
  var note = document.getElementById('pi-group-note');
  if (display) display.textContent = val;
  if (note) {
    var n = parseInt(val);
    if (n === 1) { note.style.color='#06b6d4'; note.textContent='🙋 Solo night out'; }
    else if (n === 2) { note.style.color='#22c55e'; note.textContent='✅ Perfect for a couple or pair'; }
    else if (n <= 4) { note.style.color='#22c55e'; note.textContent='✅ Small group — standard ride'; }
    else if (n <= 6) { note.style.color='#ffd700'; note.textContent='🚐 Uber XL recommended (~1.7x cost)'; }
    else if (n <= 10) { note.style.color='#f59e0b'; note.textContent='⚠️ Split into 2 vehicles'; }
    else { note.style.color='#b44fff'; note.textContent='🚌 Large group — consider party transport'; }
  }
}
window.piUpdateGroup = piUpdateGroup;

function piSelect(el, field, val) {
  var row = el.parentElement;
  row.querySelectorAll('.pi-opt').forEach(function(b) {
    b.classList.remove('pi-opt-active');
    b.style.background = 'rgba(255,255,255,0.04)';
    b.style.borderColor = 'rgba(255,255,255,0.1)';
    b.style.color = 'rgba(255,255,255,0.5)';
  });
  el.classList.add('pi-opt-active');
  el.style.background = 'rgba(255,215,0,0.12)';
  el.style.borderColor = 'rgba(255,215,0,0.4)';
  el.style.color = '#ffd700';
  piState[field] = val;
}
window.piSelect = piSelect;

async function piGenerate() {
  if (!piState.vibe) {
    // Default to chill if nothing selected
    piState.vibe = 'chill';
  }

  piState.step = 1;
  piRender();

  var group = piState.groupSize;
  var budget = piState.budget;
  var vibe = piState.vibe;
  var time = piState.time;
  var imPaying = piState.imPaying;
  var family = piState.familyFriendly;
  var sober = piState.soberFriendly;

  // Build prompt for Claude
  var budgetDesc = budget === 'cheap' ? 'low budget, free or under $20 per person' :
                   budget === 'medium' ? 'medium budget, $20-60 per person' :
                   'splurge, money no object';

  var prompt = 'You are a local SLO (San Luis Obispo, CA) nightlife expert. ' +
    'Build a practical outing plan. ' +
    'Group: ' + group + ' people. ' +
    'Budget: ' + budgetDesc + '. ' +
    'Vibe: ' + vibe + '. ' +
    'Time: ' + time + '. ' +
    (imPaying ? 'One person paying. ' : '') +
    (family ? 'Family friendly required. ' : '') +
    (sober ? 'Sober friendly only. ' : '') +
    'SLO bars: Black Sheep, Frog Peach, Nightcap, Library, High Bar, Sidecar, Feral, BA Start Arcade. ' +
    'Restaurants: Novo (upscale), Firestone (casual tri-tip), Luna Red (tapas patio), Bear Wren (pizza). ' +
    'Thursday 6-9pm is Farmers Market on Higuera. Safe Ride free Thu-Sat 10pm-3am. ' +
    'Return ONLY valid JSON: {headline, summary, stops:[{time,name,type,description,cost,tip,duration_mins}], total_cost, ride_note, pro_tip}. duration_mins is estimated time at each stop as an integer (e.g. 60 for 1 hour at a restaurant, 45 for a bar stop). cost is per person estimate like $15-25.';

  try {
    var resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    var data = await resp.json();
    var text = (data.content || []).map(function(b) { return b.text || ''; }).join('');

    // Parse JSON from response
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    var plan = JSON.parse(jsonMatch[0]);

    piState.result = plan;
    piState.step = 2;
    piRender();

  } catch(e) {
    // Fallback plan if API fails
    piState.result = {
      headline: 'A great ' + vibe + ' night in SLO',
      summary: 'Here is a solid plan for your group of ' + group + ' tonight.',
      stops: [
        { time: '7:00 PM', name: 'Dinner', type: 'food', description: budget === 'cheap' ? 'Firestone Grill for legendary tri-tip sandwiches' : 'Novo Restaurant for creekside farm-to-table', cost: budget === 'cheap' ? '$12' : '$35', tip: budget === 'cheap' ? 'Get there before 7pm to beat the line' : 'Ask for the creekside patio' },
        { time: '9:00 PM', name: 'Nightlife', type: 'bar', description: vibe === 'rowdy' ? 'BA Start Arcade Bar — games and drinks' : 'Black Sheep Bar Cafe for a chill vibe', cost: '$15-25', tip: 'Check DTSLO for live crowd status before heading over' },
      ],
      total_cost: budget === 'cheap' ? '$30-50' : budget === 'medium' ? '$60-100' : '$100+',
      ride_note: group >= 5 ? 'Get Uber XL for your group of ' + group : 'Standard Uber works fine',
      vibe_match: 'Picked for a ' + vibe + ' ' + time + ' with ' + group,
      pro_tip: 'Check crowd reports on DTSLO before heading to any bar'
    };
    piState.step = 2;
    piRender();
  }
}
window.piGenerate = piGenerate;

function piRenderResult(plan) {
  var sheet = document.getElementById('mh-planit-sheet');
  if (!sheet) return;

  var stops = (plan.stops || []).map(function(s, i) {
    return '<div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:14px;border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
        '<div style="font-size:10px;font-weight:800;color:#ffd700;background:rgba(255,215,0,0.1);padding:3px 8px;border-radius:20px">' + (s.time||'') + '</div>' +
        '<div style="font-size:13px;font-weight:800">' + (s.name||'') + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5;margin-bottom:4px">' + (s.description||'') + '</div>' +
      (s.tip ? '<div style="font-size:11px;color:#ffd700">💡 ' + s.tip + '</div>' : '') +
      (s.cost ? '<div style="font-size:11px;color:#22c55e;margin-top:4px">~' + s.cost + '</div>' : '') +
    '</div>';
  }).join('');

  sheet.innerHTML =
    '<div style="width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.3);padding:16px 20px 48px;max-height:90vh;overflow-y:auto">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 14px;cursor:pointer" onclick="menuHomeClosePlanIt()"></div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
        '<div style="font-size:22px">✨</div>' +
        '<div style="font-size:18px;font-weight:800;font-family:Georgia,serif">' + (plan.headline||'Your Plan') + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:16px;line-height:1.5">' + (plan.summary||'') + '</div>' +

      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">TONIGHTS STOPS</div>' +
      stops +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">' +
        '<div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07)">' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:2px">TOTAL COST</div>' +
          '<div style="font-size:13px;font-weight:800;color:#22c55e">' + (plan.total_cost||'') + '</div>' +
        '</div>' +
        '<div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.07)">' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:2px">GETTING AROUND</div>' +
          '<div style="font-size:11px;font-weight:700;color:#06b6d4">' + (plan.ride_note||'') + '</div>' +
        '</div>' +
      '</div>' +

      (plan.pro_tip ? '<div style="padding:12px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.15);border-radius:12px;font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:16px">💡 <strong style="color:#ffd700">Pro tip:</strong> ' + plan.pro_tip + '</div>' : '') +

      '<div style="display:flex;gap:10px">' +
        '<button onclick="window.piState.step=0;window.piRender()" style="flex:1;padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:13px;font-weight:700;font-family:Helvetica Neue,sans-serif;cursor:pointer">← Change It</button>' +
        '<button onclick="itinOpenFromPlanIt()" style="flex:1;padding:13px;border-radius:14px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:13px;font-weight:800;font-family:Helvetica Neue,sans-serif;cursor:pointer">Lets Go →</button>' +
      '</div>' +
    '</div>';
}





function itinOpenFromPlanIt() {
  if (!window.piState || !window.piState.result) { menuHomeClosePlanIt(); return; }
  var plan = window.piState.result;
  var options = {
    startTime: '9:00 PM',
    usingRideshare: window.piState.groupSize >= 5,
    groupSize: window.piState.groupSize || 2,
  };
  // Try to get a real start time based on current time
  try {
    var now = new Date();
    var h = now.getHours(), m = now.getMinutes();
    var roundedM = Math.ceil(m/15)*15;
    if (roundedM === 60) { h++; roundedM = 0; }
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h > 12 ? h-12 : h===0?12:h;
    options.startTime = h12+':'+(roundedM<10?'0':'')+roundedM+' '+ampm;
  } catch(e) {}

  if (typeof itinFromPlan === 'function') {
    var itinObj = itinFromPlan(plan, options);
    menuHomeClosePlanIt();
    setTimeout(function() {
      if (typeof openItineraryBuilder === 'function') openItineraryBuilder(itinObj, false);
    }, 300);
  } else {
    menuHomeClosePlanIt();
  }
}
window.itinOpenFromPlanIt = itinOpenFromPlanIt;
