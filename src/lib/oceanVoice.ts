import { useMemo } from "react";

/**
 * Per-ocean name VO clips.
 * Drop files into `src/assets/audio/` and wire the URLs below.
 * Until then, the UI shows a speech-bubble caption fallback.
 */
export const OCEAN_VOICE_SRC: Record<string, string | undefined> = {
  // pacific: new URL("../assets/audio/pacific-ocean-name.mp3", import.meta.url).href,
  pacific: undefined,
  atlantic: undefined,
  indian: undefined,
  arctic: undefined,
  southern: undefined,
};

let activeAudio: HTMLAudioElement | null = null;

/** Play ocean name VO if available. Returns whether audio actually started. */
export function playOceanNameVoice(oceanId: string): boolean {
  const src = OCEAN_VOICE_SRC[oceanId];
  if (!src || typeof window === "undefined") return false;

  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    const audio = new Audio(src);
    activeAudio = audio;
    void audio.play().catch(() => {
      /* autoplay / missing file — caller shows caption fallback */
    });
    return true;
  } catch {
    return false;
  }
}

export function useOceanVoiceReady() {
  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(OCEAN_VOICE_SRC).map(([id, src]) => [id, !!src]),
      ) as Record<string, boolean>,
    [],
  );
}
