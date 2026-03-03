// Flat-top axial hex coordinates.
// Pixel layout: x = SIZE * 1.5 * q,  y = SIZE * √3 * (r + q/2)
// With flat-top cells the overall board (radius N) has a single hex at the very
// top and bottom apex, so the queen positions read as the board's pointed tips.

export const HEX_SIZE = 40

/** Ring number of a hex (0 = center, 1..5 = rings). */
export function hexRing(q: number, r: number): number {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))
}

/** All hexes within `radius` rings, with their ring number. */
export function generateHexGrid(
  radius: number,
): Array<{ q: number; r: number; ring: number }> {
  const hexes: Array<{ q: number; r: number; ring: number }> = []
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius)
    const r2 = Math.min(radius, -q + radius)
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r, ring: hexRing(q, r) })
    }
  }
  return hexes
}

/** Pixel center of a flat-top hex at axial (q, r). */
export function hexToPixel(q: number, r: number): { x: number; y: number } {
  return {
    x: HEX_SIZE * 1.5 * q,
    y: HEX_SIZE * Math.sqrt(3) * (r + q / 2),
  }
}

/**
 * SVG `points` string for a flat-top hexagon centered at (cx, cy).
 * `inset` shrinks the hex inward by that many pixels (useful for gaps/highlights).
 */
export function hexCornerPoints(cx: number, cy: number, inset = 0): string {
  const s = HEX_SIZE - inset
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const deg = 60 * i // 0° offset → first corner at right (flat-top)
    const rad = (Math.PI / 180) * deg
    pts.push(`${(cx + s * Math.cos(rad)).toFixed(2)},${(cy + s * Math.sin(rad)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** The six neighbour directions in axial coordinates. */
export const NEIGHBOR_OFFSETS: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
]

/**
 * Round fractional axial coords to the nearest hex.
 * Uses the cube-coordinate rounding algorithm.
 */
export function hexRound(fq: number, fr: number): { q: number; r: number } {
  const fs = -fq - fr
  let rq = Math.round(fq)
  let rr = Math.round(fr)
  let rs = Math.round(fs)

  const dq = Math.abs(rq - fq)
  const dr = Math.abs(rr - fr)
  const ds = Math.abs(rs - fs)

  if (dq > dr && dq > ds) {
    rq = -rr - rs
  } else if (dr > ds) {
    rr = -rq - rs
  }
  return { q: rq, r: rr }
}

/** Convert flat-top pixel coords back to the nearest axial hex. */
export function pixelToHex(x: number, y: number): { q: number; r: number } {
  const fq = x / (HEX_SIZE * 1.5)
  const fr = y / (HEX_SIZE * Math.sqrt(3)) - fq / 2
  return hexRound(fq, fr)
}

/**
 * Valid moves for a piece at (q, r) in normal mode:
 *   • one step to an adjacent hex
 *   • destination ring ≤ current ring (never outward)
 *   • within the board (ring ≤ boardRadius)
 *   • not occupied by another piece
 */
export function getValidMoves(
  q: number,
  r: number,
  occupiedKeys: ReadonlySet<string>,
  boardRadius: number,
): Array<{ q: number; r: number }> {
  const currentRing = hexRing(q, r)
  return NEIGHBOR_OFFSETS.map(([dq, dr]) => ({ q: q + dq, r: r + dr })).filter(
    ({ q: nq, r: nr }) => {
      const ring = hexRing(nq, nr)
      return ring <= currentRing && ring <= boardRadius && !occupiedKeys.has(`${nq},${nr}`)
    },
  )
}

/** Fill colour for a hex based on its ring number and hover state. */
export function ringFillColor(ring: number, hovered: boolean): string {
  if (ring === 0) return hovered ? '#F7D84A' : '#F4C430' // center: gold
  const isOdd = ring % 2 === 1
  if (isOdd) return hovered ? '#F5E8C8' : '#E8D5A8' // light tan (rings 1, 3, 5)
  return hovered ? '#C8A070' : '#B89060' // medium tan (rings 2, 4, 6)
}
