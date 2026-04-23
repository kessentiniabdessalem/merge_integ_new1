import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Quiz } from '../../../models/quiz-feedback.models';
import { QuizService } from '../../../services/quiz-feedback.services';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../../components/footer/footer.component';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <!-- ═══════════════════════════════════════════════════════════
         ADMIN MODE — matches events-list style
    ════════════════════════════════════════════════════════════ -->
    <div *ngIf="isAdminMode" class="crud-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Quizzes Management</h1>
          <p class="page-subtitle">Create and manage quizzes for your courses</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/quizzes/new" class="btn-admin primary">
            <i class="ti ti-plus"></i> Add Quiz
          </a>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input type="text" placeholder="Search quizzes..." [(ngModel)]="searchTerm" (input)="applyFilters()">
        </div>
        <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select [(ngModel)]="sortBy" (change)="applyFilters()" class="filter-select">
          <option value="createdAt">Sort: Date Created</option>
          <option value="title">Sort: Title</option>
          <option value="averageScore">Sort: Avg Score</option>
          <option value="questionCount">Sort: Questions</option>
        </select>
      </div>

      <div class="table-container">
        <div *ngIf="loading" class="loading-state">
          <i class="ti ti-loader-2"></i>
          <p>Loading quizzes...</p>
        </div>

        <table *ngIf="!loading" class="data-table">
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Course ID</th>
              <th>Status</th>
              <th>Questions</th>
              <th>Avg Score</th>
              <th>Time Limit</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let quiz of filteredQuizzes">
              <td>
                <div class="quiz-cell">
                  <div class="quiz-icon">
                    <i class="ti ti-help-circle"></i>
                  </div>
                  <div class="quiz-info">
                    <span class="quiz-title">{{ quiz.title }}</span>
                    <span class="quiz-desc">{{ quiz.description || '—' }}</span>
                  </div>
                </div>
              </td>
              <td>{{ quiz.courseId || '—' }}</td>
              <td>
                <span class="badge" [attr.data-status]="quiz.status">{{ quiz.status }}</span>
              </td>
              <td>{{ quiz.questionCount || 0 }}</td>
              <td>{{ quiz.averageScore ? (quiz.averageScore | number:'1.0-0') + '%' : '—' }}</td>
              <td>{{ quiz.timeLimitMinutes ? quiz.timeLimitMinutes + ' min' : '—' }}</td>
              <td>{{ quiz.createdAt | date:'mediumDate' }}</td>
              <td>
                <div class="action-buttons">
                  <a [routerLink]="['/admin/quizzes', quiz.id]" class="btn-action view" title="View">
                    <i class="ti ti-eye"></i>
                  </a>
                  <a [routerLink]="['/admin/quizzes', quiz.id, 'edit']" class="btn-action edit" title="Edit">
                    <i class="ti ti-pencil"></i>
                  </a>
                  <button
                    class="btn-action"
                    [class.publish]="quiz.status !== 'PUBLISHED'"
                    [class.archive]="quiz.status === 'PUBLISHED'"
                    [title]="quiz.status === 'PUBLISHED' ? 'Archive' : 'Publish'"
                    (click)="toggleStatus(quiz)">
                    <i [class]="quiz.status === 'PUBLISHED' ? 'ti ti-archive' : 'ti ti-circle-check'"></i>
                  </button>
                  <button class="btn-action delete" title="Delete" (click)="confirmDelete(quiz)">
                    <i class="ti ti-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredQuizzes.length === 0 && !loading">
              <td colspan="8" class="empty-state">
                <i class="ti ti-help-circle"></i>
                <p>No quizzes found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      @if (showDeleteModal) {
        <div class="modal-overlay" (click)="cancelDelete()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Confirm Delete</h3>
              <button class="modal-close" (click)="cancelDelete()"><i class="ti ti-x"></i></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete <strong>{{ quizToDelete?.title }}</strong>?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="cancelDelete()">Cancel</button>
              <button class="btn-admin danger" (click)="deleteQuiz()"><i class="ti ti-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- ═══════════════════════════════════════════════════════════
         STUDENT MODE — original CODE3 design
    ════════════════════════════════════════════════════════════ -->
    <div *ngIf="!isAdminMode" class="sq-page">
      <app-navbar></app-navbar>

      <header class="sq-hero">
        <div class="sq-hero__bg">
          <div class="sq-hero__orb sq-hero__orb--1"></div>
          <div class="sq-hero__orb sq-hero__orb--2"></div>
          <div class="sq-hero__orb sq-hero__orb--3"></div>
        </div>
        <div class="sq-hero__content">
          <div class="sq-hero__badge">
            <i class="bi bi-mortarboard-fill"></i>
            Learning Space
          </div>
          <h1 class="sq-hero__title">Your Quizzes</h1>
          <p class="sq-hero__subtitle">Evaluate and strengthen your knowledge at your own pace</p>
          <div class="sq-search">
            <div class="sq-search__inner">
              <i class="bi bi-search sq-search__icon"></i>
              <input type="text" class="sq-search__input" placeholder="Search a quiz..."
                [(ngModel)]="searchTerm" (input)="applyFilters()">
              <span class="sq-search__count" *ngIf="!loading">
                {{ filteredQuizzes.length }} quiz{{ filteredQuizzes.length !== 1 ? 'zes' : '' }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main class="sq-main">
        <div *ngIf="loading" class="sq-loading">
          <div class="sq-spinner">
            <div class="sq-spinner__ring"></div>
            <div class="sq-spinner__ring sq-spinner__ring--delay"></div>
          </div>
          <p class="sq-loading__text">Loading quizzes...</p>
        </div>

        <div *ngIf="!loading && filteredQuizzes.length === 0" class="sq-empty">
          <div class="sq-empty__icon"><i class="bi bi-journal-x"></i></div>
          <h3 class="sq-empty__title">No quizzes found</h3>
          <p class="sq-empty__desc">Try a different search term or come back later</p>
        </div>

        <div *ngIf="!loading && filteredQuizzes.length > 0" class="sq-list">
          <article class="sq-item" *ngFor="let quiz of filteredQuizzes; let i = index">
            <div class="sq-item__index">{{ i + 1 < 10 ? '0' + (i + 1) : i + 1 }}</div>
            <div class="sq-item__body">
              <h3 class="sq-item__title">{{ quiz.title }}</h3>
              <p class="sq-item__desc">{{ quiz.description || 'Test your knowledge with this interactive quiz' }}</p>
              <div class="sq-item__meta">
                <span class="sq-meta-chip">
                  <i class="bi bi-list-check"></i>
                  {{ quiz.questionCount || 0 }} questions
                </span>
                <span class="sq-meta-chip" *ngIf="quiz.averageScore">
                  <i class="bi bi-bar-chart-line-fill"></i>
                  Avg {{ quiz.averageScore | number:'1.0-0' }}%
                </span>
                <span class="sq-meta-chip">
                  <i class="bi bi-clock"></i>
                  ~{{ (quiz.questionCount || 0) * 2 }} min
                </span>
              </div>
            </div>
            <div class="sq-item__score" *ngIf="quiz.averageScore">
              <div class="sq-score-ring">
                <svg viewBox="0 0 42 42" class="sq-score-ring__svg">
                  <circle class="sq-score-ring__bg" cx="21" cy="21" r="16" />
                  <circle class="sq-score-ring__fill" cx="21" cy="21" r="16"
                    [style.strokeDasharray]="(quiz.averageScore / 100 * 100.53) + ' 100.53'" />
                </svg>
                <span class="sq-score-ring__label">{{ quiz.averageScore | number:'1.0-0' }}%</span>
              </div>
            </div>
            <div class="sq-item__cta">
              <button class="sq-btn-start" (click)="takeQuiz(quiz.id!)">
                <span>Start</span>
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </article>
        </div>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    /* ── ADMIN MODE ─────────────────────────────────────── */
    .crud-page { animation: fadeIn 0.3s ease; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .page-title { font-family: var(--font-family); font-size: 28px; font-weight: 700; color: var(--color-primary); margin: 0; }
    .page-subtitle { font-size: 15px; color: var(--color-gray-500); margin: 6px 0 0; }
    .btn-admin { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; border: none; text-decoration: none; i { font-size: 18px; } &.primary { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; box-shadow: 0 4px 15px rgba(61,61,96,0.3); &:hover { box-shadow: 0 8px 25px rgba(61,61,96,0.4); transform: translateY(-2px); } } &.outline { background: var(--color-white); color: var(--color-primary); border: 2px solid rgba(61,61,96,0.1); &:hover { border-color: rgba(61,61,96,0.25); background: rgba(61,61,96,0.04); } } &.danger { background: var(--color-cta); color: #fff; &:hover { background: #d96a5a; } } }
    .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .search-box { position: relative; flex: 1; min-width: 250px; i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-gray-400); } input { width: 100%; padding: 12px 14px 12px 44px; border: 2px solid rgba(61,61,96,0.1); border-radius: 12px; font-size: 14px; &:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px rgba(61,61,96,0.08); } } }
    .filter-select { padding: 12px 16px; border: 2px solid rgba(61,61,96,0.1); border-radius: 12px; font-size: 14px; background: var(--color-white); cursor: pointer; min-width: 150px; &:focus { outline: none; border-color: var(--color-primary); } }
    .table-container { background: var(--color-white); border-radius: 20px; box-shadow: var(--shadow-card); overflow: hidden; }
    .loading-state { text-align: center; padding: 60px 20px; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; display: block; animation: spin 1s linear infinite; } p { font-size: 16px; } }
    .data-table { width: 100%; border-collapse: collapse; th, td { padding: 16px 20px; text-align: left; } th { background: rgba(61,61,96,0.03); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-gray-500); } td { border-bottom: 1px solid rgba(61,61,96,0.06); font-size: 14px; color: var(--color-primary); } tr:last-child td { border-bottom: none; } tr:hover td { background: rgba(61,61,96,0.02); } }
    .quiz-cell { display: flex; align-items: center; gap: 12px; }
    .quiz-icon { width: 48px; height: 48px; border-radius: 10px; background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); display: flex; align-items: center; justify-content: center; flex-shrink: 0; i { font-size: 22px; color: #6366f1; } }
    .quiz-info { display: flex; flex-direction: column; min-width: 0; }
    .quiz-title { font-weight: 600; color: var(--color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
    .quiz-desc { font-size: 12px; color: var(--color-gray-500); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(61,61,96,0.08); color: var(--color-primary); &[data-status="PUBLISHED"] { background: rgba(16,185,129,0.1); color: #10b981; } &[data-status="DRAFT"] { background: rgba(61,61,96,0.08); color: var(--color-gray-500); } &[data-status="ARCHIVED"] { background: rgba(245,158,11,0.1); color: #d97706; } }
    .action-buttons { display: flex; gap: 8px; }
    .btn-action { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; i { font-size: 18px; } &.view { background: rgba(59,130,246,0.1); color: #3b82f6; &:hover { background: rgba(59,130,246,0.2); } } &.edit { background: rgba(246,189,96,0.15); color: #b8860b; &:hover { background: rgba(246,189,96,0.25); } } &.publish { background: rgba(16,185,129,0.1); color: #10b981; &:hover { background: rgba(16,185,129,0.2); } } &.archive { background: rgba(245,158,11,0.1); color: #d97706; &:hover { background: rgba(245,158,11,0.2); } } &.delete { background: rgba(200,70,48,0.1); color: var(--color-cta); &:hover { background: rgba(200,70,48,0.2); } } }
    .empty-state { text-align: center; padding: 60px 20px !important; color: var(--color-gray-400); i { font-size: 48px; margin-bottom: 16px; display: block; } }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-content { background: var(--color-white); border-radius: 20px; width: 100%; max-width: 450px; box-shadow: var(--shadow-2xl); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(61,61,96,0.08); h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0; } }
    .modal-close { width: 32px; height: 32px; border: none; background: rgba(61,61,96,0.06); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { background: rgba(61,61,96,0.12); } }
    .modal-body { padding: 24px; p { margin: 0 0 8px; } .warning-text { font-size: 13px; color: var(--color-cta); } }
    .modal-footer { display: flex; gap: 12px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid rgba(61,61,96,0.08); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* ── STUDENT MODE ───────────────────────────────────── */
    $green: #059669; $green-light: #d1fae5; $green-mid: #10b981; $ink: #111827; $ink-mid: #374151; $ink-soft: #6b7280; $ink-faint: #9ca3af; $bg: #f9fafb; $bg-card: #ffffff; $border: #e5e7eb; $border-soft: #f3f4f6;
    .sq-page { min-height: 100vh; background: $bg; font-family: 'Lato', sans-serif; color: $ink; }
    .sq-hero { position: relative; background: $ink; overflow: hidden; padding: 5rem 1.5rem 4rem; text-align: center; &__bg { position: absolute; inset: 0; pointer-events: none; } &__orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; &--1 { width: 420px; height: 420px; background: $green-mid; top: -120px; left: -80px; } &--2 { width: 300px; height: 300px; background: #34d399; bottom: -80px; right: 10%; } &--3 { width: 200px; height: 200px; background: #6ee7b7; top: 30%; right: -60px; } } &__content { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1rem; } &__badge { display: inline-flex; align-items: center; gap: 0.45rem; background: rgba($green-mid, 0.15); border: 1px solid rgba($green-mid, 0.3); color: #6ee7b7; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.35rem 0.9rem; border-radius: 100px; i { font-size: 0.9rem; } } &__title { font-family: 'Sora', sans-serif; font-size: clamp(2.2rem, 6vw, 3.5rem); font-weight: 700; color: #fff; margin: 0; line-height: 1.1; letter-spacing: -0.02em; } &__subtitle { font-size: 1.05rem; color: rgba(255,255,255,0.55); margin: 0; line-height: 1.6; } }
    .sq-search { width: 100%; max-width: 500px; margin-top: 0.75rem; &__inner { display: flex; align-items: center; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.6rem 1rem; gap: 0.75rem; backdrop-filter: blur(8px); &:focus-within { border-color: $green-mid; } } &__icon { color: rgba(255,255,255,0.4); font-size: 1rem; flex-shrink: 0; } &__input { flex: 1; background: transparent; border: none; outline: none; font-size: 0.95rem; color: white; &::placeholder { color: rgba(255,255,255,0.3); } } &__count { font-size: 0.78rem; font-weight: 700; color: $green-mid; background: rgba($green-mid,0.12); padding: 0.2rem 0.6rem; border-radius: 100px; white-space: nowrap; flex-shrink: 0; } }
    .sq-main { max-width: 820px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
    .sq-loading { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 5rem 0; &__text { color: $ink-soft; font-size: 0.95rem; } }
    .sq-spinner { position: relative; width: 48px; height: 48px; &__ring { position: absolute; inset: 0; border-radius: 50%; border: 3px solid transparent; border-top-color: $green; animation: sq-spin 0.85s linear infinite; &--delay { border-top-color: transparent; border-right-color: $green-light; animation-duration: 1.1s; animation-direction: reverse; } } }
    @keyframes sq-spin { to { transform: rotate(360deg); } }
    .sq-empty { text-align: center; padding: 5rem 2rem; &__icon { display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: $border-soft; border-radius: 20px; margin-bottom: 1.5rem; i { font-size: 2.2rem; color: $ink-faint; } } &__title { font-family: 'Sora', sans-serif; font-size: 1.3rem; font-weight: 600; color: $ink-mid; margin-bottom: 0.5rem; } &__desc { color: $ink-faint; font-size: 0.95rem; } }
    .sq-list { display: flex; flex-direction: column; gap: 0; }
    .sq-item { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem 1.75rem; background: $bg-card; border: 1px solid $border; border-bottom: none; transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease; position: relative; z-index: 0; &:first-child { border-radius: 14px 14px 0 0; } &:last-child { border-bottom: 1px solid $border; border-radius: 0 0 14px 14px; } &:only-child { border-radius: 14px; border-bottom: 1px solid $border; } &::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: transparent; border-radius: 3px 0 0 3px; transition: background 0.18s; } &:hover { background: #f0fdf9; z-index: 1; box-shadow: 0 4px 24px rgba($green,0.08); transform: translateX(2px); &::before { background: $green; } .sq-item__index { color: $green; border-color: $green-light; background: $green-light; } } &__index { font-family: 'Sora', sans-serif; font-size: 0.8rem; font-weight: 700; color: $ink-faint; background: $border-soft; border: 1px solid $border; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.18s; } &__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.35rem; } &__title { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 600; color: $ink; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } &__desc { font-size: 0.875rem; color: $ink-soft; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; } &__meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; } &__score { flex-shrink: 0; } &__cta { flex-shrink: 0; } }
    .sq-meta-chip { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 700; color: $ink-soft; background: $border-soft; border: 1px solid $border; border-radius: 100px; padding: 0.2rem 0.7rem; i { color: $green; font-size: 0.85rem; } }
    .sq-score-ring { position: relative; width: 52px; height: 52px; &__svg { width: 52px; height: 52px; transform: rotate(-90deg); } &__bg { fill: none; stroke: $border; stroke-width: 3; } &__fill { fill: none; stroke: $green; stroke-width: 3; stroke-linecap: round; stroke-dashoffset: 0; transition: stroke-dasharray 0.6s ease; } &__label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 0.65rem; font-weight: 700; color: $ink-mid; } }
    .sq-btn-start { display: inline-flex; align-items: center; gap: 0.4rem; background: $ink; color: white; border: none; border-radius: 8px; padding: 0.6rem 1.1rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; i { font-size: 0.9rem; transition: transform 0.2s ease; } &:hover { background: $green; box-shadow: 0 4px 16px rgba($green,0.35); } }
    @media (max-width: 640px) { .sq-item { flex-wrap: wrap; gap: 1rem; padding: 1.25rem; &__index { display: none; } &__score { display: none; } &__cta { width: 100%; } } .sq-btn-start { width: 100%; justify-content: center; padding: 0.75rem; } }
  `]
})
export class QuizListComponent implements OnInit, OnDestroy {
  quizzes: Quiz[] = [];
  filteredQuizzes: Quiz[] = [];
  loading = false;
  searchTerm = '';
  isAdminMode = false;

  filterStatus: string = 'ALL';
  filterCourse: number | null = null;
  sortBy: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  showDeleteModal = false;
  quizToDelete: Quiz | null = null;

  statusOptions = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];
  sortOptions = [
    { value: 'title', label: 'Title' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'averageScore', label: 'Avg Score' },
    { value: 'questionCount', label: 'Questions' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private quizService: QuizService, private router: Router) {}

  ngOnInit(): void {
    this.isAdminMode = this.router.url.includes('/admin');
    this.loadQuizzes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadQuizzes(): void {
    this.loading = true;
    this.quizService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.quizzes = this.isAdminMode ? data : data.filter(q => q.status === 'PUBLISHED');
        this.filteredQuizzes = [...this.quizzes];
        this.loading = false;
      },
      error: (err) => { console.error('Error loading quizzes:', err); this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.quizzes];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(q => q.title.toLowerCase().includes(term) || (q.description && q.description.toLowerCase().includes(term)));
    }
    if (this.filterStatus !== 'ALL') result = result.filter(q => q.status === this.filterStatus);
    if (this.filterCourse !== null) result = result.filter(q => q.courseId === this.filterCourse);
    result.sort((a, b) => {
      let aVal: any = a[this.sortBy as keyof Quiz] ?? 0;
      let bVal: any = b[this.sortBy as keyof Quiz] ?? 0;
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = (bVal as string).toLowerCase(); }
      return this.sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    this.filteredQuizzes = result;
  }

  viewQuiz(id: number): void {
    this.router.navigate(this.isAdminMode ? ['/admin/quizzes', id] : ['/quizzes', id]);
  }

  takeQuiz(id: number): void {
    if (!this.isAdminMode) this.router.navigate(['/quizzes', id, 'take']);
  }

  editQuiz(id: number): void { this.router.navigate(['/admin/quizzes', id, 'edit']); }
  createQuiz(): void { this.router.navigate(['/admin/quizzes/new']); }

  toggleStatus(quiz: Quiz): void {
    quiz.status === 'PUBLISHED' ? this.archiveQuiz(quiz) : this.publishQuiz(quiz);
  }

  publishQuiz(quiz: Quiz): void {
    if (!quiz.id) return;
    this.quizService.publish(quiz.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadQuizzes(),
      error: (err) => console.error('Error publishing quiz:', err)
    });
  }

  archiveQuiz(quiz: Quiz): void {
    if (!quiz.id) return;
    this.quizService.archive(quiz.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.loadQuizzes(),
      error: (err) => console.error('Error archiving quiz:', err)
    });
  }

  confirmDelete(quiz: Quiz): void { this.quizToDelete = quiz; this.showDeleteModal = true; }
  cancelDelete(): void { this.quizToDelete = null; this.showDeleteModal = false; }

  deleteQuiz(): void {
    if (!this.quizToDelete?.id) return;
    this.quizService.delete(this.quizToDelete.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { this.loadQuizzes(); this.cancelDelete(); },
      error: (err) => console.error('Error deleting quiz:', err)
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'badge bg-success';
      case 'ARCHIVED': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  getViewLink(id: number): string {
    return this.isAdminMode ? `/admin/quizzes/${id}` : `/quizzes/${id}`;
  }

  getPublishedQuizzesCount(): number { return this.quizzes.filter(q => q.status === 'PUBLISHED').length; }
  getTotalQuestionsCount(): number { return this.quizzes.reduce((t, q) => t + (q.questionCount || 0), 0); }
  resetFilters(): void { this.searchTerm = ''; this.filterStatus = 'ALL'; this.filterCourse = null; this.sortBy = 'createdAt'; this.sortOrder = 'desc'; this.applyFilters(); }
  trackByQuiz(index: number, quiz: Quiz): any { return quiz.id || index; }
  setStatusFilter(status: string): void { this.filterStatus = status; this.applyFilters(); }
}
