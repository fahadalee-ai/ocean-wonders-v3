import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Lock } from "lucide-react";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { PageTitleBar } from "@/components/BackBubble";
import { CreatureModal } from "@/components/CreatureModal";
import { GlossyButton } from "@/components/GlossyButton";
import { ALL_CHARACTERS, type Character } from "@/data/oceans";

export const Route = createFileRoute("/sea-life")({
  head: () => ({
    meta: [
      { title: "Sea Life — Ocean Wonders" },
      {
        name: "description",
        content: "Meet amazing ocean creatures and learn fun facts about sea life!",
      },
      { property: "og:title", content: "Sea Life — Ocean Wonders" },
      { property: "og:description", content: "Explore ocean creatures with fun facts for kids." },
    ],
  }),
  component: SeaLifePage,
});

const CYAN = "#5ED4FF";
const CARD_BORDER = "rgba(94,212,255,0.65)";

function SeaLifePage() {
  const [selected, setSelected] = useState<Character | null>(null);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#0A2F7A" }}>
      <AuthOceanBackground fishCount={5} />

      <PageTitleBar title="Sea Life" backTo="/" />

      <div className="relative z-10 mx-auto flex h-[calc(100dvh-4.5rem)] w-full max-w-5xl flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 gap-2.5 overflow-y-auto pb-2 sm:mt-3 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {ALL_CHARACTERS.map((creature, i) => (
            <motion.button
              key={creature.id}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.28 }}
              onClick={() => setSelected(creature)}
              className="flex w-full items-center gap-2.5 rounded-2xl border-2 p-2.5 text-left transition-transform active:scale-[0.98] sm:gap-3 sm:rounded-3xl sm:p-3"
              style={{
                background: "linear-gradient(135deg, rgba(8,40,110,0.55) 0%, rgba(20,70,150,0.4) 100%)",
                borderColor: CARD_BORDER,
                boxShadow: "0 10px 24px rgba(0,20,60,0.28), inset 0 1px 0 rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 sm:h-16 sm:w-16 sm:rounded-2xl"
                style={{
                  borderColor: CYAN,
                  background: "linear-gradient(160deg, rgba(255,255,255,0.18), rgba(10,50,120,0.35))",
                  boxShadow: "0 4px 12px rgba(0,20,60,0.25)",
                }}
              >
                <img
                  src={creature.img}
                  alt={creature.name}
                  className="h-[88%] w-[88%] object-contain drop-shadow-md"
                  draggable={false}
                />
              </div>

              <span
                className="min-w-0 flex-1 font-display text-sm font-bold uppercase leading-tight tracking-wide sm:text-base"
                style={{ color: CYAN, textShadow: "0 1px 2px rgba(0,20,60,0.4)" }}
              >
                {creature.name}
              </span>
            </motion.button>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.28 }}
            className="col-span-2 flex w-full items-center gap-3 rounded-2xl border-2 p-2.5 sm:col-span-1 sm:rounded-3xl sm:p-3 lg:col-span-2"
            style={{
              background: "linear-gradient(135deg, rgba(8,40,110,0.55) 0%, rgba(20,70,150,0.4) 100%)",
              borderColor: CARD_BORDER,
              boxShadow: "0 10px 24px rgba(0,20,60,0.28), inset 0 1px 0 rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-[3px] sm:h-16 sm:w-16 sm:rounded-2xl"
              style={{
                borderColor: "#FF8C2A",
                background: "rgba(10,40,100,0.45)",
                boxShadow: "0 0 14px rgba(255,140,42,0.35)",
              }}
            >
              <Lock className="h-7 w-7 text-white sm:h-8 sm:w-8" strokeWidth={2.5} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-xs font-semibold text-white/85 sm:text-sm">Tap to subscribe</p>
              <GlossyButton variant="orange" size="sm" to="/shop" className="max-w-[180px]">
                Buy to Unlock
              </GlossyButton>
            </div>
          </motion.div>
        </div>
      </div>

      <CreatureModal creature={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
