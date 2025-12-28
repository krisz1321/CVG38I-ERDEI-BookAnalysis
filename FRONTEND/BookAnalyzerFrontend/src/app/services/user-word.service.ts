import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FavoriteWordDto,
  LearnedWordDto,
  AddFavoriteWordDto,
  AddLearnedWordDto,
} from '../_models/user-word_models';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class UserWordService {

  constructor(private http: HttpClient, private configService: ConfigService) {}

  private get categoryUrl(): string {
    return `${this.configService.cfg.apiUrl}`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('bookanalyzer-token');
    if (!token) {
      throw new Error('Nincs bejelentkezési token!');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getFavorites(): Observable<FavoriteWordDto[]> {
    return this.http.get<FavoriteWordDto[]>(
      `${this.categoryUrl}/api/userwords/favorites`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getFavoriteById(id: string): Observable<FavoriteWordDto> {
    return this.http.get<FavoriteWordDto>(
      `${this.categoryUrl}/api/userwords/favorites/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  addFavorite(dto: AddFavoriteWordDto): Observable<FavoriteWordDto> {
    return this.http.post<FavoriteWordDto>(
      `${this.categoryUrl}/api/userwords/favorites`,
      dto,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  removeFavorite(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.categoryUrl}/api/userwords/favorites/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // MEGTANULT -->
 getLearnedWords(): Observable<LearnedWordDto[]> {
    return this.http.get<LearnedWordDto[]>(`${this.categoryUrl}/api/userwords/learned`, {
      headers: this.getAuthHeaders()
    });
  }

  getLearnedWordById(id: string): Observable<LearnedWordDto> {
    return this.http.get<LearnedWordDto>(`${this.categoryUrl}/api/userwords/learned/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  addLearnedWord(dto: AddLearnedWordDto): Observable<LearnedWordDto> {
    return this.http.post<LearnedWordDto>(`${this.categoryUrl}/api/userwords/learned`, dto, {
      headers: this.getAuthHeaders()
    });
  }

  updateLastClick(id: string): Observable<void> {
    return this.http.put<void>(`${this.categoryUrl}/api/userwords/learned/${id}/click`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  removeLearnedWord(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoryUrl}/api/userwords/learned/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
