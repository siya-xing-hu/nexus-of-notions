export interface DbUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DbWeightRecord {
  id: number;
  user_id: string;
  weight: number;
  date: string;
  created_at: string;
}
