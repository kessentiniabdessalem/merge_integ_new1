import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  link: string;
}

@Component({
  selector: 'app-features',
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
  standalone: false,
})
export class FeaturesComponent {
  features: Feature[] = [
    {
      icon: 'video',
      title: 'Video Lessons',
      description: 'Access hundreds of HD video lessons taught by certified native speakers. Learn anytime, anywhere.',
      gradient: 'linear-gradient(135deg, #3D3D60 0%, #5a5a85 100%)',
      link: '/courses'
    },
    {
      icon: 'users',
      title: 'Live Classes',
      description: 'Join interactive live sessions with expert tutors. Practice speaking in real-time with peers.',
      gradient: 'linear-gradient(135deg, #2D5757 0%, #3d7a7a 100%)',
      link: '/events'
    },
    {
      icon: 'certificate',
      title: 'Certificates',
      description: 'Earn recognized certificates upon completion. Boost your resume and career prospects.',
      gradient: 'linear-gradient(135deg, #F6BD60 0%, #e5a83d 100%)',
      link: '/certificate'
    },
    {
      icon: 'brain',
      title: 'AI Quizzes',
      description: 'Test your knowledge with adaptive AI-powered quizzes that personalize to your level.',
      gradient: 'linear-gradient(135deg, #C84630 0%, #d96a5a 100%)',
      link: '/quiz'
    },
    {
      icon: 'calendar',
      title: 'Flexible Schedule',
      description: 'Book sessions that fit your lifestyle. Learn at your own pace with 24/7 access.',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      link: '/schedule'
    },
    {
      icon: 'chat',
      title: 'Community Chat',
      description: 'Connect with learners worldwide. Practice in conversation clubs and group discussions.',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      link: '/messenger'
    },
    {
      icon: 'chart',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and personalized insights.',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      link: '/dashboard'
    },
    {
      icon: 'book',
      title: 'Resources Library',
      description: 'Access PDFs, e-books, and study materials. Everything you need in one place.',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      link: '/courses'
    },
  ];
}
