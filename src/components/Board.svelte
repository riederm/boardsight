<script lang="ts" module>
  export type SquareMark = 'correct' | 'wrong' | 'reveal'
</script>

<script lang="ts">
  import { gridPosition, squareAt, type Orientation } from '../core/board'
  import { FILES, isLight, type Square } from '../core/squares'

  interface Props {
    orientation: Orientation
    showCoordinates?: boolean
    marks?: Partial<Record<Square, SquareMark>>
    /** Change this to replay mark animations, even on the same squares. */
    markKey?: number
    onSquare?: (sq: Square) => void
  }

  let { orientation, showCoordinates = true, marks = {}, markKey = 0, onSquare }: Props = $props()

  const cells = [...Array(64).keys()].map((i) => ({ col: i % 8, row: Math.floor(i / 8) }))
  const markedSquares = $derived(Object.entries(marks) as [Square, SquareMark][])

  // One handler for the whole board: map the pointer position to a grid cell.
  function handlePointerDown(event: PointerEvent) {
    if (!onSquare || event.button !== 0) return
    const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect()
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * 8)
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * 8)
    if (col < 0 || col > 7 || row < 0 || row > 7) return
    event.preventDefault()
    onSquare(squareAt(col, row, orientation))
  }
</script>

<svg
  class="board"
  class:interactive={!!onSquare}
  viewBox="0 0 8 8"
  role="application"
  aria-label="Chess board, {orientation} at the bottom"
  onpointerdown={handlePointerDown}
>
  {#each cells as { col, row } (col * 8 + row)}
    {@const sq = squareAt(col, row, orientation)}
    <rect x={col} y={row} width="1" height="1" class={isLight(sq) ? 'light' : 'dark'} />
  {/each}

  {#if showCoordinates}
    {#each FILES.keys() as col (col)}
      {@const sq = squareAt(col, 7, orientation)}
      <text x={col + 0.95} y={7.94} text-anchor="end" class={isLight(sq) ? 'on-light' : 'on-dark'}
        >{sq[0]}</text
      >
    {/each}
    {#each FILES.keys() as row (row)}
      {@const sq = squareAt(0, row, orientation)}
      <text x={0.05} y={row + 0.24} class={isLight(sq) ? 'on-light' : 'on-dark'}>{sq[1]}</text>
    {/each}
  {/if}

  {#key markKey}
    {#each markedSquares as [sq, mark] (sq)}
      {@const { col, row } = gridPosition(sq, orientation)}
      <rect x={col} y={row} width="1" height="1" class="mark {mark}" />
    {/each}
  {/key}
</svg>

<style>
  .board {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 4px;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .interactive {
    cursor: pointer;
  }

  .light {
    fill: var(--light-square);
  }

  .dark {
    fill: var(--dark-square);
  }

  text {
    font-size: 0.22px;
    font-weight: 600;
    pointer-events: none;
  }

  .on-light {
    fill: var(--dark-square);
  }

  .on-dark {
    fill: var(--light-square);
  }

  .mark {
    pointer-events: none;
  }

  .correct {
    fill: var(--correct);
    animation: fade 350ms ease-out forwards;
  }

  .wrong {
    fill: var(--wrong);
    opacity: 0.75;
  }

  .reveal {
    fill: var(--reveal);
    fill-opacity: 0.45;
    stroke: var(--reveal);
    stroke-width: 0.08px;
    animation: pulse 350ms ease-in-out 2 alternate;
  }

  @keyframes fade {
    from {
      opacity: 0.8;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes pulse {
    to {
      fill-opacity: 0.85;
    }
  }
</style>
