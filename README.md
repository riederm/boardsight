# BoardSight

Train chess square coordinates (`a4`, `b3`, `h6`, …) until they are muscle memory:
point at a square the moment you hear or read a move like `Rb4`, and name any square at a glance.

See [`project.plan.md`](project.plan.md) for the iterative roadmap.

## Development

Requires Node 24+.

```sh
npm install
npm run dev        # start dev server
npm test           # unit tests (Vitest)
npm run check      # type-check (svelte-check + tsc)
npm run lint       # ESLint + Prettier check
npm run format     # auto-format
npm run build      # production build into dist/
```

## Project layout

```
src/
  core/        # pure logic: squares, coords, notation, drills (no UI imports, fully unit-tested)
  components/  # Board, PromptDisplay, ScoreBar, ...
  modes/       # one folder per training mode
  state/       # settings, stats, persistence
```

## Deployment

Every push to `main` runs CI (lint, type-check, test, build) and deploys `dist/` to GitHub Pages.
One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
