// ══════════════════════════════════════════════
// EVENTS_HUB.JS — SLO Events Hub v2
// Data sourced from Supabase events table
// Columns: id, title, venue, category, event_date, event_time,
//          price, ticket_url, image_url, description, active,
//          address, recurring, city_id, featured
// ══════════════════════════════════════════════

var EVENTS_DATA = [];

async function loadEvents(catId) {
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No Supabase client');
    var today = new Date().toISOString().split('T')[0];
    var q = sb.from('events')
      .select('id, title, venue, category, event_date, event_time, price, ticket_url, image_url, description, address, recurring, city_id, featured, lat, lng')
      .eq('city_id', 'slo')
      .eq('active', true)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(100);
    if (catId && catId !== 'all') {
      if (catId === 'free')      q = q.ilike('price', '%free%');
      else if (catId === 'recurring') q = q.eq('recurring', true);
      else q = q.eq('category', catId);
    }
    var res = await q;
    if (res.error) throw res.error;
    return res.data || [];
  } catch(e) {
    console.warn('[EventsHub] load failed:', e);
    throw e;
  }
}

var EVENTS_FILTERS = [
  { id: 'all',       label: 'All',      emoji: '🎭' },
  { id: 'music',     label: 'Music',    emoji: '🎵' },
  { id: 'theater',   label: 'Theater',  emoji: '🎪' },
  { id: 'market',    label: 'Markets',  emoji: '🥕' },
  { id: 'arts',      label: 'Arts',     emoji: '🎨' },
  { id: 'free',      label: 'Free',     emoji: '🆓' },
  { id: 'recurring', label: 'Weekly',   emoji: '📅' },
];

function evRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px;padding-top:4px">' +
    [1,2,3,4].map(function() {
      return '<div style="height:72px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)"></div>';
    }).join('') + '</div>';
}

function evCategoryEmoji(cat) {
  var map = { music:'🎵', theater:'🎪', market:'🥕', arts:'🎨', bar:'🍺', sports:'⚽', general:'🎭' };
  return map[cat] || '🎭';
}

function evFormatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
}

function evFormatTime(timeStr) {
  if (!timeStr) return '';
  var parts = timeStr.split(':');
  var h = parseInt(parts[0]);
  var m = parts[1] || '00';
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + m + ' ' + ampm;
}

function openEventsHub() {
  if (typeof trackHubVisit === 'function') trackHubVisit('events');
  var existing = document.getElementById('mh-events-hub');
  if (existing) existing.remove();

  if (!document.getElementById('events-hub-css')) {
    var s = document.createElement('style');
    s.id = 'events-hub-css';
    s.textContent = [
      '.ev-filter{padding:7px 13px;border-radius:20px;border:1px solid rgba(255,215,0,0.2);background:rgba(255,215,0,0.05);color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:Helvetica Neue,sans-serif;flex-shrink:0;transition:all 0.15s}',
      '.ev-filter.active{background:rgba(255,215,0,0.15);border-color:#ffd700;color:#ffd700}',
      '.ev-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;cursor:pointer;transition:all 0.15s}',
      '.ev-card:active{background:rgba(255,215,0,0.06);transform:scale(0.98)}',
      '.ev-badge{padding:2px 7px;border-radius:20px;font-size:9px;font-weight:800}',
      '.ev-badge-free{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:#22c55e}',
      '.ev-badge-recurring{background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.2);color:#ffd700}',
      '.ev-badge-featured{background:rgba(255,165,0,0.1);border:1px solid rgba(255,165,0,0.2);color:#ffa500}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-events-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.96);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="menuHomeCloseEventsHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🎭 Events</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Concerts · Markets · Festivals</div>' +
        '</div>' +
        '<button onclick="menuHomeCloseEventsHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        EVENTS_FILTERS.map(function(f, i) {
          return '<button class="ev-filter' + (i===0?' active':'') + '" data-id="' + f.id + '" onclick="evFilter(this,this.dataset.id)">' + f.emoji + ' ' + f.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="events-content" style="flex:1;overflow-y:auto;padding:0 20px 48px">' +
      evRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('events');

  loadEvents('all').then(function(events) {
    EVENTS_DATA = events;
    var content = document.getElementById('events-content');
    if (!content) return;
    content.innerHTML = evRenderList(events);
  }).catch(function(err) {
    var content = document.getElementById('events-content');
    if (!content) return;
    content.innerHTML =
      '<div style="padding:20px;background:rgba(255,45,120,0.1);border:1px solid rgba(255,45,120,0.3);border-radius:12px;margin-top:16px;font-size:12px;color:rgba(255,255,255,0.7)">' +
        '<div style="font-weight:800;color:#ff2d78;margin-bottom:8px">Error loading events</div>' +
        '<div style="word-break:break-all">' + (err && err.message ? err.message : String(err)) + '</div>' +
      '</div>';
  });
}
window.menuHomeOpenEventsHub = openEventsHub;

function closeEventsHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('events');
  var h = document.getElementById('mh-events-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.menuHomeCloseEventsHub = closeEventsHub;

function evFilter(el, filterId) {
  document.querySelectorAll('.ev-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var content = document.getElementById('events-content');
  if (content) content.innerHTML = evRenderLoading();
  loadEvents(filterId).then(function(events) {
    EVENTS_DATA = events;
    if (content) content.innerHTML = evRenderList(events);
  }).catch(function(err) {
    if (content) content.innerHTML =
      '<div style="padding:20px;background:rgba(255,45,120,0.1);border:1px solid rgba(255,45,120,0.3);border-radius:12px;font-size:12px;color:rgba(255,255,255,0.7)">' +
        '<div style="font-weight:800;color:#ff2d78;margin-bottom:8px">Error</div>' +
        '<div>' + (err && err.message ? err.message : String(err)) + '</div>' +
      '</div>';
  });
}
window.evFilter = evFilter;

function evRenderList(events) {
  if (!events.length) return '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.3);font-size:13px">No events found</div>';
  return events.map(function(r) {
    var isFree = r.price && r.price.toLowerCase().indexOf('free') >= 0;
    var emoji = evCategoryEmoji(r.category);
    return '<div class="ev-card" data-id="' + r.id + '" onclick="evOpenDetail(this.dataset.id)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="font-size:26px;flex-shrink:0">' + emoji + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (r.title || '') + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45)">' + evFormatDate(r.event_date) + (r.event_time ? ' · ' + evFormatTime(r.event_time) : '') + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:1px">' + (r.venue || '') + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end;flex-shrink:0">' +
          (isFree ? '<span class="ev-badge ev-badge-free">Free</span>' : (r.price ? '<span style="font-size:10px;color:rgba(255,255,255,0.5)">' + r.price + '</span>' : '')) +
          (r.recurring ? '<span class="ev-badge ev-badge-recurring">Weekly</span>' : '') +
          (r.featured ? '<span class="ev-badge ev-badge-featured">Featured</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function evOpenDetail(id) {
  var r = EVENTS_DATA.find(function(x) { return String(x.id) === String(id); });
  if (!r) return;

  var existing = document.getElementById('mh-ev-detail');
  if (existing) existing.remove();

  var isFree = r.price && r.price.toLowerCase().indexOf('free') >= 0;
  var emoji = evCategoryEmoji(r.category);

  var sheet = document.createElement('div');
  sheet.id = 'mh-ev-detail';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:11000;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:flex-end;opacity:0;transition:opacity 0.3s';

  var inner = document.createElement('div');
  inner.id = 'mh-ev-inner';
  inner.style.cssText = 'width:100%;background:rgba(8,8,20,0.99);border-radius:24px 24px 0 0;border-top:2px solid rgba(255,215,0,0.25);padding:14px 20px 48px;max-height:85vh;overflow-y:auto;transform:translateY(20px);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1)';

  inner.innerHTML =
    '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="evCloseDetail()"></div>' +
    '<div style="font-size:36px;margin-bottom:8px">' + emoji + '</div>' +
    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px">' +
      '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif;flex:1">' + (r.title || '') + '</div>' +
      '<div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px;margin-top:4px">' +
        (isFree ? '<span class="ev-badge ev-badge-free">Free</span>' : '') +
        (r.recurring ? '<span class="ev-badge ev-badge-recurring">Weekly</span>' : '') +
        (r.featured ? '<span class="ev-badge ev-badge-featured">Featured</span>' : '') +
      '</div>' +
    '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:14px">' +
      evFormatDate(r.event_date) +
      (r.event_time ? ' · ' + evFormatTime(r.event_time) : '') +
      (r.venue ? ' · ' + r.venue : '') +
    '</div>' +
    (r.description ? '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-bottom:14px">' + r.description + '</div>' : '') +
    (r.address ? '<div style="font-size:12px;color:rgba(255,255,255,0.35);margin-bottom:14px">📍 ' + r.address + '</div>' : '') +
    (!isFree && r.price ? '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:14px">💵 ' + r.price + '</div>' : '') +
    '<div style="display:flex;gap:8px">' +
      (r.address ? '<a href="https://www.google.com/maps/search/' + encodeURIComponent((r.venue || '') + ' ' + (r.address || '') + ' San Luis Obispo CA') + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);color:#ffd700;text-decoration:none;font-size:12px;font-weight:800;text-align:center">Directions ↗</a>' : '') +
      (r.ticket_url ? '<a href="' + r.ticket_url + '" target="_blank" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);text-decoration:none;font-size:12px;font-weight:800;text-align:center">Tickets ↗</a>' : '') +
    '</div>';

  sheet.appendChild(inner);
  getHubParent().appendChild(sheet);

  setTimeout(function() {
    sheet.style.opacity = '1';
    inner.style.transform = 'translateY(0)';
    if (typeof homeMap !== 'undefined' && homeMap && r.lng && r.lat) {
      try { homeMap.flyTo({ center: [r.lng, r.lat], zoom: 15, duration: 800 }); } catch(e) {}
    }
  }, 30);

  sheet.addEventListener('click', function(e) { if (e.target === sheet) evCloseDetail(); });
}
window.evOpenDetail = evOpenDetail;

function evCloseDetail() {
  var s = document.getElementById('mh-ev-detail');
  if (s) { s.style.opacity = '0'; setTimeout(function() { s.remove(); }, 300); }
}
window.evCloseDetail = evCloseDetail;
