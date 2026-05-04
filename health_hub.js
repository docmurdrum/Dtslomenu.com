// ══════════════════════════════════════════════
// HEALTH_HUB.JS — Health Navigator
// Personalized · Appointments · Dental · Reminders
// All data stored locally — never shared
// ══════════════════════════════════════════════

var HEALTH_PROVIDERS = {
  primary: [
    { name:'SLO County Public Health',       address:'2191 Johnson Ave, SLO',          phone:'(805) 781-5500', insurance:'Most accepted', notes:'County health services, immunizations, STI testing' },
    { name:'Cal Poly Health Services',        address:'1 Grand Ave, SLO',               phone:'(805) 756-1211', insurance:'Student fees',  notes:'Cal Poly students only. Primary care, urgent care, pharmacy' },
    { name:'Dignity Health Medical Group',    address:'1035 Peach St, SLO',             phone:'(805) 543-5353', insurance:'Most accepted', notes:'Primary care accepting new patients' },
    { name:'Twin Cities Community Hospital',  address:'1100 Las Tablas Rd, Templeton',  phone:'(805) 434-3500', insurance:'Most accepted', notes:'Full-service hospital 30 min north' },
    { name:'French Hospital Medical Center',  address:'1911 Johnson Ave, SLO',          phone:'(805) 543-5353', insurance:'Most accepted', notes:'SLO main hospital. Emergency and specialty care' },
  ],
  urgent: [
    { name:'Concentra Urgent Care SLO',      address:'1551 Bishop St, SLO',            phone:'(805) 541-2273', insurance:'Most accepted', notes:'Walk-in urgent care. X-ray on site.' },
    { name:'Dignity Health Urgent Care',     address:'1050 Murray Ave, SLO',           phone:'(805) 543-7900', insurance:'Most accepted', notes:'Extended hours urgent care' },
    { name:'Cal Poly Health — Urgent Care',  address:'1 Grand Ave, SLO',              phone:'(805) 756-1211', insurance:'Student fees',  notes:'Cal Poly students only. Limited urgent care hours.' },
  ],
  dental: [
    { name:'Cal Poly Student Dental',        address:'1 Grand Ave, SLO',               phone:'(805) 756-1211', insurance:'Student fees',  notes:'Cal Poly students only. Basic dental care.' },
    { name:'SLO Community Health Center',    address:'1333 Higuera St, SLO',           phone:'(805) 543-4040', insurance:'Sliding scale', notes:'Low-cost dental for uninsured and underinsured' },
    { name:'Pacific Dental Services',        address:'Multiple SLO locations',         phone:'(805) 543-2273', insurance:'Most accepted', notes:'General and cosmetic dentistry' },
  ],
  mental: [
    { name:'Cal Poly Counseling Services',   address:'1 Grand Ave, SLO',               phone:'(805) 756-2511', insurance:'Student fees',  notes:'Free for Cal Poly students. Individual and group therapy.' },
    { name:'SLO County Behavioral Health',   address:'2180 Johnson Ave, SLO',          phone:'(805) 781-4700', insurance:'Medi-Cal, sliding scale', notes:'County mental health services' },
    { name:'Crisis Line — SLO',             address:'24/7 phone support',             phone:'(805) 781-4357', insurance:'Free',         notes:'24/7 crisis support line for SLO County' },
    { name:'National Suicide Hotline',       address:'Call or text',                   phone:'988',            insurance:'Free',         notes:'24/7 — call or text 988 from anywhere' },
  ],
  pharmacy: [
    { name:'Rite Aid SLO',                  address:'785 Foothill Blvd, SLO',         phone:'(805) 543-1522', insurance:'Most accepted', notes:'24-hour pharmacy' },
    { name:'CVS Pharmacy SLO',              address:'3260 S Higuera St, SLO',         phone:'(805) 541-3200', insurance:'Most accepted', notes:'Extended hours' },
    { name:'Cal Poly Pharmacy',             address:'1 Grand Ave, SLO',              phone:'(805) 756-1211', insurance:'Student fees',  notes:'Cal Poly students only. Lower prices on generics.' },
  ],
  free: [
    { name:'SLO Free Clinic',               address:'1642 Pacific St, SLO',           phone:'(805) 544-1446', insurance:'Free',         notes:'No insurance needed. Volunteer doctors. Limited hours.' },
    { name:'Planned Parenthood SLO',        address:'1491 Bishop St, SLO',            phone:'(805) 549-9446', insurance:'Sliding scale', notes:'Reproductive health, STI testing, birth control' },
    { name:'SLO Community Health Center',   address:'1333 Higuera St, SLO',           phone:'(805) 543-4040', insurance:'Sliding scale', notes:'Primary care on sliding scale fee' },
  ],
};

var HEALTH_TRIAGE = [
  { symptom:'Chest pain or pressure',     level:'ER',     color:'#ef4444', advice:'Call 911 immediately or go to French Hospital ER.' },
  { symptom:'Difficulty breathing',        level:'ER',     color:'#ef4444', advice:'Call 911 or go to the ER immediately.' },
  { symptom:'High fever (103°F+)',         level:'Urgent', color:'#f97316', advice:'Go to urgent care or call your doctor today.' },
  { symptom:'Deep cut or wound',           level:'Urgent', color:'#f97316', advice:'Urgent care can handle most cuts. ER for severe bleeding.' },
  { symptom:'Suspected broken bone',       level:'Urgent', color:'#f97316', advice:'Urgent care has X-ray. ER if severe deformity or pain.' },
  { symptom:'Cold, flu, or sore throat',   level:'PCP',    color:'#f59e0b', advice:'Schedule with your primary care doctor. Rest and fluids first.' },
  { symptom:'UTI symptoms',                level:'Urgent', color:'#f97316', advice:'Urgent care or telehealth can treat UTIs quickly.' },
  { symptom:'Mental health crisis',        level:'Crisis', color:'#8b5cf6', advice:'Call 988 or SLO Crisis Line (805) 781-4357. You are not alone.' },
  { symptom:'Prescription refill',         level:'PCP',    color:'#22c55e', advice:'Contact your doctor or use the pharmacy refill line.' },
  { symptom:'Annual physical',             level:'PCP',    color:'#22c55e', advice:'Schedule with your primary care doctor in advance.' },
  { symptom:'Dental pain',                 level:'Dental', color:'#06b6d4', advice:'Call your dentist. For severe pain, same-day appointments are usually available.' },
  { symptom:'Minor illness or rash',       level:'PCP',    color:'#22c55e', advice:'Telehealth or urgent care for quick diagnosis.' },
];

var _healthTab = 'triage'; // triage | appointments | providers | profile

// localStorage keys
var HEALTH_LS_PROFILE = 'slo_health_profile';
var HEALTH_LS_APPTS = 'slo_health_appointments';

function healthGetProfile() {
  try { return JSON.parse(localStorage.getItem(HEALTH_LS_PROFILE) || '{}'); } catch(e) { return {}; }
}
function healthSaveProfile(p) {
  try { localStorage.setItem(HEALTH_LS_PROFILE, JSON.stringify(p)); } catch(e) {}
}
function healthGetAppts() {
  try { return JSON.parse(localStorage.getItem(HEALTH_LS_APPTS) || '[]'); } catch(e) { return []; }
}
function healthSaveAppts(a) {
  try { localStorage.setItem(HEALTH_LS_APPTS, JSON.stringify(a)); } catch(e) {}
}

function openHealthHub() {
  var existing = document.getElementById('mh-health-hub');
  if (existing) existing.remove();

  if (!document.getElementById('health-hub-css')) {
    var s = document.createElement('style');
    s.id = 'health-hub-css';
    s.textContent = [
      '.hh2-tab{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.hh2-tab.active{background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.5);color:#10b981}',
      '.hh2-tab:not(.active){background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.4)}',
      '.hh2-input{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;box-sizing:border-box;font-family:Helvetica Neue,sans-serif;margin-bottom:8px}',
      '.hh2-input:focus{border-color:rgba(16,185,129,0.4)}',
      '.hh2-provider{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px}',
    ].join('');
    document.head.appendChild(s);
  }

  _healthTab = 'triage';

  var hub = document.createElement('div');
  hub.id = 'mh-health-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(16,185,129,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeHealthHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">🏥 Health Navigator</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Your SLO health guide — private and secure</div>' +
        '</div>' +
        '<button onclick="closeHealthHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="padding:8px 12px;border-radius:10px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);margin-bottom:12px;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5">🔒 Your health information is stored only on this device and is never shared with anyone.</div>' +
      '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        [
          { id:'triage',       label:'Triage',        emoji:'🩺' },
          { id:'appointments', label:'Appointments',  emoji:'📅' },
          { id:'providers',    label:'Providers',     emoji:'🏥' },
          { id:'profile',      label:'My Profile',    emoji:'👤' },
        ].map(function(t) {
          return '<button class="hh2-tab' + (_healthTab===t.id?' active':'') + '" data-htab="' + t.id + '" onclick="healthSetTab(this.dataset.htab)">' + t.emoji + ' ' + t.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="health-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      healthRenderTriage() +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('health');
}
window.openHealthHub = openHealthHub;
window.menuHomeOpenHealthHub = openHealthHub;

function closeHealthHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('health');
  var h = document.getElementById('mh-health-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeHealthHub = closeHealthHub;

function healthSetTab(tab) {
  _healthTab = tab;
  document.querySelectorAll('.hh2-tab').forEach(function(b) {
    b.classList.toggle('active', b.dataset.htab === tab);
  });
  var c = document.getElementById('health-content');
  if (!c) return;
  switch(tab) {
    case 'triage':       c.innerHTML = healthRenderTriage(); break;
    case 'appointments': c.innerHTML = healthRenderAppointments(); break;
    case 'providers':    c.innerHTML = healthRenderProviders(); break;
    case 'profile':      c.innerHTML = healthRenderProfile(); break;
  }
}
window.healthSetTab = healthSetTab;

function healthRenderTriage() {
  var html = '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">What do you need help with?</div>';
  html += HEALTH_TRIAGE.map(function(t) {
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:700">' + t.symptom + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:3px;line-height:1.4">' + t.advice + '</div>' +
      '</div>' +
      '<div style="padding:4px 10px;border-radius:20px;font-size:10px;font-weight:800;background:' + t.color + '15;border:1px solid ' + t.color + '30;color:' + t.color + ';flex-shrink:0">' + t.level + '</div>' +
    '</div>';
  }).join('');
  html += '<div style="margin-top:16px;padding:14px;border-radius:14px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2)">' +
    '<div style="font-size:12px;font-weight:800;color:#ef4444;margin-bottom:6px">🚨 Emergency</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:10px">For life-threatening emergencies call 911 or go to French Hospital ER at 1911 Johnson Ave, SLO.</div>' +
    '<a href="tel:911" style="display:block;padding:12px;border-radius:10px;background:#ef4444;color:#fff;text-align:center;font-size:14px;font-weight:900;text-decoration:none">Call 911</a>' +
  '</div>';
  return html;
}

function healthRenderAppointments() {
  var appts = healthGetAppts();
  var profile = healthGetProfile();
  var html = '';

  // Dental reminder
  if (profile.lastDental) {
    var lastDental = new Date(profile.lastDental);
    var sixMonths = new Date(lastDental);
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    var now = new Date();
    if (sixMonths <= now) {
      html += '<div style="padding:12px 14px;border-radius:14px;background:rgba(6,182,212,0.08);border:1px solid rgba(6,182,212,0.25);margin-bottom:14px">' +
        '<div style="font-size:12px;font-weight:800;color:#06b6d4;margin-bottom:3px">🦷 Dental Checkup Due</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.55)">Your last dental visit was ' + lastDental.toLocaleDateString('en-US',{month:'long',year:'numeric'}) + '. Time for your 6-month checkup.</div>' +
      '</div>';
    }
  }

  html += '<button onclick="healthShowAddAppt()" style="width:100%;padding:13px;border-radius:14px;border:1px solid rgba(16,185,129,0.35);background:rgba(16,185,129,0.08);color:#10b981;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif;margin-bottom:14px">+ Add Appointment</button>';

  html += '<div id="health-add-appt-form" style="display:none;padding:14px;border-radius:14px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);margin-bottom:14px">' +
    '<div style="font-size:13px;font-weight:800;color:#10b981;margin-bottom:10px">New Appointment</div>' +
    '<input class="hh2-input" id="happt-title" placeholder="Doctor / Dentist / Specialist name">' +
    '<input class="hh2-input" id="happt-type" placeholder="Type (e.g. Dental Cleaning, Annual Physical)">' +
    '<input class="hh2-input" id="happt-date" type="date">' +
    '<input class="hh2-input" id="happt-time" type="time">' +
    '<input class="hh2-input" id="happt-notes" placeholder="Notes (insurance card, what to ask, etc.)">' +
    '<button onclick="healthSaveAppt()" style="width:100%;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif">Save Appointment</button>' +
  '</div>';

  if (appts.length) {
    var upcoming = appts.filter(function(a) { return new Date(a.date) >= new Date(); }).sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    var past = appts.filter(function(a) { return new Date(a.date) < new Date(); }).sort(function(a,b){return new Date(b.date)-new Date(a.date);});

    if (upcoming.length) {
      html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Upcoming</div>';
      html += upcoming.map(function(a) { return healthApptCard(a, true); }).join('');
    }
    if (past.length) {
      html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:12px">Past</div>';
      html += past.slice(0,5).map(function(a) { return healthApptCard(a, false); }).join('');
    }
  } else {
    html += '<div style="text-align:center;padding:32px;color:rgba(255,255,255,0.3);font-size:12px">No appointments yet. Add your first one above.</div>';
  }
  return html;
}

function healthApptCard(a, upcoming) {
  var d = new Date(a.date);
  var dateStr = d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  var timeStr = a.time ? new Date('2000-01-01T'+a.time).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : '';
  return '<div style="padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid ' + (upcoming?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.07)') + ';margin-bottom:8px">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">' +
      '<div style="font-size:13px;font-weight:800">' + (a.title||'Appointment') + '</div>' +
      '<button data-aid="' + a.id + '" onclick="healthDeleteAppt(this.dataset.aid)" style="background:none;border:none;color:rgba(255,255,255,0.2);font-size:16px;cursor:pointer;padding:0;line-height:1">×</button>' +
    '</div>' +
    (a.type ? '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:4px">' + a.type + '</div>' : '') +
    '<div style="font-size:12px;color:' + (upcoming?'#10b981':'rgba(255,255,255,0.35)') + ';font-weight:700">' + dateStr + (timeStr?' · '+timeStr:'') + '</div>' +
    (a.notes ? '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:5px;line-height:1.4">' + a.notes + '</div>' : '') +
  '</div>';
}

function healthRenderProviders() {
  var sections = [
    { key:'urgent',  label:'Urgent Care',        emoji:'🚑' },
    { key:'primary', label:'Primary Care',        emoji:'🩺' },
    { key:'dental',  label:'Dental',              emoji:'🦷' },
    { key:'mental',  label:'Mental Health',       emoji:'🧠' },
    { key:'pharmacy',label:'Pharmacy',            emoji:'💊' },
    { key:'free',    label:'Free & Low Cost',     emoji:'❤️' },
  ];
  return sections.map(function(sec) {
    var providers = HEALTH_PROVIDERS[sec.key] || [];
    return '<div style="margin-bottom:16px">' +
      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">' + sec.emoji + ' ' + sec.label + '</div>' +
      providers.map(function(p) {
        return '<div class="hh2-provider">' +
          '<div style="font-size:13px;font-weight:800;margin-bottom:3px">' + p.name + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:5px">' + p.address + '</div>' +
          (p.notes ? '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:6px;line-height:1.4">' + p.notes + '</div>' : '') +
          '<div style="display:flex;gap:8px">' +
            '<a href="tel:' + p.phone + '" style="flex:1;padding:8px;border-radius:8px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);color:#10b981;text-align:center;font-size:12px;font-weight:800;text-decoration:none">' + p.phone + '</a>' +
            '<span style="padding:8px 10px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);font-size:10px;color:rgba(255,255,255,0.35)">' + (p.insurance||'') + '</span>' +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }).join('');
}

function healthRenderProfile() {
  var p = healthGetProfile();
  return '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Your Health Profile</div>' +
    '<div style="padding:12px 14px;border-radius:14px;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.15);margin-bottom:14px;font-size:11px;color:rgba(255,255,255,0.4);line-height:1.6">🔒 This information is stored only on your device. It is never uploaded, shared, or accessible to anyone else.</div>' +
    '<select class="hh2-input" id="hprofile-insurance" onchange="healthProfileChange()">' +
      '<option value="">Insurance type...</option>' +
      ['Employer/private insurance','Medi-Cal (Medicaid)','Medicare','Cal Poly Student Health','No insurance','Other'].map(function(o) {
        return '<option value="' + o + '"' + (p.insurance===o?' selected':'') + '>' + o + '</option>';
      }).join('') +
    '</select>' +
    '<input class="hh2-input" id="hprofile-doctor" value="' + (p.doctor||'') + '" placeholder="Primary care doctor name" onchange="healthProfileChange()">' +
    '<input class="hh2-input" id="hprofile-dentist" value="' + (p.dentist||'') + '" placeholder="Dentist name" onchange="healthProfileChange()">' +
    '<input class="hh2-input" id="hprofile-lastphysical" type="date" value="' + (p.lastPhysical||'') + '" onchange="healthProfileChange()">' +
    '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:-4px;margin-bottom:8px">Date of last annual physical</div>' +
    '<input class="hh2-input" id="hprofile-lastdental" type="date" value="' + (p.lastDental||'') + '" onchange="healthProfileChange()">' +
    '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:-4px;margin-bottom:8px">Date of last dental cleaning</div>' +
    '<textarea class="hh2-input" id="hprofile-allergies" rows="2" placeholder="Allergies or medications (optional)" onchange="healthProfileChange()" style="resize:none">' + (p.allergies||'') + '</textarea>' +
    '<div style="margin-top:12px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06)">' +
      '<div style="font-size:12px;font-weight:700;margin-bottom:8px">🔔 Reminders</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6">Based on your profile, the app will remind you when your annual physical or dental cleaning is due. Reminders appear when you open the Health hub.</div>' +
    '</div>';
}

function healthProfileChange() {
  var p = {
    insurance: (document.getElementById('hprofile-insurance')||{}).value || '',
    doctor:    (document.getElementById('hprofile-doctor')||{}).value || '',
    dentist:   (document.getElementById('hprofile-dentist')||{}).value || '',
    lastPhysical: (document.getElementById('hprofile-lastphysical')||{}).value || '',
    lastDental:   (document.getElementById('hprofile-lastdental')||{}).value || '',
    allergies: (document.getElementById('hprofile-allergies')||{}).value || '',
  };
  healthSaveProfile(p);
}
window.healthProfileChange = healthProfileChange;

function healthShowAddAppt() {
  var form = document.getElementById('health-add-appt-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}
window.healthShowAddAppt = healthShowAddAppt;

function healthSaveAppt() {
  var title = (document.getElementById('happt-title')||{}).value || '';
  var type  = (document.getElementById('happt-type')||{}).value || '';
  var date  = (document.getElementById('happt-date')||{}).value || '';
  var time  = (document.getElementById('happt-time')||{}).value || '';
  var notes = (document.getElementById('happt-notes')||{}).value || '';
  if (!title || !date) { if (typeof showToast==='function') showToast('Name and date are required'); return; }
  var appts = healthGetAppts();
  appts.push({ id:Date.now(), title:title, type:type, date:date, time:time, notes:notes });
  healthSaveAppts(appts);
  if (typeof showToast==='function') showToast('Appointment saved ✅');
  var c = document.getElementById('health-content');
  if (c) c.innerHTML = healthRenderAppointments();
}
window.healthSaveAppt = healthSaveAppt;

function healthDeleteAppt(id) {
  var appts = healthGetAppts().filter(function(a) { return String(a.id) !== String(id); });
  healthSaveAppts(appts);
  var c = document.getElementById('health-content');
  if (c) c.innerHTML = healthRenderAppointments();
}
window.healthDeleteAppt = healthDeleteAppt;
