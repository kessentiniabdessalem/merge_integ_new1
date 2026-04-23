import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-users',
    templateUrl: './admin-users.component.html',
    styleUrl: './admin-users.component.scss',
    standalone: false,
})
export class AdminUsersComponent {
    searchTerm = '';
    filterRole = '';

    users = [
        { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'Student', status: 'Active', joined: 'Jan 15, 2026', avatar: 'SJ' },
        { id: 2, name: 'Mark Davis', email: 'mark.d@email.com', role: 'Instructor', status: 'Active', joined: 'Dec 20, 2025', avatar: 'MD' },
        { id: 3, name: 'Emily Chen', email: 'emily.c@email.com', role: 'Admin', status: 'Active', joined: 'Nov 8, 2025', avatar: 'EC' },
        { id: 4, name: 'Alex Rivera', email: 'alex.r@email.com', role: 'Student', status: 'Inactive', joined: 'Oct 12, 2025', avatar: 'AR' },
        { id: 5, name: 'Jordan Lee', email: 'jordan.l@email.com', role: 'Student', status: 'Active', joined: 'Sep 5, 2025', avatar: 'JL' },
        { id: 6, name: 'Chris Park', email: 'chris.p@email.com', role: 'Instructor', status: 'Pending', joined: 'Feb 1, 2026', avatar: 'CP' },
        { id: 7, name: 'Taylor Morgan', email: 'taylor.m@email.com', role: 'Student', status: 'Active', joined: 'Aug 18, 2025', avatar: 'TM' },
        { id: 8, name: 'Jamie Foster', email: 'jamie.f@email.com', role: 'Student', status: 'Active', joined: 'Jul 22, 2025', avatar: 'JF' },
    ];

    get filteredUsers() {
        return this.users.filter(u => {
            const matchSearch = !this.searchTerm || u.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchRole = !this.filterRole || u.role === this.filterRole;
            return matchSearch && matchRole;
        });
    }
}
