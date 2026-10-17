// Pure square/coordinate logic. No UI imports allowed in src/core.

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

export type File = (typeof FILES)[number]
export type Rank = (typeof RANKS)[number]
export type Square = `${File}${Rank}`

/** All 64 squares, a1..h1, a2..h2, ..., a8..h8. */
export const SQUARES: readonly Square[] = RANKS.flatMap((r) =>
  FILES.map((f) => `${f}${r}` as Square),
)

export function isSquare(value: string): value is Square {
  return /^[a-h][1-8]$/.test(value)
}

/** 0-based file index (a = 0). */
export function fileIndex(sq: Square): number {
  return sq.charCodeAt(0) - 97
}

/** 0-based rank index (rank 1 = 0). */
export function rankIndex(sq: Square): number {
  return sq.charCodeAt(1) - 49
}

export function fromIndices(file: number, rank: number): Square {
  if (file < 0 || file > 7 || rank < 0 || rank > 7) {
    throw new RangeError(`Square indices out of range: (${file}, ${rank})`)
  }
  return `${FILES[file]}${RANKS[rank]}`
}

/** a1 is dark, h1 is light. */
export function isLight(sq: Square): boolean {
  return (fileIndex(sq) + rankIndex(sq)) % 2 === 1
}
