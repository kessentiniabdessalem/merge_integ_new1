package learnifyapp.userandpreevaluation.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Récupère le profil via l’endpoint officiel Google UserInfo (Bearer access_token).
 * Plus fiable que les seuls attributs du {@code Principal} quand name/picture sont absents du token.
 */
@Component
public class GoogleOAuthUserInfoClient {

    private static final String GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

    private final OAuth2AuthorizedClientService authorizedClientService;

    public GoogleOAuthUserInfoClient(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchUserInfo(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken token)) {
            return null;
        }
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                token.getAuthorizedClientRegistrationId(),
                token.getName());
        if (client == null || client.getAccessToken() == null) {
            return null;
        }
        String accessToken = client.getAccessToken().getTokenValue();
        if (accessToken == null || accessToken.isBlank()) {
            return null;
        }
        try {
            return RestClient.create()
                    .get()
                    .uri(GOOGLE_USERINFO)
                    .headers(h -> h.setBearerAuth(accessToken))
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            return null;
        }
    }
}
