import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService, Course } from '../../../core/data.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { CartService } from '../../../services/cart.service';
import { AiService } from '../../../ai/services/ai.service';

@Component({
  selector: 'app-client-course-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    @if (course) {
      <div class="client-page">
        <div class="course-hero">
          <div class="container">
            <div class="hero-content">
              <div class="breadcrumb">
                <a routerLink="/courses">Courses</a>
                <i class="ti ti-chevron-right"></i>
                <span>{{ course.category }}</span>
              </div>
              <h1 class="course-title">{{ course.title }}</h1>
              <p class="course-description">{{ course.description }}</p>
              <div class="course-meta">
                <span class="meta-badge level">{{ dataService.getCourseLevelLabel(course.level) }}</span>
                <span class="meta-item"><i class="ti ti-clock"></i> {{ formatDuration(course.duration) }}</span>
                <span class="meta-item"><i class="ti ti-users"></i> {{ course.studentsCount ?? 0 }} Students</span>
              </div>
              <div class="hero-actions">
                <div class="price-block">
                  <span class="price">\${{ course.price }}</span>
                  <span class="price-label">One-time payment</span>
                </div>
                <button class="btn-enroll-now" (click)="enroll()">{{ isInCart ? 'Go to Cart' : 'Enroll Now' }}</button>
              </div>
            </div>
            <div class="hero-image">
              <img [src]="course.thumbnail || course.image" [alt]="course.title">
            </div>
          </div>
        </div>
        <div class="container">
          <div class="course-content">
            <div class="content-main">
              <section class="content-section">
                <h2>What You'll Learn</h2>
                <ul class="learning-list">
                  <li><i class="ti ti-check"></i> Master essential grammar rules and sentence structures</li>
                  <li><i class="ti ti-check"></i> Build confidence in spoken English</li>
                  <li><i class="ti ti-check"></i> Expand your vocabulary with practical words and phrases</li>
                  <li><i class="ti ti-check"></i> Improve pronunciation and listening comprehension</li>
                  <li><i class="ti ti-check"></i> Prepare for internationally recognized exams</li>
                </ul>
              </section>
              <section class="content-section">
                <h2>Course Curriculum</h2>
                <div class="curriculum-list">
                  @if (course.modules && course.modules.length > 0) {
                    @for (mod of course.modules; track mod.id) {
                      <div class="curriculum-item">
                        <div class="curriculum-icon"><i class="ti ti-layout-list"></i></div>
                        <div class="curriculum-content">
                          <h4>Module {{ mod.orderIndex + 1 }}: {{ mod.title }}</h4>
                          <span>{{ mod.lessons.length }} lesson{{ mod.lessons.length !== 1 ? 's' : '' }}{{ mod.durationMinutes ? ' • ' + mod.durationMinutes + ' min' : '' }}</span>
                          @if (mod.lessons.length > 0) {
                            <ul class="lesson-list">
                              @for (lesson of mod.lessons; track lesson.id) {
                                <li><i class="ti ti-play-circle"></i> {{ lesson.title }}{{ lesson.durationMinutes ? ' (' + lesson.durationMinutes + ' min)' : '' }}</li>
                              }
                            </ul>
                          }
                        </div>
                      </div>
                    }
                  } @else {
                    @for (i of [1,2,3,4,5]; track i) {
                      <div class="curriculum-item">
                        <div class="curriculum-icon"><i class="ti ti-play-circle"></i></div>
                        <div class="curriculum-content">
                          <h4>Module {{ i }}: {{ getModuleTitle(i) }}</h4>
                          <span>8 lessons • 2 hours</span>
                        </div>
                      </div>
                    }
                  }
                </div>
              </section>
              <section class="content-section">
                <h2>About the Instructor</h2>
                <div class="instructor-card">
                  <div class="instructor-avatar">
                    <img [src]="'assets/images/avatar/avatar-' + ((course.id % 6) + 1) + '.jpg'" [alt]="course.teacher">
                  </div>
                  <div class="instructor-info">
                    <h3>{{ course.teacher }}</h3>
                    <p class="instructor-title">Senior English Instructor</p>
                    <p class="instructor-bio">Experienced teacher with over 10 years of teaching English to students from around the world. Specialized in helping students achieve their language goals.</p>
                    <div class="instructor-stats">
                      <span><i class="ti ti-users"></i> 2,500+ Students</span>
                      <span><i class="ti ti-book"></i> 15 Courses</span>
                      <span><i class="ti ti-star"></i> 4.9 Rating</span>
                    </div>
                  </div>
                </div>
              </section>
              <section class="content-section study-plan-section">
                <h2><i class="ti ti-brain"></i> AI Study Plan</h2>
                <p class="study-plan-intro">Let our AI generate a personalized week-by-week study plan for this course based on your schedule.</p>
                <div class="study-plan-context">
                  <label for="extraContext">Your availability / goals (optional)</label>
                  <input id="extraContext" type="text" [(ngModel)]="studyPlanContext" placeholder="e.g. I have 2 weeks and can study 2 hours per day" class="context-input">
                </div>
                <button class="btn-generate-plan" (click)="generateStudyPlan()" [disabled]="studyPlanLoading">
                  @if (studyPlanLoading) {
                    <i class="ti ti-loader-2 spin"></i> Generating...
                  } @else {
                    <i class="ti ti-sparkles"></i> Generate Study Plan
                  }
                </button>
                @if (studyPlanError) {
                  <div class="study-plan-error"><i class="ti ti-alert-circle"></i> {{ studyPlanError }}</div>
                }
                @if (studyPlanAdvice) {
                  <div class="study-plan-result">
                    <div class="study-plan-header">
                      <i class="ti ti-calendar-check"></i>
                      <span>Study Plan for <strong>{{ course.title }}</strong></span>
                    </div>
                    <pre class="study-plan-text">{{ studyPlanAdvice }}</pre>
                  </div>
                }
              </section>
            </div>
            <div class="content-sidebar">
              <div class="sidebar-card">
                <h3>This Course Includes</h3>
                <ul class="includes-list">
                  <li><i class="ti ti-video"></i> {{ course.studentsCount ?? 0 }} Students Enrolled</li>
                  <li><i class="ti ti-file-text"></i> Downloadable Resources</li>
                  <li><i class="ti ti-certificate"></i> Certificate of Completion</li>
                  <li><i class="ti ti-infinity"></i> Lifetime Access</li>
                  <li><i class="ti ti-device-mobile"></i> Mobile Friendly</li>
                </ul>
                <button class="btn-enroll-full" (click)="enroll()">{{ isInCart ? 'Go to Cart' : 'Enroll Now - $' + course.price }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="not-found-page">
        <app-navbar></app-navbar>
        <div class="not-found">
          <div class="container">
            <i class="ti ti-book"></i>
            <h2>Course Not Found</h2>
            <p>The course you're looking for doesn't exist.</p>
            <a routerLink="/courses" class="btn-back">Browse Courses</a>
          </div>
        </div>
        <app-footer></app-footer>
      </div>
    }
    <app-footer></app-footer>
  `,
  styles: [`
    .client-page { min-height: 100vh; background: var(--color-background); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .course-hero { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); padding: 60px 0; }
    .course-hero .container { display: grid; grid-template-columns: 1fr 400px; gap: 60px; align-items: center; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 14px; a { color: rgba(255,255,255,0.8); text-decoration: none; &:hover { color: var(--color-accent); } } span { color: rgba(255,255,255,0.8); } i { font-size: 12px; color: rgba(255,255,255,0.5); } }
    .course-title { font-family: var(--font-family); font-size: 42px; font-weight: 800; color: #fff; margin: 0 0 16px; line-height: 1.2; }
    .course-description { font-size: 18px; color: rgba(255,255,255,0.9); margin: 0 0 24px; line-height: 1.6; }
    .course-meta { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 32px; }
    .meta-badge { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; &.level { background: var(--color-accent); color: var(--color-primary); } }
    .meta-item { display: flex; align-items: center; gap: 6px; font-size: 14px; color: rgba(255,255,255,0.85); i { font-size: 18px; } }
    .hero-actions { display: flex; align-items: center; gap: 24px; }
    .price-block { display: flex; flex-direction: column; }
    .price { font-size: 36px; font-weight: 800; color: #fff; }
    .price-label { font-size: 13px; color: rgba(255,255,255,0.7); }
    .btn-enroll-now { padding: 16px 32px; background: var(--color-cta); color: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; &:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(200,70,48,0.4); } }
    .hero-image { border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); img { width: 100%; height: 300px; object-fit: cover; } }
    .course-content { display: grid; grid-template-columns: 1fr 340px; gap: 40px; padding: 60px 0; }
    .content-section { background: var(--color-white); border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: var(--shadow-card); h2 { font-size: 24px; font-weight: 700; color: var(--color-primary); margin: 0 0 24px; } }
    .learning-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; li { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: var(--color-gray-600); i { color: #10b981; font-size: 20px; margin-top: 2px; } } }
    .curriculum-list { display: flex; flex-direction: column; gap: 12px; }
    .curriculum-item { display: flex; gap: 16px; padding: 16px; background: var(--color-background); border-radius: 12px; transition: all 0.2s ease; &:hover { background: rgba(61,61,96,0.05); } }
    .curriculum-icon { width: 44px; height: 44px; background: var(--color-secondary); border-radius: 10px; display: flex; align-items: center; justify-content: center; i { font-size: 22px; color: #fff; } }
    .curriculum-content { flex: 1; h4 { font-size: 15px; font-weight: 600; color: var(--color-primary); margin: 0 0 4px; } span { font-size: 13px; color: var(--color-gray-500); } }
    .lesson-list { list-style: none; padding: 6px 0 0; margin: 0; display: flex; flex-direction: column; gap: 4px; li { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-gray-600); i { font-size: 14px; color: var(--color-secondary); } } }
    .instructor-card { display: flex; gap: 24px; }
    .instructor-avatar { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }
    .instructor-info { flex: 1; h3 { font-size: 20px; font-weight: 700; color: var(--color-primary); margin: 0 0 4px; } }
    .instructor-title { font-size: 14px; color: var(--color-secondary); margin: 0 0 12px; }
    .instructor-bio { font-size: 14px; color: var(--color-gray-500); line-height: 1.6; margin: 0 0 16px; }
    .instructor-stats { display: flex; gap: 20px; span { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-gray-500); i { color: var(--color-accent); } } }
    .sidebar-card { background: var(--color-white); border-radius: 20px; padding: 28px; box-shadow: var(--shadow-card); position: sticky; top: 24px; h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0 0 20px; } }
    .includes-list { list-style: none; padding: 0; margin: 0 0 24px; li { display: flex; align-items: center; gap: 12px; padding: 10px 0; font-size: 14px; color: var(--color-gray-600); border-bottom: 1px solid rgba(61,61,96,0.06); &:last-child { border-bottom: none; } i { font-size: 20px; color: var(--color-secondary); } } }
    .btn-enroll-full { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--color-cta), #e05540); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; &:hover { transform: scale(1.02); box-shadow: 0 8px 25px rgba(200,70,48,0.35); } }
    .not-found-page { min-height: 100vh; background: var(--color-background); }
    .not-found { text-align: center; padding: 100px 20px; i { font-size: 80px; color: var(--color-gray-300); margin-bottom: 24px; } h2 { font-size: 28px; color: var(--color-primary); margin: 0 0 12px; } p { color: var(--color-gray-500); margin: 0 0 24px; } }
    .btn-back { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--color-primary); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 600; }
    @media (max-width: 992px) { .course-hero .container { grid-template-columns: 1fr; } .hero-image { display: none; } .course-content { grid-template-columns: 1fr; } .learning-list { grid-template-columns: 1fr; } }
    .study-plan-section h2 { display: flex; align-items: center; gap: 10px; i { font-size: 28px; color: var(--color-secondary); } }
    .study-plan-intro { font-size: 15px; color: var(--color-gray-500); margin: 0 0 20px; line-height: 1.6; }
    .study-plan-context { margin-bottom: 16px; label { display: block; font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px; } }
    .context-input { width: 100%; padding: 12px 16px; border: 1.5px solid rgba(61,61,96,0.15); border-radius: 10px; font-size: 14px; color: var(--color-primary); background: var(--color-background); outline: none; box-sizing: border-box; &:focus { border-color: var(--color-secondary); } }
    .btn-generate-plan { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(135deg, var(--color-secondary), var(--color-primary)); color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; &:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 8px 25px rgba(61,61,96,0.35); } &:disabled { opacity: 0.65; cursor: not-allowed; } i { font-size: 20px; } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .study-plan-error { margin-top: 16px; padding: 14px 18px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #dc2626; font-size: 14px; display: flex; align-items: center; gap: 8px; i { font-size: 18px; } }
    .study-plan-result { margin-top: 24px; border: 1.5px solid rgba(61,61,96,0.12); border-radius: 14px; overflow: hidden; }
    .study-plan-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; background: linear-gradient(135deg, rgba(61,61,96,0.06), rgba(61,61,96,0.02)); border-bottom: 1px solid rgba(61,61,96,0.1); font-size: 15px; color: var(--color-primary); i { font-size: 22px; color: var(--color-secondary); } }
    .study-plan-text { margin: 0; padding: 20px; font-family: inherit; font-size: 14px; line-height: 1.8; color: var(--color-gray-600); white-space: pre-wrap; word-break: break-word; background: #fff; }
  `]
})
export class ClientCourseDetailsComponent implements OnInit {
  dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private aiService = inject(AiService);

  course: Course | undefined;
  isInCart = false;

  // Study plan
  studyPlanContext = '';
  studyPlanLoading = false;
  studyPlanAdvice: string | null = null;
  studyPlanError: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getCourseById(+id).subscribe({
        next: course => {
          this.course = course;
          this.isInCart = this.cartService.isInCart(course.id);
        },
        error: err => console.error('Error loading course:', err)
      });
    }
  }

  enroll(): void {
    if (!this.course) return;
    if (this.isInCart) {
      this.router.navigate(['/cart']);
      return;
    }
    this.cartService.addToCart({
      id: this.course.id,
      title: this.course.title,
      price: this.course.price ?? 0,
      description: this.course.description,
      image: this.course.thumbnail || this.course.image,
      category: this.course.category,
      instructor: this.course.teacher,
      addedAt: new Date()
    });
    this.isInCart = true;
    this.router.navigate(['/cart']);
  }

  formatDuration(minutes?: number): string {
    if (!minutes) return '—';
    const weeks = minutes / (7 * 24 * 60);
    if (Number.isInteger(weeks) && weeks >= 1) return `${weeks} week${weeks > 1 ? 's' : ''}`;
    const hours = minutes / 60;
    if (Number.isInteger(hours) && hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${minutes} minutes`;
  }

  getModuleTitle(index: number): string {
    const titles = ['Getting Started', 'Core Concepts', 'Practical Applications', 'Advanced Techniques', 'Final Project'];
    return titles[index - 1] || '';
  }

  generateStudyPlan(): void {
    if (!this.course) return;
    this.studyPlanLoading = true;
    this.studyPlanAdvice = null;
    this.studyPlanError = null;

    this.aiService.generateStudyPlan({
      courseTitle: this.course.title,
      courseDescription: this.course.description,
      level: this.course.level,
      durationMinutes: this.course.duration,
      extraContext: this.studyPlanContext || undefined
    }).subscribe({
      next: res => {
        this.studyPlanAdvice = res.advice;
        this.studyPlanLoading = false;
      },
      error: err => {
        this.studyPlanError = err?.error?.error || 'Failed to generate study plan. Please try again.';
        this.studyPlanLoading = false;
      }
    });
  }
}
