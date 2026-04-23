export enum EventCategory {
  WORKSHOP = 'WORKSHOP',
  WEBINAR = 'WEBINAR',
  CONFERENCE = 'CONFERENCE',
  TRAINING = 'TRAINING',
  EXAM_PREPARATION = 'EXAM_PREPARATION',
  BUSINESS_ENGLISH = 'BUSINESS_ENGLISH',
  CULTURAL_EVENT = 'CULTURAL_EVENT'
}

export enum EventStatus {
  Upcoming = 'Upcoming',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface Organizer {
  id: number;
  name?: string;
}

export interface Participant {
  id: number;
  name?: string;
  fullName?: string;
  email?: string;
  attended?: boolean;
}

export interface Event {
  id: number;
  name: string;
  category: EventCategory;
  status: EventStatus;
  date: string; // LocalDate
  placesLimit: number;
  description: string;
  location: string;
  photoUrl: string;
  reservedPlaces: number;
  organizerFirstName?: string;
  organizerLastName?: string;
  organizer?: Organizer;
  participants?: Participant[];
}
