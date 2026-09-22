import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Heart, Lock, Star, Trophy, Zap } from "lucide-react";
import { getOcean, getLevelFish } from "@/data/oceans";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { BackButton, glassHeaderPanelStyle, PAGE_HEADER_PAD } from "@/components/BackBubble";
import { GlossyButton } from "@/components/GlossyButton";
import { KnockoutImg } from "@/components/KnockoutImg";
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

      <header className={`relative z-10 mx-auto flex w-full max-w-5xl shrink-0 items-center gap-3 pb-2 pt-[max(1.25rem,calc(env(safe-area-inset-top)+0.3rem))] sm:gap-4 sm:pb-2 ${PAGE_HEADER_PAD}`}>
        <BackButton size="sm" to="/globe" label="Back to oceans" />

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
              <p className="mt-1 truncate text-xs font-extrabold text-[#0B3D91] sm:text-sm">
                <span style={{ color: "#C44A10" }}>{stats.stars} stars</span>
                <span className="mx-1.5 text-[#0B3D91]/40">·</span>
                <span>
                  {stats.completed}/{stats.total} levels
                </span>
              </p>
            </div>
          </div>
          <p className="mt-1.5 line-clamp-1 text-xs font-extrabold leading-snug text-[#0B3D91] sm:text-sm">
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

      <div className={`relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-stretch gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] ${PAGE_HEADER_PAD}`}>
        <aside className="relative min-h-0 w-[min(36vw,400px)] min-w-[150px] shrink-0 overflow-hidden rounded-[1.4rem] border-4 border-white"
          style={{ boxShadow: "0 14px 28px rgba(0,30,70,0.22)" }}
        >
          <img
            src={ocean.map}
            alt={`${ocean.name} cartoon map`}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061846]/70 to-transparent px-3 pb-3 pt-10"
          >
            <span
              className="inline-flex rounded-full border-2 border-white px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white"
              style={{
                fontFamily: '"Baloo 2", sans-serif',
                background: "linear-gradient(180deg, #1A5FB4 0%, #0B3D91 100%)",
                boxShadow: "0 3px 0 #062A66",
              }}
            >
              {ocean.name}
            </span>
          </div>
        </aside>

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-3 grid-rows-2 gap-2 overflow-hidden sm:gap-2.5">
        {levels.map((level) => {
          const locked = !level.unlocked;
          const isBonus = level.isSpeedChallenge || level.isFriendsMatch;
          const status = level.progress.completed ? "done" : locked ? "locked" : "ready";
          const card = (
            <div
              className="flex h-full min-h-0 flex-col rounded-2xl border-[3px] px-2 py-1.5 text-center sm:px-2.5 sm:py-2"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #F3FBFF 100%)",
                borderColor: "#FFFFFF",
                boxShadow: "0 8px 16px rgba(0,30,70,0.18)",
                opacity: locked ? 0.88 : 1,
              }}
            >
              <div className="flex shrink-0 items-center justify-between gap-1">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-sm font-black text-white sm:h-8 sm:w-8 sm:text-base"
                  style={{
                    background: isBonus
                      ? "linear-gradient(180deg, #FFB347 0%, #F06A12 100%)"
                      : "linear-gradient(180deg, #3EC6F5 0%, #0E6FBE 100%)",
                    boxShadow: "0 2px 0 #0E5A9A",
                    fontFamily: '"Baloo 2", sans-serif',
                  }}
                >
                  {level.isFriendsMatch ? (
                    <Heart className="h-3.5 w-3.5" fill="currentColor" />
                  ) : level.isSpeedChallenge ? (
                    <Zap className="h-3.5 w-3.5" />
                  ) : (
                    level.localNumber
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className="h-3.5 w-3.5"
                      strokeWidth={2.4}
                      style={{
                        color: s <= level.progress.stars ? "#E6A800" : "#8AA4C2",
                        fill: s <= level.progress.stars ? "#FFD24A" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </div>

              <p
                className="mt-1 shrink-0 text-[13px] font-extrabold leading-none text-[#0B3D91] sm:text-sm"
                style={{ fontFamily: '"Baloo 2", sans-serif' }}
              >
                {level.fishIds.length} Fish
              </p>

              <div
                className="relative mt-1 flex min-h-0 flex-1 items-center justify-center rounded-xl border-2"
                style={{
                  background: "linear-gradient(180deg, #E8F7FF 0%, #D4EEFF 100%)",
                  borderColor: "#C5E6FA",
                }}
              >
                {level.previewFish.slice(0, 2).map((f, fi) => (
                  <KnockoutImg
                    key={f.id}
                    src={f.img}
                    alt=""
                    className="h-[72%] max-h-10 w-auto object-contain"
                    style={{ marginLeft: fi === 0 ? 0 : -8, zIndex: 2 - fi }}
                    draggable={false}
                  />
                ))}
                {level.previewFish.length > 2 && (
                  <span
                    className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-[#0B3D91]"
                    style={{ fontFamily: '"Baloo 2", sans-serif' }}
                  >
                    +{level.previewFish.length - 2}
                  </span>
                )}
                {locked && (
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-xl"
                    style={{ background: "rgba(11,61,145,0.28)" }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
                      style={{
                        background: "linear-gradient(180deg, #FFB347 0%, #F06A12 100%)",
                        boxShadow: "0 2px 0 #C44A10",
                      }}
                    >
                      <Lock className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                  </span>
                )}
              </div>

              <div
                className="mt-1.5 flex h-7 w-full shrink-0 items-center justify-center rounded-full border-2 border-white text-xs font-extrabold text-white sm:h-8 sm:text-sm"
                style={{
                  fontFamily: '"Baloo 2", sans-serif',
                  background:
                    status === "done"
                      ? "linear-gradient(180deg, #4ADE80 0%, #16A34A 100%)"
                      : status === "locked"
                        ? "linear-gradient(180deg, #94A3B8 0%, #475569 100%)"
                        : "linear-gradient(180deg, #FFB347 0%, #F06A12 100%)",
                  boxShadow: status === "done" ? "0 2px 0 #15803D" : status === "locked" ? "0 2px 0 #334155" : "0 2px 0 #C44A10",
                }}
              >
                {status === "done" ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Done
                  </span>
                ) : status === "locked" ? (
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" /> Locked
                  </span>
                ) : (
                  "Play"
                )}
              </div>
              <p
                className="mt-0.5 shrink-0 text-[11px] font-extrabold leading-none text-[#0B3D91] sm:text-xs"
                style={{ fontFamily: '"Baloo 2", sans-serif' }}
              >
                Best {level.progress.highScore}
              </p>
            </div>
          );

          if (locked) return <div key={level.id} className="min-h-0">{card}</div>;

          return (
            <Link
              key={level.id}
              to="/ocean/$oceanId/level/$levelId"
              params={{ oceanId: ocean.id, levelId: level.id }}
              className="block h-full min-h-0 transition-transform active:scale-[0.98]"
            >
              {card}
            </Link>
          );
        })}
        </div>
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
