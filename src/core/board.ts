// Mapping between squares and on-screen grid positions.
import { fileIndex, fromIndices, rankIndex, type Square } from './squares'

export type Orientation = 'white' | 'black'

/** Screen grid position; (0, 0) is the top-left cell. */
export interface GridPosition {
  col: number
  row: number
}

/** The square displayed at a screen grid position. */
export function squareAt(col: number, row: number, orientation: Orientation): Square {
  return orientation === 'white' ? fromIndices(col, 7 - row) : fromIndices(7 - col, row)
}

/** Where a square is displayed on screen. */
export function gridPosition(sq: Square, orientation: Orientation): GridPosition {
  return orientation === 'white'
    ? { col: fileIndex(sq), row: 7 - rankIndex(sq) }
    : { col: 7 - fileIndex(sq), row: rankIndex(sq) }
}
