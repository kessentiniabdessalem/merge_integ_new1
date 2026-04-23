/**
 * Transmet le Host du navigateur (ex. localhost:4200 ou 192.168.x.x:4200) au backend.
 * Sans cela, Spring OAuth2 voit Host=localhost:8087 et envoie à Google une redirect_uri
 * vers :8087 → erreur redirect_uri_mismatch si la console n’autorise que :4200.
 */
function withBrowserForwardedHeaders(options) {
  return {
    ...options,
    secure: options.secure ?? false,
    changeOrigin: options.changeOrigin ?? true,
    configure(proxy) {
      if (typeof options.configure === 'function') {
        options.configure(proxy);
      }
      proxy.on('proxyReq', (proxyReq, req) => {
        const host = req.headers.host;
        if (!host) return;
        proxyReq.setHeader('X-Forwarded-Host', host);
        proxyReq.setHeader('X-Forwarded-Proto', 'http');
        const colon = host.lastIndexOf(':');
        if (colon > 0) {
          const port = host.slice(colon + 1);
          if (/^\d+$/.test(port)) {
            proxyReq.setHeader('X-Forwarded-Port', port);
          }
        }
      });
    },
  };
}

/** 127.0.0.1 évite sous Windows que Node tente ::1 (IPv6) alors que Spring n’écoute qu’en IPv4. */
function p(port) {
  return withBrowserForwardedHeaders({ target: `http://127.0.0.1:${port}` });
}

export default {
  '/uploads': p(8087),
  '/api/events': p(8081),
  '/api/reservations': p(8081),
  '/api/payments': p(8082),
  '/api/notifications': p(8082),
  '/api/certificates': p(8083),
  '/api/quizzes': p(8084),
  '/api/questions': p(8084),
  '/api/attempts': p(8084),
  '/api/feedbacks': p(8084),
  '/api/ai': p(8085),
  '/api/chat': p(8085),
  '/api/quiz-generator': p(8085),
  '/api/feedback-analysis': p(8085),
  '/api/courses': p(8086),
  '/api/jobs': p(8088),
  '/api/applications': p(8088),
  '/api/meetings': p(8088),
  '/api/ratings': p(8088),
  '/api/job-notifications': p(8088),
  '/api/saved-jobs': p(8088),
  '/api/cv-profiles': p(8088),
  '/api/preevaluation': p(8089),
  '/api': p(8087),
  // Ne pas proxifier tout /oauth2 : /oauth2/redirect est une route Angular (retour Google).
  '/oauth2/authorization': p(8087),
  '/oauth2/authorize': p(8087),
  '/login': p(8087),
  '/logout': p(8087),
};
