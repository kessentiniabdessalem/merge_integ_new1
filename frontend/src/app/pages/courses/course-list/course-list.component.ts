import { Component } from '@angular/core';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  image: string;
  category: string;
  duration: string;
  students: string;
  rating: number;
  price: string;
  level: string;
}

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
  standalone: false,
})
export class CourseListComponent {
  
  courses: Course[] = [
    {
      id: 1,
      title: 'Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js and more',
      instructor: 'Trisha Leo',
      instructorAvatar: 'assets/images/avatar/avatar-1.jpg',
      image: 'assets/images/course-img-1.jpg',
      category: 'Development',
      duration: '12 weeks',
      students: '2.4K',
      rating: 4.9,
      price: '$49',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'UI/UX Design Masterclass',
      description: 'Master modern UI/UX design principles and tools',
      instructor: 'Sarah Johnson',
      instructorAvatar: 'assets/images/avatar/avatar-2.jpg',
      image: 'assets/images/course-img-2.jpg',
      category: 'Design',
      duration: '8 weeks',
      students: '1.8K',
      rating: 4.8,
      price: '$79',
      level: 'Intermediate'
    },
    {
      id: 3,
      title: 'Data Science & Analytics',
      description: 'Learn Python, Machine Learning, Data Visualization',
      instructor: 'Mike Chen',
      instructorAvatar: 'assets/images/avatar/avatar-3.jpg',
      image: 'assets/images/course-img-3.jpg',
      category: 'Data Science',
      duration: '16 weeks',
      students: '3.2K',
      rating: 4.9,
      price: '$129',
      level: 'Advanced'
    },
    {
      id: 4,
      title: 'Digital Marketing Pro',
      description: 'Master SEO, Social Media, Email Marketing strategies',
      instructor: 'Emma Davis',
      instructorAvatar: 'assets/images/avatar/avatar-4.jpg',
      image: 'assets/images/course-img-4.jpg',
      category: 'Marketing',
      duration: '6 weeks',
      students: '1.5K',
      rating: 4.7,
      price: '$69',
      level: 'Beginner'
    },
    {
      id: 5,
      title: 'Mobile App Development',
      description: 'Build iOS and Android apps with React Native',
      instructor: 'John Smith',
      instructorAvatar: 'assets/images/avatar/avatar-1.jpg',
      image: 'assets/images/course-img-1.jpg',
      category: 'Development',
      duration: '10 weeks',
      students: '2.1K',
      rating: 4.8,
      price: '$89',
      level: 'Intermediate'
    },
    {
      id: 6,
      title: 'Graphic Design Fundamentals',
      description: 'Learn Adobe Photoshop, Illustrator, and InDesign',
      instructor: 'Lisa Brown',
      instructorAvatar: 'assets/images/avatar/avatar-2.jpg',
      image: 'assets/images/course-img-2.jpg',
      category: 'Design',
      duration: '7 weeks',
      students: '1.9K',
      rating: 4.6,
      price: '$59',
      level: 'Beginner'
    }
  ];

  selectedCategory: string = 'All';
  selectedLevel: string = 'All';

  get filteredCourses(): Course[] {
    return this.courses.filter(course => {
      const categoryMatch = this.selectedCategory === 'All' || course.category === this.selectedCategory;
      const levelMatch = this.selectedLevel === 'All' || course.level === this.selectedLevel;
      return categoryMatch && levelMatch;
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  filterByLevel(level: string): void {
    this.selectedLevel = level;
  }
}