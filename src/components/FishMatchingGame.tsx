import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import type { ReactNode } from "react";
import { Check, Pause, Play } from "lucide-react";
import { FrostedPill } from "@/components/ChunkyTitle";
import { BackButton, RoundIconButton, PAGE_HEADER_PAD } from "@/components/BackBubble";
import { GlossyButton } from "@/components/GlossyButton";
import { COPY } from "@/data/content";
import logoSeaFriends from "@/assets/logo-sea-friends.png";
import logoMatching from "@/assets/logo-fish-matching.png";
import sceneReef from "@/assets/scene-reef.jpg";
import {
  getLevelDistractors,
  type Character,
  type Level,
  type Ocean,
} from "@/data/oceans";
import { KnockoutImg, useKnockoutSrc } from "@/components/KnockoutImg";
import { sparkleAt } from "@/lib/confetti";
import { awardLevelRewards, saveLevelProgress } from "@/lib/progress";
import { playSfx } from "@/lib/sfx";

type SwimJob = {
  id: string;
  src: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

type ShadowSlot = { left: number; top: number; size: number };

const SHADOW_SLOTS: Record<number, ShadowSlot[]> = {
  4: [
    { left: 26, top: 38, size: 20 },
    { left: 64, top: 30, size: 24 },
    { left: 36, top: 72, size: 21 },
    { left: 80, top: 64, size: 26 },
  ],
  6: [
    { left: 22, top: 34, size: 17 },
    { left: 50, top: 26, size: 19 },
    { left: 78, top: 32, size: 22 },
    { left: 30, top: 66, size: 18 },
    { left: 58, top: 72, size: 20 },
    { left: 84, top: 58, size: 23 },
  ],
  8: [
    { left: 18, top: 30, size: 15 },
    { left: 42, top: 24, size: 16 },
    { left: 66, top: 28, size: 18 },
    { left: 88, top: 38, size: 17 },
    { left: 24, top: 56, size: 16 },
    { left: 50, top: 52, size: 17 },
    { left: 74, top: 62, size: 19 },
    { left: 40, top: 78, size: 16 },
  ],
};

function slotsForCount(n: number) {
  const key = n <= 4 ? 4 : n <= 6 ? 6 : 8;
  return (SHADOW_SLOTS[key] ?? SHADOW_SLOTS[6]!).slice(0, n);
}

function magneticCollision(snapRadius: number): CollisionDetection {
  return (args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) return pointerHits;

    const { pointerCoordinates, droppableRects, droppableContainers } = args;
    if (!pointerCoordinates) return [];

    let closest: { id: UniqueIdentifier; dist: number } | null = null;
    for (const container of droppableContainers) {
      if (container.disabled) continue;
      const rect = droppableRects.get(container.id);
      if (!rect) continue;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(pointerCoordinates.x - cx, pointerCoordinates.y - cy);
      if (dist <= snapRadius && (!closest || dist < closest.dist)) {
        closest = { id: container.id, dist };
      }
    }
    return closest ? [{ id: closest.id }] : [];
  };
}

type Props = {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onDone: () => void;
  onReplay: () => void;
  renderWin: (args: {
    stars: number;
    score: number;
    elapsedSec: number;
    accuracy: number;
    coins: number;
    preview: Character;
    oceanComplete: boolean;
  }) => ReactNode;
};

export function FishMatchingGame({ ocean, level, fish, onDone, onReplay: _onReplay, renderWin }: Props) {
  const uniqueFish = useMemo(() => {
    const seen = new Set<string>();
    const list: Character[] = [];
    for (const c of fish) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      list.push(c);
    }
    return list.length > 0 ? list : [ocean.character];
  }, [fish, ocean.character]);

  const distractors = useMemo(() => getLevelDistractors(level), [level]);
  const dropTargets = useMemo(() => [...uniqueFish, ...distractors], [uniqueFish, distractors]);

  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [settledIds, setSettledIds] = useState<string[]>([]);
  const [glowIds, setGlowIds] = useState<string[]>([]);
  const [praiseOn, setPraiseOn] = useState(false);
  const [swimmers, setSwimmers] = useState<SwimJob[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nearId, setNearId] = useState<string | null>(null);
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{
    stars: number;
    score: number;
    elapsedSec: number;
    accuracy: number;
    coins: number;
    oceanComplete: boolean;
  } | null>(null);

  const startRef = useRef(Date.now());
  const mistakesRef = useRef(0);
  const attemptsRef = useRef(0);
  const completingRef = useRef(false);
  const playRef = useRef<HTMLElement | null>(null);
  const claimedSet = useMemo(() => new Set(claimedIds), [claimedIds]);
  const settledSet = useMemo(() => new Set(settledIds), [settledIds]);
  const total = uniqueFish.length;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
  );
  const collision = useMemo(
    () => magneticCollision(level.difficulty.snapRadius),
    [level.difficulty.snapRadius],
  );

  useEffect(() => {
    startRef.current = Date.now();
    completingRef.current = false;
  }, [level.number]);

  function finishLevel() {
    if (completingRef.current) return;
    completingRef.current = true;
    const mistakes = mistakesRef.current;
    const attempts = Math.max(attemptsRef.current, total, 1);
    const elapsedSec = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000));
    const accuracy = Math.min(100, Math.max(0, Math.round((total / attempts) * 100)));
    let stars = mistakes === 0 ? 3 : mistakes <= Math.ceil(total / 2) ? 2 : 1;
    if (level.localNumber === 6 && level.timeLimit && elapsedSec <= level.timeLimit && stars < 3) {
      stars += 1;
    }
    const score = Math.max(50, total * 50 - mistakes * 10 + Math.max(0, 40 - elapsedSec));
    let coins = 0;
    let oceanComplete = false;
    try {
      const saved = saveLevelProgress(level.number, { stars, score, completed: true });
      coins = awardLevelRewards(saved.stars || stars);
      oceanComplete = level.localNumber === ocean.levels.length;
    } catch {
      coins = 5 + stars * 10;
      oceanComplete = level.localNumber === ocean.levels.length;
    }

    playSfx("complete");
    setResult({ stars, score, elapsedSec, accuracy, coins, oceanComplete });
    setDone(true);
  }

  function onDragStart(e: DragStartEvent) {
    if (paused || done) return;
    playSfx("tap");
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const dragId = String(e.active.id);
    setActiveId(null);
    setNearId(null);
    if (paused || done || claimedSet.has(dragId)) return;

    const overId = e.over ? String(e.over.id).replace(/^shadow-/, "") : null;
    attemptsRef.current += 1;

    if (overId && overId === dragId) {
      const character = uniqueFish.find((c) => c.id === dragId);
      const playBox = playRef.current?.getBoundingClientRect();
      const overRect = e.over?.rect;
      setClaimedIds((prev) => (prev.includes(dragId) ? prev : [...prev, dragId]));
      setGlowIds((prev) => (prev.includes(dragId) ? prev : [...prev, dragId]));

      window.setTimeout(() => {
        setGlowIds((prev) => prev.filter((id) => id !== dragId));
        if (!character || !playBox || !overRect) {
          setSettledIds((prev) => (prev.includes(dragId) ? prev : [...prev, dragId]));
          return;
        }
        playSfx("match");
        sparkleAt(
          (overRect.left + overRect.width / 2) / window.innerWidth,
          (overRect.top + overRect.height / 2) / window.innerHeight,
        );
        setPraiseOn(true);
        window.setTimeout(() => setPraiseOn(false), 850);
        setSwimmers((prev) => [
          ...prev.filter((s) => s.id !== dragId),
          {
            id: dragId,
            src: character.img,
            from: { x: playBox.width + 36, y: overRect.top + overRect.height / 2 - playBox.top },
            to: {
              x: overRect.left + overRect.width / 2 - playBox.left,
              y: overRect.top + overRect.height / 2 - playBox.top,
            },
          },
        ]);
      }, 180);
    } else {
      mistakesRef.current += 1;
      playSfx("bounce");
      setWobbleId(dragId);
      window.setTimeout(() => setWobbleId(null), 420);
    }
  }

  useEffect(() => {
    if (settledIds.length < total || total === 0 || done || completingRef.current) return;
    if (swimmers.length > 0) return;
    const t = window.setTimeout(() => finishLevel(), 420);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settledIds.length, swimmers.length, total, done]);

  const activeChar = activeId ? uniqueFish.find((c) => c.id === activeId) : null;
  const preview = uniqueFish[0] ?? ocean.character;

  return (
    <div className="relative z-10 flex h-dvh flex-col overflow-hidden">
      <PlaySceneBackground ocean={ocean} />

      <header
        className={`relative z-[80] flex shrink-0 items-center gap-2 pt-[max(0.4rem,env(safe-area-inset-top))] ${PAGE_HEADER_PAD}`}
      >
        <BackButton
          onClick={() => {
            completingRef.current = true;
            onDone();
          }}
          label="Back"
        />
        <div className="min-w-0 flex-1 text-center">
          <img
            src={logoMatching}
            alt={COPY.fishMatching}
            className="mx-auto h-10 w-auto max-w-[min(52vw,420px)] object-contain sm:h-12"
            draggable={false}
          />
        </div>
        <FrostedPill>
          {ocean.name.replace(" Ocean", "")} · {level.title}
        </FrostedPill>
        <RoundIconButton
          variant="blue"
          label={paused ? "Resume" : "Pause"}
          onClick={() => {
            if (done) return;
            setActiveId(null);
            setPaused((p) => !p);
            playSfx("tap");
          }}
        >
          {paused ? (
            <Play className="h-6 w-6 text-white sm:h-7 sm:w-7" fill="currentColor" strokeWidth={2.5} />
          ) : (
            <Pause className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={2.5} />
          )}
        </RoundIconButton>
      </header>

      {paused && !done && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(6,24,70,0.55)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border-4 px-8 py-8 text-center"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(186,232,255,0.88) 100%)",
              borderColor: "#FFFFFF",
              boxShadow: "0 16px 32px rgba(0,40,90,0.25)",
            }}
          >
            <h2 className="text-3xl uppercase text-[#0B3D91]" style={{ fontFamily: '"Luckiest Guy", sans-serif' }}>
              Paused
            </h2>
            <div className="mt-6 flex justify-center">
              <GlossyButton variant="blue" size="lg" onClick={() => setPaused(false)}>
                Resume
              </GlossyButton>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collision}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          setNearId(null);
        }}
        onDragMove={(e) => {
          const overId = e.over ? String(e.over.id).replace(/^shadow-/, "") : null;
          setNearId(overId && overId === String(e.active.id) ? overId : null);
        }}
      >
        <div
          className={`relative z-10 mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 items-stretch gap-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1 sm:gap-4 ${PAGE_HEADER_PAD}`}
        >
          <InventoryPanel
            ocean={ocean}
            fish={uniqueFish}
            claimed={claimedSet}
            settled={settledSet}
            activeId={activeId}
            wobbleId={wobbleId}
            disabled={paused || done}
          />

          <section ref={playRef} className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
              <FrostedPill>{COPY.playArea}</FrostedPill>
            </div>

            <div className="absolute inset-0 h-full w-full">
              {dropTargets.map((character, i) => {
                const slot = slotsForCount(dropTargets.length)[i] ?? { left: 50, top: 50, size: 20 };
                return (
                  <ShadowTarget
                    key={character.id}
                    character={character}
                    left={slot.left}
                    top={slot.top}
                    size={slot.size}
                    settled={settledSet.has(character.id)}
                    glowing={glowIds.includes(character.id)}
                    hinted={nearId === character.id || (!!activeId && activeId === character.id)}
                    isDistractor={distractors.some((d) => d.id === character.id)}
                  />
                );
              })}
            </div>

            {swimmers.map((job) => (
              <SwimAcross
                key={job.id}
                job={job}
                onLand={() => {
                  setSwimmers((prev) => prev.filter((s) => s.id !== job.id));
                  setSettledIds((prev) => (prev.includes(job.id) ? prev : [...prev, job.id]));
                }}
              />
            ))}

            <AnimatePresence>{praiseOn && <PlayAreaPraise />}</AnimatePresence>
          </section>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeChar && !done ? (
            <div
              className="pointer-events-none flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-2xl border-[3px] p-1.5 sm:h-20 sm:w-20"
              style={{
                borderColor: "rgba(255,255,255,0.95)",
                background: "rgba(200,240,255,0.7)",
                boxShadow: "0 16px 28px rgba(0,20,60,0.35)",
                transform: "scale(1.12)",
              }}
            >
              <KnockoutImg src={activeChar.img} alt="" className="h-[86%] w-[86%] object-contain" draggable={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {done &&
        result &&
        renderWin({
          ...result,
          preview,
        })}
    </div>
  );
}

function InventoryPanel({
  ocean,
  fish,
  claimed,
  settled,
  activeId,
  wobbleId,
  disabled,
}: {
  ocean: Ocean;
  fish: Character[];
  claimed: Set<string>;
  settled: Set<string>;
  activeId: string | null;
  wobbleId: string | null;
  disabled: boolean;
}) {
  const rows = Math.max(2, Math.ceil(fish.length / 2));

  return (
    <aside
      className="flex w-[min(26vw,220px)] min-w-[168px] max-w-[232px] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border-[3px] px-2.5 py-2.5 sm:px-3 sm:py-3"
      style={{
        background:
          "linear-gradient(180deg, rgba(232,248,255,0.92) 0%, rgba(176,226,255,0.78) 55%, rgba(148,214,250,0.7) 100%)",
        borderColor: "rgba(255,255,255,0.95)",
        boxShadow:
          "0 14px 28px rgba(0,40,90,0.18), inset 0 2px 0 rgba(255,255,255,0.9), 0 0 0 2px rgba(80,180,230,0.25)",
      }}
    >
      <div className="mb-2 shrink-0 text-center">
        <img
          src={logoSeaFriends}
          alt={COPY.seaFriends}
          className="mx-auto h-7 w-auto max-w-[90%] object-contain sm:h-9"
          draggable={false}
        />
        <div
          className="mt-0.5 text-sm font-extrabold leading-tight text-[#0A3A7A] sm:text-base"
          style={{ fontFamily: '"Baloo 2", sans-serif' }}
        >
          Fish Inventory
        </div>
      </div>
      <div
        className="grid min-h-0 w-full flex-1 grid-cols-2 gap-2 overflow-hidden"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {fish.map((c) => (
          <div key={c.id} className="flex h-full min-h-0 min-w-0 items-center justify-center">
            <InventoryTile
              character={c}
              settled={settled.has(c.id)}
              hidden={activeId === c.id || (claimed.has(c.id) && !settled.has(c.id))}
              wobble={wobbleId === c.id}
              disabled={disabled || claimed.has(c.id)}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}

function InventoryTile({
  character,
  settled,
  hidden,
  wobble,
  disabled,
}: {
  character: Character;
  settled: boolean;
  hidden: boolean;
  wobble: boolean;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: character.id,
    disabled,
  });
  const fishSrc = useKnockoutSrc(character.img);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="relative flex aspect-square h-[min(100%,5.85rem)] w-auto max-w-full touch-none cursor-grab items-center justify-center overflow-hidden rounded-2xl border-2 p-1.5 active:cursor-grabbing"
      style={{
        borderColor: settled ? "rgba(80,210,120,0.9)" : "rgba(255,255,255,0.85)",
        background: settled
          ? "linear-gradient(160deg, rgba(200,255,220,0.7), rgba(140,230,180,0.45))"
          : "linear-gradient(160deg, rgba(255,255,255,0.65), rgba(180,230,255,0.4))",
        boxShadow: "0 6px 12px rgba(0,30,70,0.16), inset 0 1px 0 rgba(255,255,255,0.7)",
        opacity: hidden || isDragging ? 0.25 : 1,
      }}
      aria-label={`Drag ${character.name}`}
    >
      <motion.img
        src={fishSrc}
        alt={character.name}
        className="pointer-events-none h-[90%] w-[90%] select-none object-contain object-center"
        draggable={false}
        animate={wobble ? { x: [-6, 6, -4, 4, 0] } : { y: [0, -3, 0] }}
        transition={wobble ? { duration: 0.4 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <AnimatePresence>
        {settled && (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 560, damping: 14 }}
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white"
            style={{ background: "linear-gradient(180deg, #7CFF9A, #22C55E)", boxShadow: "0 2px 0 #15803D" }}
          >
            <Check className="h-3 w-3 text-white" strokeWidth={4} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

const PRAISE_COLORS = ["#2EC4F1", "#3DDC97", "#FF8C2A", "#FF6B9D", "#7C6BFF", "#FFD93D", "#5ED4FF", "#FF8C2A"];

function PlayAreaPraise() {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[18%] z-40 -translate-x-1/2 whitespace-nowrap"
      initial={{ scale: 0.28, y: 10, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.55, y: -12, opacity: 0 }}
      transition={{ type: "spring", stiffness: 520, damping: 16 }}
    >
      <span
        className="inline-flex leading-none"
        style={{ fontFamily: '"Luckiest Guy", "Baloo 2", sans-serif', paintOrder: "stroke fill" }}
      >
        {Array.from(COPY.goodJobPop).map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="text-[1.15rem] sm:text-[1.35rem]"
            style={{
              color: ch === " " ? "transparent" : PRAISE_COLORS[i % PRAISE_COLORS.length],
              WebkitTextStroke: ch === " " ? undefined : "3px #0B3D91",
              textShadow: ch === " " ? undefined : "0 0 0 2px #fff, 0 2px 0 #fff, 0 5px 10px rgba(0,20,60,0.3)",
              width: ch === " " ? "0.28em" : undefined,
            }}
          >
            {ch === " " ? "\u00a0" : ch}
          </span>
        ))}
      </span>
    </motion.div>
  );
}

function SwimAcross({ job, onLand }: { job: SwimJob; onLand: () => void }) {
  const fishSrc = useKnockoutSrc(job.src);
  const landed = useRef(false);

  return (
    <motion.div
      className="pointer-events-none absolute z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 sm:h-24 sm:w-24"
      initial={{ left: job.from.x, top: job.from.y }}
      animate={{ left: job.to.x, top: job.to.y }}
      transition={{ duration: 1.25, ease: [0.22, 0.62, 0.28, 1] }}
      onAnimationComplete={() => {
        if (landed.current) return;
        landed.current = true;
        onLand();
      }}
    >
      <motion.img
        src={fishSrc}
        alt=""
        className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,20,50,0.35)]"
        animate={{ y: [0, -9, 5, -6, 0], rotate: [0, -10, 8, -6, 0] }}
        transition={{ duration: 0.38, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
          style={{
            background: ["#FFD93D", "#FFFFFF", "#5ED4FF", "#FF8C2A", "#3DDC97"][i],
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
          }}
          animate={{
            x: [8, 28 + i * 10],
            y: [0, (i % 2 === 0 ? -12 : 12) - i * 2],
            scale: [0.9, 0],
            opacity: [0.95, 0],
          }}
          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

function ShadowTarget({
  character,
  left,
  top,
  size,
  settled,
  glowing,
  hinted,
  isDistractor,
}: {
  character: Character;
  left: number;
  top: number;
  size: number;
  settled: boolean;
  glowing: boolean;
  hinted: boolean;
  isDistractor: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `shadow-${character.id}`,
    disabled: settled,
  });
  const glow = hinted || isOver || glowing;
  const fishSrc = useKnockoutSrc(character.img);

  return (
    <div
      ref={setNodeRef}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}%`,
        maxWidth: 168,
        minWidth: 88,
      }}
    >
      <div className="relative aspect-square w-full">
        <motion.div
          animate={{ scale: glowing ? 1.12 : glow ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 16 }}
          className="relative flex h-full w-full items-center justify-center"
        >
          {!settled && (
            <motion.span
              className="pointer-events-none absolute inset-[4%] rounded-full"
              style={{
                boxShadow: glowing
                  ? "0 0 0 5px #fff, 0 0 28px 8px rgba(255,230,120,0.95), 0 0 18px rgba(94,212,255,0.8)"
                  : glow
                    ? "0 0 0 3px rgba(255,255,255,0.95), 0 0 20px rgba(180,230,255,0.85)"
                    : "0 0 0 2px rgba(160,210,255,0.45), 0 0 12px rgba(80,160,220,0.3)",
              }}
              animate={{ opacity: glowing ? [0.7, 1, 0.85] : [0.55, 1, 0.55] }}
              transition={{ duration: glowing ? 0.18 : glow ? 0.7 : 2.1, repeat: glowing ? 0 : Infinity, ease: "easeInOut" }}
            />
          )}
          <motion.img
            src={fishSrc}
            alt=""
            className="relative z-[1] h-[82%] w-[82%] object-contain object-center"
            initial={false}
            animate={
              settled
                ? { scale: 1, opacity: 1, filter: "none" }
                : { scale: 1, opacity: 1, filter: "brightness(0) saturate(0) opacity(0.72)" }
            }
            transition={{ duration: 0.12 }}
            draggable={false}
          />
          {isDistractor && !settled ? null : null}
        </motion.div>
      </div>
    </div>
  );
}

function PlaySceneBackground({ ocean: _ocean }: { ocean: Ocean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0" style={{ backgroundColor: "#1E8BC8" }} />
      <img src={sceneReef} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(28,148,210,0.42) 0%, rgba(32,158,216,0.22) 40%, rgba(20,130,190,0.06) 62%, transparent 74%)",
        }}
      />
      {[16, 38, 58, 78].map((left, i) => (
        <motion.div
          key={left}
          className="absolute top-0 h-[72%] origin-top"
          style={{
            left: `${left}%`,
            width: i % 2 === 0 ? 58 : 34,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(200,235,255,0.08) 42%, transparent 88%)",
            transform: `skewX(${i % 2 === 0 ? -12 : -18}deg)`,
            filter: "blur(1.4px)",
          }}
          animate={{ opacity: [0.22, 0.5, 0.26] }}
          transition={{ duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${6 + ((i * 7) % 88)}%`,
            width: 6 + (i % 5) * 4,
            height: 6 + (i % 5) * 4,
            animationDuration: `${8 + (i % 5) * 2}s`,
            animationDelay: `${i * 0.45}s`,
          }}
        />
      ))}
    </div>
  );
}
