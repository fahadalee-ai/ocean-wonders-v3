import raw from "@/data/content.json";

export type ShopKind = "mascot" | "background" | "stickers";

export type ShopItem = {
  id: string;
  title: string;
  kind: ShopKind;
  cost: number;
  blurb: string;
};

export type GameCopy = typeof raw.copy;

export const COPY: GameCopy = raw.copy;
export const SHOP_ITEMS: ShopItem[] = raw.shopItems as ShopItem[];

export function shopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}
