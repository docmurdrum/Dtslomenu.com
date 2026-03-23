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
  const devEmail = 'dev_temp_' + Math.random().toString(36).slice(2,8) + '@dtslo.dev';
  const devPass  = 'devpass123';
  const btn      = event.target;
  btn.disabled = true; btn.textContent = '⏳ Logging in…';
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: devEmail, password: devPass,
      options: { data: { username: 'DevUser_' + devEmail.slice(9,15), gender: 'other' } }
    });
    if (error) throw error;
    if (data.session) {
      await onLogin(data.user);
      showToast('🛠️ Dev login active — temp account');
      return;
    }
    throw new Error('No session returned');
  } catch(e) {
    showAuthError('login', '❌ Dev login failed: ' + e.message);
  }
  btn.disabled = false; btn.textContent = '🛠️ Dev Login (Temp)';
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
      await onLogin(data.user);
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
async function onLogin(user) {
  currentUser = user;
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  renderAvatar();
  await loadUserStats();
  renderProducts();
  loadReports();
  loadLostItems();
  checkThursdayMode();
  setInterval(checkThursdayMode, 60 * 60 * 1000);
}

// ── SIGN OUT ──
async function doSignout() {
  await supabaseClient.auth.signOut();
  currentUser = null; userXP = 0; reportCount = 0; postCount = 0;
  cart = {};
  document.getElementById('app').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
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
window.onload = async function () {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session?.user) await onLogin(session.user);
  } catch (e) {
    console.log('Session check failed:', e);
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user && !currentUser) {
      await onLogin(session.user);
    }
    if (event === 'SIGNED_OUT') {
      currentUser = null;
    }
  });
};
