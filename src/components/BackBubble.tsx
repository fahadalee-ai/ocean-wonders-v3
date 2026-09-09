import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export type RoundIconVariant = "orange" | "blue";

const VARIANT_STYLE: Record<RoundIconVariant, CSSProperties> = {
  orange: {
    background: "linear-gradient(180deg, #FFD36A 0%, #FF9A2E 50%, #FF7A12 100%)",
    boxShadow: "0 4px 0 #C85A10, 0 8px 14px rgba(10,40,90,0.25), inset 0 3px 0 rgba(255,255,255,0.55)",
  },
  blue: {
    background: "linear-gradient(180deg, #8CECFF 0%, #3EC6F5 50%, #1AA8E8 100%)",
    boxShadow: "0 4px 0 #0D6BA8, 0 8px 14px rgba(10,40,90,0.25), inset 0 3px 0 rgba(255,255,255,0.6)",
  },
};

const BASE_CLASS =
  "z-[90] inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-white " +
  "transition-transform active:translate-y-[1px] active:scale-95 sm:h-14 sm:w-14";

type RoundProps = {
  variant?: RoundIconVariant;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  className?: string;
  children: ReactNode;
};

/** Glossy round icon control (pause, etc.) — same shape as BackButton. */
export function RoundIconButton({
  variant = "orange",
  onClick,
  label,
  className = "",
  children,
}: RoundProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${BASE_CLASS} ${className}`.trim()}
      style={VARIANT_STYLE[variant]}
    >
      {children}
    </button>
  );
}

type BackProps = {
  to?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
};

/** Shared orange glossy back control — same style as Ocean level select. */
export function BackButton({ to, onClick, label = "Back", className = "" }: BackProps) {
  const cls = `${BASE_CLASS} ${className}`.trim();
  const icon = <ArrowLeft className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={3.5} />;

  if (to) {
    return (
      <Link to={to} aria-label={label} className={cls} style={VARIANT_STYLE.orange}>
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls} style={VARIANT_STYLE.orange}>
      {icon}
    </button>
  );
}

/** @deprecated Use BackButton */
export function BackBubble(props: BackProps & { to?: string }) {
  return <BackButton {...props} to={props.to ?? "/globe"} />;
}

/** Shared glass header panel style (ocean select + in-level). */
export const glassHeaderPanelStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(170,226,255,0.55) 100%)",
  borderColor: "rgba(255,255,255,0.9)",
  boxShadow: "0 10px 22px rgba(0,30,70,0.18), inset 0 1px 0 rgba(255,255,255,0.85)",
  backdropFilter: "blur(10px)",
};

/** Screen-edge padding for back button / headers — keep consistent across pages. */
export const PAGE_HEADER_PAD = "px-4 sm:px-6";
export const BACK_LEFT_CLASS = "absolute left-4 top-1/2 z-30 -translate-y-1/2 sm:left-6";

type TitleBarProps = {
  title: string;
  backTo: string;
  backLabel?: string;
};

/** Full-width title bar: back button flush to screen left with shared padding; title centered. */
export function PageTitleBar({ title, backTo, backLabel = "Back" }: TitleBarProps) {
  return (
    <header
      className={`relative z-20 flex w-full shrink-0 items-center justify-center py-2 ${PAGE_HEADER_PAD} pt-[max(0.75rem,env(safe-area-inset-top))]`}
    >
      <BackButton to={backTo} label={backLabel} className={BACK_LEFT_CLASS} />
      <h1
        className="pointer-events-none text-3xl uppercase tracking-wide text-white sm:text-5xl"
        style={{
          fontFamily: '"Luckiest Guy", sans-serif',
          WebkitTextStroke: "5px #0B3D91",
          paintOrder: "stroke fill",
          textShadow: "0 4px 0 #fff, 0 8px 16px rgba(0,30,70,0.25)",
        }}
      >
        {title}
      </h1>
    </header>
  );
}
