export type Gift = {
  id: string;
  title: string;
  notes?: string;
  url?: string;
  purchased?: boolean;
};
export type Person = {
  id: string;
  name: string;
  birthDate: string;
  notes?: string;
  image?: string;
  gifts: Gift[];
  likes?: string;
  dislikes?: string;
  emoji?: string;
};
