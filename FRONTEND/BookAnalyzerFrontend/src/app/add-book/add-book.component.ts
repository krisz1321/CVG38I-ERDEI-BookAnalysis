import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationComponent } from '../navigation/navigation.component';
import { BookService } from '../services/book.service';
import { PhraseService } from '../services/phrase.service';

@Component({
  selector: 'app-add-book',
  imports: [CommonModule, FormsModule, NavigationComponent],
  providers: [BookService, PhraseService],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.scss']
})
export class AddBookComponent {
  
  title: string = '';
  content: string = '';
  message: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;
  
  constructor(
    private bookService: BookService,
    private phraseService: PhraseService
  ) {}
  
  uploadBook() {

    if (!this.title || !this.content) {
      this.message = 'Kérlek töltsd ki mindkét mezőt!';
      this.isSuccess = false;
      return;
    }
    
    this.isLoading = true;
    this.message = 'Könyv feltöltése...';
    
    const book = {
      title: this.title,
      content: this.content
    };
    
    // Feltöltés
    this.bookService.uploadBook(book).subscribe(
      (result) => {
        this.message = 'Könyv feltöltve! Elemzés indítása...';
        this.isSuccess = true;
        
        // Elemzés könyv ID-val, amit a backend küld
        this.startAnalysis(result.id);
      },
      (error) => {
        this.message = 'Hiba történt a feltöltés során!';
        this.isSuccess = false;
        this.isLoading = false;
        console.error('Hiba:', error);
      }
    );
  }
  
  private startAnalysis(bookId: string) {
    this.phraseService.storeBookPhrases(bookId).subscribe(
      (result) => {
		//console.log('fhgfgfgfgkghjkghjk', result);
        this.message = 'Könyv sikeresen feltöltve és elemezve!';
        this.isSuccess = true;
        this.isLoading = false;
        
        
        this.title = '';
        this.content = '';
      },
      (error) => {
        this.message = 'Könyv feltöltve, de az elemzés sikertelen!';
        this.isSuccess = false;
        this.isLoading = false;
        console.error('Elemzési hiba:', error);
        
        
        this.title = '';
        this.content = '';
      }
    );
  }
}