import { Link } from "@tanstack/react-router";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

export type GlossyVariant = "orange" | "blue";
export type GlossySize = "sm" | "md" | "lg" | "xl";

type Props = {
  children: ReactNode;
  variant?: GlossyVariant;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  to?: string;
  className?: string;
  size?: GlossySize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  /** Stretch to container width (drops the default max-width). */
  fullWidth?: boolean;
};

const SIZE: Record<GlossySize, { padding: string; minHeight: number }> = {
  sm: { padding: "px-4 py-2 text-sm sm:text-base", minHeight: 42 },
  md: { padding: "px-5 py-2.5 text-base sm:text-lg", minHeight: 48 },
  lg: { padding: "px-6 py-4 text-lg sm:text-xl", minHeight: 58 },
  xl: { padding: "px-8 py-4 text-xl sm:text-2xl", minHeight: 64 },
};

/** Shared glossy pill look (Splash / auth / game CTAs). */
export function glossyButtonStyle(variant: GlossyVariant = "blue", size: GlossySize = "lg"): CSSProperties {
  const isOrange = variant === "orange";
  return {
    minHeight: SIZE[size].minHeight,
    border: isOrange ? "3px solid #E85A1A" : "3px solid #1A6BB5",
    background: isOrange
      ? "linear-gradient(180deg, #FFB347 0%, #FF8C2A 45%, #F06A12 100%)"
      : "linear-gradient(180deg, #5ED4FF 0%, #2EB8F0 45%, #1A8FD4 100%)",
    boxShadow: isOrange
      ? "0 6px 0 #C44A10, 0 10px 20px rgba(0,40,90,0.35), inset 0 2px 0 rgba(255,255,255,0.45)"
      : "0 6px 0 #0E5A9A, 0 10px 20px rgba(0,40,90,0.35), inset 0 2px 0 rgba(255,255,255,0.4)",
    textShadow: "0 2px 0 rgba(0,0,0,0.25)",
  };
}

export function GlossyButton({
  children,
  variant = "blue",
  onClick,
  to,
  className = "",
  size = "lg",
  type = "button",
  disabled = false,
  fullWidth = false,
}: Props) {
  const { padding } = SIZE[size];
  const hasCustomMax = /\bmax-w-/.test(className) || fullWidth;
  const widthClass = fullWidth
    ? "w-full max-w-none"
    : hasCustomMax
      ? "w-full"
      : "w-full max-w-[320px]";

  const baseClass =
    `relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full whitespace-nowrap ${padding} ${widthClass} ` +
    "font-display font-bold uppercase tracking-wide text-white " +
    "transition-transform active:translate-y-[2px] active:scale-[0.98] disabled:opacity-60 " +
    className;

  const style = glossyButtonStyle(variant, size);

  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.35) 8px, rgba(255,255,255,0.35) 16px)",
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-1.5">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClass} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={baseClass} style={style}>
      {inner}
    </button>
  );
}
