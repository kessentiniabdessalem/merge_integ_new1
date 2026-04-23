import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService, Application } from '../../services/application.service';
import { MeetingService, ScheduleMeetingRequest } from '../../services/meeting.service';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Applications</h1>
          <p class="page-subtitle">Review and manage tutor applications for this job</p>
        </div>
        <a routerLink="/admin/jobs" class="btn-admin outline">
          <i class="ti ti-arrow-left"></i> Back to Jobs
        </a>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tutor</th>
              <th>Applied</th>
              <th>Match Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of applications">
              <td>
                <strong>{{ app.teacherName }}</strong>
                <div class="sub">{{ app.motivation | slice:0:80 }}{{ (app.motivation?.length || 0) > 80 ? '...' : '' }}</div>
              </td>
              <td>{{ app.appliedAt | date:'mediumDate' }}</td>
              <td>
                <div class="score-bar">
                  <div class="score-fill" [style.width.%]="app.matchScore"></div>
                  <span>{{ app.matchScore }}%</span>
                </div>
              </td>
              <td>
                <span class="badge" [attr.data-status]="app.status">{{ app.status }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-action accept" (click)="updateStatus(app, 'ACCEPTED')" title="Accept" [disabled]="app.status === 'ACCEPTED'">
                    <i class="ti ti-check"></i>
                  </button>
                  <button class="btn-action reject" (click)="updateStatus(app, 'REJECTED')" title="Reject" [disabled]="app.status === 'REJECTED'">
                    <i class="ti ti-x"></i>
                  </button>
                  <button class="btn-action schedule" (click)="openSchedule(app)" title="Schedule Meeting" *ngIf="app.status === 'ACCEPTED'">
                    <i class="ti ti-calendar-plus"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="applications.length === 0">
              <td colspan="5" class="empty-state">
                <i class="ti ti-users"></i>
                <p>No applications yet</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Schedule Meeting Modal -->
      @if (showScheduleModal && selectedApp) {
        <div class="modal-overlay" (click)="closeSchedule()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3><i class="ti ti-calendar-plus"></i> Schedule Meeting</h3>
              <button class="modal-close" (click)="closeSchedule()"><i class="ti ti-x"></i></button>
            </div>
            <div class="modal-body">
              <p class="mb-3">Scheduling for <strong>{{ selectedApp.teacherName }}</strong></p>
              <div class="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" [(ngModel)]="meetingForm.scheduledAt" class="form-control">
              </div>
              <div class="form-group">
                <label>Duration (minutes)</label>
                <input type="number" [(ngModel)]="meetingForm.durationMinutes" min="15" class="form-control">
              </div>
              <div class="form-group">
                <label>Meeting Link</label>
                <input type="text" [(ngModel)]="meetingForm.meetingLink" placeholder="https://meet.google.com/..." class="form-control">
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="meetingForm.notes" rows="2" class="form-control" placeholder="Optional notes..."></textarea>
              </div>
              @if (scheduleSuccess) {
                <div class="alert success"><i class="ti ti-check-circle"></i> Meeting scheduled!</div>
              }
              @if (scheduleError) {
                <div class="alert error"><i class="ti ti-alert-circle"></i> {{ scheduleError }}</div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="closeSchedule()">Cancel</button>
              <button class="btn-admin primary" (click)="submitSchedule()" [disabled]="scheduling">
                <i class="ti ti-check"></i> {{ scheduling ? 'Scheduling...' : 'Schedule' }}
              </button>
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
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; box-shadow: 0 4px 15px rgba(61,61,96,0.3); &:hover { box-shadow: 0 8px 25px rgba(61,61,96,0.4); transform: translateY(-2px); } &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; } } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61,61,96,0.1); &:hover { border-color: rgba(61,61,96,0.25); background: rgba(61,61,96,0.04); } } }
    .table-container { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 16px 20px; text-align: left; vertical-align: middle; } th { background: rgba(61,61,96,0.03); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-gray-500); } td { border-bottom: 1px solid rgba(61,61,96,0.06); font-size: 14px; color: var(--color-primary); } tr:last-child td { border-bottom: none; } }
    .sub { font-size: 12px; color: var(--color-gray-500); margin-top: 4px; }
    .score-bar { display: flex; align-items: center; gap: 8px; width: 120px; }
    .score-fill { height: 6px; border-radius: 3px; background: linear-gradient(90deg, var(--color-primary), var(--color-secondary)); flex-shrink: 0; }
    .score-bar span { font-size: 12px; font-weight: 600; color: var(--color-primary); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; &[data-status="PENDING"] { background: rgba(245,158,11,0.1); color: #d97706; } &[data-status="ACCEPTED"] { background: rgba(16,185,129,0.1); color: #10b981; } &[data-status="REJECTED"] { background: rgba(200,70,48,0.1); color: var(--color-cta); } }
    .action-buttons { display: flex; gap: 8px; }
    .btn-action { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; i { font-size: 18px; } &.accept { background: rgba(16,185,129,0.1); color: #10b981; &:hover { background: rgba(16,185,129,0.2); } &:disabled { opacity: 0.4; cursor: not-allowed; } } &.reject { background: rgba(200,70,48,0.1); color: var(--color-cta); &:hover { background: rgba(200,70,48,0.2); } &:disabled { opacity: 0.4; cursor: not-allowed; } } &.schedule { background: rgba(59,130,246,0.1); color: #3b82f6; &:hover { background: rgba(59,130,246,0.2); } } }
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; display: block; } }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: var(--color-white); border-radius: 20px; width: 100%; max-width: 500px; box-shadow: var(--shadow-2xl); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(61,61,96,0.08); h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0; display: flex; align-items: center; gap: 8px; } }
    .modal-close { width: 32px; height: 32px; border: none; background: rgba(61,61,96,0.06); border-radius: 8px; cursor: pointer; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid rgba(61,61,96,0.08); }
    .form-group { margin-bottom: 16px; label { display: block; font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px; } }
    .form-control { width: 100%; padding: 12px 16px; border: 2px solid rgba(61,61,96,0.1); border-radius: 12px; font-size: 14px; &:focus { outline: none; border-color: var(--color-primary); } }
    .alert { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 12px; margin-top: 16px; font-size: 14px; i { font-size: 20px; } &.success { background: rgba(16,185,129,0.1); color: #10b981; } &.error { background: rgba(200,70,48,0.1); color: var(--color-cta); } }
    .mb-3 { margin-bottom: 16px; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private meetingService = inject(MeetingService);
  private route = inject(ActivatedRoute);

  jobId!: number;
  applications: Application[] = [];
  showScheduleModal = false;
  selectedApp: Application | null = null;
  scheduling = false;
  scheduleSuccess = false;
  scheduleError = '';

  meetingForm = {
    scheduledAt: '',
    durationMinutes: 60,
    meetingLink: '',
    notes: '',
  };

  ngOnInit(): void {
    this.jobId = +(this.route.snapshot.paramMap.get('jobId') || '0');
    if (this.jobId) {
      this.appService.getApplicationsByJob(this.jobId).subscribe({
        next: (apps: Application[]) => this.applications = apps ?? [],
        error: () => this.applications = []
      });
    }
  }

  updateStatus(app: Application, status: 'ACCEPTED' | 'REJECTED'): void {
    this.appService.updateStatus(app.id, status).subscribe({
      next: (updated: Application) => {
        app.status = updated.status;
      }
    });
  }

  openSchedule(app: Application): void {
    this.selectedApp = app;
    this.showScheduleModal = true;
    this.scheduleSuccess = false;
    this.scheduleError = '';
    this.meetingForm = { scheduledAt: '', durationMinutes: 60, meetingLink: '', notes: '' };
  }

  closeSchedule(): void {
    this.showScheduleModal = false;
    this.selectedApp = null;
  }

  submitSchedule(): void {
    if (!this.selectedApp) return;
    this.scheduling = true;
    this.scheduleError = '';
    const userId = Number(localStorage.getItem('userId') || 0);
    const userName = localStorage.getItem('userName') || 'Admin';

    const req: ScheduleMeetingRequest = {
      applicationId: this.selectedApp.id,
      scheduledAt: this.meetingForm.scheduledAt,
      durationMinutes: this.meetingForm.durationMinutes,
      meetingLink: this.meetingForm.meetingLink,
      notes: this.meetingForm.notes,
      assignedToId: userId,
      assignedToName: userName,
    };

    this.meetingService.scheduleMeeting(req).subscribe({
      next: () => { this.scheduling = false; this.scheduleSuccess = true; },
      error: (e: any) => { this.scheduling = false; this.scheduleError = e?.error?.message || 'Failed to schedule meeting.'; }
    });
  }
}
