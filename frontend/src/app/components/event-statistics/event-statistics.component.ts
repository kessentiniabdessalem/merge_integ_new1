import { Component, OnInit } from '@angular/core';
import { EventStatisticsService, EventStatistics } from '../../services/event-statistics.service';

@Component({
  selector: 'app-event-statistics',
  templateUrl: './event-statistics.component.html',
  styleUrls: ['./event-statistics.component.scss'],
  standalone: false
})
export class EventStatisticsComponent implements OnInit {
  stats: EventStatistics | null = null;
  loading = true;
  error: string | null = null;

  constructor(private statsService: EventStatisticsService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading = true;
    this.statsService.getStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
        this.error = 'Impossible de charger les statistiques';
        this.loading = false;
      }
    });
  }

  getCategoryKeys(): string[] {
    return this.stats ? Object.keys(this.stats.eventsByCategory) : [];
  }

  getCategoryValue(key: string): number {
    return this.stats ? this.stats.eventsByCategory[key] : 0;
  }
}
