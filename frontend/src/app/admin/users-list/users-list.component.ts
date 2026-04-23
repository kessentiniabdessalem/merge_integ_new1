import { Component, OnInit } from '@angular/core';
import { AdminManagementService, UserProfile } from '../../services/admin-management.service';
import { resolveAvatarUrl } from '../../utils/avatar-url.util';

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  users: UserProfile[] = [];
  loading = false;

  // Search
  q = '';

  // Pagination
  pageSize = 5;
  page = 1;

  // Sorting
  sortField: 'id' | 'name' | 'email' = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(private adminService: AdminManagementService) {}

  ngOnInit(): void {
    this.reload();
  }

  setSort(field: 'id' | 'name' | 'email') {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortField = field;
    this.sortDir = 'asc';
  }

  get filteredUsers(): UserProfile[] {
    const s = this.q.trim().toLowerCase();

    let data = this.users.filter(u =>
      !s ||
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(s) ||
      (u.email ?? '').toLowerCase().includes(s)
    );

    data = [...data].sort((a, b) => {
      let v1: any;
      let v2: any;

      if (this.sortField === 'id') {
        v1 = a.id;
        v2 = b.id;
      } else if (this.sortField === 'email') {
        v1 = (a.email ?? '').toLowerCase();
        v2 = (b.email ?? '').toLowerCase();
      } else {
        v1 = `${a.firstName ?? ''} ${a.lastName ?? ''}`.toLowerCase();
        v2 = `${b.firstName ?? ''} ${b.lastName ?? ''}`.toLowerCase();
      }

      if (v1 < v2) return this.sortDir === 'asc' ? -1 : 1;
      if (v1 > v2) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }

  get pagedUsers(): UserProfile[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  setPage(p: number) {
    if (p < 1) p = 1;
    if (p > this.totalPages) p = this.totalPages;
    this.page = p;
  }

  prevPage() { this.setPage(this.page - 1); }
  nextPage() { this.setPage(this.page + 1); }

  get fromIndex(): number {
    if (this.filteredUsers.length === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get toIndex(): number {
    return Math.min(this.page * this.pageSize, this.filteredUsers.length);
  }

  getAvatar(u: UserProfile): string | null {
    return resolveAvatarUrl(u.avatarUrl ?? null);
  }

  onAvatarError(u: UserProfile) {
    u.avatarUrl = undefined;
  }

  reload() {
    this.loading = true;

    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.page = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.users = [];
        this.page = 1;
        this.loading = false;
      }
    });
  }

  delete(u: UserProfile) {
    if (!confirm(`Delete ${u.email}?`)) return;

    this.adminService.deleteUser(u.id).subscribe({
      next: () => {
        this.users = this.users.filter(x => x.id !== u.id);
        if (this.page > this.totalPages) this.page = this.totalPages;
      },
      error: (err) => console.error(err)
    });
  }
}
