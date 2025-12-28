import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; 
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';


bootstrapApplication(AppComponent, appConfig)
.catch((err) => console.error(err));