export const environment = {
  production: true,
  apiBase: 'http://localhost:8080/api',
  courseApiBase: 'http://localhost:8080/api/courses',
  apiGatewayUrl: 'http://localhost:8080',
  /** OAuth : ajouter /oauth2/** sur la gateway ou exposer l’URL réelle du user-service. */
  oauthUserServiceUrl: 'http://localhost:8087',
};
