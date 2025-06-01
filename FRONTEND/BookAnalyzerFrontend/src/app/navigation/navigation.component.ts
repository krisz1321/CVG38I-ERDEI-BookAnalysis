import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-navigation',
  imports: [RouterModule, CommonModule,], 
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

    api: ApiService;
    constructor(api: ApiService) {
        this.api = api;
    }
}