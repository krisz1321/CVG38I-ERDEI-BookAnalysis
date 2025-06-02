import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserWordService } from '../services/user-word.service';
import { NavigationComponent } from '../navigation/navigation.component';

interface DailyStat {
  date: string;
  dayName: string;
  learnedCount: number;
}

@Component({
  selector: 'app-statistic',
  imports: [CommonModule, NavigationComponent],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss'
})
export class StatisticComponent implements OnInit {
  dailyStats: DailyStat[] = [];
  sum: number = 0;
  columnColors: string[] = [];

  constructor(private userWordService: UserWordService) {}

  randomColor(): string {
    let r = Math.floor(Math.random() * 256); 
	let g = Math.floor(Math.random() * 256);
	let b = Math.floor(Math.random() * 256);
    let x: string = `rgb(${r},${g},${b})`;
    this.columnColors.push(x);
    return x;
  }

  columnHeight(count: number): number {
    if (this.sum === 0) return 10; // minimum magasság
    return Math.max(10, Math.ceil(count / this.sum * 100));
  }

  ngOnInit(): void {
    this.userWordService.getLearnedWords().subscribe(
      (learnedWords) => {
        this.generateDailyStats(learnedWords);
        // Összeg 
        for (let day of this.dailyStats) {
          this.sum += day.learnedCount;
        }
      },
      (error) => {
        console.error('Hiba a statisztikák betöltésekor:', error);
      }
    );
  }

 generateDailyStats(learnedWords: any[]): void {
    const today = new Date();
    
    this.dailyStats = [];
    
    //(2 hét)
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayNumber = date.getDate();
     
      
      const learnedCount = learnedWords.filter(word => {
        const learnedDate = new Date(word.learnedAt).toISOString().split('T')[0];
        return learnedDate === dateString;
      }).length;
      
      this.dailyStats.push({
        date: dateString,
        dayName: dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`, 
        learnedCount: learnedCount
      });
    }
  }
}