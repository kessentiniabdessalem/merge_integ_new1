import { environment } from '../../../environments/environment';

/**
 * Centralized API configuration for microservices architecture
 * All HTTP requests must go through the API Gateway
 */
export class ApiConfig {
  private static readonly baseGatewayUrl = environment.apiGatewayUrl;

  /**
   * Get the full API Gateway base URL
   */
  static get baseUrl(): string {
    return this.baseGatewayUrl;
  }

  /**
   * Get service-specific base URLs
   */
  static get services() {
    return {
      payment: this.baseGatewayUrl,
      certificate: this.baseGatewayUrl
    };
  }

  /**
   * API endpoints for each microservice
   */
  static readonly endpoints = {
    // Payment Service endpoints
    payment: {
      list: '/api/payments',
      getById: (id: number) => `/api/payments/${id}`,
      create: '/api/payments',
      update: (id: number) => `/api/payments/${id}`,
      delete: (id: number) => `/api/payments/${id}`,
      batchCreate: '/api/payments/batch',
      getByUser: (userId: number) => `/api/payments/user/${userId}`,
      getByTransaction: (transactionId: string) => `/api/payments/transaction/${transactionId}`,
      totalRevenue: '/api/payments/total-revenue'
    },

    // Certificate Service endpoints
    certificate: {
      list: '/api/certificates',
      getById: (id: number) => `/api/certificates/${id}`,
      create: '/api/certificates',
      update: (id: number) => `/api/certificates/${id}`,
      delete: (id: number) => `/api/certificates/${id}`,
      generate: (id: number) => `/api/certificates/${id}/generate`,
      verify: (code: string) => `/api/certificates/verify/${code}`,
      getByUser: (userId: number) => `/api/certificates/user/${userId}`,
      count: '/api/certificates/count'
    }
  };
}
