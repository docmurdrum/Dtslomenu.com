// ══════════════════════════════════════════════
// BAR_GOLF.JS — Bar Golf Game Mode
// Hit every bar, lowest drinks = best score
// ══════════════════════════════════════════════

var BAR_GOLF_COURSES = [
  {
    id: 'classic_9',
    name: 'Classic 9',
    emoji: '⛳',
    holes: 9,
    description: 'The original downtown SLO bar crawl. 9 bars, 9 drinks.',
    difficulty: 'Medium',
    est_time: '3-4 hours',
    course: [
      { hole: 1, par: 1, bar: 'Black Sheep',     drink: 'Any draft beer',        tip: 'Warm up hole — take it easy' },
      { hole: 2, par: 1, bar: 'Frog & Peach',    drink: 'A pint',                tip: 'British pub vibes, stay focused' },
      { hole: 3, par: 1, bar: 'Nightcap',         drink: 'Cocktail or shot',      tip: 'Hole 3 means business' },
      { hole: 4, par: 1, bar: 'The Library',      drink: 'Any drink',             tip: 'Quiet down, this is a library' },
      { hole: 5, par: 1, bar: 'High Bar',         drink: 'Elevated cocktail',     tip: 'Halfway — treat yourself' },
      { hole: 6, par: 1, bar: 'Sidecar',          drink: 'Beer or cocktail',      tip: 'Stay loose, back 9 begins' },
      { hole: 7, par: 1, bar: 'Feral',            drink: 'Whatever looks good',   tip: 'Wild card hole' },
      { hole: 8, par: 1, bar: 'BA Start',         drink: 'Arcade bar drink',      tip: 'Play a game between sips' },
      { hole: 9, par: 1, bar: 'McCarthy\'s',      drink: 'Finishing pint',        tip: 'Pace yourself — this is the 19th hole' },
    ]
  },
  {
    id: 'quick_6',
    name: 'Quick 6',
    emoji: '🏌️',
    holes: 6,
    description: 'Short course for a quick night. 6 bars in 2 hours.',
    difficulty: 'Easy',
    est_time: '2-2.5 hours',
    course: [
      { hole: 1, par: 1, bar: 'Black Sheep',     drink: 'Draft beer',     tip: 'Start strong' },
      { hole: 2, par: 1, bar: 'Frog & Peach',    drink: 'Any pint',       tip: 'Find your rhythm' },
      { hole: 3, par: 1, bar: 'High Bar',         drink: 'Cocktail',       tip: 'Turn 3 — pick up the pace' },
      { hole: 4, par: 1, bar: 'BA Start',         drink: 'Beer + 1 game',  tip: 'Bonus: get par on the arcade game too' },
      { hole: 5, par: 1, bar: 'Feral',            drink: 'Your choice',    tip: 'Fifth hole freedom' },
      { hole: 6, par: 1, bar: 'Nightcap',         drink: 'Nightcap closer',tip: 'You did it' },
    ]
  },
  {
    id: 'speed_round',
    name: 'Speed Round',
    emoji: '⚡',
    holes: 4,
    description: 'For the brave. 4 bars, one shot each. Clock is running.',
    difficulty: 'Hard',
    est_time: '1-1.5 hours',
    course: [
      { hole: 1, par: 1, bar: 'Nightcap',    drink: 'Shot',  tip: 'No warmup on the speed round' },
      { hole: 2, par: 1, bar: 'Sidecar',     drink: 'Shot',  tip: 'Keep moving' },
      { hole: 3, par: 1, bar: 'The Library', drink: 'Shot',  tip: 'Quietly' },
      { hole: 4, par: 1, bar: 'Black Sheep', drink: 'Shot',  tip: 'Finish strong' },
    ]
  },
];

var bgState = {
  active: false,
  courseId: null,
  currentHole: 0,
  scores: [],       // drinks per hole (1=par, 2=bogey, 0=skip)
  startTime: null,
  totalDrinks: 0,
};

function openBarGolf() {
  var existing = document.getElementById('bar-golf-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'bar-golf-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:8300;background:rgba(0,0,0,0.9);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center';

  if (!document.getElementById('bg-css')) {
    var s = document.createElement('style');
    s.id = 'bg-css';
    s.textContent = [
      '.bg-course-card{padding:14px;border-radius:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;margin-bottom:10px;transition:all 0.15s}',
      '.bg-course-card:active{background:rgba(34,197,94,0.08);transform:scale(0.98)}',
      '.bg-hole-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:6px}',
      '.bg-hole-row.active{background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.3)}',
      '.bg-hole-row.done{background:rgba(255,255,255,0.02);opacity:0.6}',
      '.bg-score-btn{width:36px;height:36px;border-radius:50%;border:none;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;flex-shrink:0}',
    ].join('');
    document.head.appendChild(s);
  }

  modal.addEventListener('click', function(e) { if (e.target===modal) closeBarGolf(); });
  document.body.appendChild(modal);
  bgRender();
}
window.openBarGolf = openBarGolf;

function closeBarGolf() {
  var m = document.getElementById('bar-golf-modal');
  if (m) m.remove();
}
window.closeBarGolf = closeBarGolf;

function bgRender() {
  var modal = document.getElementById('bar-golf-modal');
  if (!modal) return;

  if (!bgState.active) {
    bgRenderCourseSelect(modal);
  } else {
    bgRenderScorecard(modal);
  }
}

function bgRenderCourseSelect(modal) {
  modal.innerHTML =
    '<div style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:28px 28px 0 0;border-top:2px solid rgba(34,197,94,0.3);padding:16px 20px 48px;max-height:90vh;overflow-y:auto">' +
      '<div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.12);margin:0 auto 16px;cursor:pointer" onclick="closeBarGolf()"></div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<div style="font-size:28px">⛳</div>' +
        '<div><div style="font-size:20px;font-weight:800;font-family:Georgia,serif">Bar Golf</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.4)">Hit every bar · Lowest score wins</div></div>' +
        '<button onclick="closeBarGolf()" style="margin-left:auto;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +

      '<div style="padding:12px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:12px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.6">' +
        '🏌️ <strong style="color:#22c55e">How to play:</strong> Visit each bar in order. Get one drink per hole. ' +
        'Under par = fewer drinks than holes. Best score wins. Use the scorecard to track your round.' +
      '</div>' +

      '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">CHOOSE A COURSE</div>' +

      BAR_GOLF_COURSES.map(function(course) {
        var diffColor = course.difficulty==='Easy'?'#22c55e':course.difficulty==='Medium'?'#f59e0b':'#ef4444';
        return '<div class="bg-course-card" onclick="bgStartCourse(\'' + course.id + '\')">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
            '<div style="font-size:28px">' + course.emoji + '</div>' +
            '<div style="flex:1">' +
              '<div style="font-size:15px;font-weight:800">' + course.name + '</div>' +
              '<div style="font-size:11px;color:rgba(255,255,255,0.45)">' + course.description + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;font-size:11px">' +
            '<span style="padding:3px 8px;border-radius:8px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">⛳ ' + course.holes + ' holes</span>' +
            '<span style="padding:3px 8px;border-radius:8px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5)">⏱ ' + course.est_time + '</span>' +
            '<span style="padding:3px 8px;border-radius:8px;background:' + diffColor + '18;color:' + diffColor + ';font-weight:700">' + course.difficulty + '</span>' +
          '</div>' +
        '</div>';
      }).join('') +

      // Past scores
      bgRenderPastScores() +
    '</div>';
}

function bgRenderPastScores() {
  var scores = JSON.parse(localStorage.getItem('dtslo_bg_scores') || '[]');
  if (!scores.length) return '';

  return '<div style="margin-top:16px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px">YOUR BEST ROUNDS</div>' +
    scores.slice(0,3).map(function(s) {
      var course = BAR_GOLF_COURSES.find(function(c){return c.id===s.courseId;});
      var scoreText = s.total < s.par ? '-'+(s.par-s.total)+' (Under par!)' : s.total===s.par ? 'Even par' : '+'+(s.total-s.par);
      var scoreColor = s.total < s.par ? '#22c55e' : s.total===s.par ? '#ffd700' : '#f59e0b';
      return '<div style="display:flex;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:4px;font-size:12px">' +
        '<span>' + (course?course.emoji+' '+course.name:'Unknown') + '</span>' +
        '<span style="font-weight:800;color:' + scoreColor + '">' + scoreText + '</span>' +
      '</div>';
    }).join('');
}

function bgStartCourse(courseId) {
  var course = BAR_GOLF_COURSES.find(function(c){return c.id===courseId;});
  if (!course) return;
  bgState = {
    active: true,
    courseId: courseId,
    currentHole: 0,
    scores: new Array(course.holes).fill(null),
    startTime: Date.now(),
    totalDrinks: 0,
  };
  bgRender();
}
window.bgStartCourse = bgStartCourse;

function bgRenderScorecard(modal) {
  var course = BAR_GOLF_COURSES.find(function(c){return c.id===bgState.courseId;});
  if (!course) return;

  var totalDrinks = bgState.scores.filter(function(s){return s!==null;}).reduce(function(a,b){return a+b;},0);
  var holesPlayed = bgState.scores.filter(function(s){return s!==null;}).length;
  var par = holesPlayed; // par is 1 per hole
  var scoreVsPar = totalDrinks - par;
  var scoreColor = scoreVsPar < 0 ? '#22c55e' : scoreVsPar === 0 ? '#ffd700' : '#f59e0b';

  modal.innerHTML =
    '<div style="width:100%;max-width:480px;background:rgba(8,8,20,0.99);border-radius:28px 28px 0 0;border-top:2px solid rgba(34,197,94,0.3);padding:14px 20px 48px;max-height:92vh;overflow-y:auto">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<div style="font-size:20px">' + course.emoji + '</div>' +
          '<div><div style="font-size:15px;font-weight:800">' + course.name + '</div>' +
          '<div style="font-size:10px;color:rgba(255,255,255,0.4)">' + holesPlayed + '/' + course.holes + ' holes played</div></div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div style="font-size:22px;font-weight:900;color:' + scoreColor + '">' + totalDrinks + '</div>' +
          '<div style="font-size:10px;color:' + scoreColor + ';font-weight:700">' +
            (scoreVsPar===0?'Even par':scoreVsPar>0?'+'+scoreVsPar+' over':scoreVsPar+' under') +
          '</div>' +
        '</div>' +
      '</div>' +

      // Scorecard
      course.course.map(function(hole, i) {
        var score = bgState.scores[i];
        var isCurrent = i === bgState.currentHole && score === null;
        var isDone = score !== null;

        return '<div class="bg-hole-row' + (isCurrent?' active':isDone?' done':'') + '">' +
          '<div style="font-size:12px;font-weight:800;color:rgba(255,255,255,0.4);min-width:24px">' + hole.hole + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + hole.bar + '</div>' +
            '<div style="font-size:10px;color:rgba(255,255,255,0.35)">' + hole.drink + '</div>' +
            (isCurrent ? '<div style="font-size:10px;color:#22c55e;margin-top:2px">💡 ' + hole.tip + '</div>' : '') +
          '</div>' +
          (isDone ?
            '<div style="font-size:16px;font-weight:900;color:' + (score===1?'#22c55e':score>1?'#f59e0b':'#06b6d4') + ';min-width:28px;text-align:center">' + score + '</div>' :
            isCurrent ?
            '<div style="display:flex;gap:4px">' +
              '<button class="bg-score-btn" onclick="bgScore(' + i + ',1)" style="background:rgba(34,197,94,0.2);color:#22c55e">1</button>' +
              '<button class="bg-score-btn" onclick="bgScore(' + i + ',2)" style="background:rgba(245,158,11,0.2);color:#f59e0b">2</button>' +
              '<button class="bg-score-btn" onclick="bgScore(' + i + ',0)" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.3);font-size:10px">Skip</button>' +
            '</div>' :
            '<div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.1)"></div>'
          ) +
        '</div>';
      }).join('') +

      // Footer actions
      (holesPlayed === course.holes ?
        '<div style="margin-top:16px;padding:14px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:14px;text-align:center;margin-bottom:12px">' +
          '<div style="font-size:24px;margin-bottom:4px">🏆</div>' +
          '<div style="font-size:16px;font-weight:800;color:#22c55e;margin-bottom:2px">Round Complete!</div>' +
          '<div style="font-size:13px;color:rgba(255,255,255,0.6)">Final score: ' + totalDrinks + ' drinks · ' +
            (scoreVsPar===0?'Even par':scoreVsPar>0?'+'+scoreVsPar+' over par':Math.abs(scoreVsPar)+' under par') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px">' +
          '<button onclick="bgFinish()" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;font-size:13px;font-weight:800;font-family:inherit;cursor:pointer">Save Score 🏌️</button>' +
          '<button onclick="bgState.active=false;bgRender()" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.5);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">New Round</button>' +
        '</div>'
        :
        '<button onclick="bgState.active=false;bgRender()" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.3);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer">Abandon Round</button>'
      ) +
    '</div>';
}

function bgScore(holeIndex, drinks) {
  bgState.scores[holeIndex] = drinks;
  // Advance to next unscored hole
  for (var i = 0; i < bgState.scores.length; i++) {
    if (bgState.scores[i] === null) { bgState.currentHole = i; break; }
  }
  bgRender();
}
window.bgScore = bgScore;

function bgFinish() {
  var course = BAR_GOLF_COURSES.find(function(c){return c.id===bgState.courseId;});
  if (!course) return;

  var total = bgState.scores.filter(function(s){return s!==null;}).reduce(function(a,b){return a+b;},0);
  var par = course.holes;

  // Save score
  var scores = JSON.parse(localStorage.getItem('dtslo_bg_scores') || '[]');
  scores.unshift({ courseId: bgState.courseId, total: total, par: par, date: Date.now() });
  scores = scores.slice(0, 10); // keep last 10
  localStorage.setItem('dtslo_bg_scores', JSON.stringify(scores));

  // Award XP and materials
  var xp = total <= par ? 50 : 25;
  if (typeof addXP === 'function') addXP(xp);
  if (typeof awardGameWin === 'function' && total <= par) awardGameWin();
  if (typeof showToast === 'function') showToast('⛳ Round saved! +' + xp + ' XP');

  bgState.active = false;
  bgRender();
}
window.bgFinish = bgFinish;
