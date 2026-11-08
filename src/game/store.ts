import { create } from "zustand";
import {
  BOT_CAPTIONS, CHANCE_CARDS, DICE_LOSE_MAX, FINISH, GATE2_VARIANTS, GATE3, GATE4, GATES, PLAYERS,
  SKILL_KEYS, TIMING, VOTE_WIN_CHANCE, ZONES, tileType, zoneOf,
  type ChanceCard, type JokerId, type SkillKey,
} from "./content";
import { sfx } from "./sound";

export type Skills = Record<SkillKey, number>;
export type Player = {
  id: string; name: string; emoji: string; color: string; isBot: boolean;
  bonusMove: number; correctRate: number; extraSkillChance: number;
  pos: number; skills: Skills; skip: number; gatesDone: number[]; finishedAt: number | null;
};
export type GateResult = { tokens: SkillKey[]; move: number; skip: boolean };
export type CardOutcome = { roll?: number; votes?: [boolean, boolean]; accepted?: boolean };
export type Modal =
  | { kind: "card"; card: ChanceCard; playerIdx: number; outcome: CardOutcome; auto: number }
  | { kind: "choose"; title: string; mode: "gain" | "lose" }
  | { kind: "gate"; gate: number; variant: number };

type Screen = "title" | "onboard" | "game" | "final";

type State = {
  screen: Screen; playerName: string;
  players: Player[]; current: number; awaiting: "roll" | "skip" | null;
  dice: number | null; rolling: boolean;
  modal: Modal | null; log: string[]; caption: string;
  drawn: ChanceCard[]; deck: number[]; jokersUsed: Partial<Record<JokerId, boolean>>;
  fast: boolean; demo: boolean; muted: boolean; flash: "heart" | "aligned" | null;
  startedAt: number; gameId: number;
  setName: (n: string) => void; go: (s: Screen) => void;
  start: () => void; restart: () => void;
  pressMain: () => void; answer: (v: unknown) => void;
  useJoker: (j: JokerId) => void; toggle: (k: "fast" | "demo" | "muted") => void;
};

const emptySkills = (): Skills => ({ analysis: 0, argument: 0, evaluation: 0, ethics: 0, ai: 0 });
export const totalSkills = (s: Skills) => SKILL_KEYS.reduce((a, k) => a + s[k], 0);
export const skillTypes = (s: Skills) => SKILL_KEYS.filter((k) => s[k] > 0).length;
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const d6 = () => 1 + Math.floor(Math.random() * 6);

let resolver: ((v: unknown) => void) | null = null;
let mainResolver: (() => void) | null = null;
class Aborted extends Error {}

export const useGame = create<State>((set, get) => {
  const alive = (id: number) => { if (get().gameId !== id || get().screen !== "game") throw new Aborted(); };
  const isBotTurn = () => get().players[get().current]?.isBot;
  const speed = () => {
    const s = get();
    const late = Date.now() - s.startedAt > 5 * 60_000;
    return isBotTurn() && (s.fast || s.demo || late) ? TIMING.demoFactor : 1;
  };
  const wait = (ms: number, id: number) => new Promise<void>((r) => setTimeout(r, ms * speed())).then(() => alive(id));
  const ask = <T,>(modal: Modal) => new Promise<T>((r) => { resolver = r as (v: unknown) => void; set({ modal }); });
  const log = (t: string) => set((s) => ({ log: [t, ...s.log].slice(0, 6) }));
  const upd = (i: number, f: (p: Player) => Partial<Player>) =>
    set((s) => ({ players: s.players.map((p, j) => (j === i ? { ...p, ...f(p) } : p)) }));
  const addToken = (i: number, k: SkillKey, n = 1) => upd(i, (p) => ({ skills: { ...p.skills, [k]: Math.max(0, p.skills[k] + n) } }));

  async function rollDice(id: number) {
    set({ rolling: true });
    for (let k = 0; k < 7; k++) { set({ dice: d6() }); sfx.dice(); await wait(60, id); }
    const v = d6(); set({ dice: v, rolling: false }); return v;
  }

  async function moveBy(i: number, delta: number, id: number) {
    const hop = get().players[i].isBot ? TIMING.botHopMs : TIMING.hopMs;
    const dir = Math.sign(delta);
    for (let k = 0; k < Math.abs(delta); k++) {
      const p = get().players[i];
      const next = Math.max(0, Math.min(FINISH, p.pos + dir));
      if (next === p.pos) break;
      upd(i, () => ({ pos: next })); sfx.hop();
      await wait(hop, id);
      if (next >= FINISH) { upd(i, () => ({ finishedAt: Date.now() })); throw new Finished(i); }
      if (dir > 0 && GATES.includes(next) && !p.gatesDone.includes(next)) break;
    }
  }

  async function chooseToken(i: number, mode: "gain" | "lose", title: string): Promise<SkillKey | null> {
    const p = get().players[i];
    if (mode === "lose" && totalSkills(p.skills) === 0) return null;
    if (p.isBot) {
      const owned = SKILL_KEYS.filter((k) => (mode === "lose" ? p.skills[k] > 0 : true));
      return owned.sort((a, b) => (mode === "gain" ? p.skills[a] - p.skills[b] : p.skills[b] - p.skills[a]))[0];
    }
    const k = await ask<SkillKey>({ kind: "choose", title, mode });
    set({ modal: null }); return k;
  }

  async function resolveTile(i: number, id: number, fromCard: boolean) {
    const p = get().players[i];
    const t = tileType(p.pos);
    if (t === "gate" && !p.gatesDone.includes(p.pos)) return runGate(i, GATES.indexOf(p.pos) + 1, id);
    if (fromCard) return;
    if (t === "chance") return runCard(i, id);
    if (t === "star") {
      const k = await chooseToken(i, "gain", "⭐ Skill bonus! Pick a token");
      if (k) { addToken(i, k); sfx.good(); log(`${p.name} got a ⭐ bonus skill`); }
    }
  }

  async function runGate(i: number, gate: number, id: number) {
    const p = get().players[i];
    upd(i, (q) => ({ gatesDone: [...q.gatesDone, p.pos] }));
    let res: GateResult;
    if (!p.isBot) {
      const variant = gate === 2 ? Math.floor(Math.random() * GATE2_VARIANTS.length) : 0;
      res = await ask<GateResult>({ kind: "gate", gate, variant });
      set({ modal: null });
    } else {
      const ok = Math.random() < p.correctRate;
      res = { tokens: [], move: 0, skip: false };
      if (gate === 1 && ok) res.tokens = ["evaluation"];
      if (gate === 2) { if (ok) res.tokens = [GATE2_VARIANTS[Math.floor(Math.random() * 3)].reward]; else res.skip = true; }
      if (gate === 3) {
        if (p.correctRate < 0.5) res.move = Math.random() < GATE3.caughtChance ? -GATE3.caughtBack : GATE3.aiMove;
        else if (ok) res.tokens = [...GATE3.draftReward];
      }
      if (gate === 4) {
        if (ok) res.tokens = [...GATE4.rewards[2]];
        else if (Math.random() < 0.5) res.tokens = [...GATE4.rewards[1]];
        else res.move = -GATE4.publicBack;
      }
      set({ caption: res.tokens.length ? BOT_CAPTIONS.gatePass(p.name) : BOT_CAPTIONS.gateFail(p.name) });
      await wait(TIMING.botPauseMs, id);
    }
    res.tokens.forEach((k) => addToken(i, k));
    if (res.skip) upd(i, (q) => ({ skip: q.skip + 1 }));
    log(`${p.name} 🚪 gate ${gate}: ${res.tokens.length ? "+" + res.tokens.length + " skill" : "no skill"}`);
    if (res.move) { await moveBy(i, res.move, id); await resolveTile(i, id, true); }
  }

  async function runCard(i: number, id: number) {
    let deck = get().deck;
    if (!deck.length) deck = shuffle(CHANCE_CARDS.map((c) => c.id));
    const cid = deck[0]; set({ deck: deck.slice(1) });
    const card = CHANCE_CARDS.find((c) => c.id === cid)!;
    const p = get().players[i];
    if (!p.isBot) set((s) => ({ drawn: [...s.drawn, card] }));
    const e = card.effect;
    const outcome: CardOutcome = {};
    if (e.special === "diceLose") outcome.roll = d6();
    if (e.special === "vote") {
      outcome.accepted = Math.random() < VOTE_WIN_CHANCE;
      outcome.votes = outcome.accepted ? (Math.random() < 0.5 ? [true, false] : [false, true]) : [false, false];
    }
    sfx.card();
    await ask({ kind: "card", card, playerIdx: i, outcome, auto: p.isBot ? TIMING.botCardMs * speed() : TIMING.cardAutoCloseMs });
    set({ modal: null }); alive(id);
    log(`${p.name} 🎴 ${card.effectText}`);

    if (e.skip) upd(i, (q) => ({ skip: q.skip + 1 }));
    if (e.token && e.token !== "choice") { addToken(i, e.token); sfx.good(); }
    if (e.token === "choice") { const k = await chooseToken(i, "gain", "Pick a token"); if (k) { addToken(i, k); sfx.good(); } }
    if (e.special === "heartbreak") { set({ flash: "heart" }); sfx.bad(); setTimeout(() => set({ flash: null }), 1200); }
    if (e.special === "diceLose" && (outcome.roll ?? 6) <= DICE_LOSE_MAX) {
      const k = await chooseToken(i, "lose", "Lose a token of your choice"); if (k) { addToken(i, k, -1); sfx.bad(); }
    }
    if (e.special === "loseEthicsOrSkip") {
      if (get().players[i].skills.ethics > 0) addToken(i, "ethics", -1); else upd(i, (q) => ({ skip: q.skip + 1 }));
    }
    if (e.special === "vote" && outcome.accepted) { addToken(i, "argument"); sfx.good(); }
    if (e.special === "allBack") { for (let j = 0; j < 3; j++) await moveBy(j, -1, id); }
    if (e.special === "swap") {
      const me = get().players[i];
      const rival = get().players.map((q, j) => ({ j, d: Math.abs(q.pos - me.pos) })).filter((x) => x.j !== i).sort((a, b) => a.d - b.d)[0].j;
      const rp = get().players[rival].pos, mp = me.pos;
      upd(i, () => ({ pos: rp })); upd(rival, () => ({ pos: mp })); sfx.hop();
      await wait(400, id);
    }
    if (e.move) { await moveBy(i, e.move, id); await resolveTile(i, id, true); }
  }

  async function turn(i: number, id: number) {
    const p = get().players[i];
    set({ current: i, caption: p.isBot ? `${p.emoji} ${p.name}'s turn…` : "Your turn!" });
    if (p.skip > 0) {
      upd(i, (q) => ({ skip: q.skip - 1 }));
      log(BOT_CAPTIONS.skip(p.name));
      if (p.isBot) { set({ caption: BOT_CAPTIONS.skip(p.name) }); await wait(TIMING.botPauseMs, id); }
      else { set({ caption: "You skip this turn 😴" }); await new Promise<void>((r) => { mainResolver = r; set({ awaiting: "skip" }); }); set({ awaiting: null }); }
      return;
    }
    if (p.isBot) await wait(350, id);
    else { await new Promise<void>((r) => { mainResolver = r; set({ awaiting: "roll" }); }); set({ awaiting: null }); alive(id); }
    const d = await rollDice(id);
    const move = d + p.bonusMove;
    const z0 = zoneOf(p.pos);
    if (p.isBot) set({ caption: BOT_CAPTIONS.roll(p.name, d) + (p.bonusMove ? BOT_CAPTIONS.sprint : "") });
    await moveBy(i, move, id);
    const np = get().players[i];
    if (p.isBot && zoneOf(np.pos) !== z0) set({ caption: BOT_CAPTIONS.newYear(p.name, ZONES[zoneOf(np.pos)].year) });
    log(`${p.name} rolled ${d}${p.bonusMove ? "+1" : ""} → tile ${np.pos}`);
    if (p.isBot) await wait(TIMING.botPauseMs * 0.6, id);
    await resolveTile(i, id, false);
    if (p.isBot && Math.random() < p.extraSkillChance) {
      const k = SKILL_KEYS[Math.floor(Math.random() * 5)]; addToken(i, k);
      set({ caption: BOT_CAPTIONS.extraSkill(p.name) }); log(BOT_CAPTIONS.extraSkill(p.name));
      await wait(TIMING.botPauseMs * 0.6, id);
    }
    if (p.isBot) await wait(TIMING.botPauseMs * 0.5, id);
  }

  async function loop(id: number) {
    try {
      let i = 0;
      for (;;) { await turn(i, id); i = (i + 1) % 3; }
    } catch (e) {
      if (e instanceof Finished && get().gameId === id) {
        set({ modal: null, awaiting: null });
        sfx.fanfare();
        setTimeout(() => get().gameId === id && set({ screen: "final" }), 700);
      }
    }
  }

  const fresh = (name: string) => ({
    players: PLAYERS.map((p, i) => ({
      id: p.id, name: i === 0 ? name || "You" : p.name, emoji: p.emoji, color: p.color, isBot: !!p.bot,
      bonusMove: p.bot?.bonusMove ?? 0, correctRate: p.bot?.correctRate ?? 1, extraSkillChance: p.bot?.extraSkillChance ?? 0,
      pos: 0, skills: emptySkills(), skip: 0, gatesDone: [], finishedAt: null,
    })),
    current: 0, awaiting: null, dice: null, rolling: false, modal: null, log: [], caption: "",
    drawn: [], deck: shuffle(CHANCE_CARDS.map((c) => c.id)), jokersUsed: {}, flash: null,
  });

  return {
    screen: "title", playerName: "You", ...fresh("You"),
    fast: false, demo: false, muted: false, startedAt: 0, gameId: 0,
    setName: (n) => set({ playerName: n }),
    go: (s) => set({ screen: s }),
    start: () => {
      const id = get().gameId + 1;
      set({ ...fresh(get().playerName.trim() || "You"), screen: "game", gameId: id, startedAt: Date.now() });
      void loop(id);
    },
    restart: () => { resolver = null; mainResolver = null; get().start(); },
    pressMain: () => { sfx.click(); const r = mainResolver; mainResolver = null; r?.(); },
    answer: (v) => { const r = resolver; resolver = null; r?.(v); },
    useJoker: (j) => set((s) => ({ jokersUsed: { ...s.jokersUsed, [j]: true } })),
    toggle: (k) => set((s) => ({ [k]: !s[k] }) as Partial<State>),
  };
});

class Finished extends Error { constructor(public idx: number) { super("finished"); } }
