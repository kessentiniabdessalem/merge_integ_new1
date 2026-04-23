import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentRecommendationService, PaymentRecommendation } from '../../../core/services/payment-recommendation.service';

@Component({
  selector: 'app-payment-recommendation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recommendation-card" *ngIf="recommendation">
      <div class="recommendation-header">
        <div class="ai-badge">
          <span class="ai-icon">🤖</span>
          <span class="ai-label">AI Recommendation</span>
        </div>
        <div class="confidence-badge" [class.high]="recommendation.confidence >= 85">
          {{ recommendation.confidence }}% confidence
        </div>
      </div>

      <div class="recommendation-content">
        <div class="main-recommendation">
          <h3>We recommend: <strong>{{ recommendation.recommendedMethod }}</strong></h3>
          <p class="reason">{{ recommendation.reason }}</p>
        </div>

        <div class="insights" *ngIf="showDetails">
          <h4>Detailed Analysis:</h4>
          <div class="insight-grid">
            <div class="insight-item">
              <span class="insight-icon">👤</span>
              <div class="insight-content">
                <span class="insight-label">Your History</span>
                <span class="insight-value">{{ recommendation.insights.userHistoryRate.toFixed(0) }}%</span>
              </div>
            </div>
            <div class="insight-item">
              <span class="insight-icon">🌍</span>
              <div class="insight-content">
                <span class="insight-label">Your Region</span>
                <span class="insight-value">{{ recommendation.insights.regionalRate.toFixed(0) }}%</span>
              </div>
            </div>
            <div class="insight-item">
              <span class="insight-icon">📊</span>
              <div class="insight-content">
                <span class="insight-label">Global Rate</span>
                <span class="insight-value">{{ recommendation.insights.globalRate.toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="alternatives" *ngIf="showDetails && recommendation.alternativeMethods.length > 0">
          <h4>Alternatives:</h4>
          <div class="alternative-list">
            <div class="alternative-item" *ngFor="let alt of recommendation.alternativeMethods">
              <span class="alt-name">{{ alt.method }}</span>
              <div class="alt-bar">
                <div class="alt-fill" [style.width.%]="alt.successRate"></div>
              </div>
              <span class="alt-rate">{{ alt.successRate.toFixed(0) }}%</span>
            </div>
          </div>
        </div>

        <button class="toggle-details" (click)="toggleDetails()">
          {{ showDetails ? '▲ Hide Details' : '▼ Show Details' }}
        </button>
      </div>
    </div>

    <div class="loading-card" *ngIf="isLoading">
      <div class="spinner"></div>
      <p>Analyzing...</p>
    </div>

    <div class="error-card" *ngIf="error">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
    </div>
  `,
  styles: [`
    .recommendation-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .recommendation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .ai-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .ai-icon {
      font-size: 18px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .confidence-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .confidence-badge.high {
      background: rgba(76, 175, 80, 0.3);
    }

    .recommendation-content {
      color: white;
    }

    .main-recommendation h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .main-recommendation strong {
      font-weight: 700;
      font-size: 20px;
    }

    .reason {
      margin: 0;
      font-size: 14px;
      opacity: 0.95;
      line-height: 1.5;
    }

    .insights {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .insights h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      opacity: 0.9;
    }

    .insight-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .insight-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.15);
      padding: 10px;
      border-radius: 8px;
    }

    .insight-icon {
      font-size: 20px;
    }

    .insight-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .insight-label {
      font-size: 11px;
      opacity: 0.8;
    }

    .insight-value {
      font-size: 16px;
      font-weight: 700;
    }

    .alternatives {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .alternatives h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      opacity: 0.9;
    }

    .alternative-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .alternative-item {
      display: grid;
      grid-template-columns: 120px 1fr 50px;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.1);
      padding: 8px 12px;
      border-radius: 6px;
    }

    .alt-name {
      font-size: 13px;
      font-weight: 500;
    }

    .alt-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;
    }

    .alt-fill {
      height: 100%;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .alt-rate {
      font-size: 12px;
      font-weight: 600;
      text-align: right;
    }

    .toggle-details {
      margin-top: 16px;
      width: 100%;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .toggle-details:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .loading-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin-bottom: 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-card {
      background: #ffebee;
      border: 1px solid #ef5350;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      color: #c62828;
    }

    .error-icon {
      font-size: 24px;
    }

    @media (max-width: 768px) {
      .insight-grid {
        grid-template-columns: 1fr;
      }

      .alternative-item {
        grid-template-columns: 100px 1fr 45px;
        gap: 8px;
      }
    }
  `]
})
export class PaymentRecommendationComponent implements OnInit, OnChanges {
  @Input() userId: number = 1; // Default user ID
  @Input() region: string = 'default';
  @Input() amount?: number;
  @Input() currency: string = 'USD'; // Add currency input

  recommendation: PaymentRecommendation | null = null;
  isLoading = false;
  error: string | null = null;
  showDetails = false;

  constructor(private recommendationService: PaymentRecommendationService) {}

  ngOnInit(): void {
    this.loadRecommendation();
  }

  ngOnChanges(): void {
    // Reload recommendation when currency changes
    this.loadRecommendation();
  }

  loadRecommendation(): void {
    this.isLoading = true;
    this.error = null;

    // Map currency to region
    const regionMap: { [key: string]: string } = {
      'TND': 'TN',
      'USD': 'US',
      'EUR': 'EU',
      'GBP': 'UK'
    };

    const detectedRegion = regionMap[this.currency] || this.region;

    this.recommendationService.getRecommendation(this.userId, detectedRegion, this.amount)
      .subscribe({
        next: (recommendation) => {
          this.recommendation = recommendation;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading recommendation:', err);
          this.error = 'Unable to load recommendation';
          this.isLoading = false;
        }
      });
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
