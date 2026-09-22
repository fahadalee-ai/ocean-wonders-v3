import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import sceneReef from "@/assets/new-bg.jpg";
import char1 from "@/assets/Characters_1.png";
import char2 from "@/assets/new/Clownfish.png";
import char3 from "@/assets/Characters_3.png";
import char4 from "@/assets/Characters_4.png";
import char5 from "@/assets/Characters_5.png";
import char6 from "@/assets/Characters_6.png";
import char7 from "@/assets/Characters_7.png";
import char8 from "@/assets/Characters_8.png";
import char9 from "@/assets/Characters_9.png";

/** Native art facing: 1 = looks right (swim LTR), -1 = looks left (swim RTL). Never flip the sprite. */
const FISH_SPRITES: { img: string; face: 1 | -1 }[] = [
  { img: char1, face: -1 }, // whale — faces left
  { img: char2, face: 1 }, // clownfish — faces right
  { img: char3, face: 1 }, // crab — front-facing, drift LTR
  { img: char4, face: -1 }, // dolphin — faces left
  { img: char5, face: 1 }, // octopus — faces right
  { img: char6, face: -1 }, // seahorse — faces left
  { img: char7, face: -1 }, // turtle — faces left
  { img: char8, face: -1 }, // shark — faces left
  { img: char9, face: 1 }, // orca — faces right
];

/** Distinct size bands so the school fills the screen (tiny → hero). */
const SIZE_VW = [4.2, 5.5, 7, 8.5, 10.5, 13, 16, 6.2, 11.5, 14.5, 5, 9, 12, 7.8];

type SwimFish = {
  id: number;
  img: string;
  face: 1 | -1;
  top: number;
  sizeVw: number;
  duration: number;
  delay: number;
  opacity: number;
  bob: number;
  z: number;
};

/**
 * Illustrated reef backdrop + full-screen fish that swim the way their art faces.
 */
export function AuthOceanBackground({ fishCount = 14 }: { fishCount?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fish = useMemo(() => {
    if (!mounted) return [] as SwimFish[];
    return Array.from({ length: fishCount }).map((_, i) => {
      const sizeVw = SIZE_VW[i % SIZE_VW.length]!;
      const sprite = FISH_SPRITES[i % FISH_SPRITES.length]!;
      const large = sizeVw >= 11;
      return {
        id: i,
        img: sprite.img,
        face: sprite.face,
        top: 6 + ((i * 17 + (i % 3) * 7) % 78),
        sizeVw,
        duration: large ? 42 + (i % 3) * 8 : 28 + (i % 5) * 6,
        delay: -(i * 2.8),
        opacity: large ? 0.95 : 0.55 + (i % 4) * 0.1,
        bob: 5 + (i % 5) * 3,
        z: large ? 6 : 3 + (i % 3),
      };
    });
  }, [mounted, fishCount]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ contain: "paint" }} aria-hidden>
      <div className="absolute inset-0" style={{ backgroundColor: "#1E8BC8" }} />
      <img
        src={sceneReef}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
      {[18, 40, 62, 80].map((left, i) => (
        <motion.div
          key={left}
          className="absolute top-0 h-[70%] origin-top"
          style={{
            left: `${left}%`,
            width: i % 2 === 0 ? 64 : 36,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(200,235,255,0.08) 45%, transparent 85%)",
            transform: `skewX(${i % 2 === 0 ? -12 : -18}deg)`,
            filter: "blur(1.5px)",
          }}
          animate={{ opacity: [0.25, 0.55, 0.3] }}
          transition={{ duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {fish.map((f) => (
        <motion.img
          key={f.id}
          src={f.img}
          alt=""
          className="absolute object-contain"
          style={{
            top: `${f.top}%`,
            width: `${f.sizeVw}vw`,
            height: "auto",
            opacity: f.opacity,
            left: 0,
            zIndex: f.z,
            filter: f.sizeVw < 7 ? "saturate(0.85) brightness(1.05)" : undefined,
          }}
          animate={{
            x: f.face === 1 ? ["-22vw", "118vw"] : ["118vw", "-22vw"],
            y: [0, -f.bob, f.bob * 0.6, 0],
          }}
          transition={{
            x: { duration: f.duration, repeat: Infinity, ease: "linear", delay: f.delay },
            y: { duration: 4.8 + (f.id % 4) * 0.6, repeat: Infinity, ease: "easeInOut", delay: f.delay },
          }}
          draggable={false}
        />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${5 + ((i * 6) % 90)}%`,
            width: 7 + (i % 5) * 4,
            height: 7 + (i % 5) * 4,
            animationDuration: `${8 + (i % 5) * 2}s`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}
