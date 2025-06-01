import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListBooksComponent } from './list-books/list-books.component';
import { ListWordsComponent } from './list-words/list-words.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
	{path: '', component: HomeComponent},
	{path: 'home', component: HomeComponent},
	{path: 'list-books', component: ListBooksComponent},
    {path: 'list-words', component: ListWordsComponent}, 
	{path: 'login', component: LoginComponent},

	{path: '**', redirectTo: '', pathMatch: 'full'} 
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }