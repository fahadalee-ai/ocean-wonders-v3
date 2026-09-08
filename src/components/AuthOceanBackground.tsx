import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import bgSplash from "@/assets/bg.png";
import char1 from "@/assets/Characters_1.png";
import char2 from "@/assets/Characters_2.png";
import char3 from "@/assets/Characters_3.png";
import char4 from "@/assets/Characters_4.png";
import char5 from "@/assets/Characters_5.png";
import char6 from "@/assets/Characters_6.png";
import char7 from "@/assets/Characters_7.png";
import char8 from "@/assets/Characters_8.png";
import char9 from "@/assets/Characters_9.png";

const FISH_IMGS = [char1, char2, char3, char4, char5, char6, char7, char8, char9];

type SwimFish = {
  id: number;
  img: string;
  top: number;
  size: number;
  duration: number;
  delay: number;
  direction: 1 | -1;
  opacity: number;
  bob: number;
};

type Bubble = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
};

/**
 * Shared animated ocean backdrop for Splash / Login / Register:
 * slow drifting bg.png + swimming fish + rising bubbles.
 */
export function AuthOceanBackground({ fishCount = 7 }: { fishCount?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fish = useMemo(() => {
    if (!mounted) return [] as SwimFish[];
    return Array.from({ length: fishCount }).map((_, i) => {
      const direction: 1 | -1 = i % 2 === 0 ? 1 : -1;
      return {
        id: i,
        img: FISH_IMGS[i % FISH_IMGS.length]!,
        top: 12 + ((i * 11) % 68),
        size: 44 + (i % 4) * 18,
        duration: 22 + (i % 5) * 6,
        delay: -(i * 2.4),
        direction,
        opacity: 0.22 + (i % 4) * 0.08,
        bob: 8 + (i % 3) * 4,
      };
    });
  }, [mounted, fishCount]);

  const bubbles = useMemo(() => {
    if (!mounted) return [] as Bubble[];
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: 5 + ((i * 7) % 90),
      size: 5 + (i % 5) * 4,
      duration: 8 + (i % 5) * 2.5,
      delay: i * 0.55,
    }));
  }, [mounted]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ contain: "paint" }} aria-hidden>
      {/* Fallback color */}
      <div className="absolute inset-0" style={{ backgroundColor: "#0A2F7A" }} />

      {/* Slow drifting / breathing background */}
      <motion.div
        className="absolute inset-[-12%]"
        style={{
          backgroundImage: `url(${bgSplash})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
        animate={{
          x: [0, 18, -12, 0],
          y: [0, -10, 8, 0],
          scale: [1.08, 1.14, 1.1, 1.08],
        }}
        transition={{ duration: 48, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Theme wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,40,110,0.45) 0%, rgba(12,70,150,0.22) 40%, rgba(10,50,120,0.35) 100%)",
        }}
      />

      {/* Soft light shimmer */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18), transparent 60%)",
        }}
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Swimming fish */}
      {fish.map((f) => (
        <motion.img
          key={f.id}
          src={f.img}
          alt=""
          className="absolute object-contain"
          style={{
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            left: 0,
          }}
          initial={false}
          animate={{
            x: f.direction === 1 ? ["-12%", "112%"] : ["112%", "-12%"],
            y: [0, -f.bob, f.bob * 0.6, 0],
            scaleX: f.direction,
          }}
          transition={{
            x: { duration: f.duration, repeat: Infinity, ease: "linear", delay: f.delay },
            y: { duration: 3.5 + (f.id % 3), repeat: Infinity, ease: "easeInOut", delay: f.delay },
            scaleX: { duration: 0 },
          }}
          draggable={false}
        />
      ))}

      {/* Rising bubbles */}
      {bubbles.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-full border border-white/45 bg-white/25"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: "-4%",
          }}
          animate={{ y: [0, "-120%"], opacity: [0.55, 0], x: [0, (b.id % 2 === 0 ? 18 : -14)] }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
