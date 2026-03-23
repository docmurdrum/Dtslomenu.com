// ══════════════════════════════════════════════
// MISSED_CONNECTIONS.JS
// ══════════════════════════════════════════════

let mcBarFilter = 'all';

function openMCModal()  { document.getElementById('mc-modal').classList.add('open'); }
function closeMCModal() { document.getElementById('mc-modal').classList.remove('open'); }

// ── FILTER ──
function filterMCBar(bar, btn) {
  mcBarFilter = bar;
  document.querySelectorAll('.mc-bar-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadMissedConnections();
}

// ── SUBMIT ──
async function submitMissedConnection() {
  const bar     = document.getElementById('mc-bar').value;
  const time    = document.getElementById('mc-time').value.trim();
  const them    = document.getElementById('mc-them').value.trim();
  const me      = document.getElementById('mc-me').value.trim();
  const msg     = document.getElementById('mc-msg').value.trim();
  const anon    = document.getElementById('mc-anon').checked;

  if (!bar)  { showToast('⚠️ Select where you saw them'); return; }
  if (!them) { showToast('⚠️ Describe the person'); return; }
  if (!msg)  { showToast('⚠️ Write them a message'); return; }

  const username = anon ? null : getUsername();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  try {
    const { error } = await supabaseClient.from('missed_connections').insert({
      bar_name:    bar,
      seen_at:     time || null,
      description: them,
      i_was:       me || null,
      message:     msg,
      username:    username,
      user_id:     currentUser?.id || null,
      expires_at:  expiresAt,
      created_at:  new Date().toISOString(),
    });
    if (error) throw error;
    gainXP(10);
    showToast('💘 Posted! +10 XP');
    closeMCModal();
    ['mc-time','mc-them','mc-me','mc-msg'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('mc-bar').value = '';
    loadMissedConnections();
  } catch(e) {
    showToast('❌ ' + e.message);
  }
}

// ── LOAD FEED ──
async function loadMissedConnections() {
  const feed = document.getElementById('mc-feed');
  if (!feed) return;
  feed.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

  try {
    let query = supabaseClient
      .from('missed_connections')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (mcBarFilter !== 'all') query = query.eq('bar_name', mcBarFilter);

    const { data, error } = await query;
    if (error) throw error;

    if (!data?.length) {
      feed.innerHTML = `
        <div class="empty">
          <div class="empty-icon">💘</div>
          <div class="empty-msg">${mcBarFilter !== 'all' ? 'No missed connections at this bar' : 'No missed connections yet tonight'}</div>
        </div>`;
      return;
    }

    feed.innerHTML = data.map(item => buildMCCard(item)).join('');
  } catch(e) {
    feed.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-msg">Could not load posts</div></div>`;
  }
}

function buildMCCard(item) {
  const ago     = timeAgo(new Date(item.created_at).getTime());
  const expiry  = new Date(item.expires_at);
  const hoursLeft = Math.max(0, Math.round((expiry - Date.now()) / 3600000));
  const poster  = item.username || 'Anonymous';
  const isOwn   = currentUser && item.user_id === currentUser.id;

  return `
    <div class="mc-card">
      <div class="mc-card-top">
        <div class="mc-bar-tag">🍺 ${item.bar_name}</div>
        <div class="mc-expiry">${hoursLeft}h left</div>
      </div>
      ${item.seen_at ? `<div class="mc-time-seen">🕐 Seen around ${item.seen_at}</div>` : ''}
      <div class="mc-message">"${item.message}"</div>
      ${item.description ? `<div class="mc-detail"><span class="mc-detail-label">They were:</span> ${item.description}</div>` : ''}
      ${item.i_was ? `<div class="mc-detail"><span class="mc-detail-label">I was wearing:</span> ${item.i_was}</div>` : ''}
      <div class="mc-footer">
        <div class="mc-poster">💌 ${poster} · ${ago}</div>
        ${!isOwn ? `<button class="mc-reply-btn" onclick="replyMC(${item.id}, '${poster}')">Reply 💘</button>` : `<span style="font-size:11px;color:var(--text2);font-weight:700">Your post</span>`}
      </div>
    </div>`;
}

// ── REPLY ──
async function replyMC(id, poster) {
  const msg = prompt(`Send a message to ${poster}:`);
  if (!msg || !msg.trim()) return;
  if (!currentUser) { showToast('⚠️ Sign in to reply'); return; }

  try {
    const { error } = await supabaseClient.from('mc_replies').insert({
      mc_id:      id,
      sender_id:  currentUser.id,
      sender_name: getUsername(),
      message:    msg.trim(),
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    showToast('💘 Message sent!');
  } catch(e) {
    showToast('❌ ' + e.message);
  }
}

// ── RENDER BAR CHIPS ──
function renderMCBarChips() {
  const row = document.getElementById('mc-bar-filter');
  if (!row) return;
  const bars = [
    "Frog & Peach Pub","Bull's Tavern","McCarthy's Irish Pub",
    "BA Start Arcade Bar","High Bar","Nightcap","Feral Kitchen & Lounge",
    "The Mark","Sidecar SLO","Black Sheep Bar & Grill",
    "The Library","Finney's Crafthouse","Eureka!","Novo Restaurant & Lounge","The Carrisa"
  ];
  row.innerHTML = `<button class="mc-bar-chip active" onclick="filterMCBar('all',this)">All Bars</button>` +
    bars.map(b => `<button class="mc-bar-chip" onclick="filterMCBar('${b.replace(/'/g,"\\'")}',this)">${b.split(' ')[0]}</button>`).join('');
}

// ── INIT ──
function initMissedConnections() {
  renderMCBarChips();
  loadMissedConnections();
}
