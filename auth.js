
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
      await onLogin(data.user);
      showToast('🛠️ Dev login active');
      window._pendingDTSLOEntry = true;
      return;
    }

    // If sign in failed, try to create the account once
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: devEmail, password: devPass,
      options: { data: { username: 'DevUser', gender: 'other' } }
    });

    if (signUpError) throw signUpError;

    if (signUpData.session) {
      await onLogin(signUpData.user);
      showToast('🛠️ Dev account created + logged in');
      window._pendingDTSLOEntry = true;
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
  // Always hide auth, show app
  const authEl = document.getElementById('auth-screen');
  const appEl  = document.getElementById('app');
  if (authEl) authEl.style.display = 'none';
  if (appEl)  { appEl.style.display = 'block'; appEl.style.opacity = '1'; }
  renderAvatar();
  updateUsernameBar();
  await loadUserStats();
  renderProducts();
  loadReports();
  loadLostItems();
  checkThursdayMode();
  setInterval(checkThursdayMode, 60 * 60 * 1000);
  // Load achievements silently
  await loadAchievements();
  await checkAchievements();
  if (isNewUser) {
    maybeShowOnboarding(true);
    // Preload The Freshman as starter character
    await unlockFreshmanStarter(user);
  }
  // If user logged in via DTSLO hub tap, enter DTSLO now
  if (window._pendingDTSLOEntry) {
    window._pendingDTSLOEntry = false;
    setTimeout(function() {
      try { menuHomeEnterDTSLO(); } catch(e) {}
    }, 500);
  } else {
    // Otherwise just show hub screen
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

// Called when user taps DTSLO hub — checks session, shows login if needed
async function requireAuthForDTSLO() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session?.user) {
      // Already logged in — restore session silently then enter
      currentUser = session.user;
      try { await loadUserStats(); } catch(e) {}
      try { renderAvatar(); } catch(e) {}
      // Hide auth screen just in case
      const authEl = document.getElementById('auth-screen');
      if (authEl) authEl.style.display = 'none';
      menuHomeEnterDTSLO();
    } else {
      // Not logged in — show auth with back button
      const authEl = document.getElementById('auth-screen');
      const appEl  = document.getElementById('app');
      if (authEl) authEl.style.display = 'flex';
      if (appEl)  appEl.style.display  = 'none';
      maybeShowAuthBackBtn();
      window._pendingDTSLOEntry = true;
    }
  } catch(e) {
    // On any error — still try to enter if we have a current user
    if (currentUser) {
      menuHomeEnterDTSLO();
    } else {
      const authEl = document.getElementById('auth-screen');
      if (authEl) authEl.style.display = 'flex';
      maybeShowAuthBackBtn();
      window._pendingDTSLOEntry = true;
    }
  }
}
