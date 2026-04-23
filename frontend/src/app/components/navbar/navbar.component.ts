import { Component, signal, HostListener, inject, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { SessionService, SessionUser } from '../../services/session.service';
import { JobNotificationService, JobNotification } from '../../services/job-notification.service';
import { resolveAvatarUrl } from '../../utils/avatar-url.util';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class NavbarComponent implements OnInit, OnDestroy {
  activeSection = signal<string>('hero');
  currentUser: SessionUser | null = null;
  private sessionSub?: Subscription;
  private pollSub?: Subscription;

  unreadCount = 0;
  notifications: JobNotification[] = [];
  notifOpen = false;

  private router = inject(Router);
  private session = inject(SessionService);
  private notifService = inject(JobNotificationService);
  private elRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.notifOpen && !this.elRef.nativeElement.querySelector('.notif-bell')?.contains(event.target)) {
      this.notifOpen = false;
    }
  }

  ngOnInit(): void {
    this.sessionSub = this.session.user$.subscribe(u => {
      this.currentUser = u;
      if (u) {
        this.startPolling();
      } else {
        this.stopPolling();
        this.unreadCount = 0;
        this.notifications = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.sessionSub?.unsubscribe();
    this.stopPolling();
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollSub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.notifService.getMyNotifications())
    ).subscribe({
      next: (notifs) => {
        this.notifications = notifs.slice(0, 8);
        this.unreadCount = notifs.filter(n => !n.read).length;
      },
      error: () => {}
    });
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  toggleNotifDropdown(): void {
    this.notifOpen = !this.notifOpen;
  }

  closeNotifDropdown(): void {
    this.notifOpen = false;
  }

  markAllRead(): void {
    this.notifService.markAllAsRead().subscribe(() => {
      this.notifications = this.notifications.map(n => ({ ...n, read: true }));
      this.unreadCount = 0;
    });
  }

  markOneRead(notif: JobNotification): void {
    if (notif.read) return;
    this.notifService.markAsRead(notif.id).subscribe(() => {
      notif.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  logout(): void {
    this.session.clear();
    window.location.href = '/';
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const sections = ['hero', 'courses', 'mentor', 'group', 'testimonials', 'pricing'];
    const scrollPosition = window.pageYOffset + 100;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetHeight = element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          this.activeSection.set(section);
          break;
        }
      }
    }
  }

  scrollTo(sectionId: string) {
    if (this.router.url !== '/' && this.router.url !== '') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.scrollToSection(sectionId);
        }, 100);
      });
    } else {
      this.scrollToSection(sectionId);
    }
  }

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      this.activeSection.set(sectionId);
    }
  }

  // Navigation vers une page
  navigateToPage(route: string) {
    this.router.navigateByUrl(route.startsWith('/') ? route : `/${route}`);
  }

  onBrandClick(event: Event): void {
    event.preventDefault();
    this.router.navigateByUrl('/');
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }

  isActiveRoute(path: string): boolean {
    const url = this.router.url.split('?')[0];
    if (path === '/') return url === '/' || url === '';
    return url.startsWith(path);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login'], { queryParams: { role: 'student' } });
  }

  navigateToSignup() {
    this.router.navigate(['/auth/signup'], { queryParams: { role: 'student' } });
  }

  /** Avatar affichable (chemins /uploads/... proxifiés vers le user-service en dev). */
  avatarSrc(): string | null {
    return resolveAvatarUrl(this.currentUser?.avatarUrl);
  }
}