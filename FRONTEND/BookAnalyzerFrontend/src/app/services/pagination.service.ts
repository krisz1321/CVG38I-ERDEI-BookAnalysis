import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { PaginationState} from '../_models/word_models';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  
  // Alapértelmezett beállítások
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  defaultPageSize: number = 25;

  
  private currentPage: number = 1;
  private pageSize: number = 25;
  private totalItems: number = 0;
  private totalPages: number = 0;


  private stateSubject = new BehaviorSubject<PaginationState>({
    currentPage: 1,
    pageSize: 25,
    totalItems: 0,
    totalPages: 0
  });

  public state$ = this.stateSubject.asObservable();

  constructor() { }

  // Jelenlegi állapot lekérése
  getCurrentState(): PaginationState {
    return {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems: this.totalItems,
      totalPages: this.totalPages
    };
  }

  // Összes elem szám beállítása
  setTotalItems(totalItems: number): void {
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / this.pageSize);
    this.updateState();
  }

  // Adott oldalra ugrás
  goToPage(page: number): boolean {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateState();
      return true;
    }
    return false;
  }

  // Oldal méret változtatása
  changePageSize(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.totalPages = Math.ceil(this.totalItems / newPageSize);
    this.currentPage = 1; // Első oldalra visszaugrás
    this.updateState();
  }

  // Alaphelyzetbe állítás
  reset(): void {
    this.currentPage = 1;
    this.pageSize = this.defaultPageSize;
    this.totalItems = 0;
    this.totalPages = 0;
    this.updateState();
  }

  // Elérhető oldal méretek
  getPageSizeOptions(): number[] {
    return this.pageSizeOptions;
  }

  // Lehet-e előző oldalra menni
  canGoToPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Lehet-e következő oldalra menni
  canGoToNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  // Előző oldal
  goToPrevious(): boolean {
    return this.goToPage(this.currentPage - 1);
  }

  // Következő oldal
  goToNext(): boolean {
    return this.goToPage(this.currentPage + 1);
  }

  // Első oldal
  goToFirst(): boolean {
    return this.goToPage(1);
  }

  // Utolsó oldal
  goToLast(): boolean {
    return this.goToPage(this.totalPages);
  }

  // Belső metódus az állapot frissítésére
  private updateState(): void {
    const newState: PaginationState = {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      totalItems: this.totalItems,
      totalPages: this.totalPages
    };
    this.stateSubject.next(newState);
  }
}