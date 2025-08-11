export interface DbUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DbWeightRecord {
  id: number;
  user_id: number;
  weight: number;
  date: string;
  created_at: string;
}
