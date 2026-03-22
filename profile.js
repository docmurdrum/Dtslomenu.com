// ══════════════════════════════════════════════
// PROFILE.JS — Profile, XP, Character System, Level Up
// ══════════════════════════════════════════════

// ── LEVEL UP MESSAGES ──
const LEVELUP_MESSAGES = [
  "First step into the DTSLO night. The city doesn't know you yet.",
  "Getting warmer. The bars are starting to notice.",
  "You've got the feel of the night now.",
  "A regular is forming. Bartenders are learning your face.",
  "The vibe is strong with this one.",
  "You know which nights are worth it now.",
  "Instincts are sharpening. You move through crowds easy.",
  "The city is yours to read like a map.",
  "You've seen things. You know things.",
  "Half the battle is showing up. You always show up.",
  "Your reputation precedes you down Higuera.",
  "Bouncers nod. Bartenders pour early.",
  "The night bends toward you a little now.",
  "You've outlasted rookies. Many of them.",
  "SLO nightlife is part of your DNA now.",
  "You're not just attending the night — you're shaping it.",
  "The crowd moves differently when you're in it.",
  "Legend status is no longer theoretical.",
  "You are the reason people say 'downtown was great tonight.'",
  "The city exhales when you walk in.",
  "Fifty levels deep. The night knows your name.",
];

// ── CHARACTERS (50 × 5 levels = 250 total) ──
const CHARACTERS = [
  { id:1,  name:"The Freshman",            archetype:"Wide-eyed rookie clutching a solo cup for the very first time",                   bg:"Cal Poly campus at night, Mustang logo glowing",          elements:["a plain red solo cup in hand","the solo cup now glowing faintly","a shimmer of nervous rookie energy around them","wide cartoon saucer eyes","a tiny halo of question marks floating above their head"] },
  { id:2,  name:"The Fake ID Phantom",     archetype:"Face slightly pixelated like a bad photocopy, nervously checking their pocket",   bg:"Higuera Street neon signs at night",                      elements:["a pixelated face texture","a glowing ID card floating nearby","nervous sweat drops visible","a fake mustache disguise that fools no one","a spotlight actively avoiding them"] },
  { id:3,  name:"The Pre-Game Prophet",    archetype:"Sees the whole night ahead but always gets the predictions hilariously wrong",    bg:"Dorm room glowing from inside, SLO hills at dusk",        elements:["a beer bottle crystal ball in hand","swirling purple smoke around the bottle","wrong prophecy symbols floating in air","a wizard robe covered in drink stains","the crystal ball cracking from bad predictions"] },
  { id:4,  name:"The Group Chat General",  archetype:"Coordinating twelve people simultaneously, none of them are actually listening",  bg:"Downtown SLO intersection at night, street lights glowing",elements:["one phone buzzing in hand","three phones orbiting their head","six phones all buzzing at once","a general hat made of old phones","twelve phones forming a glowing crown of chaos"] },
  { id:5,  name:"The Uber Summoner",       archetype:"Raises hand and cars materialize from thin air, still gets surge priced",        bg:"SLO train station at night, warm street lights",          elements:["hand raised dramatically to the sky","a glowing Uber pin floating above them","surge pricing numbers raining down","a line of phantom cars materializing","a golden summoning circle on the ground beneath them"] },
  { id:6,  name:"The Bar Radar",           archetype:"Built-in antenna always pointing toward the least crowded bar in town",          bg:"Aerial view of DTSLO rooftops glowing at night",          elements:["a small antenna growing from their head","the antenna rotating and glowing","bar crowd density data floating in air","a HUD display over their eyes","a full radar screen showing every bar in SLO"] },
  { id:7,  name:"The Shot Caller",         archetype:"Appears in a puff of smoke holding a glowing tray nobody ordered",              bg:"Mothers Tavern interior, warm amber lighting",            elements:["a tray of glowing shots in hand","dramatic entrance smoke puffing around them","the shots leaving light trails as they move","a golden summoning glow around the tray","shots floating off the tray and orbiting them"] },
  { id:8,  name:"The Line Whisperer",      archetype:"Velvet ropes physically bend away, bouncers bow without knowing why",           bg:"Outside Frog and Peach, rope line glowing purple",        elements:["a velvet rope curling away from them","bouncers mid-bow in background","a golden VIP stamp glowing permanently on wrist","a glowing path parting through any crowd","an invisible force field that dissolves all lines"] },
  { id:9,  name:"The Karaoke Demon",       archetype:"Microphone fused to hand, voice comes out as visible hypnotic musical notes",   bg:"SLO bar karaoke night, stage lights blazing",             elements:["a microphone fused to their hand","musical notes floating visibly from their mouth","the crowd frozen mid-hypnosis","demonic stage lighting radiating behind them","a wall of screaming fans made of musical notes"] },
  { id:10, name:"The Crowd Conductor",     archetype:"Raised hands literally control crowd movement like a maestro",                  bg:"Packed DTSLO dance floor, lights strobing",               elements:["hands raised with faint crowd movement","a conductor baton made of light","visible tempo waves radiating outward","a full orchestra pit appearing around the floor","the entire crowd moving in perfect synchronized waves"] },
  { id:11, name:"The Vibe Scientist",      archetype:"Analyzes crowd energy like a lab experiment, lab coat covered in drink stains", bg:"DTSLO bar interior with neon lab equipment overlaid",      elements:["a glowing beaker of crowd energy","a stained lab coat","scientific vibe equations floating in air","a full chemistry set on the bar","a bubbling formula making everyone happier"] },
  { id:12, name:"The Instagram Warlock",   archetype:"Camera lens for one eye, every photo they take becomes legendary forever",      bg:"SLO rooftop at golden hour turning to night",             elements:["a camera lens replacing one eye","legendary photos orbiting them","a magic viewfinder showing the perfect shot","ghost followers materializing behind them","portals opening from every photo they take"] },
  { id:13, name:"The Dance Floor Chemist", archetype:"Drops invisible formula and the entire crowd starts moving involuntarily",      bg:"Packed DTSLO dance floor, neon chemical symbols in air",  elements:["a mysterious glowing vial in hand","the formula dripping onto the floor","chemical reaction symbols exploding outward","the crowd erupting into movement around them","a periodic table of dance moves floating above"] },
  { id:14, name:"The Bottomless Tab",      archetype:"Credit card levitating above head with its own gravitational pull",             bg:"Bar with receipts flying everywhere, SLO street outside",  elements:["a glowing credit card floating above head","receipts orbiting around them","a gravitational pull bending nearby drinks inward","bartenders running from all directions toward them","a black hole of bar tabs forming overhead"] },
  { id:15, name:"The Reunion Specter",     archetype:"Ghostly echoes of everyone they have ever met on a night out trail behind",     bg:"Higuera Street at 2am, misty and glowing",                elements:["one ghostly echo trailing behind them","five ghost echoes of past nights out","the ghosts holding drinks from different eras","a full spectral entourage of every person they have ever met","the ghosts forming a glowing parade through the street"] },
  { id:16, name:"The Craft Beer Oracle",   archetype:"Pint glass shows the future in its foam and judges your order telepathically",  bg:"Tap room with Bishop Peak visible through the window",    elements:["a pint glass with glowing foam","visions swirling inside the glass","a telepathic beam judging nearby drink orders","a full oracle setup with candles and hop cones","the future of the night revealed in perfect foam art"] },
  { id:17, name:"The Bouncer Whisperer",   archetype:"Permanent glow where a stamp used to be, every door in SLO opens on approach", bg:"Outside a SLO bar entrance, velvet rope glowing",         elements:["a glowing wrist stamp that never fades","doors visibly swinging open ahead of them","bouncers stepping aside without being asked","a golden key floating above their head","every door in DTSLO opening simultaneously as they approach"] },
  { id:18, name:"The Thursday Prophet",    archetype:"Calendar burns behind them, Thursday written in sacred fire",                   bg:"SLO downtown Thursday night, streets packed and glowing",  elements:["a burning calendar floating behind them","Thursday glowing in sacred golden fire","other days of the week fading to ash around them","a prophet staff made of a broken pool cue","a divine Thursday light beam descending from above"] },
  { id:19, name:"The Night Cartographer",  archetype:"Map of DTSLO tattooed across their back, glowing brighter every night out",    bg:"Birds eye view of glowing DTSLO streets",                 elements:["a glowing DTSLO map tattoo on their back","map lines extending outward from them like roots","every bar they have visited lighting up on the map","the map floating off their back and expanding","a living breathing DTSLO nightlife map pulsing around them"] },
  { id:20, name:"The Crowd Sovereign",     archetype:"Floats slightly above everyone without a chair, crowd parts naturally",         bg:"DTSLO from above, all streets glowing, hills silhouetted", elements:["floating slightly above ground","a crowd naturally parting below them","a crown of neon bar signs forming","the entire DTSLO skyline glowing behind them","all of downtown SLO bowing in the background"] },
  { id:21, name:"The Temporal Barfly",     archetype:"Sees every version of the bar across time, all eras overlapping at once",       bg:"Mothers Tavern interior across decades, all overlapping",  elements:["ghost images of the bar across time flickering around them","multiple versions of themselves from different nights visible","a time spiral forming around their bar stool","vintage and modern bar decor overlapping in their aura","a full time vortex centered on their favorite seat"] },
  { id:22, name:"The SLO Poltergeist",     archetype:"Moves through walls of packed bars, drinks appear in hand from nowhere",        bg:"Packed DTSLO bar, walls semi-transparent",                elements:["a semi-transparent body able to pass through crowds","drinks appearing in hand from thin air","bar walls becoming transparent around them","a poltergeist trail of floating bar objects","entire packed bars becoming walkable for them alone"] },
  { id:23, name:"The Neon Harbinger",      archetype:"Every bar sign flickers and spells their name the moment they walk near",       bg:"Higuera Street, all neon signs lit up at night",          elements:["one bar sign flickering their name","three signs spelling their name in neon","a trail of neon light following their path","every sign on Higuera rewriting itself for them","the entire street of neon bending into one personal marquee"] },
  { id:24, name:"The Eternal Tab",         archetype:"Tab so legendary it has its own gravitational field and sentient personality",  bg:"Bar interior, receipts swirling like a galaxy",           elements:["a glowing tab receipt floating nearby","the tab growing wings and hovering","bartenders from across the bar running toward the tab","the tab developing eyes and a personality","a full galaxy of receipts orbiting the sentient eternal tab"] },
  { id:25, name:"The Ghost of Higuera",    archetype:"Walked Higuera Street so many times they have become part of the street itself",bg:"Higuera Street at night, misty and timeless",              elements:["footsteps glowing on the pavement behind them","street bricks lighting up on their approach","ghostly echoes of great nights floating above the street","Higuera Street signs bending toward them","their silhouette fused permanently into the glow of the street itself"] },
  { id:26, name:"The Patio Philosopher",   archetype:"Cannot be moved inside, a force field of deep conversation surrounds them",    bg:"SLO bar patio, string lights, hills in background",       elements:["a force field of conversation forming around them","deep thought bubbles floating and glowing","nearby strangers pulled into orbit of their conversation","a philosophers toga forming over their outfit","the entire patio reconfiguring around their permanent spot"] },
  { id:27, name:"The Comeback King",       archetype:"Left at midnight, back by 1am in a flash of light, nobody saw them leave",     bg:"DTSLO street at 1am, dramatic re-entry lighting",         elements:["a dramatic flash of light on re-entry","a cape appearing mid-comeback","the crowd parting in awe at the return","a golden spotlight finding them instantly","a full cinematic entrance sequence every single time"] },
  { id:28, name:"The Midnight Alchemist",  archetype:"Turns any drink into liquid gold, bar glows and hums when they approach",      bg:"Bar counter glowing gold, SLO night outside",             elements:["hands glowing faintly gold","drinks turning to liquid gold on touch","a full alchemist workstation appearing at the bar","the entire bar counter glowing when they approach","a philosophers stone replacing their ice cube"] },
  { id:29, name:"The Streak Keeper",       archetype:"Glowing chain of unbroken Thursday nights, each link more valuable than the last",bg:"DTSLO Thursday night, streets electric",                elements:["a single glowing chain link floating nearby","five chain links forming a streak bracelet","the chain wrapping around wrist like armor","a massive glowing chain trailing behind them","an unbreakable chain of 52 Thursdays forming full body armor"] },
  { id:30, name:"The After Party Architect",archetype:"Blueprints for the perfect after party materialize, the night never ends",    bg:"Living room at 3am, SLO hills through the window",        elements:["glowing blueprints appearing in the air","construction tools made of party supplies","the blueprints coming to life around them","a full after party materializing from thin air","an infinite after party dimension opening behind them"] },
  { id:31, name:"The Scene Conductor",     archetype:"Baton made of a broken pool cue, entire bar moves on their tempo",            bg:"DTSLO bar interior, crowd arranged as orchestra",          elements:["a pool cue baton glowing in hand","visible tempo waves radiating outward","the bar crowd moving in rhythm to their conducting","a full orchestra pit appearing around the dance floor","every person in DTSLO dancing in perfect synchronized harmony"] },
  { id:32, name:"The Network Node",        archetype:"Glowing threads connect them to every person in the bar simultaneously",       bg:"DTSLO bar interior, connection lines glowing everywhere",  elements:["one glowing thread connecting to a nearby person","five threads connecting across the bar","a web of connections forming around them","the entire bar connected in a glowing social network","a city-wide SLO nightlife network pulsing through them"] },
  { id:33, name:"The Cocktail Sorcerer",   archetype:"Drinks mix themselves when they point, bar equipment operates autonomously",   bg:"Bar back lit up with glowing bottles floating",           elements:["a pointing finger and drinks mixing themselves","bottles floating off the shelf toward them","a sorcerers apprentice situation at the bar","the entire bar operating autonomously around them","a magical cocktail dimension opening behind the bar"] },
  { id:34, name:"The Floor Legend",        archetype:"Leaves permanent glowing footprints on every dance floor they have ever touched",bg:"Dance floor with glowing footprint trail",               elements:["one set of glowing footprints left behind","a trail of footprints lighting up the floor","the footprints forming a legendary dance pattern","every dance floor in SLO lighting up with their historic moves","a glowing map of every floor they have ever danced on forming beneath them"] },
  { id:35, name:"The Omnipresent Regular", archetype:"In three bars simultaneously, bartenders at all three already know their order",bg:"Split view of three SLO bars simultaneously",             elements:["a faint double image of themselves nearby","three simultaneous versions visible across the bar","bartenders at multiple bars already pouring their drink","a quantum superposition of themselves across DTSLO","every bar in SLO receiving them simultaneously"] },
  { id:36, name:"The Higuera Saint",       archetype:"Halo made of neon bar signs, blesses every establishment they enter",         bg:"Higuera Street glowing like a cathedral at night",        elements:["a faint neon halo forming above their head","the halo spelling out bar names","a blessing gesture that makes bars instantly more fun","stained glass bar windows forming around them","a full sainthood procession of regulars following them down Higuera"] },
  { id:37, name:"The Downtown Deity",      archetype:"Floats above ground, entire street bends toward their presence",              bg:"DTSLO street bending toward a central glowing figure",    elements:["floating one inch above the ground","the street subtly curving toward them","bar signs rotating to face them","gravity visibly bending around their presence","all of downtown SLO orbiting them like a solar system"] },
  { id:38, name:"The Bishop Peak Barfly",  archetype:"Mountain silhouette permanently in their eyes, as immovable as the hills",    bg:"Bishop Peak silhouette under stars, bar glow below",      elements:["Bishop Peak reflected in their eyes","mountain energy radiating as a calm aura","the peak appearing as a tattoo on their arm","a Bishop Peak silhouette forming as permanent backdrop","the mountain itself leaning in to listen to their conversations"] },
  { id:39, name:"The Mustang Phantom",     archetype:"Cal Poly Mustang logo burns behind them, loyal to the campus forever",        bg:"Cal Poly campus at night, Mustang logo blazing",          elements:["a faint Mustang logo glowing behind them","the logo burning brighter and more defined","a Mustang stampede visible in the distance behind them","the Cal Poly seal forming beneath their feet","a full phantom Mustang charging through the air around them"] },
  { id:40, name:"The SLO Specter",         archetype:"Has become part of the city itself, can hear every bar conversation at once",  bg:"Aerial SLO at night, all lights glowing",                 elements:["semi-transparent with SLO street map visible through them","every bar conversation floating as text around their head","the city grid glowing through their body","SLO nightlife visible as a live map on their skin","their silhouette filled with the entire glowing city of SLO"] },
  { id:41, name:"The Undying Thursday",    archetype:"Thursday never ends for them, permanent golden Thursday light surrounds them", bg:"Eternal Thursday night, no other day exists",             elements:["a golden Thursday glow surrounding them","calendar pages dissolving as they approach","other days of the week unable to reach them","a permanent Thursday sunset frozen behind them","an infinite Thursday dimension radiating outward from their being"] },
  { id:42, name:"The Final Round",         archetype:"The crystallized last drink of the night carried always as a sacred glowing orb",bg:"Bar at last call, lights coming up, sacred energy",      elements:["a glowing orb of the final round in hand","the orb radiating last-call energy","time slowing around the sacred final drink","bartenders weeping as they witness the final round","an eternal last call moment frozen in golden light around them"] },
  { id:43, name:"The Immortal Regular",    archetype:"Has outlived the bars themselves, ghosts of every closed SLO venue follow",   bg:"DTSLO with ghost outlines of closed bars overlapping",    elements:["one ghost bar visible behind them","three closed venues appearing as transparent echoes","a full haunted tour of SLO bar history following them","the ghosts of every bartender who ever served them nearby","an entire ghost city of SLO nightlife past walking beside them"] },
  { id:44, name:"The SLO Singularity",     archetype:"All nightlife energy in the city converges into their silhouette",            bg:"All of SLOs energy converging into one glowing point",    elements:["nightlife energy streams bending toward them","bar lights across DTSLO flickering toward their position","a singularity forming in their chest","all of SLOs nightlife visibly pulling toward them","a complete nightlife singularity with DTSLO orbiting their being"] },
  { id:45, name:"The Eternal",             archetype:"Has always been here and always will be, older than the bars themselves",     bg:"DTSLO across time, all eras visible at once",             elements:["a timeless ageless glow about them","historical SLO visible as layers behind them","their outfit shifting through every era of SLO nightlife","a clock with no hands floating above their head","all of time converging into their eternal bar stool"] },
  { id:46, name:"The Godfather",           archetype:"Nods and doors open, tabs close, crowds part — no words needed ever",        bg:"DTSLO from a power position, all bars visible",           elements:["a single commanding nod visible","doors swinging open ahead without being touched","tabs closing across the bar at their glance","an empire of regulars visible in the background","all of DTSLO nightlife organized around their single quiet nod"] },
  { id:47, name:"The Crown",               archetype:"Not worn but earned, one night at a time, forged from every great evening",   bg:"DTSLO glowing like a kingdom at night",                   elements:["a faint crown of bar lights forming above their head","the crown solidifying into neon and gold","every bar they have loved appearing as a jewel in the crown","the crown visible from across all of downtown","the entire kingdom of DTSLO nightlife bowing beneath the crown"] },
  { id:48, name:"The Infinite",            archetype:"Their story does not have an ending — the night always continues somewhere",  bg:"DTSLO extending infinitely into the horizon",             elements:["a trail of infinite nights stretching behind them","the horizon of SLO extending forever in their wake","infinite versions of themselves visible across the timeline","a loop of every perfect night playing around them","an infinite DTSLO universe radiating outward from their presence"] },
  { id:49, name:"The Pinnacle",            archetype:"Every other character exists somewhere on the path to standing exactly here", bg:"Top of Bishop Peak, all of SLO glowing below",            elements:["standing slightly above everyone on an invisible peak","every previous character visible as stepping stones below","the path to the pinnacle glowing behind them","a summit of nightlife achievement visible as a physical peak","all 49 previous characters visible as a glowing staircase beneath them"] },
  { id:50, name:"The Complete",            archetype:"Nothing left to prove. Has everything. Shows up anyway because they love it", bg:"All of DTSLO glowing in perfect harmony below",            elements:["a quiet all-knowing smile and calm powerful aura","all previous powers visible as faint overlapping glows","the entire history of SLO nightlife written in their eyes","every bar in DTSLO glowing brighter in their presence","pure completeness — the city itself bowing to the one who needs nothing but shows up anyway"] },
];

// ── CHARACTER HELPERS ──
function getCharacterForLevel(level) {
  const clampedLevel = Math.max(1, Math.min(250, level));
  const charIndex    = Math.min(49, Math.floor((clampedLevel - 1) / 5));
  const levelInChar  = (clampedLevel - 1) % 5;
  return { character: CHARACTERS[charIndex], levelInChar, charIndex };
}

function getUnlockedElements(level) {
  const { character, levelInChar } = getCharacterForLevel(level);
  return character.elements.slice(0, levelInChar + 1);
}

function buildPrompt(character, elements, bg) {
  const genderWord = getGenderWord();
  const elementStr = elements.join(", ");
  return `Cartoon illustration of a ${genderWord} nightlife character named "${character.name}". ` +
    `They are ${character.archetype}. ` +
    `Visual elements to include: ${elementStr}. ` +
    `Background setting: ${bg}. ` +
    `The character is clearly ${genderWord === 'person' ? 'gender-neutral' : genderWord + '-presenting'}. ` +
    `Style: colorful vibrant cartoon, expressive exaggerated features, bold clean lines, comic book energy. Square format, centered subject, no text, no words.`;
}

// ── HF KEY ──
let _hfKeyRuntime = 'worker';

function saveHFKey() {
  const key = document.getElementById('hf-key-input').value.trim();
  if (!key.startsWith('hf_')) { showToast('⚠️ Key should start with hf_'); return; }
  _hfKeyRuntime = key;
  safeStore.set('hf_api_key', key);
  document.getElementById('hf-key-box').style.display = 'none';
  showToast('✅ API key saved!');
}

function getHFKey() {
  return 'worker'; // Cloudflare Worker handles HF auth via env variable
}

// ── RENDER PROFILE ──
function renderProfile() {
  const username = getUsername();
  const email    = currentUser?.email || '—';
  const joined   = currentUser?.created_at
    ? 'Joined ' + new Date(currentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Joined recently';

  document.getElementById('profile-avatar').textContent   = username[0]?.toUpperCase() || '?';
  document.getElementById('profile-username').textContent = username;
  document.getElementById('profile-email').textContent    = email;
  document.getElementById('profile-joined').textContent   = joined;
  updateDevGenderLabel();

  const level    = Math.min(50, Math.floor(userXP / 100));
  const progress = level >= 50 ? 100 : userXP % 100;
  const toNext   = level >= 50 ? 0 : 100 - progress;

  document.getElementById('stat-xp').textContent        = userXP;
  document.getElementById('stat-reports').textContent   = reportCount;
  document.getElementById('stat-posts').textContent     = postCount;
  document.getElementById('xp-level-badge').textContent = level >= 50 ? 'MAX LEVEL' : 'Level ' + level;
  document.getElementById('xp-sub').textContent         = level >= 50
    ? `${userXP} XP · Max level reached!`
    : `${userXP} XP · ${toNext} XP to next level`;
  setTimeout(() => { document.getElementById('xp-fill').style.width = progress + '%'; }, 60);
}

// ── RENDER CHARACTER CARD ──
function renderCharacterCard() {
  if (!currentUser) return;
  const level = Math.max(1, Math.floor(userXP / 100) + 1);
  const { character, levelInChar, charIndex } = getCharacterForLevel(level);
  const elements = getUnlockedElements(level);

  document.getElementById('char-tier-badge').textContent = `Character ${charIndex + 1} of 50 · Level ${level}`;
  document.getElementById('char-name').textContent       = character.name;
  document.getElementById('char-archetype').textContent  = character.archetype;

  const tc = document.getElementById('char-traits');
  tc.innerHTML = elements.map(e => `<div class="char-trait">${e}</div>`).join('');

  const hfKeyBox = document.getElementById('hf-key-box');
  if (hfKeyBox) hfKeyBox.style.display = 'none';
}

// ── GENERATE CHARACTER ──
async function generateCharacter() {
  const hfKey = getHFKey();
  const level = Math.max(1, Math.floor(userXP / 100) + 1);
  const { character } = getCharacterForLevel(level);
  const elements = getUnlockedElements(level);
  const prompt   = buildPrompt(character, elements, character.bg);

  const btn = document.getElementById('char-gen-btn');
  btn.disabled = true; btn.textContent = '⏳ Generating…';

  const wrap = document.querySelector('.char-img-wrap');
  wrap.innerHTML = `<div class="char-generating"><div class="spinner"></div><span style="font-size:12px;color:var(--text2)">Drawing your character…</span></div>`;

  try {
    const modelUrl = 'https://billowing-darkness-f8d8.dtslomenu.workers.dev';
    let res;
    try {
      res = await fetch(modelUrl, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + hfKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
      });
    } catch(netErr) {
      throw new Error('Network error: ' + netErr.message);
    }

    if (res.status === 503) {
      wrap.innerHTML = `<div class="char-img-placeholder"><div>⏳</div><span>Model warming up — try again in 30s</span></div>`;
      btn.disabled = false; btn.textContent = '✨ Generate';
      showToast('🔄 Model warming up, try again in 30s');
      return;
    }
    if (res.status === 401) throw new Error('Invalid API key — check your Hugging Face token');
    if (res.status === 403) throw new Error('API key lacks permission — make sure token has Read access');
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error('HF error ' + res.status + ': ' + errText.slice(0,100));
    }

    const blob = await res.blob();
    if (blob.size < 1000) {
      const txt = await blob.text();
      throw new Error('Response too small: ' + txt.slice(0, 120));
    }
    const url = URL.createObjectURL(blob);

    try {
      await supabaseClient.from('profiles').upsert({
        id: currentUser.id,
        character_url: url,
        character_level: level,
        updated_at: new Date().toISOString()
      });
    } catch(e) { /* profiles table optional */ }

    wrap.innerHTML = `<img id="char-img" src="${url}" alt="Your character" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    document.getElementById('char-share-btn').style.display = 'inline-flex';
    showToast('🎨 Character generated!');

  } catch(e) {
    wrap.innerHTML = `<div class="char-img-placeholder"><div>❌</div><span>${e.message}</span></div>`;
    showToast('❌ ' + e.message);
  }

  btn.disabled = false; btn.textContent = '🔄 Regenerate';
}

// ── SHARE CHARACTER ──
async function shareCharacter() {
  const img = document.querySelector('.char-img-wrap img');
  if (!img) return;
  const level = Math.max(1, Math.floor(userXP / 100) + 1);
  const { character } = getCharacterForLevel(level);
  const text = `I'm "${character.name}" on DTSLO — Level ${level}! ${character.archetype} 🍻 dtslomenu.com`;
  if (navigator.share) {
    try { await navigator.share({ title: 'My DTSLO Character', text }); } catch(e) {}
  } else {
    await navigator.clipboard.writeText(text);
    showToast('📋 Copied to clipboard!');
  }
}

// ── XP SYSTEM ──
const preGenCache = {};
let preGenInProgress = false;

function xpGainEffect(amount) {
  const fill = document.getElementById('xp-fill');
  if (fill) {
    fill.classList.remove('gaining');
    void fill.offsetWidth;
    fill.classList.add('gaining');
    setTimeout(() => fill.classList.remove('gaining'), 1800);
  }
  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.textContent = '+' + (amount || '') + ' XP ⚡';
  toast.style.bottom = '120px';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function gainXP(amount) {
  const old = userXP;
  userXP += amount;
  xpGainEffect(amount);
  if (document.getElementById('profile')?.classList.contains('active')) renderProfile();
  checkLevelUp(old, userXP).catch(e => console.error('checkLevelUp error:', e));
  const tensDigit = Math.floor(userXP % 100 / 10);
  if (tensDigit !== 1 && tensDigit !== 0) preGenerateNextLevel(userXP);
}

async function preGenerateNextLevel(currentXP) {
  const nextLevel = Math.floor(currentXP / 100) + 2;
  if (preGenCache[nextLevel]) return;
  if (preGenInProgress) return;
  preGenInProgress = true;
  try {
    const { character } = getCharacterForLevel(nextLevel);
    const elements = getUnlockedElements(nextLevel);
    const prompt = buildPrompt(character, elements, character.bg);
    const res = await fetch('https://billowing-darkness-f8d8.dtslomenu.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
    });
    if (!res.ok) { preGenInProgress = false; return; }
    const blob = await res.blob();
    if (blob.size < 1000) { preGenInProgress = false; return; }
    preGenCache[nextLevel] = URL.createObjectURL(blob);
  } catch(e) {
    console.log('[DTSLO] Pre-gen failed:', e.message);
  }
  preGenInProgress = false;
}

async function checkLevelUp(oldXP, newXP) {
  const oldLevel = Math.floor(oldXP / 100) + 1;
  const newLevel = Math.floor(newXP / 100) + 1;
  if (newLevel <= oldLevel) return;

  const { character } = getCharacterForLevel(newLevel);
  const cachedUrl = preGenCache[newLevel];
  delete preGenCache[newLevel];

  if (cachedUrl) {
    showLevelUpPopup(newLevel, character, cachedUrl, false);
    fireConfetti();
    const profileWrap = document.querySelector('.char-img-wrap');
    if (profileWrap) {
      profileWrap.innerHTML = `<img id="char-img" src="${cachedUrl}" alt="Your character" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`;
      const shareBtn = document.getElementById('char-share-btn');
      if (shareBtn) shareBtn.style.display = 'inline-flex';
    }
    return;
  }

  showLevelUpPopup(newLevel, character, null, true);
  fireConfetti();

  try {
    const elements = getUnlockedElements(newLevel);
    const prompt = buildPrompt(character, elements, character.bg);
    const res = await fetch('https://billowing-darkness-f8d8.dtslomenu.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true } })
    });
    if (!res.ok) return;
    const blob = await res.blob();
    if (blob.size < 1000) return;
    const url = URL.createObjectURL(blob);

    const wrap = document.getElementById('lu-img-wrap');
    if (wrap) wrap.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover">`;

    const profileWrap = document.querySelector('.char-img-wrap');
    if (profileWrap) {
      profileWrap.innerHTML = `<img id="char-img" src="${url}" alt="Your character" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`;
      const shareBtn = document.getElementById('char-share-btn');
      if (shareBtn) shareBtn.style.display = 'inline-flex';
    }
  } catch(e) {
    console.log('Level up image failed:', e.message);
  }
}

function showLevelUpPopup(level, character, imgUrl, loading) {
  const msgIndex = Math.min(level - 1, LEVELUP_MESSAGES.length - 1);
  const msg = LEVELUP_MESSAGES[msgIndex];

  document.getElementById('lu-level').textContent     = level;
  document.getElementById('lu-char-name').textContent = character.name;
  document.getElementById('lu-msg').textContent       = msg;

  const wrap = document.getElementById('lu-img-wrap');
  if (imgUrl) {
    wrap.innerHTML = `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover">`;
  } else if (loading) {
    wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px">
        <div class="spinner" style="width:40px;height:40px;border-width:4px;border-top-color:var(--gold)"></div>
        <div style="font-size:11px;color:var(--text2);font-weight:700;letter-spacing:1px;text-transform:uppercase">Generating...</div>
      </div>`;
  } else {
    wrap.innerHTML = `<div style="font-size:60px">⚡</div>`;
  }

  document.getElementById('levelup-overlay').classList.add('show');
}

function closeLevelUp() {
  document.getElementById('levelup-overlay').classList.remove('show');
  renderCharacterCard();
}

// ── DEV TOOLS ──
function devAddXP() {
  gainXP(100);
  renderProfile();
  renderCharacterCard();
  showToast('⚡ +100 XP added');
}

function devResetXP() {
  userXP = 0; reportCount = 0; postCount = 0;
  renderProfile();
  renderCharacterCard();
  // Reset character image
  const wrap = document.querySelector('.char-img-wrap');
  if (wrap) wrap.innerHTML = `<div class="char-img-placeholder"><div>🎭</div><span>No character yet</span></div>`;
  const shareBtn = document.getElementById('char-share-btn');
  if (shareBtn) shareBtn.style.display = 'none';
  showToast('🔄 Reset to Level 0');
}

async function devToggleGender() {
  if (!currentUser) return;
  const current = currentUser.user_metadata?.gender || 'other';
  const cycle   = { 'male': 'female', 'female': 'other', 'other': 'male' };
  const next    = cycle[current] || 'male';
  try {
    const { data, error } = await supabaseClient.auth.updateUser({
      data: { ...currentUser.user_metadata, gender: next }
    });
    if (error) throw error;
    currentUser = data.user;
    updateDevGenderLabel();
    showToast('🔀 Gender set to: ' + next);
  } catch(e) {
    showToast('❌ Could not update gender: ' + e.message);
  }
}

function updateDevGenderLabel() {
  const el = document.getElementById('dev-gender-label');
  if (el) el.textContent = currentUser?.user_metadata?.gender || '—';
}
