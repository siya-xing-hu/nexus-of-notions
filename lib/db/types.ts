import { ChannelType, GameStatus } from "@prisma/client";

export interface DbUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DbTelegramChannel {
  id: string;
  user_id: string;
  channel_id: string;
  access_hash: string;
  title: string;
  username: string;
  type: ChannelType;
  permissions?: any;
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
  id: string;
  name: string;
  player1_id: string;
  player2_id: string | null;
  status: GameStatus;
  board: any[][];
  current_turn: string | null;
  winner: string | null;
  last_move: any | null;
  created_at: string;
  updated_at: string;
  player1?: {
    id: string;
    name: string;
  };
  player2?: {
    id: string;
    name: string;
  } | null;
}
