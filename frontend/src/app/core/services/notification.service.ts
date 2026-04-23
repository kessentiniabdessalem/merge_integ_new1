import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  type: 'payment_confirmation' | 'payment_failed' | 'daily_summary' | 'weekly_report' | 'large_payment';
}

export interface SMSNotification {
  to: string;
  message: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  largePaymentThreshold: number; // Amount threshold for SMS
  dailySummary: boolean;
  weeklyReport: boolean;
}

/**
 * Notification Service - Handles email and SMS notifications for payments
 * 
 * Features:
 * - Email confirmation after payment
 * - SMS for large payments (>$500)
 * - Admin notifications for failed payments
 * - Daily payment summary
 * - Weekly revenue report
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = environment.apiGatewayUrl;
  
  // Default notification preferences
  private preferences: NotificationPreferences = {
    emailNotifications: true,
    smsNotifications: true,
    largePaymentThreshold: 500,
    dailySummary: true,
    weeklyReport: true
  };

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  /**
   * Send payment confirmation email to user
   */
  sendPaymentConfirmation(
    userEmail: string,
    userName: string,
    amount: number,
    currency: string,
    courseTitle: string,
    transactionId: string
  ): Observable<boolean> {
    if (!this.preferences.emailNotifications) {
      console.log('Email notifications disabled');
      return of(false);
    }

    const email: EmailNotification = {
      to: userEmail,
      subject: `Payment Confirmation - ${courseTitle}`,
      body: this.generatePaymentConfirmationEmail(userName, amount, currency, courseTitle, transactionId),
      type: 'payment_confirmation'
    };

    console.log('📧 Sending payment confirmation email:', email);
    
    // TODO: Integrate with backend email service
    // return this.http.post<boolean>(`${this.apiUrl}/api/notifications/email`, email);
    
    // For now, simulate email sending
    return this.simulateEmailSending(email);
  }

  /**
   * Send SMS notification for large payments
   */
  sendLargePaymentSMS(
    phoneNumber: string,
    amount: number,
    currency: string,
    transactionId: string
  ): Observable<boolean> {
    if (!this.preferences.smsNotifications || amount < this.preferences.largePaymentThreshold) {
      return of(false);
    }

    const sms: SMSNotification = {
      to: phoneNumber,
      message: `Payment of ${currency} ${amount} confirmed. Transaction ID: ${transactionId}. Thank you for your purchase!`
    };

    console.log('📱 Sending large payment SMS:', sms);
    
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // return this.http.post<boolean>(`${this.apiUrl}/api/notifications/sms`, sms);
    
    // For now, simulate SMS sending
    return this.simulateSMSSending(sms);
  }

  /**
   * Send failed payment notification to admin
   */
  sendFailedPaymentNotification(
    adminEmail: string,
    userId: number,
    amount: number,
    errorMessage: string
  ): Observable<boolean> {
    const email: EmailNotification = {
      to: adminEmail,
      subject: `⚠️ Payment Failed - User ${userId}`,
      body: this.generateFailedPaymentEmail(userId, amount, errorMessage),
      type: 'payment_failed'
    };

    console.log('⚠️ Sending failed payment notification to admin:', email);
    
    return this.simulateEmailSending(email);
  }

  /**
   * Send daily payment summary to admin
   */
  sendDailySummary(
    adminEmail: string,
    totalRevenue: number,
    transactionCount: number,
    failedCount: number
  ): Observable<boolean> {
    if (!this.preferences.dailySummary) {
      return of(false);
    }

    const email: EmailNotification = {
      to: adminEmail,
      subject: `Daily Payment Summary - ${new Date().toLocaleDateString()}`,
      body: this.generateDailySummaryEmail(totalRevenue, transactionCount, failedCount),
      type: 'daily_summary'
    };

    console.log('📊 Sending daily summary:', email);
    
    return this.simulateEmailSending(email);
  }

  /**
   * Send weekly revenue report to admin
   */
  sendWeeklyReport(
    adminEmail: string,
    weeklyRevenue: number,
    weeklyTransactions: number,
    topCourses: Array<{ title: string; revenue: number }>
  ): Observable<boolean> {
    if (!this.preferences.weeklyReport) {
      return of(false);
    }

    const email: EmailNotification = {
      to: adminEmail,
      subject: `Weekly Revenue Report - Week of ${new Date().toLocaleDateString()}`,
      body: this.generateWeeklyReportEmail(weeklyRevenue, weeklyTransactions, topCourses),
      type: 'weekly_report'
    };

    console.log('📈 Sending weekly report:', email);
    
    return this.simulateEmailSending(email);
  }

  /**
   * Update notification preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    console.log('✅ Notification preferences updated:', this.preferences);
  }

  /**
   * Get current notification preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Private helper methods

  private loadPreferences(): void {
    const stored = localStorage.getItem('notification_preferences');
    if (stored) {
      try {
        this.preferences = JSON.parse(stored);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  }

  private generatePaymentConfirmationEmail(
    userName: string,
    amount: number,
    currency: string,
    courseTitle: string,
    transactionId: string
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Payment Confirmed!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <p>Dear ${userName},</p>
            
            <p>Thank you for your purchase! Your payment has been successfully processed.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #667eea;">Order Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Course:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${courseTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Amount:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">${currency} ${amount}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Transaction ID:</strong></td>
                  <td style="padding: 10px 0;"><code>${transactionId}</code></td>
                </tr>
              </table>
            </div>
            
            <p>You can now access your course from your dashboard.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:4200/courses" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to My Courses
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2026 LearnifyEnglish. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateFailedPaymentEmail(userId: number, amount: number, errorMessage: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2 style="color: #ef4444;">⚠️ Payment Failed</h2>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Error:</strong> ${errorMessage}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>Please investigate and contact the user if necessary.</p>
        </body>
      </html>
    `;
  }

  private generateDailySummaryEmail(totalRevenue: number, transactionCount: number, failedCount: number): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Daily Payment Summary</h2>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <ul>
            <li><strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}</li>
            <li><strong>Successful Transactions:</strong> ${transactionCount}</li>
            <li><strong>Failed Transactions:</strong> ${failedCount}</li>
            <li><strong>Average Transaction:</strong> $${(totalRevenue / transactionCount || 0).toFixed(2)}</li>
          </ul>
        </body>
      </html>
    `;
  }

  private generateWeeklyReportEmail(
    weeklyRevenue: number,
    weeklyTransactions: number,
    topCourses: Array<{ title: string; revenue: number }>
  ): string {
    const coursesHtml = topCourses
      .map((course, index) => `<li>${index + 1}. ${course.title} - $${course.revenue.toFixed(2)}</li>`)
      .join('');

    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Weekly Revenue Report</h2>
          <p><strong>Week of:</strong> ${new Date().toLocaleDateString()}</p>
          <h3>Summary</h3>
          <ul>
            <li><strong>Total Revenue:</strong> $${weeklyRevenue.toFixed(2)}</li>
            <li><strong>Total Transactions:</strong> ${weeklyTransactions}</li>
          </ul>
          <h3>Top Selling Courses</h3>
          <ol>${coursesHtml}</ol>
        </body>
      </html>
    `;
  }

  private simulateEmailSending(email: EmailNotification): Observable<boolean> {
    // Use real HTTP call to send email
    return this.http.post<any>(`${this.apiUrl}/api/notifications/email`, email)
      .pipe(
        map(response => {
          console.log('✅ Email sent successfully:', response);
          return response.success || false;
        }),
        catchError(error => {
          console.error('❌ Failed to send email:', error);
          return of(false);
        })
      );
  }

  private simulateSMSSending(sms: SMSNotification): Observable<boolean> {
    // Use real HTTP call to send SMS (when implemented)
    return this.http.post<any>(`${this.apiUrl}/api/notifications/sms`, sms)
      .pipe(
        map(response => {
          console.log('✅ SMS sent successfully:', response);
          return response.success || false;
        }),
        catchError(error => {
          console.error('❌ Failed to send SMS:', error);
          // For now, just log - SMS service not implemented yet
          console.log('📱 SMS would be sent to:', sms.to);
          return of(false);
        })
      );
  }
}
