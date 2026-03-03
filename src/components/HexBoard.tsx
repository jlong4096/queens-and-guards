import { useState } from 'react'
import type { GamePiece } from '../types'
import {
  generateHexGrid,
  hexToPixel,
  hexCornerPoints,
  ringFillColor,
} from '../utils/hexGrid'
import { BOARD_RADIUS } from '../constants'
import PieceIcon from './PieceIcon'

// Pre-generate board data once (stable reference)
const HEX_DATA = generateHexGrid(BOARD_RADIUS)

// Flat-top board with BOARD_RADIUS=5, HEX_SIZE=40:
//   x extent: ±(1.5*40*5 + 40) = ±340  → pad to ±360  (width  720)
//   y extent: ±(√3*40*5 + √3*40/2) = ±381 → pad to ±400 (height 800)
const VB = '-360 -400 720 800'

interface Props {
  pieces: GamePiece[]
  selectedId: string | null
  onHexClick: (q: number, r: number) => void
}

export default function HexBoard({ pieces, selectedId, onHexClick }: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  // Fast lookup: "q,r" → piece
  const pieceMap = new Map(pieces.map((p) => [`${p.q},${p.r}`, p]))
  const selectedPiece = selectedId ? (pieces.find((p) => p.id === selectedId) ?? null) : null

  // When a piece is selected and we hover an empty hex, highlight it as a target
  const isTargetHex = (q: number, r: number): boolean => {
    if (!selectedId) return false
    const occupant = pieceMap.get(`${q},${r}`)
    return !occupant || occupant.id !== selectedId
  }

  return (
    <svg
      viewBox={VB}
      className="w-full h-auto select-none"
      style={{ maxWidth: '100%' }}
      aria-label="Queens and Guards board"
    >
      {/* ── Board surround ───────────────────────────────── */}
      {/* r=420 safely covers all board corners (max corner ~382 from center) */}
      <circle cx="0" cy="0" r="420" fill="#1A2E1A" />

      {/* ── Hex cells ────────────────────────────────────── */}
      {HEX_DATA.map(({ q, r, ring }) => {
        const key = `${q},${r}`
        const { x, y } = hexToPixel(q, r)
        const hovered = hoveredKey === key
        const isTarget = hovered && isTargetHex(q, r)

        return (
          <polygon
            key={key}
            points={hexCornerPoints(x, y, 0.5)}
            fill={isTarget ? ringFillColor(ring, true) : ringFillColor(ring, hovered)}
            stroke="#3A2400"
            strokeWidth="1"
            onClick={() => onHexClick(q, r)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
            style={{ cursor: 'pointer' }}
          />
        )
      })}

      {/* ── Selected-hex inner highlight ─────────────────── */}
      {selectedPiece && (() => {
        const { x, y } = hexToPixel(selectedPiece.q, selectedPiece.r)
        return (
          <polygon
            points={hexCornerPoints(x, y, 4)}
            fill="rgba(251,191,36,0.15)"
            stroke="#FBBF24"
            strokeWidth="2.5"
            style={{ pointerEvents: 'none' }}
          />
        )
      })()}

      {/* ── Hover target ring (shows where selected piece can land) ── */}
      {selectedId && hoveredKey && (() => {
        const [qs, rs] = hoveredKey.split(',').map(Number)
        const q = qs ?? 0
        const r = rs ?? 0
        const occupant = pieceMap.get(hoveredKey)
        if (occupant?.id === selectedId) return null // hovering self
        const { x, y } = hexToPixel(q, r)
        return (
          <polygon
            points={hexCornerPoints(x, y, 4)}
            fill="rgba(251,191,36,0.1)"
            stroke="#FBBF24"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            style={{ pointerEvents: 'none' }}
          />
        )
      })()}

      {/* ── Piece icons ───────────────────────────────────── */}
      {pieces.map((piece) => {
        const { x, y } = hexToPixel(piece.q, piece.r)
        return (
          <g
            key={piece.id}
            transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}
            style={{ pointerEvents: 'none' }}
          >
            <PieceIcon type={piece.type} isSelected={piece.id === selectedId} />
          </g>
        )
      })}
    </svg>
  )
}
