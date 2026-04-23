import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts; trackBy: trackById"
           class="toast-item toast-{{ t.type }}"
           (click)="dismiss(t.id)">
        <i class="ti" [ngClass]="iconFor(t.type)"></i>
        <span>{{ t.message }}</span>
        <button class="toast-close" (click)="dismiss(t.id); $event.stopPropagation()">
          <i class="ti ti-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      pointer-events: none;
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      min-width: 260px;
      max-width: 380px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      cursor: pointer;
      pointer-events: auto;
      animation: toastIn 0.3s ease;
      color: #fff;

      span { flex: 1; line-height: 1.4; }

      i.ti:first-child { font-size: 1.15rem; flex-shrink: 0; }
    }

    .toast-success { background: #22c55e; }
    .toast-error   { background: #ef4444; }
    .toast-warning { background: #f59e0b; }
    .toast-info    { background: #6b5eae; }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      padding: 0;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      &:hover { color: #fff; }
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub?: Subscription;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(t => {
      this.toasts.push(t);
      const timer = setTimeout(() => this.dismiss(t.id), 4000);
      this.timers.set(t.id, timer);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.timers.forEach(t => clearTimeout(t));
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    const timer = this.timers.get(id);
    if (timer) { clearTimeout(timer); this.timers.delete(id); }
  }

  trackById(_: number, t: Toast): number { return t.id; }

  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'ti-circle-check';
      case 'error':   return 'ti-alert-circle';
      case 'warning': return 'ti-alert-triangle';
      default:        return 'ti-info-circle';
    }
  }
}
