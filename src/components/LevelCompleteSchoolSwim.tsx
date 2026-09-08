import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Character } from "@/data/oceans";

type SwimFish = {
  key: string;
  character: Character;
  laneY: number;
  lag: number;
  size: number;
  waveAmp: number;
  wavePeriod: number;
  wiggle: number;
  speedMul: number;
};

type SchoolPlan = {
  direction: 1 | -1;
  duration: number;
  swimmers: SwimFish[];
};

function hashSeed(ids: string[]): number {
  let h = 2166136261;
  for (let i = 0; i < ids.length; i++) {
    const s = ids[i] ?? "";
    for (let j = 0; j < s.length; j++) {
      h ^= s.charCodeAt(j);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uniqueFishList(fish: Character[]): Character[] {
  const unique: Character[] = [];
  const seen = new Set<string>();
  for (const c of fish) {
    if (!c?.id || !c?.img || seen.has(c.id)) continue;
    seen.add(c.id);
    unique.push(c);
  }
  return unique;
}

function planSchool(fish: Character[]): SchoolPlan | null {
  const unique = uniqueFishList(fish);
  if (unique.length === 0) return null;

  const rand = mulberry32(hashSeed(unique.map((c) => c.id)));
  const direction: 1 | -1 = rand() > 0.5 ? 1 : -1;
  const n = unique.length;
  const twoSchools = n >= 7;
  const duration = Math.min(7, Math.max(5, 4.6 + n * 0.14));

  const swimmers: SwimFish[] = unique.map((character, i) => {
    const group = twoSchools ? i % 2 : 0;
    const inGroup = twoSchools
      ? unique.filter((_, j) => j % 2 === group).indexOf(character)
      : i;
    const groupSize = twoSchools ? Math.ceil(n / 2) : n;
    const bandTop = group === 0 ? 16 : 50;
    const bandH = twoSchools ? 26 : 38;
    const laneY = bandTop + ((inGroup + 0.5) / Math.max(groupSize, 1)) * bandH + (rand() - 0.5) * 6;

    return {
      key: `${character.id}-${i}`,
      character,
      laneY: Math.min(82, Math.max(10, laneY)),
      lag: inGroup * 0.24 + rand() * 0.14,
      size: 58 + Math.round(rand() * 28) + (character.id === "whale" || character.id === "orca" ? 18 : 0),
      waveAmp: 18 + rand() * 20,
      wavePeriod: 0.95 + rand() * 0.45,
      wiggle: 6 + rand() * 7,
      speedMul: (group === 0 ? 0.92 : 1.06) + rand() * 0.14,
    };
  });

  return { direction, duration, swimmers };
}

const SWIM_START_DELAY_S = 0.35;

/** When WinOverlay should reveal the popup card — immediate snappy celebration (350ms). */
export function getSchoolSwimPopupDelayMs(_fish?: Character[] | null): number {
  return 350;
}

type Props = {
  fish?: Character[] | null;
  playKey?: string | number;
};

/**
 * School-of-fish swim behind Level Complete.
 * Safe to mount — never throws; pointer-events none.
 */
export function LevelCompleteSchoolSwim({ fish, playKey = 0 }: Props) {
  const plan = useMemo(() => {
    try {
      return planSchool(Array.isArray(fish) ? fish.filter(Boolean) : []);
    } catch {
      return null;
    }
  }, [fish]);

  if (!plan) return null;

  const { direction, duration, swimmers } = plan;
  const startX = direction === 1 ? "-20%" : "120%";
  const endX = direction === 1 ? "120%" : "-20%";
  // Art faces left — flip when swimming to the right
  const face = direction === 1 ? -1 : 1;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {swimmers.map((f) => {
        const swimDur = duration / f.speedMul;
        const delay = SWIM_START_DELAY_S + f.lag;
        return (
          <motion.div
            key={`${playKey}-${f.key}`}
            className="absolute"
            style={{
              top: `${f.laneY}%`,
              left: 0,
              width: f.size,
              height: f.size,
              marginTop: -(f.size / 2),
              willChange: "transform",
            }}
            initial={{ x: startX, opacity: 0 }}
            animate={{
              x: endX,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              x: {
                duration: swimDur,
                ease: "linear",
                delay,
              },
              opacity: {
                duration: swimDur,
                ease: "linear",
                delay,
                times: [0, 0.08, 0.86, 1],
              },
            }}
          >
            {/* Wave path + body wiggle — inner layer keeps facing stable */}
            <motion.div
              className="h-full w-full"
              style={{ scaleX: face }}
              animate={{
                y: [0, -f.waveAmp, f.waveAmp * 0.65, -f.waveAmp * 0.85, f.waveAmp * 0.35, 0],
                x: [0, 4, -3, 5, -4, 0],
                rotate: [0, -f.wiggle, f.wiggle * 0.85, -f.wiggle, f.wiggle * 0.5, 0],
              }}
              transition={{
                y: {
                  duration: f.wavePeriod,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                },
                x: {
                  duration: f.wavePeriod * 0.85,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: delay + 0.05,
                },
                rotate: {
                  duration: 0.32,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                },
              }}
            >
              <motion.img
                src={f.character.img}
                alt=""
                className="h-full w-full object-contain"
                style={{
                  filter: "drop-shadow(0 6px 12px rgba(0,20,60,0.5))",
                }}
                draggable={false}
                animate={{
                  scaleY: [1, 0.93, 1.06, 0.96, 1.03, 1],
                  scaleX: [1, 1.02, 0.98, 1.01, 0.99, 1],
                }}
                transition={{
                  duration: 0.28,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
