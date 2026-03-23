// ══════════════════════════════════════════════
// DICE.JS — Classic Drinking Dice & Dare Dice
// ══════════════════════════════════════════════

// ── STATE ──
let diceMode       = 'classic'; // 'classic' or 'dare'
let diceGroupMode  = 'solo';    // 'solo' or 'group'
let diceRolling    = false;
let diceCurrentPlayer = 1;
let dicePlayers    = 2;
let diceScores     = {};
let dareFaces      = []; // loaded from Supabase
let shakeEnabled   = true;

// ── INIT ──
function initDice() {
  loadDareFaces();
  setupShakeDetection();
  renderDiceGame();
}

// ── LOAD DARE FACES ──
async function loadDareFaces() {
  try {
    const { data } = await supabaseClient
      .from('dare_dice')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });
    dareFaces = data || [];
  } catch(e) {
    // Fallback preset dares
    dareFaces = [
      { text: "Take 2 sips" },
      { text: "Give 3 sips to someone" },
      { text: "Tell an embarrassing story" },
      { text: "Do your best dance move" },
      { text: "Everyone else drinks" },
      { text: "Switch drinks with someone" },
    ];
  }
  if (diceMode === 'dare') renderDiceGame();
}

// ── RENDER ──
function renderDiceGame() {
  const panel = document.getElementById('game-panel-dice');
  if (!panel) return;

  const isClassic = diceMode === 'classic';

  panel.innerHTML = `
    <!-- Mode toggle -->
    <div class="game-card" style="margin-bottom:12px">
      <div style="display:flex;gap:8px;margin-bottom:14px">
        <button class="dice-mode-btn ${isClassic ? 'active' : ''}" onclick="setDiceMode('classic')">🎲 Classic</button>
        <button class="dice-mode-btn ${!isClassic ? 'active' : ''}" onclick="setDiceMode('dare')">😈 Dare Dice</button>
      </div>

      ${isClassic ? `
        <!-- Classic: 2 dice, highest roll assigns drinks -->
        <div style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.5">
          Roll two dice. Higher total assigns that many sips to someone of your choice.
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button class="dice-mode-btn ${diceGroupMode==='solo'?'active':''}" onclick="setDiceGroupMode('solo')">👤 Solo</button>
          <button class="dice-mode-btn ${diceGroupMode==='group'?'active':''}" onclick="setDiceGroupMode('group')">👥 Pass Phone</button>
        </div>
        ${diceGroupMode === 'group' ? `
          <div class="dice-player-row">
            <span style="font-size:13px;font-weight:700;color:var(--text2)">Players:</span>
            ${[2,3,4,5,6].map(n => `
              <button class="dice-player-btn ${dicePlayers===n?'active':''}" onclick="setDicePlayers(${n})">${n}</button>
            `).join('')}
          </div>
          <div style="font-size:13px;font-weight:800;margin-bottom:4px;color:var(--accent)">
            Player ${diceCurrentPlayer}'s turn
          </div>
        ` : ''}
      ` : `
        <!-- Dare: 1 die, face = dare -->
        <div style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.5">
          Roll the dare die. Whatever face it lands on — you must do it.
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button class="dice-mode-btn ${diceGroupMode==='solo'?'active':''}" onclick="setDiceGroupMode('solo')">👤 Solo</button>
          <button class="dice-mode-btn ${diceGroupMode==='group'?'active':''}" onclick="setDiceGroupMode('group')">👥 Pass Phone</button>
        </div>
      `}

      <!-- Dice area -->
      <div class="dice-area" id="dice-area">
        ${isClassic ? `
          <div class="die-wrap" id="die-1"><div class="die" id="die-face-1">⚀</div></div>
          <div class="die-wrap" id="die-2"><div class="die" id="die-face-2">⚀</div></div>
        ` : `
          <div class="die-wrap" id="die-1"><div class="die die-dare" id="die-face-1">?</div></div>
        `}
      </div>

      <!-- Result -->
      <div class="dice-result" id="dice-result" style="display:none"></div>

      <!-- Roll button -->
      <button class="dice-roll-btn" id="dice-roll-btn" onclick="rollDice()">
        🎲 Roll ${isClassic ? 'Dice' : 'Die'}
      </button>
      <div style="font-size:11px;color:var(--text2);text-align:center;margin-top:8px">
        📱 Or shake your phone to roll
      </div>
    </div>

    <!-- Scores (group classic mode) -->
    ${isClassic && diceGroupMode === 'group' ? `
      <div class="game-card">
        <div class="game-card-title">🏆 Round Scores</div>
        <div id="dice-scores">${renderDiceScores()}</div>
        <button style="margin-top:12px;background:none;border:1px solid var(--border);border-radius:10px;padding:8px 14px;color:var(--text2);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer" onclick="resetDiceScores()">Reset Scores</button>
      </div>
    ` : ''}
  `;
}

function renderDiceScores() {
  if (!Object.keys(diceScores).length) return '<div style="font-size:12px;color:var(--text2)">No rolls yet</div>';
  return Object.entries(diceScores).map(([p, s]) =>
    `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px">
      <span style="font-weight:700">Player ${p}</span>
      <span style="color:var(--gold);font-weight:800">${s} sips total</span>
    </div>`
  ).join('');
}

function resetDiceScores() {
  diceScores = {};
  diceCurrentPlayer = 1;
  renderDiceGame();
}

// ── MODE SETTERS ──
function setDiceMode(mode) {
  diceMode = mode;
  diceRolling = false;
  renderDiceGame();
}

function setDiceGroupMode(mode) {
  diceGroupMode = mode;
  diceCurrentPlayer = 1;
  diceScores = {};
  renderDiceGame();
}

function setDicePlayers(n) {
  dicePlayers = n;
  diceCurrentPlayer = 1;
  diceScores = {};
  renderDiceGame();
}

// ── ROLL ──
function rollDice() {
  if (diceRolling) return;
  diceRolling = true;

  const btn = document.getElementById('dice-roll-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Rolling...'; }

  const resultEl = document.getElementById('dice-result');
  if (resultEl) resultEl.style.display = 'none';

  if (diceMode === 'classic') rollClassicDice();
  else rollDareDice();
}

const DICE_FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

function rollClassicDice() {
  const face1El = document.getElementById('die-face-1');
  const face2El = document.getElementById('die-face-2');
  if (!face1El || !face2El) { diceRolling = false; return; }

  // Animate rolling
  let ticks = 0;
  const interval = setInterval(() => {
    face1El.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    face2El.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    face1El.classList.add('rolling');
    face2El.classList.add('rolling');
    ticks++;
    if (ticks >= 12) {
      clearInterval(interval);
      const v1 = Math.floor(Math.random() * 6) + 1;
      const v2 = Math.floor(Math.random() * 6) + 1;
      face1El.textContent = DICE_FACES[v1 - 1];
      face2El.textContent = DICE_FACES[v2 - 1];
      face1El.classList.remove('rolling');
      face2El.classList.remove('rolling');
      showClassicResult(v1, v2);
    }
  }, 80);
}

function showClassicResult(v1, v2) {
  const total = v1 + v2;
  const resultEl = document.getElementById('dice-result');
  const btn      = document.getElementById('dice-roll-btn');

  let msg = '';
  if (total === 2)       msg = `Snake eyes! 🐍 Take ${total} sips yourself`;
  else if (total === 12) msg = `Boxcars! 🎰 Everyone drinks!`;
  else if (v1 === v2)    msg = `Doubles! 🎯 Double it — ${total * 2} sips to give out!`;
  else                   msg = `${total} — Give out ${total} sips however you like`;

  if (resultEl) {
    resultEl.innerHTML = `
      <div style="font-size:22px;font-weight:900;margin-bottom:6px;color:var(--gold)">${v1} + ${v2} = ${total}</div>
      <div style="font-size:14px;font-weight:700">${msg}</div>`;
    resultEl.style.display = 'block';
  }

  // Track group scores
  if (diceGroupMode === 'group') {
    const p = diceCurrentPlayer;
    diceScores[p] = (diceScores[p] || 0) + total;
    diceCurrentPlayer = (p % dicePlayers) + 1;
    const scoresEl = document.getElementById('dice-scores');
    if (scoresEl) scoresEl.innerHTML = renderDiceScores();
    const turnEl = document.querySelector('.dice-player-turn');
    // Update player indicator
    renderDiceGame();
  }

  if (btn) { btn.disabled = false; btn.textContent = '🎲 Roll Again'; }
  diceRolling = false;
}

function rollDareDice() {
  const faceEl = document.getElementById('die-face-1');
  if (!faceEl) { diceRolling = false; return; }
  if (!dareFaces.length) {
    showToast('⚠️ No dare faces loaded');
    diceRolling = false;
    return;
  }

  let ticks = 0;
  const interval = setInterval(() => {
    const r = dareFaces[Math.floor(Math.random() * dareFaces.length)];
    faceEl.textContent = r.text.slice(0, 3) + '...';
    faceEl.classList.add('rolling');
    ticks++;
    if (ticks >= 14) {
      clearInterval(interval);
      const chosen = dareFaces[Math.floor(Math.random() * dareFaces.length)];
      faceEl.textContent = '😈';
      faceEl.classList.remove('rolling');
      showDareResult(chosen);
    }
  }, 80);
}

function showDareResult(dare) {
  const resultEl = document.getElementById('dice-result');
  const btn      = document.getElementById('dice-roll-btn');

  if (resultEl) {
    resultEl.innerHTML = `
      <div style="font-size:28px;margin-bottom:8px">😈</div>
      <div style="font-size:16px;font-weight:900;line-height:1.4">${dare.text}</div>`;
    resultEl.style.display = 'block';
  }

  if (btn) { btn.disabled = false; btn.textContent = '🎲 Roll Again'; }
  diceRolling = false;
}

// ── SHAKE DETECTION ──
function setupShakeDetection() {
  if (!window.DeviceMotionEvent) return;
  let lastShake = 0;
  let lastX = null, lastY = null, lastZ = null;

  const handler = (e) => {
    if (!shakeEnabled) return;
    const { x, y, z } = e.accelerationIncludingGravity || {};
    if (x == null) return;
    if (lastX == null) { lastX=x; lastY=y; lastZ=z; return; }
    const delta = Math.abs(x-lastX) + Math.abs(y-lastY) + Math.abs(z-lastZ);
    if (delta > 25 && Date.now() - lastShake > 1000) {
      lastShake = Date.now();
      // Only roll if dice panel is visible
      const panel = document.getElementById('game-panel-dice');
      if (panel && panel.classList.contains('active')) rollDice();
    }
    lastX=x; lastY=y; lastZ=z;
  };

  // Request permission on iOS 13+
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    document.getElementById('dice-roll-btn')?.addEventListener('click', () => {
      DeviceMotionEvent.requestPermission().then(state => {
        if (state === 'granted') window.addEventListener('devicemotion', handler);
      }).catch(console.error);
    }, { once: true });
  } else {
    window.addEventListener('devicemotion', handler);
  }
}
