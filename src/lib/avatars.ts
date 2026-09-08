import char1 from "@/assets/Characters_1.png";
import char2 from "@/assets/Characters_2.png";
import char3 from "@/assets/Characters_3.png";
import char4 from "@/assets/Characters_4.png";
import char5 from "@/assets/Characters_5.png";
import char6 from "@/assets/Characters_6.png";
import char7 from "@/assets/Characters_7.png";
import type { AvatarId } from "@/lib/progress";

export const AVATARS: { id: AvatarId; label: string; src: string }[] = [
  { id: "turtle", label: "Sea Turtle", src: char7 },
  { id: "dolphin", label: "Dolphin", src: char4 },
  { id: "seahorse", label: "Seahorse", src: char6 },
  { id: "octopus", label: "Octopus", src: char5 },
  { id: "clownfish", label: "Clownfish", src: char2 },
  { id: "crab", label: "Crab", src: char3 },
];

export function avatarSrc(id: AvatarId | undefined): string {
  return AVATARS.find((a) => a.id === id)?.src ?? char1;
}
