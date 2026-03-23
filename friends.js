// ══════════════════════════════════════════════
// FRIENDS.JS — Friends List, DMs, Group Chats
// ══════════════════════════════════════════════

let friendsList        = [];
let friendRequests     = [];
let currentDMUser      = null;
let currentGroupChat   = null;
window.friendsCheckins = [];

// ── INIT ──
async function initFriends() {
  if (!currentUser) return;
  await loadFriends();
  await loadFriendRequests();
  await loadFriendsCheckins();
  renderFriendsList();
  renderFriendRequests();
}

// ── LOAD FRIENDS ──
async function loadFriends() {
  try {
    const { data } = await supabaseClient
      .from('friendships')
      .select('*, requester:profiles!friendships_requester_id_fkey(id,username), addressee:profiles!friendships_addressee_id_fkey(id,username)')
      .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`)
      .eq('status', 'accepted');
    friendsList = (data || []).map(f => {
      const other = f.requester_id === currentUser.id ? f.addressee : f.requester;
      return { id: other?.id, username: other?.username, friendshipId: f.id,
               color: stringToColor(other?.username || '') };
    }).filter(f => f.id);
  } catch(e) { console.error('loadFriends:', e); }
}

// ── LOAD FRIEND REQUESTS ──
async function loadFriendRequests() {
  try {
    const { data } = await supabaseClient
      .from('friendships')
      .select('*, requester:profiles!friendships_requester_id_fkey(id,username)')
      .eq('addressee_id', currentUser.id)
      .eq('status', 'pending');
    friendRequests = (data || []).map(f => ({
      id: f.id, requesterId: f.requester_id,
      username: f.requester?.username, color: stringToColor(f.requester?.username || '')
    }));
    // Update badge
    const badge = document.getElementById('friends-request-badge');
    if (badge) { badge.textContent = friendRequests.length; badge.style.display = friendRequests.length ? 'flex' : 'none'; }
  } catch(e) { console.error('loadFriendRequests:', e); }
}

// ── LOAD FRIENDS CHECKINS (for Lines page) ──
async function loadFriendsCheckins() {
  if (!friendsList.length) return;
  try {
    const friendIds = friendsList.map(f => f.id);
    const cutoff    = new Date(Date.now() - 4*60*60*1000).toISOString();
    const { data }  = await supabaseClient
      .from('checkins')
      .select('*, profile:profiles(username)')
      .in('user_id', friendIds)
      .gte('checked_in_at', cutoff);
    window.friendsCheckins = (data || []).map(c => ({
      userId: c.user_id, username: c.profile?.username || '?',
      barName: c.bar_name, type: c.type,
      color: stringToColor(c.profile?.username || '')
    }));
  } catch(e) { console.error('loadFriendsCheckins:', e); }
}

function stringToColor(str) {
  const colors = ['#b44fff','#ff2d78','#00f5ff','#ffd700','#00ff88','#ff9500','#6366f1','#10b981','#ef4444','#f59e0b'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── SEND FRIEND REQUEST ──
async function sendFriendRequest() {
  if (!currentUser) { showToast('⚠️ Sign in to add friends'); return; }
  const input    = document.getElementById('friend-search-input');
  const username = input?.value.trim();
  if (!username) { showToast('⚠️ Enter a username'); return; }
  if (username === getUsername()) { showToast('⚠️ That\'s you!'); return; }

  try {
    const { data: target } = await supabaseClient
      .from('profiles').select('id,username').eq('username', username).single();
    if (!target) { showToast('❌ User not found'); return; }

    // Check not already friends
    const already = friendsList.find(f => f.id === target.id);
    if (already) { showToast('✅ Already friends!'); return; }

    const { error } = await supabaseClient.from('friendships').insert({
      requester_id: currentUser.id,
      addressee_id: target.id,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    if (input) input.value = '';
    showToast(`✅ Friend request sent to ${username}`);
  } catch(e) { showToast('❌ ' + e.message); }
}

// ── ACCEPT / DECLINE REQUEST ──
async function acceptFriendRequest(friendshipId) {
  try {
    await supabaseClient.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    await loadFriends();
    await loadFriendRequests();
    renderFriendsList();
    renderFriendRequests();
    showToast('✅ Friend added!');
  } catch(e) { showToast('❌ ' + e.message); }
}

async function declineFriendRequest(friendshipId) {
  try {
    await supabaseClient.from('friendships').delete().eq('id', friendshipId);
    await loadFriendRequests();
    renderFriendRequests();
    showToast('Declined');
  } catch(e) { showToast('❌ ' + e.message); }
}

async function removeFriend(friendId) {
  try {
    await supabaseClient.from('friendships')
      .delete()
      .or(`requester_id.eq.${currentUser.id}.and.addressee_id.eq.${friendId},requester_id.eq.${friendId}.and.addressee_id.eq.${currentUser.id}`);
    friendsList = friendsList.filter(f => f.id !== friendId);
    renderFriendsList();
    showToast('Removed');
  } catch(e) { showToast('❌ ' + e.message); }
}

// ── RENDER FRIENDS LIST ──
function renderFriendsList() {
  const el = document.getElementById('friends-list');
  if (!el) return;
  if (!friendsList.length) {
    el.innerHTML = '<div class="friends-empty"><div style="font-size:32px;margin-bottom:8px">👥</div><div>No friends yet</div><div style="font-size:11px;color:var(--text2);margin-top:4px">Search by username above to add friends</div></div>';
    return;
  }
  el.innerHTML = friendsList.map(f => {
    const checkin = window.friendsCheckins.find(c => c.userId === f.id);
    return `
    <div class="friend-row">
      <div class="friend-av" style="background:${f.color}">${f.username[0].toUpperCase()}</div>
      <div class="friend-info">
        <div class="friend-name">${f.username}</div>
        <div class="friend-status">${checkin ? `📍 ${checkin.barName}` : 'Not out tonight'}</div>
      </div>
      <div class="friend-actions">
        <button class="friend-btn" onclick="openDM('${f.id}','${f.username}')">💬</button>
        <button class="friend-btn danger" onclick="removeFriend('${f.id}')">✕</button>
      </div>
    </div>`;
  }).join('');
}

// ── RENDER FRIEND REQUESTS ──
function renderFriendRequests() {
  const el = document.getElementById('friends-requests-list');
  if (!el) return;
  const wrap = document.getElementById('friends-requests-section');
  if (wrap) wrap.style.display = friendRequests.length ? 'block' : 'none';
  el.innerHTML = friendRequests.map(r => `
    <div class="friend-row">
      <div class="friend-av" style="background:${r.color}">${r.username[0].toUpperCase()}</div>
      <div class="friend-info">
        <div class="friend-name">${r.username}</div>
        <div class="friend-status">Wants to be friends</div>
      </div>
      <div class="friend-actions">
        <button class="friend-btn accept" onclick="acceptFriendRequest(${r.id})">✓</button>
        <button class="friend-btn danger" onclick="declineFriendRequest(${r.id})">✕</button>
      </div>
    </div>`).join('');
}

// ── DIRECT MESSAGES ──
async function openDM(userId, username) {
  currentDMUser = { id: userId, username };
  document.getElementById('dm-header-name').textContent = username;
  document.getElementById('dm-messages').innerHTML = '<div style="text-align:center;color:var(--text2);font-size:12px;padding:20px">Loading…</div>';
  document.getElementById('dm-modal').style.display = 'flex';
  await loadDMMessages(userId);
  subscribeToDM(userId);
}

async function loadDMMessages(userId) {
  const el = document.getElementById('dm-messages');
  try {
    const { data } = await supabaseClient
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${userId}),` +
        `and(sender_id.eq.${userId},receiver_id.eq.${currentUser.id})`
      )
      .is('group_id', null)
      .order('created_at', { ascending: true })
      .limit(50);
    renderDMMessages(data || []);
  } catch(e) { if (el) el.innerHTML = '<div style="color:var(--neon-pink);padding:12px">❌ ' + e.message + '</div>'; }
}

function renderDMMessages(messages) {
  const el = document.getElementById('dm-messages');
  if (!el) return;
  if (!messages.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--text2);font-size:12px;padding:20px">No messages yet — say hi!</div>';
    return;
  }
  el.innerHTML = messages.map(m => {
    const mine = m.sender_id === currentUser.id;
    return `<div class="dm-msg ${mine ? 'mine' : 'theirs'}">
      <div class="dm-bubble">${escapeHtml(m.body)}</div>
      <div class="dm-time">${timeAgo(new Date(m.created_at).getTime())}</div>
    </div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

let dmSubscription = null;
function subscribeToDM(userId) {
  if (dmSubscription) dmSubscription.unsubscribe();
  dmSubscription = supabaseClient
    .channel('dm-' + userId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const m = payload.new;
      const relevant = (m.sender_id === currentUser.id && m.receiver_id === userId) ||
                       (m.sender_id === userId && m.receiver_id === currentUser.id);
      if (relevant) loadDMMessages(userId);
    })
    .subscribe();
}

async function sendDM() {
  if (!currentDMUser || !currentUser) return;
  const input = document.getElementById('dm-input');
  const body  = input?.value.trim();
  if (!body) return;
  input.value = '';
  try {
    await supabaseClient.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: currentDMUser.id,
      body,
      created_at: new Date().toISOString()
    });
  } catch(e) { showToast('❌ ' + e.message); }
}

function closeDM() {
  if (dmSubscription) { dmSubscription.unsubscribe(); dmSubscription = null; }
  document.getElementById('dm-modal').style.display = 'none';
  currentDMUser = null;
}

// ── GROUP CHATS ──
let groupChats    = [];
let activeGroupId = null;
let groupSub      = null;

async function loadGroupChats() {
  if (!currentUser) return;
  try {
    const { data } = await supabaseClient
      .from('group_members')
      .select('group_id, group:groups(id,name,created_by,created_at)')
      .eq('user_id', currentUser.id);
    groupChats = (data || []).map(d => d.group).filter(Boolean);
    renderGroupList();
  } catch(e) { console.error('loadGroupChats:', e); }
}

function renderGroupList() {
  const el = document.getElementById('group-list');
  if (!el) return;
  if (!groupChats.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:12px 0;text-align:center">No group chats yet</div>';
    return;
  }
  el.innerHTML = groupChats.map(g => `
    <div class="friend-row" onclick="openGroupChat(${g.id},'${escapeHtml(g.name)}')">
      <div class="friend-av" style="background:var(--accent)">👥</div>
      <div class="friend-info">
        <div class="friend-name">${escapeHtml(g.name)}</div>
        <div class="friend-status">Tap to open</div>
      </div>
      <div class="friend-actions"><span style="color:var(--text2);font-size:18px">›</span></div>
    </div>`).join('');
}

async function createGroupChat() {
  const input = document.getElementById('new-group-name');
  const name  = input?.value.trim();
  if (!name) { showToast('⚠️ Enter a group name'); return; }
  try {
    const { data: group, error } = await supabaseClient
      .from('groups')
      .insert({ name, created_by: currentUser.id, created_at: new Date().toISOString() })
      .select().single();
    if (error) throw error;
    await supabaseClient.from('group_members').insert({ group_id: group.id, user_id: currentUser.id });
    if (input) input.value = '';
    await loadGroupChats();
    showToast('✅ Group created!');
  } catch(e) { showToast('❌ ' + e.message); }
}

async function openGroupChat(groupId, groupName) {
  activeGroupId = groupId;
  document.getElementById('dm-header-name').textContent = groupName;
  document.getElementById('dm-messages').innerHTML = '<div style="text-align:center;color:var(--text2);font-size:12px;padding:20px">Loading…</div>';
  document.getElementById('dm-modal').style.display = 'flex';
  await loadGroupMessages(groupId);
  subscribeToGroup(groupId);
}

async function loadGroupMessages(groupId) {
  const el = document.getElementById('dm-messages');
  try {
    const { data } = await supabaseClient
      .from('messages')
      .select('*, sender:profiles(username)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(50);
    renderGroupMessages(data || []);
  } catch(e) { if (el) el.innerHTML = '❌ ' + e.message; }
}

function renderGroupMessages(messages) {
  const el = document.getElementById('dm-messages');
  if (!el) return;
  if (!messages.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--text2);font-size:12px;padding:20px">No messages yet</div>';
    return;
  }
  el.innerHTML = messages.map(m => {
    const mine = m.sender_id === currentUser.id;
    return `<div class="dm-msg ${mine ? 'mine' : 'theirs'}">
      ${!mine ? `<div class="dm-sender">${m.sender?.username || '?'}</div>` : ''}
      <div class="dm-bubble">${escapeHtml(m.body)}</div>
      <div class="dm-time">${timeAgo(new Date(m.created_at).getTime())}</div>
    </div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

function subscribeToGroup(groupId) {
  if (groupSub) { groupSub.unsubscribe(); groupSub = null; }
  groupSub = supabaseClient
    .channel('group-' + groupId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
        filter: `group_id=eq.${groupId}` }, () => { loadGroupMessages(groupId); })
    .subscribe();
}

async function sendGroupMessage() {
  if (!activeGroupId || !currentUser) return;
  const input = document.getElementById('dm-input');
  const body  = input?.value.trim();
  if (!body) return;
  input.value = '';
  try {
    await supabaseClient.from('messages').insert({
      sender_id: currentUser.id,
      group_id: activeGroupId,
      body,
      created_at: new Date().toISOString()
    });
  } catch(e) { showToast('❌ ' + e.message); }
}

// ── SEND MESSAGE (DM or group) ──
function sendMessage() {
  if (activeGroupId) sendGroupMessage();
  else sendDM();
}

// ── FRIENDS PAGE TABS ──
function setFriendsTab(tab) {
  ['list','groups','requests'].forEach(t => {
    const panel = document.getElementById('friends-tab-' + t);
    const btn   = document.getElementById('ftab-btn-' + t);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    if (btn)   btn.className = 'friends-tab-btn' + (t === tab ? ' active' : '');
  });
  if (tab === 'groups')   loadGroupChats();
  if (tab === 'requests') renderFriendRequests();
}

// ── HELPER ──
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════
// FIST BUMP FRIEND ADD
// ══════════════════════════════════════════════

let bumpMode        = false;
let bumpTimer       = null;
let bumpCountdown   = null;
let bumpImpacts     = [];
let bumpSessionId   = null;
let bumpSub         = null;
const BUMP_WINDOW   = 30;   // seconds
const BUMP_COUNT    = 3;    // impacts needed
const BUMP_INTERVAL = 2000; // ms window for 3 impacts
const BUMP_PROX_M   = 10;   // metres

// ── ACTIVATE BUMP MODE ──
async function activateBumpMode() {
  if (!currentUser) { showToast('⚠️ Sign in to use Bump'); return; }

  // Request motion permission on iOS
  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const perm = await DeviceMotionEvent.requestPermission();
      if (perm !== 'granted') { showToast('⚠️ Motion access required for Bump'); return; }
    } catch(e) { showToast('⚠️ Motion access required for Bump'); return; }
  }

  // Get GPS
  if (!navigator.geolocation) { showToast('📍 Location required for Bump'); return; }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    // Create bump session in Supabase
    try {
      const { data, error } = await supabaseClient.from('bump_sessions').insert({
        user_id:    currentUser.id,
        username:   getUsername(),
        lat, lng,
        active:     true,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + BUMP_WINDOW * 1000).toISOString()
      }).select().single();
      if (error) throw error;
      bumpSessionId = data.id;
    } catch(e) { showToast('❌ ' + e.message); return; }

    bumpMode    = true;
    bumpImpacts = [];
    renderBumpUI(BUMP_WINDOW);
    startBumpCountdown(lat, lng);
    startBumpAccelerometer();
    subscribeToBumpSessions(lat, lng);
    showToast('✊ Bump Mode ON — bump 3 times!');

  }, () => { showToast('📍 Location required for Bump'); }, { timeout: 8000 });
}

// ── COUNTDOWN ──
function startBumpCountdown(lat, lng) {
  let secs = BUMP_WINDOW;
  bumpCountdown = setInterval(() => {
    secs--;
    renderBumpUI(secs);
    if (secs <= 0) deactivateBumpMode();
  }, 1000);
}

// ── ACCELEROMETER ──
function startBumpAccelerometer() {
  window._bumpMotionHandler = (e) => {
    if (!bumpMode) return;
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
    if (mag > 28) { // sharp impact threshold
      const now = Date.now();
      // Clear old impacts outside window
      bumpImpacts = bumpImpacts.filter(t => now - t < BUMP_INTERVAL);
      bumpImpacts.push(now);
      // Vibrate feedback per impact
      if (navigator.vibrate) navigator.vibrate(50);
      if (bumpImpacts.length >= BUMP_COUNT) {
        bumpImpacts = [];
        onBumpDetected();
      }
    }
  };
  window.addEventListener('devicemotion', window._bumpMotionHandler);
}

// ── BUMP DETECTED ──
async function onBumpDetected() {
  if (!bumpMode) return;
  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  showToast('✊ Bump detected! Finding nearby players…');

  // Get current location
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    await findNearbyBumpers(lat, lng);
  }, () => { showToast('📍 Could not confirm location'); });
}

// ── FIND NEARBY BUMPERS ──
async function findNearbyBumpers(lat, lng) {
  try {
    const cutoff = new Date(Date.now() - 5000).toISOString(); // bumped in last 5s
    const { data } = await supabaseClient
      .from('bump_sessions')
      .select('*')
      .eq('active', true)
      .neq('user_id', currentUser.id)
      .gte('created_at', cutoff);

    if (!data || !data.length) { showToast('No one nearby detected — try again together'); return; }

    // Filter by proximity
    const nearby = (data || []).filter(s => {
      const dist = haversineDistance(lat, lng, s.lat, s.lng);
      return dist <= BUMP_PROX_M;
    });

    if (!nearby.length) { showToast('📍 No one within range — move closer and try again'); return; }

    if (nearby.length === 1) {
      // Auto add
      await confirmBumpFriend(nearby[0].user_id, nearby[0].username);
    } else {
      // Show picker
      showBumpPicker(nearby);
    }
  } catch(e) { showToast('❌ ' + e.message); }
}

// ── CONFIRM BUMP FRIEND ──
async function confirmBumpFriend(userId, username) {
  try {
    // Check not already friends
    if (friendsList.find(f => f.id === userId)) {
      showToast(`👊 Already friends with ${username}!`);
      deactivateBumpMode(); return;
    }
    const { error } = await supabaseClient.from('friendships').insert({
      requester_id: currentUser.id,
      addressee_id: userId,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    if (error && !error.message.includes('unique')) throw error;
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    showToast(`✊ Friend request sent to ${username}!`);
    deactivateBumpMode();
  } catch(e) { showToast('❌ ' + e.message); }
}

// ── BUMP PICKER (multiple people) ──
function showBumpPicker(players) {
  const el = document.getElementById('bump-picker');
  if (!el) return;
  el.style.display = 'block';
  document.getElementById('bump-picker-list').innerHTML = players.map(p => `
    <button class="friend-row" style="width:100%;background:none;border:none;border-bottom:1px solid var(--border);cursor:pointer;text-align:left;padding:12px 0"
      onclick="confirmBumpFriend('${p.user_id}','${p.username}')">
      <div class="friend-av" style="background:${stringToColor(p.username)}">${p.username[0].toUpperCase()}</div>
      <div class="friend-info">
        <div class="friend-name">${p.username}</div>
        <div class="friend-status">Tap to add</div>
      </div>
    </button>`).join('');
}

// ── SUBSCRIBE TO BUMP SESSIONS ──
function subscribeToBumpSessions(lat, lng) {
  if (bumpSub) bumpSub.unsubscribe();
  bumpSub = supabaseClient
    .channel('bump-watch')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bump_sessions' }, async (payload) => {
      if (!bumpMode) return;
      const s = payload.new;
      if (s.user_id === currentUser?.id) return;
      const dist = haversineDistance(lat, lng, s.lat, s.lng);
      if (dist <= BUMP_PROX_M) {
        // Someone nearby just activated bump mode — pulse the UI
        const pill = document.getElementById('bump-nearby-pill');
        if (pill) { pill.style.display = 'flex'; pill.textContent = `👊 ${s.username} is nearby!`; }
      }
    })
    .subscribe();
}

// ── DEACTIVATE ──
async function deactivateBumpMode() {
  bumpMode = false;
  clearInterval(bumpCountdown);
  bumpCountdown = null;
  bumpImpacts   = [];
  if (window._bumpMotionHandler) {
    window.removeEventListener('devicemotion', window._bumpMotionHandler);
    window._bumpMotionHandler = null;
  }
  if (bumpSub) { bumpSub.unsubscribe(); bumpSub = null; }
  if (bumpSessionId) {
    try { await supabaseClient.from('bump_sessions').update({ active: false }).eq('id', bumpSessionId); } catch(e) {}
    bumpSessionId = null;
  }
  renderBumpUI(0);
}

// ── RENDER BUMP UI ──
function renderBumpUI(secs) {
  const el = document.getElementById('bump-section');
  if (!el) return;
  if (!bumpMode || secs <= 0) {
    el.innerHTML = `
      <button class="bump-btn" onclick="activateBumpMode()">
        <span style="font-size:28px">✊</span>
        <span style="font-size:13px;font-weight:800;margin-top:4px">Bump to Add Friend</span>
        <span style="font-size:10px;color:rgba(255,255,255,0.7);margin-top:2px">Bump phones 3× together</span>
      </button>`;
    return;
  }
  el.innerHTML = `
    <div class="bump-active">
      <div class="bump-pulse-ring"></div>
      <div style="font-size:36px;position:relative;z-index:2">✊</div>
      <div style="font-size:14px;font-weight:800;margin-top:8px">Bump Mode Active</div>
      <div style="font-size:12px;color:var(--text2);margin-top:4px">Bump phones 3× together</div>
      <div style="font-size:22px;font-weight:900;color:${secs <= 10 ? 'var(--neon-pink)' : 'var(--gold)'};margin-top:8px">${secs}s</div>
      <div id="bump-nearby-pill" style="display:none;margin-top:8px;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:800;color:var(--neon-green)"></div>
      <div id="bump-picker" style="display:none;margin-top:12px;width:100%">
        <div style="font-size:11px;font-weight:800;color:var(--text2);margin-bottom:8px">Who did you bump?</div>
        <div id="bump-picker-list"></div>
      </div>
      <button onclick="deactivateBumpMode()" style="margin-top:12px;background:none;border:1px solid var(--border);border-radius:10px;padding:6px 16px;color:var(--text2);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer">Cancel</button>
    </div>`;
}
