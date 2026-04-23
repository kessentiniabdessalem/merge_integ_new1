package pi.integrated.preevaluation.security;

/**
 * Aligne les rôles JWT avec ceux du user-service (ex. {@code STUDENT}) quand le token
 * porte un préfixe Spring {@code ROLE_*}.
 */
public final class JwtRoleNormalizer {

    private JwtRoleNormalizer() {
    }

    public static String normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            return raw;
        }
        String r = raw.trim();
        if (r.length() > 5 && r.regionMatches(true, 0, "ROLE_", 0, 5)) {
            return r.substring(5);
        }
        return r;
    }
}
