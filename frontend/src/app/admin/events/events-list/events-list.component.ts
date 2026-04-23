import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Events Management</h1>
          <p class="page-subtitle">Manage your events and activities</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/events/create" class="btn-admin primary">
            <i class="ti ti-plus"></i> Add Event
          </a>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input type="text" placeholder="Search events..." [(ngModel)]="searchTerm" (input)="filterEvents()">
        </div>
        <select [(ngModel)]="selectedCategory" (change)="filterEvents()" class="filter-select">
          <option value="">All Categories</option>
          <option value="WORKSHOP">Workshop</option>
          <option value="WEBINAR">Webinar</option>
          <option value="CONFERENCE">Conference</option>
          <option value="TRAINING">Training</option>
          <option value="EXAM_PREPARATION">Exam Preparation</option>
          <option value="BUSINESS_ENGLISH">Business English</option>
          <option value="CULTURAL_EVENT">Cultural Event</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th>Location</th>
              <th>Places Limit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let event of filteredEvents">
                <td>
                  <div class="event-cell">
                    <img [src]="event.photoUrl ? (event.photoUrl.startsWith('http') ? event.photoUrl : backendUrl + event.photoUrl) : ''" [alt]="event.name" class="event-thumb">
                    <span class="event-title">{{ event.name }}</span>
                  </div>
                </td>
                <td><span class="badge" [attr.data-category]="event.category">{{ event.category }}</span></td>
                <td>{{ event.date | date:'mediumDate' }}</td>
                <td>{{ event.status }}</td>
                <td>{{ event.location }}</td>
                <td>{{ event.placesLimit }}</td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="['/admin/events', event.id]" class="btn-action view"><i class="ti ti-eye"></i></a>
                    <a [routerLink]="['/admin/events/edit', event.id]" class="btn-action edit"><i class="ti ti-pencil"></i></a>
                    <button class="btn-action delete" (click)="confirmDelete(event)"><i class="ti ti-trash"></i></button>
                  </div>
                </td>
              </tr>
            <tr *ngIf="filteredEvents.length === 0">
                <td colspan="7" class="empty-state">
                  <i class="ti ti-calendar"></i>
                  <p>No events found</p>
                </td>
              </tr>
          </tbody>
        </table>
      </div>

      @if (showDeleteModal) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Confirm Delete</h3>
              <button class="modal-close" (click)="cancelDelete()"><i class="ti ti-x"></i></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete <strong>{{ eventToDelete?.name }}</strong>?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="cancelDelete()">Cancel</button>
              <button class="btn-admin danger" (click)="deleteEvent()"><i class="ti ti-trash"></i> Delete</button>
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
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; box-shadow: 0 4px 15px rgba(61, 61, 96, 0.3); &:hover { box-shadow: 0 8px 25px rgba(61, 61, 96, 0.4); transform: translateY(-2px); } } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61, 61, 96, 0.1); &:hover { border-color: rgba(61, 61, 96, 0.25); background: rgba(61, 61, 96, 0.04); } } &.danger { background: var(--color-cta); color: #fff; &:hover { background: #d96a5a; } } }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 250px; i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-gray-400); } input { width: 100%; padding: 12px 14px 12px 44px; border: 2px solid rgba(61, 61, 96, 0.1); border-radius: 12px; font-size: 14px; &:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(61, 61, 96, 0.08); } } }
    .filter-select { padding: 12px 16px; border: 2px solid rgba(61, 61, 96, 0.1); border-radius: 12px; font-size: 14px; background: var(--color-white); cursor: pointer; min-width: 150px; &:focus { outline: none; border-color: var(--color-primary); } }
    .table-container { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 16px 20px; text-align: left; } th { background: rgba(61, 61, 96, 0.03); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-gray-500); } td { border-bottom: 1px solid rgba(61, 61, 96, 0.06); font-size: 14px; color: var(--color-primary); } tr:last-child td { border-bottom: none; } tr:hover td { background: rgba(61, 61, 96, 0.02); } }
    .event-cell { display: flex; align-items: center; gap: 12px; }
    .event-thumb { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
    .event-title { font-weight: 500; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(61, 61, 96, 0.08); color: var(--color-primary); &[data-category="WORKSHOP"] { background: rgba(16, 185, 129, 0.1); color: #10b981; } &[data-category="CONFERENCE"] { background: rgba(200, 70, 48, 0.1); color: var(--color-cta); } &[data-category="WEBINAR"] { background: rgba(59, 130, 246, 0.1); color: #3b82f6; } &[data-category="CULTURAL_EVENT"] { background: rgba(246, 189, 96, 0.15); color: #b8860b; } &[data-category="TRAINING"] { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; } &[data-category="EXAM_PREPARATION"] { background: rgba(245, 158, 11, 0.1); color: #d97706; } &[data-category="BUSINESS_ENGLISH"] { background: rgba(20, 184, 166, 0.1); color: #0d9488; } }
    .action-buttons { display: flex; gap: 8px; }
    .btn-action { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; i { font-size: 18px; } &.view { background: rgba(59, 130, 246, 0.1); color: #3b82f6; &:hover { background: rgba(59, 130, 246, 0.2); } } &.edit { background: rgba(246, 189, 96, 0.15); color: #b8860b; &:hover { background: rgba(246, 189, 96, 0.25); } } &.delete { background: rgba(200, 70, 48, 0.1); color: var(--color-cta); &:hover { background: rgba(200, 70, 48, 0.2); } } }
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; display: block; } }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: var(--color-white); border-radius: 20px; width: 100%; max-width: 450px; box-shadow: var(--shadow-2xl); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(61, 61, 96, 0.08); h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0; } }
    .modal-close { width: 32px; height: 32px; border: none; background: rgba(61, 61, 96, 0.06); border-radius: 8px; cursor: pointer; &:hover { background: rgba(61, 61, 96, 0.12); } }
    .modal-body { padding: 24px; p { margin: 0 0 8px; } .warning-text { font-size: 13px; color: var(--color-cta); } }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid rgba(61, 61, 96, 0.08); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class EventsListComponent implements OnInit {
  private eventService = inject(EventService);
  backendUrl = environment.apiBase.replace(/\/?api$/, '');
  searchTerm = '';
  selectedCategory = '';
  events: Event[] = [];
  filteredEvents: Event[] = [];
  showDeleteModal = false;
  eventToDelete: Event | null = null;
  loading = true;

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: (events) => {
        this.events = events ?? [];
        this.filterEvents();
      },
      error: () => { this.events = []; this.filterEvents(); },
      complete: () => { this.loading = false; }
    });
  }

  filterEvents(): void {
    let events = [...this.events];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      events = events.filter(e => e.name.toLowerCase().includes(term));
    }
    if (this.selectedCategory) {
      events = events.filter(e => e.category === this.selectedCategory);
    }
    this.filteredEvents = events;
  }

  confirmDelete(event: Event): void { this.eventToDelete = event; this.showDeleteModal = true; }
  cancelDelete(): void { this.eventToDelete = null; this.showDeleteModal = false; }
  deleteEvent(): void {
    if (!this.eventToDelete) return;
    this.eventService.delete(this.eventToDelete.id).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== this.eventToDelete!.id);
        this.filterEvents();
        this.cancelDelete();
      },
      error: () => {
        this.events = this.events.filter(e => e.id !== this.eventToDelete!.id);
        this.filterEvents();
        this.cancelDelete();
      }
    });
  }
}
