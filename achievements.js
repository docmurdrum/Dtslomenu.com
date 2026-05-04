// ══════════════════════════════════════════════
// ACHIEVEMENTS.JS — Badge & Achievement System
// Static achievements (hardcoded) + dynamic hub
// badges (fetched from Supabase badges table).
// Max level: 100.
// ══════════════════════════════════════════════

// ── STATIC ACHIEVEMENTS ──────────────────────
// These never change without a deploy.
// Behavior-based: XP, streaks, games, social.
const ACHIEVEMENTS = [
  // ── SPECIAL ──
  { id: 'beta_tester', icon: '🏅', name: 'Beta Tester',    desc: 'Joined during beta — OG status confirmed', cat: 'special', imageUrl: 'https://jwgwufggptpdmgcmmqes.supabase.co/storage/v1/object/public/characters/badges/beta-tester.png' },

  // ── XP MILESTONES ──
  { id: 'lvl_10',   icon: '⚡', name: 'Night Owl',     desc: 'Reach Level 10',   cat: 'xp', req: 10,   stat: 'level' },
  { id: 'lvl_25',   icon: '🌙', name: 'Regular',       desc: 'Reach Level 25',   cat: 'xp', req: 25,   stat: 'level' },
  { id: 'lvl_50',   icon: '🔥', name: 'Dedicated',     desc: 'Reach Level 50',   cat: 'xp', req: 50,   stat: 'level' },
  { id: 'lvl_75',   icon: '👑', name: 'Legend',         desc: 'Reach Level 75',   cat: 'xp', req: 75,   stat: 'level' },
  { id: 'lvl_100',  icon: '🌟', name: 'SLO Icon',       desc: 'Reach Level 100',  cat: 'xp', req: 100,  stat: 'level' },
  { id: 'xp_500',   icon: '💎', name: 'XP Grinder',     desc: 'Earn 500 total XP',   cat: 'xp', req: 500,  stat: 'xp' },
  { id: 'xp_1000',  icon: '🏆', name: 'XP King',        desc: 'Earn 1000 total XP',  cat: 'xp', req: 1000, stat: 'xp' },
  { id: 'xp_5000',  icon: '🎖️', name: 'XP God',         desc: 'Earn 5000 total XP',  cat: 'xp', req: 5000, stat: 'xp' },

  // ── STREAKS ──
  { id: 'streak_3',  icon: '🔥', name: 'Three Peat', desc: 'Check in 3 weeks in a row',  cat: 'streak', req: 3,  stat: 'streak' },
  { id: 'streak_5',  icon: '🌶️', name: 'Five Alive', desc: 'Check in 5 weeks in a row',  cat: 'streak', req: 5,  stat: 'streak' },
  { id: 'streak_10', icon: '💀', name: 'Undying',    desc: 'Check in 10 weeks in a row', cat: 'streak', req: 10, stat: 'streak' },

  // ── GAMES ──
  { id: 'duel_1',    icon: '⚔️', name: 'First Blood', desc: 'Win your first Trivia Duel',    cat: 'games', req: 1,  stat: 'duel_wins' },
  { id: 'duel_5',    icon: '🥊', name: 'Duelist',     desc: 'Win 5 Trivia Duels',            cat: 'games', req: 5,  stat: 'duel_wins' },
  { id: 'duel_10',   icon: '🗡️', name: 'Gladiator',   desc: 'Win 10 Trivia Duels',           cat: 'games', req: 10, stat: 'duel_wins' },
  { id: 'bingo_1',   icon: '🎱', name: 'Bingo!',      desc: 'Complete your first Bar Bingo', cat: 'games', req: 1,  stat: 'bingo_wins' },
  { id: 'trivia_7',  icon: '🧠', name: 'Big Brain',   desc: 'Score 7+ in Solo Trivia',       cat: 'games', req: 1,  stat: 'trivia_7plus' },
  { id: 'trivia_10', icon: '🎓', name: 'SLO Scholar', desc: 'Perfect score in Solo Trivia',  cat: 'games', req: 1,  stat: 'trivia_perfect' },

  // ── SOCIAL ──
  { id: 'reports_5',  icon: '📍', name: 'Reporter',       desc: 'Submit 5 bar reports',      cat: 'social', req: 5,  stat: 'reports' },
  { id: 'reports_20', icon: '📡', name: 'Correspondent',  desc: 'Submit 20 bar reports',     cat: 'social', req: 20, stat: 'reports' },
  { id: 'lost_5',     icon: '🔍', name: 'Good Samaritan', desc: 'Post 5 Lost & Found items', cat: 'social', req: 5,  stat: 'posts' },
  { id: 'lost_10',    icon: '🏅', name: 'Hero of Higuera',desc: 'Post 10 Lost & Found items',cat: 'social', req: 10, stat: 'posts' },

  // ── PREDICTIONS ──
  { id: 'pred_7',    icon: '🔮', name: 'Oracle',       desc: 'Get 7/10 predictions correct', cat: 'predict', req: 1,  stat: 'pred_7plus' },
  { id: 'pred_perf', icon: '🌟', name: 'Seer',         desc: 'Perfect prediction night',     cat: 'predict', req: 1,  stat: 'pred_perfect' },
  { id: 'pred_10',   icon: '🎯', name: 'Nostradamus',  desc: 'Submit 10 prediction entries', cat: 'predict', req: 10, stat: 'pred_entries' },
];

// ── STATE ──
let earnedAchievements = new Set(); // earned static achievement IDs
let achievementStats   = {};        // { stat_key: current_value }
let _badgeDefs         = [];        // dynamic hub badges from Supabase
let _earnedBadgeIds    = new Set(); // earned dynamic badge IDs

// ══════════════════════════════════════════════
// STATIC ACHIEVEMENTS — load + check
// ══════════════════════════════════════════════

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

async function checkAchievements() {
  if (!currentUser) return;

  const level   = Math.min(100, Math.floor(userXP / 100) + 1);
  const streak  = await getCheckinStreak();
  const duelW   = await getDuelWins();
  const bingoW  = parseInt(safeStore.get('bingo_wins')    || '0');
  const trivia7 = parseInt(safeStore.get('trivia_7plus')  || '0');
  const trivP   = parseInt(safeStore.get('trivia_perfect')|| '0');
  const predEntries = await getPredEntries();
  const pred7   = parseInt(safeStore.get('pred_7plus')    || '0');
  const predPerf= parseInt(safeStore.get('pred_perfect')  || '0');

  achievementStats = {
    level,
    xp:             userXP,
    streak,
    duel_wins:      duelW,
    bingo_wins:     bingoW,
    trivia_7plus:   trivia7,
    trivia_perfect: trivP,
    reports:        reportCount,
    posts:          postCount,
    pred_entries:   predEntries,
    pred_7plus:     pred7,
    pred_perfect:   predPerf,
  };

  for (const ach of ACHIEVEMENTS) {
    if (!ach.req || !ach.stat) continue; // special badges (beta_tester) have no auto-req
    if (earnedAchievements.has(ach.id)) continue;
    const val = achievementStats[ach.stat] || 0;
    if (val >= ach.req) await unlockAchievement(ach);
  }
}

async function unlockAchievement(ach) {
  if (earnedAchievements.has(ach.id)) return;
  earnedAchievements.add(ach.id);

  try {
    await supabaseClient.from('achievements').insert({
      user_id:        currentUser.id,
      achievement_id: ach.id,
      earned_at:      new Date().toISOString()
    });
  } catch(e) { /* silent */ }

  showAchievementToast(ach);

  if (document.getElementById('profile')?.classList.contains('active')) {
    renderBadgeShowcase();
  }
}

// ══════════════════════════════════════════════
// DYNAMIC HUB BADGES — from Supabase badges table
// ══════════════════════════════════════════════

// Load badge definitions + which ones the user has earned
async function loadBadges() {
  if (!supabaseClient) return;
  try {
    // Fetch all active badge definitions
    const { data: defs } = await supabaseClient
      .from('badges')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });
    _badgeDefs = defs || [];

    // Fetch user's earned badges (stored in achievements table with prefix 'badge_')
    if (currentUser) {
      const { data: earned } = await supabaseClient
        .from('achievements')
        .select('achievement_id')
        .eq('user_id', currentUser.id)
        .like('achievement_id', 'badge_%');
      _earnedBadgeIds = new Set((earned || []).map(r => r.achievement_id));
    }
  } catch(e) {
    console.warn('[loadBadges]', e.message);
  }
}

// Check if user qualifies for any unearned hub badges.
// Called after addXP and after hub check-ins.
async function checkBadges() {
  if (!currentUser || !_badgeDefs.length) return;

  for (const badge of _badgeDefs) {
    const badgeKey = 'badge_' + badge.id;
    if (_earnedBadgeIds.has(badgeKey)) continue;

    let qualified = false;

    try {
      switch (badge.requirement_type) {

        case 'hubs_visited': {
          // Count distinct hubs the user has opened
          var hvRes = await supabaseClient
            .from('profiles')
            .select('hubs_visited')
            .eq('id', currentUser.id)
            .limit(1);
          var hvRow = Array.isArray(hvRes.data) ? hvRes.data[0] : hvRes.data;
          var hvList = (hvRow && Array.isArray(hvRow.hubs_visited)) ? hvRow.hubs_visited : [];
          qualified = hvList.length >= badge.requirement_value;
          break;
        }

        case 'xp_total':
          qualified = userXP >= badge.requirement_value;
          break;

        case 'level':
          qualified = (Math.min(100, Math.floor(userXP / 100) + 1)) >= badge.requirement_value;
          break;

        case 'checkins': {
          // Total check-ins across all hubs
          const { count } = await supabaseClient
            .from('hub_checkins')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);
          qualified = (count || 0) >= badge.requirement_value;
          break;
        }

        case 'hub_checkins': {
          // Check-ins within a specific hub
          const hub = badge.requirement_hub || badge.hub;
          if (!hub) break;
          const { count } = await supabaseClient
            .from('hub_checkins')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', currentUser.id)
            .eq('hub', hub);
          qualified = (count || 0) >= badge.requirement_value;
          break;
        }

        case 'unique_locations': {
          // Unique location_ids within a hub
          const hub = badge.requirement_hub || badge.hub;
          const query = supabaseClient
            .from('hub_checkins')
            .select('location_id')
            .eq('user_id', currentUser.id);
          if (hub) query.eq('hub', hub);
          const { data } = await query;
          const unique = new Set((data || []).map(r => r.location_id));
          qualified = unique.size >= badge.requirement_value;
          break;
        }

        case 'missions_complete': {
          const { count } = await supabaseClient
            .from('mission_completions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', currentUser.id);
          qualified = (count || 0) >= badge.requirement_value;
          break;
        }

        case 'streak':
          qualified = (await getCheckinStreak()) >= badge.requirement_value;
          break;
      }
    } catch(e) {
      console.warn('[checkBadges] badge=' + badge.id, e.message);
    }

    if (qualified) await unlockBadge(badge);
  }
}

async function unlockBadge(badge) {
  const badgeKey = 'badge_' + badge.id;
  if (_earnedBadgeIds.has(badgeKey)) return;
  _earnedBadgeIds.add(badgeKey);

  try {
    await supabaseClient.from('achievements').insert({
      user_id:        currentUser.id,
      achievement_id: badgeKey,
      earned_at:      new Date().toISOString()
    });
  } catch(e) { /* silent */ }

  // Show toast using badge data
  showAchievementToast({
    icon:  badge.icon_emoji || '🏅',
    name:  badge.name,
    desc:  badge.description,
    rarity: badge.rarity
  });

  if (document.getElementById('profile')?.classList.contains('active')) {
    renderBadgeShowcase();
  }
}

// ══════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════

function showAchievementToast(ach) {
  const el = document.createElement('div');
  el.className = 'achievement-toast';

  const rarityColor = {
    legendary: '#ffd700',
    rare:      '#b44fff',
    uncommon:  '#00f5ff',
    common:    'rgba(255,255,255,0.7)'
  }[ach.rarity] || 'rgba(255,255,255,0.7)';

  el.innerHTML =
    '<div class="ach-toast-icon">' + (ach.icon || '🏅') + '</div>' +
    '<div class="ach-toast-body">' +
      '<div class="ach-toast-title" style="color:' + rarityColor + '">Achievement Unlocked!</div>' +
      '<div class="ach-toast-name">' + ach.name + '</div>' +
    '</div>';

  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 50);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3500);
}

// ══════════════════════════════════════════════
// BADGE SHOWCASE — renders on profile
// Shows top 3 by rarity prominently, then all earned
// ══════════════════════════════════════════════

const RARITY_RANK = { legendary: 4, rare: 3, uncommon: 2, common: 1 };
const RARITY_GLOW = {
  legendary: '0 0 12px rgba(255,215,0,0.6)',
  rare:      '0 0 10px rgba(180,79,255,0.5)',
  uncommon:  '0 0 8px rgba(0,245,255,0.4)',
  common:    'none'
};
const RARITY_BORDER = {
  legendary: '2px solid rgba(255,215,0,0.6)',
  rare:      '2px solid rgba(180,79,255,0.5)',
  uncommon:  '2px solid rgba(0,245,255,0.35)',
  common:    '1px solid rgba(255,255,255,0.12)'
};

function renderBadgeShowcase() {
  const container = document.getElementById('badge-showcase');
  if (!container) return;

  // Build combined earned list: static achievements + dynamic badges
  const earnedStatic = ACHIEVEMENTS
    .filter(a => earnedAchievements.has(a.id))
    .map(a => ({
      id:       a.id,
      name:     a.name,
      desc:     a.desc,
      icon:     a.icon,
      imageUrl: a.imageUrl || null,
      rarity:   a.cat === 'special' ? 'legendary' : 'common',
      hub:      null
    }));

  const earnedDynamic = _badgeDefs
    .filter(b => _earnedBadgeIds.has('badge_' + b.id))
    .map(b => ({
      id:       'badge_' + b.id,
      name:     b.name,
      desc:     b.description,
      icon:     b.icon_emoji || '🏅',
      imageUrl: b.image_url || null,
      rarity:   b.rarity || 'common',
      hub:      b.hub
    }));

  const all = [...earnedStatic, ...earnedDynamic]
    .sort((a, b) => (RARITY_RANK[b.rarity] || 1) - (RARITY_RANK[a.rarity] || 1));

  if (all.length === 0) {
    container.innerHTML =
      '<div style="font-size:12px;color:var(--text2);text-align:center;padding:20px 0">' +
        '🔒 No badges yet — start exploring SLO!' +
      '</div>';
    return;
  }

  // Top 3 featured badges
  const featured  = all.slice(0, 3);
  const remaining = all.slice(3);

  let html = '<div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px">';
  featured.forEach(function(b) {
    const glow   = RARITY_GLOW[b.rarity]   || 'none';
    const border = RARITY_BORDER[b.rarity] || RARITY_BORDER.common;
    html +=
      '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;max-width:90px">' +
        '<div style="width:64px;height:64px;border-radius:16px;border:' + border + ';' +
          'box-shadow:' + glow + ';background:rgba(255,255,255,0.04);' +
          'display:flex;align-items:center;justify-content:center;overflow:hidden">' +
          (b.imageUrl
            ? '<img src="' + b.imageUrl + '" style="width:100%;height:100%;object-fit:cover">'
            : '<span style="font-size:28px">' + b.icon + '</span>') +
        '</div>' +
        '<div style="font-size:10px;font-weight:700;text-align:center;color:rgba(255,255,255,0.8);line-height:1.3">' + b.name + '</div>' +
      '</div>';
  });
  html += '</div>';

  // Remaining badges as small chips
  if (remaining.length > 0) {
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px">';
    remaining.forEach(function(b) {
      const border = RARITY_BORDER[b.rarity] || RARITY_BORDER.common;
      html +=
        '<div class="badge-chip earned" title="' + b.desc + '" style="border:' + border + '">' +
          (b.imageUrl
            ? '<img src="' + b.imageUrl + '" style="width:20px;height:20px;border-radius:50%;object-fit:cover">'
            : '<span class="badge-chip-icon">' + b.icon + '</span>') +
          '<span class="badge-chip-name">' + b.name + '</span>' +
        '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

// Legacy alias — profile.js may call renderRecentBadges
function renderRecentBadges() { renderBadgeShowcase(); }
window.renderRecentBadges = renderRecentBadges;

// ══════════════════════════════════════════════
// ACHIEVEMENTS MODAL
// ══════════════════════════════════════════════

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

  // Static achievements sections
  let html = cats.map(function(cat) {
    const achs = ACHIEVEMENTS.filter(a => a.cat === cat.key);
    if (!achs.length) return '';
    return (
      '<div class="ach-section">' +
        '<div class="ach-section-title">' + cat.label + '</div>' +
        '<div class="ach-grid">' +
          achs.map(function(a) {
            const earned = earnedAchievements.has(a.id);
            const val    = achievementStats[a.stat] || 0;
            const pct    = a.req ? Math.min(100, Math.round((val / a.req) * 100)) : 0;
            return (
              '<div class="ach-item ' + (earned ? 'earned' : '') + '">' +
                '<div class="ach-item-icon">' + (earned ? a.icon : '🔒') + '</div>' +
                '<div class="ach-item-body">' +
                  '<div class="ach-item-name">' + a.name + '</div>' +
                  '<div class="ach-item-desc">' + a.desc + '</div>' +
                  (!earned && a.req
                    ? '<div class="ach-progress-track"><div class="ach-progress-fill" style="width:' + pct + '%"></div></div>' +
                      '<div class="ach-progress-label">' + val + ' / ' + a.req + '</div>'
                    : earned ? '<div class="ach-earned-label">✓ Earned</div>' : '') +
                '</div>' +
              '</div>'
            );
          }).join('') +
        '</div>' +
      '</div>'
    );
  }).join('');

  // Dynamic hub badges section
  if (_badgeDefs.length > 0) {
    // Group by hub
    const hubs = {};
    _badgeDefs.forEach(function(b) {
      const key = b.hub || 'global';
      if (!hubs[key]) hubs[key] = [];
      hubs[key].push(b);
    });

    Object.keys(hubs).forEach(function(hub) {
      const hubLabel = hub === 'global' ? '🌎 Explorer Badges' : '📍 ' + hub.charAt(0).toUpperCase() + hub.slice(1) + ' Badges';
      html +=
        '<div class="ach-section">' +
          '<div class="ach-section-title">' + hubLabel + '</div>' +
          '<div class="ach-grid">' +
            hubs[hub].map(function(b) {
              const badgeKey = 'badge_' + b.id;
              const earned   = _earnedBadgeIds.has(badgeKey);
              const border   = RARITY_BORDER[b.rarity] || RARITY_BORDER.common;
              return (
                '<div class="ach-item ' + (earned ? 'earned' : '') + '">' +
                  '<div class="ach-item-icon" style="border:' + border + ';border-radius:10px;padding:2px">' +
                    (earned
                      ? (b.image_url
                          ? '<img src="' + b.image_url + '" style="width:32px;height:32px;border-radius:8px;object-fit:cover">'
                          : b.icon_emoji || '🏅')
                      : '🔒') +
                  '</div>' +
                  '<div class="ach-item-body">' +
                    '<div class="ach-item-name">' + b.name + '</div>' +
                    '<div class="ach-item-desc">' + (b.description || '') + '</div>' +
                    '<div class="ach-item-desc" style="color:rgba(255,255,255,0.3);margin-top:2px;text-transform:capitalize">' + (b.rarity || 'common') + '</div>' +
                    (earned ? '<div class="ach-earned-label">✓ Earned</div>' : '') +
                  '</div>' +
                '</div>'
              );
            }).join('') +
          '</div>' +
        '</div>';
    });
  }

  grid.innerHTML = html || '<div style="text-align:center;padding:24px;color:var(--text2)">No achievements yet</div>';
}

// ══════════════════════════════════════════════
// STAT HELPERS
// ══════════════════════════════════════════════

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

// ══════════════════════════════════════════════
// RECORD STAT EVENTS — called from games.js
// ══════════════════════════════════════════════

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
