import { Component, OnInit } from '@angular/core';
import { NavigationComponent } from "../navigation/navigation.component";
import { BookTitles } from '../_models/book_models';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BookService } from '../services/book.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-list-books',
  imports: [NavigationComponent, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './list-books.component.html',
  styleUrl: './list-books.component.scss',
  providers: [BookService],
})

export class ListBooksComponent implements OnInit {

  books: Array<BookTitles> = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  expandedBookIds: Set<string> = new Set(); 
  bookDetails: { [key: string]: any } = {}; 
    

 editingBookId: string = '';
  editTitle: string = '';
  isSaving: boolean = false;

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
        this.errorMessage = 'Hiba történt a könyvek betöltése során.';
        this.isLoading = false;
      }
    );
  }

  retry(): void {
    this.loadBooks();
  }

  // Toggle funkció 
  toggleBookDetails(bookId: string): void {
    if (this.expandedBookIds.has(bookId)) {
      this.expandedBookIds.delete(bookId);
    } else {
      this.expandedBookIds.add(bookId);
    
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

  
  isBookExpanded(bookId: string): boolean {
    return this.expandedBookIds.has(bookId);
  }

  
  getBookDetails(bookId: string): any {
    return this.bookDetails[bookId];
  }

startEdit(book: BookTitles): void {
    this.editingBookId = book.id;
    this.editTitle = book.title;
  }

  cancelEdit(): void {
    this.editingBookId = '';
    this.editTitle = '';
  }

  saveTitle(): void {
    // Validáció
    if (!this.editTitle || this.editTitle.trim().length < 5) {
      alert('A cím legalább 5 karakter hosszú legyen!');
      return;
    }

    this.isSaving = true;

    this.bookService.updateBookTitle(this.editingBookId, this.editTitle.trim()).subscribe(
      (response: any) => {
        // Könyv címének frissítése a listában
        const book = this.books.find(b => b.id === this.editingBookId);
        if (book) {
          book.title = this.editTitle.trim();
        }
        
        
        if (this.bookDetails[this.editingBookId]) {
          this.bookDetails[this.editingBookId].title = this.editTitle.trim();
        }

        this.cancelEdit();
        this.isSaving = false;
      },
      (error: any) => {
        console.error('Error updating book title:', error);
        alert('Hiba történt a mentés során!');
        this.isSaving = false;
      }
    );
  }

  isEditing(bookId: string): boolean {
    return this.editingBookId === bookId;
  }
}





 

