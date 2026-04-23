/**
 * Dev avec `ng serve` : URLs relatives → le navigateur appelle localhost:4200, le proxy
 * (proxy.conf.json + angular.json) transmet vers user-service :8087 par défaut.
 * Pour utiliser l’API Gateway :8080, mets toutes les cibles de proxy.conf.json sur 8080
 * et démarre Eureka + gateway + microservices.
 */
export const environment = {
  production: false,
  apiBase: '/api',
  courseApiBase: '/api/courses',
  apiGatewayUrl: '',
  /**
   * Même principe qu’ang/UandPManagement (signin.ts / signup.ts) : « Continue with Google » pointe vers le user-service
   * en direct, pas via le proxy :4200. Sinon la redirect_uri côté Google ne correspond pas à celle du projet indiv (8080).
   */
  oauthUserServiceUrl: 'http://localhost:8087',
};
