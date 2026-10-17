// Drill logic: picking targets, judging answers, summarizing a run.
import { SQUARES, type Square } from './squares'

/** Returns a float in [0, 1), like Math.random. */
export type Rng = () => number

/** Uniformly random square that is never equal to `previous`. */
export function randomSquare(previous?: Square, rng: Rng = Math.random): Square {
  const pool = previous ? SQUARES.filter((s) => s !== previous) : SQUARES
  return pool[Math.floor(rng() * pool.length)]
}

export interface Answer {
  target: Square
  clicked: Square
  correct: boolean
  reactionMs: number
}

export function judge(target: Square, clicked: Square, reactionMs: number): Answer {
  return { target, clicked, correct: target === clicked, reactionMs }
}

export interface Summary {
  correct: number
  wrong: number
  /** 0..1, or null when nothing was answered. */
  accuracy: number | null
  /** Average over correct answers only, or null when there were none. */
  avgReactionMs: number | null
}

export function summarize(answers: readonly Answer[]): Summary {
  const hits = answers.filter((a) => a.correct)
  const total = answers.length
  return {
    correct: hits.length,
    wrong: total - hits.length,
    accuracy: total ? hits.length / total : null,
    avgReactionMs: hits.length
      ? hits.reduce((sum, a) => sum + a.reactionMs, 0) / hits.length
      : null,
  }
}
