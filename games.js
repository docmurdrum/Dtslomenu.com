// ══════════════════════════════════════════════
// GAMES.JS — Trivia, Spinner, Bingo, Duel, Predictions
// ══════════════════════════════════════════════

// ── GAME MODE SWITCHING ──
function switchGameMode(mode) {
  // Hide grid, show panel
  const grid = document.getElementById('games-grid');
  if (grid) grid.style.display = 'none';

  document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('game-panel-' + mode);
  if (panel) panel.classList.add('active');

  // Init each mode when first opened
  if (mode === 'trivia')   { if (!triviaInitialized) initTrivia(); }
  if (mode === 'bingo')    { if (!bingoInitialized)  initBingo(); }
  if (mode === 'predict')  { loadPropositions(); renderPredictions(); }
  if (mode === 'dice')     { initDice(); }
  if (mode === 'beerpong') { initBeerPong(); }
  if (mode === 'nhie')     { initNHIE(); }
  if (mode === 'whoami')      { initWhoAmI(); }
  if (mode === 'hottakes')    { initHotTakes(); }
  if (mode === 'icebreakers') { initIceBreakers(); }
  if (mode === 'ranking')     { initRanking(); }
}

function backToGamesGrid() {
  document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
  const grid = document.getElementById('games-grid');
  if (grid) grid.style.display = 'grid';
  triviaInitialized = false;
  bingoInitialized  = false;
}

// ══════════════════════════════════════════════
// TRIVIA
// ══════════════════════════════════════════════
// Trivia questions loaded from Supabase (fallback to hardcoded if offline)
let TRIVIA_QUESTIONS = [
  { q: "What street is the main bar strip in downtown SLO?", opts: ["Higuera Street","Marsh Street","Monterey Street","Garden Street"], a: 0 },
  { q: "What college is in San Luis Obispo?", opts: ["UC Santa Barbara","Cuesta College","Cal Poly SLO","UC Davis"], a: 2 },
  { q: "What is Thursday night in SLO known as?", opts: ["Thirsty Thursday","SLO Night","College Night","Bar Night"], a: 0 },
  { q: "Which bar is known as 'The Frog'?", opts: ["Bull's Tavern","SLO Brew","McCarthy's","Frog and Peach"], a: 3 },
  { q: "What does DTSLO stand for?", opts: ["Down To SLO","Downtown San Luis Obispo","Drink Till Sunrise","Night Out SLO"], a: 1 },
  { q: "What mountain is known as the peak above downtown SLO?", opts: ["Cerro San Luis","Bishop Peak","Madonna Mountain","Black Hill"], a: 1 },
  { q: "What is the biggest weekly night out in SLO?", opts: ["Saturday","Friday","Thursday","Wednesday"], a: 2 },
  { q: "What train line runs through SLO?", opts: ["Amtrak Coast Starlight","Pacific Surfliner","Caltrain","Metrolink"], a: 0 },
  { q: "SLO is located in which county?", opts: ["Santa Barbara County","Monterey County","San Luis Obispo County","Ventura County"], a: 2 },
  { q: "What is SLO's famous weekly farmers market known as?", opts: ["Higuera Market","SLO Thursday Night","Downtown Farmers Market","Midtown Market"], a: 1 },
  { q: "What is the approximate population of San Luis Obispo?", opts: ["20,000","47,000","85,000","120,000"], a: 1 },
  { q: "Which bar is famous for its live music on Higuera?", opts: ["Frog and Peach","SLO Brew","McCarthy's","Bull's Tavern"], a: 1 },
  { q: "What is the local nickname for Cal Poly students?", opts: ["Bears","Mustangs","Broncos","Trojans"], a: 1 },
  { q: "What highway runs through downtown SLO?", opts: ["Highway 1","Highway 101","Highway 1 and 101","Route 66"], a: 2 },
  { q: "What does XP stand for in DTSLO?", opts: ["Extra Points","Experience Points","Extra Plays","Exchange Points"], a: 1 },
];

// ── LOAD TRIVIA FROM SUPABASE ──
async function loadTriviaQuestions() {
  try {
    const { data, error } = await supabaseClient
      .from('trivia_questions')
      .select('*')
      .order('created_at', { ascending: true });
    if (error || !data || !data.length) return;
    TRIVIA_QUESTIONS = data.map(r => ({
      q: r.question,
      opts: [r.option_a, r.option_b, r.option_c, r.option_d],
      a: r.correct_answer, // 0-3
      category: r.category
    }));
  } catch(e) { /* silent — use fallback */ }
}

let triviaInitialized = false;
let triviaQIdx = 0;
let triviaScore = 0;
let triviaAnswered = false;
let triviaTimer = null;

function initTrivia() {
  triviaInitialized = true;
  triviaQIdx = 0;
  triviaScore = 0;
  renderTriviaQuestion();
}

function renderTriviaQuestion() {
  const q = TRIVIA_QUESTIONS[triviaQIdx % TRIVIA_QUESTIONS.length];
  const total = Math.min(TRIVIA_QUESTIONS.length, 10);

  const counter = document.getElementById('trivia-counter');
  const question = document.getElementById('trivia-question');
  const fill = document.getElementById('trivia-fill');
  const scoreEl = document.getElementById('trivia-score');
  const timerEl = document.getElementById('trivia-timer');
  const optsEl = document.getElementById('trivia-options');

  if (!counter || !question) return;

  counter.textContent = `Question ${(triviaQIdx % total) + 1} of ${total}`;
  question.textContent = q.q;
  fill.style.width = (((triviaQIdx % total) + 1) / total * 100) + '%';
  scoreEl.textContent = triviaScore;
  timerEl.textContent = '20';
  timerEl.className = 'trivia-timer';
  triviaAnswered = false;

  optsEl.innerHTML = q.opts.map((o, i) =>
    `<button class="trivia-option" onclick="answerTrivia(this, ${i}, ${q.a})">${o}</button>`
  ).join('');

  clearInterval(triviaTimer);
  let t = 20;
  triviaTimer = setInterval(() => {
    t--;
    if (!timerEl) { clearInterval(triviaTimer); return; }
    timerEl.textContent = t;
    if (t <= 5) timerEl.className = 'trivia-timer urgent';
    if (t <= 0) {
      clearInterval(triviaTimer);
      if (!triviaAnswered) triviaTimeout();
    }
  }, 1000);
}

function answerTrivia(btn, chosen, correct) {
  if (triviaAnswered) return;
  triviaAnswered = true;
  clearInterval(triviaTimer);

  const timeLeft = parseInt(document.getElementById('trivia-timer').textContent) || 0;
  btn.classList.add(chosen === correct ? 'correct' : 'wrong');

  const opts = document.querySelectorAll('.trivia-option');
  if (chosen !== correct && opts[correct]) opts[correct].classList.add('correct');

  if (chosen === correct) {
    triviaScore++;
    document.getElementById('trivia-score').textContent = triviaScore;
  }

  // Check if finished (after last question)
  const total = Math.min(TRIVIA_QUESTIONS.length, 10);
  if ((triviaQIdx % total) === total - 1) {
    // Last question — show result after delay
    setTimeout(() => {
      triviaQIdx++;
      showTriviaResult();
    }, 1200);
    return;
  }

  setTimeout(() => {
    triviaQIdx++;
    renderTriviaQuestion();
  }, 1200);
}

function showTriviaResult() {
  const card = document.querySelector('#game-panel-trivia .game-card');
  if (!card) return;
  const correct = triviaScore;
  const qualified = correct >= 7;
  const xpEarned = qualified ? 10 : 0;

  if (qualified && currentUser) {
    awardXP(10, 'trivia_complete');
    if (correct === 10) recordTriviaPerfect();
    else recordTrivia7Plus();
    checkAchievements();
  }

  card.innerHTML = `
    <div style="text-align:center;padding:20px 10px">
      <div style="font-size:52px;margin-bottom:12px">${correct >= 8 ? '🧠' : correct >= 7 ? '⚡' : '💪'}</div>
      <div style="font-size:26px;font-weight:900;margin-bottom:6px">${correct} / 10</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:16px;line-height:1.5">
        ${qualified
          ? `✅ You scored 7+! <strong style="color:var(--gold)">+10 XP earned</strong>`
          : `Score 7 or more to earn 10 XP. You got ${correct} — try again!`}
      </div>
      <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:14px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;border:none" onclick="restartTrivia()">🔄 Play Again</button>
    </div>`;
}

function restartTrivia() {
  triviaQIdx = 0;
  triviaScore = 0;
  triviaAnswered = false;
  clearInterval(triviaTimer);
  const card = document.querySelector('#game-panel-trivia .game-card');
  if (!card) return;
  card.innerHTML = `
    <div class="trivia-header">
      <div>
        <div class="game-card-title">SLO Bar Trivia</div>
        <div style="font-size:11px;color:var(--text2)" id="trivia-counter">Question 1 of 10</div>
      </div>
      <div>
        <div class="trivia-xp" id="trivia-score">0</div>
        <div class="trivia-xp-label">correct</div>
      </div>
    </div>
    <div class="trivia-progress"><div class="trivia-progress-fill" id="trivia-fill" style="width:10%"></div></div>
    <div class="trivia-question" id="trivia-question">Loading...</div>
    <div class="trivia-options" id="trivia-options"></div>
    <div class="trivia-footer">
      <div class="trivia-timer" id="trivia-timer">20</div>
      <div class="xp-pill">⚡ Score 7+ to earn 10 XP</div>
    </div>`;
  renderTriviaQuestion();
}

function triviaTimeout() {
  triviaAnswered = true;
  const q = TRIVIA_QUESTIONS[triviaQIdx % TRIVIA_QUESTIONS.length];
  const opts = document.querySelectorAll('.trivia-option');
  if (opts[q.a]) opts[q.a].classList.add('correct');
  setTimeout(() => {
    triviaQIdx++;
    renderTriviaQuestion();
  }, 1200);
}

// ── XP helper (safe — only awards if user is logged in) ──
async function awardXP(amount, source) {
  if (!currentUser || !supabaseClient) return;
  try {
    await supabaseClient.from('xp_events').insert({
      user_id: currentUser.id,
      amount,
      source,
      created_at: new Date().toISOString()
    });
  } catch(e) { /* silent — XP table may not exist yet */ }
}

// ══════════════════════════════════════════════
// SPINNER
// ══════════════════════════════════════════════
const SPINNER_OUTCOMES = [
  { label: "Take a sip 🍺",         color: "#ff2d78" },
  { label: "Give 2 sips 👉",        color: "#b44fff" },
  { label: "Truth or Dare 🎯",      color: "#00f5ff" },
  { label: "Finish your drink 💀",  color: "#ffd700" },
  { label: "Pick someone 👆",       color: "#00ff88" },
  { label: "Everyone drinks 🥂",    color: "#ff9500" },
];

let spinnerRotation = 0;
let spinnerRunning = false;

function spinWheel() {
  if (spinnerRunning) return;
  spinnerRunning = true;

  const disc   = document.getElementById('spinner-disc');
  const result = document.getElementById('spinner-result');
  if (!disc) return;

  result.style.display = 'none';
  const extra = 1440 + Math.random() * 720;
  spinnerRotation += extra;
  disc.style.transform = `rotate(${spinnerRotation}deg)`;

  setTimeout(() => {
    spinnerRunning = false;
    const seg = Math.floor(((spinnerRotation % 360) / 60)) % 6;
    const idx = (6 - seg) % 6;
    const outcome = SPINNER_OUTCOMES[idx];
    result.textContent = outcome.label;
    result.style.color = outcome.color;
    result.style.display = 'block';
  }, 3100);
}

// ══════════════════════════════════════════════
// BAR BINGO
// ══════════════════════════════════════════════
const BINGO_SQUARES = [
  "Someone trips","Group photo","Lost phone","Shots ordered","Matching outfits",
  "Someone crying","Running into an ex","Birthday group","Dancing alone","Line out door",
  "Bartender knows you","Someone asleep","Spilled drink","Dance battle","Leaves early",
  "Group hug","DJ takes requests","Late night food","Tab dispute","Bouncer turns away",
  "First time out","Last call panic","Rain on patio","Free round"
];

let bingoBoard = [];
let bingoInitialized = false;

function initBingo() {
  bingoInitialized = true;
  generateBingoCard();
}

function generateBingoCard() {
  // Check if we have a saved card for tonight
  const savedNight = safeStore.get('bingo_night');
  const tonight = new Date().toISOString().slice(0, 10);
  const saved = safeStore.get('bingo_board');

  if (savedNight === tonight && saved) {
    try {
      bingoBoard = JSON.parse(saved);
      renderBingoGrid();
      return;
    } catch(e) { /* fall through to new card */ }
  }

  const shuffled = [...BINGO_SQUARES].sort(() => Math.random() - 0.5).slice(0, 24);
  shuffled.splice(12, 0, 'FREE');
  bingoBoard = shuffled.map((text, i) => ({ text, checked: i === 12, free: i === 12 }));
  safeStore.set('bingo_night', tonight);
  safeStore.set('bingo_board', JSON.stringify(bingoBoard));
  renderBingoGrid();
}

function renderBingoGrid() {
  const grid = document.getElementById('bingo-grid');
  const countEl = document.getElementById('bingo-checked-count');
  if (!grid) return;

  grid.innerHTML = bingoBoard.map((cell, i) => {
    let cls = 'bingo-cell';
    if (cell.free)    cls += ' free';
    else if (cell.checked) cls += ' checked';
    const onclick = cell.free ? '' : `onclick="toggleBingoCell(${i})"`;
    const content = cell.free ? '⭐' : cell.checked ? '✓' : cell.text;
    return `<div class="${cls}" ${onclick}>${content}</div>`;
  }).join('');

  const checkedCount = bingoBoard.filter(c => c.checked).length;
  if (countEl) countEl.textContent = checkedCount;

  checkBingoWin();
}

function toggleBingoCell(i) {
  if (bingoBoard[i].free) return;
  bingoBoard[i].checked = !bingoBoard[i].checked;
  safeStore.set('bingo_board', JSON.stringify(bingoBoard));
  renderBingoGrid();
}

function checkBingoWin() {
  const lines = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];
  const hasBingo = lines.some(line => line.every(i => bingoBoard[i] && bingoBoard[i].checked));
  const claimBtn = document.getElementById('bingo-claim-btn');
  if (claimBtn) claimBtn.style.display = hasBingo ? 'block' : 'none';
}

function claimBingo() {
  showToast('🎉 BINGO! +50 XP earned!');
  if (currentUser) {
    awardXP(50, 'bingo_win');
    recordBingoWin();
  }
  const claimBtn = document.getElementById('bingo-claim-btn');
  if (claimBtn) claimBtn.style.display = 'none';
  // Clear saved card so they get a fresh one
  safeStore.set('bingo_night', '');
}

// ══════════════════════════════════════════════
// TRIVIA DUEL
// ══════════════════════════════════════════════
let activeDuels = [];

function switchDuelTab(tab) {
  document.querySelectorAll('.duel-sub-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.duel-sub-tab').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('duel-panel-' + tab);
  const btn   = document.getElementById('duel-tab-' + tab);
  if (panel) panel.classList.add('active');
  if (btn)   btn.classList.add('active');
  if (tab === 'active') loadActiveDuels();
}

async function sendDuelChallenge() {
  const input = document.getElementById('duel-challenge-input');
  const username = input ? input.value.trim() : '';
  if (!username) { showToast('⚠️ Enter a username to challenge'); return; }
  if (!currentUser) { showToast('⚠️ Sign in to challenge players'); return; }

  try {
    // Look up the user by username
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .single();

    if (error || !data) { showToast('❌ Player not found'); return; }
    if (data.id === currentUser.id) { showToast('❌ You can\'t challenge yourself'); return; }

    // Create duel record
    const { error: duelError } = await supabaseClient.from('duels').insert({
      challenger_id: currentUser.id,
      opponent_id: data.id,
      status: 'pending',
      questions: JSON.stringify(getRandomDuelQuestions()),
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    if (duelError) throw duelError;
    input.value = '';
    showToast(`⚔️ Challenge sent to ${username}!`);
  } catch(e) {
    showToast('❌ ' + e.message);
  }
}

async function findRandomDuel() {
  if (!currentUser) { showToast('⚠️ Sign in to play duels'); return; }
  const btn = document.getElementById('duel-random-btn');
  if (btn) { btn.disabled = true; btn.textContent = '🔍 Searching...'; }

  try {
    // Find a pending duel from someone else looking for random match
    const { data, error } = await supabaseClient
      .from('duels')
      .select('*')
      .eq('status', 'looking')
      .neq('challenger_id', currentUser.id)
      .limit(1)
      .single();

    if (data && !error) {
      // Join this duel
      await supabaseClient.from('duels').update({
        opponent_id: currentUser.id,
        status: 'pending'
      }).eq('id', data.id);
      showToast('🎲 Matched! Check Active Duels');
      switchDuelTab('active');
    } else {
      // No one waiting — create a "looking" duel
      await supabaseClient.from('duels').insert({
        challenger_id: currentUser.id,
        status: 'looking',
        questions: JSON.stringify(getRandomDuelQuestions()),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      });
      showToast('🔍 Waiting for an opponent... check back soon!');
    }
  } catch(e) {
    showToast('❌ ' + e.message);
  }

  if (btn) { btn.disabled = false; btn.textContent = '🔍 Find Opponent'; }
}

async function loadActiveDuels() {
  if (!currentUser) return;
  const container = document.getElementById('duel-active-list');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2);font-size:13px">Loading...</div>';

  try {
    const { data, error } = await supabaseClient
      .from('duels')
      .select('*')
      .or(`challenger_id.eq.${currentUser.id},opponent_id.eq.${currentUser.id}`)
      .in('status', ['pending','challenger_done','opponent_done','complete'])
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    activeDuels = data || [];
    renderActiveDuels();
  } catch(e) {
    if (container) container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text2);font-size:12px">Could not load duels</div>`;
  }
}

function renderActiveDuels() {
  const container = document.getElementById('duel-active-list');
  if (!container) return;

  if (!activeDuels || activeDuels.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px 16px">
        <div style="font-size:40px;margin-bottom:10px">⚔️</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:6px">No active duels</div>
        <div style="font-size:12px;color:var(--text2)">Challenge someone or find a random opponent</div>
      </div>`;
    return;
  }

  container.innerHTML = activeDuels.map(duel => {
    const isChallenger = duel.challenger_id === currentUser.id;
    const myScore    = isChallenger ? duel.challenger_score : duel.opponent_score;
    const theirScore = isChallenger ? duel.opponent_score : duel.challenger_score;
    const myDone     = isChallenger ? duel.status === 'challenger_done' || duel.status === 'complete'
                                    : duel.status === 'opponent_done' || duel.status === 'complete';
    const theirDone  = isChallenger ? duel.status === 'opponent_done' || duel.status === 'complete'
                                    : duel.status === 'challenger_done' || duel.status === 'complete';

    let statusLabel, statusClass, actionBtn = '';
    if (duel.status === 'complete') {
      const won = (myScore || 0) > (theirScore || 0);
      statusLabel = won ? '🏆 You Won!' : '💀 You Lost';
      statusClass = won ? 'duel-status-your-turn' : 'duel-status-done';
    } else if (!myDone) {
      statusLabel = '▶ Your Turn';
      statusClass = 'duel-status-your-turn';
      actionBtn = `<button class="btn btn-primary" style="width:100%;padding:12px;margin-top:10px;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;border:none" onclick="startDuelPlay('${duel.id}')">▶ Play Your Turn</button>`;
    } else {
      statusLabel = 'Waiting for opponent...';
      statusClass = 'duel-status-waiting';
    }

    return `
      <div class="active-duel-card">
        <div class="active-duel-top">
          <div class="active-duel-vs">vs <strong>${isChallenger ? 'Opponent' : 'Challenger'}</strong></div>
          <div class="duel-status-pill ${statusClass}">${statusLabel}</div>
        </div>
        <div class="duel-scores">
          <div class="duel-score-box">
            <div class="duel-score-name">You</div>
            <div class="duel-score-val" style="color:var(--neon-cyan)">${myDone ? (myScore || 0) + '/10' : '—'}</div>
          </div>
          <div class="duel-score-divider">VS</div>
          <div class="duel-score-box">
            <div class="duel-score-name">Opponent</div>
            <div class="duel-score-val" style="color:var(--text2)">${theirDone ? (theirScore || 0) + '/10' : '—'}</div>
          </div>
        </div>
        ${actionBtn}
      </div>`;
  }).join('');
}

function getRandomDuelQuestions() {
  return [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10).map(q => q.q);
}

// Duel play state
let duelPlayState = null;

async function startDuelPlay(duelId) {
  const duel = activeDuels.find(d => d.id === duelId);
  if (!duel) return;

  // Parse questions from the duel record
  let questions;
  try {
    const qKeys = JSON.parse(duel.questions);
    questions = qKeys.map(qText => TRIVIA_QUESTIONS.find(q => q.q === qText)).filter(Boolean);
    if (questions.length < 10) {
      questions = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    }
  } catch(e) {
    questions = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
  }

  duelPlayState = {
    duelId,
    questions,
    qIdx: 0,
    score: 0,
    answers: [],
    timer: null,
    answered: false
  };

  showDuelPlayScreen();
}

function showDuelPlayScreen() {
  // Switch game panel to duel play mode
  const panel = document.getElementById('game-panel-duel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="game-card">
      <div class="trivia-header">
        <div>
          <div class="game-card-title">⚔️ Duel In Progress</div>
          <div id="duel-play-counter" style="font-size:11px;color:var(--text2)">Question 1 of 10</div>
        </div>
        <div>
          <div class="trivia-xp" id="duel-play-score">0</div>
          <div class="trivia-xp-label">score</div>
        </div>
      </div>
      <div class="trivia-progress"><div class="trivia-progress-fill" id="duel-play-fill" style="width:10%"></div></div>
      <div class="trivia-question" id="duel-play-question"></div>
      <div class="trivia-options" id="duel-play-options"></div>
      <div class="trivia-footer">
        <div class="trivia-timer" id="duel-play-timer">20</div>
        <div class="xp-pill">⚡ Speed bonus for fast answers</div>
      </div>
    </div>`;

  renderDuelQuestion();
}

function renderDuelQuestion() {
  if (!duelPlayState) return;
  const { questions, qIdx } = duelPlayState;
  const q = questions[qIdx];

  document.getElementById('duel-play-counter').textContent = `Question ${qIdx + 1} of 10`;
  document.getElementById('duel-play-question').textContent = q.q;
  document.getElementById('duel-play-fill').style.width = ((qIdx + 1) / 10 * 100) + '%';
  document.getElementById('duel-play-timer').textContent = '20';
  document.getElementById('duel-play-timer').className = 'trivia-timer';
  duelPlayState.answered = false;

  document.getElementById('duel-play-options').innerHTML = q.opts.map((o, i) =>
    `<button class="trivia-option" onclick="answerDuelQuestion(this, ${i}, ${q.a})">${o}</button>`
  ).join('');

  clearInterval(duelPlayState.timer);
  let t = 20;
  duelPlayState.timer = setInterval(() => {
    t--;
    const el = document.getElementById('duel-play-timer');
    if (!el) { clearInterval(duelPlayState.timer); return; }
    el.textContent = t;
    if (t <= 5) el.className = 'trivia-timer urgent';
    if (t <= 0) { clearInterval(duelPlayState.timer); if (!duelPlayState.answered) duelTimeOut(); }
  }, 1000);
}

function answerDuelQuestion(btn, chosen, correct) {
  if (!duelPlayState || duelPlayState.answered) return;
  duelPlayState.answered = true;
  clearInterval(duelPlayState.timer);

  const timeLeft = parseInt(document.getElementById('duel-play-timer').textContent) || 0;
  btn.classList.add(chosen === correct ? 'correct' : 'wrong');

  const opts = document.querySelectorAll('#duel-play-options .trivia-option');
  if (chosen !== correct && opts[correct]) opts[correct].classList.add('correct');

  if (chosen === correct) {
    const speedBonus = timeLeft > 15 ? 2 : timeLeft > 8 ? 1 : 0;
    duelPlayState.score += 1;
    duelPlayState.answers.push({ correct: true, time: 20 - timeLeft });
    document.getElementById('duel-play-score').textContent = duelPlayState.score;
  } else {
    duelPlayState.answers.push({ correct: false, time: 20 - timeLeft });
  }

  setTimeout(() => {
    duelPlayState.qIdx++;
    if (duelPlayState.qIdx >= 10) finishDuel();
    else renderDuelQuestion();
  }, 1000);
}

function duelTimeOut() {
  if (!duelPlayState || duelPlayState.answered) return;
  duelPlayState.answered = true;
  duelPlayState.answers.push({ correct: false, time: 20 });
  const q = duelPlayState.questions[duelPlayState.qIdx];
  const opts = document.querySelectorAll('#duel-play-options .trivia-option');
  if (opts[q.a]) opts[q.a].classList.add('correct');
  setTimeout(() => {
    duelPlayState.qIdx++;
    if (duelPlayState.qIdx >= 10) finishDuel();
    else renderDuelQuestion();
  }, 1000);
}

async function finishDuel() {
  if (!duelPlayState) return;
  clearInterval(duelPlayState.timer);

  const { duelId, score } = duelPlayState;
  const duel = activeDuels.find(d => d.id === duelId);
  if (!duel) return;

  const isChallenger = duel.challenger_id === currentUser.id;
  const updateData = isChallenger
    ? { challenger_score: score, status: duel.status === 'opponent_done' ? 'complete' : 'challenger_done' }
    : { opponent_score: score, status: duel.status === 'challenger_done' ? 'complete' : 'opponent_done' };

  try {
    await supabaseClient.from('duels').update(updateData).eq('id', duelId);

    // If duel complete, check winner and award XP
    if (updateData.status === 'complete') {
      const theirScore = isChallenger ? duel.opponent_score : duel.challenger_score;
      const won = score > (theirScore || 0);
      if (won) {
        await awardXP(50, 'duel_win');
        // Record badge win
        await supabaseClient.from('duel_wins').insert({ user_id: currentUser.id, duel_id: duelId, score });
      }
    }
  } catch(e) { /* silent */ }

  // Show result screen
  const panel = document.getElementById('game-panel-duel');
  if (panel) {
    panel.innerHTML = `
      <div class="game-card" style="text-align:center;padding:32px 20px">
        <div style="font-size:52px;margin-bottom:12px">${score >= 7 ? '🏆' : score >= 5 ? '⚔️' : '💪'}</div>
        <div style="font-size:24px;font-weight:900;margin-bottom:6px">Your Score: ${score}/10</div>
        <div style="font-size:14px;color:var(--text2);margin-bottom:20px">Waiting for your opponent to finish...</div>
        <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:14px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;border:none;margin-bottom:10px" onclick="reloadDuelPanel()">← Back to Duels</button>
      </div>`;
  }
  duelPlayState = null;
}

function reloadDuelPanel() {
  const panel = document.getElementById('game-panel-duel');
  if (panel) panel.innerHTML = getDuelPanelHTML();
  switchDuelTab('active');
}

function getDuelPanelHTML() {
  return `
    <div class="duel-hero">
      <div class="duel-hero-emoji">⚔️</div>
      <div class="duel-hero-title">Trivia Duel</div>
      <div class="duel-hero-desc">Challenge someone to 10 questions. 20 seconds each. Winner takes XP and earns a permanent duel badge.</div>
      <div class="duel-stats-grid">
        <div class="duel-stat"><div class="duel-stat-icon">❓</div><div class="duel-stat-val">10</div><div class="duel-stat-label">Questions</div></div>
        <div class="duel-stat"><div class="duel-stat-icon">⏱️</div><div class="duel-stat-val">20s</div><div class="duel-stat-label">Per Q</div></div>
        <div class="duel-stat"><div class="duel-stat-icon">⚡</div><div class="duel-stat-val">+50</div><div class="duel-stat-label">Win XP</div></div>
        <div class="duel-stat"><div class="duel-stat-icon">🏅</div><div class="duel-stat-val">Badge</div><div class="duel-stat-label">Permanent</div></div>
      </div>
    </div>
    <div class="duel-sub-tabs">
      <button class="duel-sub-tab active" id="duel-tab-challenge" onclick="switchDuelTab('challenge')">👤 Challenge</button>
      <button class="duel-sub-tab" id="duel-tab-random" onclick="switchDuelTab('random')">🎲 Random</button>
      <button class="duel-sub-tab" id="duel-tab-active" onclick="switchDuelTab('active')">🔥 Active</button>
    </div>
    <div class="duel-sub-panel active" id="duel-panel-challenge">
      <input class="duel-input" id="duel-challenge-input" placeholder="Enter username to challenge…">
      <button class="btn btn-primary" style="width:100%;padding:14px;border-radius:14px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;border:none;margin-bottom:14px" onclick="sendDuelChallenge()">⚔️ Send Challenge</button>
    </div>
    <div class="duel-sub-panel" id="duel-panel-random">
      <div class="game-card" style="text-align:center;padding:28px 16px">
        <div style="font-size:40px;margin-bottom:12px">🎲</div>
        <div style="font-size:16px;font-weight:800;margin-bottom:6px">Random Matchmaking</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:18px;line-height:1.5">Get matched with anyone online. Winner takes XP from both players.</div>
        <button class="btn btn-gold" id="duel-random-btn" style="width:100%;padding:14px;border-radius:14px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;border:none" onclick="findRandomDuel()">🔍 Find Opponent</button>
      </div>
    </div>
    <div class="duel-sub-panel" id="duel-panel-active">
      <div id="duel-active-list"></div>
      <div class="duel-badges-title">Your Duel Badges</div>
      <div class="duel-badges-grid" id="duel-badges-grid">
        <div class="duel-badge"><div class="duel-badge-icon">🥇</div><div class="duel-badge-name">First Win</div></div>
        <div class="duel-badge"><div class="duel-badge-icon">🔥</div><div class="duel-badge-name">3 Win Streak</div></div>
        <div class="duel-badge"><div class="duel-badge-icon">💀</div><div class="duel-badge-name">5 Win Streak</div></div>
        <div class="duel-badge"><div class="duel-badge-icon">⚡</div><div class="duel-badge-name">Speed Demon</div></div>
        <div class="duel-badge"><div class="duel-badge-icon">🧠</div><div class="duel-badge-name">Perfect Score</div></div>
        <div class="duel-badge"><div class="duel-badge-icon">👑</div><div class="duel-badge-name">10 Wins</div></div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════
// PREDICTIONS
// ══════════════════════════════════════════════
let PRED_PROPOSITIONS = [
  { text: "Frog and Peach will have a line out the door", diff: "easy", confirm: "auto" },
  { text: "Someone in the group will lose something tonight", diff: "medium", confirm: "vote" },
  { text: "It will rain before midnight", diff: "easy", confirm: "auto" },
  { text: "The group ends up at Bull's Tavern by 1am", diff: "medium", confirm: "vote" },
  { text: "Someone gets turned away at a door", diff: "hard", confirm: "vote" },
  { text: "There will be a birthday group at the first bar", diff: "easy", confirm: "vote" },
  { text: "Someone leaves the group before midnight", diff: "medium", confirm: "vote" },
  { text: "The group gets a free round", diff: "hard", confirm: "vote" },
  { text: "The busiest bar on Higuera has a 20+ min wait", diff: "medium", confirm: "auto" },
  { text: "Someone orders a shot for the whole group", diff: "easy", confirm: "vote" },
  { text: "A stranger joins your group for at least one bar", diff: "medium", confirm: "vote" },
  { text: "The last bar you visit is still packed at 1:30am", diff: "hard", confirm: "auto" },
];

// ── LOAD PROPOSITIONS FROM SUPABASE ──
async function loadPropositions() {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabaseClient
      .from('propositions')
      .select('*')
      .eq('active', true)
      .or(`end_at.is.null,end_at.gt.${now}`)
      .order('created_at', { ascending: true });
    if (error || !data || !data.length) return;
    PRED_PROPOSITIONS = data.map(r => ({
      id: r.id,
      text: r.text,
      diff: r.difficulty || 'medium',
      confirm: r.confirm_method || 'vote'
    }));
    predState.picks = {};
    renderPredictions();
  } catch(e) { /* silent — use fallback */ }
}

let predState = {
  entryType: 'power',  // 'power' or 'flex'
  pickCount: 3,        // 3 or 5
  mode: 'solo',        // 'solo', 'duel', 'group'
  picks: {},           // { propIndex: 'will' | 'wont' }
  customProps: [],
  submitted: false,
};

const PRED_MULTIPLIERS = {
  power: { 3: 3, 5: 8 },
  flex:  { 3: 1.5, 5: 2 }
};

function setPredEntryType(type) {
  predState.entryType = type;
  predState.picks = {};
  document.querySelectorAll('.pred-entry-type').forEach(b => b.classList.remove('selected'));
  const el = document.getElementById('pred-type-' + type);
  if (el) el.classList.add('selected');
  updatePredMultiplier();
  renderPredictions();
}

function setPredPickCount(count) {
  predState.pickCount = count;
  predState.picks = {};
  document.querySelectorAll('.pred-picks-btn').forEach(b => b.classList.remove('selected'));
  const el = document.getElementById('pred-picks-' + count);
  if (el) el.classList.add('selected');
  updatePredMultiplier();
  renderPredictions();
}

function setPredMode(mode) {
  predState.mode = mode;
  document.querySelectorAll('.pred-mode-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('pred-mode-' + mode);
  if (el) el.classList.add('active');

  const duelRow = document.getElementById('pred-duel-row');
  const groupRow = document.getElementById('pred-group-row');
  if (duelRow) duelRow.style.display = mode === 'duel' ? 'block' : 'none';
  if (groupRow) groupRow.style.display = mode === 'group' ? 'block' : 'none';
}

function updatePredMultiplier() {
  const mult = PRED_MULTIPLIERS[predState.entryType][predState.pickCount];
  const el = document.getElementById('pred-multiplier-val');
  const sub = document.getElementById('pred-multiplier-sub');
  const costEl = document.getElementById('pred-xp-cost');

  if (el) el.textContent = mult + 'x';

  // XP cost = 10 XP per pick as the wager
  const cost = predState.pickCount * 10;
  if (costEl) costEl.textContent = `Entry costs ${cost} XP · win ${Math.round(cost * mult)} XP`;

  if (sub) {
    if (predState.entryType === 'flex') {
      const partialMult = predState.pickCount === 3 ? '1.5x if 2/3' : '2x if 4/5 · 0.5x if 3/5';
      sub.textContent = `Flex: ${partialMult} correct`;
    } else {
      sub.textContent = `Power: all ${predState.pickCount} must be correct`;
    }
  }
}

function pickPred(idx, choice) {
  if (predState.submitted) return;
  const currentPicks = Object.keys(predState.picks).length;

  if (predState.picks[idx] === choice) {
    // Deselect
    delete predState.picks[idx];
  } else if (predState.picks[idx]) {
    // Switch choice
    predState.picks[idx] = choice;
  } else if (currentPicks < predState.pickCount) {
    // New pick
    predState.picks[idx] = choice;
  } else {
    showToast(`⚠️ You can only pick ${predState.pickCount} propositions`);
    return;
  }
  renderPredictions();
}

function addCustomPrediction() {
  const input = document.getElementById('pred-custom-input');
  const val = input ? input.value.trim() : '';
  if (!val) return;
  if (val.length > 80) { showToast('⚠️ Keep it under 80 characters'); return; }
  predState.customProps.push(val);
  input.value = '';
  renderPredictions();
}

function renderPredictions() {
  const list = document.getElementById('pred-props-list');
  const countEl = document.getElementById('pred-picked-count');
  if (!list) return;

  const allProps = [
    ...PRED_PROPOSITIONS,
    ...predState.customProps.map(t => ({ text: t, diff: 'custom', confirm: 'vote' }))
  ];

  const pickedCount = Object.keys(predState.picks).length;
  if (countEl) {
    countEl.innerHTML = `<span>${pickedCount}</span> / ${predState.pickCount} picked`;
  }

  list.innerHTML = allProps.map((prop, i) => {
    const choice = predState.picks[i];
    let cls = 'pred-prop';
    if (choice === 'will') cls += ' picked-will';
    if (choice === 'wont') cls += ' picked-wont';
    const locked = !choice && pickedCount >= predState.pickCount;
    if (locked) cls += ' locked';

    return `
      <div class="${cls}">
        <div class="pred-prop-text">${prop.text}</div>
        <div class="pred-prop-diff-row">
          <span class="pred-diff-badge pred-diff-${prop.diff}">${prop.diff}</span>
          <span class="pred-confirm-by">Confirmed by: ${prop.confirm === 'auto' ? '🤖 auto' : '🗳️ vote'}</span>
        </div>
        <div class="pred-choice-row">
          <button class="pred-choice-btn ${choice === 'will' ? 'will' : ''}" onclick="pickPred(${i}, 'will')">✅ Will Happen</button>
          <button class="pred-choice-btn ${choice === 'wont' ? 'wont' : ''}" onclick="pickPred(${i}, 'wont')">❌ Won't Happen</button>
        </div>
      </div>`;
  }).join('');
}

async function submitPredictions() {
  const pickedCount = Object.keys(predState.picks).length;
  if (pickedCount < predState.pickCount) {
    showToast(`⚠️ Pick ${predState.pickCount} propositions first`);
    return;
  }
  if (!currentUser) { showToast('⚠️ Sign in to submit predictions'); return; }

  const lockTime = getLockTime();
  if (new Date() > lockTime) { showToast('🔒 Predictions are locked for tonight'); return; }

  const allProps = [
    ...PRED_PROPOSITIONS,
    ...predState.customProps.map(t => ({ text: t, diff: 'custom', confirm: 'vote' }))
  ];

  const picks = Object.entries(predState.picks).map(([idx, choice]) => ({
    proposition: allProps[parseInt(idx)].text,
    choice
  }));

  try {
    const { error } = await supabaseClient.from('predictions').insert({
      user_id: currentUser.id,
      entry_type: predState.entryType,
      pick_count: predState.pickCount,
      mode: predState.mode,
      picks: JSON.stringify(picks),
      multiplier: PRED_MULTIPLIERS[predState.entryType][predState.pickCount],
      locked_at: new Date().toISOString(),
      night_date: getNightDate(),
    });
    if (error) throw error;
    predState.submitted = true;
    showToast(`🔮 ${pickedCount} predictions locked in!`);
    renderPredictions();
  } catch(e) {
    showToast('❌ ' + e.message);
  }
}

function getLockTime() {
  const now = new Date();
  const lock = new Date(now);
  lock.setHours(21, 0, 0, 0); // 9pm
  return lock;
}

function getNightDate() {
  const now = new Date();
  // Nights after midnight still count as previous calendar date
  if (now.getHours() < 6) now.setDate(now.getDate() - 1);
  return now.toISOString().slice(0, 10);
}

function getLockCountdown() {
  const now = new Date();
  const lock = getLockTime();
  if (now > lock) return null;
  const diff = lock - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

// ── INIT GAMES PAGE ──
function initGamesPage() {
  // Show grid, hide all panels
  backToGamesGrid();
  // Pre-load data in background
  loadTriviaQuestions();
  loadPropositions();
  // Update lock countdown
  const countdownEl = document.getElementById('pred-countdown');
  const countdown = getLockCountdown();
  if (countdownEl) {
    countdownEl.textContent = countdown
      ? `🔒 Predictions lock in ${countdown}`
      : '🔒 Predictions are locked for tonight';
  }
}

// ── GROUP PREDICTION PLAYER MANAGEMENT ──
let groupPlayers = [];

function addGroupPlayer() {
  const input = document.getElementById('pred-group-input');
  const val = input ? input.value.trim() : '';
  if (!val) return;
  if (groupPlayers.length >= 9) { showToast('⚠️ Max 10 players (including you)'); return; }
  if (groupPlayers.includes(val)) { showToast('⚠️ Already added'); return; }
  groupPlayers.push(val);
  input.value = '';
  renderGroupPlayers();
}

function removeGroupPlayer(name) {
  groupPlayers = groupPlayers.filter(p => p !== name);
  renderGroupPlayers();
}

function renderGroupPlayers() {
  const list = document.getElementById('pred-group-list');
  if (!list) return;
  list.innerHTML = groupPlayers.map(p => `
    <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(180,79,255,0.1);border:1px solid var(--accent);border-radius:20px;padding:4px 10px;font-size:12px;font-weight:700">
      ${p}
      <span onclick="removeGroupPlayer('${p}')" style="cursor:pointer;color:var(--neon-pink);margin-left:2px">×</span>
    </div>`).join('');
}

// ── BINGO MULTIPLAYER ──
let bingoPendingInvites = [];

async function sendBingoInvite() {
  const input = document.getElementById('bingo-invite-input');
  const username = input ? input.value.trim() : '';
  if (!username) { showToast('⚠️ Enter a username'); return; }
  if (!currentUser) { showToast('⚠️ Sign in to invite friends'); return; }
  try {
    const { data, error } = await supabaseClient
      .from('profiles').select('id,username').eq('username', username).single();
    if (error || !data) { showToast('❌ Player not found'); return; }
    if (data.id === currentUser.id) { showToast('❌ That is you!'); return; }
    await supabaseClient.from('bingo_games').insert({
      host_id: currentUser.id,
      guest_id: data.id,
      status: 'invited',
      created_at: new Date().toISOString(),
    });
    bingoPendingInvites.push(username);
    if (input) input.value = '';
    showToast(`🎱 Invite sent to ${username}!`);
    renderBingoInviteList();
  } catch(e) { showToast('❌ ' + e.message); }
}

function renderBingoInviteList() {
  const el = document.getElementById('bingo-invite-list');
  if (!el) return;
  if (!bingoPendingInvites.length) { el.innerHTML = ''; return; }
  el.innerHTML = bingoPendingInvites.map(u =>
    `<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;color:var(--neon-green);margin:3px">${u} ✓</div>`
  ).join('');
}
