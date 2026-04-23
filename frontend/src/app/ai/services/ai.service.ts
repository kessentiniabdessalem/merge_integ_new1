import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  QuizGenerationRequest,
  GeneratedQuiz,
  FeedbackAnalysisRequest,
  PersonalizedFeedback,
  FeedbackSuggestionRequest,
  FeedbackSuggestion,
  StudyPlanRequest,
  StudyPlanResponse,
  EventPredictionRequest,
  EventPredictionResponse,
  EventRecommendationRequest,
  EventRecommendedEvent,
  OralAssessmentRequestDto,
  OralAssessmentResponseDto
} from '../models/ai.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = `${environment.apiGatewayUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  generateQuiz(request: QuizGenerationRequest): Observable<GeneratedQuiz> {
    return this.http.post<GeneratedQuiz>(`${this.apiUrl}/quiz/generate`, request);
  }

  chat(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chatbot/chat`, { message });
  }

  analyzeFeedback(request: FeedbackAnalysisRequest): Observable<PersonalizedFeedback> {
    return this.http.post<PersonalizedFeedback>(`${this.apiUrl}/feedback/analyze`, request);
  }
  
  generateFeedbackSuggestions(request: FeedbackSuggestionRequest): Observable<FeedbackSuggestion> {
    return this.http.post<FeedbackSuggestion>(`${this.apiUrl}/feedback/suggestions`, request);
  }
  
  getSuggestedTopics(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/quiz/topics`);
  }

  generateStudyPlan(request: StudyPlanRequest): Observable<StudyPlanResponse> {
    return this.http.post<StudyPlanResponse>(`${this.apiUrl}/study-plan/generate`, request);
  }

  predictEventCompletion(request: EventPredictionRequest): Observable<EventPredictionResponse> {
    return this.http.post<EventPredictionResponse>(`${this.apiUrl}/events/predict`, request);
  }

  recommendEvents(request: EventRecommendationRequest): Observable<EventRecommendedEvent[]> {
    return this.http.post<EventRecommendedEvent[]>(`${this.apiUrl}/events/recommend`, request);
  }

  evaluateOralAssessment(request: OralAssessmentRequestDto): Observable<OralAssessmentResponseDto> {
    return this.http.post<OralAssessmentResponseDto>(
      `${this.apiUrl}/oral-assessment/evaluate`,
      request
    );
  }
}
