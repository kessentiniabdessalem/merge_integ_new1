import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminManagementService, UserProfile } from '../../services/admin-management.service';

@Component({
  selector: 'app-tutors-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-0">Tutors</h2>
        <p class="text-muted small mb-0">All registered tutors on the platform</p>
      </div>
      <a routerLink="/admin/tutors/create" class="btn btn-primary">
        <i class="ti ti-plus me-1"></i> Add Tutor
      </a>
    </div>

    <div *ngIf="loading" class="text-center py-5 text-muted">
      <div class="spinner-border spinner-border-sm me-2"></div> Loading tutors...
    </div>

    <div *ngIf="!loading && tutors.length === 0" class="card border-0 shadow-sm rounded-4">
      <div class="card-body text-center py-5 text-muted">
        <i class="ti ti-chalkboard fs-1 d-block mb-3"></i>
        No tutors found. <a routerLink="/admin/tutors/create">Create the first tutor.</a>
      </div>
    </div>

    <div *ngIf="!loading && tutors.length > 0" class="card border-0 shadow-sm rounded-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of tutors; let i = index">
              <td class="text-muted small">{{ i + 1 }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="avatar avatar-sm rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center" style="width:36px;height:36px;font-size:14px;">
                    {{ (t.firstName || '?')[0].toUpperCase() }}{{ (t.lastName || '?')[0].toUpperCase() }}
                  </div>
                  <span class="fw-semibold">{{ t.firstName }} {{ t.lastName }}</span>
                </div>
              </td>
              <td class="text-muted small">{{ t.email }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" (click)="deleteConfirm(t)" [disabled]="deletingId === t.id">
                  <i class="ti ti-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete confirmation toast -->
    <div *ngIf="deleteError" class="position-fixed bottom-0 end-0 p-3" style="z-index:1100">
      <div class="toast show align-items-center text-bg-danger border-0">
        <div class="d-flex">
          <div class="toast-body">{{ deleteError }}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="deleteError=''"></button>
        </div>
      </div>
    </div>
  `
})
export class TutorsListComponent implements OnInit {
  tutors: UserProfile[] = [];
  loading = true;
  deletingId: number | null = null;
  deleteError = '';

  constructor(private adminService: AdminManagementService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adminService.getTutors().subscribe({
      next: t => { this.tutors = t; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  deleteConfirm(t: UserProfile): void {
    if (!confirm(`Delete tutor ${t.firstName} ${t.lastName}? This cannot be undone.`)) return;
    this.deletingId = t.id;
    this.adminService.deleteUser(t.id).subscribe({
      next: () => { this.deletingId = null; this.load(); },
      error: (e: any) => {
        this.deletingId = null;
        this.deleteError = e?.error?.message || 'Failed to delete tutor.';
        setTimeout(() => { this.deleteError = ''; }, 4000);
      }
    });
  }
}
