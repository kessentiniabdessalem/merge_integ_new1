import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Club } from '../../../models/club.model';
import { ClubService } from '../../../services/club.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-client-club-details',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    @if (club) {
      <div class="client-page">
        <div class="club-hero">
          <div class="container">
            <div class="hero-content">
              <div class="breadcrumb">
                <a routerLink="/clubs">Clubs</a>
                <i class="ti ti-chevron-right"></i>
                <span>{{ club.category }}</span>
              </div>
              <span class="club-badge" [attr.data-category]="club.category">{{ club.category }}</span>
              <h1 class="club-title">{{ club.name }}</h1>
              <p class="club-description">{{ club.description }}</p>
              <div class="club-meta">
                <div class="meta-block">
                  <i class="ti ti-clock"></i>
                  <div>
                    <span class="meta-label">Schedule</span>
                    <span class="meta-value">{{ club.schedule }}</span>
                  </div>
                </div>
                <div class="meta-block">
                  <i class="ti ti-users"></i>
                  <div>
                    <span class="meta-label">Members</span>
                    <span class="meta-value">{{ club.maxMembers }} max</span>
                  </div>
                </div>
                <div class="meta-block">
                  <i class="ti ti-calendar"></i>
                  <div>
                    <span class="meta-label">Started</span>
                    <span class="meta-value">{{ club.createdAt | date:'mediumDate' }}</span>
                  </div>
                </div>
              </div>
              <div class="hero-actions">
                <button class="btn-join-now" (click)="toggleJoin()">{{ isJoined ? 'Leave Club' : 'Join Club' }}</button>
              </div>
            </div>
            <div class="hero-image">
              <img [src]="club.image" [alt]="club.name">
            </div>
          </div>
        </div>
        <div class="container">
          <div class="club-content">
            <div class="content-main">
              <section class="content-section">
                <h2>About This Club</h2>
                <p>{{ club.description }}</p>
                <p>Our English clubs provide a supportive and fun environment for learners to practice their language skills. Whether you're looking to improve your speaking confidence, make new friends, or explore English through different activities, our clubs have something for everyone.</p>
              </section>
              <section class="content-section">
                <h2>What You'll Get</h2>
                <div class="benefits-grid">
                  <div class="benefit-card">
                    <i class="ti ti-messages"></i>
                    <h4>Speaking Practice</h4>
                    <p>Regular opportunities to practice English conversation</p>
                  </div>
                  <div class="benefit-card">
                    <i class="ti ti-friends"></i>
                    <h4>Community</h4>
                    <p>Connect with like-minded English learners</p>
                  </div>
                  <div class="benefit-card">
                    <i class="ti ti-star"></i>
                    <h4>Expert Guidance</h4>
                    <p>Facilitated by experienced English instructors</p>
                  </div>
                  <div class="benefit-card">
                    <i class="ti ti-certificate"></i>
                    <h4>Certificates</h4>
                    <p>Earn certificates for your participation</p>
                  </div>
                </div>
              </section>
              <section class="content-section">
                <h2>Upcoming Sessions</h2>
                <div class="sessions-list">
                  @for (session of upcomingSessions; track session.id) {
                    <div class="session-item">
                      <div class="session-date">
                        <span class="day">{{ session.day }}</span>
                        <span class="weekday">{{ session.weekday }}</span>
                      </div>
                      <div class="session-info">
                        <h4>{{ session.title }}</h4>
                        <span><i class="ti ti-clock"></i> {{ session.time }}</span>
                        <span><i class="ti ti-user"></i> {{ session.host }}</span>
                      </div>
                      <button class="btn-session">RSVP</button>
                    </div>
                  }
                </div>
              </section>
            </div>
            <div class="content-sidebar">
              <div class="sidebar-card">
                <h3>Club Information</h3>
                <ul class="info-list">
                  <li><i class="ti ti-calendar"></i> <span>Every {{ club.schedule }}</span></li>
                  <li><i class="ti ti-users"></i> <span>{{ club.maxMembers }} members max</span></li>
                  <li><i class="ti ti-world"></i> <span>Online & In-Person</span></li>
                  <li><i class="ti ti-star"></i> <span>All levels welcome</span></li>
                </ul>
                <button class="btn-join-full" (click)="toggleJoin()">
                  {{ isJoined ? 'Leave Club' : 'Join Now - Free' }}
                </button>
              </div>
              <div class="sidebar-card members-card">
                <h3>Recent Members</h3>
                <div class="members-avatars">
                  @for (i of [1,2,3,4,5,6]; track i) {
                    <img [src]="'assets/images/avatar/avatar-' + i + '.jpg'" alt="Member" class="member-avatar">
                  }
                </div>
                <p class="members-count">Join {{ club.maxMembers }}+ other members</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="not-found-page">
        <div class="not-found">
          <div class="container">
            <i class="ti ti-users"></i>
            <h2>Club Not Found</h2>
            <p>The club you're looking for doesn't exist.</p>
            <a routerLink="/clubs" class="btn-back">Browse Clubs</a>
          </div>
        </div>
      </div>
    }
    <app-footer></app-footer>
  `,
  styles: [`
    .client-page { min-height: 100vh; background: var(--color-background); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    .club-hero { background: linear-gradient(135deg, var(--color-primary) 0%, #2a2a4a 100%); padding: 60px 0; }
    .club-hero .container { display: grid; grid-template-columns: 1fr 450px; gap: 60px; align-items: center; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 14px; a { color: rgba(255,255,255,0.8); text-decoration: none; &:hover { color: var(--color-accent); } } span { color: rgba(255,255,255,0.8); } i { font-size: 12px; color: rgba(255,255,255,0.5); } }
    .club-badge { display: inline-block; padding: 8px 18px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px; &[data-category="Speaking Club"] { background: #3b82f6; color: #fff; } &[data-category="Debate Club"] { background: var(--color-cta); color: #fff; } &[data-category="Writing Club"] { background: #10b981; color: #fff; } &[data-category="Culture Club"] { background: var(--color-accent); color: #5a4a00; } }
    .club-title { font-family: var(--font-family); font-size: 38px; font-weight: 800; color: #fff; margin: 0 0 16px; line-height: 1.2; }
    .club-description { font-size: 18px; color: rgba(255,255,255,0.9); margin: 0 0 24px; line-height: 1.6; }
    .club-meta { display: flex; gap: 32px; margin-bottom: 32px; flex-wrap: wrap; }
    .meta-block { display: flex; align-items: flex-start; gap: 12px; i { font-size: 24px; color: var(--color-accent); margin-top: 2px; } div { display: flex; flex-direction: column; } }
    .meta-label { font-size: 12px; color: rgba(255,255,255,0.6); text-transform: uppercase; }
    .meta-value { font-size: 15px; font-weight: 600; color: #fff; }
    .btn-join-now { padding: 16px 32px; background: var(--color-accent); color: var(--color-primary); border: none; border-radius: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; &:hover { transform: scale(1.05); box-shadow: 0 10px 30px rgba(246, 189, 96, 0.4); } }
    .hero-image { border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); img { width: 100%; height: 350px; object-fit: cover; } }
    .club-content { display: grid; grid-template-columns: 1fr 340px; gap: 40px; padding: 60px 0; }
    .content-section { background: var(--color-white); border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: var(--shadow-card); h2 { font-size: 24px; font-weight: 700; color: var(--color-primary); margin: 0 0 20px; } p { font-size: 15px; line-height: 1.7; color: var(--color-gray-600); margin: 0 0 16px; &:last-child { margin-bottom: 0; } } }
    .benefits-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .benefit-card { padding: 24px; background: var(--color-background); border-radius: 16px; text-align: center; i { font-size: 36px; color: var(--color-secondary); margin-bottom: 16px; } h4 { font-size: 16px; font-weight: 700; color: var(--color-primary); margin: 0 0 8px; } p { font-size: 13px; color: var(--color-gray-500); margin: 0; } }
    .sessions-list { display: flex; flex-direction: column; gap: 12px; }
    .session-item { display: flex; gap: 16px; padding: 16px; background: var(--color-background); border-radius: 12px; align-items: center; }
    .session-date { width: 60px; text-align: center; .day { display: block; font-size: 24px; font-weight: 800; color: var(--color-primary); } .weekday { display: block; font-size: 12px; color: var(--color-gray-500); text-transform: uppercase; } }
    .session-info { flex: 1; h4 { font-size: 15px; font-weight: 600; color: var(--color-primary); margin: 0 0 4px; } span { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: var(--color-gray-500); margin-right: 16px; i { font-size: 14px; } } }
    .btn-session { padding: 8px 16px; background: var(--color-secondary); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .sidebar-card { background: var(--color-white); border-radius: 20px; padding: 28px; box-shadow: var(--shadow-card); margin-bottom: 24px; h3 { font-size: 18px; font-weight: 700; color: var(--color-primary); margin: 0 0 20px; } }
    .info-list { list-style: none; padding: 0; margin: 0 0 20px; li { display: flex; align-items: center; gap: 12px; padding: 10px 0; font-size: 14px; color: var(--color-gray-600); border-bottom: 1px solid rgba(61,61,96,0.06); &:last-child { border-bottom: none; } i { font-size: 18px; color: var(--color-secondary); } } }
    .btn-join-full { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--color-primary), #2a2a4a); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; &:hover { transform: scale(1.02); box-shadow: 0 8px 25px rgba(61,61,96,0.35); } }
    .members-card { text-align: center; }
    .members-avatars { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .member-avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--color-white); object-fit: cover; }
    .members-count { font-size: 13px; color: var(--color-gray-500); margin: 0; }
    .not-found-page { min-height: 100vh; background: var(--color-background); }
    .not-found { text-align: center; padding: 100px 20px; i { font-size: 80px; color: var(--color-gray-300); margin-bottom: 24px; } h2 { font-size: 28px; color: var(--color-primary); margin: 0 0 12px; } p { color: var(--color-gray-500); margin: 0 0 24px; } }
    .btn-back { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--color-primary); color: #fff; border-radius: 12px; text-decoration: none; font-weight: 600; }
    @media (max-width: 992px) { .club-hero .container { grid-template-columns: 1fr; } .hero-image { display: none; } .club-content { grid-template-columns: 1fr; } .benefits-grid { grid-template-columns: 1fr; } }
  `]
})
export class ClientClubDetailsComponent implements OnInit {
  private clubService = inject(ClubService);
  private route = inject(ActivatedRoute);
  club: Club | undefined;
  isJoined = false;

  upcomingSessions = [
    { id: 1, day: '20', weekday: 'Wed', title: 'Weekly Discussion', time: '6:00 PM', host: 'Sarah Johnson' },
    { id: 2, day: '22', weekday: 'Fri', title: 'Practice Session', time: '5:00 PM', host: 'Michael Chen' },
    { id: 3, day: '27', weekday: 'Wed', title: 'Group Activity', time: '6:00 PM', host: 'Emma Wilson' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clubService.getById(+id).subscribe({
        next: (club) => this.club = club,
        error: () => { this.club = undefined; }
      });
    }
  }

  toggleJoin(): void {
    this.isJoined = !this.isJoined;
  }
}
