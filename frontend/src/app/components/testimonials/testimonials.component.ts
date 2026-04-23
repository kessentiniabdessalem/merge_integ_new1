import { Component } from '@angular/core';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
  standalone: false,
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    { quote: 'LearnHub transformed my career. The courses are top-notch and the mentors are incredibly supportive.', name: 'Alex Morgan', role: 'Software Developer', avatar: 'assets/images/avatar/avatar-1.jpg' },
    { quote: 'Best investment I\'ve made in my education. The community and content are outstanding.', name: 'Jordan Lee', role: 'UX Designer', avatar: 'assets/images/avatar/avatar-2.jpg' },
    { quote: 'I landed my dream job within 6 months of completing the Data Science track. Highly recommend!', name: 'Sam Taylor', role: 'Data Analyst', avatar: 'assets/images/avatar/avatar-3.jpg' },
  ];
}
