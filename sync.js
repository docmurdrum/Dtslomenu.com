// ══════════════════════════════════════════════
// SYNC.JS — Supabase sync layer
// Handles: itineraries, bar_stamps, crafting_inventory,
//          missions_progress, preferences
//
// Pattern: localStorage is source of truth for speed.
// Supabase is synced in background on every write.
// On login: pull from Supabase, merge into localStorage.
// ══════════════════════════════════════════════

var _syncDebounceTimers = {};

// Debounced write — waits 600ms after last call before writing to Supabase
function syncDebounce(key, fn) {
  clearTimeout(_syncDebounceTimers[key]);
  _syncDebounceTimers[key] = setTimeout(fn, 600);
}


// ══════════════════════════════════════════════
// MASTER SYNC — called on login
// Pulls all user data from Supabase and merges
// ══════════════════════════════════════════════

async function syncPullAll(userId) {
  if (!userId || !supabaseClient) return;
  try {
    await Promise.all([
      syncPullItineraries(userId),
      syncPullStamps(userId),
      syncPullCrafting(userId),
      syncPullMissions(userId),
      syncPullPreferences(userId),
    ]);
    console.log('[Sync] Pull complete');
  } catch(e) {
    console.warn('[Sync] Pull failed:', e.message);
  }
}
window.syncPullAll = syncPullAll;


// ══════════════════════════════════════════════
// ITINERARIES
// ══════════════════════════════════════════════

async function syncPullItineraries(userId) {
  try {
    var res = await supabaseClient
      .from('itineraries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (res.error) throw res.error;
    if (!res.data || !res.data.length) return;

    // Parse stops JSON string back to array
    var remote = res.data.map(function(r) {
      return Object.assign({}, r, {
        stops: typeof r.stops === 'string' ? JSON.parse(r.stops) : (r.stops || [])
      });
    });

    // Merge: remote wins for any conflicts (newer updated_at)
    var local = [];
    try { local = JSON.parse(localStorage.getItem('dtslo_itineraries') || '[]'); } catch(e) {}

    var merged = mergeById(local, remote, 'updated_at');
    localStorage.setItem('dtslo_itineraries', JSON.stringify(merged));
  } catch(e) {
    console.warn('[Sync] itineraries pull:', e.message);
  }
}

function syncPushItinerary(itin) {
  if (!currentUser || !itin) return;
  syncDebounce('itin_' + itin.id, async function() {
    try {
      await supabaseClient.from('itineraries').upsert({
        id:              itin.id,
        user_id:         currentUser.id,
        share_id:        itin.share_id,
        name:            itin.name,
        mode:            itin.mode,
        start_time:      itin.start_time,
        using_rideshare: itin.using_rideshare || false,
        group_size:      itin.group_size || 2,
        stops:           JSON.stringify(itin.stops || []),
        total_cost:      itin.total_cost || '',
        ride_note:       itin.ride_note || '',
        pro_tip:         itin.pro_tip || '',
        is_public:       itin.is_public || false,
        last_event:      itin.last_event || null,
      }, { onConflict: 'id' });
    } catch(e) {
      console.warn('[Sync] itinerary push:', e.message);
    }
  });
}
window.syncPushItinerary = syncPushItinerary;

async function syncDeleteItinerary(itinId) {
  if (!currentUser) return;
  try {
    await supabaseClient.from('itineraries').delete().eq('id', itinId).eq('user_id', currentUser.id);
  } catch(e) {
    console.warn('[Sync] itinerary delete:', e.message);
  }
}
window.syncDeleteItinerary = syncDeleteItinerary;


// ══════════════════════════════════════════════
// BAR STAMPS
// ══════════════════════════════════════════════

async function syncPullStamps(userId) {
  try {
    var res = await supabaseClient
      .from('bar_stamps')
      .select('*')
      .eq('user_id', userId);
    if (res.error) throw res.error;
    if (!res.data) return;

    // Merge with local stamps
    var local = [];
    try { local = JSON.parse(localStorage.getItem('dtslo_bar_stamps') || '[]'); } catch(e) {}

    var remoteNames = res.data.map(function(s) { return s.bar_name; });
    var localNames  = local.map(function(s) { return s.bar_name; });

    // Add any remote stamps not in local
    res.data.forEach(function(s) {
      if (!localNames.includes(s.bar_name)) local.push(s);
    });

    localStorage.setItem('dtslo_bar_stamps', JSON.stringify(local));
  } catch(e) {
    console.warn('[Sync] stamps pull:', e.message);
  }
}

function syncPushStamp(barName, barColor, barEmoji) {
  if (!currentUser) return;
  syncDebounce('stamp_' + barName, async function() {
    try {
      await supabaseClient.from('bar_stamps').upsert({
        user_id:   currentUser.id,
        bar_name:  barName,
        bar_color: barColor || '',
        bar_emoji: barEmoji || '',
      }, { onConflict: 'user_id,bar_name' });
    } catch(e) {
      console.warn('[Sync] stamp push:', e.message);
    }
  });
}
window.syncPushStamp = syncPushStamp;


// ══════════════════════════════════════════════
// CRAFTING INVENTORY
// ══════════════════════════════════════════════

async function syncPullCrafting(userId) {
  try {
    var res = await supabaseClient
      .from('crafting_inventory')
      .select('*')
      .eq('user_id', userId);
    if (res.error) throw res.error;
    if (!res.data || !res.data.length) return;

    // Remote is source of truth for crafting quantities
    var local = {};
    try { local = JSON.parse(localStorage.getItem('dtslo_crafting_wallet') || '{}'); } catch(e) {}

    res.data.forEach(function(row) {
      // Remote wins
      local[row.item_id] = {
        id:       row.item_id,
        name:     row.item_name,
        type:     row.item_type,
        quantity: row.quantity,
      };
    });

    localStorage.setItem('dtslo_crafting_wallet', JSON.stringify(local));
  } catch(e) {
    console.warn('[Sync] crafting pull:', e.message);
  }
}

function syncPushCraftingItem(itemId, itemName, itemType, quantity) {
  if (!currentUser) return;
  syncDebounce('craft_' + itemId, async function() {
    try {
      if (quantity <= 0) {
        await supabaseClient.from('crafting_inventory')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('item_id', itemId);
      } else {
        await supabaseClient.from('crafting_inventory').upsert({
          user_id:   currentUser.id,
          item_id:   itemId,
          item_name: itemName,
          item_type: itemType || 'material',
          quantity:  quantity,
        }, { onConflict: 'user_id,item_id' });
      }
    } catch(e) {
      console.warn('[Sync] crafting push:', e.message);
    }
  });
}
window.syncPushCraftingItem = syncPushCraftingItem;


// ══════════════════════════════════════════════
// MISSIONS PROGRESS
// ══════════════════════════════════════════════

async function syncPullMissions(userId) {
  try {
    var res = await supabaseClient
      .from('missions_progress')
      .select('*')
      .eq('user_id', userId);
    if (res.error) throw res.error;
    if (!res.data || !res.data.length) return;

    var local = {};
    try { local = JSON.parse(localStorage.getItem('dtslo_missions_progress') || '{}'); } catch(e) {}

    res.data.forEach(function(row) {
      local[row.mission_id] = {
        status:       row.status,
        progress:     row.progress,
        target:       row.target,
        completed_at: row.completed_at,
        claimed_at:   row.claimed_at,
      };
    });

    localStorage.setItem('dtslo_missions_progress', JSON.stringify(local));
  } catch(e) {
    console.warn('[Sync] missions pull:', e.message);
  }
}

function syncPushMission(missionId, status, progress, target) {
  if (!currentUser) return;
  syncDebounce('mission_' + missionId, async function() {
    try {
      var row = {
        user_id:    currentUser.id,
        mission_id: missionId,
        status:     status,
        progress:   progress || 0,
        target:     target || 1,
      };
      if (status === 'completed' || status === 'claimed') {
        row.completed_at = new Date().toISOString();
      }
      if (status === 'claimed') {
        row.claimed_at = new Date().toISOString();
      }
      await supabaseClient.from('missions_progress').upsert(row, { onConflict: 'user_id,mission_id' });
    } catch(e) {
      console.warn('[Sync] mission push:', e.message);
    }
  });
}
window.syncPushMission = syncPushMission;


// ══════════════════════════════════════════════
// PREFERENCES
// Simple key-value settings that follow the account
// ══════════════════════════════════════════════

var _prefsCache = null;

async function syncPullPreferences(userId) {
  try {
    // Use limit(1) instead of .single() — guards against duplicate profile rows throwing
    var res = await supabaseClient
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .limit(1);
    if (res.error) throw res.error;
    var row = Array.isArray(res.data) ? res.data[0] : res.data;
    if (!row || !row.preferences) return;

    _prefsCache = row.preferences;

    // Apply known preferences
    if (_prefsCache.skip_hub_screen !== undefined) {
      localStorage.setItem('menu_skip_to_dtslo', _prefsCache.skip_hub_screen ? '1' : '0');
    }

    console.log('[Sync] Preferences loaded:', Object.keys(_prefsCache).join(', '));
  } catch(e) {
    console.warn('[Sync] preferences pull:', e.message);
  }
}

function syncPushPreference(key, value) {
  if (!currentUser) return;

  // Update local cache
  if (!_prefsCache) _prefsCache = {};
  _prefsCache[key] = value;

  syncDebounce('pref_' + key, async function() {
    try {
      // Use jsonb_set pattern — merge into existing object
      await supabaseClient.from('profiles').update({
        preferences: _prefsCache
      }).eq('id', currentUser.id);
    } catch(e) {
      console.warn('[Sync] preference push:', e.message);
    }
  });
}
window.syncPushPreference = syncPushPreference;

function getPref(key, defaultVal) {
  if (_prefsCache && _prefsCache[key] !== undefined) return _prefsCache[key];
  return defaultVal;
}
window.getPref = getPref;


// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

// Merge two arrays by id — remote wins on conflict if it has newer updated_at
function mergeById(local, remote, dateField) {
  var map = {};
  local.forEach(function(item) { map[item.id] = item; });
  remote.forEach(function(item) {
    if (!map[item.id]) {
      map[item.id] = item;
    } else {
      var localDate  = new Date(map[item.id][dateField] || 0).getTime();
      var remoteDate = new Date(item[dateField] || 0).getTime();
      if (remoteDate >= localDate) map[item.id] = item;
    }
  });
  return Object.values(map).sort(function(a, b) {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}
