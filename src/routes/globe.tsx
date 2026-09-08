import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Trophy, Waves } from "lucide-react";
import { OCEANS, TOTAL_LEVELS } from "@/data/oceans";
import { BackButton, PAGE_HEADER_PAD } from "@/components/BackBubble";
import { GlossyButton } from "@/components/GlossyButton";
import { MapOceanLife } from "@/components/MapOceanLife";
import { OceanSelectBar } from "@/components/OceanSelectBar";
import { OceanWorldMap } from "@/components/OceanWorldMap";
import { useOceanSelection } from "@/hooks/useOceanSelection";
import {
  getGlobalStats,
  getOceanStats,
  getProfile,
  type AvatarId,
} from "@/lib/progress";
import { avatarSrc } from "@/lib/avatars";

export const Route = createFileRoute("/globe")({
  head: () => ({
    meta: [
      { title: "Explore the World Map! — Ocean Wonders" },
      {
        name: "description",
        content: "Explore the five oceans on an interactive illustrated world map!",
      },
      { property: "og:title", content: "Explore the World Map" },
      { property: "og:description", content: "Five oceans, thirty-five levels of adventure." },
    ],
  }),
  component: OceanSelectPage,
});

function OceanSelectPage() {
  const navigate = useNavigate();
  const { selectedId, rippleKey, selectOcean } = useOceanSelection({ announce: true });

  const [stats, setStats] = useState({
    completed: 0,
    total: TOTAL_LEVELS,
    stars: 0,
    oceansCleared: 0,
    totalOceans: OCEANS.length,
  });
  const [profileNick, setProfileNick] = useState("Explorer");
  const [avatarId, setAvatarId] = useState<AvatarId | undefined>(undefined);
  const [oceanStats, setOceanStats] = useState<
    Record<string, ReturnType<typeof getOceanStats>>
  >({});

  useEffect(() => {
    setStats(getGlobalStats());
    const p = getProfile();
    if (p?.nickname) setProfileNick(p.nickname);
    if (p?.avatar) setAvatarId(p.avatar);
    const map: Record<string, ReturnType<typeof getOceanStats>> = {};
    for (const o of OCEANS) map[o.id] = getOceanStats(o);
    setOceanStats(map);
  }, []);

  const selectedOcean = OCEANS.find((o) => o.id === selectedId) ?? null;

  function handlePick(oceanId: string, unlocked: boolean) {
    if (!unlocked) return;
    selectOcean(oceanId, unlocked);
  }

  function handleSelectOcean() {
    if (!selectedOcean) return;
    navigate({ to: "/ocean/$oceanId", params: { oceanId: selectedOcean.id } });
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#0A1A3A" }}>
      <OceanWorldMap selectedId={selectedId} rippleKey={rippleKey} />
      <MapOceanLife fishCount={6} bubbleCount={16} />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(4,16,40,0.55) 0%, transparent 22%, transparent 72%, rgba(4,16,40,0.65) 100%)",
        }}
      />

      <header
        className={`relative z-30 mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] ${PAGE_HEADER_PAD} md:px-8`}
      >
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <BackButton to="/" label="Back to splash" />
          <div
            className="flex min-w-0 items-center gap-2.5 rounded-full border px-2.5 py-1.5 sm:px-3 sm:py-2"
            style={{
              background: "rgba(6, 24, 70, 0.82)",
              borderColor: "rgba(94, 212, 255, 0.45)",
              boxShadow: "0 8px 20px rgba(0,12,40,0.35)",
            }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white">
              <img src={avatarSrc(avatarId)} alt="" className="h-7 w-7 object-contain" draggable={false} />
            </div>
            <div className="min-w-0 pr-1">
              <div className="truncate font-display text-base font-bold leading-tight text-white">
                Hi, {profileNick}!
              </div>
              <div className="truncate text-[11px] font-semibold text-white/70">
                Pick an ocean, then tap Select
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <StatPill icon={<Waves className="h-3.5 w-3.5" />} value={`${stats.completed}/${stats.total}`} label="Levels" />
          <StatPill icon={<Star className="h-3.5 w-3.5" />} value={`${stats.stars}`} label="Stars" />
          <StatPill icon={<Trophy className="h-3.5 w-3.5" />} value={`${stats.oceansCleared}/${stats.totalOceans}`} label="Oceans" />
        </div>
      </header>

      <div className="relative z-20 shrink-0 px-4 pb-1 text-center">
        <h1
          className="font-display text-xl font-bold uppercase tracking-[0.04em] text-white sm:text-2xl md:text-[1.75rem]"
          style={{ textShadow: "0 2px 12px rgba(0,20,60,0.55)" }}
        >
          Explore the World Map!
        </h1>
      </div>

      {/* Spacer keeps the map visible between header and ocean bar */}
      <div className="relative z-10 min-h-0 flex-1" />

      <div className="relative z-30 mx-auto flex w-full max-w-6xl shrink-0 flex-col items-center gap-2.5 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-1 sm:px-6">
        <AnimatePresence mode="wait">
          {selectedOcean && (
            <motion.div
              key={selectedOcean.id}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="w-full max-w-[280px]"
            >
              <GlossyButton
                variant="orange"
                size="md"
                fullWidth
                onClick={handleSelectOcean}
                className="max-w-none"
              >
                Select {selectedOcean.name.replace(" Ocean", "")}
              </GlossyButton>
            </motion.div>
          )}
        </AnimatePresence>

        <OceanSelectBar
          oceans={OCEANS}
          oceanStats={oceanStats}
          selectedId={selectedId}
          onSelect={handlePick}
        />
      </div>
    </main>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-white"
      style={{
        background: "rgba(6, 24, 70, 0.82)",
        borderColor: "rgba(94, 212, 255, 0.4)",
        boxShadow: "0 6px 14px rgba(0,12,40,0.3)",
      }}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
        style={{
          background: "linear-gradient(180deg, #FFB347 0%, #F06A12 100%)",
          boxShadow: "0 2px 0 #C44A10",
        }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <div className="font-display text-xs font-bold sm:text-sm">{value}</div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-white/70">{label}</div>
      </div>
    </div>
  );
}
