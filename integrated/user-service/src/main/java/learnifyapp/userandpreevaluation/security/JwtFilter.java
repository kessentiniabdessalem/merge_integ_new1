package learnifyapp.userandpreevaluation.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        boolean isPublic =
                request.getMethod().equalsIgnoreCase("OPTIONS")

                        // auth classique
                        || path.startsWith("/api/auth/login")
                        || path.startsWith("/api/auth/register")
                        || path.startsWith("/api/auth/forgot-password")
                        || path.startsWith("/api/auth/reset-password")
                        || path.startsWith("/api/auth/unblock-request")
                        || path.startsWith("/api/auth/unblock-verify")
                        || path.startsWith("/api/auth/device/")
                        || path.startsWith("/api/auth/qr/")

                        // ✅ OAuth2 Google (IMPORTANT)
                        || path.startsWith("/oauth2/")
                        || path.startsWith("/login/oauth2/")
                        || "/login".equals(path)
                        || path.startsWith("/error")

                        // passkey
                        || path.startsWith("/api/webauthn/authenticate/options")
                        || path.startsWith("/api/webauthn/authenticate/verify")

                        // uploads
                        || path.startsWith("/uploads/");

        if (isPublic) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");

        // Bearer : toujours appliquer le JWT (écrase une session OAuth2 restaurée par SecurityContextPersistenceFilter).
        // Sinon un admin connecté en JWT + cookie JSESSIONID d’un flux Google gardait le principal OAuth → 403 sur /api/admin/**.
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            try {
                String email = jwtUtil.extractEmail(token);
                if (email != null && !jwtUtil.isTokenExpired(token)) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (UsernameNotFoundException e) {
                // utilisateur supprimé : ne pas injecter d’auth JWT
            } catch (Exception e) {
                System.out.println("Invalid token: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}