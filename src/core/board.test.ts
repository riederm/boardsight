import { describe, expect, it } from 'vitest'
import { gridPosition, squareAt, type Orientation } from './board'
import { SQUARES } from './squares'

describe('board orientation', () => {
  it('puts a1 bottom-left and h8 top-right for white', () => {
    expect(squareAt(0, 7, 'white')).toBe('a1')
    expect(squareAt(7, 0, 'white')).toBe('h8')
    expect(squareAt(4, 4, 'white')).toBe('e4')
  })

  it('puts h8 bottom-left and a1 top-right for black', () => {
    expect(squareAt(0, 7, 'black')).toBe('h8')
    expect(squareAt(7, 0, 'black')).toBe('a1')
    expect(squareAt(3, 3, 'black')).toBe('e4')
  })

  it.each<Orientation>(['white', 'black'])('round-trips all 64 squares (%s)', (o) => {
    for (const sq of SQUARES) {
      const { col, row } = gridPosition(sq, o)
      expect(squareAt(col, row, o)).toBe(sq)
    }
  })
})
