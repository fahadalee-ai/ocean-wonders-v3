import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { Character } from "@/data/oceans";
import { useKnockoutSrc } from "@/components/KnockoutImg";
import { GlossyButton } from "@/components/GlossyButton";
import { addDiscovery, getDiscoveries } from "@/lib/progress";
import { sparkleAt } from "@/lib/confetti";

export function CreatureModal({
  creature,
  onClose,
}: {
  creature: Character | null;
  onClose: () => void;
}) {
  const [discovered, setDiscovered] = useState(false);
  const creatureSrc = useKnockoutSrc(creature?.img ?? "");

  useEffect(() => {
    if (creature) {
      setDiscovered(getDiscoveries().includes(creature.id));
    }
  }, [creature]);

  return (
    <AnimatePresence>
      {creature && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: "rgba(11,61,145,0.5)" }} />
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="relative z-10 w-full max-w-md rounded-3xl border-4 border-white bg-white p-6 text-center shadow-[0_30px_60px_-12px_rgba(11,61,145,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white text-white shadow-lg"
              style={{ backgroundColor: "#FF6F61" }}
            >
              <X className="h-6 w-6" strokeWidth={3} />
            </button>

            <div className="mx-auto flex h-56 w-56 items-center justify-center">
              <motion.img
                src={creatureSrc || creature.img}
                alt={creature.name}
                width={512}
                height={512}
                className="max-h-full max-w-full object-contain"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <h2 className="mt-2 font-display text-4xl font-bold" style={{ color: "#0B3D91" }}>
              {creature.name}!
            </h2>

            {(creature.habitat || creature.diet) && (
              <p className="mt-2 text-sm font-bold" style={{ color: "#0B3D91" }}>
                {creature.habitat ? `Habitat: ${creature.habitat}` : ""}
                {creature.habitat && creature.diet ? " · " : ""}
                {creature.diet ? `Diet: ${creature.diet}` : ""}
              </p>
            )}

            <div
              className="relative mt-4 rounded-3xl border-4 border-white p-4 text-left text-lg font-semibold"
              style={{ backgroundColor: "#EAF7FF", color: "#0B3D91" }}
            >
              <div className="mb-1 font-display text-sm font-bold uppercase tracking-widest" style={{ color: "#FF6F61" }}>
                Fun Fact!
              </div>
              {creature.funFact}
            </div>

            <div className="mt-5 flex justify-center">
              <GlossyButton
                variant={discovered ? "blue" : "orange"}
                size="md"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (rect.left + rect.width / 2) / window.innerWidth;
                  const y = (rect.top + rect.height / 2) / window.innerHeight;
                  sparkleAt(x, y);
                  addDiscovery(creature.id);
                  setDiscovered(true);
                }}
              >
                <Star className={discovered ? "fill-current" : ""} strokeWidth={2.5} />
                {discovered ? "In my Discoveries!" : "Add to my Discoveries"}
              </GlossyButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
