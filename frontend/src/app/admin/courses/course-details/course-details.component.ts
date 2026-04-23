import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DataService, Course } from '../../../core/data.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="crud-page">
      @if (loading) {
        <div class="loading-state">
          <i class="ti ti-loader-2"></i>
          <p>Loading course...</p>
        </div>
      } @else if (loadError) {
        <div class="not-found">
          <i class="ti ti-book"></i>
          <h2>Course Not Found</h2>
          <p>{{ loadError }}</p>
          <a routerLink="/admin/courses" class="btn-admin primary">
            <i class="ti ti-arrow-left"></i> Back to Courses
          </a>
        </div>
      } @else if (course) {
        <div class="page-header">
          <div class="header-nav">
            <a routerLink="/admin/courses" class="back-link">
              <i class="ti ti-arrow-left"></i> Back to Courses
            </a>
            <h1 class="page-title">{{ course.title }}</h1>
          </div>
          <div class="header-actions">
            <a [routerLink]="['/admin/courses/edit', course.id]" class="btn-admin primary">
              <i class="ti ti-pencil"></i> Edit
            </a>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-main">
            <div class="detail-card">
              <div class="card-header">
                <h3>Course Information</h3>
              </div>
              <div class="card-body">
                <div class="detail-row">
                  <span class="detail-label">Category</span>
                  <span class="badge" [attr.data-category]="course.category">{{ course.category }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Level</span>
                  <span class="detail-value">{{ course.level }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duration</span>
                  <span class="detail-value">{{ formatDuration(course.duration) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Price</span>
                  <span class="detail-value price">\${{ course.price }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Teacher</span>
                  <span class="detail-value">{{ course.teacher }}</span>
                </div>
                @if (course.studentsCount !== undefined) {
                  <div class="detail-row">
                    <span class="detail-label">Students</span>
                    <span class="detail-value">{{ course.studentsCount }}</span>
                  </div>
                }
                <div class="detail-row">
                  <span class="detail-label">Created</span>
                  <span class="detail-value">{{ course.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>

            <div class="detail-card">
              <div class="card-header">
                <h3>Description</h3>
              </div>
              <div class="card-body">
                <p class="description">{{ course.description }}</p>
              </div>
            </div>
          </div>

          <div class="details-sidebar">
            <div class="detail-card image-card">
              <img [src]="course.image" [alt]="course.title" class="course-image">
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .crud-page { animation: fadeIn 0.3s ease; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

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
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 24px;
    }

    .detail-card {
      background: var(--color-white);
      border-radius: 20px;
      padding: 24px;
      box-shadow: var(--shadow-card);
      margin-bottom: 24px;

      .card-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(61, 61, 96, 0.08);

        h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0;
        }
      }
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(61, 61, 96, 0.06);

      &:last-child { border-bottom: none; }
    }

    .detail-label {
      font-size: 14px;
      color: var(--color-gray-500);
    }

    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-primary);

      &.price {
        font-size: 20px;
        color: var(--color-secondary);
      }
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

    .description {
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-gray-600);
      margin: 0;
    }

    .image-card {
      padding: 0;
      overflow: hidden;
    }

    .course-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
    }

    .not-found {
      text-align: center;
      padding: 80px 20px;

      i {
        font-size: 64px;
        color: var(--color-gray-300);
        margin-bottom: 24px;
      }

      h2 {
        font-size: 24px;
        color: var(--color-primary);
        margin: 0 0 12px;
      }

      p {
        color: var(--color-gray-500);
        margin: 0 0 24px;
      }
    }

    .loading-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--color-gray-400);

      i { font-size: 48px; margin-bottom: 16px; display: block; }
      p  { font-size: 16px; margin: 0; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 992px) {
      .details-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CourseDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  course: Course | undefined;
  loading = false;
  loadError = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.dataService.getCourseById(+id).subscribe({
        next: course => {
          this.course = course;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.loadError = 'Course not found.';
          console.error('Error loading course:', err);
        }
      });
    }
  }

  /** Converts backend duration (minutes) to a human-readable string */
  formatDuration(minutes?: number): string {
    if (!minutes) return '—';
    const weeks = minutes / (7 * 24 * 60);
    if (Number.isInteger(weeks) && weeks >= 1) return `${weeks} week${weeks > 1 ? 's' : ''}`;
    const days = minutes / (24 * 60);
    if (Number.isInteger(days) && days >= 1)  return `${days} day${days > 1 ? 's' : ''}`;
    const hours = minutes / 60;
    if (Number.isInteger(hours) && hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}
