import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Feedback, Quiz } from '../../../models/quiz-feedback.models';
import { FeedbackService, QuizService } from '../../../services/quiz-feedback.services';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../../components/footer/footer.component';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <!-- Navbar pour mode public -->
    <app-navbar *ngIf="!isAdminMode"></app-navbar>
    
    <div class="crud-page" [class.public-mode]="!isAdminMode">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isAdminMode ? 'Feedbacks Management' : 'Student Feedbacks' }}</h1>
          <p class="page-subtitle">{{ isAdminMode ? 'Manage student feedbacks' : 'Share your experience and feedback' }}</p>
        </div>
        <div class="header-actions">
          <a [routerLink]="getNewFeedbackLink()" class="btn-admin primary">
            <i class="ti ti-plus"></i> Add Feedback
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="ti ti-search"></i>
          <input 
            type="text" 
            placeholder="Search feedbacks..." 
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterRating" (change)="applyFilters()" class="filter-select">
            <option value="0">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select [(ngModel)]="filterType" (change)="applyFilters()" class="filter-select">
            <option value="">All Types</option>
            <option value="QUIZ_FEEDBACK">Quiz Feedback</option>
            <option value="COURSE_FEEDBACK">Course Feedback</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <i class="ti ti-loader-2"></i>
        <p>Loading feedbacks...</p>
      </div>

      <!-- Table -->
      <div class="table-container" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Rating</th>
              <th>Type</th>
              <th>Quiz ID</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (feedback of filteredFeedbacks; track feedback.id) {
              <tr>
                <td>
                  <div class="student-cell">
                    <div class="student-avatar">
                      <i class="ti ti-user"></i>
                    </div>
                    <div class="student-info">
                      <span class="student-name">{{ feedback.studentName }}</span>
                      <span class="student-id">ID: {{ feedback.studentId }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="rating-display">
                    <div class="stars">
                      @for (star of getStarArray(feedback.rating); track $index) {
                        <i class="ti" [class.ti-star-filled]="star === 1" [class.ti-star]="star === 0"></i>
                      }
                    </div>
                    <span class="rating-number">{{ feedback.rating }}/5</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [attr.data-type]="feedback.type">
                    {{ feedback.type }}
                  </span>
                </td>
                <td>{{ feedback.quizId || 'N/A' }}</td>
                <td>
                  <div class="comment-cell">
                    <span class="comment-text" [title]="feedback.comment">
                      {{ feedback.comment | slice:0:50 }}{{ (feedback.comment?.length || 0) > 50 ? '...' : '' }}
                    </span>
                  </div>
                </td>
                <td>{{ feedback.createdAt | date:'short' }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action view" title="View Details" (click)="viewFeedback(feedback)">
                      <i class="ti ti-eye"></i>
                    </button>
                    <a *ngIf="isAdminMode" [routerLink]="['/admin/feedbacks', feedback.id, 'edit']" class="btn-action edit" title="Edit">
                      <i class="ti ti-pencil"></i>
                    </a>
                    <button *ngIf="isAdminMode" class="btn-action delete" title="Delete" (click)="confirmDelete(feedback)">
                      <i class="ti ti-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="7" class="empty-state">
                  <i class="ti ti-message-star"></i>
                  <p>No feedbacks found</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- View Feedback Modal -->
      @if (showViewModal && selectedFeedback) {
        <div class="modal-overlay" (click)="closeViewModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Feedback Details</h3>
              <button class="modal-close" (click)="closeViewModal()">
                <i class="ti ti-x"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="feedback-details">
                <div class="detail-row">
                  <strong>Student:</strong> {{ selectedFeedback.studentName }}
                </div>
                <div class="detail-row">
                  <strong>Rating:</strong>
                  <div class="stars">
                    @for (star of getStarArray(selectedFeedback.rating); track $index) {
                      <i class="ti" [class.ti-star-filled]="star === 1" [class.ti-star]="star === 0"></i>
                    }
                  </div>
                </div>
                <div class="detail-row">
                  <strong>Type:</strong> {{ selectedFeedback.type }}
                </div>
                <div class="detail-row" *ngIf="selectedFeedback.quizId">
                  <strong>Quiz ID:</strong> {{ selectedFeedback.quizId }}
                </div>
                <div class="detail-row">
                  <strong>Date:</strong> {{ selectedFeedback.createdAt | date:'full' }}
                </div>
                <div class="detail-row">
                  <strong>Comment:</strong>
                  <p class="comment-full">{{ selectedFeedback.comment || 'No comment provided' }}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="closeViewModal()">Close</button>
            </div>
          </div>
        </div>
      }

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
              <p>Are you sure you want to delete this feedback from <strong>{{ feedbackToDelete?.studentName }}</strong>?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-admin outline" (click)="cancelDelete()">Cancel</button>
              <button class="btn-admin danger" (click)="deleteFeedback()">
                <i class="ti ti-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Footer pour mode public -->
    <app-footer *ngIf="!isAdminMode"></app-footer>
  `,
  styles: [`
    .public-mode {
      min-height: calc(100vh - 200px);
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

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

    .loading-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--color-gray-400);

      i {
        font-size: 48px;
        margin-bottom: 16px;
        display: block;
        animation: spin 1s linear infinite;
      }

      p {
        font-size: 16px;
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

    .student-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .student-avatar {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      i {
        font-size: 24px;
      }
    }

    .student-info {
      display: flex;
      flex-direction: column;
    }

    .student-name {
      font-weight: 500;
      color: var(--color-primary);
    }

    .student-id {
      font-size: 12px;
      color: var(--color-gray-500);
      margin-top: 2px;
    }

    .rating-display {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stars {
      display: flex;
      gap: 2px;

      i {
        font-size: 16px;
        color: #fbbf24;
      }
    }

    .rating-number {
      font-size: 12px;
      color: var(--color-gray-500);
    }

    .comment-cell {
      max-width: 200px;
    }

    .comment-text {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(61, 61, 96, 0.08);
      color: var(--color-primary);

      &[data-type="QUIZ_FEEDBACK"] {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      &[data-type="COURSE_FEEDBACK"] {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
      &[data-type="GENERAL"] {
        background: rgba(246, 189, 96, 0.15);
        color: #b8860b;
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

    // Modal styles
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
      max-width: 500px;
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

    .feedback-details {
      .detail-row {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;

        strong {
          min-width: 80px;
          color: var(--color-primary);
        }

        .comment-full {
          margin: 8px 0 0;
          padding: 12px;
          background: rgba(61, 61, 96, 0.03);
          border-radius: 8px;
          line-height: 1.5;
        }
      }
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid rgba(61, 61, 96, 0.08);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
export class FeedbackListComponent implements OnInit, OnDestroy {
  feedbacks: Feedback[] = [];
  filteredFeedbacks: Feedback[] = [];
  loading = false;
  searchTerm = '';
  filterRating: number | string = 0;
  filterType = '';
  isAdminMode = false;
  
  // Modals
  showViewModal = false;
  showDeleteModal = false;
  selectedFeedback: Feedback | null = null;
  feedbackToDelete: Feedback | null = null;
  
  // Add Feedback Form (Public mode)
  showAddFeedbackForm = false;
  availableQuizzes: Quiz[] = [];
  submittingFeedback = false;
  newFeedback = {
    studentId: 1, // Default student ID
    studentName: '',
    quizId: null as number | null,
    rating: 5,
    comment: '',
    type: 'GENERAL' as 'QUIZ_FEEDBACK' | 'COURSE_FEEDBACK' | 'GENERAL'
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private feedbackService: FeedbackService,
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Détecter si on est en mode admin ou public
    this.isAdminMode = this.router.url.includes('/admin');
    console.log('Feedback Mode:', this.isAdminMode ? 'ADMIN' : 'PUBLIC');
    this.loadFeedbacks();
    
    // Charger les quizzes disponibles pour le formulaire (mode public uniquement)
    if (!this.isAdminMode) {
      this.loadAvailableQuizzes();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeedbacks(): void {
    this.loading = true;
    console.log('Loading feedbacks...');
    this.feedbackService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log('Feedbacks loaded:', data);
        this.feedbacks = data;
        this.filteredFeedbacks = [...data];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading feedbacks:', error);
        alert('Erreur lors du chargement des feedbacks. Vérifiez que le service backend est démarré.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.feedbacks];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(f => 
        (f.studentName && f.studentName.toLowerCase().includes(term)) ||
        (f.comment && f.comment.toLowerCase().includes(term))
      );
    }

    // Filtre par rating
    if (this.filterRating && this.filterRating !== '0' && this.filterRating !== 0) {
      const rating = Number(this.filterRating);
      result = result.filter(f => f.rating === rating);
    }

    // Filtre par type
    if (this.filterType) {
      result = result.filter(f => f.type === this.filterType);
    }

    this.filteredFeedbacks = result;
  }

  // Méthode supprimée: filterByRating() - remplacée par applyFilters() directement

  setRatingFilter(rating: number): void {
    this.filterRating = rating;
    this.applyFilters();
  }

  viewFeedback(feedback: Feedback): void {
    this.selectedFeedback = feedback;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.selectedFeedback = null;
    this.showViewModal = false;
  }

  confirmDelete(feedback: Feedback): void {
    this.feedbackToDelete = feedback;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.feedbackToDelete = null;
    this.showDeleteModal = false;
  }

  deleteFeedback(): void {
    if (this.feedbackToDelete?.id) {
      this.feedbackService.delete(this.feedbackToDelete.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          console.log('Feedback deleted successfully');
          this.loadFeedbacks();
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Error deleting feedback:', error);
          alert('Erreur lors de la suppression du feedback.');
        }
      });
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getNewFeedbackLink(): string {
    return this.isAdminMode ? '/admin/feedbacks/new' : '/feedbacks/new';
  }

  editFeedback(id: number): void {
    const isAdmin = this.router.url.includes('/admin');
    if (isAdmin) {
      this.router.navigate(['/admin/feedbacks', id, 'edit']);
    } else {
      this.router.navigate(['/feedbacks', id, 'edit']);
    }
  }

  createFeedback(): void {
    const isAdmin = this.router.url.includes('/admin');
    if (isAdmin) {
      this.router.navigate(['/admin/feedbacks/new']);
    } else {
      this.router.navigate(['/feedbacks/new']);
    }
  }

  // Nouvelles méthodes pour les statistiques
  getAverageRating(): number {
    if (this.feedbacks.length === 0) return 0;
    const sum = this.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return sum / this.feedbacks.length;
  }

  getPositiveFeedbackPercentage(): number {
    if (this.feedbacks.length === 0) return 0;
    const positiveFeedbacks = this.feedbacks.filter(f => f.rating >= 4).length;
    return Math.round((positiveFeedbacks / this.feedbacks.length) * 100);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'QUIZ_FEEDBACK': return 'Quiz Feedback';
      case 'COURSE_FEEDBACK': return 'Course Feedback';
      case 'GENERAL': return 'General';
      default: return type || 'Unknown';
    }
  }

  trackByFeedback(index: number, feedback: Feedback): number {
    return feedback.id || index;
  }

  loadAvailableQuizzes(): void {
    this.quizService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (quizzes) => {
        // Filtrer seulement les quizzes publiés
        this.availableQuizzes = quizzes.filter(q => q.status === 'PUBLISHED');
        console.log('Available quizzes loaded:', this.availableQuizzes.length);
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
      }
    });
  }

  submitNewFeedback(): void {
    if (!this.newFeedback.studentName || !this.newFeedback.comment) {
      alert('Please fill in all required fields');
      return;
    }

    this.submittingFeedback = true;

    // Déterminer le type de feedback
    if (this.newFeedback.quizId) {
      this.newFeedback.type = 'QUIZ_FEEDBACK';
    } else {
      this.newFeedback.type = 'GENERAL';
    }

    const feedbackToSubmit: any = {
      studentId: this.newFeedback.studentId,
      studentName: this.newFeedback.studentName,
      rating: this.newFeedback.rating,
      comment: this.newFeedback.comment,
      type: this.newFeedback.type
    };

    if (this.newFeedback.quizId) {
      feedbackToSubmit.quizId = this.newFeedback.quizId;
    }

    this.feedbackService.create(feedbackToSubmit).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        console.log('Feedback submitted successfully');
        this.showAddFeedbackForm = false;
        this.submittingFeedback = false;
        // Réinitialiser le formulaire
        this.newFeedback = {
          studentId: 1,
          studentName: '',
          quizId: null,
          rating: 5,
          comment: '',
          type: 'GENERAL'
        };
        // Recharger les feedbacks
        this.loadFeedbacks();
        alert('Thank you for your feedback!');
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        this.submittingFeedback = false;
        alert('Error submitting feedback. Please try again.');
      }
    });
  }
}
