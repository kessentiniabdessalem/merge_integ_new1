/*
  Fichier fusionné pour les interfaces de `quiz-feedback`.
  Regroupe `quiz.model`, `question.model`, `quiz-attempt.model` et `feedback.model`.
*/

export interface Quiz {
  id?: number;
  title: string;
  description?: string;
  courseId: number;
  tutorId?: number;
  timeLimitMinutes?: number;
  passingScore?: number;
  totalPoints?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
  questionCount?: number;
  averageScore?: number;
}

export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageRating: number;
}

export interface Question {
  id?: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
  points?: number;
  explanation?: string;
  orderIndex?: number;
  quizId: number;
}

export interface QuizAttemptSubmit {
  quizId: number;
  studentId: number;
  studentName?: string;
  answers: { [questionId: number]: string };
  timeSpentMinutes?: number;
}

export interface QuizAttemptResponse {
  id: number;
  quizId: number;
  studentId: number;
  studentName?: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  message: string;
  timeSpentMinutes?: number;
  startedAt: string;
  completedAt: string;
}

export interface Feedback {
  id?: number;
  quizId?: number;
  courseId?: number;
  studentId: number;
  studentName?: string;
  rating: number;
  comment?: string;
  type: 'QUIZ_FEEDBACK' | 'COURSE_FEEDBACK' | 'GENERAL';
  createdAt?: string;
}
