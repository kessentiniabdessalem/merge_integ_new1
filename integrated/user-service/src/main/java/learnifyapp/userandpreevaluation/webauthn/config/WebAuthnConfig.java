package learnifyapp.userandpreevaluation.webauthn.config;

import com.yubico.webauthn.RelyingParty;
import com.yubico.webauthn.data.RelyingPartyIdentity;
import learnifyapp.userandpreevaluation.webauthn.service.DbCredentialRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;

@Configuration
public class WebAuthnConfig {

    @Value("${webauthn.rpId:localhost}")
    private String rpId;

    @Value("${webauthn.rpName:Learnify}")
    private String rpName;

    @Value("${webauthn.origin:http://localhost:4200}")
    private String origin;

    @Bean
    public RelyingParty relyingParty(DbCredentialRepository credentialRepository) {

        RelyingPartyIdentity rpIdentity = RelyingPartyIdentity.builder()
                .id(rpId)      // "localhost" (PAS une URL)
                .name(rpName)  // juste un nom affiché
                .build();

        return RelyingParty.builder()
                .identity(rpIdentity)
                .credentialRepository(credentialRepository)
                .origins(Set.of(origin)) // "http://localhost:4200"
                .build();
    }
}