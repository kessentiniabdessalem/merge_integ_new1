import { Component, OnInit, inject } from '@angular/core';
import { JobService, Job, JobWithScore } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-job-offers',
  templateUrl: './job-offers.component.html',
  styleUrl: './job-offers.component.scss',
  standalone: false,
})
export class JobOffersComponent implements OnInit {
  private jobService = inject(JobService);
  private appService = inject(ApplicationService);
  private session = inject(SessionService);

  jobs: JobWithScore[] = [];
  filtered: JobWithScore[] = [];
  savedJobIds = new Set<number>();
  loading = true;
  error = '';

  // Filters
  searchTerm = '';
  locationFilter = '';
  subjectFilter = '';

  // Apply modal
  showApplyModal = false;
  applyJob: Job | null = null;
  coverLetter = '';  // kept as local variable name for the textarea binding (maps to 'motivation' on submit)
  cvFile: File | null = null;
  applying = false;
  applySuccess = '';
  applyError = '';

  // Detail modal
  showDetailModal = false;
  detailJob: Job | null = null;

  get currentUser() {
    return this.session['userSubject']?.value ?? null;
  }

  get isCandidate(): boolean {
    const role = localStorage.getItem('role') || '';
    return role === 'CANDIDATE' || role === 'TUTOR';
  }

  ngOnInit(): void {
    this.loadJobs();
    if (localStorage.getItem('token')) {
      this.jobService.getSavedJobs().subscribe({
        next: (saved) => saved.forEach(j => this.savedJobIds.add(j.id)),
        error: () => {}
      });
    }
  }

  loadJobs(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
    const obs = token ? this.jobService.getRankedJobs() : this.jobService.getAllJobs();
    obs.subscribe({
      next: (jobs: any[]) => {
        this.jobs = jobs ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load jobs.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let list = [...this.jobs];
    if (this.searchTerm) {
      const t = this.searchTerm.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(t) || j.description.toLowerCase().includes(t));
    }
    if (this.locationFilter) {
      const l = this.locationFilter.toLowerCase();
      list = list.filter(j => j.location.toLowerCase().includes(l));
    }
    if (this.subjectFilter) {
      const s = this.subjectFilter.toLowerCase();
      list = list.filter(j => j.subject.toLowerCase().includes(s));
    }
    this.filtered = list;
  }

  openDetail(job: Job): void {
    this.detailJob = job;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.detailJob = null;
  }

  openApply(job: Job): void {
    this.applyJob = job;
    this.showApplyModal = true;
    this.coverLetter = '';
    this.cvFile = null;
    this.applySuccess = '';
    this.applyError = '';
  }

  closeApply(): void {
    this.showApplyModal = false;
    this.applyJob = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.cvFile = input.files[0];
  }

  submitApply(): void {
    if (!this.applyJob) return;
    this.applying = true;
    this.applyError = '';
    this.appService.apply(this.applyJob.id, this.coverLetter, this.cvFile ?? undefined).subscribe({
      next: () => {
        this.applying = false;
        this.applySuccess = 'Application submitted successfully!';
      },
      error: (e) => {
        this.applying = false;
        this.applyError = e?.error?.message || 'Failed to submit application.';
      }
    });
  }

  toggleSave(job: Job): void {
    if (!localStorage.getItem('token')) return;
    if (this.savedJobIds.has(job.id)) {
      this.jobService.unsaveJob(job.id).subscribe({
        next: () => this.savedJobIds.delete(job.id),
        error: () => {}
      });
    } else {
      this.jobService.saveJob(job.id).subscribe({
        next: () => this.savedJobIds.add(job.id),
        error: () => {}
      });
    }
  }

  isSaved(jobId: number): boolean {
    return this.savedJobIds.has(jobId);
  }
}
