import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { PageTitleBar } from "@/components/BackBubble";
import { GlossyButton } from "@/components/GlossyButton";
import char1 from "@/assets/Characters_1.png";
import char2 from "@/assets/Characters_2.png";
import char4 from "@/assets/Characters_4.png";
import char7 from "@/assets/Characters_7.png";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Ocean Wonders" },
      {
        name: "description",
        content: "Browse ocean storybooks and goodies in the Ocean Wonders shop.",
      },
      { property: "og:title", content: "Ocean Wonders Shop" },
      { property: "og:description", content: "Storybooks and ocean treasures for young explorers." },
    ],
  }),
  component: ShopPage,
});

type ShopItem = {
  id: string;
  title: string;
  price: string;
  cover: string;
  coverAlt: string;
  accent: string;
  accent2: string;
};

const ITEMS: ShopItem[] = [
  {
    id: "whale-shark",
    title: "Whale Shark is Calling Mermom and Me",
    price: "$2.95",
    cover: char7,
    coverAlt: "Whale shark storybook cover",
    accent: "#1A8FD4",
    accent2: "#0B3D91",
  },
  {
    id: "ocean-calling",
    title: "The Ocean is Calling Mermom and Me",
    price: "$2.95",
    cover: char4,
    coverAlt: "Ocean storybook cover",
    accent: "#2EB8F0",
    accent2: "#0E5A9A",
  },
  {
    id: "sea-friends",
    title: "Meet My Sea Friends — Ocean Wonders",
    price: "$1.99",
    cover: char1,
    coverAlt: "Sea friends storybook cover",
    accent: "#5ED4FF",
    accent2: "#1A6BB5",
  },
];

function ShopPage() {
  const [purchased, setPurchased] = useState<Record<string, boolean>>({});

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden" style={{ backgroundColor: "#0A2F7A" }}>
      <AuthOceanBackground fishCount={6} />

      <PageTitleBar title="Shop" backTo="/" />

      <div className="relative z-10 mx-auto flex h-[calc(100dvh-4.5rem)] w-full max-w-5xl flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mt-2 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pb-2 sm:mt-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {ITEMS.map((item, i) => {
            const bought = !!purchased[item.id];
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
                className="flex items-center gap-3 rounded-3xl border-2 p-3.5 sm:gap-4 sm:p-4"
                style={{
                  background: "linear-gradient(135deg, rgba(8,40,110,0.55) 0%, rgba(20,70,150,0.4) 100%)",
                  borderColor: "rgba(180,230,255,0.55)",
                  boxShadow: "0 12px 28px rgba(0,20,60,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <BookCover item={item} />

                <div className="min-w-0 flex-1">
                  <h2
                    className="font-display text-sm font-bold uppercase leading-snug text-white sm:text-base"
                    style={{ textShadow: "0 1px 2px rgba(0,20,60,0.45)" }}
                  >
                    {item.title}
                  </h2>
                  <p
                    className="mt-1.5 font-display text-base font-bold sm:text-lg"
                    style={{ color: "#FFE566", textShadow: "0 1px 0 rgba(0,40,90,0.35)" }}
                  >
                    Price: {item.price}
                  </p>
                  <GlossyButton
                    variant={bought ? "blue" : "orange"}
                    size="sm"
                    disabled={bought}
                    className="mt-2.5 max-w-[160px]"
                    onClick={() => setPurchased((p) => ({ ...p, [item.id]: true }))}
                  >
                    {bought ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={3} /> Owned
                      </>
                    ) : (
                      "Buy Now"
                    )}
                  </GlossyButton>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="mt-3 shrink-0 text-center text-xs font-semibold text-white/70 sm:text-sm">
          Storybooks for young ocean explorers — demo shop for now.
        </p>
      </div>
    </main>
  );
}

function BookCover({ item }: { item: ShopItem }) {
  const buddy = item.id === "ocean-calling" ? char2 : item.id === "sea-friends" ? char2 : char1;

  return (
    <div
      className="relative h-[108px] w-[108px] shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 sm:h-[120px] sm:w-[120px]"
      style={{
        background: `linear-gradient(160deg, ${item.accent} 0%, ${item.accent2} 100%)`,
        boxShadow: "0 8px 18px rgba(0,20,60,0.35)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.55), transparent 55%)",
        }}
      />
      <img
        src={item.cover}
        alt={item.coverAlt}
        className="absolute bottom-1 left-1/2 h-[78%] w-auto -translate-x-1/2 object-contain drop-shadow-md"
        draggable={false}
      />
      <img
        src={buddy}
        alt=""
        className="absolute bottom-2 right-1 h-[42%] w-auto object-contain opacity-90"
        draggable={false}
      />
      <div
        className="absolute inset-x-0 bottom-0 px-1.5 pb-1 pt-4 text-center"
        style={{ background: "linear-gradient(transparent, rgba(5,25,70,0.75))" }}
      >
        <span className="font-display text-[8px] font-bold uppercase leading-none text-white/95 sm:text-[9px]">
          Ocean Wonders
        </span>
      </div>
    </div>
  );
}
