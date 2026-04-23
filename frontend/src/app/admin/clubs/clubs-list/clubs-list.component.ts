import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Club } from '../../../models/club.model';
import { ClubService } from '../../../services/club.service';

@Component({
  selector: 'app-clubs-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Clubs Management</h1>
          <p class="page-subtitle">Manage your English clubs</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/clubs/create" class="btn-admin primary"><i class="ti ti-plus"></i> Add Club</a>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input type="text" placeholder="Search clubs..." [(ngModel)]="searchTerm" (input)="filterClubs()">
        </div>
        <select [(ngModel)]="selectedCategory" (change)="filterClubs()" class="filter-select">
          <option value="">All Categories</option>
          <option value="Speaking Club">Speaking Club</option>
          <option value="Debate Club">Debate Club</option>
          <option value="Writing Club">Writing Club</option>
          <option value="Culture Club">Culture Club</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Club</th>
              <th>Category</th>
              <th>Schedule</th>
              <th>Max Members</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (club of filteredClubs; track club.id) {
              <tr>
                <td>
                  <div class="club-cell">
                    <img [src]="club.image" [alt]="club.name" class="club-thumb">
                    <span class="club-name">{{ club.name }}</span>
                  </div>
                </td>
                <td><span class="badge" [attr.data-category]="club.category">{{ club.category }}</span></td>
                <td>{{ club.schedule }}</td>
                <td>{{ club.maxMembers }}</td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="['/admin/clubs', club.id]" class="btn-action view"><i class="ti ti-eye"></i></a>
                    <a [routerLink]="['/admin/clubs/edit', club.id]" class="btn-action edit"><i class="ti ti-pencil"></i></a>
                    <button class="btn-action delete" (click)="confirmDelete(club)"><i class="ti ti-trash"></i></button>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="5" class="empty-state"><i class="ti ti-users"></i><p>No clubs found</p></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (showDeleteModal) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header"><h3>Confirm Delete</h3><button class="modal-close" (click)="cancelDelete()"><i class="ti ti-x"></i></button></div>
            <div class="modal-body"><p>Are you sure you want to delete <strong>{{ clubToDelete?.name }}</strong>?</p><p class="warning-text">This action cannot be undone.</p></div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="cancelDelete()">Cancel</button>
              <button class="btn-admin danger" (click)="deleteClub()"><i class="ti ti-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-title { font-family: var(--font-family); font-size: 28px; font-weight: 700; color: var(--color-primary); margin: 0; }
    .page-subtitle { font-size: 15px; color: var(--color-gray-500); margin: 6px 0 0; }
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; box-shadow: 0 4px 15px rgba(61, 61, 96, 0.3); &:hover { box-shadow: 0 8px 25px rgba(61, 61, 96, 0.4); transform: translateY(-2px); } } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61, 61, 96, 0.1); } &.danger { background: var(--color-cta); color: #fff; } }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 250px; i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-gray-400); } input { width: 100%; padding: 12px 14px 12px 44px; border: 2px solid rgba(61, 61, 96, 0.1); border-radius: 12px; font-size: 14px; &:focus { outline: none; border-color: var(--color-primary); } } }
    .filter-select { padding: 12px 16px; border: 2px solid rgba(61, 61, 96, 0.1); border-radius: 12px; font-size: 14px; background: var(--color-white); min-width: 150px; }
    .table-container { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 16px 20px; text-align: left; } th { background: rgba(61, 61, 96, 0.03); font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500); } td { border-bottom: 1px solid rgba(61, 61, 96, 0.06); font-size: 14px; color: var(--color-primary); } tr:hover td { background: rgba(61, 61, 96, 0.02); } }
    .club-cell { display: flex; align-items: center; gap: 12px; }
    .club-thumb { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
    .club-name { font-weight: 500; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; &[data-category="Speaking Club"] { background: rgba(59, 130, 246, 0.1); color: #3b82f6; } &[data-category="Debate Club"] { background: rgba(200, 70, 48, 0.1); color: var(--color-cta); } &[data-category="Writing Club"] { background: rgba(16, 185, 129, 0.1); color: #10b981; } &[data-category="Culture Club"] { background: rgba(246, 189, 96, 0.15); color: #b8860b; } }
    .action-buttons { display: flex; gap: 8px; }
    .btn-action { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; i { font-size: 18px; } &.view { background: rgba(59, 130, 246, 0.1); color: #3b82f6; } &.edit { background: rgba(246, 189, 96, 0.15); color: #b8860b; } &.delete { background: rgba(200, 70, 48, 0.1); color: var(--color-cta); } }
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; } }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: var(--color-white); border-radius: 20px; width: 100%; max-width: 450px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(61, 61, 96, 0.08); h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0; } }
    .modal-close { width: 32px; height: 32px; border: none; background: rgba(61, 61, 96, 0.06); border-radius: 8px; cursor: pointer; }
    .modal-body { padding: 24px; p { margin: 0 0 8px; } .warning-text { font-size: 13px; color: var(--color-cta); } }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid rgba(61, 61, 96, 0.08); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class ClubsListComponent implements OnInit {
  private clubService = inject(ClubService);
  searchTerm = '';
  selectedCategory = '';
  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  showDeleteModal = false;
  clubToDelete: Club | null = null;

  ngOnInit(): void {
    this.clubService.getAll().subscribe({
      next: (clubs) => {
        this.clubs = clubs ?? [];
        this.filterClubs();
      },
      error: () => { this.clubs = []; this.filterClubs(); }
    });
  }

  filterClubs(): void {
    let clubs = [...this.clubs];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      clubs = clubs.filter(c => c.name.toLowerCase().includes(term));
    }
    if (this.selectedCategory) {
      clubs = clubs.filter(c => c.category === this.selectedCategory);
    }
    this.filteredClubs = clubs;
  }

  confirmDelete(club: Club): void { this.clubToDelete = club; this.showDeleteModal = true; }
  cancelDelete(): void { this.clubToDelete = null; this.showDeleteModal = false; }
  deleteClub(): void {
    if (!this.clubToDelete) return;
    this.clubService.delete(this.clubToDelete.id).subscribe({
      next: () => {
        this.clubs = this.clubs.filter(c => c.id !== this.clubToDelete!.id);
        this.filterClubs();
        this.cancelDelete();
      }
    });
  }
}
