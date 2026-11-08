let ctx: AudioContext | null = null;
let muted = false;
export const setMuted = (m: boolean) => { muted = m; };

function tone(freq: number, dur = 0.08, type: OscillatorType = "square", vol = 0.06, delay = 0) {
  if (muted || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* ignore */ }
}

export const sfx = {
  dice: () => tone(200 + Math.random() * 300, 0.04, "square", 0.04),
  hop: () => tone(520, 0.05, "triangle", 0.07),
  card: () => { tone(400, 0.06, "sine"); tone(600, 0.08, "sine", 0.06, 0.06); },
  good: () => { tone(523, 0.1, "triangle", 0.08); tone(659, 0.1, "triangle", 0.08, 0.1); tone(784, 0.15, "triangle", 0.08, 0.2); },
  bad: () => { tone(300, 0.15, "sawtooth", 0.05); tone(200, 0.2, "sawtooth", 0.05, 0.15); },
  click: () => tone(700, 0.03, "square", 0.04),
  fanfare: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.08, i * 0.12)),
};
