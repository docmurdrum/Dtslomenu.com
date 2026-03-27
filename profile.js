
// ── FEEDBACK ──
var currentFeedbackType = 'bug';

function showFeedback() {
  var modal = document.getElementById('feedback-modal');
  if (modal) modal.style.display = 'flex';
}

function closeFeedback() {
  var modal = document.getElementById('feedback-modal');
  if (modal) modal.style.display = 'none';
  var txt = document.getElementById('feedback-text');
  if (txt) txt.value = '';
}

function selectFeedbackType(el, type) {
  document.querySelectorAll('.fb-type').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  currentFeedbackType = type;
}

async function submitFeedback() {
  var text = document.getElementById('feedback-text')?.value?.trim();
  var email = document.getElementById('feedback-email')?.value?.trim();
  var btn = document.getElementById('feedback-submit-btn');
  if (!text) {
    document.getElementById('feedback-text').style.borderColor = 'rgba(255,45,120,0.5)';
    setTimeout(function() {
      document.getElementById('feedback-text').style.borderColor = 'rgba(255,255,255,0.1)';
    }, 1500);
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
  try {
    await supabaseClient.from('feedback').insert([{
      type: currentFeedbackType,
      message: text,
      email: email || null,
      user_id: currentUser?.id || null,
      app_version: 'v4.0',
      created_at: new Date().toISOString()
    }]);
    closeFeedback();
    if (typeof showToast === 'function') showToast('✅ Feedback sent — thank you!');
  } catch(e) {
    // Fallback — still show success (save to localStorage)
    try {
      var existing = JSON.parse(localStorage.getItem('dtslo_pending_feedback') || '[]');
      existing.push({ type: currentFeedbackType, message: text, email, ts: Date.now() });
      localStorage.setItem('dtslo_pending_feedback', JSON.stringify(existing));
    } catch(le) {}
    closeFeedback();
    if (typeof showToast === 'function') showToast('✅ Feedback saved!');
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Send Feedback →'; }
}


// ── SKIP INTRO PREFERENCE ──
function saveSkipIntroPref(on) {
  localStorage.setItem('menu_skip_intro', on ? '1' : '0');
}

function loadSkipIntroPref() {
  const toggle = document.getElementById('pref-skip-intro');
  if (toggle) toggle.checked = localStorage.getItem('menu_skip_intro') === '1';
}

function saveSkipToDTSLOPref(on) {
  localStorage.setItem('menu_skip_to_dtslo', on ? '1' : '0');
}

function loadSkipToDTSLOPref() {
  const toggle = document.getElementById('pref-skip-to-dtslo');
  if (toggle) toggle.checked = localStorage.getItem('menu_skip_to_dtslo') === '1';
}

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

// ── CHARACTERS (50 × 5 scenes = 250 total) ──
const CHARACTERS = [
  { id: 1, name: "The Freshman", scenes: [
    { action: "nervously clutching a solo cup for the first time", bg: "crowded dorm party with red cups and string lights" },
    { action: "getting lost on Higuera Street alone at night", bg: "busy downtown SLO sidewalk with neon bar signs" },
    { action: "dancing badly and not caring at all", bg: "packed college bar with strobing lights and a crowd" },
    { action: "passed out on a couch while the party rages around them", bg: "chaotic house party living room at 1am" },
    { action: "calling an Uber home alone while texting their friends", bg: "empty SLO street at night under streetlights" },
  ]},
  { id: 2, name: "The Fake ID Phantom", scenes: [
    { action: "sweating nervously while handing an ID to a bouncer", bg: "outside a busy SLO bar entrance at night with a velvet rope" },
    { action: "rehearsing their fake birthday in a bathroom mirror", bg: "dimly lit bar bathroom with graffiti on the walls" },
    { action: "sprinting away after getting caught at the door", bg: "Higuera Street at night with neon lights blurring past" },
    { action: "confidently bluffing their way past a distracted bouncer", bg: "crowded bar entrance with people lined up behind them" },
    { action: "celebrating inside the bar in disbelief they made it", bg: "loud packed bar interior with colorful lights and happy crowd" },
  ]},
  { id: 3, name: "The Pre-Game Goblin", scenes: [
    { action: "dramatically predicting how the night will go to a skeptical group", bg: "dorm room pre-game with bottles and red cups everywhere" },
    { action: "making everyone do a group shot before leaving", bg: "apartment kitchen with bottles and sticky countertops" },
    { action: "arriving at the bar having already predicted every detail correctly", bg: "busy SLO bar entrance at night with a crowd" },
    { action: "loudly announcing the night is about to peak despite being wrong", bg: "mid-party living room with confused partygoers around them" },
    { action: "telling the story of the night to anyone who will listen", bg: "late night diner at 2am with tired friends eating food" },
  ]},
  { id: 4, name: "The Group Chat General", scenes: [
    { action: "frantically texting twelve people trying to coordinate a meetup", bg: "busy Higuera Street sidewalk with bars and crowds around" },
    { action: "holding up the whole group to make a new plan mid-walk", bg: "downtown SLO street corner at night with impatient friends" },
    { action: "managing four separate group chats simultaneously at the bar", bg: "loud bar interior with people dancing and drinking around them" },
    { action: "calling someone who never picks up while losing the group", bg: "crowded bar entrance with the group disappearing inside" },
    { action: "finally getting everyone together for a chaotic group photo", bg: "packed bar dance floor with neon lights overhead" },
  ]},
  { id: 5, name: "The Uber Summoner", scenes: [
    { action: "dramatically summoning an Uber with one hand raised to the sky", bg: "empty SLO street at night under a streetlight" },
    { action: "arguing with surge pricing on their phone in disbelief", bg: "busy downtown SLO sidewalk with taxis and cars passing" },
    { action: "cramming way too many people into a single Uber", bg: "outside a SLO bar at 2am with a crowd spilling out" },
    { action: "speed-walking to the pickup spot to beat the cancellation timer", bg: "downtown SLO street at night running past closed shops" },
    { action: "leaving a one-star review dramatically on the ride home", bg: "backseat of a car at night passing SLO city lights" },
  ]},
  { id: 6, name: "The Bar Radar", scenes: [
    { action: "scanning the street with total focus choosing the next bar", bg: "Higuera Street at night with multiple glowing bar signs" },
    { action: "steering the group away from a dead bar to a packed one", bg: "outside a quiet bar with a better one visible down the street" },
    { action: "arriving at the exact right bar at the exact right moment", bg: "packed lively SLO bar entrance with music pouring out" },
    { action: "checking their phone for crowd reports while the group waits", bg: "SLO sidewalk at night with the group standing impatiently" },
    { action: "celebrating a perfect bar pick as the crowd goes wild inside", bg: "interior of a packed energetic bar with happy people everywhere" },
  ]},
  { id: 7, name: "The Shot Caller", scenes: [
    { action: "appearing from nowhere holding a glowing tray of shots nobody ordered", bg: "warm amber-lit bar interior with a cheering crowd behind them" },
    { action: "convincing a reluctant group to all do a shot together", bg: "bar counter with colorful bottles and a laughing bartender" },
    { action: "dramatically dropping the tray and laughing about it", bg: "sticky bar floor with cups and confetti everywhere" },
    { action: "toasting loudly to nothing in particular with strangers", bg: "packed bar with everyone raising their glasses around them" },
    { action: "ordering the last round of the night with total confidence", bg: "bar at last call with the lights slowly coming up" },
  ]},
  { id: 8, name: "The Line Whisperer", scenes: [
    { action: "walking straight past a long line to the front with a smile", bg: "long queue outside a popular SLO bar at night" },
    { action: "charming the bouncer into letting the whole group skip the line", bg: "bar entrance with a velvet rope and a surprised bouncer" },
    { action: "teaching the group the secret to getting in anywhere", bg: "SLO sidewalk at night with bars and people around" },
    { action: "arriving at a packed bar and somehow getting a table immediately", bg: "crowded bar interior with no seats but one mysteriously open table" },
    { action: "walking into the VIP section like they own the place", bg: "elevated VIP area of a SLO bar with bottle service below" },
  ]},
  { id: 9, name: "Karaoke Karen", scenes: [
    { action: "grabbing the mic before anyone else can and owning the stage", bg: "karaoke bar stage with a frozen stunned audience" },
    { action: "performing with terrifying intensity to a pop song", bg: "small karaoke room with friends covering their ears and laughing" },
    { action: "refusing to give up the mic despite finishing their song", bg: "karaoke stage with the next performer waiting awkwardly" },
    { action: "getting a standing ovation after an unexpectedly incredible performance", bg: "packed karaoke bar with everyone on their feet cheering" },
    { action: "closing out the night with an unforgettable final song", bg: "karaoke bar at closing time with staff and crowd watching" },
  ]},
  { id: 10, name: "The Crowd Conductor", scenes: [
    { action: "raising both hands and getting the whole dance floor to move together", bg: "packed DTSLO dance floor with strobing colored lights" },
    { action: "starting a conga line that swallows half the bar", bg: "crowded bar interior with people joining a winding line" },
    { action: "orchestrating a group chant that takes over the whole venue", bg: "loud energetic bar with everyone facing the same direction" },
    { action: "getting a circle to form around one incredible dancer", bg: "dance floor with a ring of cheering people around an open space" },
    { action: "leading the final song of the night with arms wide open", bg: "bar at closing with the last remaining crowd going all out" },
  ]},
  { id: 11, name: "The Vibe Scientist", scenes: [
    { action: "analyzing the crowd energy with a serious concentrated expression", bg: "DTSLO bar interior with neon lights and people mingling" },
    { action: "reporting the vibe status to the group like a weather forecast", bg: "bar entrance with the group waiting for the verdict" },
    { action: "successfully predicting the peak vibe moment of the night", bg: "packed dance floor at the height of the party energy" },
    { action: "taking notes on crowd behavior in a tiny notebook at the bar", bg: "busy bar counter with bartenders and patrons around them" },
    { action: "declaring the vibe experiment a success as the crowd erupts", bg: "euphoric bar scene with everyone dancing and laughing" },
  ]},
  { id: 12, name: "The Instagram Warlock", scenes: [
    { action: "positioning everyone perfectly for the ultimate group photo", bg: "rooftop bar at golden hour with the SLO skyline behind them" },
    { action: "lying on the floor to get the most dramatic angle possible", bg: "bar interior with confused people stepping around them" },
    { action: "making everyone retake the photo fifteen times until it is perfect", bg: "outdoor bar patio with string lights and impatient friends" },
    { action: "going viral from a single photo taken on a random Tuesday", bg: "casual SLO bar with people reacting to a phone screen in disbelief" },
    { action: "capturing the one perfect candid moment of the entire night", bg: "golden hour rooftop with friends laughing naturally mid-conversation" },
  ]},
  { id: 13, name: "The Dance Floor Chemist", scenes: [
    { action: "clearing a path on the dance floor with unstoppable energy", bg: "packed dance floor with colorful lights and a parting crowd" },
    { action: "teaching a complicated dance move to a circle of willing victims", bg: "bar dance floor with laughing people attempting to follow along" },
    { action: "combining three different dance styles into one chaotic masterpiece", bg: "neon-lit dance floor with the crowd filming on their phones" },
    { action: "getting a standing ovation after an unexpected breakdance moment", bg: "bar with everyone stopping to watch and cheer" },
    { action: "closing the dance floor with the most legendary finale of the night", bg: "bar at last call with the floor clearing for one final performance" },
  ]},
  { id: 14, name: "The Bottomless Tab", scenes: [
    { action: "buying a round for everyone including total strangers at the bar", bg: "crowded bar counter with grateful strangers all around them" },
    { action: "refusing to look at the tab total and ordering another round anyway", bg: "busy bar with the bartender smiling and pouring more drinks" },
    { action: "discovering their card got declined and laughing instead of panicking", bg: "bar counter with a frozen card reader and a stunned bartender" },
    { action: "somehow talking their way into a free round from the impressed bartender", bg: "warm bar interior with a laughing bartender and happy crowd" },
    { action: "checking their bank account the next morning in pure horror", bg: "bright morning bedroom with a phone screen showing the damage" },
  ]},
  { id: 15, name: "The Reunion Specter", scenes: [
    { action: "running into three different people they know in the first five minutes", bg: "busy SLO bar entrance with crowds moving in and out" },
    { action: "having an emotional reunion with someone they haven't seen in years", bg: "bar interior with other patrons watching the touching moment" },
    { action: "introducing two completely separate friend groups who somehow all know each other", bg: "crowded bar with a growing circle of surprised happy people" },
    { action: "catching up with an old friend they lost track of for two years", bg: "quiet corner of a busy bar with warm dim lighting" },
    { action: "walking home having reconnected with five people they thought were gone forever", bg: "quiet Higuera Street at 2am glowing under streetlights" },
  ]},
  { id: 16, name: "The Craft Beer Oracle", scenes: [
    { action: "describing a beer in unnecessarily dramatic detail to confused friends", bg: "craft beer tap room with rows of taps and wooden decor" },
    { action: "judging someone's drink order with a slow disappointed head shake", bg: "bar counter with the bartender and nearby patrons watching" },
    { action: "recommending the perfect beer pairing for the current emotional moment", bg: "dimly lit tap room with a thoughtful intimate atmosphere" },
    { action: "identifying the exact brewery from taste alone with eyes closed", bg: "lively bar with amazed friends watching the demonstration" },
    { action: "converting the whole group to craft beer against their original will", bg: "tap room with a full group happily holding fancy pints" },
  ]},
  { id: 17, name: "The Bouncer Whisperer", scenes: [
    { action: "having a genuine friendly conversation with the bouncer while the line waits", bg: "bar entrance at night with a long impatient line behind them" },
    { action: "walking the whole group straight in while others have waited an hour", bg: "velvet rope entrance with a stunned crowd watching in disbelief" },
    { action: "being personally greeted by name at every bar on the street", bg: "Higuera Street at night with multiple bar bouncers waving" },
    { action: "getting back in after being told the bar is at capacity", bg: "packed bar entrance with a smiling bouncer lifting the rope" },
    { action: "leaving the bar and promising to see the bouncer next week", bg: "bar exit at night with a genuine handshake under the lights" },
  ]},
  { id: 18, name: "The Thursday Prophet", scenes: [
    { action: "announcing Thursday is the best night of the week to anyone who will listen", bg: "packed downtown SLO Thursday night with golden glowing streets" },
    { action: "converting a skeptical friend into a Thursday night believer", bg: "lively SLO bar on a Thursday with an electric crowd around them" },
    { action: "arriving at the peak of Thursday night energy with perfect timing", bg: "packed Higuera Street with every bar overflowing with people" },
    { action: "leading a Thursday night toast at the bar with total conviction", bg: "crowded bar interior with everyone raising their glasses on Thursday" },
    { action: "closing out a legendary Thursday and already planning next week", bg: "SLO street at 2am Thursday night glowing and winding down" },
  ]},
  { id: 19, name: "The Night Cartographer", scenes: [
    { action: "drawing an actual map of the bar crawl route on a napkin", bg: "bar table covered in drinks and a hand-drawn napkin map" },
    { action: "guiding the group through downtown SLO with confident authority", bg: "Higuera Street at night with the group following close behind" },
    { action: "discovering a hidden bar alley nobody in the group knew existed", bg: "narrow glowing alley between two SLO buildings at night" },
    { action: "marking the best bar of the night on their mental map triumphantly", bg: "packed lively bar interior after a perfect navigation victory" },
    { action: "recapping the entire night route to the group at the end", bg: "late night diner with a napkin map spread across the table" },
  ]},
  { id: 20, name: "The Crowd Sovereign", scenes: [
    { action: "parting a packed crowd just by walking through with quiet confidence", bg: "packed DTSLO bar interior with people stepping aside naturally" },
    { action: "claiming the best spot in the bar without saying a single word", bg: "busy bar with a perfect corner booth somehow now empty for them" },
    { action: "getting served at the bar immediately despite twenty people waiting", bg: "crowded bar counter with surprised patrons watching them get served" },
    { action: "holding court in the middle of the dance floor with total authority", bg: "dance floor with a natural circle of space forming around them" },
    { action: "leaving the bar at exactly the right moment before it gets bad", bg: "SLO street at night walking away as the bar crowd peaks behind them" },
  ]},
  { id: 21, name: "The Temporal Barfly", scenes: [
    { action: "sitting at the same barstool they have occupied for five years straight", bg: "classic SLO bar interior with nostalgic decor and warm amber lighting" },
    { action: "telling a story about this exact bar from three years ago", bg: "bar counter with young patrons listening to the tale in amazement" },
    { action: "recognizing every single person in the bar from previous nights", bg: "packed bar with familiar faces and knowing nods all around" },
    { action: "watching the same patterns repeat with a wise knowing smile", bg: "elevated spot in the bar with a full view of the dance floor below" },
    { action: "closing the bar down exactly as they have done every week for years", bg: "nearly empty bar at last call with the staff cleaning around them" },
  ]},
  { id: 22, name: "The SLO Poltergeist", scenes: [
    { action: "disappearing from the group mid-conversation without anyone noticing", bg: "crowded bar interior with confused friends looking around" },
    { action: "reappearing across the bar holding drinks with no explanation", bg: "bar interior with the group turning to find them already there" },
    { action: "being spotted in three different bars at the exact same time", bg: "split view of different SLO bars with the same figure in each" },
    { action: "slipping through an impossibly packed crowd with zero effort", bg: "wall-to-wall crowd in a packed SLO bar at peak hours" },
    { action: "vanishing at the end of the night before anyone can say goodbye", bg: "SLO street at 2am with friends turning to find them already gone" },
  ]},
  { id: 23, name: "The Neon Harbinger", scenes: [
    { action: "walking down Higuera Street as every bar sign seems to light up brighter", bg: "glowing Higuera Street at night with vibrant neon bar signs" },
    { action: "pointing to the hottest bar of the night before anyone else knows", bg: "SLO sidewalk with a line already forming outside the bar ahead" },
    { action: "being recognized and waved in at every single door on the street", bg: "Higuera Street at night with bouncer after bouncer greeting them" },
    { action: "arriving somewhere and watching the energy in the room immediately shift", bg: "bar interior that visibly comes alive the moment they walk through the door" },
    { action: "leaving at the exact moment their absence starts to be felt", bg: "bar interior with the crowd unknowingly calming after their departure" },
  ]},
  { id: 24, name: "The Eternal Tab", scenes: [
    { action: "opening a tab at the bar with dangerous confidence and zero hesitation", bg: "bar counter with a smiling bartender taking the card" },
    { action: "adding more and more drinks to the tab while refusing to check the total", bg: "busy bar with the tab receipt growing longer in the background" },
    { action: "discovering the tab total at the end of the night in visible shock", bg: "bar counter late at night with an extremely long paper receipt" },
    { action: "splitting the massive tab with the group who all look deeply guilty", bg: "group of friends staring at a bill around a bar table" },
    { action: "swearing they will never open a tab again while opening another one", bg: "next bar on Higuera Street with the bartender already holding their card" },
  ]},
  { id: 25, name: "The Ghost of Higuera", scenes: [
    { action: "walking the full length of Higuera Street in perfect nostalgic silence", bg: "Higuera Street completely empty at 2am with glowing streetlights" },
    { action: "visiting every bar they have been to for five straight years in one night", bg: "series of warm glowing SLO bar doorways along the street" },
    { action: "telling a story about a legendary night on this exact street to new friends", bg: "quiet corner of a SLO bar with wide-eyed listeners around them" },
    { action: "standing outside a closed bar remembering when it used to be their spot", bg: "dark shuttered SLO bar front at night with memories in the air" },
    { action: "watching the sunrise at the end of Higuera Street after the longest night", bg: "empty Higuera Street at dawn with golden light washing over everything" },
  ]},
  { id: 26, name: "The Patio Philosopher", scenes: [
    { action: "holding an accidental group therapy session on the bar patio", bg: "outdoor SLO bar patio at night with string lights and wooden furniture" },
    { action: "refusing to go inside no matter how cold it gets on the patio", bg: "outdoor bar patio at night with everyone else headed for the door" },
    { action: "turning a casual conversation into a profound life discussion", bg: "patio corner with a small group leaning in listening intently" },
    { action: "solving someone else's relationship problems over a single drink", bg: "quiet bar patio with two people in deep focused conversation" },
    { action: "being the last one on the patio as the bar closes around them", bg: "empty bar patio at closing time with chairs being stacked nearby" },
  ]},
  { id: 27, name: "The Comeback King", scenes: [
    { action: "making a dramatic entrance at midnight after everyone thought they went home", bg: "packed SLO bar at midnight with the crowd turning to look" },
    { action: "arriving just in time to save a dying party with their energy", bg: "quiet bar that immediately comes alive when they walk through the door" },
    { action: "bouncing back from a terrible first half of the night with full confidence", bg: "lively bar interior with friends celebrating their return to form" },
    { action: "showing up at a second bar nobody expected them to make it to", bg: "bar entrance with a surprised group who thought the night was over" },
    { action: "ending the night on the highest possible note after almost going home early", bg: "peak party bar scene with confetti and everyone going wild around them" },
  ]},
  { id: 28, name: "The Midnight Alchemist", scenes: [
    { action: "ordering a mystery drink with total confidence and zero explanation", bg: "bar counter with a curious bartender mixing something unusual" },
    { action: "turning a bad night into a legendary one through pure force of personality", bg: "bar interior that visibly transforms from quiet to electric around them" },
    { action: "convincing the whole group to try a drink nobody has ever heard of", bg: "bar with skeptical friends all holding unusual colorful cocktails" },
    { action: "finding the hidden bar none of the locals even know about", bg: "secret-feeling dimly lit bar tucked off a SLO side street at night" },
    { action: "making the bartender invent a completely new drink on the spot", bg: "bar counter with the bartender experimenting with bottles and smiling" },
  ]},
  { id: 29, name: "The Streak Keeper", scenes: [
    { action: "proudly announcing their unbroken Thursday night attendance record", bg: "packed SLO bar on Thursday night with impressed friends listening" },
    { action: "showing up sick but still making it out to preserve the streak", bg: "bar entrance with the group looking concerned but proud of their arrival" },
    { action: "dragging themselves out despite every reason not to for the streak", bg: "rainy SLO street at night with the bar glowing warmly ahead of them" },
    { action: "celebrating a milestone streak number with the whole regular crowd", bg: "crowded Thursday bar with everyone cheering for the occasion" },
    { action: "documenting another successful Thursday with a ritual end-of-night photo", bg: "SLO street at 2am with the empty street and a triumphant pose" },
  ]},
  { id: 30, name: "The After Party Architect", scenes: [
    { action: "announcing the after party location before the bar has even closed", bg: "bar at last call with the crowd already looking to them for direction" },
    { action: "getting ten people to follow them to an after party across town", bg: "SLO street at 2am with a parade of people following close behind" },
    { action: "transforming a quiet apartment into a legendary after party in minutes", bg: "apartment living room being rearranged into a party space at 2am" },
    { action: "keeping the energy going at 3am when everyone else is fading", bg: "late night apartment party with tired but happy faces all around" },
    { action: "being the last one awake making sure everyone gets home safely", bg: "early morning apartment with people asleep on couches all around them" },
  ]},
  { id: 31, name: "The Scene Conductor", scenes: [
    { action: "reading the room and knowing exactly what the bar needs right now", bg: "SLO bar interior with a mixed crowd at a turning point in the night" },
    { action: "starting a spontaneous sing-along that the whole bar joins", bg: "packed bar with everyone singing along to the same song together" },
    { action: "orchestrating the perfect moment for the group photo everyone will remember", bg: "bar with perfect lighting and a joyful group assembled without being asked" },
    { action: "defusing a tense moment with humor and getting everyone laughing", bg: "crowded bar where a small conflict instantly dissolves into laughter" },
    { action: "ending the night with a toast that makes the whole bar go quiet and listen", bg: "bar at last call with every person holding a drink and paying attention" },
  ]},
  { id: 32, name: "The Network Node", scenes: [
    { action: "introducing two strangers who instantly become best friends", bg: "bar interior with two delighted people shaking hands for the first time" },
    { action: "connecting someone with the exact person they needed to meet tonight", bg: "busy bar with a meaningful introduction happening in a corner" },
    { action: "knowing literally everyone in the bar and making rounds gracefully", bg: "packed SLO bar with warm greetings happening at every table" },
    { action: "accidentally creating a group of strangers who all end up leaving together", bg: "bar exit at night with a new unlikely friend group heading out" },
    { action: "being the reason twenty different people had the night of their lives", bg: "lively bar scene with multiple conversations and connections happening at once" },
  ]},
  { id: 33, name: "The Cocktail Sorcerer", scenes: [
    { action: "explaining the exact history of a classic cocktail to an uninterested bartender", bg: "bar counter with a politely nodding bartender and waiting customers" },
    { action: "ordering something so specific the bartender has to look it up", bg: "bar counter with the bartender on their phone searching a recipe" },
    { action: "rating their cocktail with the intensity of a Michelin star judge", bg: "bar table with a perfectly made drink and a deeply focused expression" },
    { action: "convincing the bartender to make something completely off-menu", bg: "bar counter with bottles spread out and the bartender trying something new" },
    { action: "discovering the best cocktail of their life in the most unexpected bar", bg: "casual dive bar interior with an unexpectedly amazing drink in their hand" },
  ]},
  { id: 34, name: "The Floor Legend", scenes: [
    { action: "clearing the dance floor the moment they start moving", bg: "packed dance floor with everyone stepping back to watch in amazement" },
    { action: "teaching a crowd of strangers a dance move they just made up", bg: "bar dance floor with ten people trying to follow along laughing" },
    { action: "turning a slow empty dance floor into a full party through sheer will", bg: "bar with an empty dance floor slowly filling up around them" },
    { action: "getting filmed by everyone in the bar without asking for it", bg: "dance floor surrounded by phones filming the performance" },
    { action: "ending the night with a final dance that the whole bar stops to watch", bg: "bar at last call with every remaining person watching the floor" },
  ]},
  { id: 35, name: "The Omnipresent Regular", scenes: [
    { action: "being greeted by name at every single bar on Higuera Street", bg: "Higuera Street at night with multiple bartenders waving from doorways" },
    { action: "already having their drink poured before they reach the bar counter", bg: "bar counter with their usual drink waiting and the bartender smiling" },
    { action: "knowing every staff member personally at five different bars", bg: "bar interior with staff stopping work to say hello as they walk in" },
    { action: "sitting in their reserved unofficial regular spot without asking", bg: "bar interior with a corner spot that seems to be mysteriously always open" },
    { action: "leaving a bar and having the staff genuinely sad to see them go", bg: "bar exit at night with staff waving goodbye from behind the counter" },
  ]},
  { id: 36, name: "The Higuera Saint", scenes: [
    { action: "helping a lost freshman find their group at midnight without hesitation", bg: "busy Higuera Street at night with confused newcomers nearby" },
    { action: "making sure everyone in the group gets home safely before leaving themselves", bg: "SLO street at 2am organizing rides and walking people to Ubers" },
    { action: "giving their jacket to someone cold waiting in line outside", bg: "bar entrance at night with a grateful person now wearing their jacket" },
    { action: "de-escalating a situation before it becomes a problem with calm words", bg: "crowded bar entrance with a tense moment dissolving peacefully" },
    { action: "ending the night knowing they made someone else's night better", bg: "quiet Higuera Street at dawn walking home alone with a satisfied smile" },
  ]},
  { id: 37, name: "The Downtown Deity", scenes: [
    { action: "walking into the best bar of the night like they own the building", bg: "packed SLO bar interior that goes slightly quieter when they arrive" },
    { action: "being offered a free drink from a stranger who just felt like they should", bg: "bar counter with a confused but grateful expression accepting the gesture" },
    { action: "effortlessly commanding the best table in the house with a single look", bg: "busy restaurant bar with everyone already making room for them" },
    { action: "having the DJ play their favorite song without making a request", bg: "dance floor with the crowd reacting to the perfect song selection" },
    { action: "departing the bar as the entire room subtly dims in their absence", bg: "bar entrance at night with the crowd unconsciously turning to watch them leave" },
  ]},
  { id: 38, name: "The Bishop Peak Barfly", scenes: [
    { action: "telling bar stories that are as legendary as the mountain itself", bg: "SLO bar with Bishop Peak visible through the window at night" },
    { action: "doing a sunrise hike up Bishop Peak after a full night out", bg: "Bishop Peak trail at dawn with the SLO valley glowing below" },
    { action: "comparing the view from the peak to the view from the bar with equal reverence", bg: "bar patio at night with Bishop Peak silhouetted on the horizon" },
    { action: "being as unmovable and reliable at the bar as the mountain itself", bg: "busy bar interior with everyone moving around their perfectly still presence" },
    { action: "leaving the bar at sunrise headed straight for the trailhead", bg: "SLO street at dawn with hiking boots and bar wristband still on" },
  ]},
  { id: 39, name: "The Mustang Phantom", scenes: [
    { action: "representing Cal Poly with loud proud energy at every downtown bar", bg: "SLO bar packed with college students in green and gold" },
    { action: "organizing an impromptu Cal Poly alumni reunion at a random bar", bg: "bar interior with surprised former classmates gathering around them" },
    { action: "turning a Thursday bar night into a de facto Cal Poly homecoming", bg: "packed SLO bar with Cal Poly pride visible on shirts and hats everywhere" },
    { action: "finding a fellow Mustang in an unexpected bar and treating them like family", bg: "quiet corner of a bar with an instant bond forming between two strangers" },
    { action: "finishing the night on the Cal Poly campus steps telling stories of the old days", bg: "Cal Poly campus at night glowing quietly under the stars" },
  ]},
  { id: 40, name: "The SLO Specter", scenes: [
    { action: "drifting through every bar on Higuera Street in a single legendary night", bg: "Higuera Street at night with every bar visible and glowing" },
    { action: "observing the night from a quiet corner with knowing eyes", bg: "busy bar interior with them watching the scene unfold from the edge" },
    { action: "being remembered by every bartender but never quite placing when they last came in", bg: "bar counter with a bartender trying to remember and failing" },
    { action: "leaving no trace except the feeling that the night was better with them in it", bg: "SLO street at 2am with their silhouette disappearing into the night" },
    { action: "appearing in the background of every group photo without anyone noticing", bg: "bar interior with groups taking photos and a familiar face just behind" },
  ]},
  { id: 41, name: "The Undying Thursday", scenes: [
    { action: "being the first one out on Thursday and the last one standing", bg: "packed SLO Thursday bar at peak energy with the night just beginning" },
    { action: "converting a Wednesday person into a Thursday person in real time", bg: "bar on Thursday night with a convert experiencing their first real Thursday" },
    { action: "knowing every Thursday bar special by heart and ordering perfectly", bg: "bar counter on Thursday with a perfectly executed order and a smiling bartender" },
    { action: "treating every Thursday like it might be the greatest one yet", bg: "glowing downtown SLO Thursday night with electric street energy" },
    { action: "sitting alone at the bar at 2am Thursday with a quiet satisfied smile", bg: "nearly empty bar at last call on Thursday night winding peacefully down" },
  ]},
  { id: 42, name: "The Final Round", scenes: [
    { action: "ordering the last round of the night with dramatic ceremony", bg: "bar at last call with the lights beginning to brighten slowly" },
    { action: "making a heartfelt toast to the entire night as it wraps up", bg: "bar with the remaining group all holding their final drinks close" },
    { action: "convincing the bartender to pour one more after last call with charm", bg: "bar counter at closing time with the bartender secretly smiling and pouring" },
    { action: "savoring the last sip of the night like it deserves to be remembered", bg: "quiet bar at close with most people gone and warm amber lighting" },
    { action: "walking out into the cool SLO night after the perfect final round", bg: "Higuera Street at 2am with the bar door closing softly behind them" },
  ]},
  { id: 43, name: "The Immortal Regular", scenes: [
    { action: "sitting at the bar that has been their spot for longer than anyone can remember", bg: "classic SLO bar with worn wood and decades of character in every corner" },
    { action: "telling a story about a bar that no longer exists to wide-eyed listeners", bg: "bar interior with younger patrons leaning in to hear about the old days" },
    { action: "being the living memory of what every bar used to be", bg: "busy modern SLO bar with nostalgic photos on the walls behind them" },
    { action: "outlasting every trend and still being the most interesting person in the room", bg: "trendy bar interior with them at the center looking entirely at ease" },
    { action: "closing a bar for the thousandth time and meaning it as much as the first", bg: "bar at last call with staff waving and the lights coming fully on" },
  ]},
  { id: 44, name: "The SLO Singularity", scenes: [
    { action: "walking into a bar and instantly becoming the center of every conversation", bg: "lively SLO bar interior with everyone unconsciously gravitating toward them" },
    { action: "creating a moment so memorable the whole bar stops and takes it in", bg: "packed bar with everyone pausing to witness something unforgettable" },
    { action: "pulling together five separate friend groups into one giant spontaneous party", bg: "bar interior with previously separate groups now all celebrating together" },
    { action: "being the story everyone tells about that one crazy night downtown", bg: "bar interior with multiple people retelling the same tale to different groups" },
    { action: "leaving the bar as the night begins to slowly fall apart without them", bg: "SLO street at night with the bar behind them visibly losing energy" },
  ]},
  { id: 45, name: "The Eternal", scenes: [
    { action: "sitting at the exact same spot they have occupied for what feels like forever", bg: "timeless SLO bar with warm golden light and the feeling of every era at once" },
    { action: "being on a first name basis with a bartender whose parents they also knew", bg: "classic SLO bar with generational photos on the wall and a young bartender" },
    { action: "watching the same patterns play out for the hundredth time with gentle amusement", bg: "busy bar interior with the usual scenes unfolding all around them" },
    { action: "giving advice to a nervous freshman that turns out to be exactly right", bg: "bar counter with a young wide-eyed newcomer listening carefully" },
    { action: "watching the sunrise over SLO after another perfect night as if it is the first time", bg: "SLO rooftop at dawn with the city glowing softly below in early morning light" },
  ]},
  { id: 46, name: "The Godfather", scenes: [
    { action: "nodding once and watching the entire situation resolve itself immediately", bg: "crowded SLO bar with a tense situation dissolving at a single gesture" },
    { action: "being given the best seat in the house the moment they walk through the door", bg: "busy bar interior with staff immediately clearing the prime spot for them" },
    { action: "settling a dispute between two groups with three calm quiet words", bg: "bar entrance at night with two groups suddenly looking satisfied and walking away" },
    { action: "having every tab on the table mysteriously covered without asking", bg: "bar table at the end of the night with a zero balance and grateful friends" },
    { action: "departing early and leaving the bar forever changed by their brief presence", bg: "SLO bar entrance at night with the door swinging shut and a feeling of reverence" },
  ]},
  { id: 47, name: "The Crown", scenes: [
    { action: "arriving at the bar as if the whole night was planned around their entrance", bg: "packed SLO bar that seems to light up the moment they arrive" },
    { action: "being toasted by strangers who somehow feel it is the right thing to do", bg: "crowded bar with multiple glasses raised in their direction unprompted" },
    { action: "holding court in the center of the bar with total effortless authority", bg: "bar interior with a natural circle of engaged people around them" },
    { action: "receiving a standing ovation for simply showing up on a Tuesday", bg: "half-empty bar where the few remaining people genuinely cheer their arrival" },
    { action: "leaving the bar as the undisputed highlight of everyone's evening", bg: "bar exit at night with the crowd visibly reluctant to watch them go" },
  ]},
  { id: 48, name: "The Infinite", scenes: [
    { action: "starting the night at sunset and still going strong at sunrise", bg: "SLO rooftop transitioning from golden sunset to pale dawn light" },
    { action: "visiting every bar on Higuera Street twice in a single legendary night", bg: "Higuera Street at 3am still lit and alive with them at the center of it" },
    { action: "discovering a new bar they have somehow never been to after years of trying", bg: "hidden SLO bar tucked away on a side street glowing with new discovery energy" },
    { action: "being the reason the party keeps going long after it should have ended", bg: "late night bar interior with tired but happy people staying because of them" },
    { action: "watching the last bar close and still not quite ready for the night to end", bg: "Higuera Street at 2am completely quiet with one last glowing light ahead" },
  ]},
  { id: 49, name: "The Pinnacle", scenes: [
    { action: "standing at the top of their game on the best night downtown in years", bg: "packed electric SLO bar at peak energy with everything going perfectly" },
    { action: "having every single plan for the night come together flawlessly", bg: "Higuera Street at night with the whole crew together and every bar open" },
    { action: "being in the right place at exactly the right moment without trying", bg: "perfectly lit SLO bar at the precise moment the whole night clicks into place" },
    { action: "giving a toast that makes everyone feel like they are exactly where they belong", bg: "crowded bar with every person genuinely present and happy in the moment" },
    { action: "walking home at dawn knowing this was the one that everything else pointed toward", bg: "empty glowing SLO street at dawn with a quiet triumphant walk home" },
  ]},
  { id: 50, name: "The Complete", scenes: [
    { action: "simply being out, drink in hand, needing nothing more than this moment", bg: "perfect SLO bar scene with warm light, great music, and good people all around" },
    { action: "watching everyone else discover what they figured out years ago", bg: "busy SLO bar with newcomers experiencing their first legendary downtown night" },
    { action: "having a conversation that makes a stranger feel seen and understood", bg: "quiet corner of a busy bar with warm intimate lighting and genuine connection" },
    { action: "closing the bar for the last time with a full heart and zero regrets", bg: "bar at last call with warm light and the perfect final moment of the evening" },
    { action: "walking home through downtown SLO knowing the city is exactly what it should be", bg: "Higuera Street at 2am glowing softly with the feeling of a perfect night behind them" },
  ]},
];

// ── CHARACTER HELPERS ──
function getCharacterForLevel(level) {
  const clampedLevel = Math.max(1, Math.min(250, level));
  const charIndex    = Math.min(49, Math.floor((clampedLevel - 1) / 5));
  const sceneIndex   = (clampedLevel - 1) % 5;
  return { character: CHARACTERS[charIndex], sceneIndex, charIndex };
}

function buildPrompt(character, sceneIndex) {
  const scene = character.scenes[sceneIndex];
  return `3D Pixar-style cartoon, ${character.name}, ${scene.action}, background: ${scene.bg}, soft lighting, vibrant colors, no text, no watermark`;
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

  // Load extra stats
  loadProfileExtras();
}

async function loadProfileExtras() {
  if (!currentUser) return;

  // Streak
  const streak = await getCheckinStreak();
  const streakEl = document.getElementById('stat-streak');
  if (streakEl) streakEl.textContent = streak;

  // Update streak pill on lines page
  const streakPill = document.getElementById('streak-pill');
  const streakCount = document.getElementById('streak-count');
  if (streakPill && streakCount) {
    streakCount.textContent = streak;
    streakPill.style.display = streak > 0 ? 'inline-flex' : 'none';
  }

  // Duel wins
  const duelWins = await getDuelWins();
  const duelEl = document.getElementById('stat-duel-wins');
  if (duelEl) duelEl.textContent = duelWins;

  // Prediction accuracy
  try {
    const { data } = await supabaseClient
      .from('predictions')
      .select('correct_count, pick_count')
      .eq('user_id', currentUser.id)
      .not('correct_count', 'is', null);
    if (data && data.length > 0) {
      const totalPicks = data.reduce((s, r) => s + (r.pick_count || 0), 0);
      const totalRight = data.reduce((s, r) => s + (r.correct_count || 0), 0);
      const acc = totalPicks > 0 ? Math.round((totalRight / totalPicks) * 100) + '%' : '—';
      const accEl = document.getElementById('stat-pred-acc');
      if (accEl) accEl.textContent = acc;
    }
  } catch(e) { /* silent */ }

  // Recent badges
  renderRecentBadges();

  // Update ach modal count
  const countEl = document.getElementById('ach-modal-count');
  if (countEl) countEl.textContent = earnedAchievements.size + ' earned';

  // Activity feed
  loadActivityFeed();
}

// ── RENDER CHARACTER CARD — auto-loads from storage ──

// ══════════════════════════════════════════════
// CHARACTER CREATOR — Custom Canvas Builder
// ══════════════════════════════════════════════

const CC = {
  step: 0,
  archetype: 0,
  skin: '#F5C98A',
  expression: '😊',
  hairStyle: 0,
  hairColor: '#1a1a1a',
  outfitColor: '#ff2d78',
  outfitStyle: 0,
  bgType: 0,
};

const CC_ARCHETYPES = [
  { emoji:'🌙', name:'Night Owl',   color:'#b44fff' },
  { emoji:'🍺', name:'The Regular', color:'#f59e0b' },
  { emoji:'🦋', name:'Social',      color:'#ff2d78' },
  { emoji:'🌊', name:'Explorer',    color:'#06b6d4' },
  { emoji:'🔥', name:'Trendsetter', color:'#ef4444' },
  { emoji:'🎮', name:'Game Master', color:'#22c55e' },
];
const CC_SKINS    = ['#FFDAB9','#F5C98A','#D4956A','#A0694A','#7B4F3A','#4A2C1A'];
const CC_EXPRS    = ['😊','😎','🤙','😤','🥳','😏','😈','🤩','🥶','😴'];
const CC_HSTYLES  = ['👱','🧑','👩','🧔','👲','🙍','💇','🧑‍🦱','🧑‍🦳','🧑‍🦲'];
const CC_HCOLORS  = ['#1a1a1a','#4a3728','#8B4513','#D4A017','#FF6B6B','#FF2D78','#b44fff','#06b6d4','#22c55e','#ffffff','#ff9500','#00ff88'];
const CC_OCOLORS  = ['#ff2d78','#b44fff','#06b6d4','#22c55e','#f59e0b','#ef4444','#1e3a5f','#1a1a2e','#ff6b35','#00ff88'];
const CC_OSTYLES  = ['👕','🧥','🥻','🎽','👔','🧣','🥋','🩱','🎪','🧤'];
const CC_BGS      = [
  {label:'Night',  c:['#06060f','#0d0d1f']},
  {label:'Neon',   c:['#1a0030','#2d0050']},
  {label:'Ocean',  c:['#001529','#003049']},
  {label:'Fire',   c:['#1a0000','#3d0000']},
  {label:'Forest', c:['#001a00','#003000']},
  {label:'Gold',   c:['#1a1200','#332500']},
  {label:'Sunset', c:['#2d1500','#4a1a00']},
  {label:'Cyber',  c:['#001a1a','#002d2d']},
];
const CC_ACCESSORIES = [
  {emoji:'🎩', name:'Top Hat'},
  {emoji:'😎', name:'Sunglasses'},
  {emoji:'🎧', name:'Headphones'},
  {emoji:'⌚', name:'Watch'},
  {emoji:'🧢', name:'Cap'},
  {emoji:'💎', name:'Diamond'},
  {emoji:'🔮', name:'Crystal'},
  {emoji:'🌟', name:'Star'},
  {emoji:'—',  name:'None'},
];

// Selected accessories (multi-select)
let ccAccessories = [];

function openCharacterCreator() {
  // Reset to saved state or defaults
  const saved = localStorage.getItem('dtslo_char_state');
  if (saved) { try { Object.assign(CC, JSON.parse(saved)); } catch(e) {} }
  CC.step = 0;
  ccAccessories = [];

  let modal = document.getElementById('char-creator-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'char-creator-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#06060f;display:flex;flex-direction:column;overflow:hidden';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  ccRender();
}

function closeCharacterCreator() {
  const modal = document.getElementById('char-creator-modal');
  if (modal) modal.style.display = 'none';
}

function ccRender() {
  const modal = document.getElementById('char-creator-modal');
  if (!modal) return;

  const stepTitles = [
    'Who are you?',
    'Your face',
    'Hair',
    'Outfit',
    'Background',
    'Accessories',
    'Final touches',
  ];
  const totalSteps = 7;

  modal.innerHTML = `
    <div style="padding:16px 20px 0;flex-shrink:0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:18px;font-weight:800;font-family:Georgia,serif">✨ Character Creator</div>
        <button onclick="closeCharacterCreator()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:34px;height:34px;border-radius:50%;font-size:16px;cursor:pointer">✕</button>
      </div>
      <div style="display:flex;gap:4px;margin-bottom:4px">
        ${Array.from({length:totalSteps},(_,i)=>`<div style="flex:1;height:3px;border-radius:2px;background:${i<CC.step?'#ffd700':i===CC.step?'#ff2d78':'rgba(255,255,255,0.1)'}"></div>`).join('')}
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:10px">Step ${CC.step+1} of ${totalSteps} — ${stepTitles[CC.step]}</div>
    </div>

    <div style="padding:0 20px 8px;display:flex;justify-content:center;flex-shrink:0">
      <canvas id="cc-canvas" width="220" height="220" style="border-radius:50%;border:3px solid rgba(255,255,255,0.1);box-shadow:0 0 30px rgba(255,45,120,0.2)"></canvas>
    </div>

    <div id="cc-step-content" style="flex:1;overflow-y:auto;padding:0 20px 8px"></div>

    <div style="display:flex;gap:10px;padding:12px 20px 32px;flex-shrink:0">
      ${CC.step > 0 ? '<button onclick="ccBack()" style="flex:1;padding:13px;border-radius:16px;border:none;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.5);font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">← Back</button>' : ''}
      ${CC.step < totalSteps-1
        ? '<button onclick="ccNext()" style="flex:2;padding:13px;border-radius:16px;border:none;background:linear-gradient(135deg,#ff2d78,#b44fff);color:white;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">Next →</button>'
        : '<button onclick="ccSave()" style="flex:2;padding:13px;border-radius:16px;border:none;background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer">Save Character ✓</button>'
      }
    </div>
  `;

  ccRenderStep();
  ccDrawAvatar();
}

function ccRenderStep() {
  const el = document.getElementById('cc-step-content');
  if (!el) return;

  if (CC.step === 0) {
    // Archetype
    el.innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">` +
      CC_ARCHETYPES.map((a,i) => `
        <div onclick="CC.archetype=${i};CC.outfitColor='${a.color}';ccRender()"
          style="padding:12px 8px;border-radius:14px;background:rgba(255,255,255,${CC.archetype===i?'0.08':'0.03'});border:2px solid ${CC.archetype===i?a.color:'rgba(255,255,255,0.08)'};cursor:pointer;text-align:center;transition:all 0.15s">
          <div style="font-size:28px;margin-bottom:4px">${a.emoji}</div>
          <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.7)">${a.name}</div>
        </div>`).join('') + '</div>';

  } else if (CC.step === 1) {
    // Face
    el.innerHTML = `
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Skin Tone</div>
      <div style="display:flex;gap:10px;margin-bottom:16px">
        ${CC_SKINS.map(s=>`<div onclick="CC.skin='${s}';ccRender()" style="width:38px;height:38px;border-radius:50%;background:${s};cursor:pointer;border:3px solid ${CC.skin===s?'#ffd700':'transparent'};transition:all 0.15s;transform:${CC.skin===s?'scale(1.15)':'scale(1)'}"></div>`).join('')}
      </div>
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Expression</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${CC_EXPRS.map(e=>`<div onclick="CC.expression='${e}';ccRender()" style="width:44px;height:44px;border-radius:12px;font-size:24px;background:rgba(255,255,255,${CC.expression===e?'0.1':'0.04'});border:2px solid ${CC.expression===e?'#ff2d78':'rgba(255,255,255,0.08)'};cursor:pointer;display:flex;align-items:center;justify-content:center">${e}</div>`).join('')}
      </div>`;

  } else if (CC.step === 2) {
    // Hair
    el.innerHTML = `
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Style</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:14px">
        ${CC_HSTYLES.map((h,i)=>`<div onclick="CC.hairStyle=${i};ccRender()" style="aspect-ratio:1;border-radius:12px;font-size:24px;background:rgba(255,255,255,${CC.hairStyle===i?'0.1':'0.03'});border:2px solid ${CC.hairStyle===i?'#b44fff':'rgba(255,255,255,0.08)'};cursor:pointer;display:flex;align-items:center;justify-content:center">${h}</div>`).join('')}
      </div>
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Color</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${CC_HCOLORS.map(c=>`<div onclick="CC.hairColor='${c}';ccRender()" style="width:32px;height:32px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${CC.hairColor===c?'white':'transparent'};transform:${CC.hairColor===c?'scale(1.2)':'scale(1)'};transition:all 0.15s${c==='#ffffff'?';border:3px solid rgba(255,255,255,0.3)':''}"></div>`).join('')}
      </div>`;

  } else if (CC.step === 3) {
    // Outfit
    el.innerHTML = `
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Style</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:14px">
        ${CC_OSTYLES.map((e,i)=>`<div onclick="CC.outfitStyle=${i};ccRender()" style="aspect-ratio:1;border-radius:12px;font-size:22px;background:${CC.outfitStyle===i?CC.outfitColor+'22':'rgba(255,255,255,0.03)'};border:2px solid ${CC.outfitStyle===i?CC.outfitColor:'rgba(255,255,255,0.08)'};cursor:pointer;display:flex;align-items:center;justify-content:center">${e}</div>`).join('')}
      </div>
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Color</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${CC_OCOLORS.map(c=>`<div onclick="CC.outfitColor='${c}';ccRender()" style="width:32px;height:32px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${CC.outfitColor===c?'white':'transparent'};transform:${CC.outfitColor===c?'scale(1.2)':'scale(1)'};transition:all 0.15s"></div>`).join('')}
      </div>`;

  } else if (CC.step === 4) {
    // Background
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${CC_BGS.map((bg,i)=>`<div onclick="CC.bgType=${i};ccRender()" style="aspect-ratio:1;border-radius:14px;background:linear-gradient(135deg,${bg.c[0]},${bg.c[1]});border:2px solid ${CC.bgType===i?'#ffd700':'rgba(255,255,255,0.08)'};cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;font-size:9px;font-weight:800;color:rgba(255,255,255,0.6)">${bg.label}</div>`).join('')}
      </div>`;

  } else if (CC.step === 5) {
    // Accessories
    el.innerHTML = `
      <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:12px">Select up to 2 accessories</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${CC_ACCESSORIES.map((a,i)=>{
          const sel = ccAccessories.includes(i);
          return `<div onclick="ccToggleAccessory(${i})" style="padding:10px;border-radius:14px;background:rgba(255,255,255,${sel?'0.08':'0.03'});border:2px solid ${sel?'#ffd700':'rgba(255,255,255,0.08)'};cursor:pointer;text-align:center">
            <div style="font-size:24px;margin-bottom:4px">${a.emoji}</div>
            <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.6)">${a.name}</div>
          </div>`;
        }).join('')}
      </div>`;

  } else if (CC.step === 6) {
    // Final - name your character
    const arch = CC_ARCHETYPES[CC.archetype];
    el.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:28px;margin-bottom:8px">${arch.emoji}</div>
        <div style="font-size:16px;font-weight:800;color:#ffd700">${arch.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px">Your archetype</div>
      </div>
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px">Character nickname (optional)</div>
      <input id="cc-nickname" placeholder="Leave blank to use your username" maxlength="20"
        style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:white;font-size:14px;font-family:inherit;outline:none;margin-bottom:16px">
      <div style="padding:12px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.15);border-radius:12px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6">
        ✨ Your character will appear on your profile, the leaderboard, and in future character features. You can edit it anytime from your profile settings.
      </div>`;
  }
}

function ccToggleAccessory(i) {
  const idx = ccAccessories.indexOf(i);
  if (idx >= 0) {
    ccAccessories.splice(idx, 1);
  } else if (ccAccessories.length < 2) {
    ccAccessories.push(i);
  }
  ccRender();
}

function ccNext() { if (CC.step < 6) { CC.step++; ccRender(); } }
function ccBack() { if (CC.step > 0) { CC.step--; ccRender(); } }

async function ccSave() {
  const canvas = document.getElementById('cc-canvas');
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  const nickname = document.getElementById('cc-nickname')?.value?.trim() || '';

  // Save state locally
  localStorage.setItem('dtslo_char_state', JSON.stringify(CC));
  localStorage.setItem('dtslo_avatar_render', dataUrl);
  if (nickname) localStorage.setItem('dtslo_char_nickname', nickname);

  // Save to Supabase
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
      await supabaseClient.from('profiles').update({
        avatar_render_url: dataUrl,
        character_data: JSON.stringify({
          archetype: CC.archetype,
          archetypeName: CC_ARCHETYPES[CC.archetype].name,
          archetypeEmoji: CC_ARCHETYPES[CC.archetype].emoji,
          nickname,
          accessories: ccAccessories,
        })
      }).eq('id', user.id);
    }
  } catch(e) {
    console.warn('[CharCreator save]', e);
  }

  closeCharacterCreator();
  displayAvatar(dataUrl);
  if (typeof showToast === 'function') showToast('✨ Character saved!');
}

function ccDrawAvatar() {
  const canvas = document.getElementById('cc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const bg = CC_BGS[CC.bgType];
  const arch = CC_ARCHETYPES[CC.archetype];

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(W/2, H/2, W/2, 0, Math.PI*2);
  ctx.clip();

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, bg.c[0]);
  grad.addColorStop(1, bg.c[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Body
  ctx.fillStyle = CC.outfitColor;
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.85, W*0.35, H*0.25, 0, 0, Math.PI*2);
  ctx.fill();

  // Neck
  ctx.fillStyle = CC.skin;
  ctx.fillRect(W/2-11, H*0.56, 22, 24);

  // Head
  ctx.fillStyle = CC.skin;
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.42, 50, 56, 0, 0, Math.PI*2);
  ctx.fill();

  // Hair base
  ctx.fillStyle = CC.hairColor;
  ctx.beginPath();
  ctx.ellipse(W/2, H*0.32, 53, 44, 0, Math.PI, 0);
  ctx.fill();

  // Hair style variations
  const hs = CC.hairStyle;
  if ([0,2,5,8].includes(hs)) {
    ctx.fillRect(W/2-52, H*0.32, 12, 42);
    ctx.fillRect(W/2+40, H*0.32, 12, 42);
  }
  if ([3,5].includes(hs)) {
    ctx.fillStyle = CC.hairColor + 'aa';
    ctx.beginPath();
    ctx.ellipse(W/2, H*0.53, 22, 9, 0, 0, Math.PI);
    ctx.fill();
  }
  if (hs === 4) {
    ctx.fillStyle = CC.hairColor;
    ctx.beginPath();
    ctx.arc(W/2, H*0.19, 16, 0, Math.PI*2);
    ctx.fill();
  }
  if (hs === 7 || hs === 9) {
    [-32,-16,0,16,32].forEach(x => {
      ctx.fillStyle = CC.hairColor;
      ctx.beginPath();
      ctx.arc(W/2+x, H*0.24, 11, 0, Math.PI*2);
      ctx.fill();
    });
  }
  if (hs === 8) {
    // White/gray sides
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(W/2-52, H*0.32, 12, 30);
    ctx.fillRect(W/2+40, H*0.32, 12, 30);
  }

  // Eyes
  const eyeY = H*0.42;
  if (CC.expression === '😎') {
    // Sunglasses
    ctx.fillStyle = '#1a1a2e';
    [[W/2-22,16],[W/2+22,16]].forEach(([ex,r])=>{
      ctx.beginPath(); ctx.ellipse(ex,eyeY,r,11,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1.5; ctx.stroke();
    });
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(W/2-6,eyeY-2); ctx.lineTo(W/2+6,eyeY-2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2-38,eyeY-6); ctx.lineTo(W/2-38,eyeY-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2+38,eyeY-6); ctx.lineTo(W/2+38,eyeY-14); ctx.stroke();
  } else {
    [W/2-20, W/2+20].forEach(ex => {
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.ellipse(ex,eyeY,9,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath(); ctx.arc(ex,eyeY,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(ex+2,eyeY-1,1.5,0,Math.PI*2); ctx.fill();
    });
  }

  // Eyebrows
  if (CC.expression !== '😎') {
    ctx.strokeStyle = CC.hairColor;
    ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    const brow = CC.expression === '😤' ? -1 : 0;
    [[W/2-28,W/2-12],[W/2+12,W/2+28]].forEach(([x1,x2])=>{
      ctx.beginPath();
      ctx.moveTo(x1, eyeY-13+brow);
      ctx.lineTo(x2, eyeY-13-brow);
      ctx.stroke();
    });
  }

  // Mouth
  const my = H*0.52;
  ctx.strokeStyle = '#8B4513'; ctx.lineWidth=2.5; ctx.lineCap='round';
  const expr = CC.expression;
  if (['😊','🥳','🤩'].includes(expr)) {
    ctx.beginPath(); ctx.arc(W/2, my-3, 15, 0.2, Math.PI-0.2); ctx.stroke();
  } else if (['😤','🥶'].includes(expr)) {
    ctx.beginPath(); ctx.arc(W/2, my+6, 12, Math.PI+0.2, -0.2); ctx.stroke();
  } else if (expr === '😴') {
    ctx.beginPath(); ctx.moveTo(W/2-12,my); ctx.lineTo(W/2+12,my); ctx.stroke();
    // ZZZ
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('z z z', W/2+35, eyeY-10);
  } else if (expr === '😈') {
    ctx.beginPath(); ctx.arc(W/2, my-3, 15, 0.2, Math.PI-0.2); ctx.stroke();
    // Horns
    ctx.fillStyle = '#ff2d78';
    [[W/2-44,H*0.16],[W/2+44,H*0.16]].forEach(([hx,hy])=>{
      ctx.beginPath();
      ctx.moveTo(hx-6,hy+14); ctx.lineTo(hx,hy-4); ctx.lineTo(hx+6,hy+14);
      ctx.closePath(); ctx.fill();
    });
  } else if (expr === '😏') {
    ctx.beginPath();
    ctx.moveTo(W/2-14,my+2); ctx.quadraticCurveTo(W/2,my-5,W/2+14,my+4); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(W/2, my-3, 15, 0.2, Math.PI-0.2); ctx.stroke();
  }

  // Accessories overlay
  ccAccessories.forEach((ai, idx) => {
    const acc = CC_ACCESSORIES[ai];
    if (acc.emoji === '—') return;
    ctx.font = `${idx===0?28:22}px serif`;
    ctx.textAlign = 'center';
    if (idx === 0) ctx.fillText(acc.emoji, W/2, H*0.22);
    if (idx === 1) ctx.fillText(acc.emoji, W*0.82, H*0.38);
  });

  // Archetype badge
  ctx.restore();
  ctx.fillStyle = arch.color + 'cc';
  const bw = 80, bh = 22;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(W/2-bw/2, H*0.87, bw, bh, 11);
  else ctx.rect(W/2-bw/2, H*0.87, bw, bh);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = 'bold 10px Helvetica Neue';
  ctx.textAlign = 'center';
  ctx.fillText(arch.emoji + ' ' + arch.name, W/2, H*0.87+15);
}

// ══════════════════════════════════════════════
// TITLE & ITEM SYSTEM
// ══════════════════════════════════════════════

const TITLES = [
  { level: 1,  title: 'The Newcomer',   color: 'rgba(255,255,255,0.3)' },
  { level: 3,  title: 'The Regular',    color: 'rgba(255,255,255,0.5)' },
  { level: 5,  title: 'Bar Star',       color: '#ffd700' },
  { level: 8,  title: 'Scene Kid',      color: '#00f5ff' },
  { level: 10, title: 'Downtown Local', color: '#b44fff' },
  { level: 15, title: 'SLO Insider',    color: '#ff2d78' },
  { level: 20, title: 'SLO Legend',     color: 'linear-gradient(90deg,#ff2d78,#ffd700)' },
  { level: 25, title: 'MENU OG',        color: 'linear-gradient(90deg,#ffd700,#b44fff)' },
];

const ITEMS = [
  { level: 2,  emoji: '⭐', label: 'First Star',    rarity: 'common' },
  { level: 4,  emoji: '🎯', label: 'Sharp Eye',     rarity: 'common' },
  { level: 6,  emoji: '🔥', label: 'On Fire',       rarity: 'uncommon' },
  { level: 8,  emoji: '💎', label: 'Diamond',       rarity: 'uncommon' },
  { level: 10, emoji: '👑', label: 'Crown',         rarity: 'rare' },
  { level: 12, emoji: '🌟', label: 'All Star',      rarity: 'rare' },
  { level: 15, emoji: '⚡', label: 'Electric',      rarity: 'rare' },
  { level: 18, emoji: '🏆', label: 'Champion',      rarity: 'legendary' },
  { level: 20, emoji: '🎭', label: 'Icon',          rarity: 'legendary' },
  { level: 25, emoji: '🌈', label: 'MENU OG',       rarity: 'legendary' },
];

function getTitleForLevel(level) {
  let current = TITLES[0];
  for (const t of TITLES) {
    if (level >= t.level) current = t;
  }
  return current;
}

function getItemsForLevel(level) {
  return ITEMS.filter(i => level >= i.level);
}

function renderTitleAndItems(level) {
  const titleData = getTitleForLevel(level);
  const items = getItemsForLevel(level);

  // Title badge
  const titleRow = document.getElementById('char-title-row');
  const titleBadge = document.getElementById('char-title-badge');
  if (titleRow && titleBadge && level > 0) {
    titleBadge.textContent = titleData.title;
    titleBadge.style.background = titleData.color.includes('gradient')
      ? titleData.color.replace('linear-gradient', 'linear-gradient').replace('90deg', '135deg') + '22'
      : 'rgba(255,215,0,0.1)';
    titleRow.style.display = 'block';
  }

  // Items row
  const itemsRow = document.getElementById('char-items-row');
  if (itemsRow && items.length) {
    itemsRow.style.display = 'flex';
    itemsRow.innerHTML = items.map(i =>
      `<div title="${i.label}" style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:16px">${i.emoji}</div>`
    ).join('');
  }
}


function renderCharacterCard() {
  if (!currentUser) return;
  const level = Math.max(1, Math.floor(userXP / 100) + 1);
  loadCharacterImage(level);
}

async function loadCharacterImage(level) {
  const placeholder = document.getElementById('char-placeholder');
  const img = document.getElementById('char-img');
  if (!placeholder || !img) return;

  const gender = getGender() || 'male';
  const urls = [
    getCharacterStorageUrl(level, gender),       // new gender format
    getCharacterStorageUrl(level, gender === 'male' ? 'female' : 'male'), // other gender
    getCharacterStorageUrlFallback(level),        // old format
  ];

  for (const url of urls) {
    const found = await new Promise(resolve => {
      const t = new Image();
      t.onload = () => resolve(url);
      t.onerror = () => resolve(null);
      t.src = url + '?t=' + Date.now();
    });
    if (found) {
      placeholder.style.display = 'none';
      img.src = found + '?t=' + Date.now();
      img.style.display = 'block';
      return;
    }
  }
  // Nothing found
  img.style.display = 'none';
  placeholder.style.display = 'flex';
  placeholder.innerHTML = '<div style="font-size:48px">🎭</div><span style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:6px">No character yet</span>';
}

// ── SUPABASE STORAGE BASE URL ──
const CHAR_STORAGE_BASE = 'https://jwgwufggptpdmgcmmqes.supabase.co/storage/v1/object/public/characters';

function getCharacterStorageUrl(level, gender) {
  const padded = String(level).padStart(3, '0');
  const g = gender || getGender() || 'male';
  // Try slot 1 by default — falls back to old format if not found
  return `${CHAR_STORAGE_BASE}/level_${padded}_${g}_1.jpg`;
}

function getCharacterStorageUrlFallback(level) {
  // Old format fallback
  const padded = String(level).padStart(3, '0');
  return `${CHAR_STORAGE_BASE}/level_${padded}.jpg`;
}

// ── generateCharacter kept as no-op for compatibility ──
async function generateCharacter() {}

// ── SHARE CHARACTER ──
async function shareCharacter() {
  const img = document.getElementById('char-img');
  if (!img) return;
  const level = Math.max(1, Math.floor(userXP / 100) + 1);
  const { character } = getCharacterForLevel(level);
  const text = `I'm "${character.name}" on DTSLO — Level ${level}! 🍻 dtslomenu.com`;
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
  const { sceneIndex: preScene } = getCharacterForLevel(nextLevel);
  const prompt = buildPrompt(character, preScene);
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

  const { character, sceneIndex: newSceneIndex } = getCharacterForLevel(newLevel);

  // Try storage URL first
  const storageUrl = getCharacterStorageUrl(newLevel);
  let imageUrl = null;

  try {
    const testRes = await fetch(storageUrl, { method: 'HEAD' });
    if (testRes.ok) imageUrl = storageUrl;
  } catch(e) { /* fall through */ }

  if (imageUrl) {
    if (!window._devSuppressLevelUp) { showLevelUpPopup(newLevel, character, imageUrl, false); fireConfetti(); }
    const profileWrap = document.querySelector('.char-img-wrap');
    if (profileWrap) {
      profileWrap.innerHTML = `<img id="char-img" src="${imageUrl}" alt="Your character" style="width:100%;height:100%;object-fit:cover;border-radius:20px">`;
      const shareBtn = document.getElementById('char-share-btn');
      if (shareBtn) shareBtn.style.display = 'inline-flex';
    }
    return;
  }

  // No storage image — show popup with spinner and try live gen
  if (!window._devSuppressLevelUp) { showLevelUpPopup(newLevel, character, null, true); fireConfetti(); }

  try {
    const { sceneIndex: lvlSceneIdx } = getCharacterForLevel(newLevel);
    const prompt = buildPrompt(character, lvlSceneIdx);
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
  const img = document.getElementById('char-img');
  const placeholder = document.getElementById('char-placeholder');
  if (img) { img.style.display = 'none'; img.src = ''; }
  if (placeholder) { placeholder.style.display = 'flex'; placeholder.innerHTML = '<div>🎭</div><span>No character yet</span>'; }
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

// ── ACTIVITY FEED ──
async function loadActivityFeed() {
  const container = document.getElementById('activity-feed-list');
  if (!container || !currentUser) return;

  try {
    const [reports, posts, checkins] = await Promise.all([
      supabaseClient.from('reports').select('bar_name,status,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(5),
      supabaseClient.from('lost_found').select('title,type,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3),
      supabaseClient.from('checkins').select('bar_name,created_at').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(3),
    ]);

    const items = [
      ...(reports.data || []).map(r => ({ icon: '📍', text: `Reported ${r.bar_name} as ${r.status}`, time: r.created_at })),
      ...(posts.data   || []).map(p => ({ icon: p.type === 'lost' ? '🔴' : '🟢', text: `Posted ${p.title} on L&F`, time: p.created_at })),
      ...(checkins.data || []).map(c => ({ icon: '✅', text: `Checked in at ${c.bar_name}`, time: c.created_at })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    if (items.length === 0) {
      container.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:12px 0">No recent activity yet</div>';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="activity-item">
        <div class="activity-icon">${item.icon}</div>
        <div class="activity-text">${item.text}</div>
        <div class="activity-time">${timeAgo(new Date(item.time).getTime())}</div>
      </div>`).join('');
  } catch(e) {
    container.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:12px 0">Could not load activity</div>';
  }
}

// ══════════════════════════════════════════════
// CHARACTER STORY SYSTEM
// ══════════════════════════════════════════════

let unlockedCharacters = {};  // { charId: { completedMissions: [1,2,3], unlockedAt: timestamp } }
let characterStories   = {};  // charId -> story data

// ── LOAD UNLOCKED CHARACTERS ──
async function loadUnlockedCharacters() {
  if (!currentUser) return;
  try {
    const { data } = await supabaseClient
      .from('character_progress')
      .select('*')
      .eq('user_id', currentUser.id);
    unlockedCharacters = {};
    (data || []).forEach(row => {
      unlockedCharacters[row.character_id] = {
        completedMissions: row.completed_missions || [],
        unlockedAt: row.unlocked_at,
        completion: row.completion_pct || 0
      };
    });
    renderCharacterCollection();
  } catch(e) { console.error('loadUnlockedCharacters:', e); }
}

// ── RENDER CHARACTER COLLECTION ON PROFILE ──
function renderCharacterCollection() {
  const el = document.getElementById('char-collection');
  if (!el) return;
  const unlocked = Object.keys(unlockedCharacters).map(Number);
  if (!unlocked.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--text2);text-align:center;padding:16px">Earn XP to unlock characters and their story missions</div>';
    return;
  }
  el.innerHTML = unlocked.map(cid => {
    const char = CHARACTERS.find(c => c.id === cid);
    if (!char) return '';
    const prog  = unlockedCharacters[cid];
    const pct   = prog.completion || 0;
    const level = Math.floor((cid - 1) / 10); // rough grouping
    return `
    <div class="char-collection-card" onclick="openCharacterStory(${cid})">
      <div class="ccc-img-wrap">
        <img src="https://jwgwufggptpdmgcmmqes.supabase.co/storage/v1/object/public/characters/level_${String(cid*5-4).padStart(3,'0')}_1.jpg"
          onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover;border-radius:12px">
        <div class="ccc-completion">${pct}%</div>
      </div>
      <div class="ccc-name">${char.name}</div>
      <div class="ccc-progress-bar"><div class="ccc-progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

// ── OPEN CHARACTER STORY MODAL ──
function openCharacterStory(charId) {
  const char = CHARACTERS.find(c => c.id === charId);
  if (!char) return;
  const prog = unlockedCharacters[charId] || { completedMissions: [], completion: 0 };

  document.getElementById('cs-modal-title').textContent = char.name;
  document.getElementById('cs-modal-img').src =
    `https://jwgwufggptpdmgcmmqes.supabase.co/storage/v1/object/public/characters/level_${String(charId*5-4).padStart(3,'0')}_1.jpg`;

  // Story missions (5 per character, derived from scenes)
  const missions = char.scenes.map((s, i) => ({
    index: i + 1,
    title: `Scene ${i+1}: ${char.name}`,
    desc:  s.action,
    done:  prog.completedMissions.includes(i + 1)
  }));

  const completion = Math.round((missions.filter(m => m.done).length / 5) * 100);
  document.getElementById('cs-modal-completion').textContent = completion + '% Complete';

  document.getElementById('cs-modal-missions').innerHTML = missions.map(m => `
    <div class="cs-mission-row ${m.done ? 'done' : ''}">
      <div class="cs-mission-check">${m.done ? '✅' : '⭕'}</div>
      <div class="cs-mission-info">
        <div class="cs-mission-title">${m.title}</div>
        <div class="cs-mission-desc">${m.desc}</div>
      </div>
      ${!m.done ? `<button class="cs-complete-btn" onclick="completeCharStoryMission(${charId},${m.index})">Complete</button>` : ''}
    </div>`).join('');

  document.getElementById('char-story-modal').style.display = 'flex';
}

async function completeCharStoryMission(charId, missionIndex) {
  if (!currentUser) return;
  const prog = unlockedCharacters[charId] || { completedMissions: [], completion: 0 };
  if (prog.completedMissions.includes(missionIndex)) return;

  prog.completedMissions.push(missionIndex);
  const completion = Math.round((prog.completedMissions.length / 5) * 100);
  prog.completion = completion;
  unlockedCharacters[charId] = prog;

  try {
    await supabaseClient.from('character_progress').upsert({
      user_id: currentUser.id,
      character_id: charId,
      completed_missions: prog.completedMissions,
      completion_pct: completion,
      unlocked_at: prog.unlockedAt || new Date().toISOString()
    }, { onConflict: 'user_id,character_id' });
    gainXP(50);
    showToast(`✅ Story mission complete · +50 XP`);
    if (completion === 100) {
      showToast(`🏆 ${CHARACTERS.find(c=>c.id===charId)?.name} — 100% Complete!`);
    }
    openCharacterStory(charId); // refresh modal
  } catch(e) { showToast('❌ ' + e.message); }
}

function closeCharStoryModal() {
  document.getElementById('char-story-modal').style.display = 'none';
}

// ── UNLOCK CHARACTER ON LEVEL UP ──
async function unlockCharacterIfNeeded(level) {
  if (!currentUser) return;
  // Every level unlocks a character (level 1 = char 1, etc. up to 50)
  const charId = Math.min(Math.ceil(level / 5), 50);
  if (unlockedCharacters[charId]) return;
  try {
    await supabaseClient.from('character_progress').insert({
      user_id: currentUser.id,
      character_id: charId,
      completed_missions: [],
      completion_pct: 0,
      unlocked_at: new Date().toISOString()
    });
    unlockedCharacters[charId] = { completedMissions: [], completion: 0, unlockedAt: new Date().toISOString() };
    const char = CHARACTERS.find(c => c.id === charId);
    if (char) showToast(`🎭 Unlocked: ${char.name}!`);
    renderCharacterCollection();
  } catch(e) {}
}
