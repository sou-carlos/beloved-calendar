export type Gift = {
  id: string;
  title: string;
  notes?: string;
  url?: string;
  purchased?: boolean;
};
export type Avatar = {
  hair: string;
  hairColor: string;
  skin: string;
  eyes: string;
  /** Added after the first faces were saved, so older faces may not have it. */
  shirt?: string;
  /** teen, adult or old. Missing means adult. */
  age?: string;
  /** Accessories. Missing or "none" means not wearing one. */
  hat?: string;
  earrings?: string;
  glasses?: string;
  /** Beard style, drawn in the hair color. */
  beard?: string;
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
  /** True when only day and month are known. birthDate then uses the placeholder leap year 2000. */
  yearUnknown?: boolean;
  avatar?: Avatar;
};
