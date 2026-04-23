import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Quiz, Question, QuizAttemptSubmit } from '../../../models/quiz-feedback.models';
import { QuizService, QuestionService, QuizAttemptService } from '../../../services/quiz-feedback.services';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './take-quiz.component.html',
  styleUrls: ['./take-quiz.component.scss']
})
export class TakeQuizComponent implements OnInit, OnDestroy {
  quiz?: Quiz;
  questions: Question[] = [];
  answers: { [questionId: number]: string } = {};
  currentQuestionIndex = 0;
  loading = false;
  startTime?: Date;
  timeRemaining = 0;
  timeElapsed = 0;
  timerDisplay = '00:00';
  showWarning = false;
  autoSaveEnabled = true;
  lastSaved?: Date;
  
  // Text-to-Speech properties
  isSpeaking: boolean = false;
  speechEnabled: boolean = true;
  synth: SpeechSynthesis = window.speechSynthesis;
  
  private destroy$ = new Subject<void>();
  private timerInterval?: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private questionService: QuestionService,
    private attemptService: QuizAttemptService
  ) {}

  ngOnInit(): void {
    this.startTime = new Date();
    this.loadSavedProgress();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadQuiz(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.synth.cancel();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadQuiz(id: number): void {
    this.loading = true;
    this.quizService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.initializeTimer();
        this.loadQuestions(id);
      },
      error: (error) => {
        console.error('Error loading quiz:', error);
        this.loading = false;
      }
    });
  }

  initializeTimer(): void {
    if (this.quiz?.timeLimitMinutes) {
      this.timeRemaining = this.quiz.timeLimitMinutes * 60;
      this.startTimer();
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.quiz?.timeLimitMinutes) {
        this.timeRemaining--;
        this.timeElapsed++;
        this.updateTimerDisplay();

        if (this.timeRemaining <= 60 && !this.showWarning) {
          this.showWarning = true;
        }

        if (this.timeRemaining <= 0) {
          this.autoSubmitQuiz();
        }
      } else {
        this.timeElapsed++;
        this.updateTimerDisplay();
      }

      if (this.autoSaveEnabled && this.timeElapsed % 30 === 0) {
        this.autoSave();
      }
    }, 1000);
  }

  updateTimerDisplay(): void {
    const time = this.quiz?.timeLimitMinutes ? this.timeRemaining : this.timeElapsed;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  autoSave(): void {
    this.saveProgress();
    this.lastSaved = new Date();
  }

  saveProgress(): void {
    if (this.quiz?.id) {
      const progress = {
        quizId: this.quiz.id,
        answers: this.answers,
        currentQuestionIndex: this.currentQuestionIndex,
        timeElapsed: this.timeElapsed
      };
      localStorage.setItem(`quiz_progress_${this.quiz.id}`, JSON.stringify(progress));
    }
  }

  loadSavedProgress(): void {
    const quizId = +this.route.snapshot.params['id'];
    const saved = localStorage.getItem(`quiz_progress_${quizId}`);
    if (saved) {
      const progress = JSON.parse(saved);
      if (confirm('Do you want to continue from where you left off?')) {
        this.answers = progress.answers || {};
        this.currentQuestionIndex = progress.currentQuestionIndex || 0;
        this.timeElapsed = progress.timeElapsed || 0;
      } else {
        localStorage.removeItem(`quiz_progress_${quizId}`);
      }
    }
  }

  clearProgress(): void {
    if (this.quiz?.id) {
      localStorage.removeItem(`quiz_progress_${this.quiz.id}`);
    }
  }

  loadQuestions(quizId: number): void {
    this.questionService.getByQuiz(quizId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loading = false;
        // Speak first question when quiz loads
        if (this.questions.length > 0 && this.questions[0].questionText) {
          this.speakQuestion(this.questions[0].questionText);
        }
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.loading = false;
      }
    });
  }

  // Text-to-Speech method
  speakQuestion(text: string): void {
    if (!this.speechEnabled || !window.speechSynthesis) return;
    
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => this.isSpeaking = true;
    utterance.onend = () => this.isSpeaking = false;
    this.synth.speak(utterance);
  }

  get currentQuestion(): Question | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.saveProgress();
      // Speak next question
      const nextQ = this.questions[this.currentQuestionIndex];
      if (nextQ && nextQ.questionText) {
        this.speakQuestion(nextQ.questionText);
      }
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      // Speak previous question
      const prevQ = this.questions[this.currentQuestionIndex];
      if (prevQ && prevQ.questionText) {
        this.speakQuestion(prevQ.questionText);
      }
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
    // Speak selected question
    const selectedQ = this.questions[index];
    if (selectedQ && selectedQ.questionText) {
      this.speakQuestion(selectedQ.questionText);
    }
  }

  isQuestionAnswered(index: number): boolean {
    const question = this.questions[index];
    return question && question.id ? !!this.answers[question.id] : false;
  }

  getProgressPercentage(): number {
    if (this.questions.length === 0) return 0;
    return (this.getAnsweredCount() / this.questions.length) * 100;
  }

  autoSubmitQuiz(): void {
    alert('Time is up! Your quiz will be submitted automatically.');
    this.submitQuiz(true);
  }

  submitQuiz(autoSubmit = false): void {
    if (!this.quiz?.id) return;

    if (!autoSubmit && !confirm('Are you sure you want to submit?')) {
      return;
    }

    const timeSpent = Math.floor(this.timeElapsed / 60);

    const attempt: QuizAttemptSubmit = {
      quizId: this.quiz.id,
      studentId: 1,
      studentName: 'Current User',
      answers: this.answers,
      timeSpentMinutes: timeSpent
    };

    this.loading = true;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.attemptService.submit(attempt).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.clearProgress();
        const isDashboard = this.router.url.includes('/dashboard');
        if (isDashboard) {
          this.router.navigate(['/dashboard/attempts', result.id, 'result']);
        } else {
          this.router.navigate(['/attempts', result.id, 'result']);
        }
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        this.loading = false;
        alert('Error submitting quiz. Please try again.');
      }
    });
  }

  getAnsweredCount(): number {
    return Object.keys(this.answers).length;
  }

  exitQuiz(): void {
    if (confirm('Are you sure you want to exit? Your progress will be saved and you can continue later.')) {
      this.saveProgress();
      const isDashboard = this.router.url.includes('/dashboard');
      if (isDashboard) {
        this.router.navigate(['/dashboard/quizzes', this.quiz?.id]);
      } else {
        this.router.navigate(['/quizzes', this.quiz?.id]);
      }
    }
  }

  goToQuizList(): void {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      this.saveProgress();
      const isDashboard = this.router.url.includes('/dashboard');
      if (isDashboard) {
        this.router.navigate(['/dashboard/quizzes']);
      } else {
        this.router.navigate(['/quizzes']);
      }
    }
  }
}
