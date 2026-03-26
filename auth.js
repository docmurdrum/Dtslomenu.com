
// ── AUTH BACK TO MAP ──
function authBackToMap() {
  // Hide auth, show hub map
  var auth = document.getElementById('auth-screen');
  var app  = document.getElementById('app');
  if (auth) auth.style.display = 'none';
  if (app)  app.style.display  = 'none';
  // Re-init hub screen
  try {
    if (typeof menuHomeInit === 'function') menuHomeInit();
  } catch(e) {}
}

// Show X button on auth when hub screen has been seen
function maybeShowAuthBackBtn() {
  var btn = document.getElementById('auth-back-btn');
  if (btn && localStorage.getItem('menu_open_count')) {
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
  }
}

// ══════════════════════════════════════════════
// AUTH.JS — Login, Signup, Session
// ══════════════════════════════════════════════

// ── AUTH TABS ──
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((b, i) =>
    b.classList.toggle('active', (tab === 'login' ? i === 0 : i === 1))
  );
  document.getElementById('login-form').style.display  = tab === 'login'  ? 'flex' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'flex' : 'none';
  document.getElementById('login-error').style.display  = 'none';
  document.getElementById('signup-error').style.display = 'none';
}

function showAuthError(form, msg) {
  const el = document.getElementById(form + '-error');
  el.textContent = msg;
  el.style.display = 'block';
}

// ── DEV LOGIN ──
async function devLogin() {
  const btn = event.target;
  btn.disabled = true; btn.textContent = '⏳ Logging in…';

  // Use fixed dev credentials — sign up once, then always sign in
  const devEmail = 'devtest@dtslomenu.com';
  const devPass  = 'DTSLOdev2024!';

  try {
    // Try sign in first
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: devEmail, password: devPass
    });

    if (!error && data.session) {
      window._pendingDTSLOEntry = true;
      await onLogin(data.user);
      showToast('🛠️ Dev login active');
      return;
    }

    // If sign in failed, try to create the account once
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: devEmail, password: devPass,
      options: { data: { username: 'DevUser', gender: 'other' } }
    });

    if (signUpError) throw signUpError;

    if (signUpData.session) {
      window._pendingDTSLOEntry = true;
      await onLogin(signUpData.user);
      showToast('🛠️ Dev account created + logged in');
      return;
    }

    // Account exists but needs email confirm — bypass for dev
    showAuthError('login', '⚠️ Dev account needs email confirm. Check devtest@dtslomenu.com or disable email confirm in Supabase Auth settings.');

  } catch(e) {
    showAuthError('login', '❌ Dev login failed: ' + e.message);
  }
  btn.disabled = false; btn.textContent = '🛠️ Dev Login';
}

// ── LOGIN ──
async function doLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-btn');
  document.getElementById('login-error').style.display = 'none';
  if (!email || !password) { showAuthError('login', 'Please fill in all fields.'); return; }
  btn.disabled = true; btn.textContent = 'Signing in…';
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await onLogin(data.user);
  } catch (e) {
    showAuthError('login', e.message || 'Login failed. Check your credentials.');
    btn.disabled = false; btn.textContent = 'Sign In';
  }
}

// ── SIGNUP ──
async function doSignup() {
  const username = document.getElementById('signup-username').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const btn      = document.getElementById('signup-btn');
  document.getElementById('signup-error').style.display = 'none';

  const gender = document.getElementById('signup-gender').value;
  if (!username || !email || !password) { showAuthError('signup', 'Please fill in all fields.'); return; }
  if (!gender) { showAuthError('signup', 'Please select your gender.'); return; }
  if (username.length < 3) { showAuthError('signup', 'Username must be at least 3 characters.'); return; }
  if (password.length < 6) { showAuthError('signup', 'Password must be at least 6 characters.'); return; }

  btn.disabled = true; btn.textContent = 'Creating account…';

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email, password, options: { data: { username, gender } }
    });

    if (error) throw error;

    if (data.session) {
      await onLogin(data.user, true); // true = new user
      return;
    }

    const errEl = document.getElementById('signup-error');
    errEl.style.background  = 'rgba(34,197,94,0.1)';
    errEl.style.borderColor = 'rgba(34,197,94,0.3)';
    errEl.style.color       = 'var(--green)';
    errEl.textContent = '✅ Account created! Check your email for a confirmation link, then sign in.';
    errEl.style.display = 'block';

  } catch (e) {
    const msg = e.message || 'Signup failed.';
    showAuthError('signup', msg.toLowerCase().includes('already')
      ? '⚠️ An account with that email already exists. Try signing in.'
      : msg);
  }

  btn.disabled = false; btn.textContent = 'Create Account';
}

// ── ON LOGIN ──
async function onLogin(user, isNewUser = false) {
  currentUser = user;

  // Capture the flag NOW before any async work
  const goingToDTSLO = !!window._pendingDTSLOEntry;

  // Hide auth screen always
  const authEl = document.getElementById('auth-screen');
  if (authEl) authEl.style.display = 'none';

  // If going to DTSLO, call it immediately — don't wait for data loads
  if (goingToDTSLO) {
    goToDTSLO();
  } else {
    // Show app for non-DTSLO login paths
    const appEl = document.getElementById('app');
    if (appEl) { appEl.style.display = 'block'; appEl.style.opacity = '1'; }
  }

  // Load user data in background — non-blocking
  try { renderAvatar(); } catch(e) {}
  try { updateUsernameBar(); } catch(e) {}
  try { loadUserStats(); } catch(e) {}
  try { renderProducts(); } catch(e) {}
  try { loadReports(); } catch(e) {}
  try { loadLostItems(); } catch(e) {}
  try { checkThursdayMode(); } catch(e) {}

  // These can run after — don't block entry
  setTimeout(async function() {
    try { await loadAchievements(); } catch(e) {}
    try { await checkAchievements(); } catch(e) {}
    if (isNewUser) {
      try { maybeShowOnboarding(true); } catch(e) {}
      try { await unlockFreshmanStarter(user); } catch(e) {}
    }
  }, 500);

  // If NOT going to DTSLO, show hub screen
  if (!goingToDTSLO) {
    try { if (typeof menuHomeInit === 'function') menuHomeInit(); } catch(e) {}
  }
}


// ── UNLOCK FRESHMAN STARTER CHARACTER ──
async function unlockFreshmanStarter(user) {
  if (!user) return;
  try {
    // Check if already unlocked
    const { data } = await supabaseClient
      .from('character_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('character_id', 1)
      .single();
    if (data) return; // already has it
    // Unlock The Freshman
    await supabaseClient.from('character_progress').insert({
      user_id:            user.id,
      character_id:       1,
      completed_missions: [],
      completion_pct:     0,
      unlocked_at:        new Date().toISOString()
    });
    showToast('🎭 The Freshman unlocked!');
  } catch(e) {
    // Silent — may fail if table not ready
    console.warn('Starter character unlock:', e.message);
  }
}

// ── SIGN OUT ──
async function doSignout() {
  await supabaseClient.auth.signOut();
  currentUser = null; userXP = 0; reportCount = 0; postCount = 0;
  cart = {};
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex'; maybeShowAuthBackBtn();
  showPage('line');
  showToast('👋 Signed out');
}

// ── CHANGE PASSWORD ──
function toggleChangePw() {
  document.getElementById('change-pw-box').classList.toggle('open');
}

async function doChangePassword() {
  const pw  = document.getElementById('new-pw').value;
  const pw2 = document.getElementById('new-pw2').value;
  if (!pw || pw.length < 6) { showToast('⚠️ Password must be 6+ characters'); return; }
  if (pw !== pw2) { showToast('⚠️ Passwords do not match'); return; }
  try {
    const { error } = await supabaseClient.auth.updateUser({ password: pw });
    if (error) throw error;
    showToast('✅ Password updated!');
    document.getElementById('change-pw-box').classList.remove('open');
    document.getElementById('new-pw').value = '';
    document.getElementById('new-pw2').value = '';
  } catch (e) {
    showToast('❌ ' + (e.message || 'Update failed'));
  }
}

// ── SESSION INIT ──
// Map loads first. Auth only happens when DTSLO hub is tapped.
// If a session exists from a previous login, it's silently restored
// AFTER the map is visible — never as a blocking step on load.

window.onload = function () {
  // Step 1: Hide auth screen, show nothing — hub screen takes over
  var authEl = document.getElementById('auth-screen');
  var appEl  = document.getElementById('app');
  if (authEl) authEl.style.display = 'none';
  if (appEl)  appEl.style.display  = 'none';

  // Step 2: Launch hub map immediately
  try {
    if (typeof menuHomeInit === 'function') menuHomeInit();
  } catch(e) {}

  // Step 3: Silently restore session in background — no UI interruption
  // Uses a short delay so the map renders first
  setTimeout(function() {
    try {
      supabaseClient.auth.getSession().then(function(result) {
        var session = result && result.data && result.data.session;
        if (session && session.user) {
          // Session found — restore silently, no visible change
          currentUser = session.user;
          // Pre-load user data in background without showing app
          try { loadUserStats(); } catch(e) {}
          try { renderAvatar(); } catch(e) {}
        }
      }).catch(function() {});
    } catch(e) {}

    // Listen for future auth changes (sign in / sign out)
    try {
      supabaseClient.auth.onAuthStateChange(function(event, session) {
        if (event === 'SIGNED_OUT') {
          currentUser = null;
        }
        // SIGNED_IN is handled by requireAuthForDTSLO — not here
      });
    } catch(e) {}
  }, 800); // Wait for map to render first
};

// Called when user taps DTSLO hub
async function requireAuthForDTSLO() {
  // If already logged in — go straight in
  if (currentUser) {
    goToDTSLO();
    return;
  }
  // Check for a stored session
  try {
    const { data } = await supabaseClient.auth.getSession();
    if (data && data.session && data.session.user) {
      currentUser = data.session.user;
      goToDTSLO();
      return;
    }
  } catch(e) {}

  // Not logged in — show login screen ABOVE hub screen
  window._pendingDTSLOEntry = true;
  const authEl = document.getElementById('auth-screen');
  const appEl  = document.getElementById('app');
  if (authEl) {
    authEl.style.display  = 'flex';
    authEl.style.zIndex   = '9999'; // above menu-home (9998)
    authEl.style.position = 'fixed';
    authEl.style.inset    = '0';
  }
  if (appEl) appEl.style.display = 'none';
  maybeShowAuthBackBtn();
}

// The ONE function that shows the DTSLO app — called from everywhere
function goToDTSLO() {
  window._pendingDTSLOEntry = false;

  // Hide hub screen
  var hubEl = document.getElementById('menu-home');
  if (hubEl) {
    hubEl.style.display = 'none';
    hubEl.style.pointerEvents = 'none';
  }

  // Hide auth screen
  var authEl = document.getElementById('auth-screen');
  if (authEl) authEl.style.display = 'none';

  // Show app
  var appEl = document.getElementById('app');
  if (appEl) {
    appEl.style.display  = 'block';
    appEl.style.opacity  = '1';
    appEl.style.zIndex   = '1';
    appEl.style.pointerEvents = 'auto';
  }

  // Make sure a page is active
  var activePage = document.querySelector('.page.active');
  if (!activePage) {
    var linePage = document.getElementById('line');
    if (linePage) {
      linePage.classList.add('active');
    }
  }

  // Load data if we have a user
  if (currentUser) {
    try { renderAvatar(); }      catch(e) {}
    try { updateUsernameBar(); } catch(e) {}
    try { loadReports(); }       catch(e) {}
    try { loadUserStats(); }     catch(e) {}
  }
}
window.goToDTSLO = goToDTSLO;
