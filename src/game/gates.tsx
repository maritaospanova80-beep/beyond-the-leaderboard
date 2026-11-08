import { motion } from "framer-motion";
import { useState } from "react";
import {
  FRIEND_CONFUSED, FRIEND_CORRECT_CHANCE, FRIEND_LINES, GATE1, GATE2, GATE2_VARIANTS, GATE3, GATE4, GPT_TEXT,
  JOKERS, SKILLS, type SkillKey,
} from "./content";
import { Overlay } from "./components";
import { sfx } from "./sound";
import { useGame, type GateResult } from "./store";

type Q = { q: string; options: string[]; correct: number; defence: { q: string; options: string[]; correct: number } };

/** One multiple-choice question with jokers. onDone(index picked, ok) */
function Question({ q, onDone, hint }: { q: Q; hint?: string; onDone: (idx: number, ok: boolean) => void }) {
  const used = useGame((s) => s.jokersUsed);
  const useJoker = useGame((s) => s.useJoker);
  const [hidden, setHidden] = useState<number[]>([]);
  const [gpt, setGpt] = useState(false);
  const [friend, setFriend] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [stage, setStage] = useState<"ask" | "defence" | "fb">("ask");
  const [ok, setOk] = useState(false);

  const finish = (idx: number, good: boolean) => {
    setOk(good); setStage("fb"); good ? sfx.good() : sfx.bad();
    setTimeout(() => onDone(idx, good), 900);
  };
  const pick = (i: number) => {
    if (stage !== "ask") return;
    sfx.click(); setPicked(i);
    if (gpt) setStage("defence"); else finish(i, i === q.correct);
  };
  const joker = (id: (typeof JOKERS)[number]["id"]) => {
    if (used[id] || stage !== "ask") return;
    useJoker(id); sfx.click();
    if (id === "gpt") setGpt(true);
    if (id === "fifty") setHidden(q.options.map((_, i) => i).filter((i) => i !== q.correct).slice(0, 2));
    if (id === "friend") {
      const right = Math.random() < FRIEND_CORRECT_CHANCE;
      const wrongs = q.options.map((_, i) => i).filter((i) => i !== q.correct);
      const idx = right ? q.correct : wrongs[Math.floor(Math.random() * wrongs.length)];
      setFriend(Math.random() < 0.15 ? FRIEND_CONFUSED : FRIEND_LINES[Math.floor(Math.random() * FRIEND_LINES.length)](q.options[idx]));
    }
  };

  if (stage === "defence") {
    return (
      <div>
        <p className="mb-2 text-center text-base text-muted-foreground">👩‍🏫 Explain why</p>
        <h3 className="mb-4 text-center text-2xl font-bold">{q.defence.q}</h3>
        <div className="grid gap-3">
          {q.defence.options.map((o, i) => (
            <button key={o} onClick={() => finish(picked!, picked === q.correct && i === q.defence.correct)} className="btn-game bg-secondary px-4 py-3 text-lg">{o}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      {hint && <p className="mb-1 text-center text-base text-muted-foreground">{hint}</p>}
      <motion.h3 key={q.q} initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} className="mb-4 text-center text-2xl font-bold leading-snug sm:text-3xl">{q.q}</motion.h3>
      <div className="grid gap-3">
        {q.options.map((o, i) => {
          const hide = hidden.includes(i);
          const state = stage === "fb" && i === picked ? (ok ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground") : gpt && i === q.correct ? "bg-accent ring-4 ring-gold" : "bg-secondary";
          return (
            <button key={o} disabled={hide} onClick={() => pick(i)} className={`btn-game px-4 py-3 text-lg sm:text-xl ${state} ${hide ? "invisible" : ""}`}>{o}</button>
          );
        })}
      </div>
      {gpt && <p className="mt-3 text-center text-sm">🤖 {GPT_TEXT}</p>}
      {friend && <motion.p initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="mt-3 rounded-xl border-2 border-ink bg-muted p-2 text-center">📞 {friend}</motion.p>}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {JOKERS.map((j) => (
          <button key={j.id} disabled={!!used[j.id] || stage !== "ask"} onClick={() => joker(j.id)}
            className={`btn-game px-3 py-1.5 text-sm ${used[j.id] ? "bg-muted grayscale" : "bg-card"}`} title={j.sub}>
            {j.emoji} {j.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Result({ emoji, text, tokens, note, onNext }: { emoji: string; text: string; tokens: SkillKey[]; note?: string; onNext: () => void }) {
  return (
    <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="text-center">
      <div className="text-7xl">{emoji}</div>
      <h3 className="mt-2 text-2xl font-bold">{text}</h3>
      <div className="mt-2 font-display text-2xl">{tokens.length ? tokens.map((k) => `+1 ${SKILLS[k].emoji}`).join("  ") : "No skill token"}</div>
      {note && <p className="mt-3 rounded-xl bg-muted px-3 py-2">💡 {note}</p>}
      <button onClick={onNext} className="btn-game pulse-cta mt-5 bg-primary px-8 py-3 text-xl text-primary-foreground">Next</button>
    </motion.div>
  );
}

function Gate1({ done }: { done: (r: GateResult) => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  if (i >= GATE1.statements.length) {
    const pass = score >= GATE1.passNeeded;
    return <Result emoji={pass ? "🎯" : "🤷"} text={`${score}/4 correct`} tokens={pass ? GATE1.reward : []} note={GATE1.explain}
      onNext={() => done({ tokens: pass ? GATE1.reward : [], move: 0, skip: false })} />;
  }
  const s = GATE1.statements[i];
  return (
    <>
      <div className="mb-2 text-center font-bold">{i + 1} / 4</div>
      <Question key={i} hint={GATE1.hint} q={{ q: `“${s.text}”`, options: GATE1.options, correct: s.correct, defence: GATE1.defence }}
        onDone={(_, ok) => { setScore((x) => x + (ok ? 1 : 0)); setI((x) => x + 1); }} />
    </>
  );
}

function Gate2({ variant, done }: { variant: number; done: (r: GateResult) => void }) {
  const v = GATE2_VARIANTS[variant];
  const [act, setAct] = useState<{ idx: number; ok: boolean } | null>(null);
  const [task, setTask] = useState<{ idx: number; ok: boolean } | null>(null);
  const aligned = act?.ok && task?.ok;
  const Corner = ({ label, text, ok }: { label: string; text?: string; ok?: boolean }) => (
    <div className={`rounded-xl border-[3px] border-ink px-2 py-1 text-center text-xs sm:text-sm ${text ? (ok ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground") : "bg-muted"}`}>
      <b>{label}</b><div>{text ?? "?"}</div>
    </div>
  );
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 items-center gap-2">
        <Corner label="Activity" text={act ? v.activity.options[act.idx] : undefined} ok={act?.ok} />
        <motion.div animate={aligned ? { scale: [1, 1.3, 1], rotate: [0, 10, 0] } : {}} className="rounded-xl border-[3px] border-ink bg-accent p-2 text-center font-display text-lg font-bold">
          📐 {v.verb}
        </motion.div>
        <Corner label="Task" text={task ? v.task.options[task.idx] : undefined} ok={task?.ok} />
      </div>
      {!act && <Question key="a" hint={GATE2.hintActivity} q={{ q: v.outcome, ...v.activity, defence: GATE2.defence }} onDone={(idx, ok) => setAct({ idx, ok })} />}
      {act && !task && <Question key="t" hint={GATE2.hintTask} q={{ q: v.outcome, ...v.task, defence: GATE2.defence }} onDone={(idx, ok) => setTask({ idx, ok })} />}
      {act && task && (
        <Result emoji={aligned ? "✨" : "🔀"} text={aligned ? GATE2.success : "Not aligned"} tokens={aligned ? [v.reward] : []}
          note={aligned ? undefined : GATE2.fail}
          onNext={() => done({ tokens: aligned ? [v.reward] : [], move: 0, skip: !aligned })} />
      )}
    </div>
  );
}

function Gate3({ done }: { done: (r: GateResult) => void }) {
  const [path, setPath] = useState<string | null>(null);
  const [res, setRes] = useState<GateResult & { text: string; emoji: string } | null>(null);
  if (res) return <Result emoji={res.emoji} text={res.text} tokens={res.tokens} note={GATE3.moral} onNext={() => done(res)} />;
  if (path === "draft")
    return <Question q={{ ...GATE3.question, defence: GATE3.defence }} hint="👩‍🏫 Oral defence"
      onDone={(_, ok) => setRes({ tokens: ok ? GATE3.draftReward : [], move: 0, skip: false, emoji: ok ? "🎤" : "😶", text: ok ? "Great defence!" : "Hmm, not convincing" })} />;
  const choose = (id: string) => {
    sfx.click();
    if (id === "draft") return setPath(id);
    if (id === "assist") return setRes({ tokens: GATE3.assistReward, move: 0, skip: false, emoji: "🧠", text: "Smart use of AI" });
    const caught = Math.random() < GATE3.caughtChance;
    setRes({ tokens: [], move: caught ? -GATE3.caughtBack : GATE3.aiMove, skip: false, emoji: caught ? "👀" : "💨", text: caught ? GATE3.caught : GATE3.notCaught });
  };
  return (
    <div>
      <p className="mb-4 text-center text-xl">{GATE3.hint}</p>
      <div className="grid gap-3">
        {GATE3.choices.map((c) => <button key={c.id} onClick={() => choose(c.id)} className="btn-game bg-secondary px-4 py-3 text-lg sm:text-xl">{c.text}</button>)}
      </div>
    </div>
  );
}

function Gate4({ done }: { done: (r: GateResult) => void }) {
  const [res, setRes] = useState<GateResult | null>(null);
  if (res) return <Result emoji={res.tokens.length ? "🤝" : "📢"} text={res.tokens.length ? "A fair act" : "Ouch. That hurt Assel."} tokens={res.tokens} note={GATE4.moral} onNext={() => done(res)} />;
  return (
    <Question q={{ q: GATE4.hint, options: GATE4.options, correct: GATE4.correct, defence: GATE4.defence }}
      onDone={(idx, ok) => {
        const failedDefence = idx === GATE4.correct && !ok;
        setRes({ tokens: failedDefence ? [] : GATE4.rewards[idx], move: idx === 0 ? -GATE4.publicBack : 0, skip: false });
      }} />
  );
}

const TITLES = ["Norm or Criterion?", GATE2.title, GATE3.title, GATE4.title];
export function GateModal() {
  const modal = useGame((s) => s.modal);
  const answer = useGame((s) => s.answer);
  if (modal?.kind !== "gate") return null;
  const done = (r: GateResult) => answer(r);
  return (
    <Overlay>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-h-[95vh] w-full max-w-2xl overflow-y-auto chunky bg-card p-5 sm:p-7">
        <div className="mb-3 text-center">
          <span className="rounded-full border-2 border-ink bg-accent px-3 py-1 text-sm font-bold">🚪 Exam gate {modal.gate}</span>
          <h2 className="mt-2 text-3xl font-bold">{TITLES[modal.gate - 1]}</h2>
        </div>
        {modal.gate === 1 && <Gate1 done={done} />}
        {modal.gate === 2 && <Gate2 variant={modal.variant} done={done} />}
        {modal.gate === 3 && <Gate3 done={done} />}
        {modal.gate === 4 && <Gate4 done={done} />}
      </motion.div>
    </Overlay>
  );
}
