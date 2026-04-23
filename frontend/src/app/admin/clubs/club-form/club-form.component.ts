import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClubService } from '../../../services/club.service';

@Component({
  selector: 'app-club-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div class="header-nav">
          <a routerLink="/admin/clubs" class="back-link"><i class="ti ti-arrow-left"></i> Back to Clubs</a>
          <h1 class="page-title">{{ isEditMode ? 'Edit Club' : 'Create New Club' }}</h1>
        </div>
      </div>

      <form [formGroup]="clubForm" (ngSubmit)="onSubmit()" class="form-container">
        <div class="form-grid">
          <div class="form-card">
            <h3>Club Information</h3>
            <div class="form-group">
              <label>Club Name *</label>
              <input type="text" formControlName="name" class="form-control" [class.error]="isFieldInvalid('name')">
              @if (isFieldInvalid('name')) { <span class="error-message">Name is required</span> }
            </div>
              <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select formControlName="category" class="form-control" [class.error]="isFieldInvalid('category')">
                  <option value="">Select Category</option>
                  <option value="Speaking Club">Speaking Club</option>
                  <option value="Debate Club">Debate Club</option>
                  <option value="Writing Club">Writing Club</option>
                  <option value="Culture Club">Culture Club</option>
                </select>
                @if (isFieldInvalid('category')) { <span class="error-message">Category is required</span> }
              </div>
              <div class="form-group">
                <label>Max Members *</label>
                <input type="number" formControlName="maxMembers" class="form-control" [class.error]="isFieldInvalid('maxMembers')">
                @if (isFieldInvalid('maxMembers')) { <span class="error-message">Required, min 1</span> }
              </div>
            </div>
            <div class="form-group">
              <label>Schedule *</label>
              <input type="text" formControlName="schedule" class="form-control" placeholder="e.g., Every Monday, 18:00-19:30" [class.error]="isFieldInvalid('schedule')">
              @if (isFieldInvalid('schedule')) { <span class="error-message">Schedule is required</span> }
            </div>
          </div>

          <div class="form-card">
            <h3>Details</h3>
            <div class="form-group">
              <label>Description *</label>
              <textarea formControlName="description" class="form-control" rows="4" [class.error]="isFieldInvalid('description')"></textarea>
              @if (isFieldInvalid('description')) { <span class="error-message">Description is required</span> }
            </div>
            <div class="form-group">
              <label>Image URL</label>
              <input type="text" formControlName="image" class="form-control" placeholder="assets/images/course-img-1.jpg">
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/admin/clubs" class="btn-cancel">Cancel</a>
          <button type="submit" class="btn-submit" [disabled]="clubForm.invalid">
            <i class="ti ti-check"></i> {{ isEditMode ? 'Update Club' : 'Create Club' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { margin-bottom: 24px; }
    .header-nav { display: flex; flex-direction: column; gap: 12px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--color-gray-500); text-decoration: none; &:hover { color: var(--color-primary); } }
    .page-title { font-family: var(--font-family); font-size: 28px; font-weight: 700; color: var(--color-primary); margin: 0; }
    .form-container { display: flex; flex-direction: column; gap: 24px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .form-card { background: var(--color-white); border-radius: 20px; padding: 24px; box-shadow: var(--shadow-card); h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(61, 61, 96, 0.08); } }
    .form-group { margin-bottom: 20px; label { display: block; font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px; } }
    .form-control { width: 100%; padding: 12px 16px; border: 2px solid rgba(61, 61, 96, 0.1); border-radius: 12px; font-size: 14px; &:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(61, 61, 96, 0.08); } &.error { border-color: var(--color-cta); } }
    .error-message { display: block; font-size: 12px; color: var(--color-cta); margin-top: 4px; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 12px; }
    .btn-cancel { padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; border: 2px solid rgba(61, 61, 96, 0.1); color: var(--color-gray-600); &:hover { border-color: var(--color-primary); color: var(--color-primary); } }
    .btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; border: none; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; cursor: pointer; &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(61, 61, 96, 0.3); } &:disabled { opacity: 0.6; cursor: not-allowed; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class ClubFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clubService = inject(ClubService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clubForm: FormGroup;
  isEditMode = false;
  clubId: number | null = null;

  constructor() {
    this.clubForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      category: ['', Validators.required],
      schedule: ['', [Validators.required, Validators.minLength(1)]],
      maxMembers: [15, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      image: ['assets/images/course-img-1.jpg']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clubId = +id;
      this.clubService.getById(this.clubId).subscribe({
        next: (club) => this.clubForm.patchValue(club)
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.clubForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.clubForm.invalid) return;
    const formData = this.clubForm.value;
    const payload = {
      name: formData.name,
      category: formData.category,
      schedule: formData.schedule,
      maxMembers: Number(formData.maxMembers),
      description: formData.description,
      image: formData.image || 'assets/images/course-img-1.jpg'
    };
    if (this.isEditMode && this.clubId != null) {
      this.clubService.update(this.clubId, payload).subscribe({
        next: () => this.router.navigate(['/admin/clubs']),
        error: () => { /* optional: show error message */ }
      });
    } else {
      this.clubService.create(payload).subscribe({
        next: () => this.router.navigate(['/admin/clubs']),
        error: () => { /* optional: show error message */ }
      });
    }
  }
}
