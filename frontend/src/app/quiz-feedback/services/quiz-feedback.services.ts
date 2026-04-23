import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Quiz, QuizStats, Question, QuizAttemptSubmit, QuizAttemptResponse, Feedback } from '../models/quiz-feedback.models';
import { environment } from '../../../environments/environment';

/*
  Fichier fusionné contenant les services liés aux quizzes, questions,
  tentatives et feedbacks. Ce regroupement réduit le nombre de fichiers
  tout en conservant les classes exportées séparément.
*/

const defaultHeaders = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class QuizService {
  private apiUrl = `${environment.apiGatewayUrl}/api/quizzes`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Quiz[]> { return this.http.get<Quiz[]>(this.apiUrl).pipe(catchError(this.handleError)); }
  getById(id: number): Observable<Quiz> { return this.http.get<Quiz>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError)); }
  getWithQuestions(id: number): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${id}/full`).pipe(catchError(this.handleError)); }
  getByCourse(courseId: number): Observable<Quiz[]> { return this.http.get<Quiz[]>(`${this.apiUrl}/course/${courseId}`).pipe(catchError(this.handleError)); }
  getPublished(): Observable<Quiz[]> { return this.http.get<Quiz[]>(`${this.apiUrl}/published`).pipe(catchError(this.handleError)); }
  getStats(id: number): Observable<QuizStats> { return this.http.get<QuizStats>(`${this.apiUrl}/${id}/stats`).pipe(catchError(this.handleError)); }
  create(quiz: Quiz): Observable<Quiz> { return this.http.post<Quiz>(this.apiUrl, quiz, defaultHeaders).pipe(catchError(this.handleError)); }
  update(id: number, quiz: Partial<Quiz>): Observable<Quiz> { return this.http.put<Quiz>(`${this.apiUrl}/${id}`, quiz, defaultHeaders).pipe(catchError(this.handleError)); }
  publish(id: number): Observable<Quiz> { return this.http.put<Quiz>(`${this.apiUrl}/${id}/publish`, {}, defaultHeaders).pipe(catchError(this.handleError)); }
  archive(id: number): Observable<Quiz> { return this.http.put<Quiz>(`${this.apiUrl}/${id}/archive`, {}, defaultHeaders).pipe(catchError(this.handleError)); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError)); }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) { errorMessage = `Error: ${error.error.message}`; }
    else { errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`; }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private apiUrl = `${environment.apiGatewayUrl}/api/questions`;
  constructor(private http: HttpClient) {}

  getByQuiz(quizId: number): Observable<Question[]> { return this.http.get<Question[]>(`${this.apiUrl}/quiz/${quizId}`).pipe(catchError(this.handleError)); }
  getById(id: number): Observable<Question> { return this.http.get<Question>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError)); }
  create(question: Question): Observable<Question> { return this.http.post<Question>(this.apiUrl, question, defaultHeaders).pipe(catchError(this.handleError)); }
  update(id: number, question: Partial<Question>): Observable<Question> { return this.http.put<Question>(`${this.apiUrl}/${id}`, question, defaultHeaders).pipe(catchError(this.handleError)); }
  reorder(quizId: number, orderedIds: number[]): Observable<void> { return this.http.put<void>(`${this.apiUrl}/quiz/${quizId}/reorder`, orderedIds, defaultHeaders).pipe(catchError(this.handleError)); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError)); }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) { errorMessage = `Error: ${error.error.message}`; }
    else { errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`; }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

@Injectable({ providedIn: 'root' })
export class QuizAttemptService {
  private apiUrl = `${environment.apiGatewayUrl}/api/attempts`;
  constructor(private http: HttpClient) {}

  submit(attempt: QuizAttemptSubmit): Observable<QuizAttemptResponse> { return this.http.post<QuizAttemptResponse>(`${this.apiUrl}/submit`, attempt, defaultHeaders).pipe(catchError(this.handleError)); }
  getByStudent(studentId: number): Observable<QuizAttemptResponse[]> { return this.http.get<QuizAttemptResponse[]>(`${this.apiUrl}/student/${studentId}`).pipe(catchError(this.handleError)); }
  getByQuiz(quizId: number): Observable<QuizAttemptResponse[]> { return this.http.get<QuizAttemptResponse[]>(`${this.apiUrl}/quiz/${quizId}`).pipe(catchError(this.handleError)); }
  getById(id: number): Observable<QuizAttemptResponse> { return this.http.get<QuizAttemptResponse>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError)); }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) { errorMessage = `Error: ${error.error.message}`; }
    else { errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`; }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private apiUrl = `${environment.apiGatewayUrl}/api/feedbacks`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Feedback[]> { return this.http.get<Feedback[]>(this.apiUrl).pipe(catchError(this.handleError)); }
  getById(id: number): Observable<Feedback> { return this.http.get<Feedback>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError)); }
  getByQuiz(quizId: number): Observable<Feedback[]> { return this.http.get<Feedback[]>(`${this.apiUrl}/quiz/${quizId}`).pipe(catchError(this.handleError)); }
  getByStudent(studentId: number): Observable<Feedback[]> { return this.http.get<Feedback[]>(`${this.apiUrl}/student/${studentId}`).pipe(catchError(this.handleError)); }
  getByCourse(courseId: number): Observable<Feedback[]> { return this.http.get<Feedback[]>(`${this.apiUrl}/course/${courseId}`).pipe(catchError(this.handleError)); }
  getAverageRating(quizId: number): Observable<number> { return this.http.get<number>(`${this.apiUrl}/quiz/${quizId}/average`).pipe(catchError(this.handleError)); }
  create(feedback: Feedback): Observable<Feedback> { return this.http.post<Feedback>(this.apiUrl, feedback, defaultHeaders).pipe(catchError(this.handleError)); }
  update(id: number, feedback: Partial<Feedback>): Observable<Feedback> { return this.http.put<Feedback>(`${this.apiUrl}/${id}`, feedback, defaultHeaders).pipe(catchError(this.handleError)); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError)); }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) { errorMessage = `Error: ${error.error.message}`; }
    else { errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`; }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
