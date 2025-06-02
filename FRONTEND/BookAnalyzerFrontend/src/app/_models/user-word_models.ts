export interface LearnedWordDto {
  id: string;
  dictionaryEntryId: string;
  englishPhrase: string;
  hungarianMeanings: string;
  learnedAt: string;
  lastClickedAt: string;
}

export interface AddLearnedWordDto {
  dictionaryEntryId: string;
}

export interface LearnedWordCreateDto {
  phrase: string;
  hungarianMeaning: string;
}

export interface FavoriteWordDto {
  id: string;
  dictionaryEntryId: string;
  englishPhrase: string;
  hungarianMeanings: string;
  addedAt: string;
}

export interface AddFavoriteWordDto {
  dictionaryEntryId: string;
}


