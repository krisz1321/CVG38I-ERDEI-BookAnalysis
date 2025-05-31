import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Environment } from '../environment/enviroment';
import { BookDto, BookTitles } from '../_models/book_models';

@Injectable({
  providedIn: 'root'
})
export class BookService {
	http: HttpClient;

  constructor(http: HttpClient) {
	this.http = http;
   }

	getBookTitles(): Observable<Array<BookTitles>> {
		return this.http.get<Array<BookDto>>(`${Environment.apiUrl}/api/Books/GetBookTitles`)
		.pipe(
			map(response => 
			response.map(bookDto => {
				const book = new BookTitles();
				book.id = bookDto.id;
				book.title = bookDto.title;
				return book;
			})
			)
		);
	}

}
