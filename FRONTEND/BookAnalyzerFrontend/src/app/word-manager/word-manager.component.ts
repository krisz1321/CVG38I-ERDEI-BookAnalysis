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
import { UserWordService } from '../services/user-word.service';

@Component({
  selector: 'app-word-manager',
  imports: [CommonModule, FormsModule, HttpClientModule, NavigationComponent],
  providers: [PhraseService, BookService, PaginationService, UserWordService],
  templateUrl: './word-manager.component.html',
  styleUrl: './word-manager.component.scss',
})
export class WordManagerComponent {
  componentName: string = '[WordManagerComponent]';
  massage: string = 'Szavak listája';
  currentPhrases: Phrases = new Phrases();
  bookid: string = '';

  books: Array<BookTitles> = [];
  selectedBookId: string = '';

  //pagination
  currentPage: number = 1;
  pageSize: number = 25;
  totalItems: number = 0;
  totalPages: number = 0;

  //kedvencek
  favoriteWords: string[] = []; // dictionary ID-k
  loadingFavorites: boolean = false;

  //ismert szavak
  learnedWords: string[] = []; // dictionary ID-k
  loadingLearned: boolean = false;

  constructor(
    private phraseService: PhraseService,
    private bookService: BookService,
    private paginationService: PaginationService,
    private userWordService: UserWordService
  ) {
    this.massage = phraseService.getMassage();
  }

  ngOnInit(): void {
    this.loadBooks();
    this.loadFavoriteWords();
    this.loadLearnedWords();

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
        console.error(`${this.componentName} Error loading books:`, error);
      }
    );
  }

  onBookSelected(): void {
    this.bookid = this.selectedBookId;

    // Console-ra kiírás
    //console.log(`${this.componentName} Kiválasztott könyv ID:`, this.selectedBookId);
    //console.log(`${this.componentName} bookid változó frissítve:`, this.bookid);

    // Pagination service reset
    this.paginationService.reset();

    //Szavak betöltése az új könyvhöz
    if (this.selectedBookId) {
      this.loadPhrases();
    } else {
      // Ha nincs könyv kiválasztva, üres lista
      this.currentPhrases = new Phrases();
    }
  }

  getSelectedBookTitle(): string {
    const selectedBook = this.books.find(
      (book) => book.id === this.selectedBookId
    );
    return selectedBook ? selectedBook.title : '';
  }

  loadPhrases(): void {
    //console.log(`${this.componentName} Loading phrases: page ${this.currentPage}, size ${this.pageSize}`);

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

          //console.log(`${this.componentName} Phrases loaded:`, this.currentPhrases);
        },
        (error) => {
          console.error(`${this.componentName} Error loading phrases:`, error);
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
    this.pageSize = newSize;
    this.paginationService.changePageSize(newSize);

    // Szavak újratöltése az új oldalmérrettel
    if (this.selectedBookId) {
      this.loadPhrases();
    }
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

  getBadgeClass(frequency: number): string {
    if (frequency >= 50) return 'bg-danger';
    if (frequency >= 20) return 'bg-warning';
    if (frequency >= 10) return 'bg-success';
    return 'bg-primary';
  }

  //kedvencek kezelése

  loadFavoriteWords(): void {
    this.loadingFavorites = true;
    this.userWordService.getFavorites().subscribe(
      (favorites) => {
        this.favoriteWords = favorites.map((f) => f.dictionaryEntryId);
        this.loadingFavorites = false;
        //console.log(`${this.componentName} Kedvenc szavak betöltve:`, this.favoriteWords);
      },
      (error) => {
        console.error(
          `${this.componentName} Hiba a kedvencek betöltésekor:`,
          error
        );
        this.favoriteWords = [];
        this.loadingFavorites = false;
      }
    );
  }

  isFavorite(phrase: Phrase): boolean {
    return this.favoriteWords.includes(phrase.id);
  }

  // Szív állapotának váltása
  toggleFavorite(phrase: Phrase): void {
    if (this.loadingFavorites) return;

    const isFav = this.isFavorite(phrase);

    if (isFav) {
      this.removeFavorite(phrase);
    } else {
      this.addFavorite(phrase);
    }
  }

  // Kedvenc hozzáadása
  private addFavorite(phrase: Phrase): void {
    const addDto = { dictionaryEntryId: phrase.id };

    this.userWordService.addFavorite(addDto).subscribe(
      (result) => {
        // Helyi lista
        this.favoriteWords.push(phrase.id);
        console.log(
          `${this.componentName} "${phrase.phrase}" hozzáadva a kedvencekhez`
        );
      },
      (error) => {
        console.error(
          `${this.componentName} Hiba a kedvenc hozzáadásakor:`,
          error
        );
      }
    );
  }

  // Kedvenc eltávolítása
  private removeFavorite(phrase: Phrase): void {
    // Először meg kell találni a kedvenc ID-jét
    this.userWordService.getFavorites().subscribe(
      (favorites) => {
        const favorite = favorites.find(
          (f) => f.dictionaryEntryId === phrase.id
        );
        if (favorite) {
          this.userWordService.removeFavorite(favorite.id).subscribe(
            () => {
              // Helyi lista frissítése
              this.favoriteWords = this.favoriteWords.filter(
                (id) => id !== phrase.id
              );
              console.log(
                `${this.componentName} "${phrase.phrase}" eltávolítva a kedvencekből`
              );
            },
            (error) => {
              console.error(
                `${this.componentName} Hiba a kedvenc eltávolításakor:`,
                error
              );
            }
          );
        }
      },
      (error) => {
        console.error(
          `${this.componentName} Hiba a kedvencek lekérésekor:`,
          error
        );
      }
    );
  }

  // Szív ikon -üres vagy telített
  getHeartIconClass(phrase: Phrase): string {
    if (this.loadingFavorites) {
      return 'bi bi-hourglass-split text-muted';
    }
    return this.isFavorite(phrase)
      ? 'bi bi-heart-fill text-danger'
      : 'bi bi-heart text-muted';
  }

  //ISMERT SZAVAK --->

  loadLearnedWords(): void {
    this.loadingLearned = true;
    this.userWordService.getLearnedWords().subscribe(
      (learnedWords) => {
        this.learnedWords = learnedWords.map((l) => l.dictionaryEntryId);
        this.loadingLearned = false;
        //console.log(`${this.componentName} Ismert szavak betöltve:`, this.learnedWords);
      },
      (error) => {
        console.error(
          `${this.componentName} Hiba az ismert szavak betöltésekor:`,
          error
        );
        this.learnedWords = [];
        this.loadingLearned = false;
      }
    );
  }

  isLearned(phrase: Phrase): boolean {
    return this.learnedWords.includes(phrase.id);
  }

  // Ismert állapot váltása
  toggleLearned(phrase: Phrase): void {
    if (this.loadingLearned) return;

    const isLearned = this.isLearned(phrase);

    if (isLearned) {
      this.removeLearnedWord(phrase);
    } else {
      this.addLearnedWord(phrase);
    }
  }

  //hozzáadása
  private addLearnedWord(phrase: Phrase): void {
    const addDto = { dictionaryEntryId: phrase.id };

    this.userWordService.addLearnedWord(addDto).subscribe(
      (result) => {
        // Helyi lista frissítése
        this.learnedWords.push(phrase.id);
        console.log(
          `${this.componentName} "${phrase.phrase}" hozzáadva az ismert szavakhoz`
        );
      },
      (error) => {
        console.error(
          `${this.componentName} Hiba az ismert szó hozzáadásakor:`,
          error
        );
      }
    );
  }

  //eltávolítás
  private removeLearnedWord(phrase: Phrase): void {
    // Először meg kell találni az ismert szó ID-jét
    this.userWordService.getLearnedWords().subscribe(
      (learnedWords) => {
        const learnedWord = learnedWords.find(
          (l) => l.dictionaryEntryId === phrase.id
        );
        if (learnedWord) {
          this.userWordService.removeLearnedWord(learnedWord.id).subscribe(
            () => {
              // Helyi lista frissítése
              this.learnedWords = this.learnedWords.filter(
                (id) => id !== phrase.id
              );
              console.log(
                `${this.componentName} "${phrase.phrase}" eltávolítva az ismert szavakból`
              );
            },
            (error) => {
              console.error(
                `${this.componentName} Hiba az ismert szó eltávolításakor:`,
                error
              );
            }
          );
        }
      },
      (error) => {
        console.error(
          `${this.componentName} Hiba az ismert szavak lekérésekor:`,
          error
        );
      }
    );
  }

  // Pipa ikon
  getCheckIconClass(phrase: Phrase): string {
    if (this.loadingLearned) {
      return 'bi bi-hourglass-split text-muted';
    }
    return this.isLearned(phrase)
      ? 'bi bi-check-square-fill text-success'
      : 'bi bi-check-square text-muted';
  }
}
