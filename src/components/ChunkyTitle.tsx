import { motion } from "framer-motion";
import type { ReactNode } from "react";

const LETTER_COLORS = ["#2EC4F1", "#3DDC97", "#FF8C2A", "#FF6B9D", "#7C6BFF", "#FFD93D", "#5ED4FF"];

type Props = {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-[1.35rem] sm:text-2xl",
  md: "text-3xl sm:text-4xl",
  lg: "text-4xl sm:text-5xl md:text-6xl",
  xl: "text-5xl sm:text-6xl",
};

/** Gold lockup like the world-map title — yellow fill, navy stroke, thick white rim. */
export function GoldTitle({ text, className = "", size = "md" }: { text: string; className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <h1
      className={`text-center uppercase leading-[0.95] tracking-wide ${SIZE[size]} ${className}`}
      style={{
        fontFamily: '"Luckiest Guy", "Baloo 2", sans-serif',
        color: "#FFD24A",
        WebkitTextStroke: "5px #0B3D91",
        paintOrder: "stroke fill",
        textShadow:
          "-3px -3px 0 #fff, 3px -3px 0 #fff, -3px 3px 0 #fff, 3px 3px 0 #fff, 0 5px 0 #fff, 0 10px 16px rgba(0,20,60,0.3)",
      }}
    >
      {text}
    </h1>
  );
}

/** Bubble display title — Luckiest Guy, candy fills, white + navy outlines. */
export function ChunkyTitle({ text, className = "", size = "lg", animate = true }: Props) {
  return (
    <span
      className={`inline-flex flex-wrap justify-center leading-none ${SIZE[size]} ${className}`}
      style={{ fontFamily: '"Luckiest Guy", "Baloo 2", sans-serif', paintOrder: "stroke fill" }}
    >
      {Array.from(text).map((ch, i) => {
        const space = ch === " ";
        return (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block"
            initial={animate ? { scale: 0.35, y: 12, opacity: 0 } : false}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{
              delay: animate ? 0.035 * i : 0,
              type: "spring",
              stiffness: 520,
              damping: 16,
            }}
            style={{
              color: space ? "transparent" : LETTER_COLORS[i % LETTER_COLORS.length],
              WebkitTextStroke: space ? undefined : "6px #0B3D91",
              textShadow: space
                ? undefined
                : "0 0 0 3px #fff, 0 4px 0 rgba(255,255,255,0.85), 0 8px 14px rgba(0,30,70,0.28)",
              width: space ? "0.32em" : undefined,
            }}
          >
            {space ? "\u00a0" : ch}
          </motion.span>
        );
      })}
    </span>
  );
}

export function FrostedPill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#0B3D91] sm:text-sm ${className}`}
      style={{
        fontFamily: '"Baloo 2", sans-serif',
        background: "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(186,232,255,0.7) 100%)",
        borderColor: "rgba(255,255,255,0.95)",
        boxShadow: "0 4px 10px rgba(0,40,90,0.16), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {children}
    </span>
  );
}
