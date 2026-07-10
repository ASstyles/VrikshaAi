
export type Plant = {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  uses: string;
  image: {
    url: string;
    alt: string;
    hint: string;
  };
};

export type UserProfile = {
  id: string;
  favoritePlantIds?: string[];
  gardenPlantIds?: string[];
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
  dominantDosha: string;
};

export type PrakritiResults = {
  vata: number;
  pitta: number;
  kapha: number;
  constitution: string;
};

export type DailyDoshaLog = {
  id: string;
  userId: string;
  date: string;
  vata: number;
  pitta: number;
  kapha: number;
  notes?: string;
};
