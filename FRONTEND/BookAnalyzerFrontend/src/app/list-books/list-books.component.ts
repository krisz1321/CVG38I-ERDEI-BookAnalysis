import { Component, OnInit, } from '@angular/core';
import { NavigationComponent } from "../navigation/navigation.component";
import { BookTitles,   } from '../_models/book_models';
import {CommonModule} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-list-books',
  imports: [NavigationComponent, HttpClientModule, CommonModule],
  templateUrl: './list-books.component.html',
  styleUrl: './list-books.component.scss',
  providers: [BookService],
})

export class ListBooksComponent implements OnInit {

  books: Array<BookTitles> = [];
  isLoading: boolean = false;
  errorMessage: string = '';
    
  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.bookService.getBookTitles().subscribe(
      books => {
        this.books = books;
        this.isLoading = false;
        //console.log('Books loaded:', this.books);
      },
      error => {
        console.error('LIST-BOOKS.ts: Error loading books:', error);
        this.errorMessage = 'Hiba történt a könyvek betöltése során.';
        this.isLoading = false;
      }
    );
  }

  retry(): void {
    this.loadBooks();
  }
}