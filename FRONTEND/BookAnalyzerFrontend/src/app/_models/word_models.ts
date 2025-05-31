export interface PhraseDto {
  id: string;  
  phrase: string;
  hungarianMeaning: string;
  frequency: number;
}

interface PhraseResponseDto {
  bookTitle: string;
  pageInfo?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  phrases: PhraseDto[];
}


export class Phrase implements PhraseDto {
  id: string;
  phrase: string;
  hungarianMeaning: string;
  frequency: number;

  constructor() {
	this.id = '';
	this.phrase = '';
	this.hungarianMeaning = '';
	this.frequency = 0;
  }
}

export class Phrases {
  bookTitle: string;
  pageInfo?: {
	currentPage: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
  };
  phrases: Phrase[];

  constructor() {
	this.bookTitle = '';
	this.pageInfo = undefined;
	this.phrases = [];
  }
}