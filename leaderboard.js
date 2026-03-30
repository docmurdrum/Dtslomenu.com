// ══════════════════════════════════════════════
// LEADERBOARD.JS — Popup leaderboard
// Categories: XP, Check-ins, Reports
// Time ranges: All Time, This Week, Tonight
// Scope: Global, Friends
// ══════════════════════════════════════════════

var lbPeriod = 'alltime';
var lbTab    = 'xp';
var lbScope  = 'global';
var lbCache  = {};

var barLbRange = 3;
var barLbTab   = 'checkins';
var barLbCache = {};

var LB_COLORS = ['#b44fff','#ff2d78','#00f5ff','#ffd700','#00ff88','#ff9500','#6366f1','#10b981'];
var LB_MEDALS = ['👑','🥈','🥉'];

// ── OPEN / CLOSE POPUP ──
function openLbPopup() {
  var overlay = document.getElementById('lb-popup-overlay');
  var sheet   = document.getElementById('lb-popup-sheet');
  if (!overlay) return;
  overlay.style.display = 'flex';
  setTimeout(function() {
    if (sheet) sheet.style.transform = 'translateY(0)';
  }, 10);
  loadLeaderboard();
}
window.openLbPopup = openLbPopup;

function closeLbPopup() {
  var overlay = document.getElementById('lb-popup-overlay');
  var sheet   = document.getElementById('lb-popup-sheet');
  if (sheet) sheet.style.transform = 'translateY(30px)';
  setTimeout(function() {
    if (overlay) overlay.style.display = 'none';
  }, 300);
}
window.closeLbPopup = closeLbPopup;

// ── CONTROLS ──
function setLbTab(tab) {
  lbTab = tab;
  lbCache = {};
  ['xp','checkins','reports'].forEach(function(t) {
    var btn = document.getElementById('lbt-' + t);
    if (btn) btn.className = 'lb-tab' + (t === tab ? ' active' : '');
  });
  loadLeaderboard();
}
window.setLbTab = setLbTab;

function setLbPeriod(p) {
  lbPeriod = p;
  lbCache  = {};
  ['alltime','week','tonight'].forEach(function(t) {
    var btn = document.getElementById('lbt-' + t);
    if (btn) btn.className = 'lb-time-btn' + (t === p ? ' active' : '');
  });
  loadLeaderboard();
}
window.setLbPeriod = setLbPeriod;

function setLbScope(s) {
  lbScope = s;
  lbCache = {};
  var globalBtn  = document.getElementById('lb-scope-global');
  var friendsBtn = document.getElementById('lb-scope-friends');
  if (globalBtn) {
    globalBtn.style.background = s === 'global' ? 'white' : 'transparent';
    globalBtn.style.color      = s === 'global' ? '#000'  : 'rgba(255,255,255,0.4)';
  }
  if (friendsBtn) {
    friendsBtn.style.background = s === 'friends' ? 'white' : 'transparent';
    friendsBtn.style.color      = s === 'friends' ? '#000'  : 'rgba(255,255,255,0.4)';
  }
  loadLeaderboard();
}
window.setLbScope = setLbScope;

// ── CUTOFF HELPER ──
function getLbCutoff(period) {
  if (period === 'tonight') {
    var d = new Date();
    d.setHours(16, 0, 0, 0);
    return d.toISOString();
  }
  if (period === 'week') return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return new Date('2020-01-01').toISOString();
}

// ── LOAD LEADERBOARD ──
async function loadLeaderboard() {
  var listEl    = document.getElementById('leaderboard-list');
  var loadingEl = document.getElementById('lb-loading');
  var emptyEl   = document.getElementById('lb-empty');
  var myCard    = document.getElementById('my-rank-card');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (myCard)    myCard.style.display    = 'none';
  if (loadingEl) loadingEl.style.display = 'block';
  if (emptyEl)   emptyEl.style.display   = 'none';

  var cacheKey = lbTab + '_' + lbPeriod + '_' + lbScope;
  if (lbCache[cacheKey]) {
    renderLeaderboard(lbCache[cacheKey]);
    if (loadingEl) loadingEl.style.display = 'none';
    return;
  }

  try {
    var data    = [];
    var cutoff  = getLbCutoff(lbPeriod);
    var friendIds = [];
    if (lbScope === 'friends') {
      friendIds = (window.friendsList || []).map(function(f) { return f.id || f.user_id; });
      if (currentUser) friendIds.push(currentUser.id);
    }

    if (lbTab === 'xp') {
      var res = await supabaseClient
        .from('characters')
        .select('user_id, xp, profiles(username)')
        .order('xp', { ascending: false })
        .limit(50);
      if (res.error) throw res.error;
      data = (res.data || [])
        .filter(function(r) { return lbScope === 'global' || friendIds.indexOf(r.user_id) !== -1; })
        .slice(0, 20)
        .map(function(r) { return {
          user_id:  r.user_id,
          username: (r.profiles && r.profiles.username) || 'Unknown',
          value:    r.xp || 0,
          unit:     'XP'
        }; });

    } else if (lbTab === 'reports') {
      var res2 = await supabaseClient
        .from('reports')
        .select('user_id, profiles(username)')
        .gte('created_at', cutoff);
      if (res2.error) throw res2.error;
      var counts = {};
      var names  = {};
      (res2.data || []).forEach(function(r) {
        if (lbScope === 'friends' && friendIds.indexOf(r.user_id) === -1) return;
        counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        names[r.user_id]  = (r.profiles && r.profiles.username) || 'Unknown';
      });
      data = Object.keys(counts)
        .map(function(uid) { return { user_id: uid, username: names[uid], value: counts[uid], unit: 'reports' }; })
        .sort(function(a, b) { return b.value - a.value; })
        .slice(0, 20);

    } else if (lbTab === 'checkins') {
      var res3 = await supabaseClient
        .from('bump_sessions')
        .select('user_id, profiles(username)')
        .gte('created_at', cutoff);
      if (res3.error) throw res3.error;
      var counts2 = {};
      var names2  = {};
      (res3.data || []).forEach(function(r) {
        if (lbScope === 'friends' && friendIds.indexOf(r.user_id) === -1) return;
        counts2[r.user_id] = (counts2[r.user_id] || 0) + 1;
        names2[r.user_id]  = (r.profiles && r.profiles.username) || 'Unknown';
      });
      data = Object.keys(counts2)
        .map(function(uid) { return { user_id: uid, username: names2[uid], value: counts2[uid], unit: 'check-ins' }; })
        .sort(function(a, b) { return b.value - a.value; })
        .slice(0, 20);
    }

    lbCache[cacheKey] = data;
    renderLeaderboard(data);

  } catch(e) {
    console.error('[leaderboard]', e.message || e);
    if (listEl) listEl.innerHTML = '<div style="color:rgba(255,255,255,0.4);font-size:12px;padding:16px;text-align:center">Could not load leaderboard</div>';
  }

  if (loadingEl) loadingEl.style.display = 'none';
}
window.loadLeaderboard = loadLeaderboard;

// ── RENDER ──
function renderLeaderboard(data) {
  var listEl  = document.getElementById('leaderboard-list');
  var emptyEl = document.getElementById('lb-empty');
  var myCard  = document.getElementById('my-rank-card');
  var myRow   = document.getElementById('my-rank-row');
  if (!listEl) return;

  if (!data || !data.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (myCard)  myCard.style.display  = 'none';
    return;
  }

  var myIdx = currentUser
    ? data.findIndex(function(r) { return r.user_id === currentUser.id; })
    : -1;

  listEl.innerHTML = data.map(function(row, i) {
    var isMe    = currentUser && row.user_id === currentUser.id;
    var color   = LB_COLORS[i % LB_COLORS.length];
    var initial = (row.username || '?')[0].toUpperCase();
    var rankEl  = i < 3
      ? '<span style="font-size:20px">' + LB_MEDALS[i] + '</span>'
      : '<span style="font-size:13px;font-weight:900;color:rgba(255,255,255,0.5)">#' + (i + 1) + '</span>';

    return '<div class="lb-row' + (isMe ? ' lb-you' : '') + '">' +
      '<div class="lb-rank">' + rankEl + '</div>' +
      '<div class="lb-avatar" style="background:' + color + '">' + initial + '</div>' +
      '<div class="lb-info">' +
        '<div class="lb-username">' + row.username +
          (isMe ? ' <span style="color:#ffd700;font-size:10px;font-weight:800">YOU</span>' : '') +
        '</div>' +
        '<div class="lb-subtitle">' + row.unit + '</div>' +
      '</div>' +
      '<div class="lb-stat">' + Number(row.value).toLocaleString() + '</div>' +
    '</div>';
  }).join('');

  // Show my rank card
  if (myCard) myCard.style.display = 'block';
  if (myRow) {
    if (myIdx === -1) {
      myRow.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,0.5)">You are not in the top ' + data.length + ' yet — keep going!</div>';
    } else {
      var me = data[myIdx];
      myRow.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="font-size:18px;font-weight:900;color:#ffd700">#' + (myIdx + 1) + '</div>' +
          '<div style="flex:1;font-size:13px;font-weight:800">' + me.username + '</div>' +
          '<div style="font-size:16px;font-weight:900;color:#ffd700">' +
            Number(me.value).toLocaleString() +
            ' <span style="font-size:10px;color:rgba(255,255,255,0.4)">' + me.unit + '</span>' +
          '</div>' +
        '</div>';
    }
  }
}

// ── PROFILE RANK BADGE + MINI BOARD ──
async function loadProfileRank() {
  if (!currentUser) return;
  try {
    var res = await supabaseClient
      .from('characters')
      .select('user_id, xp, profiles(username)')
      .order('xp', { ascending: false });
    if (res.error) throw res.error;

    var data  = res.data || [];
    var myIdx = data.findIndex(function(r) { return r.user_id === currentUser.id; });
    var rank  = myIdx + 1;

    // Update rank badge
    var badge    = document.getElementById('profile-rank-badge');
    var rankText = document.getElementById('profile-rank-text');
    if (badge)    badge.style.display    = 'flex';
    if (rankText) rankText.textContent   = '#' + rank + ' All Time · XP';
    // Mini leaderboard — top 3 + me if outside
    var miniEl = document.getElementById('profile-mini-lb');
    if (!miniEl) return;

    var top3 = data.slice(0, 3);
    miniEl.innerHTML = top3.map(function(row, i) {
      var isMe    = row.user_id === currentUser.id;
      var color   = LB_COLORS[i % LB_COLORS.length];
      var username = (row.profiles && row.profiles.username) || (isMe ? 'You' : '—');
      var initial  = username[0].toUpperCase();
      return '<div class="lb-row' + (isMe ? ' lb-you' : '') + '" style="padding:8px 0">' +
        '<div class="lb-rank" style="width:28px;font-size:16px">' + LB_MEDALS[i] + '</div>' +
        '<div class="lb-avatar" style="background:' + color + ';width:30px;height:30px;font-size:12px">' + initial + '</div>' +
        '<div class="lb-info"><div class="lb-username" style="font-size:12px">' + username + '</div></div>' +
        '<div class="lb-stat" style="font-size:13px">' + Number(row.xp || 0).toLocaleString() + ' <span style="font-size:9px;color:rgba(255,255,255,0.4)">XP</span></div>' +
      '</div>';
    }).join('');

    if (myIdx >= 3) {
      var myData = data[myIdx];
      var myUsername = (myData.profiles && myData.profiles.username) || 'You';
      miniEl.innerHTML +=
        '<div style="height:1px;background:rgba(255,255,255,0.06);margin:4px 0"></div>' +
        '<div class="lb-row lb-you" style="padding:8px 0">' +
          '<div class="lb-rank" style="font-size:12px;font-weight:900;color:rgba(255,255,255,0.4);width:28px">#' + rank + '</div>' +
          '<div class="lb-avatar" style="background:#ffd700;width:30px;height:30px;font-size:12px;color:#000">' + myUsername[0].toUpperCase() + '</div>' +
          '<div class="lb-info"><div class="lb-username" style="font-size:12px">' + myUsername + '</div></div>' +
          '<div class="lb-stat" style="font-size:13px">' + Number(myData.xp || 0).toLocaleString() + ' <span style="font-size:9px;color:rgba(255,255,255,0.4)">XP</span></div>' +
        '</div>';
    }

  } catch(e) {
    console.error('[profile rank]', e.message || e);
  }
}
window.loadProfileRank = loadProfileRank;

// ── BAR LEADERBOARD (used in bar page) ──
function setBarLbRange(n) {
  barLbRange = n;
  [3, 10, 50].forEach(function(x) {
    var btn = document.getElementById('blb-' + x);
    if (btn) btn.className = 'bar-lb-range' + (x === n ? ' active' : '');
  });
  loadBarLeaderboard();
}
window.setBarLbRange = setBarLbRange;

function setBarLbTab(tab) {
  barLbTab = tab;
  ['checkins', 'reports'].forEach(function(t) {
    var btn = document.getElementById('blbt-' + t);
    if (btn) btn.className = 'lb-tab' + (t === tab ? ' active' : '');
  });
  loadBarLeaderboard();
}
window.setBarLbTab = setBarLbTab;

async function loadBarLeaderboard() {
  if (currentBarIndex === null) return;
  var barName = bars[currentBarIndex] && bars[currentBarIndex].name;
  if (!barName) return;
  var el = document.getElementById('bar-leaderboard-list');
  if (!el) return;
  el.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.4);padding:8px 0">Loading...</div>';

  var cacheKey = barName + '_' + barLbTab + '_' + barLbRange;
  if (barLbCache[cacheKey]) { renderBarLeaderboard(barLbCache[cacheKey]); return; }

  try {
    var data = [];

    if (barLbTab === 'checkins') {
      var res = await supabaseClient
        .from('bump_sessions')
        .select('user_id, profiles(username)')
        .eq('bar_name', barName);
      if (res.error) throw res.error;
      var counts = {};
      var names  = {};
      (res.data || []).forEach(function(r) {
        counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        names[r.user_id]  = (r.profiles && r.profiles.username) || 'Unknown';
      });
      data = Object.keys(counts)
        .map(function(uid) { return { user_id: uid, username: names[uid], value: counts[uid], unit: 'check-ins' }; })
        .sort(function(a, b) { return b.value - a.value; })
        .slice(0, barLbRange);

    } else if (barLbTab === 'reports') {
      var res2 = await supabaseClient
        .from('reports')
        .select('user_id, profiles(username)')
        .eq('bar', barName);
      if (res2.error) throw res2.error;
      var counts2 = {};
      var names2  = {};
      (res2.data || []).forEach(function(r) {
        counts2[r.user_id] = (counts2[r.user_id] || 0) + 1;
        names2[r.user_id]  = (r.profiles && r.profiles.username) || 'Unknown';
      });
      data = Object.keys(counts2)
        .map(function(uid) { return { user_id: uid, username: names2[uid], value: counts2[uid], unit: 'reports' }; })
        .sort(function(a, b) { return b.value - a.value; })
        .slice(0, barLbRange);
    }

    barLbCache[cacheKey] = data;
    renderBarLeaderboard(data);

  } catch(e) {
    el.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.4);padding:8px 0">Could not load</div>';
  }
}
window.loadBarLeaderboard = loadBarLeaderboard;

function renderBarLeaderboard(data) {
  var el = document.getElementById('bar-leaderboard-list');
  if (!el) return;
  if (!data || !data.length) {
    el.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.4);padding:8px 0">No regulars yet — be the first!</div>';
    return;
  }
  el.innerHTML = data.map(function(row, i) {
    var isMe    = currentUser && row.user_id === currentUser.id;
    var color   = LB_COLORS[i % LB_COLORS.length];
    var initial = (row.username || '?')[0].toUpperCase();
    return '<div class="lb-row' + (isMe ? ' lb-you' : '') + '" style="padding:8px 0">' +
      '<div class="lb-rank" style="font-size:14px;width:24px">' + (i < 3 ? LB_MEDALS[i] : '#' + (i + 1)) + '</div>' +
      '<div class="lb-avatar" style="background:' + color + ';width:30px;height:30px;font-size:12px">' + initial + '</div>' +
      '<div class="lb-info"><div class="lb-username" style="font-size:12px">' + row.username + (isMe ? ' ★' : '') + '</div></div>' +
      '<div class="lb-stat" style="font-size:13px">' + row.value + ' <span style="font-size:9px;color:rgba(255,255,255,0.4)">' + row.unit + '</span></div>' +
    '</div>';
  }).join('');
}
window.renderBarLeaderboard = renderBarLeaderboard;
