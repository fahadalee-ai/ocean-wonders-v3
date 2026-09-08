import { AnimatePresence, motion } from "framer-motion";
import worldMap from "@/assets/world-map.png";

export type OceanMapZone = {
  oceanId: string;
  label: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

/** Highlight zones aligned to the illustrated world-map art. */
export const OCEAN_MAP_ZONES: OceanMapZone[] = [
  { oceanId: "arctic", label: "Arctic Ocean", cx: 50, cy: 14, rx: 18, ry: 8 },
  { oceanId: "pacific", label: "Pacific Ocean", cx: 10, cy: 48, rx: 11, ry: 16 },
  { oceanId: "pacific", label: "Pacific Ocean", cx: 90, cy: 50, rx: 10, ry: 15 },
  { oceanId: "atlantic", label: "Atlantic Ocean", cx: 36, cy: 48, rx: 9, ry: 16 },
  { oceanId: "indian", label: "Indian Ocean", cx: 68, cy: 56, rx: 11, ry: 13 },
  { oceanId: "southern", label: "Southern Ocean", cx: 50, cy: 84, rx: 28, ry: 7 },
];

type Props = {
  selectedId: string | null;
  rippleKey?: number;
};

/** Centered world map (~80% viewport) with ocean selection highlights. */
export function OceanWorldMap({ selectedId, rippleKey = 0 }: Props) {
  const activeZones = OCEAN_MAP_ZONES.filter((z) => z.oceanId === selectedId);
  const callout = activeZones[0];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center overflow-hidden"
      aria-hidden={!selectedId}
    >
      <div
        className="relative h-[80%] w-[80%] max-h-[80dvh] max-w-[80vw]"
        style={{
          filter: "drop-shadow(0 18px 40px rgba(0,12,40,0.45))",
        }}
      >
        <img
          src={worldMap}
          alt=""
          className="absolute inset-0 h-full w-full select-none rounded-2xl object-cover object-center"
          draggable={false}
        />

        <svg
          className="absolute inset-0 h-full w-full rounded-2xl"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <radialGradient id="owMapGlowFs" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,229,102,0.7)" />
              <stop offset="45%" stopColor="rgba(94,212,255,0.4)" />
              <stop offset="100%" stopColor="rgba(46,196,241,0)" />
            </radialGradient>
            <filter id="owMapBlurFs" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>
          {OCEAN_MAP_ZONES.map((z, i) => {
            const active = selectedId === z.oceanId;
            return (
              <motion.ellipse
                key={`${z.oceanId}-${i}`}
                cx={z.cx}
                cy={z.cy}
                rx={z.rx}
                ry={z.ry}
                fill="url(#owMapGlowFs)"
                filter="url(#owMapBlurFs)"
                initial={false}
                animate={{ opacity: active ? [0.55, 1, 0.65] : 0 }}
                transition={
                  active
                    ? { duration: 1.45, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.22 }
                }
              />
            );
          })}
        </svg>

        <AnimatePresence mode="wait">
          {callout && (
            <motion.div
              key={`${selectedId}-${rippleKey}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${callout.cx}%`, top: `${Math.max(8, callout.cy - 7)}%` }}
              initial={{ opacity: 0, y: 8, scale: 0.88 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: [1, 1.12, 1.04],
                rotate: [0, -4, 4, 0],
              }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <div
                className="whitespace-nowrap rounded-full border-2 border-white px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-white sm:text-sm"
                style={{
                  background: "linear-gradient(180deg, #FFB347 0%, #F06A12 100%)",
                  boxShadow: "0 0 22px rgba(255,179,71,0.8), 0 4px 0 #C44A10",
                }}
              >
                {callout.label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
