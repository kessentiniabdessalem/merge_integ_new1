import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService, Course } from '../../../core/data.service';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="crud-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Courses Management</h1>
          <p class="page-subtitle">Manage your English courses</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/courses/create" class="btn-admin primary">
            <i class="ti ti-plus"></i> Add Course
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input 
            type="text" 
            placeholder="Search courses..." 
            [(ngModel)]="searchTerm"
            (input)="filterCourses()"
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="selectedCategory" (change)="filterCourses()" class="filter-select">
            <option value="">All Categories</option>
            <option value="Grammar">Grammar</option>
            <option value="Speaking">Speaking</option>
            <option value="Business English">Business English</option>
            <option value="Exam Preparation">Exam Preparation</option>
          </select>
          <select [(ngModel)]="selectedLevel" (change)="filterCourses()" class="filter-select">
            <option value="">All Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>
      </div>

      <!-- Loading / Error states -->
      @if (loading) {
        <div class="loading-state">
          <i class="ti ti-loader-2"></i>
          <p>Loading courses...</p>
        </div>
      }
      @if (loadError) {
        <div class="error-state">
          <i class="ti ti-alert-circle"></i>
          <p>{{ loadError }}</p>
        </div>
      }

      <!-- Table -->
      @if (!loading) {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Teacher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (course of filteredCourses; track course.id) {
              <tr>
                <td>
                  <div class="course-cell">
                    <img [src]="course.image" [alt]="course.title" class="course-thumb">
                    <span class="course-title">{{ course.title }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [attr.data-category]="course.category">
                    {{ course.category }}
                  </span>
                </td>
                <td>{{ course.level }}</td>
                <td>{{ course.duration }}</td>
                <td>\${{ course.price }}</td>
                <td>{{ course.teacher }}</td>
                <td>
                  <div class="action-buttons">
                    <a [routerLink]="['/admin/courses', course.id]" class="btn-action view" title="View">
                      <i class="ti ti-eye"></i>
                    </a>
                    <a [routerLink]="['/admin/courses/edit', course.id]" class="btn-action edit" title="Edit">
                      <i class="ti ti-pencil"></i>
                    </a>
                    <button class="btn-action delete" title="Delete" (click)="confirmDelete(course)">
                      <i class="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="7" class="empty-state">
                  <i class="ti ti-book"></i>
                  <p>No courses found</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      } <!-- end @if (!loading) -->

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Confirm Delete</h3>
              <button class="modal-close" (click)="cancelDelete()">
                <i class="ti ti-x"></i>
              </button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete <strong>{{ courseToDelete?.title }}</strong>?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="cancelDelete()">Cancel</button>
              <button class="btn-admin danger" (click)="deleteCourse()" [disabled]="deleteInProgress">
                <i class="ti ti-trash"></i> {{ deleteInProgress ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .crud-page {
      animation: fadeIn 0.3s ease;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-family: var(--font-family);
      font-size: 28px;
      font-weight: 700;
      color: var(--color-primary);
      margin: 0;
    }

    .page-subtitle {
      font-size: 15px;
      color: var(--color-gray-500);
      margin: 6px 0 0;
    }

    .btn-admin {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      border: none;
      text-decoration: none;

      i { font-size: 18px; }

      &.primary {
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
        color: #fff;
        box-shadow: 0 4px 15px rgba(61, 61, 96, 0.3);
        &:hover {
          box-shadow: 0 8px 25px rgba(61, 61, 96, 0.4);
          transform: translateY(-2px);
        }
      }

      &.outline {
        background: var(--color-white);
        color: var(--color-primary);
        border: 2px solid rgba(61, 61, 96, 0.1);
        &:hover {
          border-color: rgba(61, 61, 96, 0.25);
          background: rgba(61, 61, 96, 0.04);
        }
      }

      &.danger {
        background: var(--color-cta);
        color: #fff;
        &:hover {
          background: #d96a5a;
        }
      }
    }

    .filters-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 250px;

      i {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-gray-400);
      }

      input {
        width: 100%;
        padding: 12px 14px 12px 44px;
        border: 2px solid rgba(61, 61, 96, 0.1);
        border-radius: 12px;
        font-size: 14px;
        transition: all 0.2s;

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(61, 61, 96, 0.08);
        }
      }
    }

    .filter-group {
      display: flex;
      gap: 12px;
    }

    .filter-select {
      padding: 12px 16px;
      border: 2px solid rgba(61, 61, 96, 0.1);
      border-radius: 12px;
      font-size: 14px;
      background: var(--color-white);
      cursor: pointer;
      min-width: 150px;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
      }
    }

    .table-container {
      background: var(--color-white);
      border-radius: 20px;
      box-shadow: var(--shadow-card);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 16px 20px;
        text-align: left;
      }

      th {
        background: rgba(61, 61, 96, 0.03);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--color-gray-500);
      }

      td {
        border-bottom: 1px solid rgba(61, 61, 96, 0.06);
        font-size: 14px;
        color: var(--color-primary);
      }

      tr:last-child td {
        border-bottom: none;
      }

      tr:hover td {
        background: rgba(61, 61, 96, 0.02);
      }
    }

    .course-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .course-thumb {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      object-fit: cover;
    }

    .course-title {
      font-weight: 500;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(61, 61, 96, 0.08);
      color: var(--color-primary);

      &[data-category="Grammar"] {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      &[data-category="Speaking"] {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
      &[data-category="Business English"] {
        background: rgba(246, 189, 96, 0.15);
        color: #b8860b;
      }
      &[data-category="Exam Preparation"] {
        background: rgba(200, 70, 48, 0.1);
        color: var(--color-cta);
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;

      i { font-size: 18px; }

      &.view {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        &:hover { background: rgba(59, 130, 246, 0.2); }
      }

      &.edit {
        background: rgba(246, 189, 96, 0.15);
        color: #b8860b;
        &:hover { background: rgba(246, 189, 96, 0.25); }
      }

      &.delete {
        background: rgba(200, 70, 48, 0.1);
        color: var(--color-cta);
        &:hover { background: rgba(200, 70, 48, 0.2); }
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px !important;
      color: var(--color-gray-400);

      i {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
      }

      p {
        font-size: 16px;
      }
    }

    // Modal
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease;
    }

    .modal-content {
      background: var(--color-white);
      border-radius: 20px;
      width: 100%;
      max-width: 450px;
      box-shadow: var(--shadow-2xl);
      animation: slideUp 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(61, 61, 96, 0.08);

      h3 {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-primary);
        margin: 0;
      }
    }

    .modal-close {
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(61, 61, 96, 0.06);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: rgba(61, 61, 96, 0.12);
      }
    }

    .modal-body {
      padding: 24px;

      p {
        margin: 0 0 8px;
        color: var(--color-gray-700);
      }

      .warning-text {
        font-size: 13px;
        color: var(--color-cta);
      }
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid rgba(61, 61, 96, 0.08);
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-gray-400);

      i {
        font-size: 40px;
        margin-bottom: 12px;
        display: block;
      }

      p { font-size: 15px; margin: 0; }
    }

    .error-state {
      color: var(--color-cta);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .filters-bar {
        flex-direction: column;
      }

      .filter-group {
        width: 100%;
      }

      .filter-select {
        flex: 1;
      }

      .data-table {
        display: block;
        overflow-x: auto;
      }
    }
  `]
})
export class CoursesListComponent {
  private dataService = inject(DataService);

  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';

  /** All courses loaded from the API */
  private allCourses: Course[] = [];
  filteredCourses: Course[] = [];

  loading = false;
  loadError = '';

  showDeleteModal = false;
  courseToDelete: Course | null = null;
  deleteInProgress = false;

  constructor() {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.loading = true;
    this.loadError = '';
    this.dataService.getCourses().subscribe({
      next: courses => {
        this.allCourses = courses;
        this.filterCourses();
        this.loading = false;
      },
      error: err => {
        this.loadError = 'Failed to load courses. Please try again.';
        this.loading = false;
        console.error('Error loading courses:', err);
      }
    });
  }

  filterCourses(): void {
    let courses = this.allCourses;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(term) ||
        (c.teacher ?? '').toLowerCase().includes(term)
      );
    }

    if (this.selectedCategory) {
      courses = courses.filter(c => c.category === this.selectedCategory);
    }

    if (this.selectedLevel) {
      courses = courses.filter(c => c.level === this.selectedLevel);
    }

    this.filteredCourses = courses;
  }

  confirmDelete(course: Course): void {
    this.courseToDelete = course;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.courseToDelete = null;
    this.showDeleteModal = false;
  }

  deleteCourse(): void {
    if (!this.courseToDelete) return;
    this.deleteInProgress = true;
    const id = this.courseToDelete.id;
    this.dataService.deleteCourse(id).subscribe({
      next: () => {
        this.allCourses = this.allCourses.filter(c => c.id !== id);
        this.filterCourses();
        this.deleteInProgress = false;
        this.cancelDelete();
      },
      error: err => {
        this.deleteInProgress = false;
        this.cancelDelete();
        console.error('Error deleting course:', err);
      }
    });
  }
}
