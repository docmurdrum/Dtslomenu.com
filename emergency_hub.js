// ══════════════════════════════════════════════
// EMERGENCY_HUB.JS — Emergency & Safety
// One-tap contacts · Safe Night · Triage
// ══════════════════════════════════════════════

var EMERGENCY_CONTACTS = [
  { name:'Emergency',                  number:'911',           emoji:'🚨', color:'#ef4444', desc:'Police, Fire, Medical emergency' },
  { name:'SLO PD Non-Emergency',       number:'(805) 781-7317',emoji:'👮', color:'#6366f1', desc:'Non-urgent police matters' },
  { name:'SLO Fire Non-Emergency',     number:'(805) 781-7380',emoji:'🚒', color:'#f97316', desc:'Non-urgent fire department' },
  { name:'Crisis Line SLO',            number:'(805) 781-4357',emoji:'🧠', color:'#8b5cf6', desc:'24/7 mental health crisis support' },
  { name:'Suicide & Crisis Lifeline',  number:'988',           emoji:'💙', color:'#3b82f6', desc:'Call or text 988 — 24/7 nationwide' },
  { name:'Poison Control',             number:'(800) 222-1222',emoji:'☠️', color:'#f59e0b', desc:'24/7 poison emergency line' },
  { name:'French Hospital ER',         number:'(805) 543-5353',emoji:'🏥', color:'#22c55e', desc:'1911 Johnson Ave — SLO main hospital' },
  { name:'SLO County Sheriff',         number:'(805) 781-4550',emoji:'⭐', color:'#6366f1', desc:'Unincorporated county areas' },
  { name:'National DV Hotline',        number:'(800) 799-7233',emoji:'❤️', color:'#ec4899', desc:'Domestic violence support 24/7' },
  { name:'RAINN Sexual Assault',       number:'(800) 656-4673',emoji:'💜', color:'#8b5cf6', desc:'Sexual assault support hotline 24/7' },
];

var EMERGENCY_SAFE_SPOTS = [
  { name:'SLO Police Station',         address:'1042 Walnut St, SLO',          note:'Safest meetup and emergency stop in the city' },
  { name:'French Hospital ER',         address:'1911 Johnson Ave, SLO',        note:'24/7 emergency care — main SLO hospital' },
  { name:'SLO Fire Station 1',         address:'2160 Santa Barbara Ave, SLO',  note:'Always staffed — can assist in emergencies' },
  { name:'Cal Poly Campus Police',     address:'1 Grand Ave, SLO',             note:'On-campus safety — available 24/7' },
  { name:'Downtown SLO (Higuera St)',  address:'Higuera St at Garden St',      note:'Well-lit, busy, cameras. Safest public area at night.' },
];

var EMERGENCY_SAFETY_TIPS = [
  'Tell someone where you are going and when to expect you back before any outdoor activity.',
  'SLO is generally very safe but stay aware at night downtown. Stick to well-lit streets.',
  'If you feel unsafe on campus, call Cal Poly Campus Police at (805) 756-2281 for a safety escort.',
  'The safest Uber meetup spot downtown is on Monterey Street near the Granada Hotel — well lit and monitored.',
  'If involved in an auto accident, move to safety first, then call 911 if anyone is injured.',
  'SLO County has mountain lion activity in open spaces. Make noise on trails and never hike alone at dusk.',
  'Rip currents are the main ocean hazard. If caught, swim parallel to shore — never fight the current.',
  'Wildfire risk is high in summer. Know your evacuation route and sign up for SLO County emergency alerts at readyslo.org.',
];

function openEmergencyHub() {
  var existing = document.getElementById('mh-emergency-hub');
  if (existing) existing.remove();

  if (!document.getElementById('emergency-hub-css')) {
    var s = document.createElement('style');
    s.id = 'emergency-hub-css';
    s.textContent = [
      '.em-contact{padding:12px 14px;border-radius:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;-webkit-tap-highlight-color:transparent}',
      '.em-contact:active{transform:scale(0.98)}',
    ].join('');
    document.head.appendChild(s);
  }

  var hub = document.createElement('div');
  hub.id = 'mh-emergency-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(239,68,68,0.08) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="closeEmergencyHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:800;font-family:Georgia,serif">🚨 Emergency & Safety</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">One-tap contacts · SLO safety · Crisis support</div>' +
        '</div>' +
        '<button onclick="closeEmergencyHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:12px 20px 80px">' + emergencyRenderContent() + '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('emergency');
}
window.openEmergencyHub = openEmergencyHub;
window.menuHomeOpenEmergencyHub = openEmergencyHub;

function closeEmergencyHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('emergency');
  var h = document.getElementById('mh-emergency-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeEmergencyHub = closeEmergencyHub;

function emergencyRenderContent() {
  var html = '';

  // Big 911 button
  html += '<a href="tel:911" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;border-radius:16px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;text-decoration:none;margin-bottom:16px;font-size:18px;font-weight:900;font-family:Helvetica Neue,sans-serif">🚨 Call 911</a>';

  // All contacts
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Emergency Contacts</div>';
  html += EMERGENCY_CONTACTS.map(function(c) {
    return '<a href="tel:' + c.number + '" class="em-contact" style="background:' + c.color + '10;border:1px solid ' + c.color + '25;text-decoration:none">' +
      '<div style="font-size:26px;flex-shrink:0">' + c.emoji + '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:800;color:#fff">' + c.name + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:1px">' + c.desc + '</div>' +
      '</div>' +
      '<div style="font-size:13px;font-weight:800;color:' + c.color + ';flex-shrink:0">' + c.number + '</div>' +
    '</a>';
  }).join('');

  // Safe spots
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:16px">📍 Safe Locations in SLO</div>';
  html += EMERGENCY_SAFE_SPOTS.map(function(s) {
    return '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(s.address) + '" target="_blank" style="display:flex;gap:10px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px;text-decoration:none">' +
      '<div style="flex:1">' +
        '<div style="font-size:13px;font-weight:800;color:#fff">' + s.name + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">' + s.address + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:3px">' + s.note + '</div>' +
      '</div>' +
      '<div style="font-size:12px;color:rgba(34,197,94,0.7);font-weight:700;flex-shrink:0;align-self:center">Directions ↗</div>' +
    '</a>';
  }).join('');

  // Safety tips
  html += '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;margin-top:16px">💡 SLO Safety Tips</div>';
  html += EMERGENCY_SAFETY_TIPS.map(function(tip) {
    return '<div style="display:flex;gap:8px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
      '<span style="color:#f59e0b;flex-shrink:0;margin-top:1px">→</span>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.5">' + tip + '</div>' +
    '</div>';
  }).join('');

  // Emergency alerts signup
  html += '<div style="margin-top:16px;padding:14px;border-radius:14px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2)">' +
    '<div style="font-size:13px;font-weight:800;color:#ef4444;margin-bottom:6px">🔔 SLO County Emergency Alerts</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:10px;line-height:1.5">Sign up for free emergency alerts covering wildfires, floods, and other county emergencies.</div>' +
    '<a href="https://www.readyslo.org" target="_blank" style="display:block;padding:12px;border-radius:10px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;text-align:center;font-size:13px;font-weight:800;text-decoration:none">Sign Up at readyslo.org ↗</a>' +
  '</div>';

  return html;
}
