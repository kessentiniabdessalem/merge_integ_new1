export interface QuizGenerationRequest {
  topic: string;
  difficulty: string;
  questionCount: number;
  questionType: string;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  suggestedPassingScore?: number;
  suggestedTimeLimit?: number;
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestion {
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
  explanation: string;
}

export interface FeedbackAnalysisRequest {
  attemptId: number;
  quizTitle: string;
  score: number;
  totalPoints: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface PersonalizedFeedback {
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  motivationalMessage: string;
}

export interface FeedbackSuggestionRequest {
  quizId?: number;
  quizTitle: string;
  attemptId?: number;
  score: number;
  totalPoints: number;
  difficulty?: string;
  topic?: string;
}

export interface FeedbackSuggestion {
  suggestions: string[];
  tone: string;
  focusArea: string;
}

export interface StudyPlanRequest {
  courseTitle: string;
  courseDescription?: string;
  level?: string;
  durationMinutes?: number;
  extraContext?: string;
}

export interface StudyPlanResponse {
  courseTitle: string;
  advice: string;
}

/** Évaluation CEFR par IA (entretien oral) */
export interface OralAssessmentItemDto {
  question: string;
  answer: string;
}

export interface OralAssessmentRequestDto {
  language: string;
  targetLevel: string;
  items: OralAssessmentItemDto[];
  securityStrikes: number;
  sessionTerminatedEarly: boolean;
}

export interface OralAssessmentResponseDto {
  cefrLevel: string;
  confidence: number;
  strengthsFr: string[];
  weaknessesFr: string[];
  summaryFr: string;
  summaryEn: string;
  provider: string;
}

export interface EventPredictionRequest {
  likes: number;
  reservations: number;
  placesRestantes: number;
}

export interface EventPredictionResponse {
  result: 'RISQUE_ELEVE' | 'RISQUE_FAIBLE';
  reason: string;
}

export interface EventRecommendedEvent {
  id: number;
  name: string;
  category: string;
  date: string;
  description: string;
  availableSeats: number;
}

export interface EventRecommendationRequest {
  categoriesLiked: string[];
  availableEvents: EventRecommendedEvent[];
}
