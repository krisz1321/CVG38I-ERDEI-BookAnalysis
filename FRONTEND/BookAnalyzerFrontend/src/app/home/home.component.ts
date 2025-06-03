import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NavigationComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  welcomeMessages: string[] = [
    'Fedezd fel az angol nyelvű könyvek világát és fejleszd tudásodat szótanulással.',
    'Tanulj új szavakat kedvenc könyveid segítségével és bővítsd angol tudásodat.',
    'Elemezd angol könyveid szókincsét és kövesd nyomon fejlődésedet.',
    'Fedezz fel új kifejezéseket és építsd fel személyes szótáradat.',
    'Változtasd a könyvolvasást interaktív nyelvtanulási élménnyé.',
    'Tanuld az angol szavakat kontextusban, valódi könyvek segítségével.',
    'Gyűjtsd össze és gyakorold a legfontosabb angol kifejezéseket.'
  ];

  currentMessage: string = '';

  ngOnInit(): void {
    this.getRandomMessage();
  }

  getRandomMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    this.currentMessage = this.welcomeMessages[randomIndex];
  }
}