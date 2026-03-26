// ══════════════════════════════════════════════
// HUB_ANIMATION.JS — Building Entry Animation
// Canvas overlay — downtown SLO skyline
// ══════════════════════════════════════════════

// Downtown SLO building silhouettes — stylized Higuera St skyline
// Each building: [x%, width%, height%, windows rows, accent color]
var SLO_BUILDINGS = [
  // Far left — small shops
  { x:0,   w:6,  h:28, floors:2, style:'flat',    color:'#1a0a2e' },
  { x:6,   w:5,  h:35, floors:3, style:'flat',    color:'#0d0d1f' },
  // Mission tower area
  { x:11,  w:7,  h:55, floors:4, style:'mission', color:'#1a0820' },
  { x:18,  w:5,  h:40, floors:3, style:'flat',    color:'#0a0a1a' },
  // Mid Higuera
  { x:23,  w:8,  h:48, floors:4, style:'flat',    color:'#120820' },
  { x:31,  w:6,  h:38, floors:3, style:'flat',    color:'#0d0d1f' },
  { x:37,  w:5,  h:32, floors:2, style:'flat',    color:'#1a0a2e' },
  // Fremont Theater — tall landmark
  { x:42,  w:9,  h:72, floors:5, style:'fremont', color:'#1a0820' },
  { x:51,  w:5,  h:42, floors:3, style:'flat',    color:'#0d0d1f' },
  // Downtown core
  { x:56,  w:7,  h:50, floors:4, style:'flat',    color:'#120820' },
  { x:63,  w:6,  h:36, floors:3, style:'flat',    color:'#0a0a1a' },
  { x:69,  w:8,  h:58, floors:4, style:'tall',    color:'#1a0820' },
  // Right side
  { x:77,  w:5,  h:38, floors:3, style:'flat',    color:'#0d0d1f' },
  { x:82,  w:6,  h:30, floors:2, style:'flat',    color:'#1a0a2e' },
  { x:88,  w:5,  h:44, floors:3, style:'flat',    color:'#120820' },
  { x:93,  w:7,  h:35, floors:2, style:'flat',    color:'#0d0d1f' },
];

var _animCanvas = null;
var _animCtx = null;
var _animFrame = null;
var _animDone = false;

function runHubEntryAnimation(targetHub, onComplete) {
  // Clean up any existing animation
  cancelHubAnimation();

  var canvas = document.createElement('canvas');
  canvas.id = 'hub-entry-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9990;pointer-events:none';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  _animCanvas = canvas;
  _animCtx    = canvas.getContext('2d');
  _animDone   = false;

  var W = canvas.width;
  var H = canvas.height;

  // Hub color theme
  var hubColors = {
    dtslo:       { primary: '#ff2d78', secondary: '#b44fff', glow: '#ff2d78' },
    restaurant:  { primary: '#ff2d78', secondary: '#ef4444', glow: '#ff6b35' },
    beach:       { primary: '#06b6d4', secondary: '#0ea5e9', glow: '#00f5ff' },
  };
  var theme = hubColors[targetHub] || hubColors.dtslo;

  // Animation state
  var state = {
    phase: 0,           // 0=rise, 1=glow, 2=slide, 3=fadeout
    progress: 0,        // 0-1 within each phase
    startTime: null,
    phaseDurations: [600, 400, 500, 400], // ms per phase
  };

  // Pre-compute building screen positions
  var buildings = SLO_BUILDINGS.map(function(b) {
    return {
      x:      (b.x / 100) * W,
      w:      (b.w / 100) * W,
      h:      (b.h / 100) * H * 0.55,
      floors: b.floors,
      style:  b.style,
      color:  b.color,
      // Each building rises with a slight delay based on x position
      delay:  b.x * 0.008,
    };
  });

  function ease(t) {
    // Cubic ease out
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOut(t) {
    return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  }

  function drawBuilding(b, riseAmt, glowAmt, slideX) {
    var ctx = _animCtx;
    var bx  = b.x + slideX;
    var by  = H - (b.h * riseAmt);
    var bh  = b.h * riseAmt;

    if (bh <= 0) return;

    ctx.save();

    // Building body
    ctx.fillStyle = b.color;
    ctx.fillRect(bx, by, b.w, bh);

    // Top edge — glow when fully risen
    if (glowAmt > 0) {
      ctx.shadowColor  = theme.glow;
      ctx.shadowBlur   = 12 * glowAmt;
      ctx.strokeStyle  = theme.primary + Math.floor(200 * glowAmt).toString(16).padStart(2,'0');
      ctx.lineWidth    = 1.5;
      ctx.strokeRect(bx, by, b.w, bh);
      ctx.shadowBlur   = 0;
    }

    // Windows
    if (riseAmt > 0.3 && bh > 20) {
      var winW    = Math.max(3, b.w * 0.18);
      var winH    = Math.max(3, bh / (b.floors * 2.2));
      var cols    = Math.max(1, Math.floor(b.w / (winW * 2.2)));
      var winGap  = (b.w - cols * winW) / (cols + 1);

      for (var row = 0; row < b.floors; row++) {
        for (var col = 0; col < cols; col++) {
          var wx = bx + winGap + col * (winW + winGap);
          var wy = by + bh * (0.1 + row * (0.75 / b.floors));
          // Some windows lit, some dark
          var lit = (row * 3 + col * 7 + b.x) % 5 !== 0;
          if (lit && glowAmt > 0.2) {
            ctx.fillStyle = 'rgba(255,215,100,' + (0.15 + 0.4 * glowAmt) + ')';
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
          }
          ctx.fillRect(wx, wy, winW, winH);
        }
      }
    }

    // Special landmark details
    if (b.style === 'mission') {
      // Bell tower hint
      if (riseAmt > 0.8) {
        ctx.fillStyle = b.color;
        ctx.fillRect(bx + b.w * 0.3, by - b.h * 0.15 * riseAmt, b.w * 0.4, b.h * 0.15 * riseAmt);
        if (glowAmt > 0.3) {
          ctx.fillStyle = theme.secondary + '66';
          ctx.beginPath();
          ctx.arc(bx + b.w * 0.5, by - b.h * 0.08 * riseAmt, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (b.style === 'fremont') {
      // Fremont Theater vertical sign
      if (riseAmt > 0.6 && glowAmt > 0.1) {
        ctx.fillStyle = theme.primary + Math.floor(180 * glowAmt).toString(16).padStart(2,'0');
        ctx.fillRect(bx + b.w * 0.35, by + bh * 0.1, b.w * 0.3, bh * 0.6);
        if (glowAmt > 0.5) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold ' + Math.floor(b.w * 0.22) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.save();
          ctx.translate(bx + b.w * 0.5, by + bh * 0.5);
          ctx.rotate(-Math.PI / 2);
          ctx.globalAlpha = glowAmt;
          ctx.fillText('FREMONT', 0, 0);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  function drawFrame(timestamp) {
    if (_animDone) return;
    if (!state.startTime) state.startTime = timestamp;

    var elapsed   = timestamp - state.startTime;
    var phaseDur  = state.phaseDurations[state.phase];
    var phaseTime = elapsed - state.phaseDurations.slice(0, state.phase).reduce(function(a,b){return a+b;}, 0);
    var t         = Math.min(1, phaseTime / phaseDur);

    _animCtx.clearRect(0, 0, W, H);

    // Dark overlay — fades in during rise
    var overlayAlpha = state.phase === 3 ? (1 - ease(t)) * 0.7 : Math.min(0.7, state.phase * 0.3 + t * 0.3);
    _animCtx.fillStyle = 'rgba(6,6,15,' + overlayAlpha + ')';
    _animCtx.fillRect(0, 0, W, H);

    // Ground line glow
    if (state.phase >= 1) {
      var groundGlow = state.phase === 1 ? ease(t) : 1;
      _animCtx.save();
      _animCtx.shadowColor = theme.glow;
      _animCtx.shadowBlur  = 20 * groundGlow;
      _animCtx.strokeStyle = theme.primary;
      _animCtx.lineWidth   = 2;
      _animCtx.beginPath();
      _animCtx.moveTo(0, H - 1);
      _animCtx.lineTo(W, H - 1);
      _animCtx.stroke();
      _animCtx.restore();
    }

    // Draw buildings
    var slideX = 0;
    if (state.phase === 2) {
      slideX = -W * 0.15 * easeInOut(t);
    } else if (state.phase === 3) {
      slideX = -W * 0.15;
    }

    buildings.forEach(function(b) {
      var riseProgress = 0;
      var glowProgress = 0;

      if (state.phase === 0) {
        // Rise phase — staggered by x position
        var adjT = Math.max(0, Math.min(1, (ease(t) - b.delay) / (1 - b.delay * 0.5)));
        riseProgress = adjT;
      } else {
        riseProgress = 1;
        if (state.phase === 1) {
          glowProgress = ease(t);
        } else if (state.phase === 2 || state.phase === 3) {
          glowProgress = 1;
        }
      }

      drawBuilding(b, riseProgress, glowProgress, slideX);
    });

    // Hub name label — appears in glow phase
    if (state.phase >= 1) {
      var labelAlpha = state.phase === 1 ? ease(t) : state.phase === 3 ? (1 - ease(t)) : 1;
      var hubNames   = { dtslo:'DTSLO', restaurant:'Restaurants', beach:'Beach Hub' };
      var hubName    = hubNames[targetHub] || 'MENU';

      _animCtx.save();
      _animCtx.globalAlpha = labelAlpha;
      _animCtx.textAlign   = 'center';
      _animCtx.textBaseline = 'middle';

      // Glow
      _animCtx.shadowColor = theme.glow;
      _animCtx.shadowBlur  = 30;
      _animCtx.fillStyle   = theme.primary;
      _animCtx.font        = 'bold ' + Math.floor(W * 0.1) + 'px Georgia, serif';
      _animCtx.fillText(hubName, W / 2, H * 0.3);

      // Sub label
      _animCtx.shadowBlur  = 8;
      _animCtx.fillStyle   = 'rgba(255,255,255,0.5)';
      _animCtx.font        = Math.floor(W * 0.035) + 'px Helvetica Neue, sans-serif';
      _animCtx.fillText('San Luis Obispo', W / 2, H * 0.3 + W * 0.12);
      _animCtx.restore();
    }

    // Advance phase
    if (t >= 1) {
      state.phase++;
      if (state.phase >= state.phaseDurations.length) {
        // Animation done
        _animDone = true;
        if (_animCanvas) {
          _animCanvas.remove();
          _animCanvas = null;
        }
        if (typeof onComplete === 'function') onComplete();
        return;
      }
    }

    _animFrame = requestAnimationFrame(drawFrame);
  }

  _animFrame = requestAnimationFrame(drawFrame);
}

function cancelHubAnimation() {
  if (_animFrame) { cancelAnimationFrame(_animFrame); _animFrame = null; }
  if (_animCanvas) { _animCanvas.remove(); _animCanvas = null; }
  _animDone = true;
}

window.runHubEntryAnimation = runHubEntryAnimation;
window.cancelHubAnimation   = cancelHubAnimation;
