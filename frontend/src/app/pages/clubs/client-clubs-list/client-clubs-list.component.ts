import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Club } from '../../../models/club.model';
import { ClubService } from '../../../services/club.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-client-clubs-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="client-page">
      <div class="page-hero">
        <div class="container">
          <h1 class="hero-title">Join Our <span class="highlight">Clubs</span></h1>
          <p class="hero-subtitle">Connect with fellow learners and practice English in a fun, supportive environment</p>
        </div>
      </div>
      <div class="container">
        <div class="filters-bar">
          <div class="search-box">
            <i class="ti ti-search"></i>
            <input type="text" placeholder="Search clubs..." [(ngModel)]="searchTerm" (input)="filterClubs()">
          </div>
          <div class="filter-group">
            <select [(ngModel)]="selectedCategory" (change)="filterClubs()" class="filter-select">
              <option value="">All Categories</option>
              <option value="Speaking Club">Speaking Club</option>
              <option value="Debate Club">Debate Club</option>
              <option value="Writing Club">Writing Club</option>
              <option value="Culture Club">Culture Club</option>
            </select>
          </div>
        </div>
        <div class="clubs-grid">
          @for (club of filteredClubs; track club.id) {
            <div class="club-card">
              <div class="card-image">
                <img [src]="club.image" [alt]="club.name">
                <div class="card-badge" [attr.data-category]="club.category">{{ club.category }}</div>
              </div>
              <div class="card-content">
                <h3 class="card-title"><a [routerLink]="['/clubs', club.id]">{{ club.name }}</a></h3>
                <p class="card-description">{{ club.description }}</p>
                <div class="card-meta">
                  <span class="meta-item"><i class="ti ti-clock"></i> {{ club.schedule }}</span>
                  <span class="meta-item"><i class="ti ti-users"></i> {{ club.maxMembers }} members</span>
                </div>
                <div class="card-footer">
                  <a [routerLink]="['/clubs', club.id]" class="btn-join">Join Club</a>
                </div>
              </div>
            </div>
          } @empty {
            <div class="no-results">
              <i class="ti ti-users"></i>
              <h3>No clubs found</h3>
              <p>Check back later for new clubs</p>
            </div>
          }
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .client-page { min-height: 100vh; background: var(--color-background); }
    .page-hero { background: linear-gradient(135deg, var(--color-primary) 0%, #2a2a4a 100%); padding: 80px 0 60px; text-align: center; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .hero-title { font-family: var(--font-family); font-size: 48px; font-weight: 800; color: #fff; margin: 0 0 16px; }
    .highlight { color: var(--color-accent); }
    .hero-subtitle { font-size: 18px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .filters-bar { display: flex; gap: 20px; justify-content: space-between; align-items: center; padding: 24px; background: var(--color-white); border-radius: 20px; margin: -40px auto 40px; position: relative; z-index: 10; box-shadow: var(--shadow-card); }
    .search-box { display: flex; align-items: center; gap: 12px; flex: 1; max-width: 400px; background: var(--color-background); border-radius: 12px; padding: 12px 16px; i { color: var(--color-gray-400); } input { border: none; background: none; outline: none; font-size: 14px; width: 100%; font-family: var(--font-family); } }
    .filter-group { display: flex; gap: 12px; }
    .filter-select { padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(61, 61, 96, 0.1); background: var(--color-background); font-size: 14px; font-family: var(--font-family); cursor: pointer; &:focus { outline: 2px solid var(--color-accent); } }
    .clubs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; padding-bottom: 60px; }
    .club-card { background: var(--color-white); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-card); transition: all 0.3s ease; &:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(61, 61, 96, 0.15); } }
    .card-image { position: relative; height: 180px; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; } &:hover img { transform: scale(1.05); } }
    .card-badge { position: absolute; top: 16px; right: 16px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; &[data-category="Speaking Club"] { background: rgba(59, 130, 246, 0.9); color: #fff; } &[data-category="Debate Club"] { background: rgba(200, 70, 48, 0.9); color: #fff; } &[data-category="Writing Club"] { background: rgba(16, 185, 129, 0.9); color: #fff; } &[data-category="Culture Club"] { background: rgba(246, 189, 96, 0.9); color: #5a4a00; } }
    .card-content { padding: 24px; }
    .card-title { font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; line-height: 1.4; a { color: inherit; text-decoration: none; &:hover { color: var(--color-accent); } } }
    .card-description { font-size: 14px; color: var(--color-gray-500); line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-meta { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-gray-500); i { font-size: 16px; color: var(--color-secondary); } }
    .card-footer { padding-top: 16px; border-top: 1px solid rgba(61, 61, 96, 0.08); }
    .btn-join { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, var(--color-primary), #2a2a4a); color: #fff; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; &:hover { transform: scale(1.05); box-shadow: 0 8px 20px rgba(61, 61, 96, 0.35); } }
    .no-results { grid-column: 1 / -1; text-align: center; padding: 80px 20px; i { font-size: 64px; color: var(--color-gray-300); margin-bottom: 24px; } h3 { font-size: 24px; color: var(--color-primary); margin: 0 0 12px; } p { color: var(--color-gray-500); } }
    @media (max-width: 768px) { .filters-bar { flex-direction: column; .search-box { max-width: 100%; } .filter-group { width: 100%; select { flex: 1; } } } .clubs-grid { grid-template-columns: 1fr; } }
  `]
})
export class ClientClubsListComponent implements OnInit {
  private clubService = inject(ClubService);
  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  searchTerm = '';
  selectedCategory = '';

  ngOnInit(): void {
    this.clubService.getAll().subscribe({
      next: (clubs) => {
        this.clubs = clubs ?? [];
        this.filteredClubs = [...this.clubs];
      },
      error: () => { this.clubs = []; this.filteredClubs = []; }
    });
  }

  filterClubs(): void {
    this.filteredClubs = this.clubs.filter(club => {
      const matchesSearch = club.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || club.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }
}
