import { describe, expect, it } from 'vitest'
import { SQUARES, fileIndex, fromIndices, isLight, isSquare, rankIndex } from './squares'

describe('squares', () => {
  it('has 64 unique squares', () => {
    expect(SQUARES).toHaveLength(64)
    expect(new Set(SQUARES).size).toBe(64)
  })

  it('round-trips every square through indices', () => {
    for (const sq of SQUARES) {
      expect(fromIndices(fileIndex(sq), rankIndex(sq))).toBe(sq)
    }
  })

  it('validates square names', () => {
    expect(isSquare('e4')).toBe(true)
    expect(isSquare('i1')).toBe(false)
    expect(isSquare('a9')).toBe(false)
    expect(isSquare('E4')).toBe(false)
  })

  it('knows square colors', () => {
    expect(isLight('a1')).toBe(false)
    expect(isLight('h1')).toBe(true)
    expect(isLight('d1')).toBe(true)
    expect(isLight('e1')).toBe(false)
    expect(SQUARES.filter(isLight)).toHaveLength(32)
  })

  it('rejects out-of-range indices', () => {
    expect(() => fromIndices(8, 0)).toThrow(RangeError)
  })
})
