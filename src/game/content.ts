// ALL game text, numbers and balance live here. Edit freely.

export type SkillKey = "analysis" | "argument" | "evaluation" | "ethics" | "ai";

export const SKILLS: Record<SkillKey, { emoji: string; name: string }> = {
  analysis: { emoji: "🔍", name: "Analysis" },
  argument: { emoji: "💬", name: "Argumentation" },
  evaluation: { emoji: "⚖️", name: "Evaluation" },
  ethics: { emoji: "🤝", name: "Ethics" },
  ai: { emoji: "🤖", name: "AI Literacy" },
};
export const SKILL_KEYS = Object.keys(SKILLS) as SkillKey[];

export const TITLE = "Path to the Diploma: Real Skills";
export const SUBTITLE = "A board game about whether grades can be fair";

export const ONBOARDING = [
  { emoji: "🎲", text: "Go from Year 1 to graduation. The dice decide how fast you move." },
  { emoji: "🎴", text: "Along the way: Chance cards and exam tasks. They give you skills." },
  { emoji: "🤔", text: "But don't rush: at the end, speed isn't the only thing that counts…" },
];

export const FINISH = 24;
export const GATES = [6, 12, 18, 23];

export type TileType = "empty" | "chance" | "star" | "gate" | "finish";
const CHANCE_TILES = [2, 3, 5, 8, 10, 14, 15, 17, 19, 21];
const STAR_TILES = [9, 20];
export function tileType(n: number): TileType {
  if (n === FINISH) return "finish";
  if (GATES.includes(n)) return "gate";
  if (STAR_TILES.includes(n)) return "star";
  if (CHANCE_TILES.includes(n)) return "chance";
  return "empty";
}
export const TILE_EMOJI: Record<TileType, string> = {
  empty: "🌱",
  chance: "🎴",
  star: "⭐",
  gate: "🚪",
  finish: "🎓",
};

export const ZONES = [
  { name: "Ranking", year: "Year 1", emoji: "📊" },
  { name: "Three Corners", year: "Year 2", emoji: "📐" },
  { name: "The AI Era", year: "Master's", emoji: "🤖" },
  { name: "Graduation", year: "Graduation", emoji: "🎓" },
];
export const zoneOf = (tile: number) => Math.min(3, Math.max(0, Math.floor((Math.max(tile, 1) - 1) / 6)));

// ---------- Players & bots ----------
export const PLAYERS = [
  { id: "you", name: "You", emoji: "🧑‍🎓", color: "p1", bot: null },
  { id: "alibek", name: "Alibek", emoji: "🏃", color: "p2", bot: { title: "The Speedrunner", bonusMove: 1, correctRate: 0.35, extraSkillChance: 0 } },
  { id: "madina", name: "Madina", emoji: "🧠", color: "p3", bot: { title: "The Thoughtful One", bonusMove: 0, correctRate: 0.75, extraSkillChance: 0.3 } },
] as const;

export const TIMING = {
  hopMs: 170,
  botHopMs: 110,
  botPauseMs: 900,
  demoFactor: 0.35,
  cardAutoCloseMs: 4000,
  botCardMs: 1300,
};

export const BOT_CAPTIONS = {
  roll: (n: string, d: number) => `${n} rolled a ${d}`,
  sprint: " and sprinted ahead 🏃",
  newYear: (n: string, y: string) => `${n} rolled into ${y} 🏃`,
  extraSkill: (n: string) => `${n} reread the feedback 📖 +1 skill`,
  skip: (n: string) => `${n} skips a turn 😴`,
  gatePass: (n: string) => `${n} passed the exam gate ✅`,
  gateFail: (n: string) => `${n} rushed the exam ❌`,
};

// ---------- Chance cards ----------
export type CardEffect = {
  move?: number;
  token?: SkillKey | "choice";
  skip?: boolean;
  special?: "diceLose" | "loseEthicsOrSkip" | "vote" | "allBack" | "swap" | "heartbreak";
};
export type ChanceCard = { id: number; emoji: string; title: string; effectText: string; why: string; effect: CardEffect };

export const CHANCE_CARDS: ChanceCard[] = [
  { id: 1, emoji: "📝", title: "Exam is a multiple-choice test instead of analysis", effectText: "Skip a turn", why: "A test checks memorization, not the ability to analyse.", effect: { skip: true } },
  { id: 2, emoji: "👩‍🏫", title: "A professor saw a person in you", effectText: "+2 tiles and 🤝 Ethics", why: "A grade is an act towards a person.", effect: { move: 2, token: "ethics" } },
  { id: 3, emoji: "🤖", title: "Used AI thoughtlessly", effectText: "Go back 3 tiles", why: "AI without understanding doesn't build skill.", effect: { move: -3 } },
  { id: 4, emoji: "🌟", title: "Weak group, you're the star", effectText: "+3 tiles, no skills", why: "Norm-referenced grading describes the group, not you.", effect: { move: 3 } },
  { id: 5, emoji: "🏋️", title: "Strong group, low grade “just because others are better”", effectText: "−2 tiles, but ⚖️ Evaluation for resilience", why: "Rank is not competence.", effect: { move: -2, token: "evaluation" } },
  { id: 6, emoji: "📜", title: "Syllabus updated, exam unchanged", effectText: "Skip a turn", why: "Learning outcomes on paper ≠ real change (Bologna).", effect: { skip: true } },
  { id: 7, emoji: "⏰", title: "The assessment task was written last", effectText: "Roll: on 1–3 you lose a token", why: "Assessment can't be left for “later”.", effect: { special: "diceLose" } },
  { id: 8, emoji: "🎤", title: "Draft + oral defence", effectText: "+1 🔍 Analysis", why: "Process shows what a student can really do.", effect: { token: "analysis" } },
  { id: 9, emoji: "📢", title: "Grades announced publicly, as a ranking", effectText: "−1 tile 💔 lost confidence", why: "Public rankings can do harm (“do no harm”).", effect: { move: -1, special: "heartbreak" } },
  { id: 10, emoji: "🧭", title: "Feedback on “what to do next”", effectText: "+1 token of your choice", why: "Good feedback teaches, not only judges.", effect: { token: "choice" } },
  { id: 11, emoji: "💸", title: "A grade with no explanation, and a scholarship depends on it", effectText: "Lose 🤝 Ethics, or skip a turn", why: "A decisive grade must be explained.", effect: { special: "loseEthicsOrSkip" } },
  { id: 12, emoji: "🗳️", title: "The rubric didn't anticipate your answer", effectText: "Group vote! Win → +1 💬", why: "Phronesis: practical wisdom is needed, not only a rubric.", effect: { special: "vote" } },
  { id: 13, emoji: "🙈", title: "Group mini-lesson: the assessment task was written last", effectText: "ALL players −1 tile", why: "Even after studying alignment, people forget it.", effect: { special: "allBack" } },
  { id: 14, emoji: "🔄", title: "The teacher interprets the criterion their own way", effectText: "Swap places with the nearest rival", why: "Criteria don't remove the assessor's subjectivity.", effect: { special: "swap" } },
];
export const VOTE_WIN_CHANCE = 0.6;
export const DICE_LOSE_MAX = 3;

// ---------- Gates ----------
export const GATE1 = {
  title: "Norm or Criterion?",
  hint: "Is this grade measured against the group or a standard?",
  options: ["👥 Against the group", "🎯 Against a standard"],
  statements: [
    { text: "You're in the top 3 of the group, so you get the top grade", correct: 0 },
    { text: "You need 70% on pre-set requirements", correct: 1 },
    { text: "In a weak group it's easy to stand out", correct: 0 },
    { text: "Everyone who shows the result gets the top grade", correct: 1 },
  ],
  passNeeded: 3,
  reward: ["evaluation"] as SkillKey[],
  explain: "Norm = compared with others. Criterion = compared with a standard.",
  defence: { q: "Why is “top 3 of the group” norm-referenced?", options: ["It depends on who else is in the group", "Because 3 is a small number"], correct: 0 },
};

export const GATE2_VARIANTS = [
  {
    verb: "ANALYSE", outcome: "Student can ANALYSE a case", reward: "analysis" as SkillKey,
    activity: { options: ["Lecture notes", "Case discussion in groups", "Watching a video"], correct: 1 },
    task: { options: ["Multiple-choice test", "Written case analysis", "Internet-copied report"], correct: 1 },
  },
  {
    verb: "ARGUE", outcome: "Student can ARGUE a position", reward: "argument" as SkillKey,
    activity: { options: ["Structured debate", "Reading the textbook", "Copying slides"], correct: 0 },
    task: { options: ["True/false quiz", "Glossary test", "Defending a position in an essay"], correct: 2 },
  },
  {
    verb: "EVALUATE", outcome: "Student can EVALUATE sources", reward: "evaluation" as SkillKey,
    activity: { options: ["Memorizing definitions", "Comparing sources by criteria", "Watching a lecture"], correct: 1 },
    task: { options: ["Source critique with justification", "Fill-in-the-blank test", "Summary of one article"], correct: 0 },
  },
];
export const GATE2 = {
  title: "One Verb in Three Corners",
  hintActivity: "Pick the teaching activity that trains this verb",
  hintTask: "Pick the assessment task that checks this verb",
  success: "Aligned! 📐",
  fail: "Misaligned: the task checks a different verb. Skip next turn.",
  defence: { q: "Why must the task use the same verb as the outcome?", options: ["Otherwise the grade measures something else", "It makes grading faster"], correct: 0 },
};

export const GATE3 = {
  title: "The Essay Assignment",
  hint: "You must hand in an essay. How?",
  choices: [
    { id: "ai", text: "🤖 Submit a ready-made AI text" },
    { id: "draft", text: "📝 Draft + oral defence" },
    { id: "assist", text: "🧠 AI for checking and ideas, conclusions myself" },
  ],
  aiMove: 3,
  caughtChance: 0.4,
  caughtBack: 3,
  caught: "The teacher noticed! 👀 Back 3 tiles.",
  notCaught: "+3 tiles… but zero skills learned.",
  question: { q: "Why did you choose this argument?", options: ["The AI said so", "It best supports my claim with evidence", "It was the shortest one"], correct: 1 },
  draftReward: ["ai", "analysis"] as SkillKey[],
  assistReward: ["ai"] as SkillKey[],
  moral: "AI isn't bad. The problem is a task that checks only a finished text.",
  defence: { q: "What does the oral defence check?", options: ["Your own understanding", "Your typing speed"], correct: 0 },
};

export const GATE4 = {
  title: "The Teacher's Dilemma",
  hint: "Student Assel's grade is 0.5 points below the scholarship threshold. What do you do?",
  options: [
    "Announce results publicly, as a ranking",
    "Explain the criteria and give “what to do next” feedback",
    "Explain, and re-check the work considering the unexpected answer",
  ],
  rewards: [[], ["ethics"], ["ethics", "evaluation"]] as SkillKey[][],
  publicBack: 1,
  correct: 2,
  moral: "💡 A grade is not just a number, it is an act.",
  defence: { q: "Why re-check considering the unexpected answer?", options: ["Rubrics can't foresee every good answer", "To make Assel happy"], correct: 0 },
};

// ---------- Jokers ----------
export const JOKERS = [
  { id: "gpt", emoji: "🤖", name: "Ask ChatGPT", sub: "but the teacher is watching" },
  { id: "fifty", emoji: "✂️", name: "50/50", sub: "by the rubric" },
  { id: "friend", emoji: "📞", name: "Call a friend", sub: "from last year" },
] as const;
export type JokerId = (typeof JOKERS)[number]["id"];
export const FRIEND_CORRECT_CHANCE = 0.7;
export const FRIEND_LINES = [
  (o: string) => `“Pretty sure it was… “${o}”. Like 80% sure.”`,
  (o: string) => `“My notes say “${o}”. Or that was my shopping list.”`,
];
export const FRIEND_CONFUSED = "“I remember you had to choose… um… everything at once.”";
export const GPT_TEXT = "ChatGPT highlighted an answer. Now the teacher asks: explain why!";

// ---------- Finale ----------
export const DIPLOMA = { minTokens: 5, minTypes: 3 };
export const FINALE = {
  over: "Game over!",
  question: "Is the fastest the winner?",
  twist: "But remember: being better than others ≠ being competent. Let's look at skills…",
  skillsTitle: "Ranking by SKILLS",
  diplomaTitle: "🎓 Diploma with Real Skills",
  diplomaRule: `5+ tokens of at least 3 different types. A criterion is a standard, not a competition.`,
  pathTitle: "🗺️ Your Path",
  meaningTitle: "💡 What This Means",
  meaning: [
    "Ranking-based grades describe the group, not the student.",
    "If the task and the learning outcome use different verbs, the grade measures the wrong thing.",
    "AI doesn't create a new problem; it exposes an old one: assessing only a finished text.",
  ],
  discussion: [
    "Who won by position and who won by skills? Why didn't they match?",
    "Which card felt unfair, and what does it correspond to in real life?",
    "What would you change about assessment in your own course?",
  ],
};
