import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import logo from "@/assets/Logo.png";
import mascot from "@/assets/mascot-turtle.png";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { GlossyButton } from "@/components/GlossyButton";
import { ProfileModal } from "@/components/ProfileModal";
import { SoundToggle } from "@/components/SoundToggle";
import {
  deleteAccountData,
  getProfile,
  isOnboarded,
  logoutProfile,
  type Profile,
} from "@/lib/progress";
import { playSfx } from "@/lib/sfx";
import { COPY } from "@/data/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ocean Wonders — Discovering God's Undersea World" },
      {
        name: "description",
        content:
          "A joyful ocean adventure for kids — explore the five oceans of the world, unlock levels, and meet amazing sea creatures!",
      },
      { property: "og:title", content: "Ocean Wonders" },
      {
        property: "og:description",
        content: "Discovering God's Undersea World — unlock oceans, clear levels, and meet sea creatures.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setReady(true);
    setProfile(getProfile());
    const t = window.setTimeout(() => setShowButtons(true), 2200);
    return () => window.clearTimeout(t);
  }, []);

  const playPath = ready && isOnboarded() ? "/globe" : "/onboarding";

  function refreshProfile() {
    setProfile(getProfile());
  }

  function handleLogout() {
    logoutProfile();
    refreshProfile();
    setProfileOpen(false);
    navigate({ to: "/login" });
  }

  function handleDelete() {
    const ok =
      typeof window !== "undefined" &&
      window.confirm("Delete your account and all progress? This cannot be undone.");
    if (!ok) return;
    deleteAccountData();
    refreshProfile();
    setProfileOpen(false);
    navigate({ to: "/register" });
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#1E8BC8" }}>
      <AuthOceanBackground fishCount={14} />

      <SoundToggle className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-20 sm:left-5" />

      <button
        type="button"
        aria-label="Profile"
        onClick={() => {
          refreshProfile();
          setProfileOpen(true);
        }}
        className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-20 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white shadow-lg sm:right-5 sm:h-12 sm:w-12"
        style={{
          background: "linear-gradient(180deg, #FFB347 0%, #FF8C2A 45%, #F06A12 100%)",
          boxShadow: "0 5px 0 #C44A10, 0 10px 18px rgba(0,20,60,0.35), inset 0 2px 0 rgba(255,255,255,0.4)",
        }}
      >
        <User className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
      </button>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-row items-center gap-6 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:gap-10 sm:px-8 lg:gap-14">
        <motion.div
          className="relative flex min-w-0 flex-1 items-center justify-center"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.img
            src={logo}
            alt={COPY.appName}
            className="w-[min(42vw,380px)] max-h-[58dvh] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
            draggable={false}
            initial={{ scale: 0.4, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.15 }}
          />
          <motion.img
            src={mascot}
            alt=""
            className="pointer-events-none absolute -bottom-2 right-[4%] w-[min(16vw,120px)] object-contain"
            draggable={false}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: [0, -8, 0], rotate: [0, -8, 8, 0] }}
            transition={{
              opacity: { delay: 0.45, duration: 0.35 },
              y: { delay: 0.6, duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              rotate: { delay: 0.6, duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </motion.div>

        <motion.div
          className="flex w-[min(100%,320px)] shrink-0 flex-col items-center justify-center gap-3 sm:gap-3.5"
          initial={{ opacity: 0, y: 24 }}
          animate={showButtons ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.4 }}
        >
          <GlossyButton
            variant="orange"
            to={playPath}
            onClick={() => playSfx("tap")}
          >
            {COPY.playGame}
          </GlossyButton>
          <GlossyButton variant="blue" to="/sea-life" onClick={() => playSfx("tap")}>
            {COPY.aboutOceanLife}
          </GlossyButton>
          <GlossyButton variant="blue" to="/shop" onClick={() => playSfx("tap")}>
            {COPY.shop}
          </GlossyButton>
        </motion.div>
      </div>

      <ProfileModal
        open={profileOpen}
        profile={profile}
        onClose={() => setProfileOpen(false)}
        onLogout={handleLogout}
        onDelete={handleDelete}
        onSignIn={() => {
          setProfileOpen(false);
          navigate({ to: "/login" });
        }}
      />
    </main>
  );
}
