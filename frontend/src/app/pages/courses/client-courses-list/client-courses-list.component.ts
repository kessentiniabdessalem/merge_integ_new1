import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService, Course } from '../../../core/data.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CourseRecommendationService, RecommendedCourse } from '../../../services/course-recommendation.service';

@Component({
  selector: 'app-client-courses-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="client-page">
      <div class="page-hero">
        <div class="container">
          <h1 class="hero-title">Explore Our <span class="highlight">Courses</span></h1>
          <p class="hero-subtitle">Master English with expert-led courses designed for all levels</p>
        </div>
      </div>
      <div class="container">

        <!-- ── Recommended for you ─────────────────────────────────── -->
        @if (loadingRecs) {
          <div class="recs-loading">
            <span class="spinner"></span> Loading personalised recommendations…
          </div>
        }
        @if (!loadingRecs && recommendations.length > 0) {
          <section class="recs-section">
            <div class="recs-header">
              <div class="recs-title-group">
                <i class="ti ti-sparkles recs-icon"></i>
                <h2 class="recs-title">Recommended for you</h2>
              </div>
              <p class="recs-subtitle">Based on your English level and skill assessment</p>
            </div>
            <div class="recs-grid">
              @for (rec of recommendations; track rec.id) {
                <div class="rec-card">
                  <div class="rec-image">
                    <img [src]="rec.thumbnail || rec.image || 'assets/images/course-placeholder.jpg'" [alt]="rec.title">
                    <div class="rec-badge" [attr.data-level]="dataService.getCourseLevelLabel(rec.level)">
                      {{ dataService.getCourseLevelLabel(rec.level) }}
                    </div>
                  </div>
                  <div class="rec-content">
                    <div class="rec-category">{{ rec.category }}</div>
                    <h3 class="rec-course-title">
                      <a [routerLink]="['/courses', rec.id]">{{ rec.title }}</a>
                    </h3>
                    <div class="rec-reason">
                      <i class="ti ti-info-circle"></i>
                      <span>{{ rec.reason }}</span>
                    </div>
                    <div class="rec-meta">
                      <span class="meta-item"><i class="ti ti-clock"></i> {{ rec.duration ? formatDuration(rec.duration) : '—' }}</span>
                      <span class="meta-item"><i class="ti ti-users"></i> {{ rec.studentsCount ?? 0 }} Students</span>
                    </div>
                    <div class="rec-footer">
                      <div class="price">\${{ rec.price }}</div>
                      <a [routerLink]="['/courses', rec.id]" class="btn-enroll">View Details</a>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }
        <!-- ──────────────────────────────────────────────────────────── -->

        <div class="filters-bar">
          <div class="search-box">
            <i class="ti ti-search"></i>
            <input type="text" placeholder="Search courses..." [(ngModel)]="searchTerm" (input)="filterCourses()">
          </div>
          <div class="filter-group">
            <select [(ngModel)]="selectedLevel" (change)="filterCourses()" class="filter-select">
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Elementary">Elementary</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Upper Intermediate">Upper Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Proficient">Proficient</option>
            </select>
            <select [(ngModel)]="selectedCategory" (change)="filterCourses()" class="filter-select">
              <option value="">All Categories</option>
              <option value="Grammar">Grammar</option>
              <option value="Speaking">Speaking</option>
              <option value="Business English">Business English</option>
              <option value="Exam Preparation">Exam Preparation</option>
            </select>
          </div>
        </div>
        <div class="courses-grid">
          @for (course of filteredCourses; track course.id) {
            <div class="course-card">
              <div class="card-image">
                <img [src]="course.thumbnail || course.image" [alt]="course.title">
                <div class="card-badge" [attr.data-level]="dataService.getCourseLevelLabel(course.level)">{{ dataService.getCourseLevelLabel(course.level) }}</div>
              </div>
              <div class="card-content">
                <div class="card-category">{{ course.category }}</div>
                <h3 class="card-title"><a [routerLink]="['/courses', course.id]">{{ course.title }}</a></h3>
                <p class="card-description">{{ course.description }}</p>
                <div class="card-meta">
                  <span class="meta-item"><i class="ti ti-clock"></i> {{ course.duration ? formatDuration(course.duration) : '—' }}</span>
                  <span class="meta-item"><i class="ti ti-users"></i> {{ course.studentsCount ?? 0 }} Students</span>
                </div>
                <div class="card-footer">
                  <div class="price">\${{ course.price }}</div>
                  <a [routerLink]="['/courses', course.id]" class="btn-enroll">View Details</a>
                </div>
              </div>
            </div>
          } @empty {
            <div class="no-results">
              <i class="ti ti-book"></i>
              <h3>No courses found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          }
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .client-page { min-height: 100vh; background: var(--color-background); }
    .page-hero { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); padding: 80px 0 60px; text-align: center; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .hero-title { font-family: var(--font-family); font-size: 48px; font-weight: 800; color: #fff; margin: 0 0 16px; }
    .highlight { color: var(--color-accent); }
    .hero-subtitle { font-size: 18px; color: rgba(255, 255, 255, 0.85); margin: 0; }

    /* ── Recommended section ── */
    .recs-loading {
      display: flex; align-items: center; gap: 10px;
      padding: 20px 0; color: var(--color-gray-500); font-size: 14px;
    }
    .spinner {
      width: 16px; height: 16px; border: 2px solid var(--color-gray-300);
      border-top-color: var(--color-secondary); border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .recs-section {
      margin: 40px 0 48px;
      background: linear-gradient(135deg, rgba(var(--color-secondary-rgb, 61,61,96), 0.04) 0%, rgba(var(--color-accent-rgb, 200,70,48), 0.04) 100%);
      border: 1px solid rgba(61, 61, 96, 0.08);
      border-radius: 24px; padding: 32px;
    }
    .recs-header { margin-bottom: 28px; }
    .recs-title-group { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .recs-icon { font-size: 24px; color: var(--color-accent); }
    .recs-title { font-size: 26px; font-weight: 800; color: var(--color-primary); margin: 0; }
    .recs-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
    .recs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .rec-card {
      background: var(--color-white); border-radius: 18px; overflow: hidden;
      box-shadow: var(--shadow-card); transition: all 0.3s ease;
      &:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(61, 61, 96, 0.14); }
    }
    .rec-image { position: relative; height: 180px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
      &:hover img { transform: scale(1.05); }
    }
    .rec-badge {
      position: absolute; top: 12px; right: 12px;
      padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
      &[data-level="Beginner"]         { background: #10b981; color: #fff; }
      &[data-level="Elementary"]       { background: #3b82f6; color: #fff; }
      &[data-level="Intermediate"]     { background: #f59e0b; color: #fff; }
      &[data-level="Upper Intermediate"] { background: #8b5cf6; color: #fff; }
      &[data-level="Advanced"]         { background: #ef4444; color: #fff; }
      &[data-level="Proficient"]       { background: #1f2937; color: #fff; }
    }
    .rec-content { padding: 20px; }
    .rec-category { font-size: 11px; font-weight: 600; color: var(--color-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .rec-course-title { font-size: 17px; font-weight: 700; color: var(--color-primary); margin: 0 0 10px; line-height: 1.4;
      a { color: inherit; text-decoration: none; &:hover { color: var(--color-accent); } }
    }
    .rec-reason {
      display: flex; align-items: flex-start; gap: 6px;
      background: rgba(200, 70, 48, 0.06); border-left: 3px solid var(--color-accent);
      border-radius: 0 8px 8px 0; padding: 8px 10px; margin-bottom: 12px;
      i { font-size: 14px; color: var(--color-accent); flex-shrink: 0; margin-top: 1px; }
      span { font-size: 12px; color: var(--color-gray-600, #374151); line-height: 1.5; }
    }
    .rec-meta { display: flex; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
    .meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--color-gray-500);
      i { font-size: 14px; color: var(--color-secondary); }
    }
    .rec-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid rgba(61, 61, 96, 0.08); }

    /* ── Filters & courses grid (unchanged) ── */
    .filters-bar { display: flex; gap: 20px; justify-content: space-between; align-items: center; padding: 24px; background: var(--color-white); border-radius: 20px; margin: 0 auto 40px; position: relative; z-index: 10; box-shadow: var(--shadow-card); }
    .search-box { display: flex; align-items: center; gap: 12px; flex: 1; max-width: 400px; background: var(--color-background); border-radius: 12px; padding: 12px 16px; i { color: var(--color-gray-400); } input { border: none; background: none; outline: none; font-size: 14px; width: 100%; font-family: var(--font-family); } }
    .filter-group { display: flex; gap: 12px; }
    .filter-select { padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(61, 61, 96, 0.1); background: var(--color-background); font-size: 14px; font-family: var(--font-family); cursor: pointer; &:focus { outline: 2px solid var(--color-accent); } }
    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; padding-bottom: 60px; }
    .course-card { background: var(--color-white); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-card); transition: all 0.3s ease; &:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(61, 61, 96, 0.15); } }
    .card-image { position: relative; height: 200px; overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; } &:hover img { transform: scale(1.05); } }
    .card-badge { position: absolute; top: 16px; right: 16px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; &[data-level="Beginner"] { background: #10b981; color: #fff; } &[data-level="Intermediate"] { background: #f59e0b; color: #fff; } &[data-level="Advanced"] { background: #ef4444; color: #fff; } }
    .card-content { padding: 24px; }
    .card-category { font-size: 12px; font-weight: 600; color: var(--color-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .card-title { font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 12px; line-height: 1.4; a { color: inherit; text-decoration: none; &:hover { color: var(--color-accent); } } }
    .card-description { font-size: 14px; color: var(--color-gray-500); line-height: 1.6; margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-meta { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(61, 61, 96, 0.08); }
    .price { font-size: 24px; font-weight: 800; color: var(--color-primary); }
    .btn-enroll { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: linear-gradient(135deg, var(--color-cta), #e05540); color: #fff; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; &:hover { transform: scale(1.05); box-shadow: 0 8px 20px rgba(200, 70, 48, 0.3); } }
    .no-results { grid-column: 1 / -1; text-align: center; padding: 80px 20px; i { font-size: 64px; color: var(--color-gray-300); margin-bottom: 24px; } h3 { font-size: 24px; color: var(--color-primary); margin: 0 0 12px; } p { color: var(--color-gray-500); } }
    @media (max-width: 768px) {
      .filters-bar { flex-direction: column; .search-box { max-width: 100%; } .filter-group { width: 100%; select { flex: 1; } } }
      .courses-grid { grid-template-columns: 1fr; }
      .recs-grid { grid-template-columns: 1fr; }
      .recs-section { padding: 20px; }
    }
  `]
})
export class ClientCoursesListComponent implements OnInit {
  dataService = inject(DataService);
  private recService = inject(CourseRecommendationService);

  private allCourses: Course[] = [];
  filteredCourses: Course[] = [];
  searchTerm = '';
  selectedLevel = '';
  selectedCategory = '';

  recommendations: RecommendedCourse[] = [];
  loadingRecs = true;

  ngOnInit(): void {
    this.dataService.getCourses().subscribe({
      next: courses => {
        this.allCourses = courses;
        this.filteredCourses = [...courses];
      },
      error: err => console.error('Error loading courses:', err)
    });

    this.recService.getRecommendations().subscribe({
      next: recs => {
        this.recommendations = recs;
        this.loadingRecs = false;
      },
      error: () => { this.loadingRecs = false; }
    });
  }

  filterCourses(): void {
    this.filteredCourses = this.allCourses.filter(course => {
      const levelLabel = this.dataService.getCourseLevelLabel(course.level);
      const matchesSearch = !this.searchTerm ||
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (course.description ?? '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesLevel    = !this.selectedLevel    || levelLabel === this.selectedLevel;
      const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }

  formatDuration(minutes: number): string {
    const weeks = minutes / (7 * 24 * 60);
    if (Number.isInteger(weeks) && weeks >= 1) return `${weeks}w`;
    const hours = minutes / 60;
    if (Number.isInteger(hours) && hours >= 1) return `${hours}h`;
    return `${minutes}min`;
  }
}
