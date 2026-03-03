import { useState } from 'react'
import HexBoard from './components/HexBoard'
import type { GamePiece, MoveMode, TurnColor } from './types'
import { INITIAL_PIECES, START_POSITIONS } from './constants'

export default function App() {
  const [pieces, setPieces] = useState<GamePiece[]>(INITIAL_PIECES)
  const [mode, setMode] = useState<MoveMode>('normal')
  const [currentTurn, setCurrentTurn] = useState<TurnColor>('red')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ── Normal mode ─────────────────────────────────────────────────────────
  // Called by HexBoard when a piece is dragged to a valid destination.
  const handleDrop = (pieceId: string, toQ: number, toR: number) => {
    setPieces((prev) => prev.map((p) => (p.id === pieceId ? { ...p, q: toQ, r: toR } : p)))
    setCurrentTurn((t) => (t === 'red' ? 'blue' : 'red'))
  }

  // ── Admin mode ──────────────────────────────────────────────────────────
  // Called by HexBoard for every hex click in admin mode.
  const handleHexClick = (q: number, r: number) => {
    const pieceAtHex = pieces.find((p) => p.q === q && p.r === r) ?? null
    if (selectedId) {
      if (pieceAtHex?.id === selectedId) {
        setSelectedId(null) // deselect
      } else if (pieceAtHex) {
        setSelectedId(pieceAtHex.id) // switch selection
      } else {
        setPieces((prev) => prev.map((p) => (p.id === selectedId ? { ...p, q, r } : p)))
        setSelectedId(null)
      }
    } else {
      if (pieceAtHex) setSelectedId(pieceAtHex.id)
    }
  }

  // ── Mode switch ─────────────────────────────────────────────────────────
  const switchMode = (m: MoveMode) => {
    setMode(m)
    setSelectedId(null)
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setPieces(INITIAL_PIECES)
    setSelectedId(null)
    setCurrentTurn('red')
  }

  // ── Status line ─────────────────────────────────────────────────────────
  const statusText =
    mode === 'normal'
      ? `Drag a ${currentTurn} piece to move`
      : selectedId
        ? 'Click any hex to place the selected piece'
        : 'Click a piece to select it'

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center gap-3 p-4 py-6">
      <h1 className="text-amber-400 text-3xl font-bold tracking-wide">Queens &amp; Guards</h1>

      {/* ── Controls bar ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full" style={{ maxWidth: 760 }}>
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1">
          <button
            onClick={() => switchMode('normal')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              mode === 'normal'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => switchMode('admin')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              mode === 'admin'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Turn indicator — only meaningful in normal mode */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
            mode === 'normal'
              ? currentTurn === 'red'
                ? 'bg-red-900/40 text-red-300 border-red-700/50'
                : 'bg-blue-900/40 text-blue-300 border-blue-700/50'
              : 'bg-stone-800 text-stone-500 border-stone-700'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              mode === 'normal'
                ? currentTurn === 'red'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
                : 'bg-stone-600'
            }`}
          />
          {mode === 'normal' ? (currentTurn === 'red' ? "Red's turn" : "Blue's turn") : 'Admin mode'}
        </div>
      </div>

      {/* Status line */}
      <p className="text-stone-500 text-sm h-5">{statusText}</p>

      {/* ── Board ──────────────────────────────────────────────── */}
      <div className="w-full" style={{ maxWidth: 760 }}>
        <HexBoard
          pieces={pieces}
          mode={mode}
          currentTurn={currentTurn}
          selectedId={selectedId}
          startPositions={START_POSITIONS}
          onDrop={handleDrop}
          onHexClick={handleHexClick}
        />
      </div>

      {/* ── Footer controls ─────────────────────────────────────── */}
      <button
        onClick={handleReset}
        className="px-6 py-2 bg-stone-700 hover:bg-stone-600 active:bg-stone-800 text-stone-200 font-semibold rounded-lg shadow transition-colors"
      >
        Reset to Starting Positions
      </button>
    </div>
  )
}
