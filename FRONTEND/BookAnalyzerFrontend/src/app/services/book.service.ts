import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookDto, BookTitles } from '../_models/book_models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  http: HttpClient;

  constructor(http: HttpClient, private configService: ConfigService) {
    this.http = http;
  }

	private get categoryUrl(): string {
	console.log('ConfigService API URL!!!!!!!!!!!!:' + this.configService.cfg.apiUrl);

	return `${this.configService.cfg.apiUrl}`;
  }

  getBookTitles(): Observable<Array<BookTitles>> {
    return this.http
      .get<Array<BookDto>>(`${this.categoryUrl}/api/Books/GetBookTitles`)
      .pipe(
        map((response) =>
          response.map((bookDto) => {
            const book = new BookTitles();
            book.id = bookDto.id;
            book.title = bookDto.title;
            return book;
          })
        )
      );
  }

  getBookDetails(bookId: string): Observable<any> {
    return this.http
      .get(
        `${this.categoryUrl}/api/PhraseStorage/list?bookId=${bookId}&page=1&pageSize=1`
      )
      .pipe(
        map((response: any) => {
          return {
            id: bookId,
            title: response.bookTitle,
            totalWords: response.pageInfo?.totalItems || 0,
          };
        })
      );
  }

  updateBookTitle(bookId: string, newTitle: string): Observable<any> {
    const token = localStorage.getItem('bookanalyzer-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.put(
      `${this.categoryUrl}/api/Books/title/${bookId}`,
      { title: newTitle },
      { headers }
    );
  }

  uploadBook(book: any): Observable<any> {
    const token = localStorage.getItem('bookanalyzer-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(
      `${this.categoryUrl}/api/Books/uploadAndEdit?removeNonAlphabetic=true&toLowerCase=true`,
      book,
      { headers }
    );
  }

  deleteBook(bookId: string): Observable<any> {
    const token = localStorage.getItem('bookanalyzer-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.categoryUrl}/api/Books/${bookId}`, {
      headers,
    });
  }
}
