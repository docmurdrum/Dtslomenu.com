// ══════════════════════════════════════════════
// ONBOARDING.JS — New User Onboarding Slides
// ══════════════════════════════════════════════

const ONBOARDING_SLIDES = [
  {
    icon: '🌃',
    title: 'Welcome to DTSLO',
    body: 'Your guide to downtown San Luis Obispo nightlife. Real-time bar info, games, and more — all in one place.',
    cta: 'Next →',
  },
  {
    icon: '📍',
    title: 'Know Before You Go',
    body: 'See live crowd levels at every bar on Higuera Street. Check in to earn XP and help the community.',
    cta: 'Next →',
  },
  {
    icon: '🎮',
    title: 'Games & Challenges',
    body: 'Play trivia, duel other users, make bar predictions, and earn XP. Climb the leaderboard every week.',
    cta: 'Next →',
  },
  {
    icon: '🎭',
    title: 'Your Character',
    body: 'Earn XP to level up and unlock a unique character card. Each level reveals a new scene. How far can you go?',
    cta: "Let's Go! 🎉",
  },
];

let onboardingIdx = 0;

function showOnboarding() {
  const modal = document.getElementById('onboarding-modal');
  if (!modal) return;
  onboardingIdx = 0;
  renderOnboardingSlide();
  modal.classList.add('show');
}

function renderOnboardingSlide() {
  const slide = ONBOARDING_SLIDES[onboardingIdx];
  const icon  = document.getElementById('ob-icon');
  const title = document.getElementById('ob-title');
  const body  = document.getElementById('ob-body');
  const cta   = document.getElementById('ob-cta');
  const dots  = document.querySelectorAll('.ob-dot');

  if (icon)  icon.textContent  = slide.icon;
  if (title) title.textContent = slide.title;
  if (body)  body.textContent  = slide.body;
  if (cta)   cta.textContent   = slide.cta;

  dots.forEach((d, i) => d.classList.toggle('active', i === onboardingIdx));
}

function onboardingNext() {
  onboardingIdx++;
  if (onboardingIdx >= ONBOARDING_SLIDES.length) {
    closeOnboarding();
    return;
  }
  // Animate slide
  const content = document.getElementById('ob-content');
  if (content) {
    content.classList.add('sliding');
    setTimeout(() => {
      renderOnboardingSlide();
      content.classList.remove('sliding');
    }, 200);
  } else {
    renderOnboardingSlide();
  }
}

function closeOnboarding() {
  const modal = document.getElementById('onboarding-modal');
  if (modal) modal.classList.remove('show');
}

// Called from auth.js after successful signup
function maybeShowOnboarding(isNewUser) {
  if (isNewUser) {
    setTimeout(() => showOnboarding(), 600);
  }
}
