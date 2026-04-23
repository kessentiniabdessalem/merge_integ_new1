import { Component, OnInit, inject } from '@angular/core';
import { ApplicationService, Application } from '../../services/application.service';
import { MeetingService, Meeting } from '../../services/meeting.service';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.scss',
  standalone: false,
})
export class MyApplicationsComponent implements OnInit {
  private appService = inject(ApplicationService);
  private meetingService = inject(MeetingService);

  applications: Application[] = [];
  loading = true;
  error = '';

  // Meetings expanded per application
  meetingsMap: { [appId: number]: Meeting[] } = {};
  loadingMeetings: { [appId: number]: boolean } = {};
  expandedApp: number | null = null;

  // Delete confirmation
  deleteTarget: Application | null = null;
  deleting = false;

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';
    this.appService.getMyApplications().subscribe({
      next: (apps) => {
        this.applications = apps;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.status === 401
          ? 'You must be logged in to view your applications.'
          : 'Failed to load applications. Please try again.';
        this.loading = false;
      },
    });
  }

  toggleMeetings(appId: number): void {
    if (this.expandedApp === appId) {
      this.expandedApp = null;
      return;
    }
    this.expandedApp = appId;
    if (!this.meetingsMap[appId]) {
      this.loadingMeetings[appId] = true;
      this.meetingService.getMeetingsByApplication(appId).subscribe({
        next: (meetings) => {
          this.meetingsMap[appId] = meetings;
          this.loadingMeetings[appId] = false;
        },
        error: () => {
          this.meetingsMap[appId] = [];
          this.loadingMeetings[appId] = false;
        },
      });
    }
  }

  confirmDelete(app: Application): void {
    this.deleteTarget = app;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.appService.deleteApplication(this.deleteTarget.id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== this.deleteTarget!.id);
        this.deleteTarget = null;
        this.deleting = false;
      },
      error: () => {
        this.deleting = false;
      },
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'PENDING':  return 'Pending Review';
      case 'ACCEPTED': return 'Accepted';
      case 'REJECTED': return 'Rejected';
      default:         return status;
    }
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDateTime(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
