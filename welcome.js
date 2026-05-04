// ══════════════════════════════════════════════
// WELCOME.JS — First Run Walkthrough + Sign Up
// 4 screens: Welcome → Hubs → Auth → Profile
// ══════════════════════════════════════════════

var WELCOME_LS_KEY = 'hub_dev_welcome_v2_seen';
var _welcomeScreen = 0;
var _welcomeProfile = '';

function welcomeShouldShow() {
  return !localStorage.getItem(WELCOME_LS_KEY);
}

function welcomeMarkSeen() {
  localStorage.setItem(WELCOME_LS_KEY, '1');
}

// Called from intro.js instead of menuHomeInit directly
function welcomeCheckAndLaunch() {
  if (welcomeShouldShow()) {
    welcomeShow();
  } else {
    if (typeof menuHomeInit === 'function') menuHomeInit();
  }
}
window.welcomeCheckAndLaunch = welcomeCheckAndLaunch;

function welcomeShow() {
  var existing = document.getElementById('welcome-overlay');
  if (existing) existing.remove();

  _welcomeScreen = 0;
  _welcomeProfile = '';

  if (!document.getElementById('welcome-css')) {
    var s = document.createElement('style');
    s.id = 'welcome-css';
    s.textContent = [
      '#welcome-overlay{position:fixed;inset:0;z-index:99999;background:#06060f;display:flex;flex-direction:column;font-family:Helvetica Neue,sans-serif}',
      '.wl-dot{width:7px;height:7px;border-radius:50%;transition:all 0.3s;flex-shrink:0}',
      '.wl-dot.active{background:#fff;width:20px;border-radius:4px}',
      '.wl-dot:not(.active){background:rgba(255,255,255,0.2)}',
      '.wl-profile-btn{padding:16px;border-radius:16px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);cursor:pointer;text-align:left;transition:all 0.2s;-webkit-tap-highlight-color:transparent;width:100%;font-family:Helvetica Neue,sans-serif}',
      '.wl-profile-btn.selected{border-color:rgba(255,215,0,0.6);background:rgba(255,215,0,0.08)}',
      '.wl-profile-btn:active{transform:scale(0.98)}',
      '.wl-btn-primary{width:100%;padding:16px;border-radius:16px;border:none;background:linear-gradient(135deg,#fff,#e0e0e0);color:#06060f;font-size:16px;font-weight:900;cursor:pointer;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.wl-btn-primary:active{transform:scale(0.97)}',
      '.wl-btn-ghost{width:100%;padding:14px;border-radius:16px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.6);font-size:14px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif}',
      '.wl-hub-chip{padding:8px 12px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;border:1px solid rgba(255,255,255,0.1)}',
      '.wl-input{width:100%;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:15px;outline:none;box-sizing:border-box;font-family:Helvetica Neue,sans-serif;margin-bottom:10px}',
      '.wl-input:focus{border-color:rgba(255,215,0,0.4)}',
      '@keyframes wl-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}',
      '@keyframes wl-fade-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
      '.wl-animate{animation:wl-fade-in 0.4s ease forwards}',
    ].join('');
    document.head.appendChild(s);
  }

  var overlay = document.createElement('div');
  overlay.id = 'welcome-overlay';
  document.body.appendChild(overlay);
  welcomeRenderScreen(0);
}

function welcomeRenderScreen(n) {
  _welcomeScreen = n;
  var overlay = document.getElementById('welcome-overlay');
  if (!overlay) return;
  overlay.innerHTML = welcomeScreenHTML(n);
}

function welcomeScreenHTML(n) {
  var dots = [0,1,2,3].map(function(i) {
    return '<div class="wl-dot' + (i===n?' active':'') + '"></div>';
  }).join('');
  var dotsBar = '<div style="display:flex;gap:6px;align-items:center;justify-content:center;margin-bottom:32px">' + dots + '</div>';

  if (n === 0) return welcomeScreen0(dotsBar);
  if (n === 1) return welcomeScreen1(dotsBar);
  if (n === 2) return welcomeScreen2(dotsBar);
  if (n === 3) return welcomeScreen3(dotsBar);
  return '';
}

// ── SCREEN 0 — WELCOME ───────────────────────
function welcomeScreen0(dots) {
  return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;text-align:center">' +
    '<div style="font-size:72px;margin-bottom:24px;animation:wl-float 3s ease-in-out infinite">🌆</div>' +
    '<div style="font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:12px">San Luis Obispo</div>' +
    '<div style="font-size:38px;font-weight:900;font-family:Georgia,serif;line-height:1.15;margin-bottom:16px">Your complete<br>SLO guide</div>' +
    '<div style="font-size:16px;color:rgba(255,255,255,0.55);line-height:1.7;max-width:300px">30+ hubs covering nightlife, food, nature, housing, legal rights, and everything in between.</div>' +
  '</div>' +
  '<div style="padding:0 24px 52px">' +
    dots +
    '<button class="wl-btn-primary" onclick="welcomeNext()">Get Started →</button>' +
    '<button class="wl-btn-ghost" style="margin-top:10px" onclick="welcomeSkip()">I\'ve been here before — skip</button>' +
  '</div>';
}

// ── SCREEN 1 — HUBS ──────────────────────────
function welcomeScreen1(dots) {
  var hubs = [
    { emoji:'🌃', name:'Nightlife',     color:'#ff2d78' },
    { emoji:'🍽', name:'Restaurants',   color:'#ff6b35' },
    { emoji:'🏖', name:'Beach',         color:'#06b6d4' },
    { emoji:'🍷', name:'Wine Country',  color:'#8b2fc9' },
    { emoji:'🍺', name:'Craft Beer',    color:'#f59e0b' },
    { emoji:'🌿', name:'Nature',        color:'#22c55e' },
    { emoji:'🏠', name:'Housing',       color:'#10b981' },
    { emoji:'⚖️', name:'Know Rights',  color:'#ef4444' },
    { emoji:'💼', name:'Jobs & Gigs',   color:'#06b6d4' },
    { emoji:'📸', name:'Shot List',     color:'#ec4899' },
    { emoji:'🚨', name:'Emergency',     color:'#ef4444' },
    { emoji:'🏆', name:'Bucket List',   color:'#ffd700' },
    { emoji:'🗺', name:'Day Trips',     color:'#ffd700' },
    { emoji:'🏥', name:'Health',        color:'#10b981' },
    { emoji:'📚', name:'Learn SLO',     color:'#8b5cf6' },
    { emoji:'⚡', name:'Thrill',        color:'#ef4444' },
    { emoji:'🏨', name:'Hotels',        color:'#8b5cf6' },
    { emoji:'🚌', name:'Transit',       color:'#06b6d4' },
  ];

  var chips = hubs.map(function(h) {
    return '<span class="wl-hub-chip" style="background:' + h.color + '15;color:' + h.color + ';border-color:' + h.color + '30">' + h.emoji + ' ' + h.name + '</span>';
  }).join('');

  return '<div style="padding:52px 24px 0;flex-shrink:0">' +
    '<div style="font-size:32px;font-weight:900;font-family:Georgia,serif;margin-bottom:8px;line-height:1.2">30+ hubs,<br>one app</div>' +
    '<div style="font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6">Everything about SLO organized into hubs — tap any to dive in instantly.</div>' +
  '</div>' +
  '<div style="flex:1;overflow:hidden;padding:20px 0;mask-image:linear-gradient(to bottom,transparent 0%,black 15%,black 85%,transparent 100%)">' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 24px;animation:none">' + chips + '</div>' +
  '</div>' +
  '<div style="padding:0 24px 52px;flex-shrink:0">' +
    dots +
    '<button class="wl-btn-primary" onclick="welcomeNext()">Next →</button>' +
  '</div>';
}

// ── SCREEN 2 — SIGN UP ───────────────────────
function welcomeScreen2(dots) {
  return '<div style="flex:1;display:flex;flex-direction:column;padding:52px 24px 0">' +
    '<div style="font-size:32px;font-weight:900;font-family:Georgia,serif;margin-bottom:8px">Create your<br>free account</div>' +
    '<div style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:28px">Save your progress, check in to bars, track your bucket list, and get personalized recommendations.</div>' +

    '<input class="wl-input" id="wl-email" type="email" placeholder="Email address" autocomplete="email">' +
    '<input class="wl-input" id="wl-password" type="password" placeholder="Create a password" autocomplete="new-password">' +
    '<input class="wl-input" id="wl-username" placeholder="Username" autocomplete="username" style="margin-bottom:6px">' +
    '<div id="wl-auth-error" style="display:none;color:#ef4444;font-size:12px;margin-bottom:10px;padding:8px 12px;border-radius:8px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2)"></div>' +

    '<button class="wl-btn-primary" id="wl-signup-btn" onclick="welcomeSignUp()" style="margin-bottom:10px">Create Account</button>' +

    '<div style="display:flex;align-items:center;gap:10px;margin:8px 0 10px">' +
      '<div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.3)">or</div>' +
      '<div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>' +
    '</div>' +

    '<button class="wl-btn-ghost" onclick="welcomeShowLogin()" style="margin-bottom:10px">Already have an account — Log in</button>' +
    '<div id="wl-login-section" style="display:none">' +
      '<input class="wl-input" id="wl-login-email" type="email" placeholder="Email address">' +
      '<input class="wl-input" id="wl-login-password" type="password" placeholder="Password">' +
      '<button class="wl-btn-primary" onclick="welcomeLogin()" style="margin-bottom:10px">Log In</button>' +
    '</div>' +
  '</div>' +
  '<div style="padding:16px 24px 52px;flex-shrink:0">' +
    dots +
    '<button class="wl-btn-ghost" onclick="welcomeNext()">Continue as guest →</button>' +
    '<div style="font-size:11px;color:rgba(255,255,255,0.25);text-align:center;margin-top:10px;line-height:1.5">Guest mode has limited features. Create a free account to unlock check-ins, bucket list tracking, appointments, and personalized hubs.</div>' +
  '</div>';
}

// ── SCREEN 3 — PROFILE ───────────────────────
function welcomeScreen3(dots) {
  var profiles = [
    { id:'student', emoji:'🎓', name:'Cal Poly Student', desc:'Campus resources, student discounts, Handshake jobs, Cal Poly events.' },
    { id:'local',   emoji:'🏠', name:'SLO Local',        desc:'Community listings, civic info, local events, neighborhood resources.' },
    { id:'visitor', emoji:'🌴', name:'Visitor',          desc:'Hotels, day trips, tours, restaurants, things to do in SLO.' },
  ];

  var btns = profiles.map(function(p) {
    return '<button class="wl-profile-btn" data-wpid="' + p.id + '" onclick="welcomeSelectProfile(this,this.dataset.wpid)" style="margin-bottom:10px">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="font-size:28px;flex-shrink:0">' + p.emoji + '</div>' +
        '<div>' +
          '<div style="font-size:15px;font-weight:800;margin-bottom:3px">' + p.name + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.4">' + p.desc + '</div>' +
        '</div>' +
      '</div>' +
    '</button>';
  }).join('');

  return '<div style="flex:1;display:flex;flex-direction:column;padding:52px 24px 0">' +
    '<div style="font-size:32px;font-weight:900;font-family:Georgia,serif;margin-bottom:8px">How do you<br>know SLO?</div>' +
    '<div style="font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:24px">This personalizes your hub order and recommendations. You can change it anytime.</div>' +
    btns +
  '</div>' +
  '<div style="padding:16px 24px 52px;flex-shrink:0">' +
    dots +
    '<button class="wl-btn-primary" id="wl-finish-btn" onclick="welcomeFinish()" style="opacity:0.4;pointer-events:none">Let\'s Go →</button>' +
  '</div>';
}

// ── ACTIONS ──────────────────────────────────
function welcomeNext() {
  var next = _welcomeScreen + 1;
  if (next > 3) { welcomeFinish(); return; }
  welcomeRenderScreen(next);
}
window.welcomeNext = welcomeNext;

function welcomeSkip() {
  welcomeMarkSeen();
  welcomeDismiss();
}
window.welcomeSkip = welcomeSkip;

function welcomeShowLogin() {
  var ls = document.getElementById('wl-login-section');
  if (ls) ls.style.display = ls.style.display === 'none' ? 'block' : 'none';
}
window.welcomeShowLogin = welcomeShowLogin;

function welcomeSelectProfile(el, profileId) {
  _welcomeProfile = profileId;
  document.querySelectorAll('.wl-profile-btn').forEach(function(b) { b.classList.remove('selected'); });
  el.classList.add('selected');
  var btn = document.getElementById('wl-finish-btn');
  if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
}
window.welcomeSelectProfile = welcomeSelectProfile;

async function welcomeSignUp() {
  var email    = (document.getElementById('wl-email')||{}).value || '';
  var password = (document.getElementById('wl-password')||{}).value || '';
  var username = (document.getElementById('wl-username')||{}).value || '';
  var errEl    = document.getElementById('wl-auth-error');
  var btn      = document.getElementById('wl-signup-btn');

  if (!email || !password || !username) {
    if (errEl) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; }
    return;
  }
  if (password.length < 6) {
    if (errEl) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; }
    return;
  }

  if (btn) { btn.textContent = 'Creating account...'; btn.style.opacity = '0.6'; btn.style.pointerEvents = 'none'; }
  if (errEl) errEl.style.display = 'none';

  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No connection');
    var res = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: username } }
    });
    if (res.error) throw res.error;
    if (res.data && res.data.user) {
      window.currentUser = res.data.user;
      if (typeof onLogin === 'function') await onLogin(res.data.user);
    }
    welcomeRenderScreen(3); // go to profile screen
  } catch(e) {
    if (errEl) { errEl.textContent = e.message || 'Sign up failed. Try again.'; errEl.style.display = 'block'; }
    if (btn) { btn.textContent = 'Create Account'; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
  }
}
window.welcomeSignUp = welcomeSignUp;

async function welcomeLogin() {
  var email    = (document.getElementById('wl-login-email')||{}).value || '';
  var password = (document.getElementById('wl-login-password')||{}).value || '';

  if (!email || !password) return;
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No connection');
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw res.error;
    if (res.data && res.data.user) {
      window.currentUser = res.data.user;
      if (typeof onLogin === 'function') await onLogin(res.data.user);
    }
    welcomeRenderScreen(3);
  } catch(e) {
    var errEl = document.getElementById('wl-auth-error');
    if (errEl) { errEl.textContent = e.message || 'Login failed.'; errEl.style.display = 'block'; }
  }
}
window.welcomeLogin = welcomeLogin;

async function welcomeFinish() {
  // Save profile preference
  if (_welcomeProfile) {
    try { localStorage.setItem('hub_dev_profile', _welcomeProfile); } catch(e) {}
    // Save to Supabase if logged in
    if (window.currentUser && window.supabaseClient) {
      try {
        await window.supabaseClient.auth.updateUser({ data: { profile: _welcomeProfile } });
      } catch(e) {}
    }
  }
  welcomeMarkSeen();
  welcomeDismiss();
}
window.welcomeFinish = welcomeFinish;

function welcomeDismiss() {
  var overlay = document.getElementById('welcome-overlay');
  if (overlay) {
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '0';
    setTimeout(function() {
      overlay.remove();
      if (typeof menuHomeInit === 'function') menuHomeInit();
    }, 420);
  } else {
    if (typeof menuHomeInit === 'function') menuHomeInit();
  }
}
window.welcomeDismiss = welcomeDismiss;

// Dev reset — call welcomeReset() in console to see welcome again
function welcomeReset() {
  localStorage.removeItem('hub_dev_welcome_v2_seen');
  localStorage.removeItem('hub_dev_profile');
  console.log('[Welcome] Reset. Reload to see welcome screen.');
}
window.welcomeReset = welcomeReset;
