import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Heart, Lock, Star, Trophy, Zap } from "lucide-react";
import { getOcean, getLevelFish } from "@/data/oceans";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { BackButton, glassHeaderPanelStyle, PAGE_HEADER_PAD } from "@/components/BackBubble";
import { GlossyButton } from "@/components/GlossyButton";
import {
  getLevelProgress,
  getOceanStats,
  isLevelUnlocked,
} from "@/lib/progress";
import { celebrate } from "@/lib/confetti";

export const Route = createFileRoute("/ocean/$oceanId/")({
  loader: ({ params }) => {
    const ocean = getOcean(params.oceanId);
    if (!ocean) throw notFound();
    return { ocean };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.ocean?.name ?? "Ocean";
    return {
      meta: [
        { title: `${name} — Levels — Ocean Wonders` },
        {
          name: "description",
          content: `Choose a fish-matching level in the ${name}!`,
        },
        { property: "og:title", content: `${name} Levels` },
        { property: "og:description", content: `Dive into the ${name} and clear every level.` },
      ],
    };
  },
  component: LevelSelectPage,
  notFoundComponent: OceanNotFound,
});

function OceanNotFound() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 text-center" style={{ backgroundColor: "#0A2F7A" }}>
      <AuthOceanBackground fishCount={4} />
      <div className="relative z-10">
        <h1 className="font-display text-4xl font-bold text-white" style={{ textShadow: "0 3px 0 rgba(0,40,90,0.35)" }}>
          That ocean isn't on the map!
        </h1>
        <div className="mt-6 flex justify-center">
          <GlossyButton variant="orange" size="md" to="/globe">
            Back to oceans
          </GlossyButton>
        </div>
      </div>
    </main>
  );
}

function LevelSelectPage() {
  const { ocean } = Route.useLoaderData();
  const [stats, setStats] = useState(() => ({
    completed: 0,
    total: ocean.levels.length,
    stars: 0,
    maxStars: ocean.levels.length * 3,
    bestScore: 0,
    percent: 0,
    unlocked: true,
  }));
  const [levels, setLevels] = useState(
    ocean.levels.map((l) => ({
      ...l,
      unlocked: l.number === 1,
      progress: { stars: 0, highScore: 0, completed: false },
      previewFish: getLevelFish(l),
    })),
  );
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const s = getOceanStats(ocean);
    setStats(s);
    setLevels(
      ocean.levels.map((l) => ({
        ...l,
        unlocked: isLevelUnlocked(l.number),
        progress: getLevelProgress(l.number),
        previewFish: getLevelFish(l),
      })),
    );
    if (s.completed === s.total && s.total > 0) {
      const key = `ow:celebrated:${ocean.id}`;
      if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        setShowCelebration(true);
        celebrate();
      }
    }
  }, [ocean]);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#1E8BC8" }}>
      <AuthOceanBackground fishCount={6} />

      <header className={`relative z-10 mx-auto flex w-full max-w-5xl shrink-0 items-center gap-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-4 sm:pb-2 sm:pt-3 ${PAGE_HEADER_PAD}`}>
        <BackButton to="/globe" label="Back to oceans" />

        <div
          className="min-w-0 flex-1 rounded-2xl border-2 px-3.5 py-2.5 sm:rounded-3xl sm:px-4 sm:py-3"
          style={glassHeaderPanelStyle}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="hidden h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 sm:flex"
              style={{
                borderColor: "#5ED4FF",
                background: "linear-gradient(160deg, rgba(255,255,255,0.2), rgba(10,50,120,0.4))",
              }}
            >
              <img src={ocean.badge} alt="" className="h-full w-full object-cover" draggable={false} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1
                  className="min-w-0 truncate text-xl font-extrabold uppercase leading-none text-[#0B3D91] sm:text-2xl"
                  style={{ fontFamily: '"Luckiest Guy", sans-serif' }}
                >
                  {ocean.name}
                </h1>
                <span
                  className="shrink-0 rounded-full border border-white/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy sm:text-[11px]"
                  style={{ background: "#FFB347" }}
                >
                  {ocean.difficultyLabel}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-extrabold text-[#0B3D91]/80 sm:text-sm">
                <span style={{ color: "#E67A00" }}>{stats.stars} stars</span>
                <span className="mx-1.5 text-[#0B3D91]/30">·</span>
                <span>
                  {stats.completed}/{stats.total} levels
                </span>
              </p>
            </div>
          </div>
          <p className="mt-1.5 line-clamp-1 text-[11px] font-bold leading-snug text-[#0B3D91]/70 sm:text-xs">
            {ocean.tagline}
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full border"
            style={{ background: "rgba(6,24,70,0.55)", borderColor: "rgba(94,212,255,0.35)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${stats.percent}%`,
                background: "linear-gradient(90deg, #FFB347, #FFE566)",
              }}
            />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-5xl flex-1 grid-cols-3 content-start gap-2 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:grid-cols-3 sm:gap-3 sm:px-6 lg:grid-cols-6">
        {levels.map((level) => {
          const locked = !level.unlocked;
          const isBonus = level.isSpeedChallenge || level.isFriendsMatch;
          const card = (
            <div
              className="relative overflow-hidden rounded-lg border-2 p-2.5 text-center sm:rounded-xl sm:p-3"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(176,226,255,0.78) 100%)",
                borderColor: "#FFFFFF",
                boxShadow:
                  "0 8px 18px rgba(0,30,70,0.18), inset 0 2px 0 rgba(255,255,255,0.85)",
                filter: locked ? "grayscale(0.4)" : undefined,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-2"
                style={{
                  background: level.isFriendsMatch
                    ? "linear-gradient(90deg, #5ED4FF 0%, #FFE566 50%, #FFB347 100%)"
                    : level.isSpeedChallenge
                      ? "linear-gradient(90deg, #F06A12 0%, #FFB347 45%, #FFE566 100%)"
                      : `linear-gradient(90deg, ${ocean.accent} 0%, #5ED4FF 50%, #FFE566 100%)`,
                }}
              />

              <div className="flex items-start justify-between gap-1">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white font-display text-sm font-black text-white sm:h-9 sm:w-9"
                  style={{
                    background: level.isFriendsMatch
                      ? "linear-gradient(180deg, #FFE566 0%, #FFB347 100%)"
                      : level.isSpeedChallenge
                        ? "linear-gradient(180deg, #FFB347 0%, #F06A12 100%)"
                        : "linear-gradient(180deg, #5ED4FF 0%, #1A8FD4 100%)",
                    boxShadow: isBonus ? "0 3px 0 #C44A10" : "0 3px 0 #0E5A9A",
                    color: level.isFriendsMatch ? "#0B3D91" : undefined,
                  }}
                >
                  {level.isFriendsMatch ? (
                    <Heart className="h-4 w-4" fill="currentColor" />
                  ) : level.isSpeedChallenge ? (
                    <Zap className="h-4 w-4" />
                  ) : (
                    level.localNumber
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className="h-3.5 w-3.5"
                      style={{
                        color: s <= level.progress.stars ? "#FFE566" : "rgba(94,212,255,0.35)",
                        fill: s <= level.progress.stars ? "#FFE566" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>

              <h3
                className="mt-1.5 truncate text-sm font-extrabold uppercase text-[#0B3D91] sm:text-base"
                style={{ fontFamily: '"Baloo 2", sans-serif' }}
              >
                {level.isFriendsMatch ? "Ocean Friends" : level.title}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wide sm:text-[11px]" style={{ color: "#5ED4FF" }}>
                {level.fishIds.length} fish
                {level.isSpeedChallenge ? " · timed" : level.isFriendsMatch ? " · bonus" : ""}
              </p>

              <div
                className="mt-1.5 flex h-12 items-end justify-center rounded-md border sm:h-14 sm:rounded-lg"
                style={{
                  background: "rgba(4,18,55,0.55)",
                  borderColor: "rgba(94,212,255,0.4)",
                }}
              >
                {level.previewFish.slice(0, 3).map((f, fi) => (
                  <img
                    key={f.id}
                    src={f.img}
                    alt=""
                    className="object-contain drop-shadow-md"
                    style={{
                      width: 40 - fi * 2,
                      height: 40 - fi * 2,
                      marginLeft: fi === 0 ? 0 : -12,
                      zIndex: 3 - fi,
                    }}
                    draggable={false}
                  />
                ))}
                {level.previewFish.length > 3 && (
                  <span
                    className="mb-1 ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: "rgba(6,24,70,0.65)" }}
                  >
                    +{level.previewFish.length - 3}
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1 text-[10px] font-bold text-white">
                {level.progress.completed ? (
                  <span
                    className="inline-flex items-center gap-0.5 rounded-full border border-white/40 px-1.5 py-0.5"
                    style={{ background: "rgba(46,196,241,0.35)" }}
                  >
                    <CheckCircle2 className="h-3 w-3" style={{ color: "#5ED4FF" }} /> Done
                  </span>
                ) : locked ? (
                  <span
                    className="inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5"
                    style={{ background: "rgba(6,24,70,0.55)", borderColor: "rgba(94,212,255,0.35)" }}
                  >
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                ) : (
                  <span
                    className="rounded-full border border-white/50 px-1.5 py-0.5"
                    style={{ background: "linear-gradient(180deg, #FFB347, #F06A12)" }}
                  >
                    Ready
                  </span>
                )}
                <span
                  className="rounded-full border px-1.5 py-0.5"
                  style={{ background: "rgba(6,24,70,0.55)", borderColor: "rgba(94,212,255,0.35)" }}
                >
                  Best {level.progress.highScore}
                </span>
              </div>

              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#061846]/40 backdrop-blur-[1px]">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white"
                    style={{
                      background: "linear-gradient(180deg, #FFB347 0%, #F06A12 100%)",
                      boxShadow: "0 4px 0 #C44A10",
                    }}
                  >
                    <Lock className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          );

          if (locked) return <div key={level.id}>{card}</div>;

          return (
            <Link
              key={level.id}
              to="/ocean/$oceanId/level/$levelId"
              params={{ oceanId: ocean.id, levelId: level.id }}
              className="block transition-transform active:scale-[0.98]"
            >
              {card}
            </Link>
          );
        })}
      </div>

      {showCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-3 py-2 sm:px-5"
          style={{ backgroundColor: "rgba(6,24,70,0.65)" }}
          onClick={() => setShowCelebration(false)}
        >
          <div
            className="relative z-10 flex max-h-[min(94dvh,420px)] w-full max-w-xl items-center gap-4 overflow-y-auto rounded-2xl border-2 p-4 text-left sm:rounded-3xl sm:p-5"
            style={{
              background: "linear-gradient(160deg, rgba(8,40,110,0.95) 0%, rgba(20,70,150,0.92) 100%)",
              borderColor: "rgba(94,212,255,0.6)",
              boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24">
              <img src={ocean.character.img} alt="" className="max-h-full max-w-full object-contain drop-shadow-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-7 w-7 shrink-0" style={{ color: "#FFE566" }} />
                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Ocean Complete!</h2>
              </div>
              <p className="mt-1 text-sm font-semibold text-white/85 sm:text-base">
                You cleared every level in {ocean.name}!
              </p>
              <div className="mt-3">
                <GlossyButton variant="orange" size="md" onClick={() => setShowCelebration(false)}>
                  Awesome!
                </GlossyButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
