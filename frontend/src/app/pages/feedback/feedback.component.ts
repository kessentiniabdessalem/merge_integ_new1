import { Component } from '@angular/core';

interface FeedbackItem {
  id: number;
  course: string;
  rating: number;
  comment: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
  standalone: false,
})
export class FeedbackComponent {
  feedbackList: FeedbackItem[] = [
    { id: 1, course: 'French B1 Course', rating: 5, comment: 'Excellent course! The tutor was very helpful.', date: '2024-03-10', status: 'Published' },
    { id: 2, course: 'Spanish A2 Course', rating: 4, comment: 'Good content, but could use more practice exercises.', date: '2024-02-15', status: 'Published' },
  ];

  newFeedback = {
    course: '',
    rating: 0,
    comment: '',
  };

  submitFeedback(): void {
    if (this.newFeedback.comment && this.newFeedback.rating) {
      this.feedbackList.unshift({
        id: this.feedbackList.length + 1,
        course: this.newFeedback.course || 'General',
        rating: this.newFeedback.rating,
        comment: this.newFeedback.comment,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
      });
      this.newFeedback = { course: '', rating: 0, comment: '' };
    }
  }

  setRating(r: number): void {
    this.newFeedback.rating = r;
  }
}
