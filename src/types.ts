export type PieceType = 'red_queen' | 'blue_queen' | 'red_guard' | 'blue_guard'
export type MoveMode = 'normal' | 'admin'
export type TurnColor = 'red' | 'blue'

export interface GamePiece {
  id: string
  type: PieceType
  q: number
  r: number
}
