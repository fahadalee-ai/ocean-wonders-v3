import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { GlossyButton } from "@/components/GlossyButton";
import { avatarSrc } from "@/lib/avatars";
import type { Profile } from "@/lib/progress";

type Props = {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
  onLogout: () => void;
  onDelete: () => void;
  onSignIn: () => void;
};

/**
 * Splash profile popup — glass navy panel matching project theme.
 */
export function ProfileModal({ open, profile, onClose, onLogout, onDelete, onSignIn }: Props) {
  const name = profile?.nickname?.trim() || profile?.parent?.trim() || "Explorer";
  const email = profile?.email?.trim() || "";
  const loggedIn = !!profile;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(6,24,70,0.6)" }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="relative z-10 w-full max-w-md rounded-3xl border-2 px-6 py-5 text-center sm:max-w-lg sm:px-8 sm:py-6"
            style={{
              background: "linear-gradient(160deg, rgba(8,40,110,0.96) 0%, rgba(20,70,150,0.94) 100%)",
              borderColor: "rgba(94,212,255,0.6)",
              boxShadow: "0 28px 56px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[3px] border-white sm:h-28 sm:w-28"
              style={{
                background: "linear-gradient(180deg, #FFE566 0%, #FFB347 100%)",
                boxShadow: "0 6px 0 #C44A10, 0 12px 20px rgba(0,20,60,0.3)",
              }}
            >
              {loggedIn ? (
                <img
                  src={avatarSrc(profile.avatar)}
                  alt=""
                  className="h-[82%] w-[82%] object-contain"
                  draggable={false}
                />
              ) : (
                <User className="h-12 w-12 text-white sm:h-14 sm:w-14" strokeWidth={2.5} />
              )}
            </div>

            <h2
              id="profile-modal-title"
              className="mt-4 font-display text-3xl font-bold uppercase text-white sm:text-4xl"
              style={{ textShadow: "0 2px 0 rgba(0,40,90,0.35)" }}
            >
              {name}
            </h2>

            {email ? (
              <p className="mt-1 text-sm font-semibold sm:text-base" style={{ color: "#5ED4FF" }}>
                {email}
              </p>
            ) : (
              <p className="mt-1 text-sm font-semibold text-white/70">
                {loggedIn ? "Ocean explorer" : "Sign in to save your adventure"}
              </p>
            )}

            <div className="mt-6 flex flex-col items-center gap-3">
              {loggedIn ? (
                <>
                  <GlossyButton variant="orange" size="lg" fullWidth onClick={onLogout}>
                    Logout
                  </GlossyButton>
                  <GlossyButton variant="orange" size="lg" fullWidth onClick={onDelete}>
                    Delete Account
                  </GlossyButton>
                </>
              ) : (
                <>
                  <GlossyButton variant="orange" size="lg" fullWidth onClick={onSignIn}>
                    Sign In
                  </GlossyButton>
                  <GlossyButton variant="blue" size="lg" fullWidth to="/register">
                    Create Account
                  </GlossyButton>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 font-display text-base font-bold uppercase tracking-wide underline decoration-2 underline-offset-4"
              style={{ color: "#5ED4FF" }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
