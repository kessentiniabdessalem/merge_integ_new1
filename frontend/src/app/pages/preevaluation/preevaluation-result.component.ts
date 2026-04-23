import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ChatMessage,
  IncorrectAnswerReview,
  PreevaluationApiService,
  ResultReview,
} from '../../services/preevaluation-api.service';
import {
  PreevalCourseRecommendation,
  PreevaluationCourseRecommendationsService,
} from '../../services/preevaluation-course-recommendations.service';

export type AiExplainState = {
  loading: boolean;
  explanation?: string;
  error?: string;
  /** Mini-chat below the initial explanation */
  chatOpen?: boolean;
  chatTurns?: ChatMessage[];
  followUpLoading?: boolean;
  followUpError?: string;
};

@Component({
  selector: 'app-preevaluation-result',
  standalone: false,
  templateUrl: './preevaluation-result.component.html',
  styleUrl: './preevaluation-result.component.scss',
})
export class PreevaluationResultComponent implements OnInit {
  review: ResultReview | null = null;
  loadingReview = true;
  reviewError = '';
  finalLevelFallback = '';
  /** Set when arriving from timed-out level submit */
  showTimeUpNotice = false;
  aiStates: Record<number, AiExplainState> = {};
  /** Draft input per question for follow-up messages */
  chatDraft: Record<number, string> = {};
  /** Placeholder course tiles — replace with real course links when integrated */
  courseRecs: PreevalCourseRecommendation[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private api: PreevaluationApiService,
    private courseRecommendations: PreevaluationCourseRecommendationsService
  ) {}

  ngOnInit(): void {
    this.finalLevelFallback = this.route.snapshot.queryParamMap.get('level') || '';
    this.showTimeUpNotice = this.route.snapshot.queryParamMap.get('timeUp') === '1';
    this.api.getResultReview().subscribe({
      next: (r) => {
        this.review = r;
        this.courseRecs = this.courseRecommendations.buildRecommendations(r);
        this.loadingReview = false;
      },
      error: (err) => {
        this.loadingReview = false;
        this.reviewError =
          err?.error?.message ||
          'Could not load your detailed review. Your level is still saved.';
      },
    });
  }

  displayFinalLevel(): string {
    return this.review?.finalLevel || this.finalLevelFallback || '—';
  }

  askAi(item: IncorrectAnswerReview): void {
    const id = item.questionId;
    this.chatDraft[id] = '';
    this.aiStates = { ...this.aiStates, [id]: { loading: true } };
    this.api
      .explainMistake({
        questionId: item.questionId,
        question: item.questionText,
        studentAnswer: item.selectedAnswerText,
        correctAnswer: item.correctAnswerText,
        category: item.category,
        level: item.level,
      })
      .subscribe({
        next: (res) => {
          this.aiStates = {
            ...this.aiStates,
            [id]: {
              loading: false,
              explanation: res.explanation,
              chatOpen: true,
              chatTurns: [],
            },
          };
        },
        error: (err) => {
          const raw = err?.error?.message ?? err?.error?.error ?? err?.message;
          const msg =
            typeof raw === 'string' && raw.length > 0
              ? raw
              : 'Could not load an explanation. Please try again.';
          this.aiStates = { ...this.aiStates, [id]: { loading: false, error: msg } };
        },
      });
  }

  toggleChat(questionId: number): void {
    const st = this.aiStates[questionId];
    if (!st?.explanation) return;
    const isOpen = st.chatOpen !== false;
    this.aiStates = {
      ...this.aiStates,
      [questionId]: { ...st, chatOpen: !isOpen },
    };
  }

  sendFollowUp(item: IncorrectAnswerReview): void {
    const id = item.questionId;
    const st = this.aiStates[id];
    const draft = (this.chatDraft[id] ?? '').trim();
    if (!st?.explanation || !draft || st.followUpLoading) return;

    this.aiStates = {
      ...this.aiStates,
      [id]: { ...st, followUpLoading: true, followUpError: undefined },
    };

    this.api
      .followUpChat({
        questionId: id,
        initialExplanation: st.explanation,
        priorMessages: st.chatTurns ?? [],
        userMessage: draft,
      })
      .subscribe({
        next: (res) => {
          const prev = this.aiStates[id];
          if (!prev?.explanation) return;
          const turns: ChatMessage[] = [
            ...(prev.chatTurns ?? []),
            { role: 'user', content: draft },
            { role: 'assistant', content: res.reply },
          ];
          this.chatDraft[id] = '';
          this.aiStates = {
            ...this.aiStates,
            [id]: {
              ...prev,
              followUpLoading: false,
              chatTurns: turns,
            },
          };
        },
        error: (err) => {
          const raw = err?.error?.message ?? err?.error?.error ?? err?.message;
          const msg =
            typeof raw === 'string' && raw.length > 0
              ? raw
              : 'Could not get a reply. Please try again.';
          const prev = this.aiStates[id];
          if (!prev) return;
          this.aiStates = {
            ...this.aiStates,
            [id]: { ...prev, followUpLoading: false, followUpError: msg },
          };
        },
      });
  }

  aiStateFor(id: number): AiExplainState | undefined {
    return this.aiStates[id];
  }
}
