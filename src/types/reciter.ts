export type ReciterStyle = 'Murattal' | 'Mujawwad' | 'Muallim';

export interface Reciter {
  id: number;
  reciter_name: string;
  arabic_name: string;
  style: ReciterStyle | string;
  photo_url: string | null;
  country?: string;
  surahs_count: number;
  bio?: string;
}

export type VerifiedReciter = Reciter;
