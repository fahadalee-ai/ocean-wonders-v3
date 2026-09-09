import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import continents from "@/assets/cartoon-continents-clean.png";
import { getOcean } from "@/data/oceans";
import { playSfx } from "@/lib/sfx";
import type { getOceanStats } from "@/lib/progress";

export type OceanMapZone = {
  oceanId: string;
  label: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

/** Smile arc: center high, outsides low, slight size mix so it is not a flat line. */
const ARC = [
  { id: "pacific", left: 10, top: 70, size: "min(13.4vw, 6.2rem)", glow: "rgba(40,140,230,0.75)" },
  { id: "atlantic", left: 30, top: 48, size: "min(14.4vw, 6.65rem)", glow: "rgba(70,200,255,0.75)" },
  { id: "arctic", left: 50, top: 28, size: "min(15.4vw, 7.15rem)", glow: "rgba(180,230,255,0.85)" },
  { id: "indian", left: 70, top: 46, size: "min(13.8vw, 6.4rem)", glow: "rgba(40,220,200,0.75)" },
  { id: "southern", left: 90, top: 72, size: "min(14.8vw, 6.85rem)", glow: "rgba(160,220,255,0.75)" },
] as const;

export const OCEAN_MAP_ZONES: OceanMapZone[] = [
  { oceanId: "pacific", label: "Pacific Ocean", cx: 10, cy: 70, rx: 11, ry: 11 },
  { oceanId: "atlantic", label: "Atlantic Ocean", cx: 30, cy: 48, rx: 11, ry: 11 },
  { oceanId: "arctic", label: "Arctic Ocean", cx: 50, cy: 28, rx: 12, ry: 12 },
  { oceanId: "indian", label: "Indian Ocean", cx: 70, cy: 46, rx: 11, ry: 11 },
  { oceanId: "southern", label: "Southern Ocean", cx: 90, cy: 72, rx: 11, ry: 11 },
];

type OceanStats = ReturnType<typeof getOceanStats>;

type Props = {
  selectedId: string | null;
  rippleKey?: number;
  oceanStats?: Record<string, OceanStats>;
  onPick?: (oceanId: string, unlocked: boolean) => void;
};

export function OceanWorldMap({ selectedId, oceanStats = {}, onPick }: Props) {
  const [shakeId, setShakeId] = useState<string | null>(null);

  return (
    <motion.div
      className="relative flex h-full w-full max-w-[980px] items-center justify-center"
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <img
        src={continents}
        alt=""
        className="pointer-events-none absolute left-1/2 top-[46%] h-[70%] w-[92%] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.2]"
        draggable={false}
      />

      <div className="relative z-10 h-full w-full">
        {ARC.map((slot, i) => {
          const ocean = getOcean(slot.id);
          if (!ocean) return null;
          const stats = oceanStats[ocean.id];
          const unlocked = stats?.unlocked ?? ocean.id === "arctic";
          const selected = selectedId === ocean.id;
          const shaking = shakeId === ocean.id;

          return (
            <motion.button
              key={ocean.id}
              type="button"
              aria-label={unlocked ? ocean.name : `${ocean.name} locked`}
              onClick={() => {
                if (!unlocked) {
                  playSfx("lock");
                  setShakeId(ocean.id);
                  window.setTimeout(() => setShakeId((id) => (id === ocean.id ? null : id)), 420);
                  onPick?.(ocean.id, false);
                  return;
                }
                playSfx("tap");
                onPick?.(ocean.id, true);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${slot.left}%`,
                top: `${slot.top}%`,
                width: slot.size,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                x: shaking ? [-5, 5, -4, 4, 0] : 0,
              }}
              transition={
                shaking
                  ? { duration: 0.4 }
                  : { type: "spring", stiffness: 420, damping: 16, delay: 0.2 + i * 0.07 }
              }
            >
              <motion.span
                className="relative block aspect-square w-full"
                animate={unlocked ? { scale: selected ? 1.03 : [1, 1.02, 1] } : { scale: 1 }}
                transition={
                  unlocked ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }
                }
              >
                <span
                  className="pointer-events-none absolute inset-[-4%] rounded-full"
                  style={{
                    boxShadow: unlocked
                      ? `0 0 0 2px #fff, 0 0 10px 2px ${slot.glow}`
                      : "0 0 0 2px rgba(255,255,255,0.45)",
                  }}
                />
                <img
                  src={ocean.badge}
                  alt=""
                  className="relative z-[1] h-full w-full rounded-full object-contain"
                  style={{
                    filter: unlocked ? "none" : "grayscale(0.8) brightness(0.7)",
                  }}
                  draggable={false}
                />
                {!unlocked && (
                  <span className="pointer-events-none absolute left-1/2 top-[46%] z-[2] -translate-x-1/2 -translate-y-1/2">
                    <span
                      className="flex h-[1.35rem] w-[1.35rem] items-center justify-center rounded-full border-2 border-white"
                      style={{
                        background: "linear-gradient(180deg, #FFD36A 0%, #FF7A12 100%)",
                        boxShadow: "0 2px 0 #C85A10",
                      }}
                    >
                      <Lock className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                  </span>
                )}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
