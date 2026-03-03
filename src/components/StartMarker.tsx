/**
 * Faint outline marker shown permanently on each piece's starting hex.
 * Uses the exact same shape as the corresponding PieceIcon but stroke-only
 * (no fill) so the moving piece is clearly distinct when sitting on top.
 */
import type { PieceType } from '../types'
import { GUARD_RADIUS, CROWN_PATH } from './PieceIcon'

const RED = '#DC2626'
const BLUE = '#1D4ED8'

interface Props {
  type: PieceType
}

export default function StartMarker({ type }: Props) {
  const isRed = type === 'red_queen' || type === 'red_guard'
  const isQueen = type === 'red_queen' || type === 'blue_queen'
  const color = isRed ? RED : BLUE

  if (isQueen) {
    return (
      <g opacity="0.38" style={{ pointerEvents: 'none' }}>
        {/* Same crown path at same scale as PieceIcon queen, stroke only */}
        <g transform="scale(1.2)">
          <path
            d={CROWN_PATH}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="-12" y="6" width="24" height="4" rx="1" fill="none" stroke={color} strokeWidth="1" />
        </g>
      </g>
    )
  }

  return (
    <g opacity="0.38" style={{ pointerEvents: 'none' }}>
      {/* Same circle as PieceIcon guard, stroke only */}
      <circle r={GUARD_RADIUS} fill="none" stroke={color} strokeWidth="2" />
    </g>
  )
}
