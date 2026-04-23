import { Component } from '@angular/core';

interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  selected?: string;
}

interface CourseQuiz {
  id: number;
  course: string;
  completed: boolean;
  score?: number;
  totalQuestions: number;
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
  standalone: false,
})
export class QuizComponent {
  courseQuizzes: CourseQuiz[] = [
    {
      id: 1,
      course: 'French B1 Course',
      completed: false,
      totalQuestions: 3,
      questions: [
        {
          id: 1,
          text: 'Choose the correct conjugation: "Il _____ à Paris."',
          options: ['habite', 'habites', 'habitez', 'habitons'],
        },
        {
          id: 2,
          text: 'What does "Bonjour" mean?',
          options: ['Goodbye', 'Hello', 'Thank you', 'Please'],
        },
        {
          id: 3,
          text: 'Select the correct article: "_____ livre est intéressant."',
          options: ['Le', 'La', 'Les', 'Un'],
        },
      ],
    },
    {
      id: 2,
      course: 'Spanish A2 Course',
      completed: true,
      score: 8,
      totalQuestions: 10,
      questions: [],
    },
  ];

  selectedQuiz: CourseQuiz | null = this.courseQuizzes[0];
  isSubmitted = false;
  resultScore = 0;

  selectQuiz(quiz: CourseQuiz): void {
    if (!quiz.completed) {
      this.selectedQuiz = quiz;
      this.isSubmitted = false;
    }
  }

  selectOption(question: QuizQuestion, option: string): void {
    question.selected = option;
  }

  submitQuiz(): void {
    if (!this.selectedQuiz) return;
    const answered = this.selectedQuiz.questions.filter((q) => q.selected).length;
    if (answered === this.selectedQuiz.questions.length) {
      this.resultScore = 7;
      this.isSubmitted = true;
    }
  }
}
