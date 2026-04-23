package learnifyapp.userandpreevaluation.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final CookieOAuth2AuthorizationRequestRepository oauth2AuthorizationRequestRepository;

    public SecurityConfig(JwtFilter jwtFilter,
                          OAuth2SuccessHandler oAuth2SuccessHandler,
                          CookieOAuth2AuthorizationRequestRepository oauth2AuthorizationRequestRepository) {
        this.jwtFilter = jwtFilter;
        this.oAuth2SuccessHandler = oAuth2SuccessHandler;
        this.oauth2AuthorizationRequestRepository = oauth2AuthorizationRequestRepository;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // CORS géré uniquement par l’API Gateway (évite Access-Control-Allow-Origin en double : *, http://localhost:4200).
        http
                .cors(AbstractHttpConfigurer::disable)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // ✅ auth classique
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ endpoint qu’on a créé pour choisir role (STUDENT/CANDIDATE)
                        .requestMatchers("/oauth2/authorize/**").permitAll()

                        // ✅ OAuth2 Google endpoints + page d’erreur / login Spring (/login?error=…)
                        .requestMatchers("/oauth2/**", "/login/oauth2/**", "/login", "/error").permitAll()

                        // ✅ PASSKEY LOGIN (public)
                        .requestMatchers("/api/webauthn/authenticate/**").permitAll()

                        // ✅ fichiers upload
                        .requestMatchers("/uploads/**").permitAll()

                        // ADMIN (backoffice: list/delete users, create admin/tutor)
                        .requestMatchers("/api/users/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )
                // ⚠️ OAuth2 a besoin d'une session temporaire
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(a ->
                                a.authorizationRequestRepository(oauth2AuthorizationRequestRepository))
                        .successHandler(oAuth2SuccessHandler)
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}