import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../../models/question.model';

@Component({
  selector: 'app-question-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-form-modal.component.html',
  styleUrls: ['./question-form-modal.component.scss']
})
export class QuestionFormModalComponent {
  @Input() quizId!: number;
  @Input() question?: Question;
  @Output() save = new EventEmitter<Question>();
  @Output() cancel = new EventEmitter<void>();

  questionData: Partial<Question> = {
    type: 'MULTIPLE_CHOICE',
    points: 10,
    options: ['', '', '', ''],
    correctAnswer: ''
  };

  ngOnInit(): void {
    if (this.question) {
      this.questionData = { ...this.question };
    } else {
      this.questionData.quizId = this.quizId;
    }
  }

  addOption(): void {
    if (!this.questionData.options) this.questionData.options = [];
    this.questionData.options.push('');
  }

  removeOption(index: number): void {
    this.questionData.options?.splice(index, 1);
  }

  onSubmit(): void {
    if (this.isValid()) {
      this.save.emit(this.questionData as Question);
    }
  }

  isValid(): boolean {
    if (!this.questionData.text || !this.questionData.correctAnswer) {
      return false;
    }
    if (this.questionData.type === 'MULTIPLE_CHOICE') {
      return (this.questionData.options?.length || 0) >= 2;
    }
    return true;
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
