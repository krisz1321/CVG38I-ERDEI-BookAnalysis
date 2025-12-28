import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterModel } from '../_models/register_models';
import { environment } from '../../environments/environment';
import { NavigationComponent } from "../navigation/navigation.component";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NavigationComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  router: Router;
  http: HttpClient;
  registerModel: RegisterModel;
  acceptTermsAndConditions: boolean;
  userName: FormControl;
  password: FormControl;
  confirmPassword: FormControl;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  confirmPasswordValue: string = '';

  constructor(http: HttpClient, router: Router) {
    this.http = http;
    this.router = router;
    this.acceptTermsAndConditions = false;
    this.registerModel = new RegisterModel();

    
    this.userName = new FormControl('', [Validators.required, Validators.minLength(3)]);
    this.password = new FormControl('', [Validators.required, Validators.minLength(6)]);
    this.confirmPassword = new FormControl('', [Validators.required]);
  }

  ngOnInit(): void {
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
    return this.password.hasError('minlength') ? 'A jelszó minimum 6 karakter hosszú legyen!' : '';
  }

 public getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword.hasError('required')) {
      return 'Meg kell erősítenie a jelszót!';
    }
    if (this.registerModel.password !== this.confirmPasswordValue) {
      return 'A jelszavak nem egyeznek!';
    }
    return '';
  }

 public checkInputs(): boolean {
    return this.userName.valid && 
           this.password.valid && 
           this.confirmPassword.valid &&
           this.registerModel.password === this.confirmPasswordValue &&
           this.acceptTermsAndConditions;
  }

  public sendRegisterCredentials(): void {
    if (!this.checkInputs()) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post(`${environment.apiUrl}/api/User/register`, this.registerModel)
      .subscribe(
        (success) => {
          this.isLoading = false;
          this.successMessage = 'A regisztráció sikeres volt! Átirányítás a bejelentkezési oldalra...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Hiba történt a regisztráció során. Kérjük próbálja újra.';
        }
      );
  }
}