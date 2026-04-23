import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div class="header-nav">
          <a routerLink="/admin/events" class="back-link"><i class="ti ti-arrow-left"></i> Back to Events</a>
          <h1 class="page-title">{{ isEditMode ? 'Edit Event' : 'Create New Event' }}</h1>
        </div>
      </div>

      <form [formGroup]="eventForm" (ngSubmit)="onSubmit()" class="form-container">
        <div class="form-grid">
          <div class="form-card">
            <h3>Event Information</h3>
            <div class="form-group">
              <label>Event Name *</label>
              <input type="text" formControlName="name" class="form-control" [class.error]="isFieldInvalid('name')">
              @if (isFieldInvalid('name')) { <span class="error-message">Name is required</span> }
            </div>
              <div class="form-row">
              <div class="form-group">
                <label>Category *</label>
                <select formControlName="category" class="form-control" [class.error]="isFieldInvalid('category')">
                  <option value="">Select Category</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="WEBINAR">Webinar</option>
                  <option value="CONFERENCE">Conference</option>
                  <option value="TRAINING">Training</option>
                  <option value="EXAM_PREPARATION">Exam Preparation</option>
                  <option value="BUSINESS_ENGLISH">Business English</option>
                  <option value="CULTURAL_EVENT">Cultural Event</option>
                </select>
                @if (isFieldInvalid('category')) { <span class="error-message">Category is required</span> }
              </div>
              <div class="form-group">
                <label>Max Places * (min 50)</label>
                <input type="number" formControlName="placesLimit" class="form-control" [class.error]="isFieldInvalid('placesLimit')">
                @if (isFieldInvalid('placesLimit')) { <span class="error-message">Required, min 50</span> }
              </div>
              <div class="form-group">
                <label>Status *</label>
                <select formControlName="status" class="form-control">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Description *</label>
              <textarea formControlName="description" class="form-control" rows="4" [class.error]="isFieldInvalid('description')"></textarea>
              @if (isFieldInvalid('description')) { <span class="error-message">Description is required</span> }
            </div>
          </div>

          <div class="form-card">
            <h3>Date, Location & Organizer</h3>
            <div class="form-group">
              <label>Date *</label>
              <input type="date" formControlName="date" class="form-control" [class.error]="isFieldInvalid('date')">
              @if (isFieldInvalid('date')) { <span class="error-message">Date is required</span> }
            </div>
            <div class="form-group">
              <label>Location *</label>
              <input type="text" formControlName="location" class="form-control" placeholder="e.g., Main Auditorium or Online" [class.error]="isFieldInvalid('location')">
              @if (isFieldInvalid('location')) { <span class="error-message">Location is required</span> }
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Organizer First Name *</label>
                <input type="text" formControlName="organizerFirstName" class="form-control" [class.error]="isFieldInvalid('organizerFirstName')">
                @if (isFieldInvalid('organizerFirstName')) { <span class="error-message">Required</span> }
              </div>
              <div class="form-group">
                <label>Organizer Last Name *</label>
                <input type="text" formControlName="organizerLastName" class="form-control" [class.error]="isFieldInvalid('organizerLastName')">
                @if (isFieldInvalid('organizerLastName')) { <span class="error-message">Required</span> }
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/admin/events" class="btn-cancel">Cancel</a>
          <button type="submit" class="btn-submit" [disabled]="eventForm.invalid">
            <i class="ti ti-check"></i> {{ isEditMode ? 'Update Event' : 'Create Event' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { margin-bottom: 24px; }
    .header-nav { display: flex; flex-direction: column; gap: 12px; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--color-gray-500); text-decoration: none; font-size: 14px; &:hover { color: var(--color-primary); } }
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
export class EventFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  eventForm: FormGroup;
  isEditMode = false;
  eventId: number | null = null;

  constructor() {
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(1)]],
      placesLimit: [50, [Validators.required, Validators.min(50)]],
      description: ['', [Validators.required, Validators.minLength(1)]],
      organizerFirstName: ['Admin', Validators.required],
      organizerLastName: ['User', Validators.required],
      status: ['Upcoming']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.eventId = +id;
      this.eventService.getById(this.eventId).subscribe({
        next: (event: any) => {
          const dateVal = typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0];
          this.eventForm.patchValue({ ...event, date: dateVal });
        }
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.eventForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.eventForm.invalid) return;
    const formData = this.eventForm.value;
    const payload = {
      name: formData.name,
      category: formData.category,
      status: formData.status || 'Upcoming',
      date: formData.date,
      location: formData.location,
      placesLimit: Number(formData.placesLimit),
      description: formData.description,
      organizerFirstName: formData.organizerFirstName || 'Admin',
      organizerLastName: formData.organizerLastName || 'User'
    };
    if (this.isEditMode && this.eventId != null) {
      this.eventService.update(this.eventId, payload).subscribe({
        next: () => this.router.navigate(['/admin/events']),
        error: (err: any) => console.error('Update event error', err)
      });
    } else {
      this.eventService.create(payload).subscribe({
        next: () => this.router.navigate(['/admin/events']),
        error: (err: any) => console.error('Create event error', err)
      });
    }
  }
}
