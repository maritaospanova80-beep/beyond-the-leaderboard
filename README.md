# Beyond The Leaderboard

Build a browser-based game prototype called "Path to the Diploma: Real Skills". It is a single-player game against two bot classmates, and one session lasts 5–7 minutes. It is an educational game based on the essay "Can Grades Be Fair?" (criterion-referenced vs norm-referenced grading, constructive alignment, AI in assessment, ethics of grading). The goal: the player experiences first-hand that being first in the ranking is not the same as being competent. It will be demonstrated at an exam on a projector, so the design must be large, clear and high-contrast, optimized for 16:9, and also working on mobile. ALL game text and UI must be in English.

## TECH
React + TypeScript + Tailwind + framer-motion (animations) + canvas-confetti. No backend. State via useReducer or zustand. Move ALL content (cards, questions, texts, probabilities, balance numbers) into a separate content.ts file so it is easy to edit. Sounds via WebAudio (short synthesized beeps), with a mute/unmute button in the corner.

## TONE AND STYLE
Lively, light, student humor with gentle irony about university absurdities. Bright "board game" look: warm background, rounded cards, thick outlines, large emoji as icons, soft shadows. Every action has an animation (dice rolls, token hops across tiles, card flips). On-screen text is short: no more than 140 characters per card, so nothing takes long to read.

## CORE MECHANIC
Each player has two scores:
1. POSITION: the token on the board (equivalent of norm-referenced grading: "who is ahead"). Always visible to everyone in a large live ranking.
2. SKILLS: tokens of five types: 🔍 Analysis, 💬 Argumentation, ⚖️ Evaluation, 🤝 Ethics, 🤖 AI Literacy (equivalent of criterion-referenced grading). The player sees their own skills in a compact, calm panel. The bots' skills are hidden ("???") until the very end.
The winner is the one with the most skills, NOT the first to finish. This twist is revealed only in the finale.

## START SCREEN AND ONBOARDING (max 20 seconds)
Title screen with the game name and a "Play" button. A name field (default "You"). Then 3 quick tip slides that can be swiped through or skipped:
1. "Go from Year 1 to graduation. The dice decide how fast you move."
2. "Along the way: Chance cards and exam tasks. They give you skills."
3. "But don't rush: at the end, speed isn't the only thing that counts…" (do not reveal the twist)
Then go straight into the game with no extra menus. Inside the game there is always ONE main pulsing button with a clear action ("Roll the dice", "Next"), so the interface is intuitive without explanation.

## BOARD
A winding snake-like path of 24 tiles, divided into 4 colored zones of 6 tiles each:
- Zone 1 "Ranking" (Year 1), tiles 1–6
- Zone 2 "Three Corners" (Year 2), tiles 7–12
- Zone 3 "The AI Era" (Master's), tiles 13–18
- Zone 4 "Graduation", tiles 19–24
Tile types: empty (🌱), "Chance" (🎴, about 40% of tiles), "Skill bonus" (⭐ gives a token of the player's choice, 2 on the board), "Exam gate" (🚪 mandatory stop).
Gates are on tiles 6, 12, 18 and 23. If a roll would carry a token past a gate, the token stops ON the gate and the zone mini-task starts. This way nobody can simply run past the skills. The finish is tile 24: reaching or exceeding it counts.
Three tokens of different colors with name labels. The board shows an icon for the current zone and the year name. At the top there is an overall progress bar "Year 1/4".

## TURN FLOW
Turn order: player, then Alibek, then Madina. Player's turn: press "Roll the dice" → d6 animation → token hops across tiles → the tile triggers. Bot turns are automatic and fast (about 2 seconds each) with a short caption of what happened ("Alibek rolled a 5 and sprinted into Year 2 🏃"). Add a "Speed up" button to skip bot animations.
The game ends when the FIRST player reaches the finish. Then go straight to the final screen.

## BOTS (important for the story)
- Alibek "The Speedrunner" 🏃: gets +1 tile on every roll; answers mini-tasks correctly only 35% of the time; ends up with few skills (2–3). Usually reaches the finish first.
- Madina "The Thoughtful One" 🧠: rolls normally, answers mini-tasks correctly 75% of the time, reaches the finish later, but ends with 5–7 skills.
Tune the behavior so that in most games Alibek leads by position but loses by skills. This is needed for the finale effect.
If a bot reaches the finish first, the game ends immediately, so the player must collect skills before that moment.

## "CHANCE" CARDS (card flip animation; at the bottom a small line "💡 Why?" with a one-sentence explanation from the essay)
Deck of 14 cards, drawn randomly with no repeats until the deck runs out:
1. "Exam is a multiple-choice test instead of analysis": skip a turn. 💡 A test checks memorization, not the ability to analyse.
2. "A professor saw a person in you": +2 tiles and a 🤝 Ethics token. 💡 A grade is an act towards a person.
3. "Used AI thoughtlessly": go back 3 tiles. 💡 AI without understanding doesn't build skill.
4. "Weak group, you're the star": +3 tiles, but no skills gained. 💡 Norm-referenced grading describes the group, not you.
5. "Strong group, low grade 'just because others are better'": −2 tiles, but you get a ⚖️ Evaluation token for resilience. 💡 Rank is not competence.
6. "Syllabus updated, exam unchanged": skip a turn. 💡 Learning outcomes on paper ≠ real change (Bologna).
7. "The assessment task was written last": roll the dice; on 1–3 you lose one token of your choice. 💡 Assessment can't be left for "later".
8. "Draft + oral defence": +1 🔍 Analysis token. 💡 Process shows what a student can really do.
9. "Grades announced publicly, as a ranking": −1 tile and a 💔 "lost confidence" animation. 💡 Public rankings can do harm ("do no harm").
10. "Feedback on 'what to do next'": +1 token of your choice. 💡 Good feedback teaches, not only judges.
11. "A grade with no explanation, and a scholarship depends on it": lose 1 🤝 Ethics if you have it, otherwise skip a turn. 💡 A decisive grade must be explained.
12. "The rubric didn't anticipate your answer": "group vote" animation (the two bots vote; the player wins the vote 2:1 in 60% of cases). If accepted: +1 💬 Argumentation token, otherwise nothing. 💡 Phronesis: practical wisdom is needed, not only a rubric.
13. "Group mini-lesson: the assessment task was written last": ALL players lose 1 tile. 💡 Even after studying alignment, people forget it.
14. "The teacher interprets the criterion their own way": swap places with the nearest rival by position. 💡 Criteria don't remove the assessor's subjectivity.

After the effect is shown, the player can press "Got it" or wait for automatic closing after 4 seconds.

## GATE MINI-TASKS (each 20–25 seconds max, all with button choices, no text input)

### Gate 1 (tile 6, zone "Ranking"): "Norm or Criterion?"
Statement cards; the player taps "👥 Against the group" or "🎯 Against a standard". Four statements in a row:
- "You're in the top 3 of the group, so you get the top grade" → Against the group
- "You need 70% on pre-set requirements" → Against a standard
- "In a weak group it's easy to stand out" → Against the group
- "Everyone who shows the result gets the top grade" → Against a standard
If 3 or more are correct: +1 ⚖️ Evaluation. Otherwise no token, but the explanation is shown.

### Gate 2 (tile 12, zone "Three Corners"): "One Verb in Three Corners"
The screen shows a learning outcome, for example "Student can ANALYSE a case". The player picks the matching teaching activity and the matching assessment task from three options each:
- Activity: "Lecture notes" / "Case discussion in groups" / "Watching a video"
- Task: "Multiple-choice test" / "Written case analysis" / "Internet-copied report"
Correct pair: "Case discussion in groups" + "Written case analysis". Three corner cards connect into a triangle around one verb. Correct: +1 🔍 Analysis and a "Aligned!" flash. Wrong: skip the next turn, with an explanation. Add two more variants (with the verbs "ARGUE" → +💬 and "EVALUATE" → +⚖️) so repeats don't feel the same.

### Gate 3 (tile 18, zone "The AI Era"): "The Essay Assignment"
The player must hand in an essay. Three buttons:
- "🤖 Submit a ready-made AI text" → fast: +3 tiles, 0 skills; with a 40% chance "The teacher noticed": go back 3 tiles.
- "📝 Draft + oral defence" → a question appears: "Why did you choose this argument?" with three answers; the correct one gives +1 🤖 AI Literacy and +1 🔍 Analysis, a wrong one gives nothing.
- "🧠 AI for checking and ideas, conclusions myself" → +1 🤖 AI Literacy (safe).
The whole mechanic should show: AI itself is not bad; the problem is when the task checks only a finished text.

### Gate 4 (tile 23, zone "Graduation"): "The Teacher's Dilemma"
Description: "Student Assel's grade is 0.5 points below the scholarship threshold. What do you do?"
- "Announce results publicly, as a ranking" → −1 tile, 0 skills.
- "Explain the criteria and give 'what to do next' feedback" → +1 🤝 Ethics.
- "Explain, and re-check the work considering the unexpected answer" → +1 🤝 Ethics and +1 ⚖️ Evaluation.
Show a short "💡 A grade is not just a number, it is an act."

## JOKERS (lifelines in the spirit of "Who Wants to Be a Millionaire")
The player has three one-time jokers, shown as buttons during gate mini-tasks:
- "🤖 Ask ChatGPT (but the teacher is watching)": shows the correct answer, but then the player must answer a defence question with two options ("Explain why"). Correct: the token is awarded; wrong: no token.
- "✂️ 50/50 by the rubric": removes two wrong options.
- "📞 Call a friend from last year": a funny hint pops up (correct 70% of the time, wrong 30%), for example: "I remember you had to choose… um… everything at once."
Each joker can be used once per game. Used jokers are greyed out.

## TOP PANEL AND PERMANENT INTERFACE
- Left: live ranking by position: 1, 2, 3 with avatars and large place numbers. Always visible.
- Right: the player's skills panel: 5 icons with counters (small and calm); for bots only "???".
- Bottom center: the main action button.
- Event feed with the last 3 events in short text.
- Sound on/off, restart.

## FINALE (most important for the effect)
1. "Game over" screen: podium animation by POSITION (who finished first, second, third). Bright, with confetti for first place. Caption: "Is the fastest the winner?"
2. A 2-second pause, then the message: "But remember: being better than others ≠ being competent. Let's look at skills…"
3. Animation: the ranking cards flip and re-sort by number of skills. Each player's tokens are revealed (the bots' "???" turn into numbers). The order changes with avatars smoothly flying to new places. The winner by skills is highlighted with confetti.
4. A "Diploma with Real Skills" block: everyone with 5 or more tokens of at least three different types receives it. Everyone can get it. Emphasize: "a criterion is a standard, not a competition."
5. "Your Path" block: a list of the cards the player drew, each with its icon and "💡 Why?" line.
6. "What This Means" block (3 points):
 - Ranking-based grades describe the group, not the student.
 - If the task and the learning outcome use different verbs, the grade measures the wrong thing.
 - AI doesn't create a new problem; it exposes an old one: assessing only a finished text.
7. Buttons: "Play again" and "Discussion questions" (a popup with 3 questions: "Who won by position and who won by skills? Why didn't they match?", "Which card felt unfair, and what does it correspond to in real life?", "What would you change about assessment in your own course?").

## USABILITY REQUIREMENTS
- Every action is understandable without instructions: there is always one prominent button and a short hint at each step.
- No long texts. Everything is readable in 3–5 seconds.
- Animations are fast (up to 0.6 s per element) but noticeable.
- A game must fit into 5–7 minutes: keep track of this and speed up bot turns if needed.
- Works on a projector (large font, high contrast) and on a phone.
- Add a hidden "Demo mode" (toggled by pressing the D key) that speeds up bot turns so the exam presentation doesn't drag on.
- All texts and numbers live in content.ts so balance can be edited quickly.

Start with the board, tokens, dice and movement across tiles. Then add Chance cards, then gate mini-tasks, jokers and the finale. After each stage, make sure the game runs from start to finish.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://beyond-the-leaderboard.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f56b36b8-6775-423d-991a-0afcc5034ad9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
