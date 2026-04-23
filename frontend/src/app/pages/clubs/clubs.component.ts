import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Club {
  id: number;
  name: string;
  description: string;
  members: number;
  level: string;
  meetingSchedule: string;
  avatar: string;
}

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.scss',
  standalone: false,
})
export class ClubsComponent {
  clubs: Club[] = [
    {
      id: 1,
      name: 'Conversation Club',
      description: 'Practice speaking with native speakers and fellow learners',
      members: 45,
      level: 'B1-C2',
      meetingSchedule: 'Tue & Thu, 6 PM',
      avatar: 'assets/images/avatar/avatar-1.jpg',
    },
    {
      id: 2,
      name: 'Reading Circle',
      description: 'Discuss books and articles in the target language',
      members: 28,
      level: 'A2-B2',
      meetingSchedule: 'Mon & Wed, 5 PM',
      avatar: 'assets/images/avatar/avatar-2.jpg',
    },
    {
      id: 3,
      name: 'Writing Workshop',
      description: 'Improve your writing skills with peer feedback',
      members: 22,
      level: 'B1-C1',
      meetingSchedule: 'Fri, 4 PM',
      avatar: 'assets/images/avatar/avatar-3.jpg',
    },
  ];

  joinClub(club: Club): void {
    console.log('Joined club:', club.name);
  }

  viewClub(club: Club): void {
    console.log('View club:', club.name);
  }
}
