import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, HelpCircle, Settings, Star, Trophy, Waves } from "lucide-react";
import kidBoy from "@/assets/kid-diver-boy.png";
import kidGirl from "@/assets/kid-diver-girl.png";
import { OCEANS, TOTAL_LEVELS } from "@/data/oceans";
import { COPY } from "@/data/content";
import { GoldTitle } from "@/components/ChunkyTitle";
import { GlossyButton } from "@/components/GlossyButton";
import { KnockoutImg } from "@/components/KnockoutImg";
import { OceanWorldMap } from "@/components/OceanWorldMap";
import { SoundToggle } from "@/components/SoundToggle";
import { useOceanSelection } from "@/hooks/useOceanSelection";
import { getCoins, getGlobalStats, getOceanStats } from "@/lib/progress";
import { playSfx } from "@/lib/sfx";

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
  const [oceanStats, setOceanStats] = useState<Record<string, ReturnType<typeof getOceanStats>>>({});
  const [coins, setCoins] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setStats(getGlobalStats());
    setCoins(getCoins());
    const map: Record<string, ReturnType<typeof getOceanStats>> = {};
    for (const o of OCEANS) map[o.id] = getOceanStats(o);
    setOceanStats(map);
  }, []);

  function handlePick(oceanId: string, unlocked: boolean) {
    if (!unlocked) return;
    selectOcean(oceanId, unlocked);
    navigate({ to: "/ocean/$oceanId", params: { oceanId } });
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#3EB6F2" }}>
      <OceanWorldMap
        selectedId={selectedId}
        rippleKey={rippleKey}
        oceanStats={oceanStats}
        onPick={handlePick}
      />

      <span
        className="absolute right-5 top-[max(0.55rem,env(safe-area-inset-top))] z-30 rounded-full border-2 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white sm:right-6 sm:text-xs"
        style={{
          fontFamily: '"Baloo 2", sans-serif',
          background: "linear-gradient(180deg, #1A5FB4 0%, #0B3D91 100%)",
          borderColor: "#FFFFFF",
          boxShadow: "0 4px 0 #062A66, 0 8px 14px rgba(0,20,60,0.28)",
        }}
      >
        {COPY.ageRange}
      </span>

      <div className="pointer-events-none relative z-20 flex shrink-0 flex-col items-center px-16 pb-0 pt-[max(0.35rem,env(safe-area-inset-top))]">
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
          <GoldTitle text={COPY.exploreTitle} size="sm" />
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-[max(3.4rem,calc(env(safe-area-inset-bottom)+2.2rem))] left-3 z-[2] w-[min(11vw,100px)]"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.4 },
          x: { type: "spring", stiffness: 260, damping: 18 },
          y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
        }}
      >
        <KnockoutImg
          src={kidBoy}
          alt=""
          className="h-auto w-full select-none object-contain drop-shadow-[0_10px_16px_rgba(0,20,50,0.35)]"
          draggable={false}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute bottom-[max(3.4rem,calc(env(safe-area-inset-bottom)+2.2rem))] right-3 z-[2] w-[min(11vw,100px)] -scale-x-100"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
        transition={{
          opacity: { duration: 0.4 },
          x: { type: "spring", stiffness: 260, damping: 18 },
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
        }}
      >
        <KnockoutImg
          src={kidGirl}
          alt=""
          className="h-auto w-full select-none object-contain drop-shadow-[0_10px_16px_rgba(0,20,50,0.35)]"
          draggable={false}
        />
      </motion.div>

      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-5 z-30">
        <GlossyButton
          variant="blue"
          size="sm"
          to="/"
          onClick={() => playSfx("tap")}
          className="max-w-[148px] gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={3} />
          Back
        </GlossyButton>
      </div>

      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 flex items-end gap-2">
        <GlossyButton
          variant="blue"
          size="sm"
          onClick={() => {
            playSfx("tap");
            setSettingsOpen(true);
          }}
          className="max-w-[168px]"
        >
          <Settings className="h-4 w-4" strokeWidth={2.6} />
          Settings
        </GlossyButton>
        <button
          type="button"
          onClick={() => {
            playSfx("tap");
            setHelpOpen(true);
          }}
          className="flex flex-col items-center"
          aria-label="Help"
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white"
            style={{
              background: "linear-gradient(180deg, #5ED4FF 0%, #1A8FD4 100%)",
              boxShadow: "0 4px 0 #0E5A9A, 0 8px 14px rgba(0,20,60,0.3)",
            }}
          >
            <HelpCircle className="h-5 w-5 text-white" strokeWidth={2.6} />
          </span>
        </button>
      </div>

      {helpOpen && (
        <Overlay onClose={() => setHelpOpen(false)}>
          <h2 className="text-2xl font-extrabold text-[#0B3D91]" style={{ fontFamily: '"Luckiest Guy", sans-serif' }}>
            How to play
          </h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-[#0B3D91]/80">
            Start with the glowing Pacific Ocean. Drag each sea friend from the inventory onto its matching shadow.
            Finish an ocean to unlock the next one. Stars and coins never punish — they just celebrate how you did!
          </p>
          <button
            type="button"
            className="mt-4 font-display text-sm font-bold underline"
            style={{ color: "#0B3D91" }}
            onClick={() => setHelpOpen(false)}
          >
            Got it!
          </button>
        </Overlay>
      )}

      {settingsOpen && (
        <Overlay onClose={() => setSettingsOpen(false)}>
          <h2 className="text-2xl font-extrabold text-[#0B3D91]" style={{ fontFamily: '"Luckiest Guy", sans-serif' }}>
            Settings
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatPill icon={<Waves className="h-3.5 w-3.5" />} value={`${stats.completed}/${stats.total}`} label="Levels" />
            <StatPill icon={<Star className="h-3.5 w-3.5" />} value={`${stats.stars}`} label="Stars" />
            <StatPill icon={<Trophy className="h-3.5 w-3.5" />} value={`${coins}`} label="Coins" />
            <SoundToggle />
          </div>
          <button
            type="button"
            className="mt-4 font-display text-sm font-bold underline"
            style={{ color: "#0B3D91" }}
            onClick={() => setSettingsOpen(false)}
          >
            Close
          </button>
        </Overlay>
      )}
    </main>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(6,24,70,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border-2 p-5 text-left"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(186,232,255,0.9))",
          borderColor: "#FFFFFF",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border-2 px-2.5 py-1.5 text-[#0B3D91]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(186,232,255,0.75))",
        borderColor: "#FFFFFF",
        boxShadow: "0 6px 14px rgba(0,30,70,0.16)",
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
        <div className="text-xs font-extrabold sm:text-sm" style={{ fontFamily: '"Baloo 2", sans-serif' }}>
          {value}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-[#0B3D91]/65">{label}</div>
      </div>
    </div>
  );
}
