import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { GlossyButton } from "@/components/GlossyButton";
import { markOnboarded } from "@/lib/progress";
import bgSplash from "@/assets/new-bg.jpg";
import char1 from "@/assets/Characters_1.png";
import char2 from "@/assets/Characters_2.png";
import char4 from "@/assets/Characters_4.png";
import char7 from "@/assets/Characters_7.png";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome, Explorer! — Ocean Wonders" },
      {
        name: "description",
        content: "Learn how to explore the five oceans, unlock levels, and meet sea creatures.",
      },
      { property: "og:title", content: "Welcome to Ocean Wonders" },
      { property: "og:description", content: "A quick tour before you dive in!" },
    ],
  }),
  component: Onboarding,
});

type Slide = {
  heading: string;
  body: string;
  img: string;
};

const SLIDES: Slide[] = [
  {
    heading: "Welcome, Explorer!",
    body: "Get ready to swim through the five oceans of the world and meet the coolest sea creatures on Earth!",
    img: char7,
  },
  {
    heading: "Choose an Ocean!",
    body: "Start with the sunny Pacific Ocean, then unlock Atlantic, Indian, Southern, and Arctic as you go!",
    img: char1,
  },
  {
    heading: "Clear Levels!",
    body: "Each ocean has five Shadow Match levels plus a star Speed Challenge. Finish one to unlock the next!",
    img: char2,
  },
  {
    heading: "Meet, Match & Race!",
    body: "Meet every fish first, drag them onto their shadows, then race the clock in the Speed Challenge!",
    img: char4,
  },
];

function Onboarding() {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[idx]!;
  const last = idx === SLIDES.length - 1;

  function finish() {
    markOnboarded();
    navigate({ to: "/login" });
  }

  return (
    <main
      className="relative flex h-dvh flex-col overflow-hidden"
      style={{
        backgroundColor: "#0A2F7A",
        backgroundImage: `url(${bgSplash})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,40,110,0.6) 0%, rgba(12,70,150,0.3) 45%, rgba(20,110,180,0.2) 100%)",
        }}
      />

      {/* Soft rising bubbles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-white/40 bg-white/20"
            style={{
              width: 6 + (i % 4) * 5,
              height: 6 + (i % 4) * 5,
              left: `${10 + ((i * 8) % 80)}%`,
              bottom: "-5%",
            }}
            animate={{ y: [0, -850], opacity: [0.5, 0] }}
            transition={{
              duration: 7 + (i % 4),
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <Link
        to="/login"
        onClick={() => markOnboarded()}
        className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 rounded-full border-2 border-white/80 bg-white/90 px-4 py-2 font-display text-sm font-bold shadow-md sm:right-5"
        style={{ color: "#0B3D91" }}
      >
        Skip →
      </Link>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-row items-center gap-6 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:gap-10 sm:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.28 }}
            className="flex min-w-0 flex-1 items-center justify-center"
          >
            <div
              className="flex h-[min(52dvh,240px)] w-[min(52dvh,240px)] items-center justify-center rounded-[2rem] border-4 border-white bg-white/95 shadow-2xl sm:h-[min(58dvh,280px)] sm:w-[min(58dvh,280px)]"
              style={{ boxShadow: "0 16px 40px rgba(0,30,80,0.35)" }}
            >
              <img
                src={slide.img}
                alt=""
                width={220}
                height={220}
                className="max-h-[85%] max-w-[85%] object-contain"
                draggable={false}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex w-[min(100%,380px)] shrink-0 flex-col items-center text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`copy-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1
                className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                style={{ textShadow: "0 3px 0 rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.3)" }}
              >
                {slide.heading}
              </h1>
              <p
                className="mt-3 text-base font-bold text-white/95 sm:text-lg"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
              >
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex gap-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIdx(i)}
                className="h-3 rounded-full transition-all"
                style={{
                  width: i === idx ? 36 : 12,
                  backgroundColor: i === idx ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                  boxShadow: i === idx ? "0 2px 8px rgba(0,0,0,0.25)" : undefined,
                }}
              />
            ))}
          </div>

          <div className="mt-5 w-full max-w-[340px]">
            {last ? (
              <GlossyButton variant="orange" size="lg" onClick={finish} fullWidth>
                Start My Adventure!
              </GlossyButton>
            ) : (
              <GlossyButton variant="blue" size="lg" onClick={() => setIdx(idx + 1)} fullWidth>
                Next →
              </GlossyButton>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
