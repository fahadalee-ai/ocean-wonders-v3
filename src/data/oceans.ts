import char1 from "@/assets/Characters_1.png";
import char2 from "@/assets/Characters_2.png";
import char3 from "@/assets/Characters_3.png";
import char4 from "@/assets/Characters_4.png";
import char5 from "@/assets/Characters_5.png";
import char6 from "@/assets/Characters_6.png";
import char7 from "@/assets/Characters_7.png";
import char8 from "@/assets/Characters_8.png";
import char9 from "@/assets/Characters_9.png";
import outline1 from "@/assets/Characters_1_outline.png";
import outline2 from "@/assets/Characters_2_outline.png";
import outline3 from "@/assets/Characters_3_outline.png";
import outline4 from "@/assets/Characters_4_outline.png";
import outline5 from "@/assets/Characters_5_outline.png";
import outline6 from "@/assets/Characters_6_outline.png";
import outline7 from "@/assets/Characters_7_outline.png";
import outline8 from "@/assets/Characters_8_outline.png";
import outline9 from "@/assets/Characters_9_outline.png";

import bgPacific from "@/assets/bg-pacific.jpg";
import bgAtlantic from "@/assets/bg-atlantic.jpg";
import bgIndian from "@/assets/bg-indian.jpg";
import bgArctic from "@/assets/bg-arctic.jpg";
import bgSouthern from "@/assets/bg-southern.jpg";

export type LevelMode = "match" | "challenge" | "friends";

export type GapSize = "comfortable" | "tight" | "packed";

export type OceanDifficulty = "Beginner" | "Easy" | "Medium" | "Hard" | "Expert";

/** Tunables that scale difficulty without changing core gameplay. */
export type Difficulty = {
  /** How many fish appear in this level. */
  fishCount: number;
  /** Animation / float speed multiplier (higher = snappier). */
  speed: number;
  /** Drop-target scale (lower = smaller / harder). */
  targetScale: number;
  /** Grid spacing for creatures & shadows. */
  gap: GapSize;
  /** Whether shadow order is shuffled vs creature order. */
  shuffleShadows: boolean;
  /** Slight random rotation on fish tiles. */
  rotateFish: boolean;
  /** How many tap options in speed-challenge rounds. */
  optionCount: number;
};

export type Level = {
  id: string;
  /** Global sequential number used for unlock progression. */
  number: number;
  /** 1–7 within the ocean (6 = Speed Challenge, 7 = Match the Ocean Friends). */
  localNumber: number;
  mode: LevelMode;
  title: string;
  /** Character ids used in this level (data-driven, swappable later). */
  fishIds: string[];
  difficulty: Difficulty;
  /** Show Meet & Learn for every fish before play. */
  meetAndLearn: boolean;
  isSpeedChallenge: boolean;
  /** Bonus scene: drag color thumbnails onto gray silhouettes in the ocean. */
  isFriendsMatch: boolean;
  targetScore?: number;
  timeLimit?: number;
};

export type Character = {
  id: string;
  name: string;
  funFact: string;
  pronunciation?: string;
  img: string;
  outline: string;
};

export type Ocean = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  gradient: string;
  bg: string;
  /** Educational difficulty label for the ocean card. */
  difficultyLabel: OceanDifficulty;
  /** Featured character for ocean cards / branding. */
  character: Character;
  levels: Level[];
};

const CHARACTERS: Character[] = [
  {
    id: "whale",
    name: "Blue Whale",
    pronunciation: "BLOO WAYL",
    funFact: "Blue whales are the biggest animals that have ever lived — even bigger than dinosaurs!",
    img: char1,
    outline: outline1,
  },
  {
    id: "clownfish",
    name: "Clownfish",
    pronunciation: "KLOWN-fish",
    funFact: "Clownfish are best friends with sea anemones and live safely inside them!",
    img: char2,
    outline: outline2,
  },
  {
    id: "crab",
    name: "Crab",
    pronunciation: "KRAB",
    funFact: "Crabs walk sideways because of the way their legs bend!",
    img: char3,
    outline: outline3,
  },
  {
    id: "dolphin",
    name: "Dolphin",
    pronunciation: "DOL-fin",
    funFact: "Dolphins call each other by name using special whistles!",
    img: char4,
    outline: outline4,
  },
  {
    id: "octopus",
    name: "Octopus",
    pronunciation: "OK-tuh-pus",
    funFact: "Octopuses have three hearts and blue blood — amazing!",
    img: char5,
    outline: outline5,
  },
  {
    id: "seahorse",
    name: "Seahorse",
    pronunciation: "SEE-horse",
    funFact: "Daddy seahorses carry the babies until they hatch!",
    img: char6,
    outline: outline6,
  },
  {
    id: "seaturtle",
    name: "Sea Turtle",
    pronunciation: "SEE TUR-tul",
    funFact: "Sea turtles have been swimming the oceans for over 100 million years!",
    img: char7,
    outline: outline7,
  },
  {
    id: "shark",
    name: "Friendly Shark",
    pronunciation: "SHARK",
    funFact: "Sharks have been around longer than trees — they're ancient ocean explorers!",
    img: char8,
    outline: outline8,
  },
  {
    id: "orca",
    name: "Orca",
    pronunciation: "OR-kuh",
    funFact: "Orcas live in families called pods and stay together for life!",
    img: char9,
    outline: outline9,
  },
];

type OceanDef = {
  id: string;
  name: string;
  tagline: string;
  accent: string;
  gradient: string;
  bg: string;
  difficultyLabel: OceanDifficulty;
  characterIndex: number;
};

/** The five real oceans of the world — educational journey order. */
const OCEAN_DEFS: OceanDef[] = [
  {
    id: "pacific",
    name: "Pacific Ocean",
    tagline: "Largest & deepest — tropical reefs await!",
    accent: "#2EC4F1",
    gradient: "linear-gradient(180deg, #5EE7C4 0%, #2EC4F1 40%, #0B3D91 100%)",
    bg: bgPacific,
    difficultyLabel: "Beginner",
    characterIndex: 1, // clownfish
  },
  {
    id: "atlantic",
    name: "Atlantic Ocean",
    tagline: "Home of dolphins, whales & sea turtles!",
    accent: "#3DDC97",
    gradient: "linear-gradient(180deg, #7FD8FF 0%, #2EC4F1 45%, #0B3D91 100%)",
    bg: bgAtlantic,
    difficultyLabel: "Easy",
    characterIndex: 3, // dolphin
  },
  {
    id: "indian",
    name: "Indian Ocean",
    tagline: "Warm coral seas & reef explorers!",
    accent: "#FFD93D",
    gradient: "linear-gradient(180deg, #FFE08A 0%, #2EC4F1 50%, #0B3D91 100%)",
    bg: bgIndian,
    difficultyLabel: "Medium",
    characterIndex: 4, // octopus / reef feel
  },
  {
    id: "southern",
    name: "Southern Ocean",
    tagline: "Icy waters around Antarctica!",
    accent: "#7FD8FF",
    gradient: "linear-gradient(180deg, #D4F1F9 0%, #7FD8FF 40%, #0B3D91 100%)",
    bg: bgSouthern,
    difficultyLabel: "Hard",
    characterIndex: 0, // whale
  },
  {
    id: "arctic",
    name: "Arctic Ocean",
    tagline: "Smallest, coldest — the final world!",
    accent: "#A8D8EA",
    gradient: "linear-gradient(180deg, #E8F7FF 0%, #7FD8FF 35%, #061F52 100%)",
    bg: bgArctic,
    difficultyLabel: "Expert",
    characterIndex: 8, // orca
  },
];

/**
 * Base fish counts per local level (1–5).
 * Later oceans bump these further for progressive difficulty.
 */
const MATCH_FISH_COUNTS = [2, 3, 4, 6, 8] as const;

const LEVELS_PER_OCEAN = 7; // 5 match + speed challenge + Match the Ocean Friends

function pickFishIds(oceanIndex: number, count: number): string[] {
  const ids = CHARACTERS.map((c) => c.id);
  const start = oceanIndex % ids.length;
  const result: string[] = [];
  const wanted = Math.min(count, ids.length);
  for (let i = 0; i < wanted; i++) {
    result.push(ids[(start + i) % ids.length]!);
  }
  return result;
}

function matchDifficulty(localNumber: number, oceanIndex: number): Difficulty {
  const base = MATCH_FISH_COUNTS[localNumber - 1] ?? 2;
  // Ocean difficulty bump: Pacific +0 … Arctic +2 (capped at 9)
  const oceanBump = Math.min(2, Math.floor(oceanIndex / 2) + (oceanIndex >= 3 ? 1 : 0));
  const levelBump = localNumber >= 4 && oceanIndex >= 2 ? 1 : 0;
  const fishCount = Math.min(9, base + oceanBump + levelBump);

  return {
    fishCount,
    speed: 0.85 + localNumber * 0.1 + oceanIndex * 0.08,
    targetScale: Math.max(0.58, 1 - (localNumber - 1) * 0.06 - oceanIndex * 0.04),
    gap:
      localNumber <= 2 && oceanIndex <= 1
        ? "comfortable"
        : localNumber <= 4 && oceanIndex <= 2
          ? "tight"
          : "packed",
    shuffleShadows: localNumber >= 2 || oceanIndex >= 1,
    rotateFish: false, // keep cards upright for focus; difficulty comes from count/spacing
    optionCount: Math.min(4, 2 + Math.floor(localNumber / 2) + Math.floor(oceanIndex / 2)),
  };
}

function challengeDifficulty(oceanIndex: number): Difficulty {
  return {
    fishCount: CHARACTERS.length,
    speed: 1.3 + oceanIndex * 0.12,
    targetScale: Math.max(0.62, 0.78 - oceanIndex * 0.03),
    gap: "packed",
    shuffleShadows: true,
    rotateFish: false,
    optionCount: Math.min(4, 3 + Math.floor(oceanIndex / 2)),
  };
}

function friendsDifficulty(oceanIndex: number, fishCount: number): Difficulty {
  return {
    fishCount,
    speed: 1 + oceanIndex * 0.06,
    targetScale: 1,
    gap: "comfortable",
    shuffleShadows: false,
    rotateFish: false,
    optionCount: 0,
  };
}

/** Unique creatures taught across this ocean's match levels (data-driven friends set). */
function friendsFishIds(matchFishLists: string[][], oceanIndex: number): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const list of matchFishLists) {
    for (const id of list) {
      if (seen.has(id)) continue;
      seen.add(id);
      ordered.push(id);
    }
  }
  // Keep the scene readable in landscape — cap at 8, pad to at least 4
  let ids = ordered.slice(0, 8);
  if (ids.length < 4) {
    for (const id of pickFishIds(oceanIndex, 6)) {
      if (ids.includes(id)) continue;
      ids.push(id);
      if (ids.length >= 4) break;
    }
  }
  return ids;
}

function buildLevels(oceanIndex: number, startLevel: number, isFinalOcean: boolean): Level[] {
  const levels: Level[] = [];
  const matchFishLists: string[][] = [];

  for (let local = 1; local <= 5; local++) {
    const difficulty = matchDifficulty(local, oceanIndex);
    const fishIds = pickFishIds(oceanIndex, difficulty.fishCount);
    matchFishLists.push(fishIds);
    levels.push({
      id: `level-${startLevel + local - 1}`,
      number: startLevel + local - 1,
      localNumber: local,
      mode: "match",
      title: `Level ${local}`,
      fishIds,
      difficulty: { ...difficulty, fishCount: fishIds.length },
      meetAndLearn: true,
      isSpeedChallenge: false,
      isFriendsMatch: false,
    });
  }

  const challengeDiff = challengeDifficulty(oceanIndex);
  const allIds = CHARACTERS.map((c) => c.id);
  levels.push({
    id: `level-${startLevel + 5}`,
    number: startLevel + 5,
    localNumber: 6,
    mode: "challenge",
    title: isFinalOcean ? "Final Speed Challenge" : "Speed Challenge",
    fishIds: allIds,
    difficulty: challengeDiff,
    meetAndLearn: false,
    isSpeedChallenge: true,
    isFriendsMatch: false,
    targetScore: 120 + oceanIndex * 35,
    timeLimit: Math.max(20, 40 - oceanIndex * 3),
  });

  const friendIds = friendsFishIds(matchFishLists, oceanIndex);
  levels.push({
    id: `level-${startLevel + 6}`,
    number: startLevel + 6,
    localNumber: 7,
    mode: "friends",
    title: "Match the Ocean Friends",
    fishIds: friendIds,
    difficulty: friendsDifficulty(oceanIndex, friendIds.length),
    meetAndLearn: false,
    isSpeedChallenge: false,
    isFriendsMatch: true,
  });

  return levels;
}

export const OCEANS: Ocean[] = OCEAN_DEFS.map((def, i) => {
  const startLevel = i * LEVELS_PER_OCEAN + 1;
  const isFinal = i === OCEAN_DEFS.length - 1;
  return {
    id: def.id,
    name: def.name,
    tagline: def.tagline,
    accent: def.accent,
    gradient: def.gradient,
    bg: def.bg,
    difficultyLabel: def.difficultyLabel,
    character: CHARACTERS[def.characterIndex % CHARACTERS.length]!,
    levels: buildLevels(i, startLevel, isFinal),
  };
});

export const ALL_CHARACTERS = CHARACTERS;

export const TOTAL_LEVELS = OCEANS.reduce((n, o) => n + o.levels.length, 0);

export function getOcean(id: string): Ocean | undefined {
  return OCEANS.find((o) => o.id === id);
}

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function getLevelFish(level: Level): Character[] {
  return level.fishIds
    .map((id) => getCharacter(id))
    .filter((c): c is Character => Boolean(c));
}

export function getLevel(oceanId: string, levelId: string): { ocean: Ocean; level: Level } | undefined {
  const ocean = getOcean(oceanId);
  if (!ocean) return undefined;
  const level = ocean.levels.find((l) => l.id === levelId || String(l.number) === levelId);
  if (!level) return undefined;
  return { ocean, level };
}

export function getLevelByNumber(num: number): { ocean: Ocean; level: Level } | undefined {
  for (const ocean of OCEANS) {
    const level = ocean.levels.find((l) => l.number === num);
    if (level) return { ocean, level };
  }
  return undefined;
}

export function getPreviousLevel(levelNumber: number): { ocean: Ocean; level: Level } | undefined {
  if (levelNumber <= 1) return undefined;
  return getLevelByNumber(levelNumber - 1);
}

/** Next playable level after this one (may be in the following ocean). */
export function getNextLevel(levelNumber: number): { ocean: Ocean; level: Level } | undefined {
  return getLevelByNumber(levelNumber + 1);
}

export function getCharactersUpTo(oceanIndex: number): Character[] {
  return CHARACTERS.slice(0, Math.max(1, oceanIndex + 1));
}

export const GAP_CLASS: Record<GapSize, string> = {
  comfortable: "gap-4",
  tight: "gap-2.5",
  packed: "gap-1.5",
};

export const DIFFICULTY_COLORS: Record<OceanDifficulty, string> = {
  Beginner: "#3DDC97",
  Easy: "#2EC4F1",
  Medium: "#FFD93D",
  Hard: "#FF9A8B",
  Expert: "#A8D8EA",
};
