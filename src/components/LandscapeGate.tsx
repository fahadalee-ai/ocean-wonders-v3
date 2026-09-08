import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

function isLandscapeViewport() {
  if (typeof window === "undefined") return true;
  // Prefer CSS orientation; fall back to aspect ratio (covers tablets / desktop)
  if (window.matchMedia("(orientation: landscape)").matches) return true;
  return window.innerWidth >= window.innerHeight;
}

async function tryLockLandscape() {
  try {
    const orientation = window.screen?.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    if (orientation && typeof orientation.lock === "function") {
      await orientation.lock("landscape");
      return;
    }
  } catch {
    /* Browser may require fullscreen / installed PWA — rotate prompt covers this. */
  }

  try {
    // Legacy Android webview API
    const legacy = window.screen as Screen & {
      lockOrientation?: (o: string) => boolean;
      mozLockOrientation?: (o: string) => boolean;
      msLockOrientation?: (o: string) => boolean;
    };
    const lock =
      legacy.lockOrientation || legacy.mozLockOrientation || legacy.msLockOrientation;
    lock?.call(window.screen, "landscape");
  } catch {
    /* ignore */
  }
}

/**
 * App-wide landscape lock.
 * Attempts Screen Orientation API; when the device is portrait, shows a friendly
 * "Turn me sideways" overlay until landscape is restored.
 */
export function LandscapeGate({ children }: { children: ReactNode }) {
  const [landscape, setLandscape] = useState(true);

  useEffect(() => {
    const sync = () => setLandscape(isLandscapeViewport());
    sync();
    void tryLockLandscape();

    // Kill page scroll / scrollbar gutter that shows as a black strip on the right
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.scrollTop = 0;
    body.scrollTop = 0;

    const mq = window.matchMedia("(orientation: landscape)");
    const onChange = () => {
      sync();
      if (isLandscapeViewport()) void tryLockLandscape();
      html.scrollTop = 0;
      body.scrollTop = 0;
    };

    mq.addEventListener?.("change", onChange);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", onChange);

    // Retry lock after a tap (some browsers only allow lock on gesture)
    const onGesture = () => {
      void tryLockLandscape();
    };
    window.addEventListener("pointerdown", onGesture, { once: true });

    return () => {
      mq.removeEventListener?.("change", onChange);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", onChange);
      window.removeEventListener("pointerdown", onGesture);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <>
      <div
        className="landscape-app-root h-dvh max-h-dvh w-full max-w-full overflow-hidden"
        aria-hidden={!landscape}
        style={{
          visibility: landscape ? "visible" : "hidden",
          pointerEvents: landscape ? "auto" : "none",
          backgroundColor: "#061846",
          contain: "paint",
        }}
      >
        {children}
      </div>

      {!landscape && <RotateToLandscapePrompt />}
    </>
  );
}

function RotateToLandscapePrompt() {
  return (
    <div
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-center px-6 text-center"
      style={{
        background:
          "linear-gradient(160deg, #061846 0%, #0A2F7A 45%, #1256A8 100%)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rotate-title"
    >
      <motion.div
        className="relative mb-6 flex h-28 w-16 items-center justify-center rounded-2xl border-[3px] border-white bg-white/15 sm:h-32 sm:w-[4.5rem]"
        style={{ boxShadow: "0 12px 28px rgba(0,15,50,0.45)" }}
        animate={{ rotate: [0, 90, 90, 0] }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.35, 0.65, 1],
        }}
        aria-hidden
      >
        <span className="absolute top-2 h-1.5 w-8 rounded-full bg-white/70" />
        <span className="font-display text-2xl text-white">🌊</span>
      </motion.div>

      <h1
        id="rotate-title"
        className="font-display text-3xl font-bold text-white sm:text-4xl"
        style={{ textShadow: "0 3px 0 rgba(0,20,60,0.35)" }}
      >
        Turn me sideways to play!
      </h1>
      <p className="mt-3 max-w-sm text-base font-bold text-white/85 sm:text-lg">
        Ocean Wonders is made for landscape — rotate your device and the adventure continues.
      </p>
    </div>
  );
}
