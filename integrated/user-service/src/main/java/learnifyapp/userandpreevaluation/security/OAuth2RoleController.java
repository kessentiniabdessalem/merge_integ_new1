package learnifyapp.userandpreevaluation.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/oauth2")
public class OAuth2RoleController {

    @GetMapping("/authorize/google/signup/{role}")
    public void startGoogleSignup(@PathVariable String role, HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        start(role, "SIGNUP", request, response);
    }

    @GetMapping("/authorize/google/login/{role}")
    public void startGoogleLogin(@PathVariable String role, HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        start(role, "LOGIN", request, response);
    }

    /**
     * Cookies OAUTH2_* peuvent ne pas être renvoyés après le retour Google (navigation cross-site).
     * On duplique mode + rôle en session (même JSESSIONID que le flux OAuth) pour que SIGNUP / LOGIN reste fiable.
     */
    private void start(String role, String mode, HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        String normalizedRole = role.toUpperCase();

        if (!normalizedRole.equals("STUDENT") && !normalizedRole.equals("CANDIDATE")) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Only STUDENT or CANDIDATE");
            return;
        }

        HttpSession session = request.getSession(true);
        session.setAttribute("OAUTH2_MODE", mode.toUpperCase());
        session.setAttribute("OAUTH2_ROLE", normalizedRole);

        Cookie roleCookie = new Cookie("OAUTH2_ROLE", normalizedRole);
        roleCookie.setPath("/");
        roleCookie.setHttpOnly(true);
        roleCookie.setMaxAge(5 * 60);
        roleCookie.setAttribute("SameSite", "Lax");
        response.addCookie(roleCookie);

        Cookie modeCookie = new Cookie("OAUTH2_MODE", mode);
        modeCookie.setPath("/");
        modeCookie.setHttpOnly(true);
        modeCookie.setMaxAge(5 * 60);
        modeCookie.setAttribute("SameSite", "Lax");
        response.addCookie(modeCookie);

        response.sendRedirect(response.encodeRedirectURL("/oauth2/authorization/google"));
    }
}
