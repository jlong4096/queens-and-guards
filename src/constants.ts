import type { GamePiece } from './types'

export const BOARD_RADIUS = 5

// Ring 5 traversal (clockwise from top at (0,-5)), 30 positions total:
//   Dir (1, 0) ×5:  idx  0-4   →  (0,-5)…(4,-5)
//   Dir (0, 1) ×5:  idx  5-9   →  (5,-5)…(5,-1)
//   Dir (-1,1) ×5:  idx 10-14  →  (5, 0)…(1, 4)
//   Dir (-1,0) ×5:  idx 15-19  →  (0, 5)…(-4,5)
//   Dir (0,-1) ×5:  idx 20-24  →  (-5,5)…(-5,1)
//   Dir (1,-1) ×5:  idx 25-29  →  (-5,0)…(-1,-4)
//
// Queens  →  idx 0  (0,-5)  and  idx 15 (0,5)
// Each queen has 3 pairs of guards (±2, ±4, ±6 ring-steps):
//   ±2 steps: opponent color
//   ±4 steps: own color
//   ±6 steps: opponent color
//
// Red Queen (idx 0, 30 total):
//   +2 → idx  2: (2,-5)  blue
//   +4 → idx  4: (4,-5)  red
//   +6 → idx  6: (5,-4)  blue
//   -2 → idx 28: (-2,-3) blue
//   -4 → idx 26: (-4,-1) red
//   -6 → idx 24: (-5, 1) blue
//
// Blue Queen (idx 15):
//   +2 → idx 17: (-2, 5) red
//   +4 → idx 19: (-4, 5) blue
//   +6 → idx 21: (-5, 4) red
//   -2 → idx 13: (2,  3) red
//   -4 → idx 11: (4,  1) blue
//   -6 → idx  9: (5, -1) red

export const INITIAL_PIECES: GamePiece[] = [
  // ── Queens ──────────────────────────────────────────────
  { id: 'red_queen', type: 'red_queen', q: 0, r: -5 },
  { id: 'blue_queen', type: 'blue_queen', q: 0, r: 5 },

  // ── Guards near Red Queen ────────────────────────────────
  { id: 'bg_r1', type: 'blue_guard', q: 2, r: -5 },  // +2
  { id: 'rg_r1', type: 'red_guard', q: 4, r: -5 },   // +4
  { id: 'bg_r2', type: 'blue_guard', q: 5, r: -4 },  // +6
  { id: 'bg_l1', type: 'blue_guard', q: -2, r: -3 }, // -2
  { id: 'rg_l1', type: 'red_guard', q: -4, r: -1 },  // -4
  { id: 'bg_l2', type: 'blue_guard', q: -5, r: 1 },  // -6

  // ── Guards near Blue Queen ───────────────────────────────
  { id: 'rg_r2', type: 'red_guard', q: -2, r: 5 },   // +2
  { id: 'bg_r3', type: 'blue_guard', q: -4, r: 5 },  // +4
  { id: 'rg_r3', type: 'red_guard', q: -5, r: 4 },   // +6
  { id: 'rg_l2', type: 'red_guard', q: 2, r: 3 },    // -2
  { id: 'bg_l3', type: 'blue_guard', q: 4, r: 1 },   // -4
  { id: 'rg_l3', type: 'red_guard', q: 5, r: -1 },   // -6
]
