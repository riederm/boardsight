# BoardSight — Project Plan

BoardSight is a small website for learning chess square coordinates until they're automatic. The goal is to build two-way recall:

- **Square → location:** hear or read `e4` or `Rb4`, and point at the square right away.
- **Location → square:** see a highlighted square or a move on the board, and name it right away.

The plan is iterative. Each iteration ships a usable, deployable site and builds on the one before it.

---

## Guiding principles

1. **Speed is the metric.** Correct answers matter, but reaction time is what shows muscle memory. Measure it from day one.
2. **Short sessions.** A drill takes 30–60 seconds, and starting one takes a single click.
3. **Both orientations.** Players see the board from White's and from Black's side, so every drill supports both.
4. **Static-first.** No backend until a feature truly needs one. Host anywhere as static files.
5. **Pure domain core.** Keep square, coordinate and notation logic in a framework-free, fully unit-tested module.

## Tech stack

| Concern      | Choice                                      | Why                                                     |
| ------------ | ------------------------------------------- | ------------------------------------------------------- |
| Build        | Vite                                        | Fast dev server, static output                          |
| Language     | TypeScript (strict)                         | Square and notation logic benefits from types           |
| UI           | Svelte 5                                    | Small bundle, little boilerplate, built-in reactivity   |
| Board render | Hand-rolled SVG component                   | Full control over highlights, animation and orientation |
| State        | Local component state + small store         | App state is small                                      |
| Persistence  | `localStorage` (later IndexedDB)            | No backend needed for single-user progress              |
| Testing      | Vitest (unit), Playwright (e2e, from it. 2) |                                                         |
| Lint/format  | ESLint + Prettier                           |                                                         |
| Hosting      | GitHub Pages (deployed via Actions)         | Free static hosting next to the repo                    |
| CI           | GitHub Actions: lint, test, build, deploy   |                                                         |

---

## Iteration 0 — Bootstrap

**Goal:** an empty but deployable project skeleton.

- [x] `git init`, `.gitignore`, `README.md`
- [ ] License
- [x] Scaffold Vite + TypeScript + Svelte
- [x] ESLint, Prettier, Vitest configured; `npm run lint|check|test|build` work
- [x] CI workflow: lint, type-check, test and build on every push/PR
- [x] Deploy job to GitHub Pages (on push to `main`)
- [x] Push to GitHub, enable Pages (Source: GitHub Actions); placeholder page is live at https://riederm.github.io/boardsight/
- [x] Folder structure (folders are created as they get their first file):
  ```
  src/
    core/        # pure logic: squares, coords, notation, drills (no UI imports)
    components/  # Board, PromptDisplay, ScoreBar, ...
    modes/       # one folder per training mode
    state/       # settings, stats, persistence
    styles/
  ```

**Done when:** a "BoardSight — coming soon" page is live and CI is green.

---

## Iteration 1 — MVP: "Find the Square"

**Goal:** the single most valuable drill, done well.

**Core module (`src/core`)**

- [x] `Square` type, `fileIndex`, `rankIndex`, `fromIndices`, `isSquare`, `isLight` (done early in iteration 0)
- [ ] Random square generator that never repeats the previous square
- [ ] Unit tests covering all 64 squares

**Board**

- [ ] SVG 8×8 board, responsive (fits phone and desktop)
- [ ] Click/tap → square mapping that works in **both orientations**
- [ ] Toggle: show/hide rank and file labels on the board edge

**Drill**

- [ ] Shows a target (e.g. **`c6`**) in large type
- [ ] User clicks a square → instant feedback (green flash = correct; red flash plus the correct square shown = wrong)
- [ ] Timed run (default 30 s): count correct and wrong answers
- [ ] End screen: score, accuracy, average reaction time, "Play again"
- [ ] Orientation selector: White / Black / Random per run

**Done when:** a user can open the site, press Start, run a 30-second drill from either side, and see their score.

---

## Iteration 2 — "Name the Square" + Settings

**Goal:** train the reverse direction and make the app configurable.

- [ ] **Name the Square mode:** one square is highlighted, and the user types its name (`e4`)
  - Keyboard input: a file key then a rank key, auto-submits after 2 characters
  - Mobile: on-screen 8+8 button pad (a–h, 1–8)
- [ ] **Light or Dark?** mini-mode: name shown, user answers light or dark (a classic visualization drill)
- [ ] Settings panel, saved to `localStorage`:
  - Run length (15 / 30 / 60 s / untimed / N questions)
  - Orientation default
  - Coordinates on/off
  - Board theme (2–3 color schemes)
  - Sound on/off (simple feedback beeps)
- [ ] Mode select home screen
- [ ] Personal best per mode/settings combo
- [ ] Playwright smoke test: start each mode, answer, finish

**Done when:** both drill directions work on desktop (keyboard) and mobile (touch), and settings survive a page reload.

---

## Iteration 3 — Stats & Progress

**Goal:** make improvement visible.

- [ ] Record every answer: square, mode, orientation, correct, reaction time (ms), timestamp
- [ ] Storage layer behind an interface (`localStorage` → IndexedDB when data grows)
- [ ] **Heatmap view:** 64-square board colored by accuracy or by average reaction time, switchable by orientation
- [ ] History chart: score per session over time
- [ ] Weakest-squares list (top 5 slowest or most-missed)
- [ ] Export/import stats as JSON (backup, device transfer)
- [ ] Reset stats

**Done when:** after a few sessions, a user can see which squares they're slowest on, from each side.

---

## Iteration 4 — Adaptive & Focused Training

**Goal:** spend practice time where it helps most.

- [ ] **Adaptive selection:** weighted random choice favoring squares that are slow or often wrong, plus a little randomness so no square is neglected
- [ ] Optional spaced-repetition-style scheduling per square
- [ ] **Focus sets:** restrict drills to
  - a single file or rank (e.g. "only the d-file")
  - board halves or quadrants (kingside, queenside, own half)
  - diagonals (e.g. a1–h8, the long diagonals)
  - custom selection (click squares to include)
- [ ] "Practice my weak squares" one-click button from the stats page

**Done when:** the adaptive mode measurably shifts question frequency toward weak squares (checked by a unit test on the selector).

---

## Iteration 5 — Moves & Notation

**Goal:** go from squares to real chess notation, such as `Rb4`, `Nxf3` and `O-O`.

- [ ] Core: minimal SAN parser/formatter (piece letter, capture, destination, promotion, check, castling)
- [ ] **Find the move target:** prompt `Rb4` → click b4 (the piece letter is shown as an icon for context)
- [ ] **Piece reach:** a piece is placed on a square; click every square it attacks or can move to (knight forks, bishop diagonals)
- [ ] **Name the move:** an animated piece moves on an otherwise empty board; type the SAN (`Nf3`)
- [ ] **Read a game:** step through a short famous game in notation only; at each move, click the destination square, with the board updating afterward
- [ ] Piece-letter localization (EN `KQRBN`, DE `KDTLS`, FR `RDTFC`, …) and figurine notation option

**Done when:** a user can drill destination squares from real move notation, in their own language's piece letters.

---

## Iteration 6 — Voice

**Goal:** train the "hear it / say it" loop the project is named for.

- [ ] **Listen mode:** text-to-speech (Web Speech API) reads the square or move aloud with no visual prompt, and the user clicks
- [ ] **Speak mode:** a square is highlighted; the user says it aloud, and speech recognition checks the answer
  - Grammar/normalization for "e four", "echo four", "e4", German "e vier", etc.
  - Graceful fallback where speech recognition isn't supported (feature detection)
- [ ] Voice and language settings
- [ ] Hands-free continuous mode (speak → next → speak)

**Done when:** a user can do a full drill without reading text, and another without typing or clicking (in supported browsers).

---

## Iteration 7 — Visualization / Blindfold

**Goal:** build an internal board, with no board on screen.

- [ ] **No-board mode:** questions answered without any board shown, such as:
  - "Light or dark: f5?"
  - "Are c3 and f6 on the same diagonal?"
  - "Knight on g1: how many moves to reach e5?"
  - "Which square is a knight's move from b1 and c3?"
- [ ] **Fading board:** the board slowly loses coordinates, then square colors, then becomes invisible as accuracy rises
- [ ] **Blindfold move sequence:** apply a sequence of moves mentally, then answer "where is the bishop now?"

**Done when:** at least 3 blindfold question types are in place, with stats tracked like the other modes.

---

## Iteration 8 — Polish & Reach

- [ ] PWA: installable, works offline
- [ ] Accessibility: full keyboard play, screen-reader labels, color-blind-safe feedback (shapes or icons, not only red/green), reduced-motion support
- [ ] UI internationalization (EN, DE to start)
- [ ] Dark mode
- [ ] Onboarding: a 60-second interactive tutorial for absolute beginners ("files are letters, ranks are numbers")
- [ ] Performance budget (fast first load on mobile), Lighthouse checks in CI

---

## Iteration 9+ — Optional / Community (needs a backend)

Only if there's demand; each item needs a backend decision (e.g. Supabase / Cloudflare D1).

- [ ] Accounts and cross-device sync
- [ ] Daily challenge (same sequence for everyone) with a leaderboard
- [ ] Shareable result cards ("I found 42 squares in 30 s as Black")
- [ ] Achievements and streaks (daily practice streak)
- [ ] Lichess/Chess.com puzzle import to drill notation from real positions

---

## Non-goals (for now)

- Playing full chess games or an engine
- Opening/tactics training beyond what's needed for notation drills
- Native mobile apps (the PWA covers this)

## Open decisions

1. ~~UI framework~~: decided, **Svelte**.
2. ~~Hosting provider~~: decided, **GitHub Pages**.
3. **Default notation language:** English letters with a localization switch (planned), or follow the browser locale?
4. **License:** MIT or other.
