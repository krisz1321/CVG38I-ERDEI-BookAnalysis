import { Injectable, OnInit } from '@angular/core';
import { Environment } from '../environment/enviroment';
import { HttpClient } from '@angular/common/http';
import { Phrase } from '../_models/word_models';
import { Phrases } from '../_models/word_models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PhraseService {
  http: HttpClient;
  phrases: Phrases = new Phrases();

  constructor(http: HttpClient) {
    //this.phrases = PHRASE_DATA;
    this.http = http;

    // this.getPhrases('1bc47453-717e-4ab6-adbd-08a8d547d8f4').subscribe(
    //   (data) => {
    //     this.phrases = data;
    //     //console.log('Phrases loaded:', this.phrases);
    //   }
    // );
  }

  loadPhrases(
    bookid: string,
    firstpage: number = 0,
    pagesize: number = 50
  ): void {
    this.getPhrases(bookid, firstpage, pagesize).subscribe((data) => {
      this.phrases = data;
      //console.log('Phrases loaded:', this.phrases);
    });
  }

  getPhrases(
    bookid: string,
    firstpage: number = 0,
    pagesize: number = 50
  ): Observable<Phrases> {
    //console.log(`Fetching phrases for book ID: ${bookid}, page: ${firstpage}, page size: ${pagesize}`);

    return this.http.get<Phrases>(
      `${Environment.apiUrl}/api/PhraseStorage/list?bookId=${bookid}&sortBy=frequency&order=desc&page=${firstpage}&pageSize=${pagesize}`
    );
  }

  getMassage(): string {
    const messages: string[] = [
      'Szavak listája',
      'Szavak listája táblázatformában',
      'Szavak listája táblázatos formában',
      'Feldolgozott szavak áttekintése',
      'Szavak listája a kiválasztott könyvből',
      'Feldolgozott könyv szavai',
      'A kiválasztott könyv szavainak listája',
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }


  isFavorite(phraseId: string): Observable<boolean> {
    return this.http.get<boolean>(`${Environment.apiUrl}/api/userwords/favorites/${phraseId}`);
	}

	toggleFavorite(phraseId: string, isFavorite: boolean): Observable<any> {
    if (isFavorite) {
        // Hozzáadás
        return this.http.post(`${Environment.apiUrl}/api/userwords/favorites/${phraseId}`, {});
    } else {
		// Törlés
        return this.http.delete(`${Environment.apiUrl}/api/userwords/favorites/${phraseId}`);
    }
}




}
