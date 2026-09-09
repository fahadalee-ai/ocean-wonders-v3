import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Ocean } from "@/data/oceans";
import type { getOceanStats } from "@/lib/progress";

type OceanStats = ReturnType<typeof getOceanStats>;

export const OCEAN_BAR_ORDER = ["arctic", "atlantic", "pacific", "indian", "southern"] as const;

type Props = {
  oceans: Ocean[];
  oceanStats: Record<string, OceanStats>;
  selectedId: string | null;
  busy?: boolean;
  onSelect: (oceanId: string, unlocked: boolean) => void;
};

/**
 * Refined ocean picker — icon + short name, glass cards, clear selected state.
 */
export function OceanSelectBar({ oceans, oceanStats, selectedId, busy = false, onSelect }: Props) {
  const ordered = OCEAN_BAR_ORDER.map((id) => oceans.find((o) => o.id === id)).filter(
    Boolean,
  ) as Ocean[];

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-5 gap-2 sm:gap-3">
      {ordered.map((ocean, i) => {
        const idx = oceans.findIndex((o) => o.id === ocean.id);
        const stats = oceanStats[ocean.id];
        const unlocked = stats?.unlocked ?? idx === 0;
        const selected = selectedId === ocean.id;
        const locked = !unlocked;
        const short = ocean.name.replace(" Ocean", "");

        return (
          <motion.button
            key={ocean.id}
            type="button"
            disabled={locked || busy}
            onClick={() => onSelect(ocean.id, unlocked)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, scale: selected ? 1.04 : 1 }}
            transition={{ delay: 0.03 * i, type: "spring", stiffness: 400, damping: 26 }}
            whileTap={locked || busy ? undefined : { scale: 0.97 }}
            className="relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border px-1.5 py-2 text-center sm:rounded-3xl sm:px-2 sm:py-2.5 disabled:cursor-not-allowed"
            style={{
              background: selected
                ? `linear-gradient(165deg, ${ocean.accent}66 0%, rgba(8,40,110,0.92) 100%)`
                : "linear-gradient(165deg, rgba(255,255,255,0.12) 0%, rgba(8,40,110,0.72) 100%)",
              borderColor: selected ? "#FFFFFF" : "rgba(94,212,255,0.4)",
              boxShadow: selected
                ? `0 0 0 2px ${ocean.accent}88, 0 10px 24px rgba(0,15,50,0.35)`
                : "0 8px 18px rgba(0,15,50,0.28), inset 0 1px 0 rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              filter: locked ? "grayscale(0.4) brightness(0.92)" : undefined,
            }}
            aria-pressed={selected}
            aria-label={ocean.name}
          >
            <div
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 sm:h-12 sm:w-12 sm:rounded-2xl"
              style={{
                borderColor: selected ? "#FFE566" : "rgba(255,255,255,0.55)",
                background: "linear-gradient(160deg, rgba(255,255,255,0.28), rgba(10,50,120,0.35))",
              }}
            >
              <img
                src={ocean.character.img}
                alt=""
                className="h-[86%] w-[86%] object-contain"
                draggable={false}
              />
            </div>
            <span
              className="truncate font-display text-[10px] font-bold uppercase leading-none text-white sm:text-xs"
              style={{ textShadow: "0 1px 2px rgba(0,20,60,0.4)" }}
            >
              {short}
            </span>

            {locked && (
              <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#061846]/45 sm:rounded-3xl">
                <Lock className="h-4 w-4 text-white" strokeWidth={3} />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
