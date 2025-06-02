export interface BookDto {
  id: string;
  title: string;
  content: string;
}

export interface BookTitleDto {
  id: string;
  title: string;
}

export class BookTitles implements BookTitleDto {
  id: string;
  title: string;

  constructor() {
    this.id = '';
    this.title = '';
  }
}

export class Books implements BookDto {
  id: string;
  title: string;
  content: string;

  constructor() {
    this.id = '';
    this.title = '';
    this.content = '';
  }
}
