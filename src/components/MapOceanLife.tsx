import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import char1 from "@/assets/Characters_1.png";
import char2 from "@/assets/Characters_2.png";
import char3 from "@/assets/Characters_3.png";
import char4 from "@/assets/Characters_4.png";
import char6 from "@/assets/Characters_6.png";
import char7 from "@/assets/Characters_7.png";
import char8 from "@/assets/Characters_8.png";

const FISH_IMGS = [char1, char2, char3, char4, char6, char7, char8];

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
  drift: number;
};

/** Soft swimming fish + rising bubbles for the world-map home. */
export function MapOceanLife({ fishCount = 6, bubbleCount = 16 }: { fishCount?: number; bubbleCount?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fish = useMemo(() => {
    if (!mounted) return [] as SwimFish[];
    return Array.from({ length: fishCount }).map((_, i) => {
      const direction: 1 | -1 = i % 2 === 0 ? 1 : -1;
      return {
        id: i,
        img: FISH_IMGS[i % FISH_IMGS.length]!,
        top: 18 + ((i * 13) % 58),
        size: 36 + (i % 4) * 14,
        duration: 18 + (i % 5) * 5,
        delay: -(i * 2.1),
        direction,
        opacity: 0.55 + (i % 3) * 0.12,
        bob: 6 + (i % 3) * 4,
      };
    });
  }, [mounted, fishCount]);

  const bubbles = useMemo(() => {
    if (!mounted) return [] as Bubble[];
    return Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      left: 4 + ((i * 11) % 92),
      size: 6 + (i % 5) * 3.5,
      duration: 7 + (i % 6) * 2.2,
      delay: i * 0.45,
      drift: i % 2 === 0 ? 16 : -14,
    }));
  }, [mounted, bubbleCount]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
      style={{ contain: "paint" }}
      aria-hidden
    >
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
            // Stay within the clipped parent — avoid 100vw+ which can open a page scrollbar
            x: f.direction === 1 ? ["-12%", "112%"] : ["112%", "-12%"],
            y: [0, -f.bob, f.bob * 0.55, 0],
            scaleX: f.direction,
          }}
          transition={{
            x: { duration: f.duration, repeat: Infinity, ease: "linear", delay: f.delay },
            y: {
              duration: 3.2 + (f.id % 3) * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: f.delay,
            },
            scaleX: { duration: 0 },
          }}
          draggable={false}
        />
      ))}

      {bubbles.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-full border border-white/50 bg-white/30"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: "-5%",
            boxShadow: "inset 0 0 4px rgba(255,255,255,0.55)",
          }}
          animate={{
            y: [0, "-105%"],
            opacity: [0.15, 0.7, 0],
            x: [0, b.drift],
          }}
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
