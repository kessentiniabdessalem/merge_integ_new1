import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, Job } from '../../../services/job.service';
import { ApplicationService, Application } from '../../../services/application.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit ? 'Edit Job' : 'Create Job' }}</h1>
          <p class="page-subtitle">{{ isEdit ? 'Update job details' : 'Post a new tutor job offer' }}</p>
        </div>
        <a routerLink="/admin/jobs" class="btn-admin outline">
          <i class="ti ti-arrow-left"></i> Back to Jobs
        </a>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <div class="form-group span-2">
              <label>Job Title</label>
              <input formControlName="title" type="text" placeholder="e.g. English Language Tutor" class="form-control">
            </div>
            <div class="form-group span-2">
              <label>Description</label>
              <textarea formControlName="description" rows="4" placeholder="Describe the role and requirements..." class="form-control"></textarea>
            </div>
            <div class="form-group">
              <label>Location</label>
              <input formControlName="location" type="text" placeholder="e.g. Tunis, Remote" class="form-control">
            </div>
            <div class="form-group">
              <label>Subject</label>
              <input formControlName="subject" type="text" placeholder="e.g. Business English, IELTS" class="form-control">
            </div>
            <div class="form-group">
              <label>Salary Min (TND)</label>
              <input formControlName="salaryMin" type="number" placeholder="800" class="form-control">
            </div>
            <div class="form-group">
              <label>Salary Max (TND)</label>
              <input formControlName="salaryMax" type="number" placeholder="2000" class="form-control">
            </div>
            <div class="form-group span-2">
              <label>Expires At</label>
              <input formControlName="expiresAt" type="datetime-local" class="form-control">
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/admin/jobs" class="btn-admin outline">Cancel</a>
            <button type="submit" class="btn-admin primary" [disabled]="form.invalid || saving">
              <i class="ti ti-check"></i> {{ saving ? 'Saving...' : (isEdit ? 'Update Job' : 'Create Job') }}
            </button>
          </div>

          @if (successMsg) {
            <div class="alert success"><i class="ti ti-check-circle"></i> {{ successMsg }}</div>
          }
          @if (errorMsg) {
            <div class="alert error"><i class="ti ti-alert-circle"></i> {{ errorMsg }}</div>
          }
        </form>
      </div>
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-title { font-family: var(--font-family); font-size: 28px; font-weight: 700; color: var(--color-primary); margin: 0; }
    .page-subtitle { font-size: 15px; color: var(--color-gray-500); margin: 6px 0 0; }
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; box-shadow: 0 4px 15px rgba(61,61,96,0.3); &:hover { box-shadow: 0 8px 25px rgba(61,61,96,0.4); transform: translateY(-2px); } &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; } } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61,61,96,0.1); &:hover { border-color: rgba(61,61,96,0.25); background: rgba(61,61,96,0.04); } } }
    .form-card { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); padding: 32px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; label { font-size: 14px; font-weight: 600; color: var(--color-primary); } &.span-2 { grid-column: 1 / -1; } }
    .form-control { padding: 12px 16px; border: 2px solid rgba(61,61,96,0.1); border-radius: 12px; font-size: 14px; width: 100%; &:focus { outline: none; border-color: var(--color-primary); } }
    textarea.form-control { resize: vertical; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid rgba(61,61,96,0.08); }
    .alert { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 12px; margin-top: 16px; font-size: 14px; i { font-size: 20px; } &.success { background: rgba(16,185,129,0.1); color: #10b981; } &.error { background: rgba(200,70,48,0.1); color: var(--color-cta); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } .form-group.span-2 { grid-column: 1; } }
  `]
})
export class AdminJobFormComponent implements OnInit {
  private jobService = inject(JobService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  isEdit = false;
  jobId?: number;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    location: ['', Validators.required],
    subject: ['', Validators.required],
    salaryMin: [0, [Validators.required, Validators.min(0)]],
    salaryMax: [0, [Validators.required, Validators.min(0)]],
    expiresAt: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.jobId = +id;
      this.jobService.getJobById(this.jobId).subscribe({
        next: (job) => {
          this.form.patchValue({
            title: job.title,
            description: job.description,
            location: job.location,
            subject: job.subject,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            expiresAt: job.expiresAt?.slice(0, 16),
          });
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    const val = this.form.value as any;

    const obs = this.isEdit
      ? this.jobService.updateJob(this.jobId!, val)
      : this.jobService.createJob(val);

    obs.subscribe({
      next: () => { this.saving = false; this.successMsg = this.isEdit ? 'Job updated!' : 'Job created!'; },
      error: (e) => { this.saving = false; this.errorMsg = e?.error?.message || 'Something went wrong.'; }
    });
  }
}
