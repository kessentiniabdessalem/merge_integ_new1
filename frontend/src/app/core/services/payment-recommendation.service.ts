import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaymentService } from './payment.service';

export interface PaymentRecommendation {
  recommendedMethod: string;
  confidence: number; // 0-100
  reason: string;
  alternativeMethods: Array<{
    method: string;
    successRate: number;
  }>;
  insights: {
    userHistoryRate: number;
    regionalRate: number;
    globalRate: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentRecommendationService {
  
  // Simulated regional success rates (in real app, this would come from backend)
  private regionalSuccessRates: { [region: string]: { [method: string]: number } } = {
    'US': { 'credit_card': 92, 'paypal': 88, 'bank_transfer': 75 },
    'EU': { 'credit_card': 85, 'paypal': 90, 'bank_transfer': 82 },
    'UK': { 'credit_card': 89, 'paypal': 91, 'bank_transfer': 78 },
    'TN': { 'credit_card': 88, 'bank_transfer': 85, 'paypal': 45 }, // Tunisia - PayPal limited
    'MENA': { 'credit_card': 87, 'bank_transfer': 83, 'paypal': 50 }, // Middle East & North Africa
    'default': { 'credit_card': 87, 'paypal': 89, 'bank_transfer': 76 }
  };

  private paymentMethods = ['credit_card', 'paypal', 'bank_transfer'];

  constructor(private paymentService: PaymentService) {}

  /**
   * Get AI-powered payment method recommendation
   * @param userId - User ID to analyze history
   * @param region - User's region (US, EU, UK, etc.)
   * @param amount - Transaction amount
   */
  getRecommendation(userId: number, region: string = 'default', amount?: number): Observable<PaymentRecommendation> {
    return this.paymentService.getPayments().pipe(
      map(payments => {
        // Filter user's payment history
        const userPayments = payments.filter(p => p.userId === userId);
        
        // Calculate success rates for each payment method
        const methodStats = this.calculateMethodStats(payments, userPayments, region);
        
        // Find best method based on combined score
        const bestMethod = this.findBestMethod(methodStats, amount);
        
        // Generate recommendation
        return this.generateRecommendation(bestMethod, methodStats, userPayments.length);
      })
    );
  }

  /**
   * Calculate statistics for each payment method
   */
  private calculateMethodStats(
    allPayments: any[], 
    userPayments: any[], 
    region: string
  ): Map<string, { userRate: number; globalRate: number; regionalRate: number; totalScore: number }> {
    
    const methods = ['credit_card', 'paypal', 'bank_transfer'];
    const stats = new Map();

    methods.forEach(method => {
      // User's success rate with this method
      const userMethodPayments = userPayments.filter(p => p.payment_method === method);
      const userSuccessful = userMethodPayments.filter(p => 
        p.payment_status?.toLowerCase() === 'completed'
      ).length;
      const userRate = userMethodPayments.length > 0 
        ? (userSuccessful / userMethodPayments.length) * 100 
        : 0;

      // Global success rate
      const globalMethodPayments = allPayments.filter(p => p.payment_method === method);
      const globalSuccessful = globalMethodPayments.filter(p => 
        p.payment_status?.toLowerCase() === 'completed'
      ).length;
      const globalRate = globalMethodPayments.length > 0 
        ? (globalSuccessful / globalMethodPayments.length) * 100 
        : 85; // Default if no data

      // Regional success rate (from predefined data)
      const regionalRate = this.regionalSuccessRates[region]?.[method] 
        || this.regionalSuccessRates['default'][method];

      // Calculate weighted score
      // User history: 40%, Regional: 35%, Global: 25%
      const totalScore = userPayments.length > 0
        ? (userRate * 0.4) + (regionalRate * 0.35) + (globalRate * 0.25)
        : (regionalRate * 0.6) + (globalRate * 0.4); // If no user history, weight regional more

      stats.set(method, {
        userRate,
        globalRate,
        regionalRate,
        totalScore
      });
    });

    return stats;
  }

  /**
   * Find the best payment method based on scores
   */
  private findBestMethod(
    stats: Map<string, any>, 
    amount?: number
  ): { method: string; stats: any } {
    
    let bestMethod = 'paypal';
    let bestScore = 0;

    stats.forEach((stat, method) => {
      let adjustedScore = stat.totalScore;

      // Adjust score based on transaction amount
      if (amount) {
        if (amount > 500 && method === 'bank_transfer') {
          adjustedScore += 5; // Bank transfer better for large amounts
        }
        if (amount < 100 && method === 'paypal') {
          adjustedScore += 3; // PayPal better for small amounts
        }
      }

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestMethod = method;
      }
    });

    return {
      method: bestMethod,
      stats: stats.get(bestMethod)
    };
  }

  /**
   * Generate human-readable recommendation
   */
  private generateRecommendation(
    bestMethod: { method: string; stats: any },
    allStats: Map<string, any>,
    userPaymentCount: number
  ): PaymentRecommendation {
    
    const methodNames: { [key: string]: string } = {
      'credit_card': 'Carte de Crédit',
      'paypal': 'PayPal',
      'bank_transfer': 'Virement Bancaire'
    };

    // Generate reason based on data
    let reason = '';
    const stats = bestMethod.stats;

    if (userPaymentCount > 0 && stats.userRate > 80) {
      reason = `Basé sur votre historique personnel (${stats.userRate.toFixed(0)}% de succès)`;
    } else if (stats.regionalRate > stats.globalRate) {
      reason = `Méthode la plus fiable dans votre région (${stats.regionalRate.toFixed(0)}% de succès)`;
    } else {
      reason = `Taux de succès global élevé (${stats.globalRate.toFixed(0)}%)`;
    }

    // Add additional context
    if (stats.totalScore > 90) {
      reason += ' - Fortement recommandé';
    } else if (stats.totalScore > 85) {
      reason += ' - Recommandé';
    }

    // Build alternative methods list
    const alternatives: Array<{ method: string; successRate: number }> = [];
    allStats.forEach((stat, method) => {
      if (method !== bestMethod.method) {
        alternatives.push({
          method: methodNames[method] || method,
          successRate: stat.totalScore
        });
      }
    });

    // Sort alternatives by success rate
    alternatives.sort((a, b) => b.successRate - a.successRate);

    return {
      recommendedMethod: methodNames[bestMethod.method] || bestMethod.method,
      confidence: Math.round(stats.totalScore),
      reason,
      alternativeMethods: alternatives,
      insights: {
        userHistoryRate: stats.userRate,
        regionalRate: stats.regionalRate,
        globalRate: stats.globalRate
      }
    };
  }

  /**
   * Get detailed insights for all payment methods
   */
  getDetailedInsights(userId: number, region: string = 'default'): Observable<any> {
    return this.paymentService.getPayments().pipe(
      map(payments => {
        const userPayments = payments.filter(p => p.userId === userId);
        const methodStats = this.calculateMethodStats(payments, userPayments, region);

        const insights: any = {};
        methodStats.forEach((stats, method) => {
          insights[method] = {
            ...stats,
            userPaymentCount: userPayments.filter(p => p.paymentMethod === method).length,
            globalPaymentCount: payments.filter(p => p.paymentMethod === method).length
          };
        });

        return insights;
      })
    );
  }
}
