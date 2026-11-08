import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { FINISH, SKILLS, SKILL_KEYS, TILE_EMOJI, ZONES, tileType, zoneOf, type SkillKey } from "./content";
import { useGame, type Player, type Skills } from "./store";

const ZONE_BG = ["bg-zone-1", "bg-zone-2", "bg-zone-3", "bg-zone-4"];
export const P_BG: Record<string, string> = { p1: "bg-p1", p2: "bg-p2", p3: "bg-p3" };

// tile n (1..24) -> grid cell; snake rows
function cell(n: number) {
  const t = Math.max(1, n);
  const r = Math.floor((t - 1) / 6);
  const i = (t - 1) % 6;
  const c = r % 2 === 0 ? i : 5 - i;
  return { r, c };
}

export function Board() {
  const players = useGame((s) => s.players);
  const current = useGame((s) => s.current);
  const tiles = Array.from({ length: FINISH }, (_, k) => k + 1);
  return (
    <div className="relative mx-auto aspect-[3/2] w-full max-w-[min(100%,calc((100vh-15rem)*1.5))] chunky board-bg bg-card p-2 sm:p-3">
      <div className="relative grid h-full w-full grid-cols-6 grid-rows-4 gap-1.5 sm:gap-2.5">
        {tiles.map((n) => {
          const { r, c } = cell(n);
          const t = tileType(n);
          const z = zoneOf(n);
          const firstOfZone = (n - 1) % 6 === 0;
          return (
            <div
              key={n}
              style={{ gridRow: r + 1, gridColumn: c + 1 }}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-[3px] border-ink ${ZONE_BG[z]} ${t === "gate" || t === "finish" ? "ring-4 ring-ink/70 ring-offset-2 ring-offset-card" : ""}`}
            >
              <span className="absolute left-1.5 top-0.5 font-display text-[10px] font-bold opacity-60 sm:text-sm">{n}</span>
              <span className="text-xl sm:text-3xl lg:text-4xl">{TILE_EMOJI[t]}</span>
              {firstOfZone && (
                <span className="absolute -top-2.5 right-1 rounded-full border-2 border-ink bg-card px-1.5 font-display text-[9px] font-bold sm:text-xs">
                  {ZONES[z].emoji} {ZONES[z].year}
                </span>
              )}
            </div>
          );
        })}
        {players.map((p, idx) => <Token key={p.id} p={p} idx={idx} active={idx === current} />)}
      </div>
    </div>
  );
}

function Token({ p, idx, active }: { p: Player; idx: number; active: boolean }) {
  const { r, c } = cell(p.pos);
  const off = (idx - 1) * 26;
  const left = `calc(${((c + 0.5) / 6) * 100}% + ${off}% / 6 - 1.1rem)`;
  const top = `calc(${((r + 0.5) / 4) * 100}% + ${p.pos === 0 ? -30 : 18}% / 4 - 1.1rem)`;
  return (
    <motion.div
      className="pointer-events-none absolute z-10 flex flex-col items-center"
      animate={{ left, top, y: [0, -14, 0] }}
      transition={{ left: { duration: 0.15 }, top: { duration: 0.15 }, y: { duration: 0.17 } }}
      key={`${p.id}`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink text-lg sm:h-11 sm:w-11 sm:text-2xl ${P_BG[p.color]} ${active ? "ring-4 ring-gold" : ""}`}>
        {p.emoji}
      </div>
      <span className="mt-0.5 rounded-full border-2 border-ink bg-card px-1.5 text-[9px] font-bold sm:text-xs">{p.name}</span>
    </motion.div>
  );
}

const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
export function Dice({ value, rolling }: { value: number | null; rolling: boolean }) {
  return (
    <motion.div
      key={rolling ? "r" : `v${value}`}
      animate={rolling ? { rotate: [0, 90, 180, 270, 360] } : { rotate: 0, scale: [1.3, 1] }}
      transition={{ duration: rolling ? 0.4 : 0.3, repeat: rolling ? Infinity : 0 }}
      className="grid h-16 w-16 grid-cols-3 grid-rows-3 gap-0.5 rounded-2xl border-[3px] border-ink bg-card p-2 shadow-[var(--shadow-chunky)] sm:h-20 sm:w-20"
    >
      {Array.from({ length: 9 }, (_, k) => (
        <span key={k} className={`m-auto h-3 w-3 rounded-full sm:h-3.5 sm:w-3.5 ${value && PIPS[value].includes(k) ? "bg-ink" : ""}`} />
      ))}
    </motion.div>
  );
}

export function Ranking() {
  const players = useGame((s) => s.players);
  const current = useGame((s) => s.current);
  const order = [...players].sort((a, b) => b.pos - a.pos);
  return (
    <div className="chunky bg-card p-3">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">🏁 Live ranking</h3>
      <div className="flex flex-col gap-2">
        {order.map((p, i) => (
          <motion.div layout key={p.id} className={`flex items-center gap-2 rounded-xl border-[3px] border-ink px-2 py-1.5 ${players[current]?.id === p.id ? "bg-accent" : "bg-muted"}`}>
            <span className="w-7 font-display text-3xl font-bold">{i + 1}</span>
            <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink text-xl ${P_BG[p.color]}`}>{p.emoji}</span>
            <span className="flex-1 truncate font-display text-lg font-semibold">{p.name}</span>
            <span className="font-display text-lg font-bold">{p.pos}<span className="text-xs opacity-60">/{FINISH}</span></span>
            {p.skip > 0 && <span title="skips a turn">😴</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function SkillRow({ skills, hidden }: { skills: Skills; hidden?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SKILL_KEYS.map((k) => (
        <motion.span key={k + skills[k]} initial={{ scale: 1.5 }} animate={{ scale: 1 }} title={SKILLS[k].name}
          className="flex items-center gap-1 rounded-lg border-2 border-ink bg-muted px-1.5 py-0.5 text-sm font-bold">
          {SKILLS[k].emoji} {hidden ? "?" : skills[k]}
        </motion.span>
      ))}
    </div>
  );
}

export function SkillsPanel() {
  const players = useGame((s) => s.players);
  return (
    <div className="chunky bg-card p-3">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">🎒 Skills</h3>
      <div className="mb-1 font-display font-semibold">{players[0].name}</div>
      <SkillRow skills={players[0].skills} />
      <div className="mt-3 flex flex-col gap-1 text-sm">
        {players.slice(1).map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted px-2 py-1">
            <span>{p.emoji} {p.name}</span><span className="font-bold tracking-widest">???</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventFeed() {
  const log = useGame((s) => s.log);
  return (
    <div className="chunky bg-card p-3">
      <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">📰 Events</h3>
      <ul className="space-y-1 text-sm">
        <AnimatePresence initial={false}>
          {log.slice(0, 3).map((l, i) => (
            <motion.li key={l + i + log.length} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - i * 0.25, x: 0 }} className="truncate">{l}</motion.li>
          ))}
        </AnimatePresence>
        {!log.length && <li className="text-muted-foreground">Nothing yet…</li>}
      </ul>
    </div>
  );
}

export function YearBar() {
  const players = useGame((s) => s.players);
  const me = players[0];
  const z = zoneOf(me.pos);
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap font-display text-lg font-bold sm:text-2xl">{ZONES[z].emoji} Year {z + 1}/4 · {ZONES[z].name}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-full border-[3px] border-ink bg-card">
        <motion.div className="h-full bg-primary" animate={{ width: `${(me.pos / FINISH) * 100}%` }} />
        {[6, 12, 18].map((g) => <span key={g} className="absolute top-0 h-full w-[3px] bg-ink" style={{ left: `${(g / FINISH) * 100}%` }} />)}
      </div>
    </div>
  );
}

export function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/60 p-3 backdrop-blur-sm">
      {children}
    </motion.div>
  );
}

export function CardModal() {
  const modal = useGame((s) => s.modal);
  const players = useGame((s) => s.players);
  const answer = useGame((s) => s.answer);
  const m = modal?.kind === "card" ? modal : null;
  useEffect(() => {
    if (!m) return;
    const t = setTimeout(() => answer(true), m.auto);
    return () => clearTimeout(t);
  }, [m, answer]);
  if (!m) return null;
  const p = players[m.playerIdx];
  const o = m.outcome;
  return (
    <Overlay>
      <motion.div initial={{ rotateY: 180, scale: 0.6 }} animate={{ rotateY: 0, scale: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-lg chunky bg-card p-6 text-center" style={{ transformStyle: "preserve-3d" }}>
        <div className="mb-1 text-sm font-bold uppercase text-muted-foreground">🎴 Chance · {p.emoji} {p.name}</div>
        <div className="text-7xl">{m.card.emoji}</div>
        <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">{m.card.title}</h2>
        <div className="mt-3 inline-block rounded-xl border-[3px] border-ink bg-accent px-4 py-2 font-display text-xl font-bold">{m.card.effectText}</div>
        {o.roll && <div className="mt-3 font-display text-xl">🎲 Rolled {o.roll} → {o.roll <= 3 ? "lose a token 😬" : "safe! 😅"}</div>}
        {o.votes && (
          <div className="mt-3 flex justify-center gap-3 font-display text-lg">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>{p.emoji} ✅</motion.span>
            {players.filter((_, j) => j !== m.playerIdx).map((q, k) => (
              <motion.span key={q.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + k * 0.3 }}>{q.emoji} {o.votes![k] ? "✅" : "❌"}</motion.span>
            ))}
            <motion.b initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>{o.accepted ? "Accepted 2:1! +💬" : "Rejected 1:2"}</motion.b>
          </div>
        )}
        <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-base">💡 <b>Why?</b> {m.card.why}</p>
        {!p.isBot && <button onClick={() => answer(true)} className="btn-game pulse-cta mt-4 bg-primary px-8 py-3 text-xl text-primary-foreground">Got it</button>}
      </motion.div>
    </Overlay>
  );
}

export function ChooseModal() {
  const modal = useGame((s) => s.modal);
  const me = useGame((s) => s.players[0]);
  const answer = useGame((s) => s.answer);
  if (modal?.kind !== "choose") return null;
  const keys = SKILL_KEYS.filter((k) => modal.mode === "gain" || me.skills[k] > 0);
  return (
    <Overlay>
      <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-full max-w-xl chunky bg-card p-6 text-center">
        <h2 className="text-3xl font-bold">{modal.title}</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {keys.map((k: SkillKey) => (
            <button key={k} onClick={() => answer(k)} className="btn-game bg-secondary px-3 py-3 text-lg">
              <div className="text-4xl">{SKILLS[k].emoji}</div>{SKILLS[k].name} <span className="opacity-60">({me.skills[k]})</span>
            </button>
          ))}
        </div>
      </motion.div>
    </Overlay>
  );
}
