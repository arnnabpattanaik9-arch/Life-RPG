import confetti from 'canvas-confetti';

export const fireLevelUpConfetti = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };
  frame();
};

export const fireQuestCompleteConfetti = (originX: number = 0.5, originY: number = 0.5) => {
  confetti({
    particleCount: 35,
    spread: 50,
    startVelocity: 25,
    origin: { x: originX, y: originY },
    colors: ['#f59e0b', '#06b6d4', '#22c55e'],
  });
};

export const fireBossDefeatedConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff'],
  });
};
