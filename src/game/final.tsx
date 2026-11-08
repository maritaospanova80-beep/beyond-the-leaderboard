import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DIPLOMA, FINALE } from "./content";
import { Overlay, P_BG, SkillRow } from "./components";
import { sfx } from "./sound";
import { skillTypes, totalSkills, useGame } from "./store";

export function Final() {
  const players = useGame((s) => s.players);
  const drawn = useGame((s) => s.drawn);
  const restart = useGame((s) => s.restart);
  const [stage, setStage] = useState(0);
  const [disc, setDisc] = useState(false);

  const byPos = [...players].sort((a, b) => b.pos - a.pos || (a.finishedAt ?? Infinity) - (b.finishedAt ?? Infinity));
  const bySkill = [...players].sort((a, b) => totalSkills(b.skills) - totalSkills(a.skills) || skillTypes(b.skills) - skillTypes(a.skills));
  const order = stage >= 2 ? bySkill : byPos;

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 } });
    const t1 = setTimeout(() => setStage(1), 2000);
    const t2 = setTimeout(() => { setStage(2); sfx.card(); }, 4800);
    const t3 = setTimeout(() => { setStage(3); sfx.fanfare(); confetti({ particleCount: 200, spread: 120, origin: { y: 0.3 }, colors: ["#f2b632", "#e8573a", "#3fae6a"] }); }, 6200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  const diploma = (p: (typeof players)[0]) => totalSkills(p.skills) >= DIPLOMA.minTokens && skillTypes(p.skills) >= DIPLOMA.minTypes;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-center text-5xl font-bold sm:text-6xl">{stage >= 2 ? FINALE.skillsTitle : FINALE.over}</h1>
      <p className="mt-2 text-center font-display text-2xl">{stage >= 2 ? "Who really learned the most?" : FINALE.question}</p>

      <div className="mt-6 flex items-end justify-center gap-3 sm:gap-6">
        {[1, 0, 2].map((slot) => {
          const p = order[slot];
          const h = ["h-44", "h-32", "h-24"][slot];
          return (
            <motion.div layout key={p.id} transition={{ type: "spring", stiffness: 120, damping: 16 }} className="flex w-28 flex-col items-center sm:w-44">
              <motion.div animate={{ rotateY: stage >= 2 ? 360 : 0 }} transition={{ duration: 0.6 }}
                className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-ink text-4xl sm:h-20 sm:w-20 sm:text-5xl ${P_BG[p.color]}`}>{p.emoji}</motion.div>
              <div className="mt-1 font-display text-xl font-bold">{p.name}</div>
              <div className="text-sm">{stage >= 2 ? `${totalSkills(p.skills)} skills` : `tile ${p.pos}`}</div>
              {stage >= 2 && <div className="my-1 scale-90"><SkillRow skills={p.skills} /></div>}
              <div className={`mt-1 flex w-full ${h} items-start justify-center rounded-t-2xl border-[3px] border-ink pt-2 font-display text-5xl font-bold ${slot === 0 ? "bg-gold" : "bg-secondary"}`}>{slot + 1}</div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {stage === 1 && (
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto mt-6 max-w-2xl chunky bg-accent p-4 text-center font-display text-2xl font-bold">
            {FINALE.twist}
          </motion.p>
        )}
      </AnimatePresence>

      {stage >= 3 && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid gap-5 md:grid-cols-2">
          <section className="chunky bg-card p-5 md:col-span-2">
            <h2 className="text-3xl font-bold">{FINALE.diplomaTitle}</h2>
            <p className="mt-1 text-lg">{FINALE.diplomaRule}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {players.map((p) => (
                <div key={p.id} className={`rounded-xl border-[3px] border-ink px-4 py-2 font-display text-xl ${diploma(p) ? "bg-success text-success-foreground" : "bg-muted"}`}>
                  {p.emoji} {p.name}: {diploma(p) ? "🎓 Diploma!" : "Not yet"}
                </div>
              ))}
            </div>
          </section>
          <section className="chunky bg-card p-5">
            <h2 className="text-2xl font-bold">{FINALE.pathTitle}</h2>
            <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto">
              {drawn.length === 0 && <li className="text-muted-foreground">No Chance cards this time.</li>}
              {drawn.map((c, i) => (
                <li key={i} className="rounded-xl bg-muted p-2"><b>{c.emoji} {c.title}</b><div className="text-sm">💡 {c.why}</div></li>
              ))}
            </ul>
          </section>
          <section className="chunky bg-card p-5">
            <h2 className="text-2xl font-bold">{FINALE.meaningTitle}</h2>
            <ol className="mt-2 space-y-3 text-lg">
              {FINALE.meaning.map((m, i) => <li key={i} className="flex gap-2"><span className="font-display text-2xl font-bold text-primary">{i + 1}</span>{m}</li>)}
            </ol>
          </section>
          <div className="flex flex-wrap justify-center gap-4 md:col-span-2">
            <button onClick={restart} className="btn-game pulse-cta bg-primary px-8 py-4 text-2xl text-primary-foreground">🔁 Play again</button>
            <button onClick={() => setDisc(true)} className="btn-game bg-accent px-8 py-4 text-2xl">💭 Discussion questions</button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {disc && (
          <Overlay>
            <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-full max-w-2xl chunky bg-card p-6">
              <h2 className="text-3xl font-bold">💭 Let's discuss</h2>
              <ol className="mt-4 space-y-4 text-xl">
                {FINALE.discussion.map((q, i) => <li key={i} className="rounded-xl bg-muted p-3"><b>{i + 1}.</b> {q}</li>)}
              </ol>
              <button onClick={() => setDisc(false)} className="btn-game mt-5 bg-primary px-6 py-3 text-xl text-primary-foreground">Close</button>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}
