import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuizAttemptResponse, Quiz, Question } from '../../../models/quiz-feedback.models';
import { QuizAttemptService, QuizService, QuestionService } from '../../../services/quiz-feedback.services';
import { NavbarComponent } from '../../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../../components/footer/footer.component';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-attempt-result',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './attempt-result.component.html',
  styleUrls: ['./attempt-result.component.scss']
})
export class AttemptResultComponent implements OnInit, OnDestroy {
  attempt?: QuizAttemptResponse;
  quiz?: Quiz;
  questions: Question[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attemptService: QuizAttemptService,
    private quizService: QuizService,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadAttempt(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttempt(id: number): void {
    this.loading = true;
    this.attemptService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (attempt) => {
        this.attempt = attempt;
        this.loadQuizDetails(attempt.quizId);
      },
      error: (error) => {
        console.error('Error loading attempt:', error);
        this.loading = false;
      }
    });
  }

  loadQuizDetails(quizId: number): void {
    forkJoin({
      quiz: this.quizService.getById(quizId),
      questions: this.questionService.getByQuiz(quizId)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.quiz = data.quiz;
        this.questions = data.questions.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quiz details:', error);
        this.loading = false;
      }
    });
  }

  getPercentage(): number {
    if (!this.attempt) return 0;
    return (this.attempt.score / this.attempt.totalPoints) * 100;
  }

  goToQuiz(): void {
    if (this.attempt?.quizId) {
      const isDashboard = this.router.url.includes('/dashboard');
      if (isDashboard) {
        this.router.navigate(['/dashboard/quizzes', this.attempt.quizId]);
      } else {
        this.router.navigate(['/quizzes', this.attempt.quizId]);
      }
    } else {
      const isDashboard = this.router.url.includes('/dashboard');
      if (isDashboard) {
        this.router.navigate(['/dashboard/quizzes']);
      } else {
        this.router.navigate(['/quizzes']);
      }
    }
  }

  goToQuizList(): void {
    const isDashboard = this.router.url.includes('/dashboard');
    if (isDashboard) {
      this.router.navigate(['/dashboard/quizzes']);
    } else {
      this.router.navigate(['/quizzes']);
    }
  }

  tryAgain(): void {
    if (this.attempt?.quizId) {
      if (confirm('Are you sure you want to retake this quiz? Your current progress will be reset.')) {
        const isDashboard = this.router.url.includes('/dashboard');
        if (isDashboard) {
          this.router.navigate(['/dashboard/quizzes', this.attempt.quizId, 'take']);
        } else {
          this.router.navigate(['/quizzes', this.attempt.quizId, 'take']);
        }
      }
    }
  }

  giveFeedback(): void {
    const isDashboard = this.router.url.includes('/dashboard');
    if (isDashboard) {
      this.router.navigate(['/dashboard/feedbacks/new'], {
        queryParams: { 
          quizId: this.attempt?.quizId,
          attemptId: this.attempt?.id
        }
      });
    } else {
      this.router.navigate(['/feedbacks/new'], {
        queryParams: { 
          quizId: this.attempt?.quizId,
          attemptId: this.attempt?.id
        }
      });
    }
  }

  viewAllAttempts(): void {
    const isDashboard = this.router.url.includes('/dashboard');
    if (isDashboard) {
      this.router.navigate(['/dashboard/attempts']);
    } else {
      this.router.navigate(['/attempts']);
    }
  }

  exportToPDF(): void {
    if (!this.attempt || !this.quiz) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Titre
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Résultats du Quiz', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Informations du quiz
    doc.setFontSize(16);
    doc.text(this.quiz.title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const scoreText = `Score: ${this.attempt.score}/${this.attempt.totalPoints} (${this.getPercentage().toFixed(1)}%)`;
    doc.text(scoreText, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Statut
    doc.setFont('helvetica', 'bold');
    if (this.attempt.passed) {
      doc.setTextColor(0, 128, 0);
    } else {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(this.attempt.passed ? 'RÉUSSI' : 'ÉCHOUÉ', pageWidth / 2, yPos, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPos += 10;

    // Informations supplémentaires
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Étudiant: ${this.attempt.studentName || 'N/A'}`, 15, yPos);
    yPos += 6;
    doc.text(`Date: ${new Date(this.attempt.completedAt).toLocaleString('fr-FR')}`, 15, yPos);
    yPos += 6;
    doc.text(`Temps: ${this.attempt.timeSpentMinutes || 0} minutes`, 15, yPos);
    yPos += 12;

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;

    // Questions et réponses correctes
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Réponses Correctes:', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    this.questions.forEach((question, index) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Question
      doc.setFont('helvetica', 'bold');
      const questionText = `Q${index + 1}. ${question.questionText}`;
      const questionLines = doc.splitTextToSize(questionText, pageWidth - 30);
      doc.text(questionLines, 15, yPos);
      yPos += questionLines.length * 5 + 3;

      // Réponse correcte
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 128, 0);
      const answerText = `Réponse: ${question.correctAnswer}`;
      const answerLines = doc.splitTextToSize(answerText, pageWidth - 30);
      doc.text(answerLines, 20, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += answerLines.length * 5 + 2;

      // Explication si disponible
      if (question.explanation) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        const explLines = doc.splitTextToSize(`Explication: ${question.explanation}`, pageWidth - 30);
        doc.text(explLines, 20, yPos);
        yPos += explLines.length * 4 + 2;
        doc.setFontSize(10);
      }

      yPos += 5;
    });

    // Sauvegarder le PDF
    const fileName = `quiz_${this.quiz.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    doc.save(fileName);
  }
}
