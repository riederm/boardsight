<script lang="ts" module>
  export type SquareMark = 'correct' | 'wrong' | 'reveal'
</script>

<script lang="ts">
  import { gridPosition, squareAt, type GridPosition, type Orientation } from '../core/board'
  import { FILES, isLight, type Square } from '../core/squares'

  interface Props {
    orientation: Orientation
    showCoordinates?: boolean
    marks?: Partial<Record<Square, SquareMark>>
    /** Change this to replay mark animations, even on the same squares. */
    markKey?: number
    onSquare?: (sq: Square) => void
    /** Highlight the whole file or rank under the mouse pointer. */
    hoverLine?: 'file' | 'rank'
  }

  let {
    orientation,
    showCoordinates = true,
    marks = {},
    markKey = 0,
    onSquare,
    hoverLine,
  }: Props = $props()

  let hovered = $state<GridPosition | null>(null)

  const cells = [...Array(64).keys()].map((i) => ({ col: i % 8, row: Math.floor(i / 8) }))
  const markedSquares = $derived(Object.entries(marks) as [Square, SquareMark][])

  // Revealed squares (a square or a whole line) get one outline around all of them.
  const revealOutline = $derived.by(() => {
    const revealed = markedSquares
      .filter(([, mark]) => mark === 'reveal')
      .map(([sq]) => gridPosition(sq, orientation))
    if (!revealed.length) return null
    const cols = revealed.map((c) => c.col)
    const rows = revealed.map((c) => c.row)
    const x = Math.min(...cols)
    const y = Math.min(...rows)
    return { x, y, width: Math.max(...cols) - x + 1, height: Math.max(...rows) - y + 1 }
  })

  // One set of handlers for the whole board: map the pointer position to a grid cell.
  function cellAt(event: PointerEvent): GridPosition | null {
    const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect()
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * 8)
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * 8)
    return col < 0 || col > 7 || row < 0 || row > 7 ? null : { col, row }
  }

  function handlePointerDown(event: PointerEvent) {
    if (!onSquare || event.button !== 0) return
    const cell = cellAt(event)
    if (!cell) return
    event.preventDefault()
    onSquare(squareAt(cell.col, cell.row, orientation))
  }

  // Touch has no hover; a highlight left behind by a tap would only mislead.
  function handlePointerMove(event: PointerEvent) {
    hovered = event.pointerType === 'touch' ? null : cellAt(event)
  }
</script>

<svg
  class="board"
  class:interactive={!!onSquare}
  viewBox="0 0 8 8"
  role="application"
  aria-label="Chess board, {orientation} at the bottom"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerleave={() => (hovered = null)}
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

  {#if hoverLine && hovered}
    <rect
      x={hoverLine === 'file' ? hovered.col : 0}
      y={hoverLine === 'rank' ? hovered.row : 0}
      width={hoverLine === 'file' ? 1 : 8}
      height={hoverLine === 'rank' ? 1 : 8}
      class="hover"
    />
  {/if}

  {#key markKey}
    {#each markedSquares as [sq, mark] (sq)}
      {@const { col, row } = gridPosition(sq, orientation)}
      <rect x={col} y={row} width="1" height="1" class="mark {mark}" />
    {/each}
    {#if revealOutline}
      {@const o = revealOutline}
      <rect
        x={o.x + 0.04}
        y={o.y + 0.04}
        width={o.width - 0.08}
        height={o.height - 0.08}
        class="mark outline"
      />
    {/if}
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

  .mark,
  .hover {
    pointer-events: none;
  }

  /* Fill only: an outline straddles the square edges and renders unevenly per line. */
  .hover {
    fill: var(--hover);
    fill-opacity: 0.4;
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
    animation: pulse 350ms ease-in-out 2 alternate;
  }

  .outline {
    fill: none;
    stroke: var(--reveal);
    stroke-width: 0.08px;
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
