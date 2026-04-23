import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { resolveAvatarUrl } from '../../utils/avatar-url.util';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrl: './admin-layout.component.scss',
    standalone: false,
})
export class AdminLayoutComponent {
    sidebarCollapsed = false;
    currentDate = new Date();

    constructor(public readonly session: SessionService) {}

    toggleSidebar(): void {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    /** Chemins absolus sous `/admin` (équivalent ang : backoffice/users, admins/add, users-stats). */
    navItems: { path: string; icon: string; label: string; linkExact?: boolean }[] = [
        { path: '/admin/dashboard', icon: 'ti ti-dashboard', label: 'Dashboard', linkExact: true },
        { path: '/admin/users', icon: 'ti ti-users', label: 'Users' },
        { path: '/admin/admins/create', icon: 'ti ti-user-plus', label: 'Add Admin' },
        { path: '/admin/tutors/create', icon: 'ti ti-user-plus', label: 'Add Tutor' },
        { path: '/admin/tutors', icon: 'ti ti-chalkboard', label: 'Tutors' },
        { path: '/admin/users-stats', icon: 'ti ti-chart-bar', label: 'Role Statistics' },
        { path: '/admin/courses', icon: 'ti ti-book', label: 'Courses' },
        { path: '/admin/events', icon: 'ti ti-calendar-event', label: 'Events' },
        { path: '/admin/quizzes', icon: 'ti ti-help-circle', label: 'Quizzes' },
        { path: '/admin/feedbacks', icon: 'ti ti-message-star', label: 'Feedbacks' },
        { path: '/admin/jobs', icon: 'ti ti-briefcase', label: 'Jobs' },
        { path: '/admin/meetings', icon: 'ti ti-calendar-check', label: 'Meetings' },
        { path: '/admin/ratings', icon: 'ti ti-star', label: 'Ratings' },
        /** Page publique (hors /admin) : entretien oral FR/EN — même route que le site étudiant */
        { path: '/oral-interview', icon: 'ti ti-microphone', label: 'Oral test FR/EN' },
        { path: '/admin/profile', icon: 'ti ti-id', label: 'My Profile' },
    ];

    avatarSrc(user: { avatarUrl?: string } | null): string | null {
        return resolveAvatarUrl(user?.avatarUrl ?? null);
    }

    logout(): void {
        this.session.clear();
        window.location.href = '/';
    }
}
