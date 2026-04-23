/** Club category values used in forms and API */
export type ClubCategory = 'Speaking Club' | 'Debate Club' | 'Writing Club' | 'Culture Club';

export interface Club {
  id: number;
  name: string;
  category: ClubCategory;
  schedule: string;
  maxMembers: number;
  description: string;
  image: string;
  /** ISO date string or Date from API */
  createdAt?: string | Date;
}

/** Payload for creating a club (no id, no createdAt) */
export type ClubCreate = Omit<Club, 'id' | 'createdAt'>;

/** Payload for updating a club (partial, no id) */
export type ClubUpdate = Partial<Omit<Club, 'id'>>;
