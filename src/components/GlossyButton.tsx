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
  fullWidth?: boolean;
};

const SIZE: Record<GlossySize, { padding: string; minHeight: number; radius: number }> = {
  sm: { padding: "px-4 py-1.5 text-sm sm:text-base", minHeight: 40, radius: 22 },
  md: { padding: "px-5 py-2 text-base sm:text-lg", minHeight: 46, radius: 26 },
  lg: { padding: "px-7 py-3 text-lg sm:text-xl", minHeight: 56, radius: 32 },
  xl: { padding: "px-8 py-3.5 text-xl sm:text-2xl", minHeight: 64, radius: 36 },
};

/** Candy bubble CTA — glossy highlight, thick white rim, no old stripe chrome. */
export function glossyButtonStyle(variant: GlossyVariant = "blue", size: GlossySize = "lg"): CSSProperties {
  const isOrange = variant === "orange";
  return {
    minHeight: SIZE[size].minHeight,
    borderRadius: SIZE[size].radius,
    border: "4px solid #FFFFFF",
    background: isOrange
      ? "linear-gradient(180deg, #FFD36A 0%, #FF9A2E 42%, #FF7A12 100%)"
      : "linear-gradient(180deg, #8CECFF 0%, #3EC6F5 48%, #1AA8E8 100%)",
    boxShadow: isOrange
      ? "0 5px 0 #C85A10, 0 12px 22px rgba(10,40,90,0.28), inset 0 3px 0 rgba(255,255,255,0.55)"
      : "0 5px 0 #0D6BA8, 0 12px 22px rgba(10,40,90,0.28), inset 0 3px 0 rgba(255,255,255,0.6)",
    color: "#FFFFFF",
    WebkitTextStroke: "3px #0B3D91",
    paintOrder: "stroke fill",
    textShadow: "0 2px 0 rgba(255,255,255,0.25)",
    fontFamily: '"Baloo 2", ui-rounded, sans-serif',
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
  const widthClass = fullWidth ? "w-full max-w-none" : hasCustomMax ? "w-full" : "w-full max-w-[320px]";

  const baseClass =
    `relative inline-flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap ${padding} ${widthClass} ` +
    "font-bold uppercase tracking-wide " +
    "transition-transform active:translate-y-[2px] active:scale-[0.98] disabled:opacity-60 " +
    className;

  const style = glossyButtonStyle(variant, size);

  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[12%] top-[8%] h-[38%] rounded-full"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0))" }}
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
