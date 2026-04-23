import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseService, CourseDto } from '../services/course.service';

// ─── Module / Lesson interfaces ─────────────────────────────────────────────

export interface Lesson {
  id: number;
  moduleId: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  videoUrl?: string;
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes?: number;
  lessons: Lesson[];
}

// Course interface aligned with backend CourseResponse DTO
export interface Course {
  id: number;
  title: string;
  category: string;       // widened from union — backend accepts any string
  level: string;          // widened from union — backend accepts any string
  description?: string;   // nullable in backend
  duration?: number;      // minutes (integer) — converted to/from display string in components
  price?: number;
  teacher?: string;
  image?: string;         // nullable in backend
  thumbnail?: string;
  studentsCount?: number; // was 'students' — renamed to match backend
  createdAt?: string;     // ISO string from backend LocalDateTime
  modules?: CourseModule[];
}

export interface Event {
  id: number;
  title: string;
  category: 'Workshop' | 'Competition' | 'Webinar' | 'Cultural Event';
  date: Date;
  time: string;
  location: string;
  maxParticipants: number;
  description: string;
  image: string;
  createdAt: Date;
}

export interface Club {
  id: number;
  name: string;
  category: 'Speaking Club' | 'Debate Club' | 'Writing Club' | 'Culture Club';
  schedule: string;
  maxMembers: number;
  description: string;
  image: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private courseService: CourseService) {}

  // ─── Course methods — backed by real HTTP API ────────────────────────────

  /** Maps CourseDto (from HTTP) to the shared Course interface */
  private fromDto(dto: CourseDto): Course {
    return {
      id:            dto.id,
      title:         dto.title,
      category:      dto.category,
      level:         dto.level,
      description:   dto.description,
      duration:      dto.duration,
      price:         dto.price,
      teacher:       dto.teacher,
      image:         dto.image,
      thumbnail:     dto.thumbnail,
      studentsCount: dto.studentsCount,
      createdAt:     dto.createdAt,
      modules:       dto.modules as any,
    };
  }

  getCourses(): Observable<Course[]> {
    return new Observable(observer => {
      this.courseService.list().subscribe({
        next: dtos => observer.next(dtos.map(d => this.fromDto(d))),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }

  getCourseById(id: number): Observable<Course> {
    return new Observable(observer => {
      this.courseService.get(id).subscribe({
        next: dto => observer.next(this.fromDto(dto)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }

  addCourse(course: Partial<Course>): Observable<Course> {
    return new Observable(observer => {
      this.courseService.create(course).subscribe({
        next: dto => observer.next(this.fromDto(dto)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }

  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    return new Observable(observer => {
      this.courseService.update(id, course).subscribe({
        next: dto => observer.next(this.fromDto(dto)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }

  deleteCourse(id: number): Observable<void> {
    return this.courseService.delete(id);
  }

  /** Convert level code to human-readable label */
  getCourseLevelLabel(level: string): string {
    const levelMap: Record<string, string> = {
      'A1': 'Beginner',
      'A2': 'Elementary',
      'B1': 'Intermediate',
      'B2': 'Upper Intermediate',
      'C1': 'Advanced',
      'C2': 'Proficient'
    };
    return levelMap[level] || level;
  }

  // Events mock data
  private eventsSignal = signal<Event[]>([
    {
      id: 1,
      title: 'English Speaking Competition 2024',
      category: 'Competition',
      date: new Date('2024-06-15'),
      time: '14:00',
      location: 'Main Auditorium',
      maxParticipants: 50,
      description: 'Annual English speaking competition for all levels. Show off your eloquence!',
      image: 'assets/images/course-img-1.jpg',
      createdAt: new Date('2024-05-01')
    },
    {
      id: 2,
      title: 'Webinar: Study Abroad Tips',
      category: 'Webinar',
      date: new Date('2024-06-20'),
      time: '18:00',
      location: 'Online',
      maxParticipants: 200,
      description: 'Learn from successful students about studying in English-speaking countries.',
      image: 'assets/images/course-img-2.jpg',
      createdAt: new Date('2024-05-10')
    },
    {
      id: 3,
      title: 'Cultural Exchange Evening',
      category: 'Cultural Event',
      date: new Date('2024-07-01'),
      time: '19:00',
      location: 'Campus Hall',
      maxParticipants: 100,
      description: 'Experience different cultures through food, music, and presentations.',
      image: 'assets/images/course-img-3.jpg',
      createdAt: new Date('2024-05-15')
    },
    {
      id: 4,
      title: 'Writing Workshop: Creative Expression',
      category: 'Workshop',
      date: new Date('2024-07-10'),
      time: '15:00',
      location: 'Room 201',
      maxParticipants: 30,
      description: 'Improve your creative writing skills in English with expert guidance.',
      image: 'assets/images/course-img-4.jpg',
      createdAt: new Date('2024-05-20')
    },
    {
      id: 5,
      title: 'Debate Championship',
      category: 'Competition',
      date: new Date('2024-07-25'),
      time: '09:00',
      location: 'Conference Center',
      maxParticipants: 40,
      description: 'Test your debate skills against other learners in this exciting competition.',
      image: 'assets/images/course-img-1.jpg',
      createdAt: new Date('2024-06-01')
    }
  ]);

  // Clubs mock data
  private clubsSignal = signal<Club[]>([
    {
      id: 1,
      name: 'Monday Speaking Club',
      category: 'Speaking Club',
      schedule: 'Every Monday, 18:00-19:30',
      maxMembers: 15,
      description: 'Practice conversational English in a friendly, supportive environment.',
      image: 'assets/images/course-img-1.jpg',
      createdAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Wednesday Debate Club',
      category: 'Debate Club',
      schedule: 'Every Wednesday, 17:00-18:30',
      maxMembers: 12,
      description: 'Develop critical thinking and argumentation skills through debates.',
      image: 'assets/images/course-img-2.jpg',
      createdAt: new Date('2024-01-15')
    },
    {
      id: 3,
      name: 'Friday Writing Circle',
      category: 'Writing Club',
      schedule: 'Every Friday, 16:00-17:30',
      maxMembers: 10,
      description: 'Share your writing and get feedback from peers and mentors.',
      image: 'assets/images/course-img-3.jpg',
      createdAt: new Date('2024-02-01')
    },
    {
      id: 4,
      name: 'Saturday Culture Club',
      category: 'Culture Club',
      schedule: 'Every Saturday, 14:00-16:00',
      maxMembers: 20,
      description: 'Explore English-speaking cultures through movies, music, and discussions.',
      image: 'assets/images/course-img-4.jpg',
      createdAt: new Date('2024-02-15')
    },
    {
      id: 5,
      name: 'Thursday Business English Club',
      category: 'Speaking Club',
      schedule: 'Every Thursday, 19:00-20:30',
      maxMembers: 15,
      description: 'Practice business vocabulary and professional communication.',
      image: 'assets/images/course-img-1.jpg',
      createdAt: new Date('2024-03-01')
    }
  ]);

  // Signals for reactive updates (events and clubs only)
  events = this.eventsSignal.asReadonly();
  clubs = this.clubsSignal.asReadonly();

  // Event CRUD operations
  getEvents(): Event[] {
    return this.eventsSignal();
  }

  getEventById(id: number): Event | undefined {
    return this.eventsSignal().find(e => e.id === id);
  }

  addEvent(event: Omit<Event, 'id' | 'createdAt'>): Event {
    const newEvent: Event = {
      ...event,
      id: Math.max(...this.eventsSignal().map(e => e.id)) + 1,
      createdAt: new Date()
    };
    this.eventsSignal.update(events => [...events, newEvent]);
    return newEvent;
  }

  updateEvent(id: number, event: Partial<Event>): void {
    this.eventsSignal.update(events => 
      events.map(e => e.id === id ? { ...e, ...event } : e)
    );
  }

  deleteEvent(id: number): void {
    this.eventsSignal.update(events => events.filter(e => e.id !== id));
  }

  // Club CRUD operations
  getClubs(): Club[] {
    return this.clubsSignal();
  }

  getClubById(id: number): Club | undefined {
    return this.clubsSignal().find(c => c.id === id);
  }

  addClub(club: Omit<Club, 'id' | 'createdAt'>): Club {
    const newClub: Club = {
      ...club,
      id: Math.max(...this.clubsSignal().map(c => c.id)) + 1,
      createdAt: new Date()
    };
    this.clubsSignal.update(clubs => [...clubs, newClub]);
    return newClub;
  }

  updateClub(id: number, club: Partial<Club>): void {
    this.clubsSignal.update(clubs => 
      clubs.map(c => c.id === id ? { ...c, ...club } : c)
    );
  }

  deleteClub(id: number): void {
    this.clubsSignal.update(clubs => clubs.filter(c => c.id !== id));
  }
}
