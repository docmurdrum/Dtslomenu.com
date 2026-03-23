// ══════════════════════════════════════════════
// PARTY_GAMES.JS — Beer Pong, Never Have I Ever, Who Am I
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// BEER PONG TRACKER
// ══════════════════════════════════════════════
let bpTeam1 = { name: 'Team 1', cups: 10, color: '#ff2d78' };
let bpTeam2 = { name: 'Team 2', cups: 10, color: '#00f5ff' };
let bpTurn  = 1; // 1 or 2
let bpHistory = [];

function initBeerPong() {
  bpTeam1 = { name: 'Team 1', cups: 10, color: '#ff2d78' };
  bpTeam2 = { name: 'Team 2', cups: 10, color: '#00f5ff' };
  bpTurn  = 1;
  bpHistory = [];
  renderBeerPong();
}

function renderBeerPong() {
  const panel = document.getElementById('game-panel-beerpong');
  if (!panel) return;

  const winner = bpTeam1.cups === 0 ? bpTeam1.name : bpTeam2.cups === 0 ? bpTeam2.name : null;

  panel.innerHTML = `
    <button class="game-back-btn" onclick="backToGamesGrid()">← Back to Games</button>
    <div class="game-card">
      <div class="game-card-title">🏓 Beer Pong Tracker</div>

      ${winner ? `
        <div style="text-align:center;padding:20px">
          <div style="font-size:48px;margin-bottom:12px">🏆</div>
          <div style="font-size:22px;font-weight:900;margin-bottom:8px">${winner} Wins!</div>
          <button class="btn btn-gold" style="margin-top:8px" onclick="initBeerPong()">🔄 New Game</button>
        </div>
      ` : `
        <div style="font-size:12px;color:var(--text2);text-align:center;margin-bottom:16px">
          ${bpTurn === 1 ? bpTeam1.name : bpTeam2.name}'s turn to shoot
        </div>

        <!-- Team names -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <input class="form-input" value="${bpTeam1.name}" onchange="bpTeam1.name=this.value;renderBeerPong()" style="text-align:center;font-weight:800;font-size:13px">
          <input class="form-input" value="${bpTeam2.name}" onchange="bpTeam2.name=this.value;renderBeerPong()" style="text-align:center;font-weight:800;font-size:13px">
        </div>

        <!-- Cup racks -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
          ${renderCupRack(1, bpTeam1)}
          ${renderCupRack(2, bpTeam2)}
        </div>

        <!-- Score -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;text-align:center">
          <div>
            <div style="font-size:28px;font-weight:900;color:${bpTeam1.color}">${bpTeam1.cups}</div>
            <div style="font-size:10px;color:var(--text2);font-weight:700">CUPS LEFT</div>
          </div>
          <div>
            <div style="font-size:28px;font-weight:900;color:${bpTeam2.color}">${bpTeam2.cups}</div>
            <div style="font-size:10px;color:var(--text2);font-weight:700">CUPS LEFT</div>
          </div>
        </div>

        <!-- Hit buttons -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <button class="btn btn-primary" style="background:${bpTeam2.color};color:#000;font-weight:800"
            onclick="bpHit(2)" ${bpTurn !== 1 || bpTeam2.cups === 0 ? 'disabled' : ''}>
            🎯 Hit ${bpTeam2.name}
          </button>
          <button class="btn btn-primary" style="background:${bpTeam1.color};color:#fff;font-weight:800"
            onclick="bpHit(1)" ${bpTurn !== 2 || bpTeam1.cups === 0 ? 'disabled' : ''}>
            🎯 Hit ${bpTeam1.name}
          </button>
        </div>

        <button class="btn btn-ghost btn-sm" style="width:100%" onclick="bpUndo()">↺ Undo Last</button>
      `}
    </div>

    <!-- History -->
    ${bpHistory.length ? `
    <div class="game-card" style="margin-top:10px">
      <div class="game-card-title">📋 Game Log</div>
      <div style="font-size:11px;color:var(--text2);line-height:1.8">
        ${bpHistory.slice(-8).reverse().map(h => `<div>${h}</div>`).join('')}
      </div>
    </div>` : ''}
  `;
}

function renderCupRack(team, teamData) {
  // Triangle: 4-3-2-1 = 10 cups
  const rows = [[0],[1,2],[3,4,5],[6,7,8,9]];
  const cupsRemaining = new Set(Array.from({length:teamData.cups}, (_,i) => i));
  const cupsHit       = new Set(Array.from({length:10-teamData.cups}, (_,i) => i));

  return `<div style="text-align:center">
    <div style="font-size:11px;font-weight:700;color:${teamData.color};margin-bottom:8px">${teamData.name}</div>
    ${rows.map(row =>
      `<div style="display:flex;justify-content:center;gap:4px;margin-bottom:4px">
        ${row.map(idx => {
          const hit = idx >= teamData.cups;
          return `<div style="width:28px;height:28px;border-radius:50%;
            background:${hit ? 'var(--surface2)' : teamData.color};
            border:2px solid ${hit ? 'var(--border)' : teamData.color};
            opacity:${hit ? 0.3 : 1};
            transition:all 0.2s"></div>`;
        }).join('')}
      </div>`
    ).join('')}
  </div>`;
}

function bpHit(targetTeam) {
  const team = targetTeam === 1 ? bpTeam1 : bpTeam2;
  if (team.cups <= 0) return;
  bpHistory.push(`${bpTurn === 1 ? bpTeam1.name : bpTeam2.name} hit ${team.name} (${team.cups - 1} cups left)`);
  team.cups--;
  bpTurn = bpTurn === 1 ? 2 : 1;
  renderBeerPong();
}

function bpUndo() {
  if (!bpHistory.length) return;
  bpHistory.pop();
  // Rebuild from scratch by counting hits
  initBeerPong();
  bpHistory = [];
  showToast('↺ Last action undone — game reset');
}

// ══════════════════════════════════════════════
// NEVER HAVE I EVER
// ══════════════════════════════════════════════
const NHIE_CARDS = [
  "Never have I ever snuck into a bar",
  "Never have I ever texted an ex after midnight",
  "Never have I ever done a keg stand",
  "Never have I ever been kicked out of a bar",
  "Never have I ever lied about my age to get in somewhere",
  "Never have I ever lost my phone on a night out",
  "Never have I ever woken up not knowing how I got home",
  "Never have I ever kissed someone whose name I didn't know",
  "Never have I ever spent more than $100 in one night out",
  "Never have I ever started a bar fight",
  "Never have I ever gotten lost on Higuera Street",
  "Never have I ever done a shot at every bar on the strip",
  "Never have I ever been the person who rallied the whole group",
  "Never have I ever fallen asleep at a party",
  "Never have I ever ordered food at 2am after going out",
  "Never have I ever danced on a table",
  "Never have I ever used someone else's fake ID",
  "Never have I ever called in sick after a Thursday night",
  "Never have I ever cried in a bar bathroom",
  "Never have I ever made a friend waiting in line",
  "Never have I ever gone to a bar alone",
  "Never have I ever started a tab and forgotten to close it",
  "Never have I ever pretended to know someone to skip the line",
  "Never have I ever convinced the DJ to play my song",
  "Never have I ever lost a shoe on a night out",
];

let nhieIndex = 0;
let nhieShuffled = [];

function initNHIE() {
  nhieShuffled = [...NHIE_CARDS].sort(() => Math.random() - 0.5);
  nhieIndex = 0;
  renderNHIE();
}

function renderNHIE() {
  const panel = document.getElementById('game-panel-nhie');
  if (!panel) return;
  const card = nhieShuffled[nhieIndex] || 'No more cards!';
  const progress = `${nhieIndex + 1} / ${nhieShuffled.length}`;

  panel.innerHTML = `
    <button class="game-back-btn" onclick="backToGamesGrid()">← Back to Games</button>
    <div class="game-card" style="text-align:center">
      <div class="game-card-title">🍺 Never Have I Ever</div>
      <div style="font-size:10px;color:var(--text2);margin-bottom:20px">${progress}</div>

      <div class="nhie-card-wrap" onclick="nhieNext()">
        <div class="nhie-card">
          <div style="font-size:32px;margin-bottom:14px">🙋</div>
          <div style="font-size:17px;font-weight:800;line-height:1.4">${card}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:16px">If you HAVE → take a sip</div>
        </div>
        <div style="font-size:12px;color:var(--text2);margin-top:12px">Tap to next card</div>
      </div>

      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-ghost" style="flex:1" onclick="nhiePrev()">← Prev</button>
        <button class="btn btn-primary" style="flex:2" onclick="nhieNext()">Next →</button>
        <button class="btn btn-ghost" style="flex:1" onclick="initNHIE()">🔀</button>
      </div>
    </div>
  `;
}

function nhieNext() {
  if (nhieIndex < nhieShuffled.length - 1) nhieIndex++;
  else nhieIndex = 0;
  renderNHIE();
}

function nhiePrev() {
  if (nhieIndex > 0) nhieIndex--;
  renderNHIE();
}

// ══════════════════════════════════════════════
// WHO AM I
// ══════════════════════════════════════════════
const WHO_AM_I_GENERAL = [
  "Taylor Swift","The Pope","Elon Musk","Beyoncé","Barack Obama","Shrek","Batman","Santa Claus",
  "Albert Einstein","Marilyn Monroe","Mickey Mouse","Oprah Winfrey","Harry Potter","LeBron James",
  "Lady Gaga","Donald Trump","Darth Vader","Michael Jordan","Rihanna","The Rock","Jeff Bezos",
  "Kim Kardashian","Spider-Man","Queen Elizabeth","Kanye West","Adele","Drake","Eminem",
];

const WHO_AM_I_SLO = [
  "A Cal Poly Mustang","The Frog & Peach bartender","A downtown SLO bouncer","A Thursday night regular",
  "The Fake ID Phantom","The Shot Caller","The Line Whisperer","The Uber Summoner",
  "A Bishop Peak hiker","The Bar Radar","The Pre-Game Prophet","The Group Chat General",
  "A Cal Poly professor","A SLO Farmer's Market vendor","The Karaoke Demon","The Freshman",
];

let waiDeck     = 'general';
let waiCard     = null;
let waiPlayers  = [];
let waiCurrentP = 0;
let waiQCount   = 0;
let waiGameMode = 'solo'; // solo or pass

function initWhoAmI() {
  waiCard     = null;
  waiQCount   = 0;
  waiCurrentP = 0;
  renderWhoAmI();
}

function renderWhoAmI() {
  const panel = document.getElementById('game-panel-whoami');
  if (!panel) return;

  if (!waiCard) {
    // Setup screen
    panel.innerHTML = `
      <button class="game-back-btn" onclick="backToGamesGrid()">← Back to Games</button>
      <div class="game-card" style="text-align:center">
        <div class="game-card-title">🤔 Who Am I?</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:20px;line-height:1.5">
          A card is placed on your head. Ask yes/no questions to figure out who you are.
        </div>

        <div style="display:flex;gap:8px;margin-bottom:16px">
          <button class="dice-mode-btn ${waiDeck==='general'?'active':''}" onclick="waiDeck='general';renderWhoAmI()">🌍 General</button>
          <button class="dice-mode-btn ${waiDeck==='slo'?'active':''}" onclick="waiDeck='slo';renderWhoAmI()">📍 SLO</button>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:20px">
          <button class="dice-mode-btn ${waiGameMode==='solo'?'active':''}" onclick="waiGameMode='solo';renderWhoAmI()">👤 Solo</button>
          <button class="dice-mode-btn ${waiGameMode==='pass'?'active':''}" onclick="waiGameMode='pass';renderWhoAmI()">📱 Pass Phone</button>
        </div>

        <button class="dice-roll-btn" onclick="waiDeal()">🎴 Deal Card</button>
      </div>
    `;
  } else {
    // Game screen — card is on player's head
    const deck = waiDeck === 'slo' ? WHO_AM_I_SLO : WHO_AM_I_GENERAL;
    panel.innerHTML = `
      <button class="game-back-btn" onclick="backToGamesGrid()">← Back to Games</button>
      <div class="game-card" style="text-align:center">
        <div class="game-card-title">🤔 Who Am I?</div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Questions asked: ${waiQCount}</div>

        <!-- The card (shown to everyone except the guesser) -->
        <div style="background:linear-gradient(135deg,var(--accent),var(--neon-pink));border-radius:20px;padding:32px 20px;margin:16px 0;position:relative">
          <div style="font-size:14px;font-weight:800;color:rgba(255,255,255,0.8);margin-bottom:8px;text-transform:uppercase;letter-spacing:2px">You Are...</div>
          <div style="font-size:26px;font-weight:900;color:white;line-height:1.3">${waiCard}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:12px">Hold phone against forehead to hide the card from yourself</div>
        </div>

        <div style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.5">
          Ask yes/no questions. Your friends can only say <strong>Yes</strong>, <strong>No</strong>, or <strong>Sometimes</strong>.
        </div>

        <div style="display:flex;gap:8px;margin-bottom:8px">
          <button class="btn btn-ghost" style="flex:1" onclick="waiQCount++;renderWhoAmI()">+1 Question</button>
          <button class="btn btn-primary" style="flex:1;background:var(--neon-green);color:#000" onclick="waiGuessed()">✅ I Know!</button>
        </div>
        <button class="btn btn-ghost" style="width:100%;margin-top:4px" onclick="waiDeal()">🔀 New Card</button>
      </div>
    `;
  }
}

function waiDeal() {
  const deck = waiDeck === 'slo' ? WHO_AM_I_SLO : WHO_AM_I_GENERAL;
  waiCard   = deck[Math.floor(Math.random() * deck.length)];
  waiQCount = 0;
  renderWhoAmI();
}

function waiGuessed() {
  const correct = confirm(`Was it: ${waiCard}?`);
  showToast(correct ? `✅ Correct! You are ${waiCard}!` : `❌ Not quite! You are ${waiCard}`);
  gainXP(correct ? 20 : 5);
  waiCard = null;
  renderWhoAmI();
}
