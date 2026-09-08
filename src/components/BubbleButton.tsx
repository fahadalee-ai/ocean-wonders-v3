import type { ButtonHTMLAttributes, ReactNode } from "react";
import { GlossyButton, type GlossySize, type GlossyVariant } from "@/components/GlossyButton";

type LegacyVariant = "coral" | "sunshine" | "seafoam" | "ocean" | "sand";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  variant?: LegacyVariant;
  size?: "md" | "lg" | "xl";
  children: ReactNode;
};

/** Maps old BubbleButton variants onto the shared Splash glossy style. */
function toGlossy(variant: LegacyVariant): GlossyVariant {
  if (variant === "coral" || variant === "sunshine" || variant === "sand") return "orange";
  return "blue";
}

function toSize(size: "md" | "lg" | "xl"): GlossySize {
  return size;
}

/**
 * @deprecated Prefer GlossyButton directly — kept as a thin wrapper for existing call sites.
 */
export function BubbleButton({
  variant = "coral",
  size = "lg",
  className = "",
  children,
  type = "button",
  onClick,
  disabled,
  ..._rest
}: Props) {
  const fullWidth = className.includes("w-full");
  return (
    <GlossyButton
      variant={toGlossy(variant)}
      size={toSize(size)}
      type={type}
      onClick={onClick}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
    >
      {children}
    </GlossyButton>
  );
}
