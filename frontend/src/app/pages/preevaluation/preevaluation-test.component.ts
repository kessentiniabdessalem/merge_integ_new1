import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  LevelQuestion,
  PreevaluationApiService,
} from '../../services/preevaluation-api.service';

export type LevelSummary = {
  attemptedLevel: string;
  score: number;
  maxScore: number;
  passed: boolean;
  nextLevel: string | null;
  finalLevel: string | null;
};

@Component({
  selector: 'app-preevaluation-test',
  standalone: false,
  templateUrl: './preevaluation-test.component.html',
  styleUrl: './preevaluation-test.component.scss',
})
export class PreevaluationTestComponent implements OnInit, OnDestroy {
  readonly allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  readonly maxPerLevel = 12;
  readonly maxReadingListens = 2;
  /** 10 minutes for the 12 questions of the current level */
  readonly levelTimeTotalSeconds = 600;

  @ViewChild('secureHost') secureHostRef?: ElementRef<HTMLElement>;

  loading = true;
  error = '';
  readingAudioError = '';
  view: 'questions' | 'levelSummary' = 'questions';
  levelSummary: LevelSummary | null = null;

  /** Full-screen gate before loading questions (and again after each level). */
  showSecureGate = false;
  secureGateError = '';
  pendingLevelAfterGate: string | null = null;

  /** Blocking modal after first fraud strike (message from API). */
  firstStrikeModalText: string | null = null;

  currentLevel = '';
  questions: LevelQuestion[] = [];
  index = 0;
  selectedOptionId: number | null = null;
  submitting = false;
  readingSpeechActive = false;

  private fraudMonitorActive = false;
  private fullscreenGraceUntil = 0;
  private fraudDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private fraudReportInFlight = false;

  private answersByQuestion = new Map<number, number>();
  private readingListensRemainingByQuestionId = new Map<number, number>();

  /** Countdown for current level; null when not running */
  remainingSeconds: number | null = null;
  private levelTimerId: ReturnType<typeof setInterval> | null = null;
  /** Shown on level summary when time ran out mid multi-level flow */
  showTimeUpBannerOnSummary = false;

  constructor(
    private api: PreevaluationApiService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.bootstrap();
  }

  ngOnDestroy(): void {
    this.stopLevelTimer();
    this.clearFraudDebounce();
    this.stopReadingSpeech();
    this.fraudMonitorActive = false;
    try {
      void document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }

  get currentQuestion(): LevelQuestion | null {
    return this.questions[this.index] ?? null;
  }

  /** Less than 1 minute left — visual warning (bonus) */
  get timerLowWarning(): boolean {
    return this.remainingSeconds !== null && this.remainingSeconds > 0 && this.remainingSeconds <= 60;
  }

  formatLevelTimer(): string {
    if (this.remainingSeconds === null || this.remainingSeconds < 0) return '—';
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get levelProgressFraction(): number {
    if (!this.currentLevel) return 0;
    const i = this.allLevels.indexOf(this.currentLevel);
    if (i < 0) return 0;
    const within = this.questions.length ? (this.index + 1) / this.questions.length : 0;
    return (i + within) / this.allLevels.length;
  }

  categoryLabel(cat: string): string {
    switch (cat) {
      case 'GRAMMAR':
        return 'Grammar';
      case 'VOCABULARY':
        return 'Vocabulary';
      case 'READING':
        return 'Reading';
      default:
        return cat;
    }
  }

  isReadingQuestion(q: LevelQuestion | null): boolean {
    return q != null && q.category === 'READING';
  }

  getReadingListensRemaining(q: LevelQuestion): number {
    if (!this.readingListensRemainingByQuestionId.has(q.id)) {
      this.readingListensRemainingByQuestionId.set(q.id, this.maxReadingListens);
    }
    return this.readingListensRemainingByQuestionId.get(q.id)!;
  }

  canPlayReadingAudio(q: LevelQuestion | null): boolean {
    if (q == null || q.category !== 'READING') return false;
    return this.getReadingListensRemaining(q) > 0 && !this.readingSpeechActive;
  }

  playReadingAudio(q: LevelQuestion): void {
    this.readingAudioError = '';
    if (!this.isReadingQuestion(q)) return;
    const rem = this.getReadingListensRemaining(q);
    if (rem <= 0 || this.readingSpeechActive) return;

    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    if (!synth) {
      this.readingAudioError = 'Speech playback is not available in this browser.';
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(q.text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;

    this.readingListensRemainingByQuestionId.set(q.id, rem - 1);
    this.readingSpeechActive = true;

    utterance.onend = () => {
      this.ngZone.run(() => {
        this.readingSpeechActive = false;
      });
    };
    utterance.onerror = () => {
      this.ngZone.run(() => {
        this.readingSpeechActive = false;
      });
    };

    synth.speak(utterance);
  }

  private stopReadingSpeech(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.readingSpeechActive = false;
  }

  selectOption(id: number): void {
    this.selectedOptionId = id;
  }

  /** Enter fullscreen then load questions for pending level. */
  onSecureContinue(): void {
    this.secureGateError = '';
    const el = this.secureHostRef?.nativeElement;
    if (!el) {
      this.secureGateError = 'Unable to start secure mode. Please refresh the page.';
      return;
    }
    const anyEl = el as HTMLElement & {
      webkitRequestFullscreen?: () => void;
    };
    if (el.requestFullscreen) {
      void Promise.resolve(el.requestFullscreen())
        .then(() => this.ngZone.run(() => this.onFullscreenReady()))
        .catch(() => {
          this.ngZone.run(() => {
            this.secureGateError =
              'Fullscreen is required. Please allow fullscreen when prompted and try again.';
          });
        });
      return;
    }
    if (anyEl.webkitRequestFullscreen) {
      anyEl.webkitRequestFullscreen();
      this.ngZone.run(() => this.onFullscreenReady());
      return;
    }
    this.secureGateError =
      'Fullscreen is not supported in this browser. Please use Chrome, Edge, or Firefox.';
  }

  private onFullscreenReady(): void {
    this.showSecureGate = false;
    this.loading = true;
    const level = this.pendingLevelAfterGate || 'A1';
    this.fetchLevel(level);
  }

  bootstrap(): void {
    this.loading = true;
    this.error = '';
    this.view = 'questions';
    this.levelSummary = null;
    this.api.getStatus().subscribe({
      next: (s) => {
        if (s.terminatedForCheating === true) {
          this.loading = false;
          this.router.navigate(['/preevaluation/cheating-terminated']);
          return;
        }
        if (!s.profileCompleted) {
          this.loading = false;
          this.router.navigate(['/preevaluation/profile']);
          return;
        }
        if (s.completed) {
          this.loading = false;
          this.router.navigate(['/']);
          return;
        }
        this.pendingLevelAfterGate = s.activeLevel || 'A1';
        this.loading = false;
        this.showSecureGate = true;
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load pre-evaluation status.';
      },
    });
  }

  fetchLevel(level: string): void {
    this.stopLevelTimer();
    this.showTimeUpBannerOnSummary = false;
    this.view = 'questions';
    this.levelSummary = null;
    this.loading = true;
    this.fraudMonitorActive = false;
    this.clearFraudDebounce();
    this.api.startLevel(level).subscribe({
      next: (res) => {
        this.loading = false;
        this.currentLevel = res.level;
        this.questions = res.questions;
        this.index = 0;
        this.selectedOptionId = null;
        this.answersByQuestion.clear();
        this.readingListensRemainingByQuestionId.clear();
        this.stopReadingSpeech();
        this.readingAudioError = '';
        this.scheduleEnableFraudMonitoring();
        this.startLevelTimer();
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 403) {
          this.router.navigate(['/preevaluation/cheating-terminated']);
          return;
        }
        this.error = err?.error?.message || 'Could not start this level.';
      },
    });
  }

  private scheduleEnableFraudMonitoring(): void {
    this.fraudMonitorActive = false;
    this.fullscreenGraceUntil = Date.now() + 1800;
    setTimeout(() => {
      this.ngZone.run(() => {
        this.fraudMonitorActive = true;
      });
    }, 600);
  }

  private clearFraudDebounce(): void {
    if (this.fraudDebounceTimer) {
      clearTimeout(this.fraudDebounceTimer);
      this.fraudDebounceTimer = null;
    }
  }

  private scheduleFraudCheck(reason: string): void {
    if (!this.fraudMonitorActive) return;
    if (this.view !== 'questions' || !this.currentQuestion) return;
    if (this.firstStrikeModalText) return;
    if (this.showSecureGate) return;
    if (this.submitting) return;
    if (this.fraudReportInFlight) return;
    if (Date.now() < this.fullscreenGraceUntil) return;

    this.clearFraudDebounce();
    this.fraudDebounceTimer = setTimeout(() => {
      this.fraudDebounceTimer = null;
      this.sendFraudReport(reason);
    }, 450);
  }

  private sendFraudReport(reason: string): void {
    if (this.fraudReportInFlight) return;
    this.fraudReportInFlight = true;
    this.api.reportFraud(reason).subscribe({
      next: (res) => {
        this.fraudReportInFlight = false;
        if (res.action === 'FIRST_STRIKE_RESTART') {
          this.handleFirstStrike(res.message);
        } else if (res.action === 'TERMINATED') {
          this.fraudMonitorActive = false;
          this.clearFraudDebounce();
          this.router.navigate(['/preevaluation/cheating-terminated'], {
            queryParams: { m: res.message || '' },
          });
        }
      },
      error: () => {
        this.fraudReportInFlight = false;
      },
    });
  }

  private handleFirstStrike(message: string): void {
    this.fraudMonitorActive = false;
    this.clearFraudDebounce();
    this.stopReadingSpeech();
    try {
      void document.exitFullscreen();
    } catch {
      /* ignore */
    }
    this.firstStrikeModalText =
      message ||
      'Cheating attempt detected. You have one last chance. The test will restart with new questions.';
  }

  acknowledgeFirstStrike(): void {
    this.stopLevelTimer();
    this.firstStrikeModalText = null;
    this.questions = [];
    this.index = 0;
    this.answersByQuestion.clear();
    this.readingListensRemainingByQuestionId.clear();
    this.selectedOptionId = null;
    this.error = '';
    this.pendingLevelAfterGate = 'A1';
    this.showSecureGate = true;
    this.loading = false;
  }

  private suspendFraudForLevelSummary(): void {
    this.fraudMonitorActive = false;
    this.clearFraudDebounce();
    try {
      void document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      this.scheduleFraudCheck('VISIBILITY');
    }
  }

  @HostListener('window:blur')
  onWindowBlur(): void {
    this.scheduleFraudCheck('WINDOW_BLUR');
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (!this.fraudMonitorActive) return;
    if (Date.now() < this.fullscreenGraceUntil) return;
    if (document.fullscreenElement == null) {
      this.scheduleFraudCheck('FULLSCREEN_EXIT');
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(e: KeyboardEvent): void {
    if (!this.shouldHardenUi()) return;
    if (e.key === 'F12') {
      e.preventDefault();
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (['c', 'v', 'x', 'u', 's', 'p', 'i'].includes(k)) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && (k === 'i' || k === 'c')) {
        e.preventDefault();
      }
    }
  }

  shouldHardenUi(): boolean {
    return (
      this.fraudMonitorActive &&
      this.view === 'questions' &&
      !this.showSecureGate &&
      !!this.currentQuestion
    );
  }

  blockClipboardEvent(e: Event): void {
    if (this.shouldHardenUi()) {
      e.preventDefault();
    }
  }

  blockContextMenu(e: Event): void {
    if (this.shouldHardenUi()) {
      e.preventDefault();
    }
  }

  continueToNextLevel(): void {
    const next = this.levelSummary?.nextLevel;
    this.showTimeUpBannerOnSummary = false;
    this.suspendFraudForLevelSummary();
    this.levelSummary = null;
    this.view = 'questions';
    this.questions = [];
    if (next) {
      this.pendingLevelAfterGate = next;
      this.showSecureGate = true;
      this.loading = false;
    }
  }

  goToFinalResultPage(): void {
    const level = this.levelSummary?.finalLevel;
    if (!level) return;
    this.suspendFraudForLevelSummary();
    this.router.navigate(['/preevaluation/result'], { queryParams: { level } });
  }

  next(): void {
    const q = this.currentQuestion;
    if (!q || this.selectedOptionId == null) return;
    this.stopReadingSpeech();
    this.answersByQuestion.set(q.id, this.selectedOptionId);

    if (this.index < this.questions.length - 1) {
      this.index++;
      const nq = this.currentQuestion;
      this.selectedOptionId = nq ? this.answersByQuestion.get(nq.id) ?? null : null;
      return;
    }
    this.submitLevelInternal(false);
  }

  prev(): void {
    if (this.index <= 0) return;
    this.stopReadingSpeech();
    this.index--;
    const q = this.currentQuestion;
    this.selectedOptionId = q ? this.answersByQuestion.get(q.id) ?? null : null;
  }

  private startLevelTimer(): void {
    this.stopLevelTimer();
    this.remainingSeconds = this.levelTimeTotalSeconds;
    this.levelTimerId = setInterval(() => {
      this.ngZone.run(() => {
        if (this.remainingSeconds === null) return;
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          this.remainingSeconds = 0;
          this.stopLevelTimer();
          this.onLevelTimeExpired();
        }
      });
    }, 1000);
  }

  private stopLevelTimer(): void {
    if (this.levelTimerId != null) {
      clearInterval(this.levelTimerId);
      this.levelTimerId = null;
    }
    this.remainingSeconds = null;
  }

  private onLevelTimeExpired(): void {
    if (this.submitting) return;
    if (this.view !== 'questions' || !this.questions.length) return;
    if (this.showSecureGate || this.loading || this.firstStrikeModalText) return;
    this.submitLevelInternal(true);
  }

  private buildAnswersStrict():
    | { questionId: number; selectedOptionId: number }[]
    | null {
    const answers: { questionId: number; selectedOptionId: number }[] = [];
    for (const q of this.questions) {
      const picked = this.answersByQuestion.get(q.id);
      if (picked == null) return null;
      answers.push({ questionId: q.id, selectedOptionId: picked });
    }
    return answers;
  }

  /** Unanswered → first listed option (valid for API) */
  private buildAnswersWithFallback():
    | { questionId: number; selectedOptionId: number }[]
    | null {
    const answers: { questionId: number; selectedOptionId: number }[] = [];
    for (const q of this.questions) {
      const picked = this.answersByQuestion.get(q.id);
      const fallback = q.options[0]?.id;
      const id = picked ?? fallback;
      if (id == null) return null;
      answers.push({ questionId: q.id, selectedOptionId: id });
    }
    return answers;
  }

  private submitLevelInternal(fromTimeUp: boolean): void {
    this.stopLevelTimer();
    this.stopReadingSpeech();
    const answers = fromTimeUp ? this.buildAnswersWithFallback() : this.buildAnswersStrict();
    if (!answers) {
      this.error = fromTimeUp
        ? 'Unable to submit automatically. Please refresh and try again.'
        : 'Please answer every question.';
      return;
    }

    this.submitting = true;
    this.error = '';
    const attempted = this.currentLevel;

    this.api
      .submitLevel(attempted, answers as { questionId: number; selectedOptionId: number }[])
      .subscribe({
        next: (r) => {
          this.submitting = false;

          if (r.finished && r.passed && r.finalLevel) {
            if (fromTimeUp) {
              this.suspendFraudForLevelSummary();
              this.router.navigate(['/preevaluation/result'], {
                queryParams: { level: r.finalLevel, timeUp: '1' },
              });
              return;
            }
            this.suspendFraudForLevelSummary();
            this.levelSummary = {
              attemptedLevel: attempted,
              score: r.score,
              maxScore: this.maxPerLevel,
              passed: true,
              nextLevel: null,
              finalLevel: r.finalLevel,
            };
            this.view = 'levelSummary';
            this.questions = [];
            this.readingListensRemainingByQuestionId.clear();
            return;
          }

          if (r.finished && !r.passed) {
            if (fromTimeUp && r.finalLevel) {
              this.suspendFraudForLevelSummary();
              this.router.navigate(['/preevaluation/result'], {
                queryParams: { level: r.finalLevel, timeUp: '1' },
              });
              return;
            }
            this.suspendFraudForLevelSummary();
            this.levelSummary = {
              attemptedLevel: attempted,
              score: r.score,
              maxScore: this.maxPerLevel,
              passed: false,
              nextLevel: null,
              finalLevel: r.finalLevel ?? null,
            };
            this.view = 'levelSummary';
            this.questions = [];
            this.readingListensRemainingByQuestionId.clear();
            if (fromTimeUp) this.showTimeUpBannerOnSummary = true;
            return;
          }

          if (r.passed && r.nextLevel) {
            this.suspendFraudForLevelSummary();
            this.levelSummary = {
              attemptedLevel: attempted,
              score: r.score,
              maxScore: this.maxPerLevel,
              passed: true,
              nextLevel: r.nextLevel,
              finalLevel: null,
            };
            this.view = 'levelSummary';
            this.questions = [];
            this.readingListensRemainingByQuestionId.clear();
            if (fromTimeUp) this.showTimeUpBannerOnSummary = true;
          }
        },
        error: (err) => {
          this.submitting = false;
          if (err?.status === 403) {
            this.router.navigate(['/preevaluation/cheating-terminated']);
            return;
          }
          this.error = err?.error?.message || 'Submit failed.';
        },
      });
  }
}
