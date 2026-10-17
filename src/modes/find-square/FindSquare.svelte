<script lang="ts">
  import { onDestroy } from 'svelte'
  import Board, { type SquareMark } from '../../components/Board.svelte'
  import type { Orientation } from '../../core/board'
  import { judge, randomSquare, summarize, type Answer } from '../../core/drill'
  import type { Square } from '../../core/squares'

  type OrientationChoice = Orientation | 'random'

  const RUN_SECONDS = 30
  /** How long the correct square stays revealed after a miss. */
  const REVEAL_MS = 700

  let phase = $state<'setup' | 'running' | 'finished'>('setup')

  // Settings (persisted in iteration 2)
  let orientationChoice = $state<OrientationChoice>('white')
  let showCoordinates = $state(true)

  // Run state
  let orientation = $state<Orientation>('white')
  let target = $state<Square>('e4')
  let answers = $state<Answer[]>([])
  let marks = $state<Partial<Record<Square, SquareMark>>>({})
  let markKey = $state(0)
  let revealing = $state(false)
  let endsAt = $state(0)
  let now = $state(0)

  let promptedAt = 0
  let frame = 0
  let revealTimer: ReturnType<typeof setTimeout> | undefined

  const summary = $derived(summarize(answers))
  const misses = $derived(answers.filter((a) => !a.correct))
  const remainingMs = $derived(Math.max(0, endsAt - now))
  const boardOrientation = $derived(
    phase === 'setup' && orientationChoice !== 'random' ? orientationChoice : orientation,
  )

  function start() {
    orientation =
      orientationChoice === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : orientationChoice
    answers = []
    marks = {}
    revealing = false
    phase = 'running'
    now = performance.now()
    endsAt = now + RUN_SECONDS * 1000
    target = randomSquare()
    promptedAt = now
    frame = requestAnimationFrame(tick)
  }

  function tick(t: number) {
    now = t
    if (now >= endsAt) finish()
    else frame = requestAnimationFrame(tick)
  }

  function stopTimers() {
    cancelAnimationFrame(frame)
    clearTimeout(revealTimer)
  }

  function finish() {
    stopTimers()
    revealing = false
    marks = {}
    phase = 'finished'
  }

  function abort() {
    stopTimers()
    revealing = false
    marks = {}
    phase = 'setup'
  }

  function nextTarget() {
    target = randomSquare(target)
    promptedAt = performance.now()
  }

  function handleSquare(sq: Square) {
    if (phase !== 'running' || revealing) return
    const answer = judge(target, sq, performance.now() - promptedAt)
    answers.push(answer)
    markKey++
    if (answer.correct) {
      marks = { [sq]: 'correct' }
      nextTarget()
    } else {
      marks = { [sq]: 'wrong', [target]: 'reveal' }
      revealing = true
      revealTimer = setTimeout(() => {
        revealing = false
        marks = {}
        nextTarget()
      }, REVEAL_MS)
    }
  }

  function handleKey(event: KeyboardEvent) {
    if (phase === 'running' && event.key === 'Escape') {
      abort()
    } else if (phase !== 'running' && (event.key === 'Enter' || event.key === ' ')) {
      // Let focused controls handle their own activation.
      if (event.target instanceof HTMLElement && event.target.closest('button, input, label'))
        return
      event.preventDefault()
      start()
    }
  }

  function formatSeconds(ms: number | null) {
    return ms === null ? '–' : `${(ms / 1000).toFixed(2)} s`
  }

  onDestroy(stopTimers)
</script>

<svelte:window onkeydown={handleKey} />

<section class="drill">
  <div class="hud">
    {#if phase === 'running'}
      <span class="stat"><strong>{summary.correct}</strong> correct</span>
      <span class="time" class:low={remainingMs < 5000}>{Math.ceil(remainingMs / 1000)}s</span>
      <span class="stat"><strong>{summary.wrong}</strong> wrong</span>
    {:else}
      <span class="stat">Find the Square</span>
    {/if}
  </div>
  <div class="progress" aria-hidden="true">
    <div
      class="bar"
      style:width="{phase === 'running' ? (remainingMs / (RUN_SECONDS * 1000)) * 100 : 100}%"
    ></div>
  </div>

  <div class="prompt" aria-live="polite">
    {#if phase === 'running'}
      <span class="target" class:missed={revealing}>{target}</span>
    {:else if phase === 'setup'}
      <span class="hint">Click the named square, as fast as you can.</span>
    {:else}
      <span class="hint">Time's up!</span>
    {/if}
  </div>

  <div class="board-wrap">
    <Board
      orientation={boardOrientation}
      {showCoordinates}
      {marks}
      {markKey}
      onSquare={phase === 'running' ? handleSquare : undefined}
    />

    {#if phase === 'finished'}
      <div class="overlay">
        <div class="card">
          <div class="score">{summary.correct}</div>
          <div class="score-label">squares found as {orientation}</div>
          <dl>
            <div>
              <dt>Accuracy</dt>
              <dd>
                {summary.accuracy === null ? '–' : `${Math.round(summary.accuracy * 100)}%`}
              </dd>
            </div>
            <div>
              <dt>Avg. time</dt>
              <dd>{formatSeconds(summary.avgReactionMs)}</dd>
            </div>
            <div>
              <dt>Wrong</dt>
              <dd>{summary.wrong}</dd>
            </div>
          </dl>
          {#if misses.length}
            <p class="misses">
              Missed:
              {#each misses as m, i (i)}
                <span class="miss">{m.target}<small>(clicked {m.clicked})</small></span>
              {/each}
            </p>
          {/if}
          <div class="actions">
            <button class="primary" onclick={start}>Play again</button>
            <button onclick={() => (phase = 'setup')}>Settings</button>
          </div>
        </div>
      </div>
    {/if}
  </div>

  {#if phase === 'setup'}
    <div class="settings">
      <fieldset class="segmented">
        <legend>Play as</legend>
        {#each ['white', 'black', 'random'] as const as choice (choice)}
          <label class:selected={orientationChoice === choice}>
            <input type="radio" bind:group={orientationChoice} value={choice} />
            {choice[0].toUpperCase() + choice.slice(1)}
          </label>
        {/each}
      </fieldset>
      <label class="toggle">
        <input type="checkbox" bind:checked={showCoordinates} />
        Show coordinates
      </label>
      <button class="primary start" onclick={start}>Start · {RUN_SECONDS}s</button>
    </div>
  {:else if phase === 'running'}
    <div class="settings">
      <button onclick={abort}>Stop <kbd>Esc</kbd></button>
    </div>
  {/if}
</section>

<style>
  .drill {
    width: min(100%, 34rem, calc(100svh - 15rem));
    min-width: min(100%, 18rem);
    margin: 0 auto;
  }

  .hud {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    min-height: 2rem;
  }

  .hud .stat:only-child {
    margin: 0 auto;
  }

  .hud strong {
    color: var(--fg);
    font-size: 1.25rem;
  }

  .time {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--fg);
  }

  .time.low {
    color: var(--wrong);
  }

  .progress {
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }

  .bar {
    height: 100%;
    background: var(--accent);
  }

  .prompt {
    display: grid;
    place-items: center;
    height: 5.5rem;
  }

  .target {
    font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 4rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.02em;
  }

  .target.missed {
    color: var(--reveal);
  }

  .hint {
    color: var(--muted);
    font-size: 1.1rem;
  }

  .board-wrap {
    position: relative;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: color-mix(in srgb, var(--bg) 55%, transparent);
    backdrop-filter: blur(2px);
    border-radius: 4px;
  }

  .card {
    width: min(100%, 22rem);
    max-height: 100%;
    overflow-y: auto;
    padding: 1.25rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
    text-align: center;
  }

  .score {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1;
  }

  .score-label {
    color: var(--muted);
  }

  dl {
    display: flex;
    justify-content: space-around;
    margin: 1rem 0;
  }

  dt {
    font-size: 0.8rem;
    color: var(--muted);
  }

  dd {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .misses {
    font-size: 0.9rem;
    color: var(--muted);
  }

  .miss {
    display: inline-block;
    margin: 0 0.25rem;
    font-weight: 600;
    color: var(--fg);
  }

  .miss small {
    margin-left: 0.2em;
    font-weight: 400;
    color: var(--muted);
  }

  .actions,
  .settings {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    align-items: center;
  }

  .settings {
    margin-top: 1rem;
  }

  button {
    font: inherit;
    padding: 0.6rem 1.1rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--fg);
    cursor: pointer;
  }

  button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
  }

  .start {
    min-width: 9rem;
  }

  kbd {
    font-size: 0.75rem;
    color: var(--muted);
  }

  .segmented {
    display: flex;
    margin: 0;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .segmented legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .segmented label {
    padding: 0.6rem 0.9rem;
    cursor: pointer;
    background: var(--surface);
  }

  .segmented label + label {
    border-left: 1px solid var(--border);
  }

  .segmented label.selected {
    background: var(--accent);
    color: #fff;
    font-weight: 600;
  }

  .segmented label:has(:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .segmented input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .toggle {
    display: flex;
    gap: 0.4rem;
    align-items: center;
    cursor: pointer;
  }
</style>
