import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Fish, Pause, Play, RotateCcw, Star, Target, Timer, Volume2 } from "lucide-react";
import {
  getLevel,
  getLevelFish,
  getNextLevel,
  type Character,
  type Level,
  type Ocean,
} from "@/data/oceans";
import { LevelPlayBackground } from "@/components/LevelPlayBackground";
import { GlossyButton } from "@/components/GlossyButton";
import { LevelCompleteSchoolSwim } from "@/components/LevelCompleteSchoolSwim";
import { MatchOceanFriendsLevel } from "@/components/MatchOceanFriends";
import { BackButton, RoundIconButton, glassHeaderPanelStyle, PAGE_HEADER_PAD } from "@/components/BackBubble";
import {
  getLevelProgress,
  isLevelUnlocked,
  saveLevelProgress,
  addDiscovery,
} from "@/lib/progress";
import { celebrate, sparkleAt } from "@/lib/confetti";

export const Route = createFileRoute("/ocean/$oceanId/level/$levelId")({
  loader: ({ params }) => {
    const found = getLevel(params.oceanId, params.levelId);
    if (!found) throw notFound();
    return found;
  },
  head: ({ loaderData }) => {
    const ocean = loaderData?.ocean;
    const level = loaderData?.level;
    return {
      meta: [
        {
          title: `${level?.title ?? "Level"} — ${ocean?.name ?? "Ocean"} — Ocean Wonders`,
        },
        {
          name: "description",
          content: `Play ${level?.title ?? "a level"} in the ${ocean?.name ?? "ocean"}!`,
        },
      ],
    };
  },
  component: LevelPlayPage,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function haptic(pattern: number | number[] = 12) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}

/** Auto-fit grid based on card count — landscape-friendly (prefer shorter rows). */
function boardLayout(count: number) {
  if (count <= 2) {
    return {
      cols: "grid-cols-2",
      gap: "gap-2 sm:gap-3",
      maxW: "max-w-[180px] sm:max-w-[220px]",
      cell: "w-full min-w-0",
      radius: "rounded-xl sm:rounded-2xl",
      border: "border-[3px]",
    };
  }
  if (count === 3) {
    return {
      cols: "grid-cols-3",
      gap: "gap-1.5 sm:gap-2",
      maxW: "max-w-[240px] sm:max-w-[280px]",
      cell: "w-full min-w-0",
      radius: "rounded-xl sm:rounded-2xl",
      border: "border-[3px]",
    };
  }
  if (count === 4) {
    return {
      cols: "grid-cols-2",
      gap: "gap-2",
      maxW: "max-w-[176px] sm:max-w-[208px]",
      cell: "w-full min-w-0",
      radius: "rounded-xl sm:rounded-2xl",
      border: "border-[3px]",
    };
  }
  if (count <= 6) {
    return {
      cols: "grid-cols-3",
      gap: "gap-1.5 sm:gap-2",
      maxW: "max-w-[240px] sm:max-w-[300px]",
      cell: "w-full min-w-0",
      radius: "rounded-lg sm:rounded-xl",
      border: "border-2 sm:border-[3px]",
    };
  }
  // 7–8+: 4 columns keeps height short in landscape (avoids covering panel titles)
  return {
    cols: "grid-cols-4",
    gap: "gap-1 sm:gap-1.5",
    maxW: "max-w-[320px] sm:max-w-[380px]",
    cell: "w-full min-w-0",
    radius: "rounded-lg sm:rounded-xl",
    border: "border-2",
  };
}

function boardScrollable(count: number) {
  return count > 6;
}

function PanelHeading({
  title,
  icon,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="relative z-10 mb-1 flex shrink-0 justify-center px-1 sm:mb-1.5">
      <div
        className="inline-flex items-center gap-1.5 rounded-full border-2 border-white px-2.5 py-0.5 shadow-sm sm:gap-2 sm:px-3 sm:py-1"
        style={{
          background: `linear-gradient(180deg, #FFFFFF 0%, ${accent}28 100%)`,
        }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-white sm:h-5 sm:w-5"
          style={{ backgroundColor: accent }}
        >
          {icon}
        </span>
        <h2
          className="font-display text-xs font-bold leading-none tracking-tight sm:text-sm"
          style={{ color: "#0B3D91" }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

function LevelPlayPage() {
  const { ocean, level } = Route.useLoaderData();
  const navigate = useNavigate();
  const [lockedOut, setLockedOut] = useState(false);
  const fish = useMemo(() => getLevelFish(level), [level]);

  useEffect(() => {
    setLockedOut(!isLevelUnlocked(level.number));
  }, [level.number]);

  const goBack = () => {
    navigate({ to: "/ocean/$oceanId", params: { oceanId: ocean.id } });
  };

  if (lockedOut) {
    return (
      <main className="relative flex h-dvh items-center justify-center overflow-hidden px-4" style={{ backgroundColor: "#1A2B6D" }}>
        <LevelPlayBackground />
        <div className="relative z-10 rounded-3xl border-4 border-white bg-white/95 p-8 text-center shadow-xl">
          <h1 className="font-display text-3xl font-bold" style={{ color: "#0B3D91" }}>
            Level Locked!
          </h1>
          <p className="mt-2 font-semibold" style={{ color: "#0B3D91" }}>
            Clear the previous level first.
          </p>
          <GlossyButton
            variant="blue"
            className="mt-6"
            onClick={() => navigate({ to: "/ocean/$oceanId", params: { oceanId: ocean.id } })}
          >
            Back to Levels
          </GlossyButton>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-dvh overflow-hidden" style={{ backgroundColor: "#1A2B6D" }}>
      <LevelPlayBackground />

      {level.mode === "match" && (
        <MatchLevelFlow key={`match-${level.number}`} ocean={ocean} level={level} fish={fish} onDone={goBack} />
      )}
      {level.mode === "challenge" && (
        <ChallengeLevelFlow key={`challenge-${level.number}`} ocean={ocean} level={level} fish={fish} onDone={goBack} />
      )}
      {level.mode === "friends" && (
        <FriendsLevelFlow key={`friends-${level.number}`} ocean={ocean} level={level} fish={fish} onDone={goBack} />
      )}
    </main>
  );
}

function GameHeader({
  ocean,
  level,
  progress,
  total,
  onBack,
  paused,
  onTogglePause,
  extra,
}: {
  ocean: Ocean;
  level: Level;
  progress?: number;
  total?: number;
  onBack: () => void;
  paused?: boolean;
  onTogglePause?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <header className={`relative z-[80] flex shrink-0 items-center gap-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-3 ${PAGE_HEADER_PAD}`}>
      <BackButton onClick={onBack} label="Back" />

      <div
        className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border-2 px-2.5 py-2 sm:rounded-3xl sm:px-3.5 sm:py-2.5"
        style={glassHeaderPanelStyle}
      >
        <div
          className="hidden h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 sm:flex"
          style={{
            borderColor: "#5ED4FF",
            background: "linear-gradient(160deg, rgba(255,255,255,0.2), rgba(10,50,120,0.4))",
          }}
        >
          <img src={ocean.character.img} alt="" className="h-[88%] w-[88%] object-contain" draggable={false} />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <div
              className="min-w-0 truncate font-display text-sm font-bold uppercase leading-tight text-white sm:text-base"
              style={{ textShadow: "0 1px 2px rgba(0,20,60,0.45)" }}
            >
              {ocean.name}
            </div>
            {typeof progress === "number" && typeof total === "number" && (
              <span
                className="shrink-0 rounded-full border border-white/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy sm:text-[11px]"
                style={{ background: "#FFB347" }}
              >
                {progress}/{total}
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wide sm:text-xs" style={{ color: "#5ED4FF" }}>
            {level.isSpeedChallenge
              ? "Speed Challenge"
              : level.isFriendsMatch
                ? "Match the Ocean Friends"
                : level.title}
          </div>
          {typeof progress === "number" && typeof total === "number" && total > 0 && (
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full border sm:hidden"
              style={{ background: "rgba(6,24,70,0.55)", borderColor: "rgba(94,212,255,0.35)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(progress / total) * 100}%`,
                  background: "linear-gradient(90deg, #FFB347, #FFE566)",
                }}
              />
            </div>
          )}
        </div>

        {typeof progress === "number" && typeof total === "number" && total > 0 && (
          <div
            className="hidden h-2 w-16 overflow-hidden rounded-full border sm:block sm:w-24"
            style={{ background: "rgba(6,24,70,0.55)", borderColor: "rgba(94,212,255,0.35)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #FFB347, #FFE566)" }}
              animate={{ width: `${(progress / total) * 100}%` }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
            />
          </div>
        )}

        {extra}
      </div>

      {onTogglePause && (
        <RoundIconButton
          variant="blue"
          label={paused ? "Resume" : "Pause"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePause();
          }}
        >
          {paused ? (
            <Play className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="currentColor" strokeWidth={2.5} />
          ) : (
            <Pause className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={2.5} />
          )}
        </RoundIconButton>
      )}
    </header>
  );
}

function StarsRow({ stars, compact = false }: { stars: number; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "justify-center gap-1.5"}`}>
      {[1, 2, 3].map((s) => (
        <motion.div
          key={s}
          initial={{ scale: 0, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.25 + s * 0.18, type: "spring", stiffness: 420, damping: 14 }}
        >
          <Star
            className={compact ? "h-6 w-6 sm:h-7 sm:w-7" : "h-9 w-9 sm:h-10 sm:w-10"}
            fill={s <= stars ? "#FFE566" : "transparent"}
            stroke={s <= stars ? "#FFB347" : "rgba(255,255,255,0.35)"}
            strokeWidth={2.5}
            style={{
              filter: s <= stars ? "drop-shadow(0 2px 4px rgba(255,229,102,0.55))" : undefined,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

const PRAISE = [
  "Amazing!",
  "Great Job!",
  "Fantastic!",
  "You're becoming an Ocean Explorer!",
  "Super swimming!",
  "Wow — perfect matching!",
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function WinOverlay({
  ocean,
  level,
  stars,
  score,
  preview,
  fish,
  elapsedSec,
  accuracy,
  nextTarget,
  onReplay,
  backOceanId,
}: {
  ocean: Ocean;
  level: Level;
  stars: number;
  score: number;
  preview: Character;
  /** Creatures from this level — swim as a school behind the popup. */
  fish?: Character[];
  elapsedSec: number;
  accuracy: number;
  nextTarget?: { oceanId: string; levelId: string };
  onReplay: () => void;
  backOceanId: string;
}) {
  const navigate = useNavigate();
  const praise = PRAISE[Math.min(Math.max(stars, 1), PRAISE.length) - 1] ?? PRAISE[0]!;
  const [busy, setBusy] = useState(false);
  const resolvedNext = useMemo(() => {
    if (nextTarget) return nextTarget;
    const found = getNextLevel(level.number);
    return found ? { oceanId: found.ocean.id, levelId: found.level.id } : undefined;
  }, [nextTarget, level.number]);

  const swimFish = useMemo(
    () => (fish && fish.length > 0 ? fish : [preview]).filter(Boolean),
    [fish, preview],
  );

  const goNext = () => {
    if (busy || !resolvedNext) return;
    setBusy(true);
    navigate({
      to: "/ocean/$oceanId/level/$levelId",
      params: { oceanId: resolvedNext.oceanId, levelId: resolvedNext.levelId },
    });
  };

  const goBack = () => {
    if (busy) return;
    setBusy(true);
    navigate({
      to: "/ocean/$oceanId",
      params: { oceanId: backOceanId },
    });
  };

  const goReplay = () => {
    if (busy) return;
    setBusy(true);
    onReplay();
  };

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-complete-title"
      className="fixed inset-0 z-[200000] flex items-center justify-center px-3 py-2 sm:px-5"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(6,24,70,0.55)" }}
      />

      <LevelCompleteSchoolSwim
        fish={swimFish}
        playKey={`${level.number}-${stars}-${score}`}
      />

      <div
        className="relative z-10 flex max-h-[min(94dvh,560px)] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl border-2 p-3 text-center sm:rounded-3xl sm:p-4"
        style={{
          background: "linear-gradient(160deg, rgba(8,40,110,0.96) 0%, rgba(20,70,150,0.94) 100%)",
          borderColor: "rgba(94,212,255,0.6)",
          boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        {/* Landscape: character + title side-by-side */}
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={preview.img}
            alt=""
            className="h-16 w-16 shrink-0 object-contain drop-shadow-lg sm:h-20 sm:w-20"
            draggable={false}
          />
          <div className="min-w-0 flex-1 text-left">
            <h2
              id="level-complete-title"
              className="font-display text-2xl font-bold uppercase leading-tight text-white sm:text-3xl"
              style={{ textShadow: "0 2px 0 rgba(0,40,90,0.35)" }}
            >
              Level Complete!
            </h2>
            <p className="mt-0.5 truncate text-xs font-semibold text-white/85 sm:text-sm">
              {ocean.name} ·{" "}
              {level.isSpeedChallenge
                ? "Speed Challenge"
                : level.isFriendsMatch
                  ? "Ocean Friends"
                  : level.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="font-display text-base font-bold sm:text-lg" style={{ color: "#FFE566" }}>
                {praise}
              </p>
              <StarsRow stars={stars} compact />
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#5ED4FF" }}>
                {stars === 3 ? "Perfect" : stars === 2 ? "Very Good" : "Good"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Score", value: String(score) },
            { label: "Time", value: formatTime(elapsedSec) },
            { label: "Accuracy", value: `${accuracy}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border px-2 py-1.5 sm:py-2"
              style={{
                background: "rgba(6,24,70,0.55)",
                borderColor: "rgba(94,212,255,0.4)",
              }}
            >
              <div className="text-[10px] font-bold uppercase" style={{ color: "#5ED4FF" }}>
                {stat.label}
              </div>
              <div className="font-display text-base font-bold text-white sm:text-lg">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3">
          {resolvedNext && (
            <GlossyButton
              variant="orange"
              size="md"
              disabled={busy}
              onClick={goNext}
              className="max-w-[220px] flex-1 !min-h-[48px]"
            >
              {busy ? "Loading…" : "Next Level →"}
            </GlossyButton>
          )}
          <GlossyButton
            variant="blue"
            size="md"
            disabled={busy}
            onClick={goReplay}
            className="max-w-[200px] flex-1 !min-h-[48px]"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={3} />
            Replay Level
          </GlossyButton>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={goBack}
          className="mt-2 font-display text-sm font-bold underline disabled:opacity-50"
          style={{ color: "#5ED4FF" }}
        >
          Back to Ocean
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}

/* ---------------- Meet & Learn (compact) ---------------- */

function MeetAndLearn({
  ocean,
  level,
  fish,
  onStart,
  onBack,
}: {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onStart: () => void;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const safeFish = fish.length > 0 ? fish : [ocean.character];
  const current = safeFish[Math.min(idx, safeFish.length - 1)]!;
  const last = idx >= safeFish.length - 1;

  useEffect(() => {
    safeFish.forEach((f) => addDiscovery(f.id));
  }, [safeFish]);

  return (
    <div className="relative z-10 flex h-dvh flex-col overflow-hidden">
      <GameHeader
        ocean={ocean}
        level={level}
        progress={idx + 1}
        total={safeFish.length}
        onBack={onBack}
      />

      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-row items-center gap-3 overflow-hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 sm:gap-5 sm:px-5">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden">
          <p
            className="mb-1 shrink-0 font-display text-xs font-bold text-white/90 sm:text-sm"
            style={{ textShadow: "0 1px 0 rgba(0,0,0,0.25)" }}
          >
            Meet & Learn · {safeFish.length} friends
          </p>
          <div className="mb-1.5 flex max-w-full shrink-0 flex-wrap justify-center gap-1 px-1">
            {safeFish.map((f, i) => (
              <button
                key={f.id}
                type="button"
                aria-label={f.name}
                onClick={() => setIdx(i)}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === idx ? 22 : 8,
                  backgroundColor: i === idx ? "#FFD93D" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>
          <div
            key={current.id}
            onClick={() => {
              if (last) onStart();
              else setIdx((v) => Math.min(v + 1, safeFish.length - 1));
            }}
            className="flex aspect-square w-[min(34vw,168px)] max-h-[min(34dvh,168px)] cursor-pointer items-center justify-center rounded-2xl border-4 border-white bg-white p-2.5 shadow-xl transition-transform hover:scale-105 active:scale-95 sm:w-[min(30vw,200px)] sm:max-h-[min(38dvh,200px)] sm:p-3"
          >
            <img
              src={current.img}
              alt={current.name}
              className="max-h-full max-w-full object-contain pointer-events-none select-none"
              draggable={false}
            />
          </div>
        </div>

        <div
          key={`info-${current.id}`}
          className="flex max-h-full min-h-0 w-[min(100%,320px)] shrink-0 flex-col justify-center overflow-hidden rounded-2xl border-4 border-white bg-white p-3 shadow-xl sm:w-[min(100%,340px)] sm:p-3.5"
        >
          <h2 className="font-display text-xl font-bold leading-tight sm:text-2xl" style={{ color: "#0B3D91" }}>
            {current.name}!
          </h2>
          {current.pronunciation && (
            <div
              className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold sm:text-xs"
              style={{ backgroundColor: "#EAF7FF", color: "#0B3D91" }}
            >
              <Volume2 className="h-3 w-3" />
              {current.pronunciation}
            </div>
          )}
          <div
            className="mt-2 rounded-xl border-2 border-white p-2 text-left text-xs font-semibold leading-snug sm:text-sm"
            style={{ backgroundColor: "#EAF7FF", color: "#0B3D91" }}
          >
            <div
              className="mb-0.5 font-display text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "#FF6F61" }}
            >
              Fun Fact!
            </div>
            {current.funFact}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {!last ? (
              <GlossyButton
                variant="blue"
                size="md"
                className="!w-auto !max-w-none shrink-0"
                onClick={() => setIdx((v) => Math.min(v + 1, safeFish.length - 1))}
              >
                Next →
              </GlossyButton>
            ) : (
              <GlossyButton
                variant="orange"
                size="md"
                className="!w-auto !max-w-none shrink-0"
                onClick={onStart}
              >
                Let's Play! ⭐
              </GlossyButton>
            )}
            <button
              type="button"
              onClick={onStart}
              className="font-display text-xs font-bold underline"
              style={{ color: "#0B3D91" }}
            >
              Skip to game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchLevelFlow({
  ocean,
  level,
  fish,
  onDone,
}: {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"learn" | "play">(level.meetAndLearn ? "learn" : "play");
  const [playKey, setPlayKey] = useState(0);

  const next = getNextLevel(level.number);
  const nextTarget = next
    ? { oceanId: next.ocean.id, levelId: next.level.id }
    : undefined;

  // Reset learn/play when the route level changes (same component instance reuse)
  useEffect(() => {
    setPhase(level.meetAndLearn ? "learn" : "play");
    setPlayKey(0);
  }, [level.number, level.meetAndLearn]);

  function replay() {
    setPhase(level.meetAndLearn ? "learn" : "play");
    setPlayKey((k) => k + 1);
  }

  if (phase === "learn") {
    return (
      <MeetAndLearn
        key={`learn-${level.number}-${playKey}`}
        ocean={ocean}
        level={level}
        fish={fish}
        onStart={() => setPhase("play")}
        onBack={onDone}
      />
    );
  }

  return (
    <ShadowMatchLevel
      key={`play-${level.number}-${playKey}`}
      ocean={ocean}
      level={level}
      fish={fish}
      onDone={onDone}
      onReplay={replay}
      nextTarget={nextTarget}
    />
  );
}

function FriendsLevelFlow({
  ocean,
  level,
  fish,
  onDone,
}: {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onDone: () => void;
}) {
  const [playKey, setPlayKey] = useState(0);
  const next = getNextLevel(level.number);
  const nextTarget = next
    ? { oceanId: next.ocean.id, levelId: next.level.id }
    : undefined;

  useEffect(() => {
    setPlayKey(0);
  }, [level.number]);

  return (
    <MatchOceanFriendsLevel
      key={`friends-${level.number}-${playKey}`}
      ocean={ocean}
      level={level}
      fish={fish}
      onDone={onDone}
      onReplay={() => setPlayKey((k) => k + 1)}
      nextTarget={nextTarget}
      renderWin={({ stars, score, elapsedSec, accuracy, preview }) => (
        <WinOverlay
          ocean={ocean}
          level={level}
          stars={stars}
          score={score}
          preview={preview}
          fish={fish}
          elapsedSec={elapsedSec}
          accuracy={accuracy}
          nextTarget={nextTarget}
          onReplay={() => setPlayKey((k) => k + 1)}
          backOceanId={ocean.id}
        />
      )}
    />
  );
}

/* ---------------- Shadow Match — single-screen, premium drag ---------------- */

function ShadowMatchLevel({
  ocean,
  level,
  fish,
  onDone,
  onReplay,
  nextTarget,
}: {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onDone: () => void;
  onReplay: () => void;
  nextTarget?: { oceanId: string; levelId: string };
}) {
  // Deduplicate by id so matched-count can never be stuck below total
  const uniqueFish = useMemo(() => {
    const seen = new Set<string>();
    const list: Character[] = [];
    for (const c of fish) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      list.push(c);
    }
    return list.length > 0 ? list : fish;
  }, [fish]);

  const total = uniqueFish.length;

  const [creatureOrder] = useState<Character[]>(() => shuffle(uniqueFish));
  const [shadowOrder] = useState<Character[]>(() =>
    level.difficulty.shuffleShadows ? shuffle(uniqueFish) : [...uniqueFish],
  );
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [justMatched, setJustMatched] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ stars: number; score: number; elapsedSec: number; accuracy: number } | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });

  const startTimeRef = useRef(Date.now());
  const mistakesRef = useRef(0);
  const attemptsRef = useRef(0);
  const completingRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);

  const matchedCount = matchedIds.length;
  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Live timer while playing
  useEffect(() => {
    if (done || paused) return;
    const t = setInterval(() => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [done, paused]);

  // Mouse + touch only — PointerSensor + TouchSensor together can lock the drag.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 6 } }),
  );

  const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;
    return closestCenter(args);
  };

  const layout = boardLayout(total);
  const scrollBoard = boardScrollable(total);
  const activeChar = activeId ? uniqueFish.find((c) => c.id === activeId) : null;
  const dragRotate = Math.max(-14, Math.min(14, dragDelta.x * 0.08));

  function finishLevel(finalMatchedCount: number) {
    if (completingRef.current) return;
    completingRef.current = true;

    setActiveId(null);
    setSelectedId(null);
    setDragDelta({ x: 0, y: 0 });
    setPaused(false);

    const finalMistakes = mistakesRef.current;
    const attempts = Math.max(attemptsRef.current, finalMatchedCount, 1);
    const earned = finalMistakes === 0 ? 3 : finalMistakes <= Math.ceil(Math.max(finalMatchedCount, 1) / 2) ? 2 : 1;
    const finalScore = Math.max(40, finalMatchedCount * 40 - finalMistakes * 12);
    const seconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    const accuracy = Math.min(100, Math.max(0, Math.round((finalMatchedCount / attempts) * 100)));

    setResult({ stars: earned, score: finalScore, elapsedSec: seconds, accuracy });
    setElapsedSec(seconds);
    setDone(true);

    try {
      saveLevelProgress(level.number, { stars: earned, score: finalScore, completed: true });
    } catch {
      /* never block popup */
    }

    window.setTimeout(() => {
      try {
        haptic([20, 40, 20]);
        celebrate();
      } catch {
        /* ignore */
      }
    }, 30);
  }

  // Backup completion if drag-end path misses
  useEffect(() => {
    if (done || completingRef.current) return;
    if (total > 0 && matchedCount >= total) {
      finishLevel(matchedCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCount, total, done]);

  function registerMatch(id: string, sparkle?: { left: number; top: number; width: number; height: number } | null) {
    setMatchedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setJustMatched(id);
    setSelectedId(null);
    selectedIdRef.current = null;
    try {
      haptic(18);
      if (sparkle) {
        sparkleAt(
          (sparkle.left + sparkle.width / 2) / window.innerWidth,
          (sparkle.top + sparkle.height / 2) / window.innerHeight,
        );
      } else {
        sparkleAt(0.5, 0.5);
      }
    } catch {
      /* ignore */
    }
    window.setTimeout(() => setJustMatched(null), 400);
  }

  function handleTapCreature(id: string) {
    if (paused || done || completingRef.current || matchedSet.has(id)) return;
    setSelectedId((prev) => {
      const next = prev === id ? null : id;
      selectedIdRef.current = next;
      return next;
    });
    haptic(10);
  }

  function handleTapShadow(shadowCharId: string) {
    if (paused || done || completingRef.current || matchedSet.has(shadowCharId)) return;
    const picked = selectedIdRef.current ?? selectedId;
    if (!picked) return;

    attemptsRef.current += 1;
    if (picked === shadowCharId) {
      registerMatch(picked);
    } else {
      mistakesRef.current += 1;
      setWrongId(picked);
      setSelectedId(null);
      selectedIdRef.current = null;
      try {
        haptic([30, 40, 30]);
      } catch {
        /* ignore */
      }
      window.setTimeout(() => setWrongId(null), 480);
    }
  }

  function onDragStart(e: DragStartEvent) {
    if (paused || done || completingRef.current) return;
    setActiveId(String(e.active.id));
    setSelectedId(null);
    setDragDelta({ x: 0, y: 0 });
    haptic(8);
  }

  function onDragMove(e: DragMoveEvent) {
    if (done) return;
    setDragDelta({ x: e.delta.x, y: e.delta.y });
  }

  function onDragCancel() {
    setActiveId(null);
    setDragDelta({ x: 0, y: 0 });
  }

  function onDragEnd(e: DragEndEvent) {
    const dragId = String(e.active.id);
    setActiveId(null);
    setDragDelta({ x: 0, y: 0 });

    if (paused || done || completingRef.current || !e.over) return;

    const dropId = String(e.over.id).replace(/^shadow-/, "");
    if (matchedSet.has(dragId)) return;

    attemptsRef.current += 1;

    if (dragId === dropId) {
      registerMatch(dragId, e.over.rect);
    } else {
      mistakesRef.current += 1;
      setWrongId(dragId);
      try {
        haptic([30, 40, 30]);
      } catch {
        /* ignore */
      }
      window.setTimeout(() => setWrongId(null), 480);
    }
  }

  const safeBack = () => {
    completingRef.current = true;
    setActiveId(null);
    onDone();
  };

  return (
    <div className="relative z-10 flex h-dvh flex-col overflow-hidden">
      <GameHeader
        ocean={ocean}
        level={level}
        progress={matchedCount}
        total={total}
        onBack={safeBack}
        paused={paused}
        onTogglePause={() => {
          if (done) return;
          setActiveId(null);
          setDragDelta({ x: 0, y: 0 });
          setPaused((p) => !p);
        }}
        extra={
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold text-white sm:text-xs"
            style={{ background: "rgba(6,24,70,0.55)", borderColor: "rgba(94,212,255,0.4)" }}
          >
            <Timer className="h-3 w-3" style={{ color: "#FFE566" }} />
            {formatTime(elapsedSec)}
          </span>
        }
      />

      <div className={`relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-row gap-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 sm:gap-3 ${PAGE_HEADER_PAD}`}>
        {paused && !done && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 backdrop-blur-[2px]"
            style={{ backgroundColor: "rgba(6,24,70,0.55)" }}
          >
            <div
              className="w-full max-w-sm rounded-3xl border-2 px-8 py-8 text-center sm:max-w-md sm:px-10 sm:py-9"
              style={{
                background: "linear-gradient(160deg, rgba(8,40,110,0.96) 0%, rgba(20,70,150,0.94) 100%)",
                borderColor: "rgba(94,212,255,0.6)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
              }}
            >
              <h2 className="font-display text-3xl font-bold uppercase text-white sm:text-4xl">Paused</h2>
              <p className="mt-2 text-base font-semibold text-white/85">
                Time: {formatTime(elapsedSec)}
              </p>
              <div className="mt-6 flex w-full justify-center">
                <GlossyButton
                  variant="blue"
                  size="xl"
                  fullWidth
                  className="!px-12 sm:!px-14"
                  onClick={() => setPaused(false)}
                >
                  Resume
                </GlossyButton>
              </div>
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 p-1.5 sm:rounded-3xl sm:p-2"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(210,236,255,0.9) 100%)",
              borderColor: "rgba(94,212,255,0.8)",
              boxShadow: "0 10px 28px rgba(0,20,60,0.28), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <PanelHeading
              title="Creatures"
              accent={ocean.accent}
              icon={<Fish className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />}
            />
            <div
              className={`flex min-h-0 flex-1 items-center justify-center px-0.5 ${
                scrollBoard ? "overflow-x-hidden overflow-y-auto" : "overflow-hidden"
              }`}
            >
              <div
                className={`mx-auto grid w-full content-center ${layout.cols} ${layout.gap} ${layout.maxW}`}
              >
                {creatureOrder.map((c) => (
                  <DraggableChar
                    key={c.id}
                    character={c}
                    disabled={matchedSet.has(c.id) || done}
                    wrong={wrongId === c.id}
                    accent={ocean.accent}
                    layout={layout}
                    isActive={activeId === c.id}
                    isSelected={selectedId === c.id}
                    onTap={() => handleTapCreature(c.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 p-1.5 sm:rounded-3xl sm:p-2"
            style={{
              background: "linear-gradient(180deg, rgba(230,246,255,0.92) 0%, rgba(190,225,255,0.88) 100%)",
              borderColor: "rgba(42,160,230,0.85)",
              boxShadow: "0 10px 28px rgba(0,20,60,0.28), inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <PanelHeading
              title="Drop on the Shadow"
              accent={ocean.accent}
              icon={<Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />}
            />
            <div
              className={`flex min-h-0 flex-1 items-center justify-center px-0.5 ${
                scrollBoard ? "overflow-x-hidden overflow-y-auto" : "overflow-hidden"
              }`}
            >
              <div
                className={`mx-auto grid w-full content-center ${layout.cols} ${layout.gap} ${layout.maxW}`}
              >
                {shadowOrder.map((c, i) => (
                  <ShadowDrop
                    key={c.id}
                    character={c}
                    matched={matchedSet.has(c.id)}
                    justMatched={justMatched === c.id}
                    accent={ocean.accent}
                    layout={layout}
                    shineIndex={i}
                    dragActive={!!activeId}
                    hasSelection={!!selectedId}
                    onTap={() => handleTapShadow(c.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          <DragOverlay dropAnimation={null}>
            {activeChar && !done ? (
              <div
                className={`pointer-events-none flex aspect-square items-center justify-center ${layout.cell} ${layout.radius} ${layout.border} bg-white p-1.5`}
                style={{
                  borderColor: ocean.accent,
                  boxShadow: "0 18px 36px -8px rgba(11,61,145,0.45)",
                  transform: `rotate(${dragRotate}deg) scale(1.08)`,
                }}
              >
                <img
                  src={activeChar.img}
                  alt={activeChar.name}
                  className="pointer-events-none max-h-full max-w-full object-contain"
                  draggable={false}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {(done || (total > 0 && matchedCount >= total)) && (
        <WinOverlay
          ocean={ocean}
          level={level}
          stars={result?.stars ?? 1}
          score={result?.score ?? Math.max(40, matchedCount * 40)}
          preview={uniqueFish[0] ?? ocean.character}
          fish={uniqueFish}
          elapsedSec={result?.elapsedSec ?? elapsedSec}
          accuracy={result?.accuracy ?? 100}
          nextTarget={nextTarget}
          onReplay={onReplay}
          backOceanId={ocean.id}
        />
      )}
    </div>
  );
}

function DraggableChar({
  character,
  disabled,
  wrong,
  accent,
  layout,
  isActive,
  isSelected = false,
  onTap,
}: {
  character: Character;
  disabled: boolean;
  wrong: boolean;
  accent: string;
  layout: ReturnType<typeof boardLayout>;
  isActive: boolean;
  isSelected?: boolean;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: character.id,
    disabled,
  });
  const tapStart = useRef<{ x: number; y: number } | null>(null);

  const dimmed = isActive || isDragging;
  const { onPointerDown, onPointerUp, ...restListeners } = listeners ?? {};

  return (
    <div
      ref={setNodeRef}
      {...restListeners}
      {...attributes}
      onPointerDown={(e) => {
        tapStart.current = { x: e.clientX, y: e.clientY };
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        const start = tapStart.current;
        tapStart.current = null;
        onPointerUp?.(e);
        if (disabled || !start) return;
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10) {
          onTap?.();
        }
      }}
      className={`relative flex aspect-square touch-none cursor-pointer items-center justify-center overflow-hidden ${layout.cell} ${layout.radius} ${layout.border} bg-white p-1.5 active:cursor-grabbing sm:p-2`}
      style={{
        borderColor: disabled ? "#3DDC97" : isSelected ? "#FFD93D" : accent,
        backgroundColor: disabled ? "#FFD93D" : isSelected ? "#FFF9D6" : "#FFFFFF",
        boxShadow: isSelected
          ? "0 0 0 3px #FFD93D, 0 8px 20px rgba(255,217,61,0.5)"
          : "0 4px 0 rgba(11,61,145,0.14), 0 8px 16px rgba(0,30,80,0.12)",
        opacity: disabled ? 0.55 : dimmed ? 0.3 : 1,
      }}
    >
      <motion.div
        animate={
          wrong
            ? { x: [-10, 10, -7, 7, 0] }
            : isSelected
              ? { scale: [1, 1.08, 1.04] }
              : { x: 0, y: 0, rotate: 0, scale: 1 }
        }
        whileHover={disabled || dimmed ? undefined : { scale: 1.05 }}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={wrong ? { duration: 0.45, ease: "easeOut" } : { type: "spring", stiffness: 420, damping: 28 }}
        className="flex h-full w-full items-center justify-center"
      >
        <img
          src={character.img}
          alt={character.name}
          className="max-h-full max-w-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </motion.div>
      {disabled && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-0.5 -top-0.5 rounded-full border-2 border-white bg-white px-0.5 text-[10px] shadow sm:text-xs"
        >
          ✅
        </motion.span>
      )}
    </div>
  );
}

function ShadowDrop({
  character,
  matched,
  justMatched,
  accent,
  layout,
  shineIndex = 0,
  dragActive = false,
  hasSelection = false,
  onTap,
}: {
  character: Character;
  matched: boolean;
  justMatched: boolean;
  accent: string;
  layout: ReturnType<typeof boardLayout>;
  shineIndex?: number;
  dragActive?: boolean;
  hasSelection?: boolean;
  onTap?: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `shadow-${character.id}`,
    disabled: matched,
  });

  const shineActive = !matched && (isOver || dragActive);

  return (
    <div
      ref={setNodeRef}
      onClick={() => {
        if (!matched) onTap?.();
      }}
      className={`relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden ${layout.cell} ${layout.radius} ${layout.border} bg-white/90 p-1.5 sm:p-2`}
      style={{
        borderColor: matched ? "#3DDC97" : isOver ? "#FFD93D" : hasSelection ? "#5ED4FF" : accent,
        backgroundColor: matched
          ? "rgba(61,220,151,0.35)"
          : isOver
            ? "rgba(255,217,61,0.35)"
            : hasSelection
              ? "rgba(230,248,255,0.95)"
              : "rgba(255,255,255,0.92)",
        boxShadow: isOver && !matched
          ? "0 0 0 3px rgba(255,217,61,0.45)"
          : hasSelection && !matched
            ? "0 0 0 2.5px rgba(94,212,255,0.65)"
            : "0 4px 0 rgba(11,61,145,0.1), 0 8px 16px rgba(0,30,80,0.1)",
      }}
    >
      <motion.div
        animate={{
          scale: justMatched ? [1, 1.12, 1] : isOver && !matched ? 1.06 : hasSelection && !matched ? [1, 1.04, 1] : 1,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 18, repeat: hasSelection && !matched ? Infinity : 0, repeatDelay: 1 }}
        className="flex h-full w-full items-center justify-center"
      >
      <div className="relative inline-flex max-h-full max-w-full items-center justify-center">
        <motion.img
          src={matched ? character.img : character.outline}
          alt=""
          className="relative z-0 max-h-full max-w-full object-contain"
          initial={false}
          animate={matched ? { scale: [0.7, 1.1, 1], opacity: 1 } : { opacity: 0.72 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
          style={{ filter: matched ? undefined : "brightness(0) opacity(0.55)" }}
          draggable={false}
        />
        {!matched && (
          <span
            aria-hidden
            className={`silhouette-shine${shineActive ? " silhouette-shine--active" : ""}`}
            style={{
              WebkitMaskImage: `url(${character.outline})`,
              maskImage: `url(${character.outline})`,
              // Stagger so tray shines feel organic, not robotic
              animationDelay: `${(shineIndex % 6) * 0.4}s`,
            }}
          />
        )}
      </div>
      </motion.div>
    </div>
  );
}

/* ---------------- Speed Challenge ---------------- */

function ChallengeLevelFlow({
  ocean,
  level,
  fish,
  onDone,
}: {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onDone: () => void;
}) {
  const [playKey, setPlayKey] = useState(0);
  const next = getNextLevel(level.number);
  const nextTarget = next
    ? { oceanId: next.ocean.id, levelId: next.level.id }
    : undefined;

  useEffect(() => {
    setPlayKey(0);
  }, [level.number]);

  return (
    <ChallengeLevel
      key={`challenge-${level.number}-${playKey}`}
      ocean={ocean}
      level={level}
      fish={fish}
      onDone={onDone}
      onReplay={() => setPlayKey((k) => k + 1)}
      nextTarget={nextTarget}
    />
  );
}

function ChallengeLevel({
  ocean,
  level,
  fish,
  onDone,
  onReplay,
  nextTarget,
}: {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onDone: () => void;
  onReplay: () => void;
  nextTarget?: { oceanId: string; levelId: string };
}) {
  const timeLimit = level.timeLimit ?? 30;
  const optionCount = level.difficulty.optionCount;
  // Bigger cards for landscape Speed Challenge — don't reuse the compact match-board sizes
  const optionLayout = (() => {
    const n = Math.min(Math.max(optionCount, 2), 4);
    if (n <= 2) {
      return {
        cols: "grid-cols-2",
        gap: "gap-4 sm:gap-5",
        maxW: "max-w-[420px] sm:max-w-[480px]",
        cell: "w-full max-w-[170px] sm:max-w-[200px]",
        radius: "rounded-2xl",
        border: "border-[3px]",
      };
    }
    if (n === 3) {
      return {
        cols: "grid-cols-3",
        gap: "gap-3 sm:gap-4",
        maxW: "max-w-[520px] sm:max-w-[600px]",
        cell: "w-full max-w-[150px] sm:max-w-[180px]",
        radius: "rounded-2xl",
        border: "border-[3px]",
      };
    }
    return {
      cols: "grid-cols-2",
      gap: "gap-3 sm:gap-4",
      maxW: "max-w-[400px] sm:max-w-[460px]",
      cell: "w-full max-w-[160px] sm:max-w-[190px]",
      radius: "rounded-2xl",
      border: "border-[3px]",
    };
  })();
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<Character[]>([]);
  const [target, setTarget] = useState<Character>(fish[0]!);
  const [done, setDone] = useState(false);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [paused, setPaused] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const best = getLevelProgress(level.number).highScore;
  const elapsedSec = Math.max(0, timeLimit - timeLeft);
  const accuracy = hits + misses <= 0 ? 100 : Math.round((hits / (hits + misses)) * 100);

  function nextRound(seed: number) {
    const pool = fish.length ? fish : [ocean.character];
    const correct = pool[seed % pool.length]!;
    const decoys = shuffle(pool.filter((c) => c.id !== correct.id)).slice(0, Math.max(1, optionCount - 1));
    setTarget(correct);
    setOptions(shuffle([correct, ...decoys]));
    setRound((r) => r + 1);
  }

  useEffect(() => {
    nextRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocean.id, level.id]);

  useEffect(() => {
    if (done || paused) return;
    if (timeLeft <= 0) {
      const targetScore = level.targetScore ?? 100;
      const earned =
        score >= targetScore ? 3 : score >= targetScore * 0.6 ? 2 : score > 0 ? 1 : 0;
      setStars(earned);
      if (score > 0) {
        try {
          saveLevelProgress(level.number, { stars: Math.max(1, earned), score, completed: true });
        } catch { /* ignore */ }
        haptic([20, 40, 20]);
        try { celebrate(); } catch { /* ignore */ }
      } else {
        try {
          saveLevelProgress(level.number, { stars: 0, score: 0, completed: false });
        } catch { /* ignore */ }
      }
      setDone(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done, score, level, paused]);

  function pick(c: Character) {
    if (done || feedback || paused) return;
    if (c.id === target.id) {
      setScore((s) => s + 25 + Math.min(20, timeLeft));
      setHits((h) => h + 1);
      setFeedback("ok");
      haptic(14);
      sparkleAt(0.5, 0.4);
    } else {
      setScore((s) => Math.max(0, s - 10));
      setMisses((m) => m + 1);
      setFeedback("bad");
      haptic([25, 30, 25]);
    }
    setTimeout(() => {
      setFeedback(null);
      nextRound(round + 1 + Date.now());
    }, Math.max(200, 380 / level.difficulty.speed));
  }

  return (
    <div className="relative z-10 flex h-dvh flex-col overflow-hidden">
      <GameHeader
        ocean={ocean}
        level={level}
        onBack={onDone}
        paused={paused}
        onTogglePause={() => !done && setPaused((p) => !p)}
        extra={
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold text-white sm:text-xs"
              style={{ background: "rgba(6,24,70,0.55)", borderColor: "rgba(94,212,255,0.4)" }}
            >
              <Timer className="h-3 w-3" style={{ color: "#FFE566" }} /> {timeLeft}s
            </span>
            <span
              className="rounded-full border border-white/50 px-2 py-0.5 text-[10px] font-bold text-navy sm:text-xs"
              style={{ background: "#FFB347" }}
            >
              {score}
            </span>
          </div>
        }
      />

      <div
        className={`relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 ${PAGE_HEADER_PAD}`}
      >
        {paused && !done && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 backdrop-blur-[2px]"
            style={{ backgroundColor: "rgba(6,24,70,0.55)" }}
          >
            <div
              className="w-full max-w-sm rounded-3xl border-2 px-8 py-8 text-center sm:max-w-md sm:px-10 sm:py-9"
              style={{
                background: "linear-gradient(160deg, rgba(8,40,110,0.96) 0%, rgba(20,70,150,0.94) 100%)",
                borderColor: "rgba(94,212,255,0.6)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
              }}
            >
              <h2 className="font-display text-3xl font-bold uppercase text-white sm:text-4xl">Paused</h2>
              <p className="mt-2 text-base font-semibold text-white/85">
                Time left: {timeLeft}s · Score {score}
              </p>
              <div className="mt-6 flex w-full justify-center">
                <GlossyButton
                  variant="blue"
                  size="xl"
                  fullWidth
                  className="!px-12 sm:!px-14"
                  onClick={() => setPaused(false)}
                >
                  Resume
                </GlossyButton>
              </div>
            </div>
          </div>
        )}

        <p className="shrink-0 text-center text-xs font-semibold text-white/90 sm:text-sm">
          Tap the match! Best {Math.max(best, score)} · Goal {level.targetScore ?? 100}
        </p>

        <div className="flex min-h-0 flex-1 flex-row gap-2.5 sm:gap-3">
          <section
            className="flex min-h-0 w-[38%] min-w-0 flex-col overflow-hidden rounded-2xl border-2 p-2 sm:rounded-3xl sm:p-2.5"
            style={{
              background: "linear-gradient(180deg, rgba(230,246,255,0.92) 0%, rgba(190,225,255,0.88) 100%)",
              borderColor: "rgba(42,160,230,0.85)",
              boxShadow: "0 10px 28px rgba(0,20,60,0.28), inset 0 1px 0 rgba(255,255,255,0.55)",
            }}
          >
            <PanelHeading
              title="Find this Shadow"
              accent={ocean.accent}
              icon={<Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />}
            />
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div
                className="flex aspect-square w-[min(28vw,200px)] items-center justify-center rounded-2xl border-[3px] bg-white/92 p-2.5 shadow-md sm:w-[min(26vw,220px)] sm:p-3"
                style={{
                  borderColor: ocean.accent,
                  boxShadow: "0 4px 0 rgba(11,61,145,0.12), 0 10px 20px rgba(0,30,80,0.12)",
                }}
              >
                <img
                  src={target.outline}
                  alt="Shadow"
                  className="max-h-full max-w-full object-contain"
                  style={{ filter: "brightness(0) opacity(0.55)" }}
                  draggable={false}
                />
              </div>
            </div>
          </section>

          <section
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 p-2 sm:rounded-3xl sm:p-2.5"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(210,236,255,0.9) 100%)",
              borderColor: "rgba(94,212,255,0.8)",
              boxShadow: "0 10px 28px rgba(0,20,60,0.28), inset 0 1px 0 rgba(255,255,255,0.7)",
            }}
          >
            <PanelHeading
              title="Tap the Match"
              accent={ocean.accent}
              icon={<Fish className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />}
            />
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-1">
              <div
                className={`mx-auto grid w-full place-items-center ${optionLayout.cols} ${optionLayout.gap} ${optionLayout.maxW}`}
              >
                {options.map((c) => (
                  <button
                    key={`${c.id}-${round}`}
                    type="button"
                    onClick={() => pick(c)}
                    disabled={!!feedback || paused || done}
                    className={`flex aspect-square items-center justify-center ${optionLayout.cell} ${optionLayout.radius} ${optionLayout.border} bg-white p-2 transition-transform active:scale-95 disabled:opacity-90 sm:p-2.5`}
                    style={{
                      borderColor: ocean.accent,
                      backgroundColor:
                        feedback === "ok" && c.id === target.id
                          ? "#FFD93D"
                          : feedback === "bad" && c.id === target.id
                            ? "#FF6F61"
                            : "#FFFFFF",
                      boxShadow: "0 4px 0 rgba(11,61,145,0.14), 0 8px 16px rgba(0,30,80,0.12)",
                    }}
                  >
                    <img
                      src={c.img}
                      alt={c.name}
                      className="max-h-full max-w-full object-contain"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {done && score > 0 && (
        <WinOverlay
          ocean={ocean}
          level={level}
          stars={stars}
          score={score}
          preview={fish[0] ?? ocean.character}
          fish={fish}
          elapsedSec={elapsedSec}
          accuracy={accuracy}
          nextTarget={nextTarget}
          onReplay={onReplay}
          backOceanId={ocean.id}
        />
      )}
      {done && score <= 0 && (
        <ChallengeFailOverlay onReplay={onReplay} backOceanId={ocean.id} />
      )}
    </div>
  );
}

function ChallengeFailOverlay({
  onReplay,
  backOceanId,
}: {
  onReplay: () => void;
  backOceanId: string;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-3 py-2 sm:px-5"
      style={{ backgroundColor: "rgba(6,24,70,0.65)" }}
    >
      <div
        className="relative max-h-[min(94dvh,420px)] w-full max-w-xl overflow-y-auto rounded-2xl border-2 p-4 text-center sm:rounded-3xl sm:p-5"
        style={{
          background: "linear-gradient(160deg, rgba(8,40,110,0.96) 0%, rgba(20,70,150,0.94) 100%)",
          borderColor: "rgba(94,212,255,0.6)",
          boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5)",
        }}
      >
        <h2 className="font-display text-2xl font-bold uppercase text-white sm:text-3xl">Time's up!</h2>
        <p className="mt-1 text-sm font-semibold text-white/85 sm:text-base">Try again to clear this challenge.</p>
        <div className="mt-4 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3">
          <GlossyButton
            variant="orange"
            size="md"
            disabled={busy}
            className="max-w-[200px] flex-1"
            onClick={() => {
              setBusy(true);
              onReplay();
            }}
          >
            Try Again
          </GlossyButton>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              navigate({ to: "/ocean/$oceanId", params: { oceanId: backOceanId } });
            }}
            className="font-display text-sm font-bold underline disabled:opacity-50"
            style={{ color: "#5ED4FF" }}
          >
            Back to Ocean
          </button>
        </div>
      </div>
    </div>
  );
}
