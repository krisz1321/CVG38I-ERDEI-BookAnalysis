import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Phrase, Phrases } from '../_models/word_models';
import { PhraseService } from '../services/phrase.service';
import { BookTitles } from '../_models/book_models';
import { BookService } from '../services/book.service';
import { PaginationService } from '../services/pagination.service';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-list-words',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NavigationComponent],
  providers: [PhraseService, BookService, PaginationService],
  templateUrl: './list-words.component.html',
  styleUrls: ['./list-words.component.scss'],
})
export class ListWordsComponent implements OnInit {
  massage: string = 'Szavak listája';
  currentPhrases: Phrases = new Phrases();
  bookid: string = '';

  books: Array<BookTitles> = [];
  selectedBookId: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 25;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private phraseService: PhraseService,
    private bookService: BookService,
    private paginationService: PaginationService
  ) {
    this.massage = phraseService.getMassage();
  }

  ngOnInit(): void {
    this.loadBooks();

    // Pagination service feliratkozás
    this.paginationService.state$.subscribe((state) => {
      this.currentPage = state.currentPage;
      this.pageSize = state.pageSize;
      this.totalItems = state.totalItems;
      this.totalPages = state.totalPages;
    });
  }

  loadBooks(): void {
    this.bookService.getBookTitles().subscribe(
      (books) => {
        this.books = books;
        if (this.books.length > 0) {
          this.selectedBookId = this.books[0].id;
          this.bookid = this.selectedBookId;
          this.loadPhrases();
        }
      },
      (error) => {
        console.error('Error loading books:', error);
      }
    );
  }

  onBookSelected(): void {
    this.bookid = this.selectedBookId;

    this.paginationService.reset();

    this.loadPhrases();
  }

  getSelectedBookTitle(): string {
    const selectedBook = this.books.find(
      (book) => book.id === this.selectedBookId
    );
    return selectedBook ? selectedBook.title : '';
  }

  loadPhrases(): void {
    console.log(
      `Loading phrases: page ${this.currentPage}, size ${this.pageSize}`
    );

    this.phraseService
      .getPhrases(this.bookid, this.currentPage, this.pageSize)
      .subscribe(
        (data) => {
          this.currentPhrases = data;

          // Pagination service frissítése
          if (this.currentPhrases.pageInfo) {
            this.paginationService.setTotalItems(
              this.currentPhrases.pageInfo.totalItems
            );
          }

          console.log('Phrases loaded:', this.currentPhrases);
        },
        (error) => {
          console.error('Error loading phrases:', error);
        }
      );
  }

  trackByPhraseId(index: number, phrase: Phrase): string {
    return phrase.id;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (this.paginationService.goToPage(page)) {
      this.loadPhrases();
    }
  }

  goToPrevious(): void {
    if (this.paginationService.goToPrevious()) {
      this.loadPhrases();
    }
  }

  goToNext(): void {
    if (this.paginationService.goToNext()) {
      this.loadPhrases();
    }
  }

  goToFirst(): void {
    if (this.paginationService.goToFirst()) {
      this.loadPhrases();
    }
  }

  goToLast(): void {
    if (this.paginationService.goToLast()) {
      this.loadPhrases();
    }
  }

  changePageSize(newSize: number): void {
    this.paginationService.changePageSize(newSize);
    this.loadPhrases();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageSizeOptions(): number[] {
    return this.paginationService.getPageSizeOptions();
  }

  canGoToPrevious(): boolean {
    return this.paginationService.canGoToPrevious();
  }

  canGoToNext(): boolean {
    return this.paginationService.canGoToNext();
  }
}
