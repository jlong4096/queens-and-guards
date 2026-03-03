import { useState, useRef } from 'react'
import type { GamePiece, MoveMode, PieceType, TurnColor } from '../types'
import {
  generateHexGrid,
  hexToPixel,
  hexCornerPoints,
  ringFillColor,
  getValidMoves,
  pixelToHex,
} from '../utils/hexGrid'
import { BOARD_RADIUS } from '../constants'
import PieceIcon from './PieceIcon'
import StartMarker from './StartMarker'

const HEX_DATA = generateHexGrid(BOARD_RADIUS)

// Flat-top board with BOARD_RADIUS=5, HEX_SIZE=40:
//   x extent: ±(1.5*40*5 + 40) = ±340  → pad to ±360  (width  720)
//   y extent: ±(√3*40*5 + √3*40/2) ≈ ±381 → pad to ±400 (height 800)
const VB = '-360 -400 720 800'

interface DragState {
  pieceId: string
  originQ: number
  originR: number
  svgX: number
  svgY: number
}

interface Props {
  pieces: GamePiece[]
  mode: MoveMode
  currentTurn: TurnColor
  /** Admin mode: which piece is currently selected */
  selectedId: string | null
  /** "q,r" → PieceType for each starting hex */
  startPositions: Map<string, PieceType>
  /** Called when a piece is successfully moved (both modes) */
  onDrop: (pieceId: string, toQ: number, toR: number) => void
  /** Admin mode: called whenever any hex is clicked */
  onHexClick: (q: number, r: number) => void
}

export default function HexBoard({
  pieces,
  mode,
  currentTurn,
  selectedId,
  startPositions,
  onDrop,
  onHexClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [validMoveSet, setValidMoveSet] = useState<ReadonlySet<string>>(new Set())

  // ── Helpers ────────────────────────────────────────────────────────────
  const pieceMap = new Map(pieces.map((p) => [`${p.q},${p.r}`, p]))
  const selectedPiece = selectedId ? (pieces.find((p) => p.id === selectedId) ?? null) : null
  const isDragging = dragState !== null

  function getSvgCoords(e: MouseEvent): { x: number; y: number } {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    return pt.matrixTransform(ctm.inverse())
  }

  function pieceIsCurrentTurn(piece: GamePiece): boolean {
    return currentTurn === 'red'
      ? piece.type === 'red_queen' || piece.type === 'red_guard'
      : piece.type === 'blue_queen' || piece.type === 'blue_guard'
  }

  // ── Normal-mode drag handlers ───────────────────────────────────────────
  function handleSvgMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (mode !== 'normal') return
    const svgPt = getSvgCoords(e.nativeEvent)
    const { q, r } = pixelToHex(svgPt.x, svgPt.y)
    const piece = pieceMap.get(`${q},${r}`) ?? null
    if (!piece || !pieceIsCurrentTurn(piece)) return

    const occupiedKeys = new Set(pieces.filter((p) => p.id !== piece.id).map((p) => `${p.q},${p.r}`))
    const moves = getValidMoves(q, r, occupiedKeys, BOARD_RADIUS)
    if (moves.length === 0) return // stuck piece — don't start drag

    e.preventDefault()
    setDragState({ pieceId: piece.id, originQ: q, originR: r, svgX: svgPt.x, svgY: svgPt.y })
    setValidMoveSet(new Set(moves.map(({ q: mq, r: mr }) => `${mq},${mr}`)))
  }

  function handleSvgMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragState) return
    const svgPt = getSvgCoords(e.nativeEvent)
    setDragState((prev) => (prev ? { ...prev, svgX: svgPt.x, svgY: svgPt.y } : null))
  }

  function completeDrop(e: MouseEvent | React.MouseEvent) {
    if (!dragState) return
    const raw = 'nativeEvent' in e ? e.nativeEvent : e
    const svgPt = getSvgCoords(raw)
    const { q, r } = pixelToHex(svgPt.x, svgPt.y)
    const isOrigin = q === dragState.originQ && r === dragState.originR
    if (!isOrigin && validMoveSet.has(`${q},${r}`)) {
      onDrop(dragState.pieceId, q, r)
    }
    setDragState(null)
    setValidMoveSet(new Set())
  }

  // ── Cursor logic ────────────────────────────────────────────────────────
  const hoveredPiece = hoveredKey ? (pieceMap.get(hoveredKey) ?? null) : null
  const canGrab =
    mode === 'normal' && !isDragging && hoveredPiece !== null && pieceIsCurrentTurn(hoveredPiece)
  const svgCursor = isDragging ? 'grabbing' : canGrab ? 'grab' : 'auto'

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <svg
      ref={svgRef}
      viewBox={VB}
      className="w-full h-auto select-none"
      style={{ maxWidth: '100%', cursor: svgCursor }}
      aria-label="Queens and Guards board"
      onMouseDown={handleSvgMouseDown}
      onMouseMove={handleSvgMouseMove}
      onMouseUp={completeDrop}
      onMouseLeave={() => {
        // Cancel drag if cursor leaves the SVG entirely
        if (dragState) {
          setDragState(null)
          setValidMoveSet(new Set())
        }
      }}
    >
      {/* ── 1. Background ──────────────────────────────── */}
      <circle cx="0" cy="0" r="420" fill="#1A2E1A" />

      {/* ── 2. Hex cells ────────────────────────────────── */}
      {HEX_DATA.map(({ q, r, ring }) => {
        const key = `${q},${r}`
        const { x, y } = hexToPixel(q, r)
        const hovered = hoveredKey === key

        return (
          <polygon
            key={key}
            points={hexCornerPoints(x, y, 0.5)}
            fill={ringFillColor(ring, hovered && !isDragging)}
            stroke="#3A2400"
            strokeWidth="1"
            onClick={() => mode === 'admin' && onHexClick(q, r)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
          />
        )
      })}

      {/* ── 3. Valid-move highlights (normal mode drag) ── */}
      {isDragging &&
        [...validMoveSet].map((key) => {
          const parts = key.split(',')
          const q = Number(parts[0] ?? 0)
          const r = Number(parts[1] ?? 0)
          const { x, y } = hexToPixel(q, r)
          const isHov = hoveredKey === key
          return (
            <polygon
              key={`vm-${key}`}
              points={hexCornerPoints(x, y, 2)}
              fill={isHov ? 'rgba(74,222,128,0.35)' : 'rgba(74,222,128,0.18)'}
              stroke={isHov ? '#4ADE80' : '#22C55E'}
              strokeWidth={isHov ? 2.5 : 1.5}
              style={{ pointerEvents: 'none' }}
            />
          )
        })}

      {/* ── 4. Selected-hex highlight (admin mode) ──────── */}
      {mode === 'admin' &&
        selectedPiece &&
        (() => {
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

      {/* ── 5. Admin hover-target indicator ─────────────── */}
      {mode === 'admin' &&
        selectedId &&
        hoveredKey &&
        (() => {
          const parts = hoveredKey.split(',')
          const q = Number(parts[0] ?? 0)
          const r = Number(parts[1] ?? 0)
          const occupant = pieceMap.get(hoveredKey)
          if (occupant?.id === selectedId) return null
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

      {/* ── 6. Start-position markers ────────────────────── */}
      {[...startPositions.entries()].map(([key, type]) => {
        const parts = key.split(',')
        const q = Number(parts[0] ?? 0)
        const r = Number(parts[1] ?? 0)
        const { x, y } = hexToPixel(q, r)
        return (
          <g key={`sm-${key}`} transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}>
            <StartMarker type={type} />
          </g>
        )
      })}

      {/* ── 7. Stationary pieces (all except the one being dragged) ── */}
      {pieces.map((piece) => {
        if (dragState?.pieceId === piece.id) return null
        const { x, y } = hexToPixel(piece.q, piece.r)
        const isSelected = mode === 'admin' && piece.id === selectedId
        return (
          <g
            key={piece.id}
            transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}
            style={{ pointerEvents: 'none' }}
          >
            <PieceIcon type={piece.type} isSelected={isSelected} />
          </g>
        )
      })}

      {/* ── 8. Ghost at origin while dragging ───────────── */}
      {dragState &&
        (() => {
          const piece = pieces.find((p) => p.id === dragState.pieceId)
          if (!piece) return null
          const { x, y } = hexToPixel(dragState.originQ, dragState.originR)
          return (
            <g
              transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`}
              style={{ pointerEvents: 'none' }}
            >
              <PieceIcon type={piece.type} isSelected={false} opacity={0.32} />
            </g>
          )
        })()}

      {/* ── 9. Piece following cursor ────────────────────── */}
      {dragState &&
        (() => {
          const piece = pieces.find((p) => p.id === dragState.pieceId)
          if (!piece) return null
          const x = dragState.svgX
          const y = dragState.svgY
          return (
            <g transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`} style={{ pointerEvents: 'none' }}>
              {/* soft drop shadow */}
              <circle r="16" cx="4" cy="4" fill="rgba(0,0,0,0.22)" />
              <PieceIcon type={piece.type} isSelected={false} />
            </g>
          )
        })()}
    </svg>
  )
}
