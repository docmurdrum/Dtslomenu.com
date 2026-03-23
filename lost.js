// ══════════════════════════════════════════════
// LOST.JS — Lost & Found
// ══════════════════════════════════════════════

function openLostModal()  { document.getElementById('lost-modal').classList.add('open'); }
function closeLostModal() { document.getElementById('lost-modal').classList.remove('open'); }

async function submitLostItem() {
  const type        = document.getElementById('lf-type').value;
  const title       = document.getElementById('lf-title').value.trim();
  const location    = document.getElementById('lf-location').value.trim();
  const contact     = document.getElementById('lf-contact').value.trim();
  const description = document.getElementById('lf-description').value.trim();
  if (!title) { showToast('⚠️ Please enter item name'); return; }
  try {
    await supabaseClient.from('lost_found').insert([{
      type, title, location, contact, description, user_id: currentUser?.id
    }]);
    gainXP(15); postCount++;
    showToast('✅ Item posted — +15 XP');
    closeLostModal();
    ['lf-title','lf-location','lf-contact','lf-description'].forEach(id => document.getElementById(id).value = '');
    loadLostItems();
  } catch (e) { showToast('❌ Failed to post'); }
}

async function loadLostItems() {
  const c = document.getElementById('lost-feed');
  c.innerHTML = '<div class="loader"><div class="spinner"></div></div>';
  try {
    const { data } = await supabaseClient
      .from('lost_found').select('*').order('created_at', { ascending: false });
    c.innerHTML = '';
    if (!data?.length) {
      c.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-msg">No items posted yet</div></div>`;
      return;
    }
    data.forEach(item => {
      const isLost = item.type === 'lost';
      const el = document.createElement('div');
      el.className = 'lf-card';
      el.innerHTML = `
        <div class="lf-tag ${isLost ? 'lf-lost' : 'lf-found'}">${isLost ? '🔴 Lost' : '🟢 Found'}</div>
        <div class="lf-title">${item.title}</div>
        <div class="lf-meta">📍 ${item.location || 'Location not specified'} · ${timeAgo(new Date(item.created_at).getTime())}</div>
        ${item.description ? `<div class="lf-desc">${item.description}</div>` : ''}
        ${item.contact ? `<div class="lf-contact">📞 ${item.contact}</div>` : ''}`;
      c.appendChild(el);
    });
  } catch (e) {
    c.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-msg">Could not load items</div></div>`;
  }
}
