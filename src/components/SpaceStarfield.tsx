import { useMemo } from "react";

type Star = { left: string; top: string; size: number; delay: number; duration: number };
type Sparkle = { left: string; top: string; size: number; delay: number; color: string };

function seeded(n: number) {
  const x = Math.sin(n * 999) * 10000;
  return x - Math.floor(x);
}

/** Twinkling starfield for the ocean-map / home screen. */
export function SpaceStarfield() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      left: `${seeded(i + 1) * 100}%`,
      top: `${seeded(i + 50) * 100}%`,
      size: 1.5 + seeded(i + 90) * 2.5,
      delay: seeded(i + 120) * 4,
      duration: 2.2 + seeded(i + 150) * 2.8,
    }));
  }, []);

  const sparkles = useMemo<Sparkle[]>(() => {
    const colors = ["#FFE566", "#5ED4FF", "#FFFFFF", "#FFB347"];
    return Array.from({ length: 14 }, (_, i) => ({
      left: `${8 + seeded(i + 200) * 84}%`,
      top: `${6 + seeded(i + 230) * 80}%`,
      size: 3 + seeded(i + 260) * 4,
      delay: seeded(i + 290) * 3,
      color: colors[i % colors.length]!,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #0B3D91 0%, #061538 55%, #020617 100%)",
        }}
      />
      {stars.map((s, i) => (
        <span
          key={`star-${i}`}
          className="map-star absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            boxShadow: "0 0 6px rgba(255,255,255,0.65)",
          }}
        />
      ))}
      {sparkles.map((s, i) => (
        <span
          key={`sparkle-${i}`}
          className="map-sparkle absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: s.color,
            animationDelay: `${s.delay}s`,
            boxShadow: `0 0 10px ${s.color}`,
          }}
        />
      ))}
    </div>
  );
}
