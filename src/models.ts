export type Gift = {
  id: string;
  title: string;
  notes?: string;
  url?: string;
};

export type Person = {
  id: string;
  name: string;
  birthDate: string; // ISO date string yyyy-mm-dd
  notes?: string;
  image?: string; // data URL or asset path
  gifts: Gift[];
};
