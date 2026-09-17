import confetti from "canvas-confetti";

export function triggerConfettiBurst(particleCount = 100) {
  try {
    confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (err) {
    console.warn("Confetti trigger warning:", err);
  }
}

export function triggerFireworks() {
  try {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  } catch (err) {
    console.warn("Fireworks trigger warning:", err);
  }
}
