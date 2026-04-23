import { Component } from '@angular/core';

interface ScheduleItem {
  id: number;
  course: string;
  tutor: string;
  day: string;
  time: string;
  room: string;
}

interface Absence {
  id: number;
  student: string;
  course: string;
  date: string;
  reason: string;
  status: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
  standalone: false,
})
export class ScheduleComponent {
  schedules: ScheduleItem[] = [
    { id: 1, course: 'French B1', tutor: 'Marie Dupont', day: 'Mon, Wed', time: '10:00 AM', room: 'Room 101' },
    { id: 2, course: 'Spanish A2', tutor: 'Carlos Garcia', day: 'Tue, Thu', time: '2:00 PM', room: 'Room 102' },
    { id: 3, course: 'English C1', tutor: 'Sarah Johnson', day: 'Fri', time: '9:00 AM', room: 'Online' },
  ];

  absences: Absence[] = [
    { id: 1, student: 'John Doe', course: 'French B1', date: '2024-03-14', reason: 'Medical', status: 'Approved' },
    { id: 2, student: 'Emma Davis', course: 'Spanish A2', date: '2024-03-12', reason: 'Personal', status: 'Approved' },
    { id: 3, student: 'Mike Chen', course: 'English C1', date: '2024-03-10', reason: 'Travel', status: 'Approved' },
  ];
}
