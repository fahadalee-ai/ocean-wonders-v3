import { useEffect, useMemo, useState } from "react";

type SoftBubble = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
};

/**
 * Level play backdrop matching the preparing-level theme:
 * deep navy → bright blue vertical gradient + soft white bokeh bubbles.
 */
export function LevelPlayBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const bubbles = useMemo(() => {
    if (!mounted) return [] as SoftBubble[];
    return [
      { id: 0, left: 8, top: 12, size: 90, opacity: 0.12 },
      { id: 1, left: 72, top: 8, size: 70, opacity: 0.1 },
      { id: 2, left: 55, top: 28, size: 120, opacity: 0.09 },
      { id: 3, left: 18, top: 48, size: 55, opacity: 0.14 },
      { id: 4, left: 78, top: 52, size: 85, opacity: 0.11 },
      { id: 5, left: 40, top: 68, size: 100, opacity: 0.08 },
      { id: 6, left: 5, top: 78, size: 65, opacity: 0.12 },
      { id: 7, left: 88, top: 82, size: 50, opacity: 0.1 },
      { id: 8, left: 30, top: 22, size: 40, opacity: 0.15 },
    ];
  }, [mounted]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #1A2B6D 0%, #1E4A9E 42%, #0B7BC8 78%, #0EA5E9 100%)",
        }}
      />

      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute rounded-full"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.25) 45%, transparent 70%)",
            filter: "blur(1px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
