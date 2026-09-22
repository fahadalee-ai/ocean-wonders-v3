import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import worldMap from "@/assets/maps/cartoon-world-oceans.png";
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

/**
 * Positions are % of the uncropped 16:9 map image (water only).
 * Pacific left of Americas, Atlantic between Americas and Africa,
 * Arctic at the north ice, Indian between Africa and Australia,
 * Southern just above Antarctica.
 */
const HOTSPOTS = [
  { id: "pacific", left: 11, top: 46, size: "min(8.6vw, 3.9rem)", glow: "rgba(40,140,230,0.85)" },
  { id: "atlantic", left: 35, top: 44, size: "min(8.4vw, 3.8rem)", glow: "rgba(70,200,255,0.85)" },
  { id: "arctic", left: 48, top: 18, size: "min(8.4vw, 3.8rem)", glow: "rgba(180,230,255,0.95)" },
  { id: "indian", left: 68, top: 54, size: "min(8.4vw, 3.8rem)", glow: "rgba(40,220,200,0.85)" },
  { id: "southern", left: 50, top: 76, size: "min(8.6vw, 3.9rem)", glow: "rgba(160,220,255,0.9)" },
] as const;

export const OCEAN_MAP_ZONES: OceanMapZone[] = [
  { oceanId: "pacific", label: "Pacific Ocean", cx: 11, cy: 46, rx: 8, ry: 8 },
  { oceanId: "atlantic", label: "Atlantic Ocean", cx: 35, cy: 44, rx: 8, ry: 8 },
  { oceanId: "arctic", label: "Arctic Ocean", cx: 48, cy: 18, rx: 8, ry: 8 },
  { oceanId: "indian", label: "Indian Ocean", cx: 68, cy: 54, rx: 8, ry: 8 },
  { oceanId: "southern", label: "Southern Ocean", cx: 50, cy: 76, rx: 8, ry: 8 },
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
    <div className="absolute inset-0 z-0 overflow-hidden" style={{ backgroundColor: "#3EB6F2" }}>
      <img
        src={worldMap}
        alt="Cartoon world map of the five oceans"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        draggable={false}
      />

      {HOTSPOTS.map((slot, i) => {
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
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
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
                    : { type: "spring", stiffness: 420, damping: 16, delay: 0.12 + i * 0.05 }
                }
              >
                <motion.span
                  className="relative block aspect-square w-full"
                  animate={unlocked ? { scale: selected ? 1.08 : [1, 1.04, 1] } : { scale: 1 }}
                  transition={
                    unlocked ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }
                  }
                >
                  <span
                    className="pointer-events-none absolute inset-[-8%] rounded-full"
                    style={{
                      boxShadow: unlocked
                        ? `0 0 0 3px #fff, 0 0 16px 4px ${slot.glow}`
                        : "0 0 0 2px rgba(255,255,255,0.55)",
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
                  <span
                    className="pointer-events-none absolute left-1/2 top-[108%] z-[2] w-max -translate-x-1/2 rounded-full border-2 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white sm:text-xs"
                    style={{
                      fontFamily: '"Baloo 2", sans-serif',
                      background: unlocked
                        ? "linear-gradient(180deg, #1A5FB4 0%, #0B3D91 100%)"
                        : "rgba(6,24,70,0.65)",
                      borderColor: "#FFFFFF",
                      boxShadow: "0 3px 0 #062A66",
                    }}
                  >
                    {ocean.name.replace(" Ocean", "")}
                  </span>
                  {!unlocked && (
                    <span className="pointer-events-none absolute left-1/2 top-[46%] z-[2] -translate-x-1/2 -translate-y-1/2">
                      <span
                        className="flex h-[1.25rem] w-[1.25rem] items-center justify-center rounded-full border-2 border-white"
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
  );
}
