package learnifyapp.userandpreevaluation.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.SerializationUtils;

import java.util.Base64;

/**
 * Stocke la requête d’autorisation OAuth2 dans un cookie HttpOnly au lieu de la session seule.
 * Évite {@code authorization_request_not_found} quand le JSESSIONID n’est pas renvoyé au callback
 * Google (navigations cross-site, cookies de session, etc.).
 */
@Component
public class CookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final Logger log = LoggerFactory.getLogger(CookieOAuth2AuthorizationRequestRepository.class);

    private static final String COOKIE_NAME = "oauth2_auth_req";
    private static final int MAX_AGE_SECONDS = 600;
    /** Taille max des octets sérialisés (Base64 URL ≈ ×4/3 → rester sous ~4 Ko valeur cookie). */
    private static final int MAX_SERIALIZED_LENGTH = 2700;

    private static final Base64.Encoder B64_ENC = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder B64_DEC = Base64.getUrlDecoder();

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        String state = request.getParameter(OAuth2ParameterNames.STATE);
        if (state == null) {
            return null;
        }
        String raw = readCookie(request, COOKIE_NAME);
        if (raw == null || raw.isEmpty()) {
            return null;
        }
        try {
            byte[] bytes = B64_DEC.decode(raw);
            Object obj = SerializationUtils.deserialize(bytes);
            if (!(obj instanceof OAuth2AuthorizationRequest auth)) {
                return null;
            }
            return state.equals(auth.getState()) ? auth : null;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request,
                                         HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeCookie(response);
            return;
        }
        byte[] serialized;
        try {
            serialized = SerializationUtils.serialize(authorizationRequest);
        } catch (RuntimeException e) {
            log.warn("Sérialisation OAuth2AuthorizationRequest impossible : {}", e.getMessage());
            return;
        }
        if (serialized == null || serialized.length > MAX_SERIALIZED_LENGTH) {
            log.warn(
                    "Requête OAuth2 trop volumineuse pour un cookie ({} octets, max {})",
                    serialized == null ? 0 : serialized.length,
                    MAX_SERIALIZED_LENGTH);
            return;
        }
        String encoded = B64_ENC.encodeToString(serialized);
        Cookie c = new Cookie(COOKIE_NAME, encoded);
        c.setPath("/");
        c.setHttpOnly(true);
        c.setMaxAge(MAX_AGE_SECONDS);
        c.setAttribute("SameSite", "Lax");
        response.addCookie(c);
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        OAuth2AuthorizationRequest auth = loadAuthorizationRequest(request);
        if (auth != null) {
            removeCookie(response);
        }
        return auth;
    }

    private static String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }

    private static void removeCookie(HttpServletResponse response) {
        Cookie c = new Cookie(COOKIE_NAME, "");
        c.setPath("/");
        c.setMaxAge(0);
        c.setHttpOnly(true);
        c.setAttribute("SameSite", "Lax");
        response.addCookie(c);
    }
}
