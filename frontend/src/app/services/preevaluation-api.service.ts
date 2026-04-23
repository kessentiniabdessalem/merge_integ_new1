import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type PreevaluationStatus = {
  completed: boolean;
  profileCompleted: boolean;
  finalLevel: string | null;
  activeLevel: string | null;
  needsPreevaluation: boolean;
  terminatedForCheating?: boolean;
  fraudFirstStrikeConsumed?: boolean;
};

export type FraudReportResponse = {
  action: string;
  message: string;
};

export type QuestionCategory = 'GRAMMAR' | 'VOCABULARY' | 'READING';

export type LevelQuestion = {
  id: number;
  text: string;
  category: QuestionCategory;
  options: { id: number; text: string }[];
};

export type LevelStart = {
  level: string;
  expectedCount: number;
  questions: LevelQuestion[];
};

export type LevelSubmit = {
  score: number;
  passed: boolean;
  finished: boolean;
  finalLevel: string | null;
  nextLevel: string | null;
};

export type IncorrectAnswerReview = {
  questionId: number;
  questionText: string;
  selectedAnswerText: string;
  correctAnswerText: string;
  category: string;
  categoryLabel: string;
  level: string;
};

export type ResultReview = {
  finalLevel: string;
  failedLevel: string | null;
  incorrectAnswers: IncorrectAnswerReview[];
  mainWeakness: string | null;
  secondaryWeakness: string | null;
  readingAssessment: string;
  globalSummaryLines: string[];
};

export type ExplainMistakePayload = {
  questionId: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  category: string;
  level: string;
};

export type ExplainMistakeResponse = {
  explanation: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type FollowUpChatPayload = {
  questionId: number;
  initialExplanation: string;
  priorMessages: ChatMessage[];
  userMessage: string;
};

export type FollowUpChatResponse = {
  reply: string;
};

export type ProfilePayload = {
  studiedBefore: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'RARELY';
  goal: 'STUDY' | 'WORK' | 'TRAVEL' | 'EXAMS' | 'SPEAKING_IMPROVEMENT';
};

@Injectable({ providedIn: 'root' })
export class PreevaluationApiService {
  private readonly base =
    (environment.apiGatewayUrl ? environment.apiGatewayUrl.replace(/\/$/, '') : '') + '/api/preevaluation';

  constructor(private http: HttpClient) {}

  getStatus(): Observable<PreevaluationStatus> {
    return this.http.get<PreevaluationStatus>(`${this.base}/status`);
  }

  saveProfile(body: ProfilePayload): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<void>(`${this.base}/profile`, body, { headers });
  }

  startLevel(level: string): Observable<LevelStart> {
    return this.http.post<LevelStart>(`${this.base}/levels/${level}/start`, {});
  }

  submitLevel(
    level: string,
    answers: { questionId: number; selectedOptionId: number }[]
  ): Observable<LevelSubmit> {
    return this.http.post<LevelSubmit>(`${this.base}/levels/${level}/submit`, { answers });
  }

  reportFraud(reason: string): Observable<FraudReportResponse> {
    return this.http.post<FraudReportResponse>(`${this.base}/fraud-report`, { reason });
  }

  getResultReview(): Observable<ResultReview> {
    return this.http.get<ResultReview>(`${this.base}/result-review`);
  }

  explainMistake(body: ExplainMistakePayload): Observable<ExplainMistakeResponse> {
    return this.http.post<ExplainMistakeResponse>(`${this.base}/ai/explain-mistake`, body);
  }

  followUpChat(body: FollowUpChatPayload): Observable<FollowUpChatResponse> {
    return this.http.post<FollowUpChatResponse>(`${this.base}/ai/follow-up`, body);
  }
}
