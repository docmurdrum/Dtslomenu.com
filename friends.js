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
// QR CODE FRIEND ADD
// ══════════════════════════════════════════════

function showMyQR() {
  if (!currentUser) { showToast('⚠️ Sign in first'); return; }

  const username  = getUsername();
  const userId    = currentUser.id;
  const level     = parseInt(document.getElementById('xp-level-badge')?.textContent?.replace('Level ','')) || 1;
  const title     = document.getElementById('char-title-badge')?.textContent || '';
  const avatarUrl = localStorage.getItem('dtslo_avatar_render') || '';

  // Public profile URL — shareable link
  const profileUrl = 'https://dtslomenu.com/u/' + encodeURIComponent(username);
  // Full QR data includes both profile link + friend-add param
  const qrData = profileUrl + '?add=' + encodeURIComponent(userId);

  // Populate modal
  const modal = document.getElementById('qr-modal');
  document.getElementById('qr-username-display').textContent = username;
  document.getElementById('qr-ref-code').textContent = title || ('Level ' + level);
  document.getElementById('qr-profile-url').textContent = profileUrl;

  // Avatar in QR modal
  const avatarEl = document.getElementById('qr-avatar-img');
  if (avatarEl) {
    avatarEl.src = avatarUrl || '';
    avatarEl.style.display = avatarUrl ? 'block' : 'none';
  }

  modal.style.display = 'flex';

  // Generate QR — dark background, cyan color to match brand
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='
    + encodeURIComponent(qrData)
    + '&bgcolor=06060f&color=00f5ff&qzone=2&format=png';

  const display = document.getElementById('qr-code-display');
  const qrImg = document.createElement('img');
  qrImg.src = qrUrl;
  qrImg.id = 'qr-img-generated';
  qrImg.style.cssText = 'width:200px;height:200px;border-radius:12px;display:block';
  qrImg.onerror = function() {
    // Fallback to black on white
    this.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='
      + encodeURIComponent(qrData) + '&qzone=2';
  };
  display.innerHTML = '';
  display.appendChild(qrImg);

  // Store for share/download
  window._currentQRData = { qrData, profileUrl, username, level, title };
}

// Share profile QR
async function shareProfileQR() {
  const d = window._currentQRData;
  if (!d) return;

  if (navigator.share) {
    try {
      await navigator.share({
        title: d.username + ' on MENU',
        text: 'Check out ' + d.username + 's profile on MENU! Level ' + d.level + (d.title ? ' · ' + d.title : ''),
        url: d.profileUrl,
      });
      return;
    } catch(e) {}
  }

  // Fallback — copy link
  try {
    await navigator.clipboard.writeText(d.profileUrl);
    showToast('✅ Profile link copied!');
  } catch(e) {
    showToast('📋 ' + d.profileUrl);
  }
}

// Download QR as image
function downloadQR() {
  const img = document.getElementById('qr-img-generated');
  const d = window._currentQRData;
  if (!img || !d) return;

  // Create download link
  const a = document.createElement('a');
  a.href = img.src;
  a.download = d.username + '_menu_qr.png';
  a.target = '_blank';
  a.click();
  showToast('📥 QR saved!');
}

function closeQRModal() {
  document.getElementById('qr-modal').style.display = 'none';
}

function scanQR() {
  // Use native camera/QR scanner via URL scheme — works on most Android/iOS
  // Falls back to instructions if not supported
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    showToast('📷 Open your camera to scan a QR code');
  } else {
    showToast('📷 Open your camera to scan a QR code');
  }
}

// Handle incoming QR scan (called when app loads with ?add= param)
function handleIncomingQR() {
  const params = new URLSearchParams(window.location.search);
  const addUserId = params.get('add');
  if (!addUserId || !currentUser) return;
  if (addUserId === currentUser.id) return;

  // Auto-send friend request
  supabaseClient.from('profiles').select('username').eq('id', addUserId).single()
    .then(({ data }) => {
      if (data) {
        supabaseClient.from('friendships').insert({
          requester_id: currentUser.id,
          addressee_id: addUserId,
          status: 'pending',
          created_at: new Date().toISOString()
        }).then(({ error }) => {
          if (!error) showToast('✅ Friend request sent to ' + data.username + '!');
        });
      }
    });
}
