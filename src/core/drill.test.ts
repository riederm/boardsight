import { describe, expect, it } from 'vitest'
import { judge, randomSquare, summarize } from './drill'
import { SQUARES } from './squares'

describe('randomSquare', () => {
  it('can produce every square', () => {
    const seen = new Set(SQUARES.map((_, i) => randomSquare(undefined, () => i / 64)))
    expect(seen.size).toBe(64)
  })

  it('never repeats the previous square', () => {
    for (const prev of SQUARES) {
      for (let i = 0; i < 63; i++) {
        expect(randomSquare(prev, () => i / 63)).not.toBe(prev)
      }
    }
  })

  it('stays in range for rng values close to 1', () => {
    expect(SQUARES).toContain(randomSquare('a1', () => 0.999999999))
  })
})

describe('judge', () => {
  it('marks matching clicks as correct', () => {
    expect(judge('e4', 'e4', 800)).toEqual({
      target: 'e4',
      clicked: 'e4',
      correct: true,
      reactionMs: 800,
    })
    expect(judge('e4', 'd4', 500).correct).toBe(false)
  })
})

describe('summarize', () => {
  it('handles an empty run', () => {
    expect(summarize([])).toEqual({ correct: 0, wrong: 0, accuracy: null, avgReactionMs: null })
  })

  it('averages reaction time over correct answers only', () => {
    const s = summarize([judge('a1', 'a1', 1000), judge('b2', 'b2', 2000), judge('c3', 'c4', 100)])
    expect(s.correct).toBe(2)
    expect(s.wrong).toBe(1)
    expect(s.accuracy).toBeCloseTo(2 / 3)
    expect(s.avgReactionMs).toBe(1500)
  })
})
