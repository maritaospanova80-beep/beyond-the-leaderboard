import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ONBOARDING, SUBTITLE, TITLE } from "@/game/content";
import { Board, CardModal, ChooseModal, Dice, EventFeed, Ranking, SkillsPanel, YearBar } from "@/game/components";
import { Final } from "@/game/final";
import { GateModal } from "@/game/gates";
import { setMuted, sfx } from "@/game/sound";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Path to the Diploma: Real Skills" },
      { name: "description", content: "A 5-minute board game: is being first in the ranking the same as being competent?" },
      { property: "og:title", content: "Path to the Diploma: Real Skills" },
      { property: "og:description", content: "A 5-minute educational board game about fair grading, alignment and AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const screen = useGame((s) => s.screen);
  const toggle = useGame((s) => s.toggle);
  const muted = useGame((s) => s.muted);
  const demo = useGame((s) => s.demo);
  useEffect(() => setMuted(muted), [muted]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.key === "d" || e.key === "D") && !(e.target instanceof HTMLInputElement)) toggle("demo");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toggle]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="fixed right-3 top-3 z-50 flex gap-2">
        {demo && <span className="rounded-full border-2 border-ink bg-accent px-2 py-1 text-xs font-bold">DEMO ⚡</span>}
        <button aria-label="Toggle sound" onClick={() => toggle("muted")} className="btn-game bg-card px-3 py-1.5 text-lg">{muted ? "🔇" : "🔊"}</button>
      </div>
      {screen === "title" && <Title />}
      {screen === "onboard" && <Onboard />}
      {screen === "game" && <Game />}
      {screen === "final" && <Final />}
    </main>
  );
}

function Title() {
  const name = useGame((s) => s.playerName);
  const setName = useGame((s) => s.setName);
  const go = useGame((s) => s.go);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-8xl">🎓</motion.div>
      <h1 className="max-w-4xl text-5xl font-bold leading-tight sm:text-7xl">{TITLE}</h1>
      <p className="font-display text-xl text-muted-foreground sm:text-2xl">{SUBTITLE}</p>
      <div className="flex text-5xl gap-3">🧑‍🎓 🏃 🧠</div>
      <label className="flex items-center gap-3 font-display text-xl">
        Your name
        <input value={name} maxLength={14} onChange={(e) => setName(e.target.value)} className="w-44 rounded-xl border-[3px] border-ink bg-card px-3 py-2 text-center" />
      </label>
      <button onClick={() => { sfx.click(); go("onboard"); }} className="btn-game pulse-cta bg-primary px-14 py-4 text-3xl text-primary-foreground">▶ Play</button>
    </div>
  );
}

function Onboard() {
  const start = useGame((s) => s.start);
  const [i, setI] = useState(0);
  const next = () => { sfx.click(); i < ONBOARDING.length - 1 ? setI(i + 1) : start(); };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <AnimatePresence mode="wait">
        <motion.div key={i} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => info.offset.x < -60 && next()}
          initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -120, opacity: 0 }} transition={{ duration: 0.3 }}
          className="w-full max-w-2xl chunky bg-card p-10 text-center">
          <div className="text-8xl">{ONBOARDING[i].emoji}</div>
          <p className="mt-5 font-display text-3xl font-semibold leading-snug sm:text-4xl">{ONBOARDING[i].text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2">{ONBOARDING.map((_, k) => <span key={k} className={`h-3 w-3 rounded-full border-2 border-ink ${k === i ? "bg-primary" : "bg-card"}`} />)}</div>
      <div className="flex gap-4">
        <button onClick={start} className="btn-game bg-card px-6 py-3 text-xl">Skip</button>
        <button onClick={next} className="btn-game pulse-cta bg-primary px-10 py-3 text-2xl text-primary-foreground">{i < ONBOARDING.length - 1 ? "Next →" : "Let's go! 🎲"}</button>
      </div>
    </div>
  );
}

function Game() {
  const s = useGame();
  const cur = s.players[s.current];
  const flash = s.flash;
  return (
    <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col gap-3 p-3 pr-16 sm:p-4 sm:pr-20">
      <div className="flex items-center gap-3">
        <div className="flex-1"><YearBar /></div>
        <button onClick={s.restart} className="btn-game bg-card px-3 py-1.5 text-sm" aria-label="Restart">🔁 Restart</button>
      </div>
      <div className="grid flex-1 gap-3 lg:grid-cols-[280px_1fr_280px]">
        <div className="order-2 flex flex-col gap-3 lg:order-1"><Ranking /><EventFeed /></div>
        <div className="order-1 flex flex-col items-center gap-3 lg:order-2">
          <Board />
          <div className="flex w-full flex-wrap items-center justify-center gap-4">
            <Dice value={s.dice} rolling={s.rolling} />
            <div className="flex flex-col items-center gap-2">
              <motion.div key={s.caption} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="min-h-7 text-center font-display text-lg font-semibold sm:text-xl">{s.caption}</motion.div>
              {s.awaiting ? (
                <button onClick={s.pressMain} className="btn-game pulse-cta bg-primary px-10 py-4 text-2xl text-primary-foreground sm:text-3xl">
                  {s.awaiting === "roll" ? "🎲 Roll the dice" : "😴 Next"}
                </button>
              ) : cur?.isBot ? (
                <button onClick={() => s.toggle("fast")} className={`btn-game px-6 py-3 text-xl ${s.fast ? "bg-accent" : "bg-card"}`}>⏩ {s.fast ? "Speeding up" : "Speed up"}</button>
              ) : (
                <div className="h-14" />
              )}
            </div>
          </div>
        </div>
        <div className="order-3"><SkillsPanel /></div>
      </div>
      <AnimatePresence>{s.modal?.kind === "card" && <CardModal key="card" />}</AnimatePresence>
      <ChooseModal />
      <GateModal />
      <AnimatePresence>
        {flash === "heart" && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.4, opacity: 1 }} exit={{ opacity: 0, y: 80 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center text-[10rem]">💔</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
