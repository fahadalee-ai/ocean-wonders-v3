import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { PageTitleBar } from "@/components/BackBubble";
import { CreatureModal } from "@/components/CreatureModal";
import { KnockoutImg } from "@/components/KnockoutImg";
import { COPY } from "@/data/content";
import { OCEANS, getOceanRoster, type Character } from "@/data/oceans";
import { playSfx } from "@/lib/sfx";

export const Route = createFileRoute("/sea-life")({
  head: () => ({
    meta: [
      { title: "About Ocean Life — Ocean Wonders" },
      {
        name: "description",
        content: "Swipe animal cards and learn kid-friendly facts about each ocean.",
      },
    ],
  }),
  component: SeaLifePage,
});

function SeaLifePage() {
  const [oceanId, setOceanId] = useState(OCEANS[0]!.id);
  const [cardIdx, setCardIdx] = useState(0);
  const [selected, setSelected] = useState<Character | null>(null);

  const ocean = OCEANS.find((o) => o.id === oceanId) ?? OCEANS[0]!;
  const roster = useMemo(() => getOceanRoster(ocean), [ocean]);
  const card = roster[Math.min(cardIdx, Math.max(0, roster.length - 1))] ?? roster[0];

  function pickOcean(id: string) {
    playSfx("tap");
    setOceanId(id);
    setCardIdx(0);
  }

  function shift(dir: -1 | 1) {
    if (!roster.length) return;
    playSfx("tap");
    setCardIdx((i) => (i + dir + roster.length) % roster.length);
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#1E8BC8" }}>
      <AuthOceanBackground fishCount={5} />

      <PageTitleBar title={COPY.aboutOceanLife} backTo="/" />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-2">
          {OCEANS.map((o) => {
            const active = o.id === oceanId;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => pickOcean(o.id)}
                className="flex shrink-0 items-center gap-2 rounded-full border-2 px-2.5 py-1.5"
                style={{
                  background: active ? "rgba(255,255,255,0.2)" : "rgba(6,24,70,0.55)",
                  borderColor: active ? "#FFE566" : "rgba(94,212,255,0.4)",
                }}
              >
                <img src={o.badge} alt="" className="h-8 w-8 rounded-full object-contain" draggable={false} />
                <span className="font-display text-xs font-bold uppercase text-white">{o.name.replace(" Ocean", "")}</span>
              </button>
            );
          })}
        </div>

        {card && (
          <motion.button
            key={`${ocean.id}-${card.id}`}
            type="button"
            onClick={() => setSelected(card)}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 items-center gap-4 overflow-hidden rounded-3xl border-2 px-4 py-3 text-left sm:px-6"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(176,226,255,0.82))",
              borderColor: "#FFFFFF",
              boxShadow: "0 16px 32px rgba(0,15,50,0.3)",
            }}
          >
            <img
              src={ocean.badge}
              alt=""
              className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 opacity-20"
              draggable={false}
            />
            <KnockoutImg src={card.img} alt={card.name} className="h-32 w-32 shrink-0 object-contain sm:h-40 sm:w-40" draggable={false} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#5ED4FF" }}>
                {ocean.name} · Habitat: {ocean.habitat}
              </p>
              <h2 className="text-2xl font-extrabold text-[#0B3D91] sm:text-3xl" style={{ fontFamily: '"Luckiest Guy", sans-serif' }}>{card.name}</h2>
              {card.habitat && (
                <p className="mt-1 text-xs font-bold text-[#0B3D91]/80">Lives in: {card.habitat}</p>
              )}
              {card.diet && <p className="text-xs font-bold text-[#0B3D91]/80">Eats: {card.diet}</p>}
              <p className="mt-2 line-clamp-3 text-sm font-bold leading-snug text-[#0B3D91]">{card.funFact}</p>
              <p className="mt-2 text-[11px] font-bold uppercase" style={{ color: "#FFE566" }}>
                Tap for more · {cardIdx + 1}/{roster.length}
              </p>
            </div>
          </motion.button>
        )}

        <div className="mt-2 flex shrink-0 items-center justify-center gap-3">
          <NavRound label="Previous animal" onClick={() => shift(-1)}>
            <ChevronLeft className="h-6 w-6" strokeWidth={3} />
          </NavRound>
          <NavRound label="Next animal" onClick={() => shift(1)}>
            <ChevronRight className="h-6 w-6" strokeWidth={3} />
          </NavRound>
        </div>
      </div>

      <CreatureModal creature={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

function NavRound({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white text-white"
      style={{
        background: "linear-gradient(180deg, #5ED4FF 0%, #1A8FD4 100%)",
        boxShadow: "0 4px 0 #0E5A9A",
      }}
    >
      {children}
    </button>
  );
}
