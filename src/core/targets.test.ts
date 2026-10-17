import { describe, expect, it } from 'vitest'
import { SQUARES } from './squares'
import {
  isHit,
  sameTarget,
  targetLabel,
  targetName,
  targetPool,
  targetSquares,
  type Target,
} from './targets'

describe('targets', () => {
  it('has pools of the expected sizes', () => {
    expect(targetPool('squares')).toHaveLength(64)
    expect(targetPool('files')).toHaveLength(8)
    expect(targetPool('ranks')).toHaveLength(8)
    expect(targetPool('lines')).toHaveLength(16)
  })

  it('gives every target a unique label', () => {
    const all = [...targetPool('squares'), ...targetPool('lines')]
    expect(new Set(all.map(targetLabel)).size).toBe(all.length)
  })

  it('labels and names targets', () => {
    const file: Target = { kind: 'file', file: 'c' }
    const rank: Target = { kind: 'rank', rank: '6' }
    expect([targetLabel(file), targetName(file)]).toEqual(['c', 'c-file'])
    expect([targetLabel(rank), targetName(rank)]).toEqual(['6', 'rank 6'])
    expect(targetName({ kind: 'square', square: 'c6' })).toBe('c6')
  })

  it('lists the squares on a file and a rank', () => {
    expect(targetSquares({ kind: 'file', file: 'c' })).toEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      'c6',
      'c7',
      'c8',
    ])
    expect(targetSquares({ kind: 'rank', rank: '6' })).toEqual([
      'a6',
      'b6',
      'c6',
      'd6',
      'e6',
      'f6',
      'g6',
      'h6',
    ])
  })

  it('hits exactly the target squares', () => {
    for (const t of [...targetPool('squares'), ...targetPool('lines')]) {
      const expected = new Set(targetSquares(t))
      for (const sq of SQUARES) expect(isHit(t, sq)).toBe(expected.has(sq))
    }
  })

  it('compares targets by value', () => {
    expect(sameTarget({ kind: 'file', file: 'c' }, { kind: 'file', file: 'c' })).toBe(true)
    expect(sameTarget({ kind: 'file', file: 'c' }, { kind: 'rank', rank: '3' })).toBe(false)
  })
})
