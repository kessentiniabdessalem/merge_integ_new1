import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MeetingService, Meeting } from '../../services/meeting.service';

@Component({
  selector: 'app-admin-meetings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Meetings</h1>
          <p class="page-subtitle">All scheduled meetings with tutors</p>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Application</th>
              <th>Scheduled</th>
              <th>Duration</th>
              <th>Assigned To</th>
              <th>Meeting Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of meetings">
              <td>#{{ m.applicationId }}</td>
              <td>{{ m.scheduledAt | date:'medium' }}</td>
              <td>{{ m.durationMinutes }} min</td>
              <td>{{ m.assignedToName }}</td>
              <td>
                <a *ngIf="m.meetingLink" [href]="m.meetingLink" target="_blank" class="link">
                  <i class="ti ti-external-link"></i> Join
                </a>
                <span *ngIf="!m.meetingLink" class="text-muted">—</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action delete" (click)="confirmDelete(m)" title="Cancel meeting">
                    <i class="ti ti-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="meetings.length === 0">
              <td colspan="6" class="empty-state">
                <i class="ti ti-calendar"></i>
                <p>No meetings scheduled</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      @if (showDeleteModal && toDelete) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Cancel Meeting</h3>
              <button class="modal-close" (click)="cancelDelete()"><i class="ti ti-x"></i></button>
            </div>
            <div class="modal-body">
              <p>Cancel meeting scheduled for <strong>{{ toDelete.scheduledAt | date:'medium' }}</strong>?</p>
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="cancelDelete()">No, Keep</button>
              <button class="btn-admin danger" (click)="doDelete()"><i class="ti ti-trash"></i> Cancel Meeting</button>
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
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61,61,96,0.1); &:hover { border-color: rgba(61,61,96,0.25); background: rgba(61,61,96,0.04); } } &.danger { background: var(--color-cta); color: #fff; &:hover { background: #d96a5a; } } }
    .table-container { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 16px 20px; text-align: left; } th { background: rgba(61,61,96,0.03); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-gray-500); } td { border-bottom: 1px solid rgba(61,61,96,0.06); font-size: 14px; color: var(--color-primary); } tr:last-child td { border-bottom: none; } }
    .link { color: #3b82f6; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; &:hover { text-decoration: underline; } }
    .text-muted { color: var(--color-gray-400); }
    .action-buttons { display: flex; gap: 8px; }
    .btn-action { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; i { font-size: 18px; } &.delete { background: rgba(200,70,48,0.1); color: var(--color-cta); &:hover { background: rgba(200,70,48,0.2); } } }
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; display: block; } }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: var(--color-white); border-radius: 20px; width: 100%; max-width: 450px; box-shadow: var(--shadow-2xl); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(61,61,96,0.08); h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0; } }
    .modal-close { width: 32px; height: 32px; border: none; background: rgba(61,61,96,0.06); border-radius: 8px; cursor: pointer; }
    .modal-body { padding: 24px; p { margin: 0; } }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid rgba(61,61,96,0.08); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminMeetingsComponent implements OnInit {
  private meetingService = inject(MeetingService);
  meetings: Meeting[] = [];
  showDeleteModal = false;
  toDelete: Meeting | null = null;

  ngOnInit(): void {
    this.meetingService.getAllMeetings().subscribe({
      next: (m: Meeting[]) => this.meetings = m ?? [],
      error: () => this.meetings = []
    });
  }

  confirmDelete(m: Meeting): void { this.toDelete = m; this.showDeleteModal = true; }
  cancelDelete(): void { this.toDelete = null; this.showDeleteModal = false; }
  doDelete(): void {
    if (!this.toDelete) return;
    this.meetingService.deleteMeeting(this.toDelete.id).subscribe({
      next: () => { this.meetings = this.meetings.filter((m: Meeting) => m.id !== this.toDelete!.id); this.cancelDelete(); },
      error: () => { this.cancelDelete(); }
    });
  }
}
