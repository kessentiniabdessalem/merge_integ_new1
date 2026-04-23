import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
    standalone: false,
})
export class AdminDashboardComponent {
    stats = [
        { label: 'Total Users', value: '12,847', icon: 'ti ti-users', trend: '+12.5%', trendUp: true, color: '#6366f1' },
        { label: 'Active Courses', value: '284', icon: 'ti ti-book', trend: '+8.2%', trendUp: true, color: '#10b981' },
        { label: 'Upcoming Events', value: '42', icon: 'ti ti-calendar-event', trend: '+23.1%', trendUp: true, color: '#f59e0b' },
        { label: 'Revenue', value: '$48,290', icon: 'ti ti-currency-dollar', trend: '-3.4%', trendUp: false, color: '#ef4444' },
    ];

    recentActivity = [
        { action: 'New user registered', user: 'Sarah Johnson', time: '2 minutes ago', icon: 'ti ti-user-plus', color: '#6366f1' },
        { action: 'Course published', user: 'Mark Davis', time: '15 minutes ago', icon: 'ti ti-book-upload', color: '#10b981' },
        { action: 'Event created', user: 'Emily Chen', time: '1 hour ago', icon: 'ti ti-calendar-plus', color: '#f59e0b' },
        { action: 'Payment received', user: 'Alex Rivera', time: '2 hours ago', icon: 'ti ti-cash', color: '#10b981' },
        { action: 'Course completed', user: 'Jordan Lee', time: '3 hours ago', icon: 'ti ti-certificate', color: '#6366f1' },
        { action: 'User deactivated', user: 'Chris Park', time: '5 hours ago', icon: 'ti ti-user-minus', color: '#ef4444' },
    ];

    quickActions = [
        { label: 'Add New User', icon: 'ti ti-user-plus', link: '/admin/users' },
        { label: 'Create Course', icon: 'ti ti-plus', link: '/admin/courses' },
        { label: 'Schedule Event', icon: 'ti ti-calendar-plus', link: '/admin/events' },
    ];
}
