import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-courses',
    templateUrl: './admin-courses.component.html',
    styleUrl: './admin-courses.component.scss',
    standalone: false,
})
export class AdminCoursesComponent {
    searchTerm = '';
    filterCategory = '';

    courses = [
        { id: 1, title: 'Angular Fundamentals', category: 'Web Development', instructor: 'Mark Davis', price: '$49.99', students: 1284, status: 'Published' },
        { id: 2, title: 'Machine Learning A-Z', category: 'Data Science', instructor: 'Emily Chen', price: '$79.99', students: 892, status: 'Published' },
        { id: 3, title: 'UI/UX Design Masterclass', category: 'Design', instructor: 'Sarah Johnson', price: '$59.99', students: 567, status: 'Published' },
        { id: 4, title: 'Node.js Backend Development', category: 'Web Development', instructor: 'Alex Rivera', price: '$69.99', students: 0, status: 'Draft' },
        { id: 5, title: 'Python for Data Analysis', category: 'Data Science', instructor: 'Jordan Lee', price: '$39.99', students: 2105, status: 'Published' },
        { id: 6, title: 'Mobile App Development', category: 'Mobile', instructor: 'Chris Park', price: '$89.99', students: 438, status: 'Published' },
        { id: 7, title: 'Cybersecurity Essentials', category: 'Security', instructor: 'Taylor Morgan', price: '$54.99', students: 0, status: 'Archived' },
        { id: 8, title: 'Cloud Computing with AWS', category: 'DevOps', instructor: 'Jamie Foster', price: '$74.99', students: 0, status: 'Draft' },
    ];

    get filteredCourses() {
        return this.courses.filter(c => {
            const matchSearch = !this.searchTerm || c.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || c.instructor.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchCategory = !this.filterCategory || c.category === this.filterCategory;
            return matchSearch && matchCategory;
        });
    }

    get categories(): string[] {
        return [...new Set(this.courses.map(c => c.category))];
    }
}
