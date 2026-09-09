import confetti from "canvas-confetti";

function ensureCanvasClickThrough() {
  try {
    document.querySelectorAll("canvas").forEach((node) => {
      (node as HTMLCanvasElement).style.pointerEvents = "none";
    });
  } catch {
    /* ignore */
  }
}

export function celebrate() {
  const defaults = {
    startVelocity: 35,
    spread: 360,
    ticks: 90,
    zIndex: 9999,
    disableForReducedMotion: true,
    colors: ["#FF6F61", "#FFD93D", "#3DDC97", "#2EC4F1", "#FFFFFF"],
  };
  confetti({ ...defaults, particleCount: 90, origin: { x: 0.2, y: 0.4 } });
  confetti({ ...defaults, particleCount: 90, origin: { x: 0.8, y: 0.4 } });
  ensureCanvasClickThrough();
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 60, origin: { x: 0.5, y: 0.3 } });
    ensureCanvasClickThrough();
  }, 180);
}

export function sparkleAt(x: number, y: number) {
  confetti({
    particleCount: 28,
    startVelocity: 24,
    spread: 360,
    ticks: 70,
    origin: { x, y },
    colors: ["#FFD93D", "#FFFFFF", "#FF8C2A", "#5ED4FF", "#3DDC97"],
    shapes: ["star", "circle"],
    scalar: 0.82,
    zIndex: 9999,
    disableForReducedMotion: true,
  });
  ensureCanvasClickThrough();
}
