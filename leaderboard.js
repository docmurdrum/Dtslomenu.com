// ══════════════════════════════════════════════
// LEADERBOARD.JS
// Global leaderboards + per-bar leaderboards
// ══════════════════════════════════════════════

let lbRange  = 3;
let lbPeriod = 'alltime';
let lbTab    = 'xp';
let lbCache  = {};

let barLbRange = 3;
let barLbTab   = 'checkins';

// ── CONTROLS ──
function setLbRange(n) {
  lbRange = n;
  [3,10,50].forEach(x => {
    const btn = document.getElementById('lb-top' + x);
    if (btn) btn.className = 'lb-range-btn' + (x === n ? ' active' : '');
  });
  loadLeaderboard();
}

function setLbPeriod(p) {
  lbPeriod = p;
  ['alltime','week'].forEach(x => {
    const btn = document.getElementById('lb-' + x);
    if (btn) btn.className = 'lb-range-btn' + (x === p ? ' active' : '');
  });
  lbCache = {};
  loadLeaderboard();
}

function setLbTab(tab) {
  lbTab = tab;
  ['xp','reports','checkins','streak','nights'].forEach(t => {
    const btn = document.getElementById('lbt-' + t);
    if (btn) btn.className = 'lb-tab' + (t === tab ? ' active' : '');
  });
  loadLeaderboard();
}

// ── LOAD GLOBAL LEADERBOARD ──
async function loadLeaderboard() {
  const listEl    = document.getElementById('leaderboard-list');
  const loadingEl = document.getElementById('lb-loading');
  const emptyEl   = document.getElementById('lb-empty');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (loadingEl) loadingEl.style.display = 'block';
  if (emptyEl)   emptyEl.style.display   = 'none';

  const cacheKey = lbTab + '_' + lbPeriod + '_' + lbRange;
  if (lbCache[cacheKey]) {
    renderLeaderboard(lbCache[cacheKey]);
    if (loadingEl) loadingEl.style.display = 'none';
    return;
  }

  try {
    let data = [];
    const cutoff = lbPeriod === 'week'
      ? new Date(Date.now() - 7*24*60*60*1000).toISOString()
      : new Date('2020-01-01').toISOString();

    if (lbTab === 'xp') {
      const { data: d } = await supabaseClient
        .from('characters')
        .select('user_id, xp, profiles(username)')
        .order('xp', { ascending: false })
        .limit(lbRange);
      data = (d || []).map(r => ({
        user_id: r.user_id,
        username: r.profiles?.username || 'Unknown',
        value: r.xp || 0,
        unit: 'XP'
      }));

    } else if (lbTab === 'reports') {
      const { data: d } = await supabaseClient
        .from('reports')
        .select('user_id, profiles(username)')
        .gte('created_at', cutoff);
      const counts = {};
      const names  = {};
      (d || []).forEach(r => {
        counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        names[r.user_id]  = r.profiles?.username || 'Unknown';
      });
      data = Object.entries(counts)
        .map(([uid, cnt]) => ({ user_id: uid, username: names[uid], value: cnt, unit: 'reports' }))
        .sort((a,b) => b.value - a.value).slice(0, lbRange);

    } else if (lbTab === 'checkins') {
      const { data: d } = await supabaseClient
        .from('bump_sessions')
        .select('user_id, profiles(username)')
        .gte('created_at', cutoff);
      const counts = {};
      const names  = {};
      (d || []).forEach(r => {
        counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        names[r.user_id]  = r.profiles?.username || 'Unknown';
      });
      data = Object.entries(counts)
        .map(([uid, cnt]) => ({ user_id: uid, username: names[uid], value: cnt, unit: 'check-ins' }))
        .sort((a,b) => b.value - a.value).slice(0, lbRange);

    } else if (lbTab === 'streak') {
      const { data: d } = await supabaseClient
        .from('characters')
        .select('user_id, streak_weeks, profiles(username)')
        .order('streak_weeks', { ascending: false })
        .limit(lbRange);
      data = (d || []).map(r => ({
        user_id: r.user_id,
        username: r.profiles?.username || 'Unknown',
        value: r.streak_weeks || 0,
        unit: 'weeks'
      }));

    } else if (lbTab === 'nights') {
      const { data: d } = await supabaseClient
        .from('bump_sessions')
        .select('user_id, bar_name, profiles(username)')
        .gte('created_at', cutoff);
      const bars  = {};
      const names = {};
      (d || []).forEach(r => {
        if (!bars[r.user_id]) bars[r.user_id] = new Set();
        bars[r.user_id].add(r.bar_name);
        names[r.user_id] = r.profiles?.username || 'Unknown';
      });
      data = Object.entries(bars)
        .map(([uid, bset]) => ({ user_id: uid, username: names[uid], value: bset.size, unit: 'bars visited' }))
        .sort((a,b) => b.value - a.value).slice(0, lbRange);
    }

    lbCache[cacheKey] = data;
    renderLeaderboard(data);
  } catch(e) {
    if (listEl) listEl.innerHTML = '<div style="color:var(--text2);font-size:12px;padding:16px">Could not load leaderboard</div>';
    console.error('Leaderboard error:', e);
  }

  if (loadingEl) loadingEl.style.display = 'none';
}

// ── RENDER GLOBAL ──
function renderLeaderboard(data) {
  const listEl  = document.getElementById('leaderboard-list');
  const emptyEl = document.getElementById('lb-empty');
  const myCard  = document.getElementById('my-rank-card');
  const myRow   = document.getElementById('my-rank-row');
  if (!listEl) return;

  if (!data || !data.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (myCard)  myCard.style.display  = 'none';
    return;
  }

  const medals = ['👑','🥈','🥉'];
  const rankColors = ['gold','silver','bronze'];
  const COLORS = ['#b44fff','#ff2d78','#00f5ff','#ffd700','#00ff88','#ff9500','#6366f1','#10b981'];

  listEl.innerHTML = data.map((row, i) => {
    const isMe = row.user_id === currentUser?.id;
    const color = COLORS[i % COLORS.length];
    const initial = (row.username||'?')[0].toUpperCase();
    return `
    <div class="lb-row ${isMe ? 'lb-you' : ''}">
      <div class="lb-rank ${rankColors[i] || ''}">${i < 3 ? medals[i] : '#' + (i+1)}</div>
      <div class="lb-avatar" style="background:${color}">${initial}</div>
      <div class="lb-info">
        <div class="lb-username">${row.username}${isMe ? ' (You)' : ''}</div>
        <div class="lb-subtitle">${row.unit}</div>
      </div>
      <div class="lb-stat">${row.value.toLocaleString()}</div>
    </div>`;
  }).join('');

  // My rank
  const myIdx = data.findIndex(r => r.user_id === currentUser?.id);
  if (myIdx === -1 && currentUser) {
    if (myCard) myCard.style.display = 'block';
    if (myRow)  myRow.innerHTML = '<div style="font-size:12px;color:var(--text2)">You\'re not in the top ' + lbRange + ' yet — keep going!</div>';
  } else {
    if (myCard) myCard.style.display = 'none';
  }
}

// ── BAR LEADERBOARD ──
let barLbCache = {};

function setBarLbRange(n) {
  barLbRange = n;
  [3,10,50].forEach(x => {
    const btn = document.getElementById('blb-' + x);
    if (btn) btn.className = 'bar-lb-range' + (x === n ? ' active' : '');
  });
  loadBarLeaderboard();
}

function setBarLbTab(tab) {
  barLbTab = tab;
  ['checkins','reports'].forEach(t => {
    const btn = document.getElementById('blbt-' + t);
    if (btn) btn.className = 'lb-tab' + (t === tab ? ' active' : '');
  });
  loadBarLeaderboard();
}

async function loadBarLeaderboard() {
  if (currentBarIndex === null) return;
  const barName = bars[currentBarIndex]?.name;
  if (!barName) return;

  const el = document.getElementById('bar-leaderboard-list');
  if (!el) return;
  el.innerHTML = '<div style="font-size:11px;color:var(--text2);padding:8px 0">Loading...</div>';

  const cacheKey = barName + '_' + barLbTab + '_' + barLbRange;
  if (barLbCache[cacheKey]) { renderBarLeaderboard(barLbCache[cacheKey], barName); return; }

  try {
    let data = [];
    const COLORS = ['#b44fff','#ff2d78','#00f5ff','#ffd700','#00ff88','#ff9500'];

    if (barLbTab === 'checkins') {
      const { data: d } = await supabaseClient
        .from('bump_sessions')
        .select('user_id, profiles(username)')
        .eq('bar_name', barName);
      const counts = {};
      const names  = {};
      (d || []).forEach(r => {
        counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        names[r.user_id]  = r.profiles?.username || 'Unknown';
      });
      data = Object.entries(counts)
        .map(([uid, cnt]) => ({ user_id: uid, username: names[uid], value: cnt, unit: 'check-ins' }))
        .sort((a,b) => b.value - a.value).slice(0, barLbRange);

    } else if (barLbTab === 'reports') {
      const { data: d } = await supabaseClient
        .from('reports')
        .select('user_id, profiles(username)')
        .eq('bar', barName);
      const counts = {};
      const names  = {};
      (d || []).forEach(r => {
        counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        names[r.user_id]  = r.profiles?.username || 'Unknown';
      });
      data = Object.entries(counts)
        .map(([uid, cnt]) => ({ user_id: uid, username: names[uid], value: cnt, unit: 'reports' }))
        .sort((a,b) => b.value - a.value).slice(0, barLbRange);
    }

    barLbCache[cacheKey] = data;
    renderBarLeaderboard(data, barName);
  } catch(e) {
    el.innerHTML = '<div style="font-size:11px;color:var(--text2);padding:8px 0">Could not load</div>';
  }
}

function renderBarLeaderboard(data, barName) {
  const el = document.getElementById('bar-leaderboard-list');
  if (!el) return;
  const medals = ['👑','🥈','🥉'];
  const COLORS = ['#b44fff','#ff2d78','#00f5ff','#ffd700','#00ff88','#ff9500'];

  if (!data || !data.length) {
    el.innerHTML = '<div style="font-size:11px;color:var(--text2);padding:8px 0">No regulars yet — be the first!</div>';
    return;
  }

  const myIdx = data.findIndex(r => r.user_id === currentUser?.id);

  el.innerHTML = data.map((row, i) => {
    const isMe = row.user_id === currentUser?.id;
    const color = COLORS[i % COLORS.length];
    return `
    <div class="lb-row ${isMe ? 'lb-you' : ''}" style="padding:8px 0">
      <div class="lb-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}" style="font-size:14px;width:24px">${i < 3 ? medals[i] : '#'+(i+1)}</div>
      <div class="lb-avatar" style="background:${color};width:32px;height:32px;font-size:13px">${(row.username||'?')[0].toUpperCase()}</div>
      <div class="lb-info">
        <div class="lb-username" style="font-size:12px">${row.username}${isMe ? ' ★' : ''}</div>
      </div>
      <div class="lb-stat" style="font-size:14px">${row.value} <span style="font-size:9px;color:var(--text2);font-weight:600">${row.unit}</span></div>
    </div>`;
  }).join('');

  // My rank if not in list
  if (myIdx === -1 && currentUser) {
    el.innerHTML += '<div style="font-size:10px;color:var(--text2);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">You\'re not ranked here yet</div>';
  }
}
