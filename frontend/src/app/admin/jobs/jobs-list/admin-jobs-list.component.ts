import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, Job } from '../../../services/job.service';

@Component({
  selector: 'app-admin-jobs-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Jobs Management</h1>
          <p class="page-subtitle">Post and manage tutor job offers</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/jobs/create" class="btn-admin primary">
            <i class="ti ti-plus"></i> Add Job
          </a>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input type="text" placeholder="Search jobs..." [(ngModel)]="searchTerm" (input)="filter()">
        </div>
        <select [(ngModel)]="statusFilter" (change)="filter()" class="filter-select">
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="EXPIRED">Expired</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Subject</th>
              <th>Location</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let job of filtered">
              <td><strong>{{ job.title }}</strong></td>
              <td>{{ job.subject }}</td>
              <td>{{ job.location }}</td>
              <td>{{ job.salaryMin | number }} – {{ job.salaryMax | number }} TND</td>
              <td>
                <span class="badge" [attr.data-status]="job.status">{{ job.status }}</span>
              </td>
              <td>{{ job.expiresAt | date:'mediumDate' }}</td>
              <td>
                <div class="action-buttons">
                  <a [routerLink]="['/admin/jobs/edit', job.id]" class="btn-action edit"><i class="ti ti-pencil"></i></a>
                  <a [routerLink]="['/admin/applications/job', job.id]" class="btn-action view" title="View applications"><i class="ti ti-users"></i></a>
                  <button class="btn-action delete" (click)="confirmDelete(job)"><i class="ti ti-trash"></i></button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0">
              <td colspan="7" class="empty-state">
                <i class="ti ti-briefcase"></i>
                <p>No jobs found</p>
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
              <p>Are you sure you want to delete <strong>{{ toDelete?.title }}</strong>?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="cancelDelete()">Cancel</button>
              <button class="btn-admin danger" (click)="doDelete()"><i class="ti ti-trash"></i> Delete</button>
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
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; box-shadow: 0 4px 15px rgba(61,61,96,0.3); &:hover { box-shadow: 0 8px 25px rgba(61,61,96,0.4); transform: translateY(-2px); } } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61,61,96,0.1); &:hover { border-color: rgba(61,61,96,0.25); background: rgba(61,61,96,0.04); } } &.danger { background: var(--color-cta); color: #fff; &:hover { background: #d96a5a; } } }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 250px; i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-gray-400); } input { width: 100%; padding: 12px 14px 12px 44px; border: 2px solid rgba(61,61,96,0.1); border-radius: 12px; font-size: 14px; &:focus { outline: none; border-color: var(--color-primary); } } }
    .filter-select { padding: 12px 16px; border: 2px solid rgba(61,61,96,0.1); border-radius: 12px; font-size: 14px; background: var(--color-white); cursor: pointer; min-width: 150px; &:focus { outline: none; border-color: var(--color-primary); } }
    .table-container { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 16px 20px; text-align: left; } th { background: rgba(61,61,96,0.03); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-gray-500); } td { border-bottom: 1px solid rgba(61,61,96,0.06); font-size: 14px; color: var(--color-primary); } tr:last-child td { border-bottom: none; } tr:hover td { background: rgba(61,61,96,0.02); } }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(61,61,96,0.08); color: var(--color-primary); &[data-status="OPEN"] { background: rgba(16,185,129,0.1); color: #10b981; } &[data-status="EXPIRED"] { background: rgba(245,158,11,0.1); color: #d97706; } &[data-status="CLOSED"] { background: rgba(200,70,48,0.1); color: var(--color-cta); } }
    .action-buttons { display: flex; gap: 8px; }
    .btn-action { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; i { font-size: 18px; } &.view { background: rgba(59,130,246,0.1); color: #3b82f6; &:hover { background: rgba(59,130,246,0.2); } } &.edit { background: rgba(246,189,96,0.15); color: #b8860b; &:hover { background: rgba(246,189,96,0.25); } } &.delete { background: rgba(200,70,48,0.1); color: var(--color-cta); &:hover { background: rgba(200,70,48,0.2); } } }
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; display: block; } }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: var(--color-white); border-radius: 20px; width: 100%; max-width: 450px; box-shadow: var(--shadow-2xl); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(61,61,96,0.08); h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0; } }
    .modal-close { width: 32px; height: 32px; border: none; background: rgba(61,61,96,0.06); border-radius: 8px; cursor: pointer; }
    .modal-body { padding: 24px; p { margin: 0 0 8px; } .warning-text { font-size: 13px; color: var(--color-cta); } }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid rgba(61,61,96,0.08); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminJobsListComponent implements OnInit {
  private jobService = inject(JobService);
  searchTerm = '';
  statusFilter = '';
  jobs: Job[] = [];
  filtered: Job[] = [];
  showDeleteModal = false;
  toDelete: Job | null = null;

  ngOnInit(): void {
    this.jobService.getAllJobs().subscribe({
      next: (jobs) => { this.jobs = jobs ?? []; this.filter(); },
      error: () => { this.jobs = []; this.filter(); }
    });
  }

  filter(): void {
    let list = [...this.jobs];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(t) || j.subject.toLowerCase().includes(t));
    }
    if (this.statusFilter) list = list.filter(j => j.status === this.statusFilter);
    this.filtered = list;
  }

  confirmDelete(job: Job): void { this.toDelete = job; this.showDeleteModal = true; }
  cancelDelete(): void { this.toDelete = null; this.showDeleteModal = false; }
  doDelete(): void {
    if (!this.toDelete) return;
    this.jobService.deleteJob(this.toDelete.id).subscribe({
      next: () => { this.jobs = this.jobs.filter(j => j.id !== this.toDelete!.id); this.filter(); this.cancelDelete(); },
      error: () => { this.cancelDelete(); }
    });
  }
}
