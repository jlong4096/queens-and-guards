import type { PieceType } from '../types'

interface Props {
  type: PieceType
  isSelected: boolean
}

const RED = '#DC2626'
const BLUE = '#1D4ED8'
const STROKE = 'rgba(0,0,0,0.40)'

function Crown({ color }: { color: string }) {
  return (
    <g>
      {/* Crown body */}
      <path
        d="M -12,9 L -12,0 L -8,-11 L -3,0 L 0,-14 L 3,0 L 8,-11 L 12,0 L 12,9 Z"
        fill={color}
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Jewels on each peak */}
      <circle cx="-8" cy="-13" r="2.5" fill="white" opacity="0.85" />
      <circle cx="0" cy="-16" r="2.5" fill="white" opacity="0.85" />
      <circle cx="8" cy="-13" r="2.5" fill="white" opacity="0.85" />
      {/* Base bar */}
      <rect x="-12" y="6" width="24" height="4" rx="1" fill={color} stroke={STROKE} strokeWidth="1" />
    </g>
  )
}

function Guard({ color }: { color: string }) {
  return (
    <g>
      <circle cx="0" cy="0" r="14" fill={color} stroke={STROKE} strokeWidth="2" />
      {/* Subtle highlight for depth */}
      <circle cx="-4" cy="-4" r="5" fill="white" opacity="0.18" />
    </g>
  )
}

export default function PieceIcon({ type, isSelected }: Props) {
  const isRed = type === 'red_queen' || type === 'red_guard'
  const isQueen = type === 'red_queen' || type === 'blue_queen'
  const color = isRed ? RED : BLUE
  const haloR = isQueen ? 21 : 19

  return (
    <g>
      {/* Selection halo */}
      {isSelected && (
        <>
          <circle cx="0" cy="0" r={haloR + 3} fill="rgba(251,191,36,0.25)" />
          <circle
            cx="0"
            cy="0"
            r={haloR}
            fill="none"
            stroke="#FBBF24"
            strokeWidth="3"
            opacity="0.95"
          />
        </>
      )}
      {isQueen ? <Crown color={color} /> : <Guard color={color} />}
    </g>
  )
}
