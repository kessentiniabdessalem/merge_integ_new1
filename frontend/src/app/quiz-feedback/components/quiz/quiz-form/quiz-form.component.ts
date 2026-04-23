import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuizService } from '../../../services/quiz-feedback.services';
import { Quiz } from '../../../models/quiz-feedback.models';

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEditMode ? 'Edit Quiz' : 'Create Quiz' }}</h1>
          <p class="page-subtitle">{{ isEditMode ? 'Update quiz details' : 'Create a new quiz for a course' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-admin outline" (click)="cancel()">
            <i class="ti ti-arrow-left"></i> Edit Quiz
          </button>
        </div>
      </div>

      <div class="form-card" *ngIf="!loading; else loadingTpl">
        <form [formGroup]="quizForm" (ngSubmit)="onSubmit()">

          <div class="form-section">
            <h2 class="section-title"><i class="ti ti-info-circle"></i> Basic Info</h2>

            <div class="field-group">
              <label class="field-label">Title <span class="required">*</span></label>
              <input
                type="text"
                class="field-input"
                [class.invalid]="quizForm.get('title')?.invalid && quizForm.get('title')?.touched"
                formControlName="title"
                placeholder="Enter quiz title"
              />
              <span class="field-error" *ngIf="quizForm.get('title')?.invalid && quizForm.get('title')?.touched">
                Title is required
              </span>
            </div>

            <div class="field-group">
              <label class="field-label">Description</label>
              <textarea
                class="field-input"
                formControlName="description"
                rows="3"
                placeholder="Describe the quiz..."
              ></textarea>
            </div>

            <div class="fields-row">
              <div class="field-group">
                <label class="field-label">Course ID <span class="required">*</span></label>
                <input
                  type="number"
                  class="field-input"
                  [class.invalid]="quizForm.get('courseId')?.invalid && quizForm.get('courseId')?.touched"
                  formControlName="courseId"
                  placeholder="e.g. 1"
                />
                <span class="field-error" *ngIf="quizForm.get('courseId')?.invalid && quizForm.get('courseId')?.touched">
                  Course ID is required
                </span>
              </div>

              <div class="field-group">
                <label class="field-label">Tutor ID</label>
                <input
                  type="number"
                  class="field-input"
                  formControlName="tutorId"
                  placeholder="e.g. 5"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title"><i class="ti ti-settings"></i> Settings</h2>

            <div class="fields-row three-col">
              <div class="field-group">
                <label class="field-label">Time Limit (min)</label>
                <input
                  type="number"
                  class="field-input"
                  formControlName="timeLimitMinutes"
                  placeholder="e.g. 30"
                  min="1"
                />
              </div>

              <div class="field-group">
                <label class="field-label">Passing Score (%)</label>
                <input
                  type="number"
                  class="field-input"
                  formControlName="passingScore"
                  placeholder="e.g. 70"
                  min="0"
                  max="100"
                />
              </div>

              <div class="field-group">
                <label class="field-label">Total Points</label>
                <input
                  type="number"
                  class="field-input"
                  formControlName="totalPoints"
                  placeholder="e.g. 100"
                  min="0"
                />
              </div>
            </div>

            <div class="field-group" style="max-width: 300px;">
              <label class="field-label">Status</label>
              <select class="field-input field-select" formControlName="status">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-admin outline" (click)="cancel()" [disabled]="saving">
              Edit Quiz
            </button>
            <button type="submit" class="btn-admin primary" [disabled]="quizForm.invalid || saving">
              <i class="ti ti-loader spin" *ngIf="saving"></i>
              <i class="ti ti-device-floppy" *ngIf="!saving"></i>
              {{ isEditMode ? 'Update Quiz' : 'Create Quiz' }}
            </button>
          </div>
        </form>
      </div>

      <ng-template #loadingTpl>
        <div class="loading-state">
          <i class="ti ti-loader-2 spin"></i>
          <p>Loading quiz...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-title { font-family: var(--font-family); font-size: 28px; font-weight: 700; color: var(--color-primary); margin: 0; }
    .page-subtitle { font-size: 15px; color: var(--color-gray-500); margin: 6px 0 0; }
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; box-shadow: 0 4px 15px rgba(61, 61, 96, 0.3); &:hover:not([disabled]) { box-shadow: 0 8px 25px rgba(61, 61, 96, 0.4); transform: translateY(-2px); } &[disabled] { opacity: 0.6; cursor: not-allowed; } } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61, 61, 96, 0.1); &:hover:not([disabled]) { border-color: rgba(61, 61, 96, 0.25); background: rgba(61, 61, 96, 0.04); } &[disabled] { opacity: 0.6; cursor: not-allowed; } } }
    .form-card { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .form-section { padding: 28px 32px; border-bottom: 1px solid rgba(61, 61, 96, 0.07); }
    .section-title { font-size: 15px; font-weight: 700; color: var(--color-primary); margin: 0 0 20px; display: flex; align-items: center; gap: 8px; i { font-size: 18px; color: var(--color-gray-400); } }
    .field-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; &:last-child { margin-bottom: 0; } }
    .field-label { font-size: 13px; font-weight: 600; color: var(--color-primary); }
    .required { color: var(--color-cta); }
    .field-input { padding: 11px 14px; border: 2px solid rgba(61, 61, 96, 0.1); border-radius: 12px; font-size: 14px; color: var(--color-primary); transition: border-color 0.2s, box-shadow 0.2s; width: 100%; box-sizing: border-box; &:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(61, 61, 96, 0.08); } &.invalid { border-color: var(--color-cta); } }
    textarea.field-input { resize: vertical; min-height: 90px; }
    .field-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; cursor: pointer; }
    .field-error { font-size: 12px; color: var(--color-cta); }
    .fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; &.three-col { grid-template-columns: 1fr 1fr 1fr; } }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 32px; background: rgba(61, 61, 96, 0.02); }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; color: var(--color-gray-400); i { font-size: 36px; margin-bottom: 12px; } p { font-size: 15px; margin: 0; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; display: inline-block; }
    @media (max-width: 600px) { .fields-row, .fields-row.three-col { grid-template-columns: 1fr; } .form-section { padding: 20px; } .form-actions { padding: 16px 20px; } }
  `]
})
export class QuizFormComponent implements OnInit, OnDestroy {
  quizForm!: FormGroup;
  isEditMode = false;
  quizId?: number;
  loading = false;
  saving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.quizId = +params['id'];
        this.loadQuiz();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      courseId: ['', Validators.required],
      tutorId: [''],
      timeLimitMinutes: [''],
      passingScore: [''],
      totalPoints: [''],
      status: ['DRAFT']
    });
  }

  loadQuiz(): void {
    if (!this.quizId) return;
    this.loading = true;
    this.quizService.getById(this.quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quiz) => { this.quizForm.patchValue(quiz); this.loading = false; },
        error: () => { this.loading = false; }
      });
  }

  onSubmit(): void {
    if (this.quizForm.invalid) { this.quizForm.markAllAsTouched(); return; }
    this.saving = true;
    const quizData: Quiz = this.quizForm.value;
    const op = this.isEditMode && this.quizId
      ? this.quizService.update(this.quizId, quizData)
      : this.quizService.create(quizData);

    op.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/admin/quizzes']); },
      error: () => { this.saving = false; alert('Error saving quiz. Please try again.'); }
    });
  }

  cancel(): void {
    if (this.isEditMode && this.quizId) {
      this.router.navigate(['/admin/quizzes', this.quizId]);
    } else {
      this.router.navigate(['/admin/quizzes']);
    }
  }
}
