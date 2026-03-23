// ══════════════════════════════════════════════
// ACHIEVEMENTS.JS — Badge & Achievement System
// ══════════════════════════════════════════════

const ACHIEVEMENTS = [
  // ── XP MILESTONES ──
  { id: 'lvl_10',    icon: '⚡', name: 'Night Owl',        desc: 'Reach Level 10',              cat: 'xp',       req: 10,   stat: 'level' },
  { id: 'lvl_25',    icon: '🌙', name: 'Regular',          desc: 'Reach Level 25',              cat: 'xp',       req: 25,   stat: 'level' },
  { id: 'lvl_50',    icon: '👑', name: 'Legend',           desc: 'Reach Level 50',              cat: 'xp',       req: 50,   stat: 'level' },
  { id: 'xp_500',    icon: '💎', name: 'XP Grinder',       desc: 'Earn 500 total XP',           cat: 'xp',       req: 500,  stat: 'xp' },
  { id: 'xp_1000',   icon: '🏆', name: 'XP King',          desc: 'Earn 1000 total XP',          cat: 'xp',       req: 1000, stat: 'xp' },

  // ── CHECK-IN STREAKS ──
  { id: 'streak_3',  icon: '🔥', name: 'Three Peat',       desc: 'Check in 3 Thursdays in a row', cat: 'streak', req: 3,  stat: 'streak' },
  { id: 'streak_5',  icon: '🌶️', name: 'Five Alive',       desc: 'Check in 5 Thursdays in a row', cat: 'streak', req: 5,  stat: 'streak' },
  { id: 'streak_10', icon: '💀', name: 'Undying',          desc: '10 Thursdays in a row',          cat: 'streak', req: 10, stat: 'streak' },

  // ── GAME ACHIEVEMENTS ──
  { id: 'duel_1',    icon: '⚔️', name: 'First Blood',      desc: 'Win your first Trivia Duel',   cat: 'games',   req: 1,  stat: 'duel_wins' },
  { id: 'duel_5',    icon: '🥊', name: 'Duelist',          desc: 'Win 5 Trivia Duels',            cat: 'games',   req: 5,  stat: 'duel_wins' },
  { id: 'duel_10',   icon: '🗡️', name: 'Gladiator',        desc: 'Win 10 Trivia Duels',           cat: 'games',   req: 10, stat: 'duel_wins' },
  { id: 'bingo_1',   icon: '🎱', name: 'Bingo!',           desc: 'Complete your first Bar Bingo', cat: 'games',   req: 1,  stat: 'bingo_wins' },
  { id: 'trivia_7',  icon: '🧠', name: 'Big Brain',        desc: 'Score 7+ in Solo Trivia',       cat: 'games',   req: 1,  stat: 'trivia_7plus' },
  { id: 'trivia_10', icon: '🎓', name: 'SLO Scholar',      desc: 'Perfect score in Solo Trivia',  cat: 'games',   req: 1,  stat: 'trivia_perfect' },

  // ── SOCIAL ──
  { id: 'reports_5', icon: '📍', name: 'Reporter',         desc: 'Submit 5 bar reports',          cat: 'social',  req: 5,  stat: 'reports' },
  { id: 'reports_20',icon: '📡', name: 'Correspondent',    desc: 'Submit 20 bar reports',         cat: 'social',  req: 20, stat: 'reports' },
  { id: 'lost_5',    icon: '🔍', name: 'Good Samaritan',   desc: 'Post 5 Lost & Found items',     cat: 'social',  req: 5,  stat: 'posts' },
  { id: 'lost_10',   icon: '🏅', name: 'Hero of Higuera',  desc: 'Post 10 Lost & Found items',    cat: 'social',  req: 10, stat: 'posts' },

  // ── PREDICTION ACCURACY ──
  { id: 'pred_7',    icon: '🔮', name: 'Oracle',           desc: 'Get 7/10 predictions correct',  cat: 'predict', req: 1,  stat: 'pred_7plus' },
  { id: 'pred_perf', icon: '🌟', name: 'Seer',             desc: 'Perfect prediction night',      cat: 'predict', req: 1,  stat: 'pred_perfect' },
  { id: 'pred_10',   icon: '🎯', name: 'Nostradamus',      desc: 'Submit 10 prediction entries',  cat: 'predict', req: 10, stat: 'pred_entries' },
];

// ── STATE ──
let earnedAchievements = new Set(); // set of achievement IDs
let achievementStats   = {};        // { stat_key: current_value }

// ── LOAD EARNED ACHIEVEMENTS ──
async function loadAchievements() {
  if (!currentUser) return;
  try {
    const { data } = await supabaseClient
      .from('achievements')
      .select('achievement_id')
      .eq('user_id', currentUser.id);
    earnedAchievements = new Set((data || []).map(r => r.achievement_id));
  } catch(e) { /* silent */ }
}

// ── CHECK ALL ACHIEVEMENTS ──
async function checkAchievements() {
  if (!currentUser) return;

  // Build current stats from global state
  const level   = Math.min(50, Math.floor(userXP / 100));
  const streak  = await getCheckinStreak();
  const duelW   = await getDuelWins();
  const bingoW  = parseInt(safeStore.get('bingo_wins') || '0');
  const trivia7 = parseInt(safeStore.get('trivia_7plus') || '0');
  const trivP   = parseInt(safeStore.get('trivia_perfect') || '0');
  const predEntries = await getPredEntries();
  const pred7   = parseInt(safeStore.get('pred_7plus') || '0');
  const predPerf= parseInt(safeStore.get('pred_perfect') || '0');

  achievementStats = {
    level,
    xp:            userXP,
    streak,
    duel_wins:     duelW,
    bingo_wins:    bingoW,
    trivia_7plus:  trivia7,
    trivia_perfect:trivP,
    reports:       reportCount,
    posts:         postCount,
    pred_entries:  predEntries,
    pred_7plus:    pred7,
    pred_perfect:  predPerf,
  };

  for (const ach of ACHIEVEMENTS) {
    if (earnedAchievements.has(ach.id)) continue;
    const val = achievementStats[ach.stat] || 0;
    if (val >= ach.req) {
      await unlockAchievement(ach);
    }
  }
}

async function unlockAchievement(ach) {
  if (earnedAchievements.has(ach.id)) return;
  earnedAchievements.add(ach.id);

  // Save to DB
  try {
    await supabaseClient.from('achievements').insert({
      user_id: currentUser.id,
      achievement_id: ach.id,
      earned_at: new Date().toISOString()
    });
  } catch(e) { /* silent */ }

  // Show toast + animation
  showAchievementToast(ach);

  // Refresh badge display if profile is open
  if (document.getElementById('profile')?.classList.contains('active')) {
    renderRecentBadges();
  }
}

function showAchievementToast(ach) {
  const el = document.createElement('div');
  el.className = 'achievement-toast';
  el.innerHTML = `
    <div class="ach-toast-icon">${ach.icon}</div>
    <div class="ach-toast-body">
      <div class="ach-toast-title">Achievement Unlocked!</div>
      <div class="ach-toast-name">${ach.name}</div>
    </div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 50);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

// ── RENDER RECENT BADGES (last 6) on profile ──
function renderRecentBadges() {
  const container = document.getElementById('recent-badges');
  if (!container) return;

  const earned = ACHIEVEMENTS.filter(a => earnedAchievements.has(a.id));

  if (earned.length === 0) {
    container.innerHTML = `<div style="font-size:12px;color:var(--text2);text-align:center;padding:16px 0">No badges yet — keep playing!</div>`;
    return;
  }

  const recent = earned.slice(-6).reverse();
  container.innerHTML = recent.map(a => `
    <div class="badge-chip earned" title="${a.desc}">
      <span class="badge-chip-icon">${a.icon}</span>
      <span class="badge-chip-name">${a.name}</span>
    </div>`).join('');
}

// ── OPEN FULL ACHIEVEMENTS MODAL ──
function openAchievementsModal() {
  const modal = document.getElementById('achievements-modal');
  if (!modal) return;
  renderAchievementsModal();
  modal.classList.add('show');
}

function closeAchievementsModal() {
  const modal = document.getElementById('achievements-modal');
  if (modal) modal.classList.remove('show');
}

function renderAchievementsModal() {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;

  const cats = [
    { key: 'xp',      label: '⚡ XP Milestones' },
    { key: 'streak',  label: '🔥 Streaks' },
    { key: 'games',   label: '🎮 Games' },
    { key: 'social',  label: '📍 Social' },
    { key: 'predict', label: '🔮 Predictions' },
  ];

  grid.innerHTML = cats.map(cat => {
    const achs = ACHIEVEMENTS.filter(a => a.cat === cat.key);
    return `
      <div class="ach-section">
        <div class="ach-section-title">${cat.label}</div>
        <div class="ach-grid">
          ${achs.map(a => {
            const earned = earnedAchievements.has(a.id);
            const val    = achievementStats[a.stat] || 0;
            const pct    = Math.min(100, Math.round((val / a.req) * 100));
            return `
              <div class="ach-item ${earned ? 'earned' : ''}">
                <div class="ach-item-icon">${earned ? a.icon : '🔒'}</div>
                <div class="ach-item-body">
                  <div class="ach-item-name">${a.name}</div>
                  <div class="ach-item-desc">${a.desc}</div>
                  ${!earned ? `
                    <div class="ach-progress-track">
                      <div class="ach-progress-fill" style="width:${pct}%"></div>
                    </div>
                    <div class="ach-progress-label">${val} / ${a.req}</div>
                  ` : '<div class="ach-earned-label">✓ Earned</div>'}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

// ── STAT HELPERS ──
async function getCheckinStreak() {
  if (!currentUser) return 0;
  try {
    const { data } = await supabaseClient
      .from('checkins')
      .select('created_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!data || data.length === 0) return 0;
    // Count consecutive Thursdays
    let streak = 0;
    const thursdays = data
      .map(r => new Date(r.created_at))
      .filter(d => d.getDay() === 4);
    for (let i = 0; i < thursdays.length; i++) {
      if (i === 0) { streak = 1; continue; }
      const diff = (thursdays[i-1] - thursdays[i]) / (7 * 24 * 60 * 60 * 1000);
      if (Math.abs(diff - 1) < 0.5) streak++;
      else break;
    }
    return streak;
  } catch(e) { return 0; }
}

async function getDuelWins() {
  if (!currentUser) return 0;
  try {
    const { count } = await supabaseClient
      .from('duel_wins')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
    return count || 0;
  } catch(e) { return 0; }
}

async function getPredEntries() {
  if (!currentUser) return 0;
  try {
    const { count } = await supabaseClient
      .from('predictions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
    return count || 0;
  } catch(e) { return 0; }
}

// ── RECORD STAT EVENTS ──
function recordBingoWin() {
  const wins = parseInt(safeStore.get('bingo_wins') || '0') + 1;
  safeStore.set('bingo_wins', String(wins));
  checkAchievements();
}

function recordTrivia7Plus() {
  const v = parseInt(safeStore.get('trivia_7plus') || '0') + 1;
  safeStore.set('trivia_7plus', String(v));
  checkAchievements();
}

function recordTriviaPerfect() {
  const v = parseInt(safeStore.get('trivia_perfect') || '0') + 1;
  safeStore.set('trivia_perfect', String(v));
  checkAchievements();
}

function recordPred7Plus() {
  const v = parseInt(safeStore.get('pred_7plus') || '0') + 1;
  safeStore.set('pred_7plus', String(v));
  checkAchievements();
}

function recordPredPerfect() {
  const v = parseInt(safeStore.get('pred_perfect') || '0') + 1;
  safeStore.set('pred_perfect', String(v));
  checkAchievements();
}
