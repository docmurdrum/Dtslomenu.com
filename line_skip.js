// ══════════════════════════════════════════════
// LINE_SKIP.JS — Line Skip / Line Leap feature
// ══════════════════════════════════════════════

function initLineSkip() {
  var page = document.getElementById('lineskip');
  if (!page) return;
  renderLineSkip();
}

function renderLineSkip() {
  var page = document.getElementById('lineskip');
  if (!page) return;

  // Check if user has active passes
  var passes = JSON.parse(localStorage.getItem('dtslo_line_passes') || '[]');
  var activePasses = passes.filter(function(p) { return p.expires > Date.now(); });

  page.innerHTML = [
    '<div class="page-header">',
      '<button class="game-back-btn" onclick="showPage(this.dataset.pg)" data-pg="line">← Back</button>',
      '<div style="font-size:22px;font-weight:800;font-family:Georgia,serif;margin-bottom:4px">⚡ Line Skip</div>',
      '<div style="font-size:12px;color:var(--text2)">Skip the line at participating bars</div>',
    '</div>',

    // How it works
    '<div style="padding:14px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.15);border-radius:14px;margin-bottom:20px">',
      '<div style="font-size:13px;font-weight:800;color:#ffd700;margin-bottom:8px">How it works</div>',
      '<div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.7">',
        '1. Get a Line Skip pass below<br>',
        '2. Head to a participating bar<br>',
        '3. Find the hidden QR code at the entrance<br>',
        '4. Scan it to verify your pass<br>',
        '5. Walk to the front — your pass is confirmed',
      '</div>',
    '</div>',

    // Active passes
    activePasses.length ? [
      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2);margin-bottom:10px">YOUR ACTIVE PASSES</div>',
      activePasses.map(function(p) {
        var mins = Math.floor((p.expires - Date.now()) / 60000);
        return '<div style="padding:14px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:14px;margin-bottom:8px">' +
          '<div style="display:flex;align-items:center;justify-content:space-between">' +
            '<div><div style="font-size:14px;font-weight:800">' + p.bar + '</div>' +
            '<div style="font-size:11px;color:#22c55e">Valid for ' + mins + ' more minutes</div></div>' +
            '<div style="font-size:28px">⚡</div>' +
          '</div></div>';
      }).join('')
    ].join('') : '',

    // Available passes
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text2);margin-bottom:10px">PARTICIPATING BARS</div>',
    '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">',
      lineSkipBars().map(function(bar) {
        return '<div style="padding:14px;background:var(--surface2);border:1px solid var(--border);border-radius:14px;display:flex;align-items:center;justify-content:space-between">' +
          '<div>' +
            '<div style="font-size:14px;font-weight:800">' + bar.name + '</div>' +
            '<div style="font-size:11px;color:var(--text2)">' + bar.price + ' · ' + bar.note + '</div>' +
          '</div>' +
          '<button onclick="lineSkipGetPass(this.dataset.bid)" style="padding:8px 16px;border-radius:20px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:12px;font-weight:800;font-family:inherit;cursor:pointer">Get Pass</button>' +
        '</div>';
      }).join('') +
    '</div>',

    // Scanner
    '<div style="padding:14px;background:var(--surface2);border:1px solid var(--border);border-radius:14px;margin-bottom:16px">',
      '<div style="font-size:13px;font-weight:800;margin-bottom:8px">Already have a pass?</div>',
      '<button onclick="lineSkipScan()" style="width:100%;padding:13px;border-radius:12px;border:none;background:rgba(255,255,255,0.08);color:white;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">📷 Scan Entrance QR</button>',
    '</div>',

    '<div style="font-size:11px;color:var(--text2);text-align:center;line-height:1.6">',
      'Line Skip passes are valid for 2 hours.<br>',
      'Bars set their own prices via the MENU partner dashboard.',
    '</div>',
  ].join('');
}

function lineSkipBars() {
  return [
    {id:'ba_start', name:'BA Start Arcade Bar', price:'Free (beta)', note:'Founding partner'},
    {id:'black_sheep', name:'Black Sheep', price:'Free (beta)', note:'Founding partner'},
    {id:'coming', name:'More bars joining soon...', price:'', note:'Reach out to partner@dtslomenu.com'},
  ];
}

function lineSkipGetPass(barId) {
  if (barId === 'coming') return;
  // For beta — free passes, just save locally
  var passes = JSON.parse(localStorage.getItem('dtslo_line_passes') || '[]');
  var barName = barId === 'ba_start' ? 'BA Start Arcade Bar' : 'Black Sheep';

  // Check if already have pass for this bar
  var existing = passes.find(function(p) { return p.bar === barName && p.expires > Date.now(); });
  if (existing) {
    showToast('⚡ You already have an active pass for ' + barName);
    return;
  }

  passes.push({
    bar: barName,
    barId: barId,
    issued: Date.now(),
    expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    passCode: Math.random().toString(36).slice(2, 8).toUpperCase()
  });
  localStorage.setItem('dtslo_line_passes', JSON.stringify(passes));
  showToast('⚡ Line Skip pass activated for ' + barName + '!');
  renderLineSkip();
}

function lineSkipScan() {
  // Use native camera
  if (navigator.mediaDevices) {
    showToast('📷 Open your camera to scan the entrance QR code');
  } else {
    showToast('📷 Open your camera app and scan the QR at the entrance');
  }
}

function lineSkipVerify(passCode) {
  var passes = JSON.parse(localStorage.getItem('dtslo_line_passes') || '[]');
  var pass = passes.find(function(p) { return p.passCode === passCode && p.expires > Date.now(); });
  if (pass) {
    showToast('✅ Pass verified — welcome to ' + pass.bar + '!');
    // Mark as used
    pass.used = true;
    pass.usedAt = Date.now();
    localStorage.setItem('dtslo_line_passes', JSON.stringify(passes));
    return true;
  }
  showToast('❌ Pass not found or expired');
  return false;
}
