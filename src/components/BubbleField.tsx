import { useEffect, useMemo, useState } from "react";

/**
 * BubbleField renders a slow stream of rising bubbles as absolutely positioned divs.
 * Purely decorative; pointer-events: none.
 * Includes slight horizontal drift and varied glass-like transparency.
 */
export function BubbleField({ count = 22, className = "" }: { count?: number; className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const bubbles = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: count }).map((_, i) => {
      const size = 6 + Math.random() * 42;
      const left = Math.random() * 100;
      const dur = 7 + Math.random() * 16;
      const delay = -Math.random() * dur;
      const opacity = 0.3 + Math.random() * 0.55;
      const drift = (Math.random() * 40 - 20).toFixed(1);
      return { i, size, left, dur, delay, opacity, drift };
    });
  }, [count, mounted]);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {bubbles.map((b) => (
        <span
          key={b.i}
          className="bubble"
          style={
            {
              width: b.size,
              height: b.size,
              left: `${b.left}%`,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              opacity: b.opacity,
              ["--bubble-drift" as string]: `${b.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
