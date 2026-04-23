import { Component, Output, EventEmitter } from '@angular/core';

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
  standalone: false,
})
export class PricingComponent {
  @Output() openModal = new EventEmitter<void>();

  plans: Plan[] = [
    { name: 'Starter', price: '$29', period: '/month', features: ['5 courses access', 'Certificate', 'Email support'], highlighted: false, cta: 'Get Started' },
    { name: 'Professional', price: '$79', period: '/month', features: ['Unlimited courses', 'Certificates', 'Priority support', '1-on-1 sessions'], highlighted: true, cta: 'Get Started' },
    { name: 'Enterprise', price: '$199', period: '/month', features: ['Everything in Pro', 'Team dashboard', 'Custom learning paths', 'Dedicated success manager'], highlighted: false, cta: 'Contact Sales' },
  ];

  onCta(): void {
    this.openModal.emit();
  }
}
