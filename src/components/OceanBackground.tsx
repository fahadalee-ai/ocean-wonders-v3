import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ALL_CHARACTERS } from "@/data/oceans";
import { BubbleField } from "@/components/BubbleField";

type FishSpec = {
  id: number;
  img: string;
  top: number;
  size: number;
  duration: number;
  delay: number;
  direction: 1 | -1;
  opacity: number;
  depth: number;
};

type ParticleSpec = {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

type RaySpec = {
  id: number;
  left: number;
  width: number;
  skew: number;
  delay: number;
  opacity: number;
};

/**
 * Living underwater environment: swimming fish, light rays,
 * floating particles, bubbles, and gentle parallax sway.
 */
export function OceanBackground({
  accent = "#2EC4F1",
  bgImage,
  gradient,
  fishCount = 7,
  bubbleCount = 24,
  className = "",
}: {
  accent?: string;
  bgImage?: string;
  gradient?: string;
  fishCount?: number;
  bubbleCount?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fish = useMemo(() => {
    if (!mounted) return [] as FishSpec[];
    return Array.from({ length: fishCount }).map((_, i) => {
      const char = ALL_CHARACTERS[i % ALL_CHARACTERS.length];
      const direction: 1 | -1 = i % 2 === 0 ? 1 : -1;
      return {
        id: i,
        img: char.img,
        top: 12 + Math.random() * 70,
        size: 48 + Math.random() * 72,
        duration: 18 + Math.random() * 22,
        delay: -Math.random() * 20,
        direction,
        opacity: 0.18 + Math.random() * 0.35,
        depth: 0.4 + Math.random() * 0.8,
      };
    });
  }, [mounted, fishCount]);

  const particles = useMemo(() => {
    if (!mounted) return [] as ParticleSpec[];
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 6,
      opacity: 0.2 + Math.random() * 0.45,
    }));
  }, [mounted]);

  const rays = useMemo(() => {
    if (!mounted) return [] as RaySpec[];
    return Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      left: 8 + i * 16 + Math.random() * 6,
      width: 40 + Math.random() * 70,
      skew: -18 + Math.random() * 12,
      delay: Math.random() * 4,
      opacity: 0.08 + Math.random() * 0.12,
    }));
  }, [mounted]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Base gradient / image layers with gentle parallax */}
      <motion.div
        className="absolute inset-[-4%]"
        animate={{ x: [0, 12, -8, 0], y: [0, -6, 4, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      >
        {bgImage ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: gradient ?? `linear-gradient(180deg, ${accent}88 0%, #0B3D91 70%, #061F52 100%)`,
            opacity: bgImage ? 0.72 : 1,
          }}
        />
      </motion.div>

      {/* Soft depth vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, transparent 0%, rgba(6,31,82,0.15) 55%, rgba(6,31,82,0.55) 100%)",
        }}
      />

      {/* Light rays from surface */}
      <div className="absolute inset-x-0 top-0 h-[70%]">
        {rays.map((r) => (
          <span
            key={r.id}
            className="ocean-ray absolute top-0 origin-top"
            style={{
              left: `${r.left}%`,
              width: r.width,
              height: "100%",
              opacity: r.opacity,
              transform: `skewX(${r.skew}deg)`,
              animationDelay: `${r.delay}s`,
              background: `linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 35%, transparent 75%)`,
            }}
          />
        ))}
      </div>

      {/* Floating plankton / particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="ocean-particle absolute rounded-full bg-white"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Background swimming fish */}
      {fish.map((f) => (
        <motion.img
          key={f.id}
          src={f.img}
          alt=""
          draggable={false}
          className="absolute object-contain"
          style={{
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            filter: `blur(${(1 - f.depth) * 1.2}px)`,
            zIndex: Math.round(f.depth * 5),
          }}
          initial={{
            left: f.direction === 1 ? "-15%" : "110%",
            scaleX: f.direction,
            y: 0,
          }}
          animate={{
            left: f.direction === 1 ? "110%" : "-15%",
            y: [0, -18 * f.depth, 10 * f.depth, -8, 0],
            rotate: [0, -3, 3, -2, 0],
          }}
          transition={{
            left: {
              duration: f.duration,
              repeat: Infinity,
              ease: "linear",
              delay: f.delay,
            },
            y: {
              duration: 4 + (f.id % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: f.delay,
            },
            rotate: {
              duration: 5 + (f.id % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: f.delay,
            },
          }}
        />
      ))}

      {/* Surface caustic shimmer */}
      <div className="godrays absolute inset-x-0 top-0 h-2/3 animate-shimmer" />

      {/* Water surface ripple band */}
      <div className="ocean-surface absolute inset-x-0 top-0 h-24 opacity-40" />

      <BubbleField count={bubbleCount} />
    </div>
  );
}
