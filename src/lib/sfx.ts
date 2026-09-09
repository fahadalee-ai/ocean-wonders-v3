import { isMuted } from "@/lib/progress";

export type SfxKind = "tap" | "match" | "complete" | "bounce" | "star" | "lock";

let audioCtx: AudioContext | null = null;

function ctx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.08, delay = 0) {
  const ac = ctx();
  if (!ac) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function speakGoodJob() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance("Good job!");
    line.rate = 1.18;
    line.pitch = 1.38;
    line.volume = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const kid =
      voices.find((v) => /child|kid|girl|female/i.test(`${v.name} ${v.lang}`)) ??
      voices.find((v) => v.lang.startsWith("en"));
    if (kid) line.voice = kid;
    window.speechSynthesis.speak(line);
  } catch {
    /* ignore */
  }
}

/** Optional SFX hooks — soft synthesized cues until real audio files are added. */
export function playSfx(kind: SfxKind) {
  if (typeof window === "undefined" || isMuted()) return;
  void ctx()?.resume();
  switch (kind) {
    case "tap":
      tone(520, 0.08, "triangle", 0.05);
      break;
    case "match":
      tone(784, 0.11, "triangle", 0.08);
      tone(988, 0.13, "sine", 0.07, 0.05);
      tone(1175, 0.16, "triangle", 0.06, 0.1);
      tone(1568, 0.22, "sine", 0.05, 0.14);
      speakGoodJob();
      break;
    case "complete":
      tone(523, 0.12, "triangle", 0.07);
      tone(659, 0.12, "triangle", 0.07, 0.1);
      tone(784, 0.18, "triangle", 0.08, 0.2);
      tone(1046, 0.28, "sine", 0.07, 0.32);
      break;
    case "bounce":
      tone(220, 0.12, "sine", 0.05);
      break;
    case "star":
      tone(880, 0.12, "triangle", 0.06);
      tone(1320, 0.16, "sine", 0.05, 0.08);
      break;
    case "lock":
      tone(180, 0.1, "square", 0.03);
      tone(140, 0.1, "square", 0.03, 0.08);
      break;
    default:
      break;
  }
}
