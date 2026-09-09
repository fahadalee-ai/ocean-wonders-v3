import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, toggleMuted } from "@/lib/progress";
import { playSfx } from "@/lib/sfx";

export function SoundToggle({ className = "" }: { className?: string }) {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
  }, []);

  return (
    <button
      type="button"
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      onClick={() => {
        const next = toggleMuted();
        setMutedState(next);
        if (!next) playSfx("tap");
      }}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white sm:h-12 sm:w-12 ${className}`}
      style={{
        background: "linear-gradient(180deg, #5ED4FF 0%, #1A8FD4 100%)",
        boxShadow: "0 4px 0 #0E5A9A, 0 8px 14px rgba(0,20,60,0.3), inset 0 2px 0 rgba(255,255,255,0.4)",
      }}
    >
      {muted ? (
        <VolumeX className="h-5 w-5 text-white" strokeWidth={2.6} />
      ) : (
        <Volume2 className="h-5 w-5 text-white" strokeWidth={2.6} />
      )}
    </button>
  );
}
