import { describe, expect, it } from 'vitest'
import { judge, randomTarget, summarize } from './drill'
import type { Square } from './squares'
import { targetLabel, targetPool, type Target, type TargetSet } from './targets'

const sq = (square: Square): Target => ({ kind: 'square', square })

describe('randomTarget', () => {
  it.each<TargetSet>(['squares', 'files', 'ranks', 'lines'])(
    'can produce every target (%s)',
    (set) => {
      const n = targetPool(set).length
      const seen = new Set(
        [...Array(n).keys()].map((i) => targetLabel(randomTarget(set, undefined, () => i / n))),
      )
      expect(seen.size).toBe(n)
    },
  )

  it.each<TargetSet>(['squares', 'files', 'ranks', 'lines'])(
    'never repeats the previous target (%s)',
    (set) => {
      const pool = targetPool(set)
      for (const prev of pool) {
        for (let i = 0; i < pool.length - 1; i++) {
          const t = randomTarget(set, prev, () => i / (pool.length - 1))
          expect(targetLabel(t)).not.toBe(targetLabel(prev))
        }
      }
    },
  )

  it('stays in range for rng values close to 1', () => {
    expect(targetPool('squares')).toContainEqual(
      randomTarget('squares', sq('a1'), () => 0.999999999),
    )
  })
})

describe('judge', () => {
  it('accepts only the target square in square drills', () => {
    expect(judge(sq('e4'), 'e4', 800)).toEqual({
      target: sq('e4'),
      clicked: 'e4',
      correct: true,
      reactionMs: 800,
    })
    expect(judge(sq('e4'), 'd4', 500).correct).toBe(false)
  })

  it('accepts any square on the target line', () => {
    expect(judge({ kind: 'file', file: 'c' }, 'c7', 300).correct).toBe(true)
    expect(judge({ kind: 'file', file: 'c' }, 'd7', 300).correct).toBe(false)
    expect(judge({ kind: 'rank', rank: '6' }, 'h6', 300).correct).toBe(true)
    expect(judge({ kind: 'rank', rank: '6' }, 'h5', 300).correct).toBe(false)
  })
})

describe('summarize', () => {
  it('handles an empty run', () => {
    expect(summarize([])).toEqual({ correct: 0, wrong: 0, accuracy: null, avgReactionMs: null })
  })

  it('averages reaction time over correct answers only', () => {
    const s = summarize([
      judge(sq('a1'), 'a1', 1000),
      judge(sq('b2'), 'b2', 2000),
      judge(sq('c3'), 'c4', 100),
    ])
    expect(s.correct).toBe(2)
    expect(s.wrong).toBe(1)
    expect(s.accuracy).toBeCloseTo(2 / 3)
    expect(s.avgReactionMs).toBe(1500)
  })
})
