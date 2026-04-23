import { Component } from '@angular/core';

interface MentorItem {
  avatar: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-mentor',
  templateUrl: './mentor.component.html',
  styleUrl: './mentor.component.scss',
  standalone: false,
})
export class MentorComponent {
  mentors: MentorItem[] = [
    { avatar: 'assets/images/avatar/avatar-1.jpg', name: 'Trisha Leo', role: 'Web Development' },
    { avatar: 'assets/images/avatar/avatar-2.jpg', name: 'Sarah Johnson', role: 'UI/UX Design' },
    { avatar: 'assets/images/avatar/avatar-3.jpg', name: 'Mike Chen', role: 'Data Science' },
    { avatar: 'assets/images/avatar/avatar-4.jpg', name: 'Emma Davis', role: 'Digital Marketing' },
    { avatar: 'assets/images/avatar/avatar-5.jpg', name: 'James Wilson', role: 'Business' },
    { avatar: 'assets/images/avatar/avatar-6.jpg', name: 'Anna Brown', role: 'Photography' },
  ];
}
