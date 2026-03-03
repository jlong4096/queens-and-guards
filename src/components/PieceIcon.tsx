import type { PieceType } from '../types'

interface Props {
  type: PieceType
  isSelected: boolean
  /** 0–1: used for the drag ghost at origin */
  opacity?: number
}

const RED = '#DC2626'
const BLUE = '#1D4ED8'
const RED_DARK = '#7F1D1D'
const BLUE_DARK = '#1E3A8A'

// Radius used by both filled guard and outline start marker (kept in sync)
export const GUARD_RADIUS = 13

// Crown path data — same shape used for both filled queen and outline start marker
export const CROWN_PATH = 'M -12,9 L -12,0 L -8,-11 L -3,0 L 0,-14 L 3,0 L 8,-11 L 12,0 L 12,9 Z'

function Crown({ color, darkColor }: { color: string; darkColor: string }) {
  return (
    // Scale 1.2× to be clearly taller than a guard circle
    <g transform="scale(1.2)">
      <path
        d={CROWN_PATH}
        fill={color}
        stroke={darkColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Peak jewels */}
      <circle cx="-8" cy="-13" r="2.5" fill="white" opacity="0.82" />
      <circle cx="0" cy="-16" r="2.5" fill="white" opacity="0.82" />
      <circle cx="8" cy="-13" r="2.5" fill="white" opacity="0.82" />
      {/* Base bar */}
      <rect x="-12" y="6" width="24" height="4" rx="1" fill={color} stroke={darkColor} strokeWidth="1" />
      {/* Base sheen */}
      <line x1="-10" y1="8" x2="10" y2="8" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
    </g>
  )
}

function Guard({ color, darkColor }: { color: string; darkColor: string }) {
  return (
    <g>
      {/* Main filled circle */}
      <circle r={GUARD_RADIUS} fill={color} stroke={darkColor} strokeWidth="2.5" />
      {/* Inner decorative ring for depth */}
      <circle r={GUARD_RADIUS - 4} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      {/* 3-D highlight */}
      <circle cx={-4} cy={-4} r={4.5} fill="rgba(255,255,255,0.22)" />
    </g>
  )
}

export default function PieceIcon({ type, isSelected, opacity = 1 }: Props) {
  const isRed = type === 'red_queen' || type === 'red_guard'
  const isQueen = type === 'red_queen' || type === 'blue_queen'
  const color = isRed ? RED : BLUE
  const darkColor = isRed ? RED_DARK : BLUE_DARK
  const haloR = isQueen ? 22 : GUARD_RADIUS + 5

  return (
    <g opacity={opacity}>
      {isSelected && (
        <>
          <circle r={haloR + 3} fill="rgba(251,191,36,0.22)" />
          <circle r={haloR} fill="none" stroke="#FBBF24" strokeWidth="3" opacity="0.95" />
        </>
      )}
      {isQueen ? (
        <Crown color={color} darkColor={darkColor} />
      ) : (
        <Guard color={color} darkColor={darkColor} />
      )}
    </g>
  )
}
