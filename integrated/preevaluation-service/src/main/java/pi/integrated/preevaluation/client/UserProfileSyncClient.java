package pi.integrated.preevaluation.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class UserProfileSyncClient {

    private static final Logger log = LoggerFactory.getLogger(UserProfileSyncClient.class);

    private final RestTemplate loadBalancedRestTemplate;

    public UserProfileSyncClient(RestTemplate loadBalancedRestTemplate) {
        this.loadBalancedRestTemplate = loadBalancedRestTemplate;
    }

    /**
     * Met à jour le champ profil côté user-service (même JWT que l’appel préévaluation).
     */
    public void syncFinalLevel(String authorizationBearer, String finalLevel) {
        if (authorizationBearer == null || authorizationBearer.isBlank() || finalLevel == null) {
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.AUTHORIZATION, authorizationBearer.startsWith("Bearer ")
                    ? authorizationBearer
                    : "Bearer " + authorizationBearer);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(Map.of("finalLevel", finalLevel), headers);
            loadBalancedRestTemplate.exchange(
                    "http://user-service/api/users/me/preevaluation-final-level",
                    HttpMethod.PUT,
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            log.warn("Impossible de synchroniser le niveau final vers user-service: {}", e.getMessage());
        }
    }
}
