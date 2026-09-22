import char1 from "@/assets/Characters_1.png";
import char3 from "@/assets/Characters_3.png";
import char4 from "@/assets/Characters_4.png";
import char5 from "@/assets/Characters_5.png";
import char7 from "@/assets/Characters_7.png";
import char8 from "@/assets/Characters_8.png";
import char9 from "@/assets/Characters_9.png";
import outline1 from "@/assets/Characters_1_outline.png";
import outline3 from "@/assets/Characters_3_outline.png";
import outline4 from "@/assets/Characters_4_outline.png";
import outline5 from "@/assets/Characters_5_outline.png";
import outline7 from "@/assets/Characters_7_outline.png";
import outline8 from "@/assets/Characters_8_outline.png";
import outline9 from "@/assets/Characters_9_outline.png";

import imgDugong from "@/assets/dugong-cut.png";
import imgBeluga from "@/assets/c-beluga.png";
import imgNarwhal from "@/assets/c-narwhal.png";
import imgManta from "@/assets/c-mantaray.png";
import imgTuna from "@/assets/c-tuna.png";
import imgKrill from "@/assets/c-krill.png";
import imgJelly from "@/assets/c-jellyfish.png";
import imgCod from "@/assets/c-cod.png";
import imgSting from "@/assets/c-stingray.png";
import imgWhaleShark from "@/assets/c-whaleshark.png";
import imgSeaHorse from "@/assets/c-seahorse.png";

import imgClown from "@/assets/new/Clownfish.png";
import imgBlueTang from "@/assets/new/Blue-tang.png";
import imgYellowTang from "@/assets/new/Yellow Tang.png";
import imgButterfly from "@/assets/new/Butterflyfish.png";
import imgAngel from "@/assets/new/Angelfish.png";
import imgParrot from "@/assets/new/Parrotfish.png";
import imgTrigger from "@/assets/new/Triggerfish.png";
import imgPuffer from "@/assets/new/Pufferfish.png";
import imgMoorish from "@/assets/new/Moorish-Idol.png";
import imgLion from "@/assets/new/Lionfish.png";
import imgGoby from "@/assets/new/Goby.png";
import imgReefShark from "@/assets/new/Reef sharks.png";

import bgReefA from "@/assets/new-bg.jpg";
import bgReefB from "@/assets/new-bg_01.jpg";

import badgeArctic from "@/assets/arctic-ocean.png";
import badgeAtlantic from "@/assets/atlantic-ocean.png";
import badgePacific from "@/assets/pacific-ocean.png";
import badgeIndian from "@/assets/indian-ocean.png";
import badgeSouthern from "@/assets/southern-ocean.png";

import mapArctic from "@/assets/maps/map-arctic.png";
import mapAtlantic from "@/assets/maps/map-atlantic.png";
import mapPacific from "@/assets/maps/map-pacific.png";
import mapIndian from "@/assets/maps/map-indian.png";
import mapSouthern from "@/assets/maps/map-southern.png";

export type LevelMode = "match" | "challenge" | "friends";

export type GapSize = "comfortable" | "tight" | "packed";

export type OceanDifficulty = "Beginner" | "Easy" | "Medium" | "Hard" | "Expert";

/** Tunables that scale difficulty without changing core gameplay. */
export type Difficulty = {
  fishCount: number;
  speed: number;
  targetScale: number;
  gap: GapSize;
  shuffleShadows: boolean;
  rotateFish: boolean;
  optionCount: number;
  /** Magnetic snap radius in pixels (larger = easier). */
  snapRadius: number;
  /** Extra lookalike silhouettes that are not in the inventory. */
  distractorCount: number;
};

export type Level = {
  id: string;
  number: number;
  localNumber: number;
  mode: LevelMode;
  title: string;
  fishIds: string[];
  distractorIds: string[];
  difficulty: Difficulty;
  meetAndLearn: boolean;
  isSpeedChallenge: boolean;
  isFriendsMatch: boolean;
  targetScore?: number;
  timeLimit?: number;
};

export type Character = {
  id: string;
  name: string;
  funFact: string;
  pronunciation?: string;
  habitat?: string;
  diet?: string;
  img: string;
  outline: string;
};

export type Ocean = {
  id: string;
  name: string;
  tagline: string;
  habitat: string;
  accent: string;
  gradient: string;
  bg: string;
  badge: string;
  map: string;
  difficultyLabel: OceanDifficulty;
  character: Character;
  rosterIds: string[];
  levels: Level[];
};

const CHARACTERS: Character[] = [
  {
    id: "whale",
    name: "Blue Whale",
    pronunciation: "BLOO WAYL",
    habitat: "Open ocean",
    diet: "Tiny krill",
    funFact: "Blue whales are the biggest animals that have ever lived — even bigger than dinosaurs!",
    img: char1,
    outline: outline1,
  },
  {
    id: "clownfish",
    name: "Clownfish",
    pronunciation: "KLOWN-fish",
    habitat: "Warm coral reefs",
    diet: "Algae and tiny bits of food",
    funFact: "Clownfish are best friends with sea anemones and live safely inside them!",
    img: imgClown,
    outline: imgClown,
  },
  {
    id: "crab",
    name: "Crab",
    pronunciation: "KRAB",
    habitat: "Sandy shores and reefs",
    diet: "Algae, snails, and leftovers",
    funFact: "Crabs walk sideways because of the way their legs bend!",
    img: char3,
    outline: outline3,
  },
  {
    id: "dolphin",
    name: "Dolphin",
    pronunciation: "DOL-fin",
    habitat: "Open sea and coasts",
    diet: "Fish and squid",
    funFact: "Dolphins call each other by name using special whistles!",
    img: char4,
    outline: outline4,
  },
  {
    id: "octopus",
    name: "Octopus",
    pronunciation: "OK-tuh-pus",
    habitat: "Rocky reefs",
    diet: "Crabs and clams",
    funFact: "Octopuses have three hearts and blue blood — amazing!",
    img: char5,
    outline: outline5,
  },
  {
    id: "seahorse",
    name: "Seahorse",
    pronunciation: "SEE-horse",
    habitat: "Seagrass and reefs",
    diet: "Tiny shrimp",
    funFact: "Daddy seahorses carry the babies until they hatch!",
    img: imgSeaHorse,
    outline: imgSeaHorse,
  },
  {
    id: "seaturtle",
    name: "Sea Turtle",
    pronunciation: "SEE TUR-tul",
    habitat: "Tropical reefs and open sea",
    diet: "Seagrass and jellyfish",
    funFact: "Sea turtles have been swimming the oceans for over 100 million years!",
    img: char7,
    outline: outline7,
  },
  {
    id: "shark",
    name: "Friendly Shark",
    pronunciation: "SHARK",
    habitat: "Open sea",
    diet: "Fish",
    funFact: "Sharks have been around longer than trees — they're ancient ocean explorers!",
    img: char8,
    outline: outline8,
  },
  {
    id: "orca",
    name: "Orca",
    pronunciation: "OR-kuh",
    habitat: "Cold and open seas",
    diet: "Fish and seals",
    funFact: "Orcas live in families called pods and stay together for life!",
    img: char9,
    outline: outline9,
  },
  {
    id: "pufferfish",
    name: "Pufferfish",
    pronunciation: "PUF-er-fish",
    habitat: "Warm reefs",
    diet: "Algae and tiny shells",
    funFact: "Pufferfish can puff up like a balloon to look bigger when they feel shy!",
    img: imgPuffer,
    outline: imgPuffer,
  },
  {
    id: "dugong",
    name: "Dugong",
    pronunciation: "DOO-gong",
    habitat: "Tropical seagrass meadows",
    diet: "Seagrass",
    funFact: "Dugongs are gentle sea cows that graze on seagrass like lawn mowers of the sea!",
    img: imgDugong,
    outline: imgDugong,
  },
  {
    id: "angelfish",
    name: "Angelfish",
    pronunciation: "AYN-jel-fish",
    habitat: "Coral reefs",
    diet: "Sponges and algae",
    funFact: "Angelfish look like they are wearing bright painted stripes!",
    img: imgAngel,
    outline: imgAngel,
  },
  {
    id: "beluga",
    name: "Beluga Whale",
    pronunciation: "beh-LOO-guh",
    habitat: "Cold Arctic waters",
    diet: "Fish",
    funFact: "Belugas are called canaries of the sea because they love to chatter and sing!",
    img: imgBeluga,
    outline: imgBeluga,
  },
  {
    id: "narwhal",
    name: "Narwhal",
    pronunciation: "NAR-wul",
    habitat: "Arctic deep sea",
    diet: "Fish and squid",
    funFact: "A narwhal's long tusk is actually a special tooth that can grow longer than a grown-up!",
    img: imgNarwhal,
    outline: imgNarwhal,
  },
  {
    id: "parrotfish",
    name: "Parrotfish",
    pronunciation: "PAIR-ut-fish",
    habitat: "Tropical reefs",
    diet: "Algae on coral",
    funFact: "Parrotfish help make beach sand — they nibble coral and poop tiny sand grains!",
    img: imgParrot,
    outline: imgParrot,
  },
  {
    id: "mantaray",
    name: "Manta Ray",
    pronunciation: "MAN-tuh RAY",
    habitat: "Open tropical sea",
    diet: "Tiny plankton",
    funFact: "Manta rays have the biggest brains of any fish and love to glide like birds!",
    img: imgManta,
    outline: imgManta,
  },
  {
    id: "tuna",
    name: "Tuna",
    pronunciation: "TOO-nuh",
    habitat: "Open Atlantic sea",
    diet: "Smaller fish",
    funFact: "Tuna can swim as fast as a car on a city street!",
    img: imgTuna,
    outline: imgTuna,
  },
  {
    id: "krill",
    name: "Krill",
    pronunciation: "KRIL",
    habitat: "Southern Ocean",
    diet: "Tiny ocean plants",
    funFact: "Krill are tiny, but whales eat millions of them — they are ocean superfood!",
    img: imgKrill,
    outline: imgKrill,
  },
  {
    id: "jellyfish",
    name: "Jellyfish",
    pronunciation: "JEL-ee-fish",
    habitat: "All the world's oceans",
    diet: "Tiny drifting animals",
    funFact: "Jellyfish have been pulsing through the sea since before the dinosaurs!",
    img: imgJelly,
    outline: imgJelly,
  },
  {
    id: "cod",
    name: "Arctic Cod",
    pronunciation: "AR-tik KOD",
    habitat: "Cold Arctic waters",
    diet: "Tiny shrimp and plankton",
    funFact: "Arctic cod have special antifreeze in their blood so they can swim in icy water!",
    img: imgCod,
    outline: imgCod,
  },
  {
    id: "lionfish",
    name: "Lionfish",
    pronunciation: "LY-un-fish",
    habitat: "Warm reefs",
    diet: "Smaller fish",
    funFact: "Lionfish have fancy striped fins that look like a lion's mane!",
    img: imgLion,
    outline: imgLion,
  },
  {
    id: "stingray",
    name: "Stingray",
    pronunciation: "STING-ray",
    habitat: "Sandy sea floors",
    diet: "Clams and tiny fish",
    funFact: "Stingrays hide under the sand and flap their wide wings to swim!",
    img: imgSting,
    outline: imgSting,
  },
  {
    id: "whaleshark",
    name: "Whale Shark",
    pronunciation: "WAYL SHARK",
    habitat: "Warm open sea",
    diet: "Tiny plankton",
    funFact: "Whale sharks are the biggest fish in the world — and they are gentle giants!",
    img: imgWhaleShark,
    outline: imgWhaleShark,
  },
  {
    id: "bluetang",
    name: "Blue Tang",
    pronunciation: "BLOO TANG",
    habitat: "Pacific coral reefs",
    diet: "Algae",
    funFact: "Blue tangs can turn purple or white when they get excited or sleepy!",
    img: imgBlueTang,
    outline: imgBlueTang,
  },
  {
    id: "yellowtang",
    name: "Yellow Tang",
    pronunciation: "YEL-oh TANG",
    habitat: "Pacific coral reefs",
    diet: "Algae",
    funFact: "Yellow tangs are bright as sunshine and nibble algae to keep reefs clean!",
    img: imgYellowTang,
    outline: imgYellowTang,
  },
  {
    id: "butterflyfish",
    name: "Butterflyfish",
    pronunciation: "BUT-er-fly-fish",
    habitat: "Pacific coral reefs",
    diet: "Coral bits and tiny animals",
    funFact: "Butterflyfish swim in pairs and stay with their best friend for life!",
    img: imgButterfly,
    outline: imgButterfly,
  },
  {
    id: "triggerfish",
    name: "Triggerfish",
    pronunciation: "TRIG-er-fish",
    habitat: "Pacific reefs",
    diet: "Crabs, snails, and sea urchins",
    funFact: "Triggerfish can lock a spine on their back like a door latch to hide in rocks!",
    img: imgTrigger,
    outline: imgTrigger,
  },
  {
    id: "moorishidol",
    name: "Moorish Idol",
    pronunciation: "MOR-ish EYE-dul",
    habitat: "Pacific coral reefs",
    diet: "Sponges and algae",
    funFact: "Moorish idols have a long streaming fin that looks like a fancy ribbon!",
    img: imgMoorish,
    outline: imgMoorish,
  },
  {
    id: "goby",
    name: "Goby",
    pronunciation: "GOH-bee",
    habitat: "Sandy Pacific reefs",
    diet: "Tiny leftover bits",
    funFact: "Gobies are tiny housekeepers — they share a burrow with a shrimp roommate!",
    img: imgGoby,
    outline: imgGoby,
  },
  {
    id: "reefshark",
    name: "Reef Shark",
    pronunciation: "REEF SHARK",
    habitat: "Pacific coral reefs",
    diet: "Fish",
    funFact: "Reef sharks are shy neighbors that help keep the coral reef healthy!",
    img: imgReefShark,
    outline: imgReefShark,
  },
];

/** Real fish only — matching uses these, never whales, turtles, or ice animals. */
const FISH_IDS = [
  "clownfish",
  "bluetang",
  "yellowtang",
  "butterflyfish",
  "angelfish",
  "parrotfish",
  "triggerfish",
  "pufferfish",
  "moorishidol",
  "lionfish",
  "goby",
  "reefshark",
  "tuna",
  "shark",
  "cod",
  "seahorse",
  "stingray",
  "mantaray",
  "whaleshark",
] as const;

type OceanDef = {
  id: string;
  name: string;
  habitat: string;
  tagline: string;
  accent: string;
  gradient: string;
  bg: string;
  badge: string;
  map: string;
  difficultyLabel: OceanDifficulty;
  heroId: string;
  rosterIds: string[];
};

/** Journey order: Arctic unlocks first, then each ocean after the previous finale. */
const OCEAN_DEFS: OceanDef[] = [
  {
    id: "arctic",
    name: "Arctic Ocean",
    habitat: "Sea Ice & Cold-Water Reefs",
    tagline: "Sea Ice & Cold-Water Reefs",
    accent: "#A8D8EA",
    gradient: "linear-gradient(180deg, #E8F7FF 0%, #7FD8FF 35%, #061F52 100%)",
    bg: bgReefA,
    badge: badgeArctic,
    map: mapArctic,
    difficultyLabel: "Beginner",
    heroId: "cod",
    rosterIds: ["cod", "shark", "tuna"],
  },
  {
    id: "atlantic",
    name: "Atlantic Ocean",
    habitat: "Tropical Reefs & Open Sea",
    tagline: "Tropical Reefs & Open Sea",
    accent: "#3DDC97",
    gradient: "linear-gradient(180deg, #7FD8FF 0%, #2EC4F1 45%, #0B3D91 100%)",
    bg: bgReefB,
    badge: badgeAtlantic,
    map: mapAtlantic,
    difficultyLabel: "Easy",
    heroId: "tuna",
    rosterIds: [
      "tuna",
      "angelfish",
      "parrotfish",
      "pufferfish",
      "lionfish",
      "stingray",
      "seahorse",
      "shark",
      "butterflyfish",
      "triggerfish",
    ],
  },
  {
    id: "pacific",
    name: "Pacific Ocean",
    habitat: "Coral Reefs & Open Sea",
    tagline: "Coral Reefs & Open Sea",
    accent: "#2EC4F1",
    gradient: "linear-gradient(180deg, #5EE7C4 0%, #2EC4F1 40%, #0B3D91 100%)",
    bg: bgReefA,
    badge: badgePacific,
    map: mapPacific,
    difficultyLabel: "Medium",
    heroId: "clownfish",
    rosterIds: [
      "clownfish",
      "bluetang",
      "yellowtang",
      "butterflyfish",
      "angelfish",
      "parrotfish",
      "triggerfish",
      "pufferfish",
      "moorishidol",
      "lionfish",
      "goby",
      "reefshark",
    ],
  },
  {
    id: "indian",
    name: "Indian Ocean",
    habitat: "Tropical Reefs & Seagrass",
    tagline: "Tropical Reefs & Seagrass",
    accent: "#FFD93D",
    gradient: "linear-gradient(180deg, #FFE08A 0%, #2EC4F1 50%, #0B3D91 100%)",
    bg: bgReefB,
    badge: badgeIndian,
    map: mapIndian,
    difficultyLabel: "Hard",
    heroId: "lionfish",
    rosterIds: [
      "clownfish",
      "bluetang",
      "butterflyfish",
      "angelfish",
      "parrotfish",
      "triggerfish",
      "pufferfish",
      "moorishidol",
      "lionfish",
      "mantaray",
      "seahorse",
      "reefshark",
    ],
  },
  {
    id: "southern",
    name: "Southern Ocean",
    habitat: "Ice Shelves & Deep Sea",
    tagline: "Ice Shelves & Deep Sea",
    accent: "#7FD8FF",
    gradient: "linear-gradient(180deg, #D4F1F9 0%, #7FD8FF 40%, #0B3D91 100%)",
    bg: bgReefA,
    badge: badgeSouthern,
    map: mapSouthern,
    difficultyLabel: "Expert",
    heroId: "tuna",
    rosterIds: ["tuna", "shark", "stingray"],
  },
];

const LEVELS_PER_OCEAN = 6;
const MATCH_FISH_COUNTS = [4, 6, 6, 6, 8, 8] as const;
const SNAP_RADIUS = [92, 72, 58, 50, 44, 38] as const;
const DISTRACTORS = [0, 0, 0, 0, 0, 0] as const;

function uniquePush(list: string[], id: string) {
  if (!list.includes(id)) list.push(id);
}

function isMatchFish(id: string) {
  return (FISH_IDS as readonly string[]).includes(id);
}

function pickLevelFish(def: OceanDef, count: number): string[] {
  const pool: string[] = [];
  for (const id of def.rosterIds) {
    if (isMatchFish(id)) uniquePush(pool, id);
  }
  return pool.slice(0, Math.min(count, pool.length));
}

function pickDistractors(rosterIds: string[], used: string[], count: number): string[] {
  if (count <= 0) return [];
  return rosterIds.filter((id) => isMatchFish(id) && !used.includes(id)).slice(0, count);
}

function matchDifficulty(localNumber: number, oceanIndex: number, fishCount: number, distractorCount: number): Difficulty {
  return {
    fishCount,
    speed: 0.85 + localNumber * 0.08 + oceanIndex * 0.05,
    targetScale: 1,
    gap: localNumber <= 2 ? "comfortable" : localNumber <= 4 ? "tight" : "packed",
    shuffleShadows: localNumber >= 2,
    rotateFish: false,
    optionCount: 0,
    snapRadius: Math.max(32, (SNAP_RADIUS[localNumber - 1] ?? 48) - oceanIndex * 4),
    distractorCount,
  };
}

function buildLevels(def: OceanDef, oceanIndex: number, startLevel: number): Level[] {
  const levels: Level[] = [];
  for (let local = 1; local <= LEVELS_PER_OCEAN; local++) {
    const baseCount = MATCH_FISH_COUNTS[local - 1] ?? 4;
    const fishIds = pickLevelFish(def, baseCount);
    const distractorIds = pickDistractors(def.rosterIds, fishIds, DISTRACTORS[local - 1] ?? 0);
    const difficulty = matchDifficulty(local, oceanIndex, fishIds.length, distractorIds.length);
    levels.push({
      id: `level-${startLevel + local - 1}`,
      number: startLevel + local - 1,
      localNumber: local,
      mode: "match",
      title: `Level ${local}`,
      fishIds,
      distractorIds,
      difficulty,
      meetAndLearn: false,
      isSpeedChallenge: false,
      isFriendsMatch: false,
      timeLimit: local === 6 ? 90 : undefined,
    });
  }
  return levels;
}

export const OCEANS: Ocean[] = OCEAN_DEFS.map((def, i) => {
  const hero = CHARACTERS.find((c) => c.id === def.heroId) ?? CHARACTERS[0]!;
  return {
    id: def.id,
    name: def.name,
    tagline: def.tagline,
    habitat: def.habitat,
    accent: def.accent,
    gradient: def.gradient,
    bg: def.bg,
    badge: def.badge,
    map: def.map,
    difficultyLabel: def.difficultyLabel,
    character: hero,
    rosterIds: def.rosterIds,
    levels: buildLevels(def, i, i * LEVELS_PER_OCEAN + 1),
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
    .filter(isMatchFish)
    .map((id) => getCharacter(id))
    .filter((c): c is Character => Boolean(c));
}

export function getLevelDistractors(level: Level): Character[] {
  return (level.distractorIds ?? [])
    .filter(isMatchFish)
    .map((id) => getCharacter(id))
    .filter((c): c is Character => Boolean(c));
}

export function getOceanRoster(ocean: Ocean): Character[] {
  return ocean.rosterIds.map((id) => getCharacter(id)).filter((c): c is Character => Boolean(c));
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

export function getNextLevel(levelNumber: number): { ocean: Ocean; level: Level } | undefined {
  return getLevelByNumber(levelNumber + 1);
}

export function getCharactersUpTo(oceanIndex: number): Character[] {
  const seen = new Set<string>();
  const list: Character[] = [];
  for (const ocean of OCEANS.slice(0, Math.max(1, oceanIndex + 1))) {
    for (const id of ocean.rosterIds) {
      if (seen.has(id)) continue;
      const c = getCharacter(id);
      if (!c) continue;
      seen.add(id);
      list.push(c);
    }
  }
  return list;
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

export const OCEAN_JOURNEY_ORDER = OCEAN_DEFS.map((d) => d.id);
