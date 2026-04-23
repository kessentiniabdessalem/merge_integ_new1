import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../core/data.service';
import { ModuleService, ModuleRequest } from '../../../services/module.service';
import { LessonService, LessonRequest } from '../../../services/lesson.service';
import { ModuleDto, LessonDto } from '../../../services/course.service';
import { AdminManagementService, UserProfile } from '../../../services/admin-management.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="crud-page">
      <div class="page-header">
        <div class="header-nav">
          <a routerLink="/admin/courses" class="back-link">
            <i class="ti ti-arrow-left"></i> Back to Courses
          </a>
          <h1 class="page-title">{{ isEditMode ? 'Edit Course' : 'Create New Course' }}</h1>
        </div>
      </div>

      <form [formGroup]="courseForm" (ngSubmit)="onSubmit()" class="form-container">
        <div class="form-grid">
          <!-- Basic Info -->
          <div class="form-card">
            <h3>Basic Information</h3>
            
            <div class="form-group">
              <label for="title">Course Title *</label>
              <input 
                type="text" 
                id="title" 
                formControlName="title"
                class="form-control"
                [class.error]="isFieldInvalid('title')"
              >
              @if (isFieldInvalid('title')) {
                <span class="error-message">Title is required</span>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="category">Category *</label>
                <select 
                  id="category" 
                  formControlName="category"
                  class="form-control"
                  [class.error]="isFieldInvalid('category')"
                >
                  <option value="">Select Category</option>
                  <option value="Grammar">Grammar</option>
                  <option value="Speaking">Speaking</option>
                  <option value="Business English">Business English</option>
                  <option value="Exam Preparation">Exam Preparation</option>
                </select>
                @if (isFieldInvalid('category')) {
                  <span class="error-message">Category is required</span>
                }
              </div>

              <div class="form-group">
                <label for="level">Level *</label>
                <select 
                  id="level" 
                  formControlName="level"
                  class="form-control"
                  [class.error]="isFieldInvalid('level')"
                >
                  <option value="">Select Level</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficient</option>
                </select>
                @if (isFieldInvalid('level')) {
                  <span class="error-message">Level is required</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea 
                id="description" 
                formControlName="description"
                class="form-control"
                rows="4"
                [class.error]="isFieldInvalid('description')"
              ></textarea>
              @if (isFieldInvalid('description')) {
                <span class="error-message">Description is required</span>
              }
            </div>
          </div>

          <!-- Details -->
          <div class="form-card">
            <h3>Course Details</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="duration">Duration *</label>
                <input 
                  type="text" 
                  id="duration" 
                  formControlName="duration"
                  placeholder="e.g., 8 weeks"
                  class="form-control"
                  [class.error]="isFieldInvalid('duration')"
                >
                @if (isFieldInvalid('duration')) {
                  <span class="error-message">Duration is required</span>
                }
              </div>

              <div class="form-group">
                <label for="price">Price ($) *</label>
                <input 
                  type="number" 
                  id="price" 
                  formControlName="price"
                  class="form-control"
                  [class.error]="isFieldInvalid('price')"
                >
                @if (isFieldInvalid('price')) {
                  <span class="error-message">Price is required</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="teacher">Assign Tutor *</label>
              <select
                id="teacher"
                formControlName="teacher"
                class="form-control"
                [class.error]="isFieldInvalid('teacher')"
              >
                <option value="">Select a tutor</option>
                @for (t of tutors; track t.id) {
                  <option [value]="t.firstName + ' ' + t.lastName">{{ t.firstName }} {{ t.lastName }} &lt;{{ t.email }}&gt;</option>
                }
              </select>
              @if (isFieldInvalid('teacher')) {
                <span class="error-message">Teacher is required</span>
              }
              @if (tutors.length === 0) {
                <span class="error-message" style="color: #888;">No tutors found. <a routerLink="/admin/tutors/create">Create one first.</a></span>
              }
            </div>

            <div class="form-group">
              <label for="image">Image URL</label>
              <input 
                type="text" 
                id="image" 
                formControlName="image"
                placeholder="assets/images/course-img-1.jpg"
                class="form-control"
              >
            </div>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/admin/courses" class="btn-cancel">Cancel</a>
          @if (submitError) {
            <span class="submit-error">{{ submitError }}</span>
          }
          <button type="submit" class="btn-submit" [disabled]="courseForm.invalid || submitting || loadingCourse">
            <i class="ti ti-check"></i>
            {{ submitting ? 'Saving...' : (isEditMode ? 'Update Course' : 'Create Course') }}
          </button>
        </div>
      </form>

      <!-- ─── Modules & Lessons (only available after course is saved) ──────── -->
      @if (isEditMode && courseId) {
        <div class="modules-section">
          <div class="modules-header">
            <h2>Course Curriculum</h2>
            <button class="btn-add-module" (click)="startAddModule()">
              <i class="ti ti-plus"></i> Add Module
            </button>
          </div>

          @if (moduleError) {
            <div class="module-error">{{ moduleError }}</div>
          }

          <!-- Add / edit module inline form -->
          @if (showModuleForm) {
            <div class="inline-form module-inline-form">
              <input [(ngModel)]="moduleFormData.title" placeholder="Module title *" class="form-control" />
              <input [(ngModel)]="moduleFormData.description" placeholder="Description" class="form-control" />
              <input [(ngModel)]="moduleFormData.durationMinutes" type="number" placeholder="Duration (min)" class="form-control small" />
              <div class="inline-form-actions">
                <button class="btn-save-inline" (click)="saveModule()" [disabled]="!moduleFormData.title">
                  {{ editingModuleId ? 'Update' : 'Add' }} Module
                </button>
                <button class="btn-cancel-inline" (click)="cancelModuleForm()">Cancel</button>
              </div>
            </div>
          }

          <!-- Modules list -->
          <div class="modules-list">
            @for (mod of modules; track mod.id) {
              <div class="module-card">
                <div class="module-header">
                  <div class="module-info">
                    <span class="module-order">{{ mod.orderIndex + 1 }}</span>
                    <div>
                      <h4>{{ mod.title }}</h4>
                      @if (mod.description) { <p class="module-desc">{{ mod.description }}</p> }
                    </div>
                  </div>
                  <div class="module-actions">
                    <span class="duration-badge" *ngIf="mod.durationMinutes">{{ mod.durationMinutes }} min</span>
                    <button class="btn-icon" (click)="startEditModule(mod)" title="Edit module">
                      <i class="ti ti-pencil"></i>
                    </button>
                    <button class="btn-icon danger" (click)="deleteModule(mod)" title="Delete module">
                      <i class="ti ti-trash"></i>
                    </button>
                    <button class="btn-add-lesson" (click)="startAddLesson(mod)">
                      <i class="ti ti-plus"></i> Add Lesson
                    </button>
                  </div>
                </div>

                <!-- Add / edit lesson inline form -->
                @if (showLessonFormForModule === mod.id) {
                  <div class="inline-form lesson-inline-form">
                    <input [(ngModel)]="lessonFormData.title" placeholder="Lesson title *" class="form-control" />
                    <input [(ngModel)]="lessonFormData.description" placeholder="Description" class="form-control" />
                    <input [(ngModel)]="lessonFormData.videoUrl" placeholder="Video URL" class="form-control" />
                    <input [(ngModel)]="lessonFormData.durationMinutes" type="number" placeholder="Duration (min)" class="form-control small" />
                    <div class="inline-form-actions">
                      <button class="btn-save-inline" (click)="saveLesson(mod)" [disabled]="!lessonFormData.title">
                        {{ editingLessonId ? 'Update' : 'Add' }} Lesson
                      </button>
                      <button class="btn-cancel-inline" (click)="cancelLessonForm()">Cancel</button>
                    </div>
                  </div>
                }

                <!-- Lessons list -->
                <div class="lessons-list">
                  @for (lesson of mod.lessons; track lesson.id) {
                    <div class="lesson-row">
                      <i class="ti ti-play-circle"></i>
                      <span class="lesson-title">{{ lesson.title }}</span>
                      @if (lesson.durationMinutes) {
                        <span class="lesson-duration">{{ lesson.durationMinutes }} min</span>
                      }
                      <div class="lesson-actions">
                        <button class="btn-icon small" (click)="startEditLesson(mod, lesson)" title="Edit lesson">
                          <i class="ti ti-pencil"></i>
                        </button>
                        <button class="btn-icon small danger" (click)="deleteLesson(mod, lesson)" title="Delete lesson">
                          <i class="ti ti-trash"></i>
                        </button>
                      </div>
                    </div>
                  }
                  @if (mod.lessons.length === 0) {
                    <p class="no-lessons">No lessons yet.</p>
                  }
                </div>
              </div>
            }
            @if (modules.length === 0 && !showModuleForm) {
              <p class="no-modules">No modules yet. Click "Add Module" to get started.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }

    .page-header { margin-bottom: 24px; }

    .header-nav { display: flex; flex-direction: column; gap: 12px; }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--color-gray-500);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
      &:hover { color: var(--color-primary); }
    }

    .page-title {
      font-family: var(--font-family);
      font-size: 28px;
      font-weight: 700;
      color: var(--color-primary);
      margin: 0;
    }

    .form-container { display: flex; flex-direction: column; gap: 24px; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .form-card {
      background: var(--color-white);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--shadow-card);

      h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0 0 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(61, 61, 96, 0.08);
      }
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-primary);
        margin-bottom: 8px;
      }
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid rgba(61, 61, 96, 0.1);
      border-radius: 12px;
      font-size: 14px;
      transition: all 0.2s;
      background: var(--color-white);
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(61, 61, 96, 0.08);
      }

      &.error {
        border-color: var(--color-cta);
      }

      &.small { width: 120px; }
    }

    .error-message {
      display: block;
      font-size: 12px;
      color: var(--color-cta);
      margin-top: 4px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    textarea.form-control { resize: vertical; min-height: 100px; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 12px;
    }

    .btn-cancel {
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border: 2px solid rgba(61, 61, 96, 0.1);
      color: var(--color-gray-600);
      transition: all 0.2s;
      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    .btn-submit {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: #fff;
      cursor: pointer;
      transition: all 0.25s;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(61, 61, 96, 0.3);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .submit-error {
      font-size: 13px;
      color: var(--color-cta);
      align-self: center;
    }

    /* ── Modules section ──────────────────────────────────────────── */

    .modules-section {
      margin-top: 32px;
      background: var(--color-white);
      border-radius: 20px;
      padding: 28px;
      box-shadow: var(--shadow-card);
    }

    .modules-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(61, 61, 96, 0.08);

      h2 {
        font-size: 20px;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
      }
    }

    .btn-add-module {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: #fff;
      cursor: pointer;
      transition: all 0.2s;
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(61, 61, 96, 0.25); }
    }

    .module-error {
      background: rgba(200, 70, 48, 0.1);
      color: var(--color-cta);
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 16px;
    }

    .inline-form {
      background: var(--color-background);
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: flex-start;
    }

    .inline-form-actions {
      display: flex;
      gap: 8px;
      align-self: center;
    }

    .btn-save-inline {
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      background: var(--color-primary);
      color: #fff;
      cursor: pointer;
      transition: opacity 0.2s;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-cancel-inline {
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: 2px solid rgba(61, 61, 96, 0.15);
      background: transparent;
      color: var(--color-gray-600);
      cursor: pointer;
    }

    .modules-list { display: flex; flex-direction: column; gap: 16px; }

    .no-modules, .no-lessons {
      font-size: 14px;
      color: var(--color-gray-400);
      font-style: italic;
      padding: 8px 0;
    }

    .module-card {
      border: 1px solid rgba(61, 61, 96, 0.1);
      border-radius: 14px;
      overflow: hidden;
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: rgba(61, 61, 96, 0.03);
      gap: 12px;
    }

    .module-info {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;

      h4 { font-size: 15px; font-weight: 600; color: var(--color-primary); margin: 0; }
    }

    .module-order {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-secondary);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .module-desc { font-size: 13px; color: var(--color-gray-500); margin: 2px 0 0; }

    .module-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .duration-badge {
      font-size: 12px;
      color: var(--color-gray-500);
      background: rgba(61, 61, 96, 0.06);
      padding: 3px 10px;
      border-radius: 20px;
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(61, 61, 96, 0.06);
      color: var(--color-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover { background: rgba(61, 61, 96, 0.12); }
      &.danger { &:hover { background: rgba(200, 70, 48, 0.12); color: var(--color-cta); } }
      &.small { width: 26px; height: 26px; font-size: 12px; }
    }

    .btn-add-lesson {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(61, 61, 96, 0.2);
      background: transparent;
      color: var(--color-primary);
      cursor: pointer;
      transition: all 0.2s;
      &:hover { background: rgba(61, 61, 96, 0.06); }
    }

    .lessons-list { padding: 8px 16px 12px; display: flex; flex-direction: column; gap: 4px; }

    .lesson-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(61, 61, 96, 0.05);

      &:last-child { border-bottom: none; }

      i { font-size: 18px; color: var(--color-secondary); flex-shrink: 0; }
    }

    .lesson-title { flex: 1; font-size: 14px; color: var(--color-gray-700); }

    .lesson-duration { font-size: 12px; color: var(--color-gray-400); }

    .lesson-actions { display: flex; gap: 4px; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
      .module-header { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class CourseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private moduleService = inject(ModuleService);
  private lessonService = inject(LessonService);
  private adminService = inject(AdminManagementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  courseForm: FormGroup;
  isEditMode = false;
  courseId: number | null = null;

  loadingCourse = false;
  submitting = false;
  submitError = '';

  tutors: UserProfile[] = [];

  // Modules state
  modules: ModuleDto[] = [];
  moduleError = '';
  showModuleForm = false;
  editingModuleId: number | null = null;
  moduleFormData: ModuleRequest = { title: '' };

  // Lessons state
  showLessonFormForModule: number | null = null;
  editingLessonId: number | null = null;
  lessonFormData: LessonRequest = { title: '' };

  constructor() {
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      level: ['', Validators.required],
      description: ['', Validators.required],
      duration: ['', Validators.required],   // free-text, e.g. "8 weeks"
      price: [null, [Validators.required, Validators.min(0)]],
      teacher: ['', Validators.required],
      image: ['assets/images/course-img-1.jpg']
    });
  }

  ngOnInit(): void {
    // Load tutor list for the dropdown
    this.adminService.getTutors().subscribe({
      next: t => { this.tutors = t; },
      error: () => { /* non-fatal — fallback to free-text if tutors can't load */ }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.courseId = +id;
      this.loadingCourse = true;
      this.dataService.getCourseById(this.courseId).subscribe({
        next: course => {
          this.courseForm.patchValue({
            title:       course.title,
            category:    course.category,
            level:       course.level,
            description: course.description ?? '',
            duration:    this.formatMinutesToDuration(course.duration),
            price:       course.price,
            teacher:     course.teacher ?? '',
            image:       course.image ?? 'assets/images/course-img-1.jpg'
          });
          this.loadingCourse = false;
          this.loadModules();
        },
        error: err => {
          this.loadingCourse = false;
          console.error('Error loading course:', err);
          this.router.navigate(['/admin/courses']);
        }
      });
    }
  }

  // ─── Modules ────────────────────────────────────────────────────────────

  loadModules(): void {
    if (!this.courseId) return;
    this.moduleService.list(this.courseId).subscribe({
      next: mods => { this.modules = mods; },
      error: err => console.error('Error loading modules:', err)
    });
  }

  startAddModule(): void {
    this.showModuleForm = true;
    this.editingModuleId = null;
    this.moduleFormData = { title: '', description: '', orderIndex: this.modules.length, durationMinutes: undefined };
    this.cancelLessonForm();
  }

  startEditModule(mod: ModuleDto): void {
    this.showModuleForm = true;
    this.editingModuleId = mod.id;
    this.moduleFormData = { title: mod.title, description: mod.description, orderIndex: mod.orderIndex, durationMinutes: mod.durationMinutes };
    this.cancelLessonForm();
  }

  cancelModuleForm(): void {
    this.showModuleForm = false;
    this.editingModuleId = null;
  }

  saveModule(): void {
    if (!this.courseId || !this.moduleFormData.title) return;
    this.moduleError = '';
    const req = this.moduleFormData;
    if (this.editingModuleId) {
      this.moduleService.update(this.courseId, this.editingModuleId, req).subscribe({
        next: () => { this.cancelModuleForm(); this.loadModules(); },
        error: () => { this.moduleError = 'Failed to update module.'; }
      });
    } else {
      this.moduleService.create(this.courseId, req).subscribe({
        next: () => { this.cancelModuleForm(); this.loadModules(); },
        error: () => { this.moduleError = 'Failed to create module.'; }
      });
    }
  }

  deleteModule(mod: ModuleDto): void {
    if (!this.courseId) return;
    if (!confirm(`Delete module "${mod.title}" and all its lessons?`)) return;
    this.moduleService.delete(this.courseId, mod.id).subscribe({
      next: () => this.loadModules(),
      error: () => { this.moduleError = 'Failed to delete module.'; }
    });
  }

  // ─── Lessons ────────────────────────────────────────────────────────────

  startAddLesson(mod: ModuleDto): void {
    this.showLessonFormForModule = mod.id;
    this.editingLessonId = null;
    this.lessonFormData = { title: '', description: '', videoUrl: '', orderIndex: mod.lessons.length, durationMinutes: undefined };
    this.cancelModuleForm();
  }

  startEditLesson(mod: ModuleDto, lesson: LessonDto): void {
    this.showLessonFormForModule = mod.id;
    this.editingLessonId = lesson.id;
    this.lessonFormData = { title: lesson.title, description: lesson.description, videoUrl: lesson.videoUrl, orderIndex: lesson.orderIndex, durationMinutes: lesson.durationMinutes };
    this.cancelModuleForm();
  }

  cancelLessonForm(): void {
    this.showLessonFormForModule = null;
    this.editingLessonId = null;
  }

  saveLesson(mod: ModuleDto): void {
    if (!this.courseId || !this.lessonFormData.title) return;
    this.moduleError = '';
    const req = this.lessonFormData;
    if (this.editingLessonId) {
      this.lessonService.update(this.courseId, mod.id, this.editingLessonId, req).subscribe({
        next: () => { this.cancelLessonForm(); this.loadModules(); },
        error: () => { this.moduleError = 'Failed to update lesson.'; }
      });
    } else {
      this.lessonService.create(this.courseId, mod.id, req).subscribe({
        next: () => { this.cancelLessonForm(); this.loadModules(); },
        error: () => { this.moduleError = 'Failed to create lesson.'; }
      });
    }
  }

  deleteLesson(mod: ModuleDto, lesson: LessonDto): void {
    if (!this.courseId) return;
    if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
    this.lessonService.delete(this.courseId, mod.id, lesson.id).subscribe({
      next: () => this.loadModules(),
      error: () => { this.moduleError = 'Failed to delete lesson.'; }
    });
  }

  // ─── Course form helpers ─────────────────────────────────────────────────

  /**
   * Converts a free-text duration string (e.g. "8 weeks", "90 minutes", "2 hours")
   * to an integer number of minutes for the backend.
   * Falls back to parsing as a raw integer if no unit is recognised.
   */
  private parseDurationToMinutes(text: string): number {
    const t = (text ?? '').trim().toLowerCase();
    const num = parseFloat(t);
    if (isNaN(num)) return 0;
    if (t.includes('week'))   return Math.round(num * 7 * 24 * 60);
    if (t.includes('day'))    return Math.round(num * 24 * 60);
    if (t.includes('hour'))   return Math.round(num * 60);
    if (t.includes('minute')) return Math.round(num);
    // no unit — treat as minutes
    return Math.round(num);
  }

  /**
   * Converts a backend duration in minutes back to a human-readable string
   * (e.g. 11520 → "8 weeks", 120 → "2 hours", 45 → "45 minutes").
   */
  private formatMinutesToDuration(minutes?: number): string {
    if (!minutes) return '';
    const weeks = minutes / (7 * 24 * 60);
    if (Number.isInteger(weeks) && weeks >= 1) return `${weeks} week${weeks > 1 ? 's' : ''}`;
    const days = minutes / (24 * 60);
    if (Number.isInteger(days) && days >= 1)  return `${days} day${days > 1 ? 's' : ''}`;
    const hours = minutes / 60;
    if (Number.isInteger(hours) && hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.courseForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.courseForm.invalid) return;
    const raw = this.courseForm.value;

    const payload = {
      ...raw,
      duration: this.parseDurationToMinutes(raw.duration)
    };

    this.submitting = true;
    this.submitError = '';

    const request$ = this.isEditMode && this.courseId
      ? this.dataService.updateCourse(this.courseId, payload)
      : this.dataService.addCourse(payload);

    request$.subscribe({
      next: saved => {
        this.submitting = false;
        if (!this.isEditMode) {
          // After creating, redirect to edit page so modules can be added
          this.router.navigate(['/admin/courses', saved.id, 'edit']);
        }
        // If update, stay here — modules section is already shown
      },
      error: err => {
        this.submitting = false;
        this.submitError = 'Failed to save course. Please try again.';
        console.error('Error saving course:', err);
      }
    });
  }
}
