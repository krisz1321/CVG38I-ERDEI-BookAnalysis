import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  public isLoggedIn(): boolean {
    let token = localStorage.getItem('bookanalyzer-token');
    // TODO check expiration date etc.
    return token !== null;
  }

  public isAdmin(): boolean {
    return false; // TODO  admin  check
  }

  public canActivate(): boolean {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
