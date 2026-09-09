// LocalStorage-backed progress + profile helpers for Ocean Wonders.
// All read/writes are guarded for SSR (typeof window).

import { OCEANS, TOTAL_LEVELS, getLevelByNumber, type Ocean } from "@/data/oceans";

export type AvatarId = "turtle" | "dolphin" | "seahorse" | "octopus" | "clownfish" | "crab";

export type Profile = {
  parent: string;
  email: string;
  nickname: string;
  avatar: AvatarId;
};

export type LevelProgress = {
  stars: number;
  highScore: number;
  completed: boolean;
};

const PROFILE_KEY = "ow:profile";
const DISCOVERIES_KEY = "ow:discoveries";
const BADGES_KEY = "ow:badges";
const ONBOARDED_KEY = "ow:onboarded";
const LEVELS_KEY = "ow:levels:v2";
const COINS_KEY = "ow:coins";
const SHOP_KEY = "ow:shop";
const MUTE_KEY = "ow:mute";
const EQUIP_KEY = "ow:equipped";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function getProfile(): Profile | null {
  const raw = safeGet(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}
export function saveProfile(p: Profile) {
  safeSet(PROFILE_KEY, JSON.stringify(p));
}
export function clearProfile() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}

/** Logout: clear profile only (keep game progress). */
export function logoutProfile() {
  clearProfile();
}

/** Delete account: wipe profile + progress + discoveries. */
export function deleteAccountData() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
    window.localStorage.removeItem(DISCOVERIES_KEY);
    window.localStorage.removeItem(BADGES_KEY);
    window.localStorage.removeItem(ONBOARDED_KEY);
    window.localStorage.removeItem(LEVELS_KEY);
    window.localStorage.removeItem(COINS_KEY);
    window.localStorage.removeItem(SHOP_KEY);
    window.localStorage.removeItem(EQUIP_KEY);
  } catch {
    /* ignore */
  }
}

export function getCoins(): number {
  const raw = safeGet(COINS_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

export function addCoins(amount: number): number {
  const next = getCoins() + Math.max(0, Math.floor(amount));
  safeSet(COINS_KEY, String(next));
  return next;
}

export function spendCoins(amount: number): boolean {
  const cost = Math.max(0, Math.floor(amount));
  const have = getCoins();
  if (have < cost) return false;
  safeSet(COINS_KEY, String(have - cost));
  return true;
}

export function getOwnedItems(): string[] {
  const raw = safeGet(SHOP_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function ownItem(id: string): string[] {
  const set = new Set(getOwnedItems());
  set.add(id);
  const arr = [...set];
  safeSet(SHOP_KEY, JSON.stringify(arr));
  return arr;
}

export function hasItem(id: string): boolean {
  return getOwnedItems().includes(id);
}

export function getEquipped(): Record<string, string> {
  const raw = safeGet(EQUIP_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function equipItem(slot: string, id: string) {
  const next = { ...getEquipped(), [slot]: id };
  safeSet(EQUIP_KEY, JSON.stringify(next));
}

export function isMuted(): boolean {
  return safeGet(MUTE_KEY) === "1";
}

export function setMuted(muted: boolean) {
  safeSet(MUTE_KEY, muted ? "1" : "0");
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

/** Stars from a level award coins (never spends). */
export function awardLevelRewards(stars: number): number {
  return addCoins(5 + Math.max(1, stars) * 10);
}

export function getDiscoveries(): string[] {
  const raw = safeGet(DISCOVERIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
export function addDiscovery(id: string): string[] {
  const set = new Set(getDiscoveries());
  set.add(id);
  const arr = [...set];
  safeSet(DISCOVERIES_KEY, JSON.stringify(arr));
  return arr;
}

export function getBadges(): string[] {
  const raw = safeGet(BADGES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
export function unlockBadge(oceanId: string): string[] {
  const set = new Set(getBadges());
  set.add(oceanId);
  const arr = [...set];
  safeSet(BADGES_KEY, JSON.stringify(arr));
  return arr;
}

export function isOnboarded(): boolean {
  return safeGet(ONBOARDED_KEY) === "1";
}
export function markOnboarded() {
  safeSet(ONBOARDED_KEY, "1");
}

export function getAllLevelProgress(): Record<string, LevelProgress> {
  const raw = safeGet(LEVELS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, LevelProgress>;
  } catch {
    return {};
  }
}

export function getLevelProgress(levelNumber: number): LevelProgress {
  const all = getAllLevelProgress();
  return all[String(levelNumber)] ?? { stars: 0, highScore: 0, completed: false };
}

export function saveLevelProgress(
  levelNumber: number,
  update: { stars?: number; score?: number; completed?: boolean },
): LevelProgress {
  const all = getAllLevelProgress();
  const prev = all[String(levelNumber)] ?? { stars: 0, highScore: 0, completed: false };
  const next: LevelProgress = {
    stars: Math.max(prev.stars, update.stars ?? 0),
    highScore: Math.max(prev.highScore, update.score ?? 0),
    completed: prev.completed || !!update.completed,
  };
  all[String(levelNumber)] = next;
  safeSet(LEVELS_KEY, JSON.stringify(all));

  if (next.completed) {
    const found = getLevelByNumber(levelNumber);
    if (found) {
      const oceanDone = found.ocean.levels.every((l) => {
        if (l.number === levelNumber) return true;
        return getLevelProgress(l.number).completed;
      });
      if (oceanDone) unlockBadge(found.ocean.id);
      addDiscovery(found.ocean.character.id);
    }
  }

  return next;
}

export function isLevelUnlocked(levelNumber: number): boolean {
  if (levelNumber <= 1) return true;
  return getLevelProgress(levelNumber - 1).completed;
}

export function isOceanUnlocked(ocean: Ocean): boolean {
  const first = ocean.levels[0];
  return first ? isLevelUnlocked(first.number) : false;
}

export function getOceanStats(ocean: Ocean) {
  const progresses = ocean.levels.map((l) => getLevelProgress(l.number));
  const completed = progresses.filter((p) => p.completed).length;
  const stars = progresses.reduce((n, p) => n + p.stars, 0);
  const bestScore = progresses.reduce((n, p) => Math.max(n, p.highScore), 0);
  const total = ocean.levels.length;
  const maxStars = total * 3;
  return {
    completed,
    total,
    stars,
    maxStars,
    bestScore,
    percent: Math.round((completed / total) * 100),
    unlocked: isOceanUnlocked(ocean),
  };
}

export function getGlobalStats() {
  let completed = 0;
  let stars = 0;
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const p = getLevelProgress(i);
    if (p.completed) completed++;
    stars += p.stars;
  }
  const badges = getBadges().filter((id) => OCEANS.some((o) => o.id === id));
  return {
    completed,
    total: TOTAL_LEVELS,
    stars,
    maxStars: TOTAL_LEVELS * 3,
    oceansCleared: badges.length,
    totalOceans: OCEANS.length,
  };
}
