import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Environment } from '../environment/enviroment';
import { BookDto, BookTitles } from '../_models/book_models';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getBookTitles(): Observable<Array<BookTitles>> {
    return this.http
      .get<Array<BookDto>>(`${Environment.apiUrl}/api/Books/GetBookTitles`)
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
        `${Environment.apiUrl}/api/PhraseStorage/list?bookId=${bookId}&page=1&pageSize=1`
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
      `${Environment.apiUrl}/api/Books/title/${bookId}`,
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
      `${Environment.apiUrl}/api/Books/uploadAndEdit?removeNonAlphabetic=true&toLowerCase=true`,
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

    return this.http.delete(`${Environment.apiUrl}/api/Books/${bookId}`, {
      headers,
    });
  }
}
