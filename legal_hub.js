// ══════════════════════════════════════════════
// LEGAL_HUB.JS — Know Your Rights
// 20 presets · Justia search · Federal → CA → SLO
// ══════════════════════════════════════════════

var LEGAL_PRESETS = [
  {
    id:'pullover', label:'Being Pulled Over', emoji:'🚗',
    summary:'During a traffic stop you must provide your license, registration, and proof of insurance. Beyond that you have the right to remain silent and police generally cannot search your vehicle without consent, a warrant, or probable cause.',
    rights:[
      'You must provide your license, registration, and proof of insurance',
      'You have the right to remain silent beyond identifying documents — say "I am invoking my right to remain silent"',
      'You can refuse a vehicle search — say "I do not consent to a search"',
      'You have the right to record the interaction from a safe location',
      'If arrested, clearly invoke your right to an attorney before any questioning',
    ],
    sayThis:[
      { situation:'When asked questions beyond ID', say:'"I am invoking my right to remain silent."' },
      { situation:'When asked to search your car', say:'"I do not consent to a search."' },
      { situation:'If being detained', say:'"Am I being detained or am I free to go?"' },
    ],
    laws:['4th Amendment — protects against unreasonable searches','5th Amendment — right to remain silent','Rodriguez v. United States (2015) — stop cannot be extended beyond traffic purpose','Cal. Penal Code 1538.5 — unlawfully obtained evidence can be suppressed'],
  },
  {
    id:'carsearch', label:'Car Search', emoji:'🔍',
    summary:'Police cannot search your car without your consent, a valid warrant, or probable cause. Clearly refusing consent protects your rights even if police search anyway — it preserves your ability to challenge the search in court.',
    rights:[
      'You have the right to refuse a vehicle search',
      'Refusing consent is not probable cause for a search',
      'If police search anyway, do not physically resist — challenge it in court',
      'Any evidence found in an illegal search may be suppressed',
      'A drug dog sniff alone is not automatic probable cause in California',
    ],
    sayThis:[
      { situation:'When asked to search', say:'"I do not consent to a search of my vehicle."' },
      { situation:'If they search anyway', say:'"I do not consent. I am not resisting."' },
    ],
    laws:['4th Amendment — probable cause required for warrantless search','Arizona v. Gant (2009) — limits searches incident to arrest','Cal. Penal Code 1538.5 — motion to suppress illegally obtained evidence'],
  },
  {
    id:'idrequest', label:'Asked for ID', emoji:'🪪',
    summary:'California is not a stop-and-identify state. You are only required to identify yourself if you are driving or have been lawfully arrested. If you are simply walking and not under arrest, you can ask if you are free to go.',
    rights:[
      'You are NOT required to show ID if you are just walking and not under arrest',
      'If driving, you must show your license',
      'If arrested, you must identify yourself',
      'You can ask "Am I being detained or am I free to go?"',
      'If free to go, you may leave calmly',
    ],
    sayThis:[
      { situation:'When asked for ID while walking', say:'"Am I being detained or am I free to go?"' },
      { situation:'If not detained', say:'"I would like to leave. Am I free to go?"' },
    ],
    laws:['Hiibel v. Nevada (2004) — stop-and-identify in states with laws','California has no stop-and-identify statute','4th Amendment — detention requires reasonable articulable suspicion'],
  },
  {
    id:'homesearch', label:'Officer at My Door', emoji:'🏠',
    summary:'Police cannot enter your home without a warrant, your consent, or exigent circumstances. You do not have to open the door. You can speak through the door and ask to see a warrant.',
    rights:[
      'You do not have to open your door for police',
      'Police need a warrant, your consent, or an emergency to enter',
      'You can ask to see the warrant through the door or a window',
      'If they have a warrant, do not physically resist — comply and challenge later',
      'Anything you say at the door can be used against you',
    ],
    sayThis:[
      { situation:'When police knock', say:'"Do you have a warrant?"' },
      { situation:'If no warrant', say:'"I do not consent to entry. Please slide any paperwork under the door."' },
      { situation:'If they have a warrant', say:'"I do not consent but I will not resist."' },
    ],
    laws:['4th Amendment — home has strongest privacy protection','Payton v. New York (1980) — warrant required to enter home for arrest','Exigent circumstances exception — hot pursuit, emergency, evidence destruction'],
  },
  {
    id:'arrest', label:'Being Arrested', emoji:'⛓',
    summary:'If you are being arrested, do not physically resist even if you believe the arrest is unlawful. Clearly invoke your right to remain silent and your right to an attorney. Do not answer questions until your attorney is present.',
    rights:[
      'Do not physically resist even if the arrest is unlawful — challenge it in court',
      'You have the right to remain silent — invoke it clearly',
      'You have the right to an attorney — if you cannot afford one, one will be appointed',
      'Police must read your Miranda rights before custodial interrogation',
      'You can be held up to 48 hours before being charged or released',
    ],
    sayThis:[
      { situation:'When being arrested', say:'"I am invoking my right to remain silent. I want an attorney."' },
      { situation:'During any questioning', say:'"I will not answer questions without my attorney present."' },
    ],
    laws:['Miranda v. Arizona (1966) — rights must be read before custodial interrogation','5th Amendment — right against self-incrimination','6th Amendment — right to counsel','Cal. Penal Code 849 — 48 hour hold limit'],
  },
  {
    id:'walking', label:'Stopped While Walking', emoji:'🚶',
    summary:'Police can briefly detain you if they have reasonable suspicion of criminal activity. This is a lower bar than probable cause. During a stop, ask clearly if you are being detained. If not, you are free to leave.',
    rights:[
      'Police need reasonable suspicion to detain you — not just a hunch',
      'Ask clearly: "Am I being detained or am I free to go?"',
      'If detained, you can remain silent beyond providing your name if arrested',
      'A pat-down requires reasonable suspicion you are armed',
      'You can refuse a pat-down verbally though police may proceed anyway',
    ],
    sayThis:[
      { situation:'When approached', say:'"Am I being detained or am I free to go?"' },
      { situation:'If detained', say:'"I am invoking my right to remain silent."' },
      { situation:'If asked to be pat down', say:'"I do not consent to a search."' },
    ],
    laws:['Terry v. Ohio (1968) — reasonable suspicion allows brief stop and frisk','Illinois v. Wardlow (2000) — flight from police can contribute to suspicion','4th Amendment — unreasonable seizure of persons'],
  },
  {
    id:'record', label:'Recording Police', emoji:'📱',
    summary:'In California it is fully legal to record police officers performing their duties in public. Officers cannot order you to stop recording. Stay at a safe distance and do not interfere with their duties.',
    rights:[
      'Recording police in public is fully legal in California',
      'Officers cannot order you to stop recording',
      'Stay at a safe, non-interfering distance',
      'Do not touch or threaten officers while recording',
      'If ordered to move, comply while continuing to record',
    ],
    sayThis:[
      { situation:'If told to stop recording', say:'"I have the right to record in public. I am not interfering."' },
      { situation:'If ordered to move back', say:'"I will move back. I am continuing to record."' },
    ],
    laws:['First Amendment — right to record government officials in public','Fordyce v. City of Seattle (9th Cir. 1995) — right to film police','Cal. Penal Code 69 — cannot obstruct officer but recording is not obstruction'],
  },
  {
    id:'minor', label:'Minor Being Questioned', emoji:'👤',
    summary:'Minors have the same constitutional rights as adults during police encounters. In California, police must make reasonable efforts to notify parents before questioning a minor in custody. Minors can invoke their right to remain silent and to have a parent present.',
    rights:[
      'Minors have the same right to remain silent as adults',
      'You can ask for a parent to be present before answering questions',
      'Police must attempt to notify parents if a minor is taken into custody',
      'Miranda rights apply to minors in custodial interrogation',
      'Do not answer questions without a parent or attorney present',
    ],
    sayThis:[
      { situation:'When questioned', say:'"I want my parent here before I answer any questions."' },
      { situation:'If in custody', say:'"I am invoking my right to remain silent. I want my parent and an attorney."' },
    ],
    laws:['In re Gault (1967) — minors have constitutional rights in proceedings','Cal. Welf. & Inst. Code 625.6 — parent notification in juvenile custody','Miranda v. Arizona — applies to minors as well as adults'],
  },
  {
    id:'protest', label:'Right to Protest', emoji:'✊',
    summary:'You have a constitutional right to protest in public spaces. Police can impose reasonable time, place, and manner restrictions but cannot shut down a protest based on its message. You do not need a permit for a spontaneous protest.',
    rights:[
      'You have the right to protest in public spaces — sidewalks, parks, plazas',
      'You do not need a permit for a spontaneous protest',
      'Police cannot disperse a protest based on its content or message',
      'Officers can impose reasonable time, place, and manner restrictions',
      'If ordered to disperse, ask clearly if it is a lawful order',
    ],
    sayThis:[
      { situation:'If ordered to disperse', say:'"Is this a lawful order to disperse? What is the reason?"' },
      { situation:'If arrested at protest', say:'"I am invoking my right to remain silent. I want an attorney."' },
    ],
    laws:['First Amendment — freedom of speech and assembly','Cal. Penal Code 407 — unlawful assembly requires threat to public peace','Madsen v. Womens Health Center (1994) — time, place, manner restrictions'],
  },
  {
    id:'immigration', label:'Immigration Stop', emoji:'🌐',
    summary:'Everyone in the United States has constitutional rights regardless of immigration status. You have the right to remain silent, the right to refuse consent to searches, and the right to speak with an attorney.',
    rights:[
      'You have the right to remain silent regardless of immigration status',
      'You do not have to answer questions about your immigration status',
      'You can refuse consent to search your home without a warrant',
      'You have the right to speak with a lawyer',
      'Do not use false documents — this is a separate criminal offense',
    ],
    sayThis:[
      { situation:'When asked about status', say:'"I am exercising my right to remain silent."' },
      { situation:'If ICE comes to your door', say:'"Do you have a judicial warrant signed by a judge?"' },
    ],
    laws:['4th Amendment — applies to all persons regardless of status','5th Amendment — right to remain silent applies to all persons','Zadvydas v. Davis (2001) — due process applies to non-citizens'],
  },
  {
    id:'dui', label:'DUI Stop', emoji:'🍺',
    summary:'At a DUI checkpoint or traffic stop you must provide your license and registration. You can refuse field sobriety tests — they are voluntary in California. However, refusing a breathalyzer after arrest carries automatic license suspension.',
    rights:[
      'Field sobriety tests are voluntary — you can politely refuse',
      'You must submit to a chemical test AFTER arrest or face license suspension',
      'You can choose blood or breath test after arrest',
      'You have the right to remain silent beyond providing documents',
      'DUI checkpoints must be publicly advertised in advance in California',
    ],
    sayThis:[
      { situation:'When asked to do field sobriety test', say:'"I respectfully decline the field sobriety test."' },
      { situation:'If arrested', say:'"I am invoking my right to remain silent. I want an attorney."' },
    ],
    laws:['Cal. Vehicle Code 23612 — implied consent for chemical test after arrest','Cal. Vehicle Code 23152 — DUI statute','Schmerber v. California (1966) — blood test after arrest is constitutional'],
  },
  {
    id:'tenant', label:'Tenant Rights', emoji:'🏘',
    summary:'SLO tenants have strong protections under California law. Landlords must give 24 hours notice before entering your unit. You have the right to habitable conditions and protection against retaliation for reporting issues.',
    rights:[
      'Landlord must give 24 hours written notice before entering your unit',
      'You have the right to a habitable unit — working heat, plumbing, no mold',
      'Landlord cannot retaliate against you for reporting habitability issues',
      'In SLO, just cause is required to evict in many situations',
      'Security deposit must be returned within 21 days with itemized deductions',
    ],
    sayThis:[
      { situation:'If landlord enters without notice', say:'"You are required to give 24 hours notice under Cal. Civil Code 1954."' },
      { situation:'If facing eviction', say:'"I want to review the just cause for this eviction in writing."' },
    ],
    laws:['Cal. Civil Code 1954 — 24 hour notice required for landlord entry','Cal. Civil Code 1941 — implied warranty of habitability','SLO Municipal Code — just cause eviction protections'],
  },
  {
    id:'employer', label:'Workplace Rights', emoji:'💼',
    summary:'California has some of the strongest worker protections in the country. You have the right to discuss your wages, take legally mandated breaks, and work free from discrimination and harassment.',
    rights:[
      'You have the right to discuss your wages with coworkers',
      'California requires 10 min break per 4 hours and 30 min meal break per 5 hours',
      'You cannot be fired for reporting workplace safety violations',
      'Harassment and discrimination based on protected characteristics is illegal',
      'Final paycheck must be provided immediately upon termination',
    ],
    sayThis:[
      { situation:'If fired without final pay', say:'"California law requires my final paycheck today. I will contact the Labor Commissioner."' },
    ],
    laws:['Cal. Labor Code 226 — wage statement requirements','Cal. Labor Code 201 — immediate final paycheck on termination','Cal. Gov. Code 12940 — FEHA anti-discrimination protections','NLRA — right to discuss wages with coworkers'],
  },
  {
    id:'search_person', label:'Being Searched', emoji:'🖐',
    summary:'Police can only pat you down if they have reasonable suspicion you are armed and dangerous. A full search of your person requires either your consent, a lawful arrest, or a warrant. You can verbally refuse consent.',
    rights:[
      'Verbally refuse consent to any search — say "I do not consent"',
      'A pat-down requires reasonable suspicion you are armed',
      'A full search requires arrest, warrant, or your consent',
      'Do not physically resist even if the search is unlawful',
      'An unlawful search can lead to evidence suppression in court',
    ],
    sayThis:[
      { situation:'When asked to be searched', say:'"I do not consent to a search."' },
      { situation:'If searched anyway', say:'"I do not consent. I am not resisting."' },
    ],
    laws:['4th Amendment — unreasonable searches and seizures','Terry v. Ohio (1968) — limited pat-down for weapons only','Cal. Penal Code 1538.5 — suppression of illegally obtained evidence'],
  },
  {
    id:'phone', label:'Phone Search', emoji:'📲',
    summary:'Police cannot search your phone without a warrant. This was settled by the Supreme Court in 2014. Do not unlock your phone for police. You can refuse to provide your password or biometric.',
    rights:[
      'Police cannot search your phone without a warrant',
      'Do not unlock your phone for police',
      'You can refuse to provide your password',
      'Biometric unlock — face or fingerprint — may have less protection than a password',
      'If your phone is seized, it cannot be searched until a warrant is obtained',
    ],
    sayThis:[
      { situation:'When asked to unlock phone', say:'"I do not consent to a search of my phone. You need a warrant."' },
    ],
    laws:['Riley v. California (2014) — warrant required to search cell phone','4th Amendment — digital data has strong privacy protection','Consider using a PIN rather than biometric for stronger protection'],
  },
  {
    id:'force', label:'Excessive Force', emoji:'🚔',
    summary:'If you believe police used excessive force against you, do not resist in the moment. Document everything afterward — injuries, witnesses, officer names and badge numbers. File a complaint and consult an attorney.',
    rights:[
      'Do not resist in the moment even if force is excessive',
      'Document injuries with photos as soon as safely possible',
      'Get names and badge numbers of officers if possible',
      'Get contact info from any witnesses',
      'You have the right to file a complaint with SLO Police Review Commission',
    ],
    sayThis:[
      { situation:'In the moment', say:'"I am not resisting. Please stop."' },
      { situation:'After the incident', say:'Document everything and contact an attorney before speaking to anyone official.' },
    ],
    laws:['Graham v. Connor (1989) — objective reasonableness standard for force','Cal. Penal Code 149 — unlawful beating by officer','SLO PD Policy Manual 300 — use of force policy','SLO Police Review Commission — file complaints at SLO City Clerk'],
  },
  {
    id:'student', label:'Student Rights on Campus', emoji:'🎓',
    summary:'Cal Poly students have the same constitutional rights on campus as anywhere else. Campus police have the same authority as city police. Student conduct proceedings are separate from criminal proceedings and have different rules.',
    rights:[
      'You have full constitutional rights on the Cal Poly campus',
      'Campus police can arrest and charge you — treat them like city police',
      'You can refuse consent to search your dorm room',
      'Student conduct proceedings are separate — you can have an advisor present',
      'You can remain silent in student conduct proceedings too',
    ],
    sayThis:[
      { situation:'If campus police want to enter your room', say:'"Do you have a warrant or written consent from housing?"' },
      { situation:'In a student conduct meeting', say:'"I would like my advisor present before proceeding."' },
    ],
    laws:['4th Amendment — applies on public university campuses','Tinker v. Des Moines (1969) — students do not shed rights at school gate','Cal. Ed. Code 66301 — student free speech protections at CSU','Title IX — protections in disciplinary proceedings'],
  },
  {
    id:'discrimination', label:'Discrimination Stop', emoji:'⚖',
    summary:'Racial profiling and discriminatory stops by police are illegal. If you believe you were stopped because of your race, ethnicity, or religion, document everything. California law specifically prohibits discriminatory law enforcement.',
    rights:[
      'Racial profiling by police is illegal under California law',
      'Document the stop — time, location, officer names, what was said',
      'You can file a complaint with SLO Police Review Commission',
      'You can file a complaint with the CA Department of Justice',
      'Consult a civil rights attorney — these cases are often taken on contingency',
    ],
    sayThis:[
      { situation:'During the stop', say:'Remain calm and compliant. Document everything for later.' },
      { situation:'After the stop', say:'Write down everything immediately while it is fresh.' },
    ],
    laws:['Cal. Government Code 11135 — prohibits discrimination in law enforcement','Ralph Civil Rights Act — California civil rights protections','Equal Protection Clause — 14th Amendment','ACLU of California — (415) 621-2493'],
  },
  {
    id:'mental_health', label:'Mental Health Crisis Stop', emoji:'🧠',
    summary:'California law requires officers to use Crisis Intervention Training when responding to mental health emergencies. If you or someone you know is in crisis, you can request a mental health responder instead of police in SLO.',
    rights:[
      'You can request a mental health crisis team instead of police in SLO',
      'Officers must be trained in crisis intervention per California law',
      'Involuntary holds (5150) require danger to self or others',
      'You have rights during a 5150 hold including right to communication',
      'A 5150 hold is 72 hours maximum for evaluation',
    ],
    sayThis:[
      { situation:'To request mental health response', say:'Call SLO County Behavioral Health: (805) 781-4700' },
      { situation:'Crisis line', say:'Call or text 988 — 24/7 crisis support' },
    ],
    laws:['Cal. Welf. & Inst. Code 5150 — involuntary psychiatric hold','AB 988 — Mental Health Crisis Response Act','SLO Crisis Line — (805) 781-4357 available 24/7'],
  },
  {
    id:'fees_fines', label:'Fines and Fees', emoji:'💸',
    summary:'California has eliminated many criminal administrative fees. If you cannot pay a fine, you have the right to request a payment plan, community service, or ability-to-pay determination. You cannot be jailed solely for inability to pay a fine.',
    rights:[
      'You cannot be jailed solely for inability to pay a fine',
      'You have the right to request an ability-to-pay hearing',
      'Payment plans must be offered for traffic fines',
      'Many administrative fees have been eliminated under AB 1869',
      'You can request community service in lieu of fines in many cases',
    ],
    sayThis:[
      { situation:'When facing a fine you cannot pay', say:'"I would like to request an ability-to-pay determination."' },
      { situation:'For traffic tickets', say:'"I would like to request a payment plan or community service option."' },
    ],
    laws:['AB 1869 (2020) — eliminated many criminal administrative fees in California','Cal. Vehicle Code 40510.5 — payment plans for traffic fines','Bearden v. Georgia (1983) — cannot imprison for inability to pay fine'],
  },
];

var LEGAL_SLO_CONTACTS = [
  { name:'SLO PD Non-Emergency',        number:'(805) 781-7317' },
  { name:'SLO Police Review Commission', number:'(805) 781-7114' },
  { name:'ACLU of California',           number:'(415) 621-2493' },
  { name:'SLO County Public Defender',   number:'(805) 781-5858' },
  { name:'CA Attorney General Hotline',  number:'(800) 952-5225' },
  { name:'SLO Crisis Line',              number:'(805) 781-4357' },
];

var _legalCurrentPreset = null;
var _legalActiveTab = 'rights';
var _legalScreen = 'home';

function openLegalHub() {
  var existing = document.getElementById('mh-legal-hub');
  if (existing) existing.remove();

  if (!document.getElementById('legal-hub-css')) {
    var s = document.createElement('style');
    s.id = 'legal-hub-css';
    s.textContent = [
      '.lh-preset{padding:11px 12px;border-radius:13px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);cursor:pointer;display:flex;align-items:center;gap:8px;font-family:Helvetica Neue,sans-serif;transition:all 0.15s;-webkit-tap-highlight-color:transparent}',
      '.lh-preset:active{transform:scale(0.97);background:rgba(239,68,68,0.08)}',
      '.lh-tab{padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.lh-tab.active{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.5);color:#ef4444}',
      '.lh-tab:not(.active){background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.4)}',
    ].join('');
    document.head.appendChild(s);
  }

  _legalScreen = 'home';
  _legalCurrentPreset = null;

  var hub = document.createElement('div');
  hub.id = 'mh-legal-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';
  hub.innerHTML = legalRenderHome();
  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('legal');
}
window.openLegalHub = openLegalHub;
window.menuHomeOpenLegalHub = openLegalHub;

function closeLegalHub() {
  hubDeactivateMapMode();
  tipsRemoveButton('legal');
  var h = document.getElementById('mh-legal-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeLegalHub = closeLegalHub;
window.menuHomeCloseLegalHub = closeLegalHub;

function legalRenderHome() {
  var presetsHtml = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:20px">' +
    LEGAL_PRESETS.map(function(p) {
      return '<button class="lh-preset" data-pid="' + p.id + '" onclick="legalOpenPreset(this.dataset.pid)">' +
        '<span style="font-size:18px">' + p.emoji + '</span>' +
        '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.75);line-height:1.3;text-align:left">' + p.label + '</div>' +
      '</button>';
    }).join('') +
  '</div>';

  var jurisdHtml = [
    { flag:'🇺🇸', label:'U.S. Constitution & Federal Law', color:'#ef4444' },
    { flag:'⚖️',  label:'Federal Case Law — 9th Circuit',  color:'#f97316' },
    { flag:'🐻',  label:'California State Law & Case Law', color:'#22c55e' },
    { flag:'🏙',  label:'City of San Luis Obispo',          color:'#6366f1' },
  ].map(function(j) {
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:11px;background:rgba(255,255,255,0.02);border:1px solid ' + j.color + '15;margin-bottom:6px">' +
      '<span style="font-size:18px">' + j.flag + '</span>' +
      '<div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.55)">' + j.label + '</div>' +
      '<div style="margin-left:auto;width:7px;height:7px;border-radius:50%;background:' + j.color + '"></div>' +
    '</div>';
  }).join('');

  return '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(239,68,68,0.08) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">' +
        '<button onclick="closeLegalHub()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:2px;text-transform:uppercase">DTSLO Legal</div>' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">⚖️ Know Your Rights</div>' +
        '</div>' +
        '<button onclick="closeLegalHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:14px 20px 80px">' +
      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Common Situations</div>' +
      presetsHtml +
      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">🔍 Search Legal Database</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:20px">' +
        '<input id="legal-search-input" placeholder="Search Justia legal database..." style="flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:11px;padding:11px 14px;color:#fff;font-size:13px;outline:none;font-family:Helvetica Neue,sans-serif">' +
        '<button onclick="legalJustiaSearch()" style="padding:11px 16px;border-radius:11px;border:none;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;font-size:13px;font-weight:800;cursor:pointer;font-family:Helvetica Neue,sans-serif;white-space:nowrap">Search ↗</button>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">Jurisdiction Coverage</div>' +
      jurisdHtml +
      '<div style="margin-top:14px;padding:11px 13px;border-radius:11px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);line-height:1.6;text-align:center">For informational purposes only. Not legal advice. Consult a licensed attorney for your specific situation.</div>' +
    '</div>';
}

function legalJustiaSearch() {
  var q = (document.getElementById('legal-search-input') || {}).value || '';
  if (!q.trim()) return;
  var url = 'https://www.justia.com/search?q=' + encodeURIComponent(q + ' California San Luis Obispo') + '&cx=004575720243800631899:jl56bz34tn4';
  window.open(url, '_blank');
}
window.legalJustiaSearch = legalJustiaSearch;

function legalOpenPreset(id) {
  var preset = LEGAL_PRESETS.find(function(p) { return p.id === id; });
  if (!preset) return;
  _legalCurrentPreset = preset;
  _legalActiveTab = 'rights';
  var hub = document.getElementById('mh-legal-hub');
  if (hub) hub.innerHTML = legalRenderResult(preset);
}
window.legalOpenPreset = legalOpenPreset;

function legalRenderResult(preset) {
  var tabsHtml = '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;margin-bottom:14px">' +
    [
      { id:'rights',   label:'Your Rights', emoji:'🛡' },
      { id:'say',      label:'What to Say',  emoji:'💬' },
      { id:'laws',     label:'The Laws',     emoji:'📋' },
      { id:'contacts', label:'Contacts',     emoji:'📞' },
    ].map(function(t) {
      return '<button class="lh-tab' + (_legalActiveTab===t.id?' active':'') + '" data-ltab="' + t.id + '" onclick="legalSetTab(this.dataset.ltab)">' + t.emoji + ' ' + t.label + '</button>';
    }).join('') +
  '</div>';

  return '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(239,68,68,0.08) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<button onclick="legalGoHome()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;letter-spacing:2px;text-transform:uppercase">Know Your Rights</div>' +
          '<div style="font-size:18px;font-weight:900;font-family:Georgia,serif">' + preset.emoji + ' ' + preset.label + '</div>' +
        '</div>' +
        '<button onclick="closeLegalHub()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      tabsHtml +
    '</div>' +
    '<div style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      '<div style="padding:13px;border-radius:13px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);margin-bottom:14px">' +
        '<div style="font-size:11px;font-weight:700;color:#ef4444;letter-spacing:1px;text-transform:uppercase;margin-bottom:7px">⚠️ Summary</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6">' + preset.summary + '</div>' +
      '</div>' +
      '<div id="legal-tab-content">' + legalRenderTabContent(preset) + '</div>' +
    '</div>';
}

function legalRenderTabContent(preset) {
  if (_legalActiveTab === 'rights') {
    return (preset.rights||[]).map(function(r, i) {
      return '<div style="display:flex;gap:10px;padding:10px 13px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
        '<div style="width:22px;height:22px;border-radius:11px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#ef4444;flex-shrink:0">' + (i+1) + '</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.5">' + r + '</div>' +
      '</div>';
    }).join('');
  }
  if (_legalActiveTab === 'say') {
    return '<div style="padding:10px 13px;border-radius:11px;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);margin-bottom:12px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5">Stay calm. Speak clearly. These exact phrases are legally meaningful.</div>' +
      (preset.sayThis||[]).map(function(s) {
        return '<div style="padding:12px 13px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">' + s.situation + '</div>' +
          '<div style="font-size:14px;font-weight:800;color:#22c55e;line-height:1.5">' + s.say + '</div>' +
        '</div>';
      }).join('');
  }
  if (_legalActiveTab === 'laws') {
    return (preset.laws||[]).map(function(l) {
      return '<div style="display:flex;gap:8px;padding:10px 13px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
        '<span style="color:#f97316;flex-shrink:0;margin-top:1px">⚖️</span>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.65);line-height:1.5">' + l + '</div>' +
      '</div>';
    }).join('') +
    '<a href="https://www.justia.com/search?q=' + encodeURIComponent((preset.label||'') + ' California rights') + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;border-radius:12px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#ef4444;text-decoration:none;font-size:12px;font-weight:800;margin-top:8px">Search Justia for more case law ↗</a>';
  }
  if (_legalActiveTab === 'contacts') {
    return LEGAL_SLO_CONTACTS.map(function(c) {
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 13px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:8px">' +
        '<div style="font-size:13px;font-weight:700">' + c.name + '</div>' +
        '<a href="tel:' + c.number + '" style="font-size:13px;font-weight:800;color:#22c55e;text-decoration:none">' + c.number + '</a>' +
      '</div>';
    }).join('') +
    '<div style="margin-top:8px;padding:11px 13px;border-radius:11px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);font-size:11px;color:rgba(255,255,255,0.3);line-height:1.6;text-align:center">For informational purposes only. Not legal advice. Consult a licensed attorney for your specific situation.</div>';
  }
  return '';
}

function legalSetTab(tabId) {
  _legalActiveTab = tabId;
  var hub = document.getElementById('mh-legal-hub');
  if (!hub || !_legalCurrentPreset) return;
  // Update tab active states
  hub.querySelectorAll('.lh-tab').forEach(function(b) {
    b.classList.toggle('active', b.dataset.ltab === tabId);
  });
  var content = document.getElementById('legal-tab-content');
  if (content) content.innerHTML = legalRenderTabContent(_legalCurrentPreset);
}
window.legalSetTab = legalSetTab;

function legalGoHome() {
  var hub = document.getElementById('mh-legal-hub');
  if (!hub) return;
  _legalCurrentPreset = null;
  hub.innerHTML = legalRenderHome();
}
window.legalGoHome = legalGoHome;
