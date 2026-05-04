// ══════════════════════════════════════════════
// PROFILE.JS — Profile, XP, Level, Badges
// Rewritten: character system removed.
// Badge showcase replaces character card.
// Max level: 100. XP per level: 100.
// ══════════════════════════════════════════════

// ── FEEDBACK ──
var currentFeedbackType = 'bug';

function showFeedback() {
  var modal = document.getElementById('feedback-modal');
  if (modal) modal.style.display = 'flex';
}

function closeFeedback() {
  var modal = document.getElementById('feedback-modal');
  if (modal) modal.style.display = 'none';
  var txt = document.getElementById('feedback-text');
  if (txt) txt.value = '';
}

function selectFeedbackType(el, type) {
  document.querySelectorAll('.fb-type').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  currentFeedbackType = type;
}

async function submitFeedback() {
  var text  = document.getElementById('feedback-text')?.value?.trim();
  var email = document.getElementById('feedback-email')?.value?.trim();
  var btn   = document.getElementById('feedback-submit-btn');
  if (!text) {
    document.getElementById('feedback-text').style.borderColor = 'rgba(255,45,120,0.5)';
    setTimeout(function() {
      document.getElementById('feedback-text').style.borderColor = 'rgba(255,255,255,0.1)';
    }, 1500);
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
  try {
    await supabaseClient.from('feedback').insert([{
      type:        currentFeedbackType,
      message:     text,
      email:       email || null,
      user_id:     currentUser?.id || null,
      app_version: 'v2.3.4',
      created_at:  new Date().toISOString()
    }]);
    closeFeedback();
    showToast('✅ Feedback sent — thank you!');
  } catch(e) {
    try {
      var existing = JSON.parse(localStorage.getItem('dtslo_pending_feedback') || '[]');
      existing.push({ type: currentFeedbackType, message: text, email, ts: Date.now() });
      localStorage.setItem('dtslo_pending_feedback', JSON.stringify(existing));
    } catch(le) {}
    closeFeedback();
    showToast('✅ Feedback saved!');
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Send Feedback →'; }
}

// ── SKIP INTRO PREFERENCE ──
function saveSkipIntroPref(on) {
  localStorage.setItem('menu_skip_intro', on ? '1' : '0');
}

function loadSkipIntroPref() {
  const toggle = document.getElementById('pref-skip-intro');
  if (toggle) toggle.checked = localStorage.getItem('menu_skip_intro') === '1';
}

function saveSkipToDTSLOPref(on) {
  localStorage.setItem('menu_skip_to_dtslo', on ? '1' : '0');
}

function loadSkipToDTSLOPref() {
  const toggle = document.getElementById('pref-skip-to-dtslo');
  if (toggle) toggle.checked = localStorage.getItem('menu_skip_to_dtslo') === '1';
}

// ── LEVEL UP MESSAGES ──
const LEVELUP_MESSAGES = [
  "First step into the DTSLO night. The city doesn't know you yet.",
  "Getting warmer. The bars are starting to notice.",
  "You've got the feel of the night now.",
  "A regular is forming. Bartenders are learning your face.",
  "The vibe is strong with this one.",
  "You know which nights are worth it now.",
  "Instincts are sharpening. You move through crowds easy.",
  "The city is yours to read like a map.",
  "You've seen things. You know things.",
  "Half the battle is showing up. You always show up.",
  "Your reputation precedes you down Higuera.",
  "Bouncers nod. Bartenders pour early.",
  "The night bends toward you a little now.",
  "You've outlasted rookies. Many of them.",
  "SLO nightlife is part of your DNA now.",
  "You're not just attending the night — you're shaping it.",
  "The crowd moves differently when you're in it.",
  "Legend status is no longer theoretical.",
  "You are the reason people say 'downtown was great tonight.'",
  "The city exhales when you walk in.",
  "Halfway to the top. SLO knows your name.",
  "The night is an open book and you've read it twice.",
  "You've earned every point the hard way.",
  "People ask you where to go. You never have to think.",
  "You've seen every kind of night this city has.",
  "Your presence changes the energy of a room.",
  "The regulars know you. The bouncers respect you.",
  "You've built something real here. City by city, night by night.",
  "The leaderboard is just a number. Your reputation is the real score.",
  "Thirty levels in. You're not stopping now.",
  "The city has given you everything. You've given it back.",
  "You move through downtown like you built the place.",
  "Five years from now someone will tell a story about tonight.",
  "You don't just attend the night — you define it.",
  "Every level is a memory. Every memory is a level.",
  "The night listens when you talk.",
  "You are what SLO nights are made of.",
  "The bars, the streets, the people — you know them all.",
  "Almost legendary. Almost isn't good enough.",
  "Forty levels. Countless nights. Zero regrets.",
  "The city bends for you now.",
  "Your name is part of the downtown story.",
  "Every level earned is a night remembered.",
  "The real flex is consistency. You've got it.",
  "SLO doesn't have a better regular than you.",
  "The night was always going to end up here.",
  "You've made it look effortless. It wasn't.",
  "This close to the top. Don't stop.",
  "One level away from everything.",
  "Level 50. Half a legend.",
  "The second half is where the real story starts.",
  "You've earned the respect of everyone who matters.",
  "The city owes you a few nights at this point.",
  "People come here because of what you helped build.",
  "Your story is woven into this downtown.",
  "The nights are yours now. Completely.",
  "Nobody here has seen more than you.",
  "The highest levels are earned by the most dedicated.",
  "Almost at the top. The view is worth it.",
  "You are the night.",
  "Sixty levels of pure dedication.",
  "The leaderboard is your legacy.",
  "SLO legends are made of this.",
  "Every night out was an investment. It paid off.",
  "You've outlasted the trends, the crowds, and the doubters.",
  "The city recognizes greatness. It recognizes you.",
  "Seventy levels. Unstoppable.",
  "You've been here for the best of it.",
  "The night will always remember you.",
  "Not many people make it this far. You did.",
  "Eighty levels. The city is yours.",
  "Your consistency is unmatched. Your story is unmatched.",
  "This is what dedication to a city looks like.",
  "You've seen SLO at its best. You helped make it that way.",
  "Ninety levels. Almost the top.",
  "The last ten are for the truly dedicated.",
  "You are what this app was built for.",
  "One more. Just one more.",
  "SLO ICON. Level 100. You made it.",
];

// ══════════════════════════════════════════════
// TITLE SYSTEM — level titles shown on profile
// Extends to level 100
// ══════════════════════════════════════════════

const TITLES = [
  { level: 1,   title: 'The Newcomer',     color: 'rgba(255,255,255,0.3)' },
  { level: 5,   title: 'Getting Started',  color: 'rgba(255,255,255,0.45)' },
  { level: 10,  title: 'The Regular',      color: 'rgba(255,255,255,0.6)' },
  { level: 15,  title: 'Bar Star',         color: '#ffd700' },
  { level: 20,  title: 'Scene Kid',        color: '#00f5ff' },
  { level: 25,  title: 'Downtown Local',   color: '#b44fff' },
  { level: 30,  title: 'SLO Insider',      color: '#ff2d78' },
  { level: 40,  title: 'SLO Legend',       color: 'linear-gradient(90deg,#ff2d78,#ffd700)' },
  { level: 50,  title: 'MENU OG',          color: 'linear-gradient(90deg,#ffd700,#b44fff)' },
  { level: 60,  title: 'City Regular',     color: 'linear-gradient(90deg,#00f5ff,#b44fff)' },
  { level: 70,  title: 'SLO Native',       color: 'linear-gradient(90deg,#ff2d78,#00f5ff)' },
  { level: 80,  title: 'Downtown Legend',  color: 'linear-gradient(90deg,#ffd700,#ff2d78,#b44fff)' },
  { level: 90,  title: 'SLO Icon',         color: 'linear-gradient(90deg,#b44fff,#ffd700,#00f5ff)' },
  { level: 100, title: '⭐ SLO IMMORTAL',  color: 'linear-gradient(90deg,#ffd700,#ff2d78,#b44fff,#00f5ff)' },
];

const ITEMS = [
  { level: 5,   emoji: '⭐', label: 'First Star',     rarity: 'common'    },
  { level: 10,  emoji: '🎯', label: 'Sharp Eye',      rarity: 'common'    },
  { level: 15,  emoji: '🔥', label: 'On Fire',        rarity: 'uncommon'  },
  { level: 20,  emoji: '💎', label: 'Diamond',        rarity: 'uncommon'  },
  { level: 25,  emoji: '👑', label: 'Crown',          rarity: 'rare'      },
  { level: 30,  emoji: '🌟', label: 'All Star',       rarity: 'rare'      },
  { level: 40,  emoji: '⚡', label: 'Electric',       rarity: 'rare'      },
  { level: 50,  emoji: '🏆', label: 'Champion',       rarity: 'legendary' },
  { level: 60,  emoji: '🎭', label: 'Icon',           rarity: 'legendary' },
  { level: 70,  emoji: '🌈', label: 'MENU OG',        rarity: 'legendary' },
  { level: 80,  emoji: '🔮', label: 'Visionary',      rarity: 'legendary' },
  { level: 90,  emoji: '🌙', label: 'Night Eternal',  rarity: 'legendary' },
  { level: 100, emoji: '💫', label: 'SLO Immortal',   rarity: 'legendary' },
];

function getTitleForLevel(level) {
  let current = TITLES[0];
  for (const t of TITLES) {
    if (level >= t.level) current = t;
  }
  return current;
}

function getItemsForLevel(level) {
  return ITEMS.filter(i => level >= i.level);
}

function renderTitleAndItems(level) {
  const titleData = getTitleForLevel(level);
  const items     = getItemsForLevel(level);

  const titleRow   = document.getElementById('char-title-row');
  const titleBadge = document.getElementById('char-title-badge');
  if (titleRow && titleBadge && level > 0) {
    titleBadge.textContent = titleData.title;
    titleBadge.style.background = titleData.color.includes('gradient')
      ? titleData.color + '22'
      : 'rgba(255,215,0,0.1)';
    titleRow.style.display = 'block';
  }

  const itemsRow = document.getElementById('char-items-row');
  if (itemsRow && items.length) {
    itemsRow.style.display = 'flex';
    itemsRow.innerHTML = items.map(function(i) {
      return '<div title="' + i.label + '" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:16px">' + i.emoji + '</div>';
    }).join('');
  }
}

// ══════════════════════════════════════════════
// RENDER PROFILE
// ══════════════════════════════════════════════

function renderProfile() {
  const username = getUsername();
  const email    = currentUser?.email || '—';
  const joined   = currentUser?.created_at
    ? 'Joined ' + new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Joined recently';

  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) avatarEl.textContent = username[0]?.toUpperCase() || '?';

  const usernameEl = document.getElementById('profile-username');
  if (usernameEl) usernameEl.textContent = username;

  const emailEl = document.getElementById('profile-email');
  if (emailEl) emailEl.textContent = email;

  const joinedEl = document.getElementById('profile-joined');
  if (joinedEl) joinedEl.textContent = joined;

  updateDevGenderLabel();

  // Level + XP bar
  const level    = Math.min(100, Math.floor(userXP / 100) + 1);
  const progress = level >= 100 ? 100 : userXP % 100;
  const toNext   = level >= 100 ? 0 : 100 - progress;

  const statXP = document.getElementById('stat-xp');
  if (statXP) statXP.textContent = userXP;

  const statReports = document.getElementById('stat-reports');
  if (statReports) statReports.textContent = reportCount;

  const statPosts = document.getElementById('stat-posts');
  if (statPosts) statPosts.textContent = postCount;

  const levelBadge = document.getElementById('xp-level-badge');
  if (levelBadge) levelBadge.textContent = level >= 100 ? 'MAX LEVEL' : 'Level ' + level;

  const xpSub = document.getElementById('xp-sub');
  if (xpSub) xpSub.textContent = level >= 100
    ? userXP + ' XP · Max level reached!'
    : userXP + ' XP · ' + toNext + ' XP to next level';

  setTimeout(function() {
    const fill = document.getElementById('xp-fill');
    if (fill) fill.style.width = progress + '%';
  }, 60);

  // Title + items
  renderTitleAndItems(level);

  // Extra async stats
  loadProfileExtras();
}

async function loadProfileExtras() {
  if (!currentUser) return;

  // Streak
  const streak = await getCheckinStreak();
  const streakEl = document.getElementById('stat-streak');
  if (streakEl) streakEl.textContent = streak;

  const streakPill  = document.getElementById('streak-pill');
  const streakCount = document.getElementById('streak-count');
  if (streakPill && streakCount) {
    streakCount.textContent = streak;
    streakPill.style.display = streak > 0 ? 'inline-flex' : 'none';
  }

  // Duel wins
  const duelWins = await getDuelWins();
  const duelEl = document.getElementById('stat-duel-wins');
  if (duelEl) duelEl.textContent = duelWins;

  // Prediction accuracy
  try {
    const { data } = await supabaseClient
      .from('predictions')
      .select('correct_count, pick_count')
      .eq('user_id', currentUser.id)
      .not('correct_count', 'is', null);
    if (data && data.length > 0) {
      const totalPicks = data.reduce((s, r) => s + (r.pick_count  || 0), 0);
      const totalRight = data.reduce((s, r) => s + (r.correct_count || 0), 0);
      const acc = totalPicks > 0 ? Math.round((totalRight / totalPicks) * 100) + '%' : '—';
      const accEl = document.getElementById('stat-pred-acc');
      if (accEl) accEl.textContent = acc;
    }
  } catch(e) { /* silent */ }

  // Badge showcase
  if (typeof renderBadgeShowcase === 'function') renderBadgeShowcase();

  // Achievement count
  const countEl = document.getElementById('ach-modal-count');
  if (countEl) countEl.textContent = earnedAchievements.size + ' earned';

  // Activity feed
  loadActivityFeed();

  // Leaderboard rank
  if (typeof loadProfileRank === 'function') loadProfileRank();

  // PWA install prompt — 3s delay
  setTimeout(function() { if (typeof pwaShowBanner === 'function') pwaShowBanner(); }, 3000);

  // MOTD
  setTimeout(function() { if (typeof checkMotd === 'function') checkMotd(); }, 1500);
}

// ══════════════════════════════════════════════
// LEVEL UP
// Called from addXP in shared.js when level increases.
// No image generation — shows message + confetti.
// ══════════════════════════════════════════════

function onLevelUp(newLevel) {
  if (window._devSuppressLevelUp) return;
  fireConfetti();
  showLevelUpPopup(newLevel);
}
window.onLevelUp = onLevelUp;

function showLevelUpPopup(level) {
  const msgIndex = Math.min(level - 1, LEVELUP_MESSAGES.length - 1);
  const msg      = LEVELUP_MESSAGES[msgIndex];
  const title    = getTitleForLevel(level);

  const overlay = document.getElementById('levelup-overlay');
  if (!overlay) return;

  const levelEl = document.getElementById('lu-level');
  const msgEl   = document.getElementById('lu-msg');
  const titleEl = document.getElementById('lu-title');

  if (levelEl) levelEl.textContent = level;
  if (msgEl)   msgEl.textContent   = msg;
  if (titleEl) {
    titleEl.textContent = title.title;
    titleEl.style.background = title.color.includes('gradient') ? title.color : 'none';
    titleEl.style.webkitBackgroundClip = title.color.includes('gradient') ? 'text' : 'unset';
    titleEl.style.webkitTextFillColor  = title.color.includes('gradient') ? 'transparent' : title.color;
  }

  overlay.classList.add('show');
}

function closeLevelUp() {
  const overlay = document.getElementById('levelup-overlay');
  if (overlay) overlay.classList.remove('show');
  renderProfile();
}
window.closeLevelUp = closeLevelUp;

// ══════════════════════════════════════════════
// XP EFFECT — visual feedback for gaining XP
// gainXP is kept for backwards compatibility
// (missions.js calls it). It now delegates to addXP.
// ══════════════════════════════════════════════

function xpGainEffect(amount) {
  const fill = document.getElementById('xp-fill');
  if (fill) {
    fill.classList.remove('gaining');
    void fill.offsetWidth;
    fill.classList.add('gaining');
    setTimeout(() => fill.classList.remove('gaining'), 1800);
  }
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.textContent = '+' + (amount || '') + ' XP ⚡';
  toast.style.bottom = '120px';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

// Backwards compat wrapper — missions.js and bar_golf.js call gainXP
function gainXP(amount) {
  xpGainEffect(amount);
  if (typeof addXP === 'function') addXP(amount);
}
window.gainXP = gainXP;

// ══════════════════════════════════════════════
// DEV TOOLS
// ══════════════════════════════════════════════

function devAddXP() {
  if (typeof addXP === 'function') addXP(100);
  showToast('⚡ +100 XP added');
}

function devResetXP() {
  userXP = 0; reportCount = 0; postCount = 0;
  renderProfile();
  showToast('🔄 Reset to Level 0');
}

async function devToggleGender() {
  if (!currentUser) return;
  const current = currentUser.user_metadata?.gender || 'other';
  const cycle   = { 'male': 'female', 'female': 'other', 'other': 'male' };
  const next    = cycle[current] || 'male';
  try {
    const { data, error } = await supabaseClient.auth.updateUser({
      data: { ...currentUser.user_metadata, gender: next }
    });
    if (error) throw error;
    currentUser = data.user;
    updateDevGenderLabel();
    showToast('🔀 Gender set to: ' + next);
  } catch(e) {
    showToast('❌ Could not update gender: ' + e.message);
  }
}

function updateDevGenderLabel() {
  const el = document.getElementById('dev-gender-label');
  if (el) el.textContent = currentUser?.user_metadata?.gender || '—';
}

// ══════════════════════════════════════════════
// SHARE PROFILE
// ══════════════════════════════════════════════

async function shareProfile() {
  const level = Math.min(100, Math.floor(userXP / 100) + 1);
  const title = getTitleForLevel(level);
  const text  = 'I\'m "' + title.title + '" on sloMENU — Level ' + level + '! 🌆 dtslomenu.com';
  if (navigator.share) {
    try { await navigator.share({ title: 'My sloMENU Profile', text }); } catch(e) {}
  } else {
    await navigator.clipboard.writeText(text);
    showToast('📋 Copied to clipboard!');
  }
}
window.shareProfile = shareProfile;

// ══════════════════════════════════════════════
// ACTIVITY FEED
// ══════════════════════════════════════════════

async function loadActivityFeed() {
  const container = document.getElementById('activity-feed-list');
  if (!container || !currentUser) return;

  try {
    const [reports, posts, checkins, hubCheckins] = await Promise.all([
      supabaseClient.from('reports').select('bar_name,status,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(5),
      supabaseClient.from('lost_found').select('title,type,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3),
      supabaseClient.from('checkins').select('bar_name,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3),
      supabaseClient.from('hub_checkins').select('location_name,hub,checked_in_at').eq('user_id', currentUser.id).order('checked_in_at', { ascending: false }).limit(5),
    ]);

    const items = [
      ...(reports.data    || []).map(r => ({ icon: '📍', text: 'Reported ' + r.bar_name + ' as ' + r.status,        time: r.created_at })),
      ...(posts.data      || []).map(p => ({ icon: p.type === 'lost' ? '🔴' : '🟢', text: 'Posted ' + p.title + ' on L&F', time: p.created_at })),
      ...(checkins.data   || []).map(c => ({ icon: '✅', text: 'Checked in at ' + c.bar_name,                        time: c.created_at })),
      ...(hubCheckins.data|| []).map(h => ({ icon: '📍', text: 'Checked in at ' + h.location_name + ' (' + h.hub + ')', time: h.checked_in_at })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    if (items.length === 0) {
      container.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:12px 0">No recent activity yet</div>';
      return;
    }

    container.innerHTML = items.map(function(item) {
      return '<div class="activity-item">' +
        '<div class="activity-icon">' + item.icon + '</div>' +
        '<div class="activity-text">' + item.text + '</div>' +
        '<div class="activity-time">' + timeAgo(new Date(item.time).getTime()) + '</div>' +
        '</div>';
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:12px 0">Could not load activity</div>';
  }
}
