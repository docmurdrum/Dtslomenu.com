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

// ══════════════════════════════════════════════
// HOT TAKES
// ══════════════════════════════════════════════
const HOT_TAKES = [
  "Tequila is better than vodka",
  "Beer before liquor never been sicker is a myth",
  "Cover charges are never worth it",
  "DJ sets are better than live bands at bars",
  "Thursday is the best night out in SLO",
  "The bar scene peaks before midnight",
  "Shots should always be taken together",
  "Open bars ruin the vibe",
  "Karaoke bars are the most fun",
  "The best conversations happen at closing time",
  "Dive bars beat trendy bars every time",
  "You should always close your tab immediately",
  "Drinking games bring people together",
  "The line outside means it's worth going in",
  "House music is better than hip hop at bars",
  "Splitting the bill equally is fair even if you drank less",
  "Leaving early ruins the night",
  "You can tell a lot about someone by what they order",
  "Bar food hits different after midnight",
  "The best nights are unplanned",
];

let hottakesIndex = 0;
let hottakesShuffled = [];
let hottakesVotes = { agree: 0, disagree: 0 };
let hottakesUserVoted = false;

function initHotTakes() {
  hottakesShuffled = [...HOT_TAKES].sort(() => Math.random() - 0.5);
  hottakesIndex = 0;
  hottakesShowCard();
}

function hottakesShowCard() {
  const card     = document.getElementById('hottakes-card');
  const progress = document.getElementById('hottakes-progress');
  const btns     = document.getElementById('hottakes-btns');
  const votes    = document.getElementById('hottakes-votes');
  const nextBtn  = document.getElementById('hottakes-next-btn');
  if (!card) return;

  hottakesVotes = { agree: 0, disagree: 0 };
  hottakesUserVoted = false;

  card.textContent = hottakesShuffled[hottakesIndex] || 'Out of takes!';
  if (progress) progress.textContent = (hottakesIndex + 1) + ' / ' + hottakesShuffled.length;
  if (btns) btns.style.display = 'flex';
  if (votes) votes.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';

  // Reset button styles
  document.querySelectorAll('.hottakes-vote-btn').forEach(b => b.classList.remove('selected'));
}

function hottakesVote(side) {
  if (hottakesUserVoted) return;
  hottakesUserVoted = true;
  hottakesVotes[side]++;

  // Simulate group votes
  const otherSide = side === 'agree' ? 'disagree' : 'agree';
  hottakesVotes[otherSide] += Math.floor(Math.random() * 4) + 1;
  hottakesVotes[side]      += Math.floor(Math.random() * 3);

  const btn = document.querySelector('.hottakes-vote-btn.' + side);
  if (btn) btn.classList.add('selected');

  hottakesRevealVotes();
}

function hottakesRevealVotes() {
  if (!hottakesUserVoted) return;
  const votes   = document.getElementById('hottakes-votes');
  const btns    = document.getElementById('hottakes-btns');
  const nextBtn = document.getElementById('hottakes-next-btn');
  const total   = hottakesVotes.agree + hottakesVotes.disagree || 1;
  const agreePct   = Math.round(hottakesVotes.agree / total * 100);
  const disagreePct = 100 - agreePct;

  if (votes) {
    votes.style.display = 'block';
    votes.innerHTML = `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-bottom:4px">
          <span style="color:#ff2d78">🔥 Agree ${agreePct}%</span>
          <span style="color:#00f5ff">❄️ Disagree ${disagreePct}%</span>
        </div>
        <div style="background:var(--surface2);border-radius:8px;overflow:hidden;height:10px">
          <div style="height:100%;background:linear-gradient(90deg,#ff2d78,#b44fff);width:${agreePct}%;transition:width 0.6s;border-radius:8px"></div>
        </div>
      </div>`;
  }
  if (btns) btns.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'block';
}

function hottakesNext() {
  hottakesIndex++;
  if (hottakesIndex >= hottakesShuffled.length) {
    hottakesIndex = 0;
    hottakesShuffled = [...HOT_TAKES].sort(() => Math.random() - 0.5);
  }
  hottakesShowCard();
}

// ══════════════════════════════════════════════
// ICE BREAKERS
// ══════════════════════════════════════════════
const ICE_BREAKERS = [
  "What's the most embarrassing thing that's happened to you at a bar?",
  "What's your go-to karaoke song?",
  "If you had to drink one thing all night what would it be?",
  "What's the worst hangover story you have?",
  "Who in this group would last longest in a dance battle?",
  "What's your unpopular opinion about going out?",
  "Best bar you've ever been to and why?",
  "What's a skill nobody in this group knows you have?",
  "What song instantly gets you on the dance floor?",
  "What's the most SLO thing you've ever done?",
  "Rate your tolerance on a scale of 1 to 10 honestly",
  "What's your drunk food order?",
  "Would you rather: open bar all night or VIP section?",
  "What's the best night out you've ever had?",
  "Who do you always text when you're drunk?",
  "What's your bar alter ego name?",
  "Funniest thing you've witnessed at a bar?",
  "What's your biggest green flag in someone you meet at a bar?",
  "If this group had a band what would it be called?",
  "What would you do with $1000 to spend tonight?",
];

let icebreakerIndex = 0;
let icebreakerShuffled = [];

function initIceBreakers() {
  icebreakerShuffled = [...ICE_BREAKERS].sort(() => Math.random() - 0.5);
  icebreakerIndex = 0;
  icebreakerShowCard();
}

function icebreakerShowCard() {
  const text     = document.getElementById('icebreaker-text');
  const progress = document.getElementById('icebreaker-progress');
  if (text)     text.textContent = icebreakerShuffled[icebreakerIndex] || 'Out of questions!';
  if (progress) progress.textContent = (icebreakerIndex + 1) + ' of ' + icebreakerShuffled.length;
}

function icebreakerNext() {
  icebreakerIndex++;
  if (icebreakerIndex >= icebreakerShuffled.length) {
    icebreakerIndex = 0;
    icebreakerShuffle();
    return;
  }
  icebreakerShowCard();
}

function icebreakerShuffle() {
  icebreakerShuffled = [...ICE_BREAKERS].sort(() => Math.random() - 0.5);
  icebreakerIndex = 0;
  icebreakerShowCard();
}

// ══════════════════════════════════════════════
// THE RANKING
// ══════════════════════════════════════════════
const RANKING_PROMPTS = [
  "Most likely to text their ex tonight",
  "Most likely to be the last one standing",
  "Most likely to challenge a stranger to a game",
  "Most likely to end up on a bar's Instagram",
  "Best dancer in the group",
  "Most likely to make a new best friend tonight",
  "Most likely to lose their phone",
  "Most likely to convince everyone to stay out later",
  "Most likely to order the weirdest drink",
  "Biggest lightweight",
  "Most likely to start a conversation with anyone",
  "Most likely to be remembered by the bartender",
  "Who would survive a zombie apocalypse longest",
  "Most likely to wake up with a great story",
  "Best wingman/wingwoman",
];

let rankingPrompt   = '';
let rankingPlayers  = [];
let rankingVoterIdx = 0;
let rankingAllVotes = [];
let rankingCurrentOrder = [];

function initRanking() {
  rankingNewPrompt();
}

function rankingNewPrompt() {
  const p = RANKING_PROMPTS[Math.floor(Math.random() * RANKING_PROMPTS.length)];
  rankingPrompt = p;
  const display = document.getElementById('ranking-prompt-display');
  if (display) display.textContent = '"' + p + '"';
}

function rankingStart() {
  const input = document.getElementById('ranking-players-input');
  if (!input) return;
  rankingPlayers = input.value.split('\n').map(s => s.trim()).filter(Boolean);
  if (rankingPlayers.length < 2) { showToast('⚠️ Enter at least 2 players'); return; }

  rankingVoterIdx  = 0;
  rankingAllVotes  = [];
  rankingCurrentOrder = [...rankingPlayers];

  document.getElementById('ranking-setup').style.display        = 'none';
  document.getElementById('ranking-vote-section').style.display = 'block';
  document.getElementById('ranking-results-section').style.display = 'none';
  rankingShowVoter();
}

function rankingShowVoter() {
  const voterLabel  = document.getElementById('ranking-voter-label');
  const promptLabel = document.getElementById('ranking-prompt-label');
  const list        = document.getElementById('ranking-player-list');
  if (!list) return;

  const voter = rankingPlayers[rankingVoterIdx];
  if (voterLabel)  voterLabel.textContent  = voter + "'s turn to rank:";
  if (promptLabel) promptLabel.textContent = rankingPrompt;

  rankingCurrentOrder = [...rankingPlayers].sort(() => Math.random() - 0.5);

  list.innerHTML = rankingCurrentOrder.map((p, i) => `
    <div class="ranking-player-row" id="rrow-${i}" draggable="true"
      ondragstart="rankingDragStart(${i})" ondragover="rankingDragOver(event,${i})" ondrop="rankingDrop(${i})">
      <div class="ranking-rank-num">${i + 1}</div>
      <div class="ranking-player-name">${p}</div>
      <div class="ranking-drag-handle">⠿</div>
    </div>`).join('');
}

let rankingDragSrc = null;
function rankingDragStart(i) { rankingDragSrc = i; }
function rankingDragOver(e, i) { e.preventDefault(); }
function rankingDrop(i) {
  if (rankingDragSrc === null || rankingDragSrc === i) return;
  const tmp = rankingCurrentOrder[rankingDragSrc];
  rankingCurrentOrder.splice(rankingDragSrc, 1);
  rankingCurrentOrder.splice(i, 0, tmp);
  rankingShowVoterOrder();
  rankingDragSrc = null;
}
function rankingShowVoterOrder() {
  const list = document.getElementById('ranking-player-list');
  if (!list) return;
  list.innerHTML = rankingCurrentOrder.map((p, i) => `
    <div class="ranking-player-row" id="rrow-${i}" draggable="true"
      ondragstart="rankingDragStart(${i})" ondragover="rankingDragOver(event,${i})" ondrop="rankingDrop(${i})">
      <div class="ranking-rank-num">${i + 1}</div>
      <div class="ranking-player-name">${p}</div>
      <div class="ranking-drag-handle">⠿</div>
    </div>`).join('');
}

function rankingSubmitVote() {
  rankingAllVotes.push([...rankingCurrentOrder]);
  rankingVoterIdx++;
  if (rankingVoterIdx >= rankingPlayers.length) {
    rankingShowResults();
  } else {
    rankingShowVoter();
  }
}

function rankingShowResults() {
  document.getElementById('ranking-vote-section').style.display    = 'none';
  document.getElementById('ranking-results-section').style.display = 'block';

  const titleEl = document.getElementById('ranking-results-title');
  const listEl  = document.getElementById('ranking-results-list');
  if (titleEl) titleEl.textContent = 'Results: "' + rankingPrompt + '"';

  // Tally scores — lower rank = better
  const scores = {};
  rankingPlayers.forEach(p => scores[p] = 0);
  rankingAllVotes.forEach(vote => {
    vote.forEach((p, i) => { scores[p] += i + 1; });
  });

  const sorted = [...rankingPlayers].sort((a, b) => scores[a] - scores[b]);
  const medals = ['👑','🥈','🥉'];
  const colors = ['var(--gold)','#c0c0c0','#cd7f32'];

  if (listEl) {
    listEl.innerHTML = sorted.map((p, i) => `
      <div class="ranking-result-row">
        <div style="font-size:20px;width:28px">${medals[i] || '#' + (i+1)}</div>
        <div style="flex:1;font-size:15px;font-weight:800;color:${colors[i]||'var(--text)'}">${p}</div>
        <div style="font-size:12px;color:var(--text2)">${rankingAllVotes.length} votes</div>
      </div>`).join('');
  }
}

function rankingReset() {
  rankingPlayers  = [];
  rankingVoterIdx = 0;
  rankingAllVotes = [];
  document.getElementById('ranking-setup').style.display           = 'block';
  document.getElementById('ranking-vote-section').style.display    = 'none';
  document.getElementById('ranking-results-section').style.display = 'none';
  rankingNewPrompt();
}
