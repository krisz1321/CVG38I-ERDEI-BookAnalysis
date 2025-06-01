import { Component, OnInit } from '@angular/core';
import { NavigationComponent } from "../navigation/navigation.component";
import { BookTitles } from '../_models/book_models';
import { CommonModule } from '@angular/common';
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
  expandedBookIds: Set<string> = new Set(); // Nyitott könyvek ID-jai
  bookDetails: { [key: string]: any } = {}; // Könyv részletek cache
    
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
      },
      (error: any) => {
        console.error('LIST-BOOKS.ts: Error loading books:', error);
        this.errorMessage = 'Hiba történt a könyvek betöltése során.';
        this.isLoading = false;
      }
    );
  }

  retry(): void {
    this.loadBooks();
  }

  // Toggle funkció a könyv részletekhez
  toggleBookDetails(bookId: string): void {
    if (this.expandedBookIds.has(bookId)) {
      // Ha már nyitva van, zárjuk be
      this.expandedBookIds.delete(bookId);
    } else {
      // Ha zárva van, nyissuk ki és töltsük be az adatokat
      this.expandedBookIds.add(bookId);
      
      // Ha még nincs betöltve a részlet, töltsük be
      if (!this.bookDetails[bookId]) {
        this.loadBookDetails(bookId);
      }
    }
  }

  // Könyv részletek betöltése
  loadBookDetails(bookId: string): void {
    this.bookService.getBookDetails(bookId).subscribe(
      (details: any) => {
        this.bookDetails[bookId] = details;
      },
      (error: any) => {
        console.error('Error loading book details:', error);
        this.bookDetails[bookId] = { error: 'Hiba történt az adatok betöltése során.' };
      }
    );
  }

  // Ellenőrzi, hogy a könyv nyitva van-e
  isBookExpanded(bookId: string): boolean {
    return this.expandedBookIds.has(bookId);
  }

  // Visszaadja a könyv részleteit
  getBookDetails(bookId: string): any {
    return this.bookDetails[bookId];
  }
}