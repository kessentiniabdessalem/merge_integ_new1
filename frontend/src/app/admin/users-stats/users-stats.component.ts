import { Component, OnInit } from '@angular/core';
import { AdminManagementService, UserProfile } from '../../services/admin-management.service';

type RoleStat = { role: string; count: number; percent: number };

@Component({
  selector: 'app-users-stats',
  standalone: false,
  templateUrl: './users-stats.component.html',
  styleUrls: ['./users-stats.component.css']
})
export class UsersStatsComponent implements OnInit {
  loading = false;
  users: UserProfile[] = [];

  stats: RoleStat[] = [];
  total = 0;

  constructor(private adminService: AdminManagementService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.computeStats();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.users = [];
        this.stats = [];
        this.total = 0;
        this.loading = false;
      }
    });
  }

  private computeStats() {
    const map = new Map<string, number>();

    for (const u of this.users) {
      const role = (u.role && u.role.trim().length > 0) ? u.role : 'USER';
      map.set(role, (map.get(role) ?? 0) + 1);
    }

    this.total = this.users.length;

    const rows = Array.from(map.entries())
      .map(([role, count]) => ({
        role,
        count,
        percent: this.total === 0 ? 0 : Math.round((count * 10000) / this.total) / 100
      }))
      .sort((a, b) => b.count - a.count);

    this.stats = rows;
  }

  width(percent: number): string {
    return `${percent}%`;
  }
}
