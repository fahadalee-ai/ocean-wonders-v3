import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Lock, Star } from "lucide-react";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { PageTitleBar } from "@/components/BackBubble";
import { GlossyButton } from "@/components/GlossyButton";
import { COPY, SHOP_ITEMS } from "@/data/content";
import { OCEANS } from "@/data/oceans";
import {
  getBadges,
  getCoins,
  getOwnedItems,
  hasItem,
  ownItem,
  spendCoins,
} from "@/lib/progress";
import { playSfx } from "@/lib/sfx";
import char3 from "@/assets/Characters_3.png";
import mascot from "@/assets/mascot-turtle.png";
import bgPacific from "@/assets/bg-pacific.jpg";
import bgArctic from "@/assets/bg-arctic.jpg";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Ocean Wonders" },
      {
        name: "description",
        content: "Spend stars and coins on mascots, backgrounds, and sticker packs.",
      },
    ],
  }),
  component: ShopPage,
});

const COVERS: Record<string, string> = {
  "mascot-crab": char3,
  "mascot-turtle": mascot,
  "bg-sunset-reef": bgPacific,
  "bg-ice-glow": bgArctic,
  "stickers-reef": char3,
  "stickers-ice": mascot,
};

function ShopPage() {
  const [coins, setCoins] = useState(0);
  const [owned, setOwned] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCoins(getCoins());
    setOwned(getOwnedItems());
    setBadges(getBadges());
  }, []);

  function buy(id: string, cost: number) {
    if (hasItem(id)) return;
    if (!spendCoins(cost)) {
      playSfx("bounce");
      setMessage("Need a few more coins — finish a level to earn some!");
      return;
    }
    ownItem(id);
    setOwned(getOwnedItems());
    setCoins(getCoins());
    playSfx("star");
    setMessage("Yay! Added to your collection.");
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#1E8BC8" }}>
      <AuthOceanBackground fishCount={6} />

      <PageTitleBar title={COPY.shop} backTo="/" />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-sm font-bold text-white"
            style={{ background: "rgba(6,24,70,0.7)", borderColor: "rgba(94,212,255,0.45)" }}
          >
            <Star className="h-4 w-4" fill="#FFE566" color="#FFE566" />
            {coins} coins
          </span>
          {message && <p className="text-xs font-semibold text-white/80">{message}</p>}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto pb-2 sm:grid-cols-3 lg:grid-cols-6">
          {SHOP_ITEMS.map((item, i) => {
            const bought = owned.includes(item.id);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex flex-col overflow-hidden rounded-2xl border-2 p-2.5"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(176,226,255,0.75))",
                  borderColor: "#FFFFFF",
                }}
              >
                <img
                  src={COVERS[item.id] ?? mascot}
                  alt=""
                  className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20"
                  draggable={false}
                />
                <h2 className="mt-1 text-xs font-extrabold uppercase leading-tight text-[#0B3D91] sm:text-sm" style={{ fontFamily: '"Baloo 2", sans-serif' }}>
                  {item.title}
                </h2>
                <p className="mt-0.5 line-clamp-2 text-[10px] font-bold text-[#0B3D91]/70 sm:text-xs">{item.blurb}</p>
                <GlossyButton
                  variant={bought ? "blue" : "orange"}
                  size="sm"
                  disabled={bought}
                  className="mt-2 max-w-none"
                  onClick={() => buy(item.id, item.cost)}
                >
                  {bought ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={3} /> Owned
                    </>
                  ) : (
                    `${item.cost} coins`
                  )}
                </GlossyButton>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-2 shrink-0">
          <h3 className="mb-1.5 font-display text-sm font-bold uppercase text-white sm:text-base">{COPY.myBadges}</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {OCEANS.map((ocean) => {
              const earned = badges.includes(ocean.id);
              return (
                <div key={ocean.id} className="relative w-20 shrink-0 text-center sm:w-24">
                  <img
                    src={ocean.badge}
                    alt={ocean.name}
                    className="h-20 w-20 rounded-full object-contain sm:h-24 sm:w-24"
                    style={{ filter: earned ? "none" : "grayscale(0.85) brightness(0.65)" }}
                    draggable={false}
                  />
                  {!earned && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-white" strokeWidth={3} />
                    </span>
                  )}
                  <div className="mt-0.5 truncate text-[10px] font-bold text-white/80">{ocean.name.replace(" Ocean", "")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
