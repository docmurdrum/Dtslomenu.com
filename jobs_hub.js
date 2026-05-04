// ══════════════════════════════════════════════
// JOBS_HUB.JS — Jobs & Gigs
// Curated links + in-app listings
// ══════════════════════════════════════════════

var JOBS_LINKS = [
  { name:'Indeed SLO',               url:'https://www.indeed.com/l-San-Luis-Obispo,-CA-jobs.html', emoji:'💼', desc:'Largest job board. Filter by part-time, full-time, remote, and salary.' },
  { name:'Handshake — Cal Poly',     url:'https://app.joinhandshake.com',                           emoji:'🎓', desc:'Cal Poly students and alumni only. Top employers actively recruit here.' },
  { name:'LinkedIn Jobs SLO',        url:'https://www.linkedin.com/jobs/san-luis-obispo-jobs',       emoji:'🔗', desc:'Professional roles and networking. Great for tech and business positions.' },
  { name:'Cal Poly Career Services', url:'https://careerservices.calpoly.edu',                       emoji:'🏛', desc:'Resume help, mock interviews, and career fairs. Free for Cal Poly students.' },
  { name:'SLO City Jobs',            url:'https://www.slocity.org/government/human-resources/job-opportunities', emoji:'🏙', desc:'City of San Luis Obispo municipal job postings.' },
  { name:'Craigslist SLO Gigs',      url:'https://slo.craigslist.org/search/ggg',                   emoji:'⚡', desc:'Local gig work — moving, cleaning, odd jobs, events, and more.' },
];

var JOBS_CATS = [
  { id:'all',          label:'All' },
  { id:'full_time',    label:'Full-Time' },
  { id:'part_time',    label:'Part-Time' },
  { id:'gig',          label:'Gig / Contract' },
  { id:'internship',   label:'Internship' },
  { id:'remote',       label:'Remote' },
];

var JOBS_HIRING_GUIDE = [
  { season:'Jan–Mar',  note:'Slow hiring season. Best time to apply — less competition.' },
  { season:'Apr–Jun',  note:'Cal Poly spring push. Internships and summer roles fill fast.' },
  { season:'Jul–Aug',  note:'Tourism peak. Hospitality, food service, and events hiring surges.' },
  { season:'Sep–Oct',  note:'Fall rush. Cal Poly arrival drives retail, food, and service hiring.' },
  { season:'Nov–Dec',  note:'Holiday retail and events. Quick seasonal work widely available.' },
];

var _jobsCat = 'all';
var _jobsListings = [];
var _jobsShowPost = false;

async function jobsLoadListings(cat) {
  try {
    var sb = window.supabaseClient;
    if (!sb) return [];
    var q = sb.from('listings')
      .select('*')
      .eq('hub_type', 'jobs')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(30);
    if (cat && cat !== 'all') q = q.eq('category', cat);
    var res = await q;
    return res.data || [];
  } catch(e) { return []; }
}

function openJobsHub() {
  var existing = document.getElementById('mh-jobs-hub');
  if (existing) existing.remove();

  if (!document.getElementById('jobs-hub-css')) {
    var s = document.createElement('style');
    s.id = 'jobs-hub-css';
    s.textContent = [
      '.jh-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(6,182,212,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.jh-filter.active{background:rgba(6,182,212,0.12);border-color:#06b6d4;color:#06b6d4}',
      '.jh-card{padding:13px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;-webkit-tap-highlight-color:transparent}',
      '.jh-link{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;display:flex;align-items:center;gap:12px;text-decoration:none;-webkit-tap-highlight-color:transparent}',
      '.jh-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;font-family:Helvetica Neue,sans-serif}',
      '.jh-input:focus{border-color:rgba(6,182,212,0.4)}',
    ].join('');
    document.head.appendChild(s);
  }

  _jobsCat = 'all';
  _jobsShowPost = false;

  var hub = document.createElement('div');
  hub.id = 'mh-jobs-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(6,182,212,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeJobsHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">💼 Jobs & Gigs</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">SLO jobs · internships · gig work</div>' +
        '</div>' +
        '<button onclick="closeJobsHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        JOBS_CATS.map(function(c, i) {
          return '<button class="jh-filter' + (i===0?' active':'') + '" data-jcat="' + c.id + '" onclick="jobsSetCat(this,this.dataset.jcat)">' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="jobs-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      jobsRenderLoading() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('jobs');

  jobsLoadListings('all').then(function(data) {
    _jobsListings = data;
    var c = document.getElementById('jobs-content');
    if (c) c.innerHTML = jobsRenderContent(data);
  });
}
window.openJobsHub = openJobsHub;
window.menuHomeOpenJobsHub = openJobsHub;

function closeJobsHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('jobs');
  var h = document.getElementById('mh-jobs-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeJobsHub = closeJobsHub;
window.menuHomeCloseJobsHub = closeJobsHub;

function jobsSetCat(el, cat) {
  _jobsCat = cat;
  document.querySelectorAll('.jh-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('jobs-content');
  if (c) c.innerHTML = jobsRenderLoading();
  jobsLoadListings(cat).then(function(data) {
    _jobsListings = data;
    if (c) c.innerHTML = jobsRenderContent(data);
  });
}
window.jobsSetCat = jobsSetCat;

function jobsRenderLoading() {
  return '<div style="display:flex;flex-direction:column;gap:8px">' +
    [1,2,3].map(function() { return '<div style="height:80px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)"></div>'; }).join('') +
  '</div>';
}

function jobsRenderContent(listings) {
  var html = '';

  html += '<button onclick="jobsTogglePost()" style="width:100%;padding:13px;border-radius:14px;border:1px solid rgba(6,182,212,0.35);background:rgba(6,182,212,0.08);color:#06b6d4;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif;margin-bottom:16px">+ Post a Job or Gig</button>';

  if (_jobsShowPost) html += jobsRenderPostForm();

  if (listings.length) {
    html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">📋 Community Listings</div>';
    html += listings.map(function(l) {
      var catColor = l.category==='gig'?'#f59e0b':l.category==='internship'?'#a5b4fc':'#06b6d4';
      return '<div class="jh-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">' +
          '<div style="font-size:14px;font-weight:800;flex:1;margin-right:8px">' + (l.title||'') + '</div>' +
          (l.price ? '<div style="font-size:13px;font-weight:900;color:#22c55e;flex-shrink:0">' + l.price + '</div>' : '') +
        '</div>' +
        (l.description ? '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;margin-bottom:8px">' + l.description.substring(0,120) + (l.description.length>120?'…':'') + '</div>' : '') +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
          (l.category ? '<span style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:' + catColor + '15;border:1px solid ' + catColor + '30;color:' + catColor + '">' + l.category.replace('_',' ') + '</span>' : '') +
          (l.area ? '<span style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5)">📍 ' + l.area + '</span>' : '') +
          (l.contact ? '<a href="' + (l.contact.indexOf('@')>-1?'mailto:':'tel:') + l.contact + '" style="padding:2px 8px;border-radius:20px;font-size:9px;font-weight:800;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.2);color:#06b6d4;text-decoration:none">Apply</a>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    html += '<div style="text-align:center;padding:24px;color:rgba(255,255,255,0.3);font-size:12px;margin-bottom:16px">No listings yet — post the first job or gig.</div>';
  }

  // Hiring guide
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:8px">📅 SLO Hiring Calendar</div>';
  html += JOBS_HIRING_GUIDE.map(function(g) {
    return '<div style="display:flex;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px">' +
      '<div style="font-size:12px;font-weight:800;color:#06b6d4;flex-shrink:0;min-width:60px">' + g.season + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5">' + g.note + '</div>' +
    '</div>';
  }).join('') + '<br>';

  // Links
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🔗 Search Online</div>';
  html += JOBS_LINKS.map(function(l) {
    return '<a href="' + l.url + '" target="_blank" class="jh-link">' +
      '<div style="font-size:26px;flex-shrink:0">' + l.emoji + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:800;color:#fff">' + l.name + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;line-height:1.4">' + l.desc + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(6,182,212,0.7);font-weight:700;flex-shrink:0">↗</div>' +
    '</a>';
  }).join('');

  return html;
}

function jobsRenderPostForm() {
  return '<div style="padding:14px;border-radius:14px;background:rgba(6,182,212,0.06);border:1px solid rgba(6,182,212,0.2);margin-bottom:16px">' +
    '<div style="font-size:13px;font-weight:800;color:#06b6d4;margin-bottom:12px">Post a Job or Gig</div>' +
    '<input class="jh-input" id="jh-post-title" placeholder="Title (e.g. Barista — part time, downtown SLO)" style="margin-bottom:8px"><br>' +
    '<input class="jh-input" id="jh-post-price" placeholder="Pay (e.g. $18/hr, $500 flat, Negotiable)" style="margin-bottom:8px"><br>' +
    '<select class="jh-input" id="jh-post-cat" style="margin-bottom:8px">' +
      '<option value="">Type of work...</option>' +
      JOBS_CATS.filter(function(c){return c.id!=='all';}).map(function(c){return '<option value="'+c.id+'">'+c.label+'</option>';}).join('') +
    '</select><br>' +
    '<input class="jh-input" id="jh-post-area" placeholder="Location / area in SLO" style="margin-bottom:8px"><br>' +
    '<textarea class="jh-input" id="jh-post-desc" rows="3" placeholder="Description — duties, hours, requirements..." style="margin-bottom:8px;resize:none"></textarea>' +
    '<input class="jh-input" id="jh-post-contact" placeholder="Contact (phone, email, or website)" style="margin-bottom:12px"><br>' +
    '<button onclick="jobsSubmitPost()" style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#06b6d4,#0284c7);color:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif">Post Listing</button>' +
  '</div>';
}

function jobsTogglePost() {
  _jobsShowPost = !_jobsShowPost;
  var c = document.getElementById('jobs-content');
  if (c) c.innerHTML = jobsRenderContent(_jobsListings);
  if (_jobsShowPost) { var c2 = document.getElementById('jobs-content'); if (c2) c2.scrollTop = 0; }
}
window.jobsTogglePost = jobsTogglePost;

async function jobsSubmitPost() {
  var title   = (document.getElementById('jh-post-title')||{}).value || '';
  var price   = (document.getElementById('jh-post-price')||{}).value || '';
  var cat     = (document.getElementById('jh-post-cat')||{}).value || '';
  var area    = (document.getElementById('jh-post-area')||{}).value || '';
  var desc    = (document.getElementById('jh-post-desc')||{}).value || '';
  var contact = (document.getElementById('jh-post-contact')||{}).value || '';
  if (!title || !contact) { if (typeof showToast==='function') showToast('Title and contact are required'); return; }
  try {
    var sb = window.supabaseClient;
    if (!sb) throw new Error('No connection');
    var userId = (typeof getEffectiveUserId==='function') ? getEffectiveUserId() : 'guest';
    await sb.from('listings').insert({ user_id:userId, hub_type:'jobs', title:title, price:price, area:area, category:cat, description:desc, contact:contact });
    if (typeof showToast==='function') showToast('Job posted ✅');
    _jobsShowPost = false;
    var data = await jobsLoadListings(_jobsCat);
    _jobsListings = data;
    var c = document.getElementById('jobs-content');
    if (c) c.innerHTML = jobsRenderContent(data);
  } catch(e) { if (typeof showToast==='function') showToast('Post failed — try again'); }
}
window.jobsSubmitPost = jobsSubmitPost;
