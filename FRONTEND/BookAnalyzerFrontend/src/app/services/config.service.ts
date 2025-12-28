import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
// Ebben a változóban tároljuk majd a beolvasott URL-t
  public cfg: any = {
    apiUrl: ''
	
  };
  constructor(private http: HttpClient) { }
  // Ez a függvény tölti be a JSON fájlt az indításkor
  load(): Promise<any> {
    return firstValueFrom(this.http.get('config.json'))	
      .then(config => {
        this.cfg = config;
      });
  }
}