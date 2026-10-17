// Drill targets: a single square, or a whole file or rank.
import { FILES, RANKS, SQUARES, type File, type Rank, type Square } from './squares'

export type Target =
  { kind: 'square'; square: Square } | { kind: 'file'; file: File } | { kind: 'rank'; rank: Rank }

/** Which targets a drill asks for. 'lines' mixes files and ranks. */
export type TargetSet = 'squares' | 'files' | 'ranks' | 'lines'

const FILE_TARGETS: readonly Target[] = FILES.map((file) => ({ kind: 'file', file }))
const RANK_TARGETS: readonly Target[] = RANKS.map((rank) => ({ kind: 'rank', rank }))

const POOLS: Record<TargetSet, readonly Target[]> = {
  squares: SQUARES.map((square) => ({ kind: 'square', square })),
  files: FILE_TARGETS,
  ranks: RANK_TARGETS,
  lines: [...FILE_TARGETS, ...RANK_TARGETS],
}

export function targetPool(set: TargetSet): readonly Target[] {
  return POOLS[set]
}

/** Short prompt text: 'c6', 'c' or '6'. Unique across all targets. */
export function targetLabel(t: Target): string {
  switch (t.kind) {
    case 'square':
      return t.square
    case 'file':
      return t.file
    case 'rank':
      return t.rank
  }
}

/** Descriptive name: 'c6', 'c-file' or 'rank 6'. */
export function targetName(t: Target): string {
  switch (t.kind) {
    case 'square':
      return t.square
    case 'file':
      return `${t.file}-file`
    case 'rank':
      return `rank ${t.rank}`
  }
}

export function targetSquares(t: Target): Square[] {
  switch (t.kind) {
    case 'square':
      return [t.square]
    case 'file':
      return RANKS.map((r) => `${t.file}${r}` as Square)
    case 'rank':
      return FILES.map((f) => `${f}${t.rank}` as Square)
  }
}

export function isHit(t: Target, sq: Square): boolean {
  switch (t.kind) {
    case 'square':
      return sq === t.square
    case 'file':
      return sq[0] === t.file
    case 'rank':
      return sq[1] === t.rank
  }
}

export function sameTarget(a: Target, b: Target): boolean {
  return targetLabel(a) === targetLabel(b)
}
