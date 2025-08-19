export interface DbUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DbWeightRecord {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  created_at: string;
}

export interface DbGame {
  id: string
  name: string
  player1Id: string
  player2Id: string | null
  status: 'WAITING' | 'PLAYING' | 'FINISHED'
  board: any[][]
  currentTurn: string | null
  winner: string | null
  lastMove: any | null
  createdAt: string
  updatedAt: string
  player1?: {
    id: string
    name: string
  }
  player2?: {
    id: string
    name: string
  } | null
}