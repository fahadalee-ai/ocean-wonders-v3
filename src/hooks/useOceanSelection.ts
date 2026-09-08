import { useCallback, useState } from "react";
import { playOceanNameVoice } from "@/lib/oceanVoice";

export type OceanRegionId =
  | "pacific"
  | "atlantic"
  | "indian"
  | "southern"
  | "arctic";

/**
 * Shared ocean-selection state for Home (/globe) and later Ocean → Levels flows.
 */
export function useOceanSelection(options?: {
  /** Play name VO + allow callers to show caption UI */
  announce?: boolean;
}) {
  const announce = options?.announce ?? true;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rippleKey, setRippleKey] = useState(0);

  const selectOcean = useCallback(
    (oceanId: string, unlocked: boolean) => {
      if (!unlocked) return false;
      setSelectedId(oceanId);
      setRippleKey((k) => k + 1);
      if (announce) playOceanNameVoice(oceanId);
      return true;
    },
    [announce],
  );

  const clearSelection = useCallback(() => setSelectedId(null), []);

  return {
    selectedId,
    rippleKey,
    selectOcean,
    clearSelection,
    setSelectedId,
  };
}
