import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeedbackService, QuizService, QuizAttemptService } from '../../../services/quiz-feedback.services';
import { AiService } from '../../../../ai/services/ai.service';
import { ProfanityFilterService } from '../../../../shared/services/profanity-filter.service';
import { Feedback } from '../../../models/quiz-feedback.models';
import { FeedbackSuggestionRequest, FeedbackSuggestion } from '../../../../ai/models/ai.models';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.scss']
})
export class FeedbackFormComponent implements OnInit, OnDestroy {
  feedbackForm!: FormGroup;
  loading = false;
  selectedRating = 0;
  isEditMode = false;
  feedbackId?: number;
  attemptId?: number; // Pour retourner à la page de résultats
  quizId?: number;
  
  // AI Suggestions
  aiSuggestions: FeedbackSuggestion | null = null;
  loadingSuggestions = false;
  showSuggestions = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private quizService: QuizService,
    private quizAttemptService: QuizAttemptService,
    private aiService: AiService,
    private profanityFilterService: ProfanityFilterService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Vérifier si on est en mode édition
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.feedbackId = +params['id'];
        this.loadFeedback(this.feedbackId);
      }
    });
    
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['quizId']) {
        this.quizId = +params['quizId'];
        this.feedbackForm.patchValue({ quizId: this.quizId });
      }
      if (params['courseId']) {
        this.feedbackForm.patchValue({ courseId: +params['courseId'] });
      }
      if (params['attemptId']) {
        this.attemptId = +params['attemptId'];
        // Charger automatiquement les suggestions si on a un attemptId
        this.loadAISuggestions();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.feedbackForm = this.fb.group({
      quizId: [''],
      courseId: [''],
      studentId: [1, Validators.required], // TODO: Get from auth service
      studentName: ['Current User'],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
      type: ['QUIZ_FEEDBACK', Validators.required]
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.feedbackForm.patchValue({ rating });
  }

  loadFeedback(id: number): void {
    this.loading = true;
    this.feedbackService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (feedback) => {
        console.log('Feedback loaded for edit:', feedback);
        this.feedbackForm.patchValue({
          quizId: feedback.quizId,
          courseId: feedback.courseId,
          studentId: feedback.studentId,
          studentName: feedback.studentName,
          rating: feedback.rating,
          comment: feedback.comment,
          type: feedback.type
        });
        this.selectedRating = feedback.rating;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading feedback:', error);
        alert('Erreur lors du chargement du feedback.');
        this.loading = false;
        this.cancel();
      }
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      console.log('Form is invalid:', this.feedbackForm.errors);
      Object.keys(this.feedbackForm.controls).forEach(key => {
        const control = this.feedbackForm.get(key);
        if (control?.invalid) {
          console.log(`${key} is invalid:`, control.errors);
        }
      });
      alert('Veuillez remplir tous les champs requis correctement.');
      return;
    }

    // Validation du contenu inapproprié
    const comment = this.feedbackForm.get('comment')?.value;
    if (comment && comment.trim()) {
      const validation = this.profanityFilterService.validateContent(comment);
      if (!validation.isValid) {
        alert(validation.message + '\nMots détectés: ' + validation.detectedWords?.join(', '));
        return;
      }
    }

    this.loading = true;
    const feedbackData: Feedback = this.feedbackForm.value;
    console.log('Submitting feedback:', feedbackData);

    const request = this.isEditMode && this.feedbackId
      ? this.feedbackService.update(this.feedbackId, feedbackData)
      : this.feedbackService.create(feedbackData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Feedback saved successfully:', response);
        this.loading = false;
        alert(this.isEditMode ? 'Feedback modifié avec succès !' : 'Feedback soumis avec succès !');
        
        // Si on vient de la page de résultats, y retourner
        if (this.attemptId) {
          const isDashboard = this.router.url.includes('/dashboard');
          if (isDashboard) {
            this.router.navigate(['/dashboard/attempts', this.attemptId, 'result']);
          } else {
            this.router.navigate(['/attempts', this.attemptId, 'result']);
          }
          return;
        }
        
        // Sinon, retour à la liste des feedbacks
        const isDashboard = this.router.url.includes('/dashboard');
        if (isDashboard) {
          this.router.navigate(['/dashboard/feedbacks']);
        } else {
          this.router.navigate(['/feedbacks']);
        }
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        this.loading = false;
        
        // Gestion spécifique des erreurs de contenu inapproprié
        if (error.status === 400 && error.error?.detectedWords) {
          alert('Contenu inapproprié détecté: ' + error.error.detectedWords.join(', ') + 
                '\nVeuillez modifier votre commentaire.');
        } else {
          let errorMessage = 'Erreur lors de la soumission du feedback.';
          if (error.error?.message) {
            errorMessage += ' ' + error.error.message;
          }
          alert(errorMessage);
        }
      }
    });
  }

  cancel(): void {
    // Si on vient de la page de résultats, y retourner
    if (this.attemptId) {
      const isDashboard = this.router.url.includes('/dashboard');
      if (isDashboard) {
        this.router.navigate(['/dashboard/attempts', this.attemptId, 'result']);
      } else {
        this.router.navigate(['/attempts', this.attemptId, 'result']);
      }
      return;
    }
    
    // Sinon, retour à la page précédente ou liste des quiz
    const quizId = this.feedbackForm.get('quizId')?.value;
    const isDashboard = this.router.url.includes('/dashboard');
    if (quizId) {
      if (isDashboard) {
        this.router.navigate(['/dashboard/quizzes', quizId]);
      } else {
        this.router.navigate(['/quizzes', quizId]);
      }
    } else {
      if (isDashboard) {
        this.router.navigate(['/dashboard/quizzes']);
      } else {
        this.router.navigate(['/quizzes']);
      }
    }
  }

  getStarClass(index: number): string {
    return index < this.selectedRating ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted';
  }
  
  loadAISuggestions(): void {
    if (!this.attemptId || !this.quizId) {
      return;
    }
    
    this.loadingSuggestions = true;
    
    // Charger les données nécessaires pour les suggestions
    forkJoin({
      attempt: this.quizAttemptService.getById(this.attemptId),
      quiz: this.quizService.getById(this.quizId)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ attempt, quiz }) => {
        const suggestionRequest: FeedbackSuggestionRequest = {
          quizId: this.quizId,
          quizTitle: quiz.title,
          attemptId: this.attemptId,
          score: attempt.score,
          totalPoints: attempt.totalPoints,
          difficulty: 'MEDIUM', // Valeur par défaut, peut être récupérée du quiz si disponible
          topic: quiz.title // Utiliser le titre comme sujet par défaut
        };
        
        this.aiService.generateFeedbackSuggestions(suggestionRequest)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (suggestions) => {
              this.aiSuggestions = suggestions;
              this.showSuggestions = true;
              this.loadingSuggestions = false;
            },
            error: (error) => {
              console.error('Erreur lors de la génération des suggestions:', error);
              this.loadingSuggestions = false;
            }
          });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données:', error);
        this.loadingSuggestions = false;
      }
    });
  }
  
  applySuggestion(suggestion: string): void {
    const currentComment = this.feedbackForm.get('comment')?.value || '';
    const newComment = currentComment ? `${currentComment}\n\n${suggestion}` : suggestion;
    this.feedbackForm.patchValue({ comment: newComment });
  }
  
  toggleSuggestions(): void {
    this.showSuggestions = !this.showSuggestions;
    if (this.showSuggestions && !this.aiSuggestions && !this.loadingSuggestions) {
      this.loadAISuggestions();
    }
  }
  
  /**
   * Vérifie le contenu en temps réel pendant la saisie
   */
  onCommentChange(): void {
    const comment = this.feedbackForm.get('comment')?.value;
    if (comment && comment.trim()) {
      const validation = this.profanityFilterService.validateContent(comment);
      if (!validation.isValid) {
        // Marquer le champ comme invalide
        this.feedbackForm.get('comment')?.setErrors({ 
          'profanity': { 
            message: validation.message, 
            detectedWords: validation.detectedWords 
          } 
        });
      } else {
        // Supprimer l'erreur de profanité si elle existe
        const currentErrors = this.feedbackForm.get('comment')?.errors;
        if (currentErrors && currentErrors['profanity']) {
          delete currentErrors['profanity'];
          const hasOtherErrors = Object.keys(currentErrors).length > 0;
          this.feedbackForm.get('comment')?.setErrors(hasOtherErrors ? currentErrors : null);
        }
      }
    }
  }
  
  /**
   * Retourne le message d'erreur pour le champ commentaire
   */
  getCommentErrorMessage(): string {
    const control = this.feedbackForm.get('comment');
    if (control?.errors?.['profanity']) {
      return control.errors['profanity'].message;
    }
    return '';
  }
}
