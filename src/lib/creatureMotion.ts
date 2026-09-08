import type { TargetAndTransition } from "framer-motion";

export type CreatureMotionKind = "breach" | "dive" | "swim" | "scuttle" | "bloom" | "bob";

/** Lightweight per-species placement motion (no prior system existed in the app). */
export function creatureMotionKind(characterId: string): CreatureMotionKind {
  switch (characterId) {
    case "whale":
    case "orca":
      return "breach";
    case "seaturtle":
      return "dive";
    case "crab":
      return "scuttle";
    case "octopus":
      return "bloom";
    case "dolphin":
    case "clownfish":
    case "seahorse":
    case "shark":
    default:
      return "swim";
  }
}

export function creatureIdleAnimate(
  kind: CreatureMotionKind,
  speed = 1,
): TargetAndTransition {
  const d = Math.max(0.55, 1 / speed);
  switch (kind) {
    case "breach":
      return {
        y: [0, -18, 0, -8, 0],
        rotate: [0, -4, 2, -2, 0],
        transition: { duration: 3.6 * d, repeat: Infinity, ease: "easeInOut" },
      };
    case "dive":
      return {
        y: [0, 10, -6, 0],
        x: [0, 6, -4, 0],
        rotate: [0, 6, -4, 0],
        transition: { duration: 4.2 * d, repeat: Infinity, ease: "easeInOut" },
      };
    case "scuttle":
      return {
        x: [0, 8, -6, 4, 0],
        y: [0, -2, 0, -2, 0],
        transition: { duration: 2.4 * d, repeat: Infinity, ease: "easeInOut" },
      };
    case "bloom":
      return {
        scale: [1, 1.08, 1, 1.05, 1],
        opacity: [1, 0.92, 1],
        transition: { duration: 3.2 * d, repeat: Infinity, ease: "easeInOut" },
      };
    case "swim":
    default:
      return {
        x: [0, 10, -8, 0],
        y: [0, -6, 4, 0],
        rotate: [0, -3, 3, 0],
        transition: { duration: 3.8 * d, repeat: Infinity, ease: "easeInOut" },
      };
  }
}

export function creatureHappyAnimate(): TargetAndTransition {
  return {
    y: [0, -14, 0, -8, 0],
    scale: [1, 1.12, 1, 1.06, 1],
    rotate: [0, -6, 6, 0],
    transition: { duration: 0.85, ease: "easeOut" },
  };
}

/** Big group swim used right before Level Complete — clearly visible. */
export function creatureCelebrateSwim(
  kind: CreatureMotionKind,
  delay = 0,
): TargetAndTransition {
  const base = {
    transition: {
      duration: 1.35,
      ease: "easeInOut" as const,
      delay,
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  };
  switch (kind) {
    case "breach":
      return {
        y: [0, -36, -8, -28, 0],
        x: [0, 8, 14, 6, 0],
        scale: [1, 1.18, 1.08, 1.14, 1],
        rotate: [0, -10, 4, -6, 0],
        ...base,
      };
    case "dive":
      return {
        y: [0, 16, -12, 10, 0],
        x: [0, 18, 8, -6, 0],
        scale: [1, 1.1, 1.16, 1.08, 1],
        rotate: [0, 12, -8, 6, 0],
        ...base,
      };
    case "scuttle":
      return {
        x: [0, 22, -16, 12, 0],
        y: [0, -6, -2, -8, 0],
        scale: [1, 1.12, 1.08, 1.14, 1],
        rotate: [0, -8, 8, -4, 0],
        ...base,
      };
    case "bloom":
      return {
        scale: [1, 1.28, 0.96, 1.22, 1],
        rotate: [0, -8, 8, -4, 0],
        y: [0, -10, 0, -6, 0],
        ...base,
      };
    case "swim":
    default:
      return {
        x: [0, 28, -18, 14, 0],
        y: [0, -16, 8, -10, 0],
        scale: [1, 1.16, 1.08, 1.12, 1],
        rotate: [0, -12, 10, -6, 0],
        ...base,
      };
  }
}
