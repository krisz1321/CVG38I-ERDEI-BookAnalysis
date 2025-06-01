import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginModel } from '../_models/login_models';
import { Environment } from '../environment/enviroment';
import { NavigationComponent } from "../navigation/navigation.component";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TokenModel } from '../_models/token_model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NavigationComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  router: Router;
  http: HttpClient;
  loginModel: LoginModel;
  userName: FormControl;
  password: FormControl;
  
  
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(http: HttpClient, router: Router) {
    this.http = http;
    this.router = router;
    this.loginModel = new LoginModel();
    this.userName = new FormControl('', [Validators.required, Validators.minLength(3)]);
    this.password = new FormControl('', [Validators.required]);
  }

  public getUserNameErrorMessage(): string {
    if (this.userName.hasError('required')) {
      return 'Meg kell adnia egy felhasználónevet!';
    }
    return this.userName.hasError('minlength') ? 'A felhasználónév minimum 3 karakter hosszú legyen!' : '';
  }

  public getPasswordErrorMessage(): string {
    if (this.password.hasError('required')) {
      return 'Meg kell adnia egy jelszót!';
    }
    return '';
  }

  public checkInputs(): boolean {
    return this.loginModel.userName !== '' && this.loginModel.password !== '' && 
           this.userName.valid && this.password.valid;
  }

  public sendLoginCredentials(): void {
    // Reset üzenetek
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.http
      .post<TokenModel>(`${Environment.apiUrl}/api/User/login`, this.loginModel)
      .subscribe(
        (success) => {
          // Token localStorage
          localStorage.setItem('bookanalyzer-token', success.token);
          localStorage.setItem('bookanalyzer-token-expiration', success.expiration.toString());
          
          console.log('Login successful:', success);
          
          this.successMessage = "Sikeres bejelentkezés!";
          this.isLoading = false;
          
          
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1500);
        },
        (error) => {
          console.error('Login error:', error);
          this.errorMessage = "Hibás felhasználónév vagy jelszó!";
          this.isLoading = false;
        }
      );
  }
}