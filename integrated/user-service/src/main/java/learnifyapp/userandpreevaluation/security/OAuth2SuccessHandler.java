package learnifyapp.userandpreevaluation.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import learnifyapp.userandpreevaluation.usermanagement.dto.NewDeviceInfo;
import learnifyapp.userandpreevaluation.usermanagement.enums.Role;
import learnifyapp.userandpreevaluation.usermanagement.service.DeviceService;
import learnifyapp.userandpreevaluation.usermanagement.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final GoogleUserService googleUserService;
    private final DeviceService deviceService;
    private final UserService userService;
    private final GoogleOAuthUserInfoClient googleOAuthUserInfoClient;

    /** Base URL du SPA (Angular) pour /oauth2/redirect — jamais le port user-service (:8087). */
    @Value("${app.oauth2-redirect-base:http://localhost:4200}")
    private String oauth2RedirectBase;

    public OAuth2SuccessHandler(JwtUtil jwtUtil,
                                GoogleUserService googleUserService,
                                DeviceService deviceService,
                                UserService userService,
                                GoogleOAuthUserInfoClient googleOAuthUserInfoClient) {
        this.jwtUtil = jwtUtil;
        this.googleUserService = googleUserService;
        this.deviceService = deviceService;
        this.userService = userService;
        this.googleOAuthUserInfoClient = googleOAuthUserInfoClient;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // 1) Rôle + mode (cookies + session : après Google les cookies cross-site peuvent manquer)
        String roleStr = readOAuthRole(request);
        String mode = readOAuthMode(request);

        Role desiredRole = "CANDIDATE".equalsIgnoreCase(roleStr) ? Role.CANDIDATE : Role.STUDENT;
        String desiredMode = (mode == null || mode.isBlank()) ? "LOGIN" : mode.trim().toUpperCase();

        // 2) Infos Google (given_name/family_name souvent renseignés alors que name / getFullName() est vide)
        Object principal = authentication.getPrincipal();

        String email;
        if (principal instanceof OidcUser oidcUser) {
            email = oidcUser.getEmail();
        } else {
            var oauthUser = (OAuth2User) principal;
            email = stringAttr(oauthUser.getAttributes(), "email");
        }

        String fullName = extractGoogleDisplayName(principal);
        String pictureUrl = extractGooglePicture(principal);

        Map<String, Object> googleUserInfo = googleOAuthUserInfoClient.fetchUserInfo(authentication);
        if (googleUserInfo != null) {
            String apiDisplay = extractDisplayNameFromUserInfoMap(googleUserInfo);
            if (isNotBlank(apiDisplay)) {
                fullName = apiDisplay;
            }
            String pic = stringAttr(googleUserInfo, "picture");
            if (isNotBlank(pic)) {
                pictureUrl = pic.trim();
            }
            String apiEmail = stringAttr(googleUserInfo, "email");
            if (!isNotBlank(email) && isNotBlank(apiEmail)) {
                email = apiEmail;
            }
        }

        if (email != null) {
            email = email.trim().toLowerCase();
        }

        // 3) Vérifier existence
        Optional<learnifyapp.userandpreevaluation.usermanagement.entity.User> existingOpt =
                googleUserService.findByEmail(email);

        boolean isNewUser = existingOpt.isEmpty();

        // SIGNUP: si existe -> erreur
        if ("SIGNUP".equals(desiredMode) && existingOpt.isPresent()) {
            clearOAuthState(request, response);
            response.sendRedirect(oauth2RedirectUrl() + "?error=" + enc("account_exists"));
            return;
        }

        // LOGIN: si n'existe pas -> erreur
        if ("LOGIN".equals(desiredMode) && existingOpt.isEmpty()) {
            clearOAuthState(request, response);
            response.sendRedirect(oauth2RedirectUrl() + "?error=" + enc("account_not_found") + "&role=" + enc(desiredRole.name()));
            return;
        }

        // 4) Obtenir user final (compte existant : toujours resynchroniser nom + avatar Google)
        learnifyapp.userandpreevaluation.usermanagement.entity.User user;
        if (existingOpt.isPresent()) {
            user = googleUserService.applyGoogleProfile(existingOpt.get(), fullName, pictureUrl);
        } else {
            user = googleUserService.createGoogleUser(email, fullName, pictureUrl, desiredRole);
        }

        // 4.1) Infos device
        String deviceId = readCookie(request, "DEVICE_ID");

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = request.getRemoteAddr();
        else ip = ip.split(",")[0].trim();

        String userAgent = request.getHeader("User-Agent");

        NewDeviceInfo info = NewDeviceInfo.builder()
                .deviceId(deviceId)
                .userAgent(userAgent)
                .ip(ip)
                .build();

        // - si SIGNUP + new user => trust device direct
        // - sinon => checkDeviceOrCreateAttempt (pending si nouveau)
        if ("SIGNUP".equals(desiredMode) && isNewUser) {
            deviceService.trustDeviceOnSignup(user, info);
        } else {
            String st = deviceService.checkDeviceOrCreateAttempt(user, info, "GOOGLE", desiredMode);

            // ✅ PENDING => on envoie aussi token au frontend
            if (st != null && st.startsWith("PENDING:")) {
                String pendingToken = st.split(":", 2)[1];
                clearOAuthState(request, response);
                response.sendRedirect(oauth2RedirectUrl() + "?pending=true&token=" + enc(pendingToken));
                return;
            }
        }

        // ✅ device connu => créer session active
        userService.createSessionFor(user.getEmail(), userAgent, ip);

        // 5) JWT + redirect
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        clearOAuthState(request, response);
        response.sendRedirect(oauth2RedirectUrl() + "?token=" + enc(token));
    }

    private String readOAuthMode(HttpServletRequest request) {
        String v = readCookie(request, "OAUTH2_MODE");
        if (v != null && !v.isBlank()) {
            return v;
        }
        HttpSession s = request.getSession(false);
        if (s == null) {
            return null;
        }
        Object o = s.getAttribute("OAUTH2_MODE");
        return o != null ? o.toString() : null;
    }

    private String readOAuthRole(HttpServletRequest request) {
        String v = readCookie(request, "OAUTH2_ROLE");
        if (v != null && !v.isBlank()) {
            return v;
        }
        HttpSession s = request.getSession(false);
        if (s == null) {
            return null;
        }
        Object o = s.getAttribute("OAUTH2_ROLE");
        return o != null ? o.toString() : null;
    }

    private String oauth2RedirectUrl() {
        String b = (oauth2RedirectBase == null || oauth2RedirectBase.isBlank())
                ? "http://localhost:4200"
                : oauth2RedirectBase.trim();
        b = b.replaceAll("/+$", "");
        // Redirection relative → le navigateur reste sur :8087 et tombe sur « No static resource oauth2/redirect »
        if (!b.startsWith("http://") && !b.startsWith("https://")) {
            b = "http://localhost:4200";
        }
        return b + "/oauth2/redirect";
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private void clearOAuthState(HttpServletRequest request, HttpServletResponse response) {
        Cookie c1 = new Cookie("OAUTH2_ROLE", "");
        c1.setPath("/");
        c1.setMaxAge(0);
        c1.setAttribute("SameSite", "Lax");
        response.addCookie(c1);

        Cookie c2 = new Cookie("OAUTH2_MODE", "");
        c2.setPath("/");
        c2.setMaxAge(0);
        c2.setAttribute("SameSite", "Lax");
        response.addCookie(c2);

        HttpSession s = request.getSession(false);
        if (s != null) {
            s.removeAttribute("OAUTH2_MODE");
            s.removeAttribute("OAUTH2_ROLE");
        }
    }

    private String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private static String extractGoogleDisplayName(Object principal) {
        if (principal instanceof OidcUser oidc) {
            if (isNotBlank(oidc.getFullName())) {
                return oidc.getFullName().trim();
            }
            String combined = joinGivenFamily(oidc.getGivenName(), oidc.getFamilyName());
            if (combined != null) {
                return combined;
            }
        } else if (principal instanceof OAuth2User ou) {
            Map<String, Object> a = ou.getAttributes();
            String nameClaim = stringAttr(a, "name");
            if (isNotBlank(nameClaim)) {
                return nameClaim.trim();
            }
            String combined = joinGivenFamily(stringAttr(a, "given_name"), stringAttr(a, "family_name"));
            if (combined != null) {
                return combined;
            }
        }
        return null;
    }

    private static String extractDisplayNameFromUserInfoMap(Map<String, Object> m) {
        if (m == null || m.isEmpty()) {
            return null;
        }
        String name = stringAttr(m, "name");
        if (isNotBlank(name)) {
            return name.trim();
        }
        return joinGivenFamily(stringAttr(m, "given_name"), stringAttr(m, "family_name"));
    }

    private static String extractGooglePicture(Object principal) {
        if (principal instanceof OidcUser oidc) {
            if (isNotBlank(oidc.getPicture())) {
                return oidc.getPicture().trim();
            }
        }
        if (principal instanceof OAuth2User ou) {
            String p = stringAttr(ou.getAttributes(), "picture");
            if (isNotBlank(p)) {
                return p.trim();
            }
        }
        return null;
    }

    private static String joinGivenFamily(String given, String family) {
        String g = given != null ? given.trim() : "";
        String f = family != null ? family.trim() : "";
        if (!g.isEmpty() && !f.isEmpty()) {
            return g + " " + f;
        }
        if (!g.isEmpty()) {
            return g;
        }
        if (!f.isEmpty()) {
            return f;
        }
        return null;
    }

    private static String stringAttr(Map<String, Object> a, String key) {
        if (a == null) {
            return null;
        }
        Object v = a.get(key);
        return v != null ? v.toString() : null;
    }

    private static boolean isNotBlank(String s) {
        return s != null && !s.isBlank();
    }
}