import { useState } from 'react'
import HexBoard from './components/HexBoard'
import type { GamePiece } from './types'
import { INITIAL_PIECES } from './constants'

export default function App() {
  const [pieces, setPieces] = useState<GamePiece[]>(INITIAL_PIECES)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleHexClick = (q: number, r: number) => {
    const pieceAtHex = pieces.find((p) => p.q === q && p.r === r) ?? null

    if (selectedId) {
      if (pieceAtHex?.id === selectedId) {
        // Clicked the selected piece → deselect
        setSelectedId(null)
      } else if (pieceAtHex) {
        // Clicked a different piece → select it instead
        setSelectedId(pieceAtHex.id)
      } else {
        // Clicked an empty hex → move selected piece here
        setPieces((prev) => prev.map((p) => (p.id === selectedId ? { ...p, q, r } : p)))
        setSelectedId(null)
      }
    } else {
      // Nothing selected → select the piece at this hex (if any)
      if (pieceAtHex) setSelectedId(pieceAtHex.id)
    }
  }

  const handleReset = () => {
    setPieces(INITIAL_PIECES)
    setSelectedId(null)
  }

  const selectedPiece = selectedId ? (pieces.find((p) => p.id === selectedId) ?? null) : null
  const selectedLabel = selectedPiece
    ? selectedPiece.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-amber-400 text-3xl font-bold tracking-wide">Queens &amp; Guards</h1>

      {/* Status bar */}
      <div className="h-7 flex items-center">
        {selectedLabel ? (
          <span className="text-amber-300 text-sm font-medium">
            {selectedLabel} selected — click an empty hex to move, or click another piece
          </span>
        ) : (
          <span className="text-stone-500 text-sm">Click a piece to select it</span>
        )}
      </div>

      {/* Board */}
      <div className="w-full" style={{ maxWidth: 760 }}>
        <HexBoard pieces={pieces} selectedId={selectedId} onHexClick={handleHexClick} />
      </div>

      {/* Controls */}
      <button
        onClick={handleReset}
        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
      >
        Reset to Starting Positions
      </button>
    </div>
  )
}
