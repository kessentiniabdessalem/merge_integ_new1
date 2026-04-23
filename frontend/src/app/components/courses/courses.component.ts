// courses.component.ts
import { Component } from '@angular/core';

export interface Course {
  image: string;
  badge: string;
  badgeClass: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  duration: string;
  students: string;
  rating: string;
  price: string;
}

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
  standalone: false,
})
export class CoursesComponent {
  courses: Course[] = [
    { image: 'assets/images/course-img-1.jpg', badge: 'Development', badgeClass: 'bg-warning', title: 'Web Development Bootcamp', instructor: 'Trisha leo', instructorAvatar: 'assets/images/avatar/avatar-1.jpg', duration: '12 weeks', students: '2.4K', rating: '4.9', price: '$49' },
    { image: 'assets/images/course-img-2.jpg', badge: 'Design', badgeClass: 'bg-danger', title: 'UI/UX Design Masterclass', instructor: 'Sarah Johnson', instructorAvatar: 'assets/images/avatar/avatar-2.jpg', duration: '8 weeks', students: '1.8K', rating: '4.8', price: '$79' },
    { image: 'assets/images/course-img-3.jpg', badge: 'Data Science', badgeClass: 'bg-info', title: 'Data Science & Analytics', instructor: 'Mike Chen', instructorAvatar: 'assets/images/avatar/avatar-3.jpg', duration: '16 weeks', students: '3.2K', rating: '4.9', price: '$129' },
    { image: 'assets/images/course-img-4.jpg', badge: 'Marketing', badgeClass: 'bg-success', title: 'Digital Marketing Pro', instructor: 'Emma Davis', instructorAvatar: 'assets/images/avatar/avatar-4.jpg', duration: '6 weeks', students: '1.5K', rating: '4.7', price: '$69' },
  ];
}