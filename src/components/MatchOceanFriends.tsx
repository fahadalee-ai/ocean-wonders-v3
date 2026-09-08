import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Pause, Play, Waves } from "lucide-react";
import type { Character, Level, Ocean } from "@/data/oceans";
import { BackButton, RoundIconButton, PAGE_HEADER_PAD } from "@/components/BackBubble";
import { GlossyButton } from "@/components/GlossyButton";
import {
  creatureIdleAnimate,
  creatureMotionKind,
} from "@/lib/creatureMotion";
import { sparkleAt } from "@/lib/confetti";
import { saveLevelProgress } from "@/lib/progress";
import char2 from "@/assets/Characters_2.png";
import char4 from "@/assets/Characters_4.png";
import char6 from "@/assets/Characters_6.png";

/** Natural scatter slots — larger center creature, smaller around (reference-style). */
const SLOT_LAYOUTS: Record<number, { left: number; top: number; size: number }[]> = {
  2: [
    { left: 42, top: 42, size: 30 },
    { left: 68, top: 58, size: 20 },
  ],
  3: [
    { left: 48, top: 40, size: 28 },
    { left: 22, top: 52, size: 18 },
    { left: 72, top: 55, size: 16 },
  ],
  4: [
    { left: 46, top: 38, size: 28 },
    { left: 22, top: 48, size: 18 },
    { left: 72, top: 42, size: 20 },
    { left: 58, top: 68, size: 15 },
  ],
  5: [
    { left: 48, top: 36, size: 26 },
    { left: 20, top: 44, size: 17 },
    { left: 74, top: 40, size: 18 },
    { left: 34, top: 66, size: 15 },
    { left: 64, top: 68, size: 14 },
  ],
  6: [
    { left: 48, top: 34, size: 24 },
    { left: 18, top: 40, size: 16 },
    { left: 76, top: 38, size: 18 },
    { left: 30, top: 62, size: 14 },
    { left: 60, top: 58, size: 15 },
    { left: 48, top: 74, size: 13 },
  ],
  7: [
    { left: 46, top: 32, size: 22 },
    { left: 16, top: 38, size: 15 },
    { left: 78, top: 34, size: 17 },
    { left: 28, top: 56, size: 14 },
    { left: 64, top: 54, size: 14 },
    { left: 20, top: 72, size: 12 },
    { left: 52, top: 74, size: 13 },
  ],
  8: [
    { left: 46, top: 30, size: 20 },
    { left: 14, top: 36, size: 14 },
    { left: 78, top: 32, size: 16 },
    { left: 30, top: 50, size: 13 },
    { left: 62, top: 48, size: 13 },
    { left: 18, top: 68, size: 12 },
    { left: 70, top: 66, size: 12 },
    { left: 46, top: 76, size: 12 },
  ],
};

function slotsForCount(n: number) {
  const key = Math.min(8, Math.max(2, n));
  return (SLOT_LAYOUTS[key] ?? SLOT_LAYOUTS[6]!).slice(0, n);
}

const SCHOOL_IMGS = [char2, char4, char6];

type Props = {
  ocean: Ocean;
  level: Level;
  fish: Character[];
  onDone: () => void;
  onReplay: () => void;
  nextTarget?: { oceanId: string; levelId: string };
  renderWin: (args: {
    stars: number;
    score: number;
    elapsedSec: number;
    accuracy: number;
    preview: Character;
  }) => React.ReactNode;
};

export function MatchOceanFriendsLevel({
  ocean,
  level,
  fish,
  onDone,
  onReplay: _onReplay,
  renderWin,
}: Props) {
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

  const total = uniqueFish.length;
  const placements = useMemo(() => {
    const slots = slotsForCount(total);
    return uniqueFish.map((c, i) => ({
      character: c,
      ...slots[i % slots.length]!,
    }));
  }, [uniqueFish, total]);

  const [trayOrder] = useState(() => [...uniqueFish].sort(() => Math.random() - 0.5));
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [glidingId, setGlidingId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<{
    stars: number;
    score: number;
    elapsedSec: number;
    accuracy: number;
  } | null>(null);
  const [wobbleId, setWobbleId] = useState<string | null>(null);

  const startRef = useRef(Date.now());
  const mistakesRef = useRef(0);
  const attemptsRef = useRef(0);
  const completingRef = useRef(false);

  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds]);
  const matchedCount = matchedIds.length;
  const remaining = useMemo(
    () => trayOrder.filter((c) => !matchedSet.has(c.id) && glidingId !== c.id),
    [trayOrder, matchedSet, glidingId],
  );
  const trayFish = remaining[0] ?? null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 6 } }),
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
    const stars = mistakes === 0 ? 3 : mistakes <= Math.ceil(total / 2) ? 2 : 1;
    const score = Math.max(50, total * 50 - mistakes * 10);
    const elapsedSec = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000));
    const accuracy = Math.min(100, Math.max(0, Math.round((total / attempts) * 100)));

    try {
      saveLevelProgress(level.number, { stars, score, completed: true });
    } catch {
      /* never block Level Complete */
    }

    setResult({ stars, score, elapsedSec, accuracy });
    setDone(true);
  }

  function onDragStart(e: DragStartEvent) {
    if (paused || done) return;
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const dragId = String(e.active.id);
    setActiveId(null);
    if (paused || done || matchedSet.has(dragId) || glidingId) return;

    const overId = e.over ? String(e.over.id).replace(/^friend-shadow-/, "") : null;
    attemptsRef.current += 1;

    if (overId && overId === dragId) {
      setGlidingId(dragId);
      const overRect = e.over?.rect;
      if (overRect) {
        sparkleAt(
          (overRect.left + overRect.width / 2) / window.innerWidth,
          (overRect.top + overRect.height / 2) / window.innerHeight,
        );
      }
      window.setTimeout(() => {
        setMatchedIds((prev) => (prev.includes(dragId) ? prev : [...prev, dragId]));
        setGlidingId(null);
      }, 420);
    } else if (e.over) {
      mistakesRef.current += 1;
      setWobbleId(dragId);
      window.setTimeout(() => setWobbleId(null), 480);
    }
  }

  useEffect(() => {
    if (matchedCount < total || total === 0 || done || completingRef.current) return;
    const t = window.setTimeout(() => finishLevel(), 280);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCount, total, done]);

  const activeChar = activeId ? uniqueFish.find((c) => c.id === activeId) : null;
  const preview = uniqueFish[0] ?? ocean.character;

  return (
    <div className="relative z-10 flex h-dvh flex-col overflow-hidden">
      <FriendsSceneBackground />

      {/* Minimal chrome — reference-style */}
      <header
        className={`relative z-[80] flex shrink-0 items-center gap-2 pt-[max(0.5rem,env(safe-area-inset-top))] ${PAGE_HEADER_PAD}`}
      >
        <BackButton
          onClick={() => {
            completingRef.current = true;
            onDone();
          }}
          label="Back"
        />
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
          style={{
            background: "rgba(255,255,255,0.18)",
            borderColor: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Waves className="h-3.5 w-3.5 text-white" />
          <span className="font-display text-xs font-bold text-white sm:text-sm">
            {matchedCount}/{total}
          </span>
        </div>
        <div className="flex-1" />
        <RoundIconButton
          variant="blue"
          label={paused ? "Resume" : "Pause"}
          onClick={() => {
            if (done) return;
            setActiveId(null);
            setPaused((p) => !p);
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
          className="fixed inset-0 z-[70] flex items-center justify-center px-4 backdrop-blur-[2px]"
          style={{ backgroundColor: "rgba(6,24,70,0.55)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border-2 px-8 py-8 text-center"
            style={{
              background: "linear-gradient(160deg, rgba(8,40,110,0.96) 0%, rgba(20,70,150,0.94) 100%)",
              borderColor: "rgba(94,212,255,0.6)",
            }}
          >
            <h2 className="font-display text-3xl font-bold uppercase text-white">Paused</h2>
            <div className="mt-6 flex justify-center">
              <GlossyButton variant="blue" size="lg" onClick={() => setPaused(false)}>
                Resume
              </GlossyButton>
            </div>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AmbientDecor />

          {placements.map((p) => (
            <FriendShadow
              key={p.character.id}
              character={p.character}
              left={p.left}
              top={p.top}
              sizeVw={p.size}
              matched={matchedSet.has(p.character.id)}
              gliding={glidingId === p.character.id}
              dragActive={!!activeId}
              speed={level.difficulty.speed}
            />
          ))}

          {/* Circular matching bubble — top-right (reference) */}
          <div className="absolute right-3 top-1 z-30 flex flex-col items-center gap-1.5 sm:right-5 sm:top-2">
            <AnimatePresence mode="wait">
              {trayFish && !done ? (
                <motion.div
                  key={trayFish.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                >
                  <CircleTrayBubble
                    character={trayFish}
                    disabled={done}
                    hidden={activeId === trayFish.id}
                    wobble={wobbleId === trayFish.id}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
            {remaining.length > 1 && (
              <div className="flex gap-1">
                {remaining.slice(0, 6).map((c, i) => (
                  <span
                    key={c.id}
                    className="h-1.5 rounded-full"
                    style={{
                      width: i === 0 ? 14 : 6,
                      background: i === 0 ? "#FFE566" : "rgba(255,255,255,0.45)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeChar && !done ? (
              <div
                className="pointer-events-none flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-[3px] p-2 shadow-xl sm:h-20 sm:w-20"
                style={{
                  borderColor: "rgba(255,255,255,0.85)",
                  background: "rgba(180,230,255,0.55)",
                  transform: "scale(1.08)",
                }}
              >
                <img src={activeChar.img} alt="" className="max-h-full max-w-full object-contain" draggable={false} />
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>

      {done &&
        result &&
        renderWin({
          stars: result.stars,
          score: result.score,
          elapsedSec: result.elapsedSec,
          accuracy: result.accuracy,
          preview,
        })}
    </div>
  );
}

function FriendsSceneBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ contain: "paint" }} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #3BA4D8 0%, #1E7BB8 32%, #1568A0 58%, #0E4F82 82%, #0A3A66 100%)",
        }}
      />
      {[10, 22, 36, 50, 64, 78, 90].map((left, i) => (
        <motion.div
          key={left}
          className="absolute top-0 h-[85%] origin-top"
          style={{
            left: `${left}%`,
            width: i % 2 === 0 ? 56 : 34,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(200,235,255,0.1) 40%, transparent 85%)",
            transform: `skewX(${i % 2 === 0 ? -10 : -16}deg)`,
            filter: "blur(1.5px)",
          }}
          animate={{ opacity: [0.3, 0.65, 0.35] }}
          transition={{ duration: 5.5 + i * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        />
      ))}
      <div
        className="absolute inset-x-0 bottom-0 h-[32%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8,40,70,0.4) 45%, rgba(4,28,50,0.7) 100%)",
        }}
      />
    </div>
  );
}

function AmbientDecor() {
  /** Tight school of tiny fish — bottom-left like the reference */
  const school = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        img: SCHOOL_IMGS[i % SCHOOL_IMGS.length]!,
        x: 4 + (i % 5) * 3.2,
        y: 78 + Math.floor(i / 5) * 5 + (i % 3),
        size: 14 + (i % 3) * 3,
        delay: i * 0.12,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" style={{ contain: "paint" }} aria-hidden>
      {/* Soft reef / rock frames */}
      <svg className="absolute bottom-0 left-0 h-[38%] w-[28%] opacity-35" viewBox="0 0 200 160" preserveAspectRatio="none">
        <path d="M0 160 L0 90 Q40 70 55 100 Q80 50 110 95 Q140 60 160 110 L180 160 Z" fill="rgba(4,30,55,0.9)" />
      </svg>
      <svg className="absolute bottom-0 right-0 h-[34%] w-[24%] opacity-30" viewBox="0 0 180 150" preserveAspectRatio="none">
        <path d="M180 150 L180 85 Q150 55 130 95 Q100 45 70 100 Q40 70 20 120 L0 150 Z" fill="rgba(4,30,55,0.85)" />
      </svg>

      <motion.div
        className="absolute left-0 top-0 h-full w-full"
        animate={{ x: [0, -18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        {school.map((f) => (
          <motion.img
            key={f.id}
            src={f.img}
            alt=""
            className="absolute object-contain"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: f.size,
              height: f.size,
              opacity: 0.55,
              filter: "saturate(0.7) brightness(1.05)",
            }}
            animate={{
              x: [0, -10, 6, 0],
              y: [0, -3, 2, 0],
              scaleX: -1,
            }}
            transition={{
              duration: 3.2 + f.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: f.delay,
            }}
            draggable={false}
          />
        ))}
      </motion.div>
    </div>
  );
}

function FriendShadow({
  character,
  left,
  top,
  sizeVw,
  matched,
  gliding,
  dragActive,
  speed,
}: {
  character: Character;
  left: number;
  top: number;
  sizeVw: number;
  matched: boolean;
  gliding: boolean;
  dragActive: boolean;
  speed: number;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `friend-shadow-${character.id}`,
    disabled: matched || gliding,
  });
  const kind = creatureMotionKind(character.id);
  const showColor = matched || gliding;

  return (
    <div
      ref={setNodeRef}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${sizeVw}vw`,
        maxWidth: 170,
        minWidth: 70,
      }}
    >
    <motion.div
      animate={matched ? creatureIdleAnimate(kind, speed) : { scale: isOver ? 1.07 : 1 }}
    >
      <div className="relative flex aspect-square items-center justify-center">
        {!matched && (
          <motion.span
            className="pointer-events-none absolute inset-[-4%] rounded-full"
            style={{
              boxShadow: isOver || dragActive
                ? "0 0 26px rgba(140,210,255,0.75)"
                : "0 0 16px rgba(120,190,240,0.4)",
            }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.img
            key={showColor ? "color" : "silhouette"}
            src={showColor ? character.img : character.outline}
            alt=""
            className="relative z-[1] max-h-full max-w-full object-contain"
            initial={gliding ? { scale: 0.75, opacity: 0.4 } : false}
            animate={
              showColor
                ? { scale: 1, opacity: 1, filter: "none" }
                : {
                    // Solid flat gray silhouette (reference look)
                    opacity: 0.92,
                    filter: "brightness(0) saturate(0) opacity(0.48)",
                  }
            }
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            draggable={false}
          />
        </AnimatePresence>
      </div>
    </motion.div>
    </div>
  );
}

/** One-at-a-time circular tray bubble (reference). */
function CircleTrayBubble({
  character,
  disabled,
  hidden,
  wobble,
}: {
  character: Character;
  disabled: boolean;
  hidden: boolean;
  wobble: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: character.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex h-[4.75rem] w-[4.75rem] touch-none cursor-grab items-center justify-center rounded-full border-[3px] p-2 active:cursor-grabbing sm:h-[5.5rem] sm:w-[5.5rem] sm:p-2.5"
      style={{
        borderColor: "rgba(255,255,255,0.9)",
        background: "linear-gradient(160deg, rgba(210,240,255,0.72) 0%, rgba(140,210,245,0.55) 100%)",
        boxShadow:
          "0 10px 24px rgba(0,30,70,0.3), inset 0 2px 0 rgba(255,255,255,0.55), 0 0 20px rgba(120,210,255,0.35)",
        opacity: hidden || isDragging ? 0.2 : 1,
      }}
      aria-label={`Drag ${character.name}`}
    >
      <motion.div
        animate={
          wobble
            ? { x: [-7, 7, -5, 5, 0], rotate: [0, -5, 5, 0] }
            : { y: [0, -5, 0], x: 0, rotate: 0 }
        }
        transition={
          wobble
            ? { duration: 0.45 }
            : { y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }
        }
        className="flex h-full w-full items-center justify-center"
      >
        <img
          src={character.img}
          alt={character.name}
          className="max-h-full max-w-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
