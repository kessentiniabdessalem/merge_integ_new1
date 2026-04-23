package learnifyapp.userandpreevaluation.webauthn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yubico.webauthn.*;
import com.yubico.webauthn.data.*;
import learnifyapp.userandpreevaluation.security.JwtUtil;
import learnifyapp.userandpreevaluation.usermanagement.entity.User;
import learnifyapp.userandpreevaluation.usermanagement.repository.UserRepository;
import learnifyapp.userandpreevaluation.webauthn.entity.WebAuthnCredential;
import learnifyapp.userandpreevaluation.webauthn.repository.WebAuthnCredentialRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebAuthnService {

    private final RelyingParty rp;
    private final ObjectMapper mapper;
    private final UserRepository userRepo;
    private final WebAuthnCredentialRepository credRepo;
    private final JwtUtil jwtUtil;

    private final ConcurrentHashMap<String, PendingReg> pendingReg = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, PendingAuth> pendingAuth = new ConcurrentHashMap<>();

    private record PendingReg(String email, PublicKeyCredentialCreationOptions pkOptions) {}
    private record PendingAuth(AssertionRequest request) {}

    public WebAuthnService(
            RelyingParty rp,
            ObjectMapper mapper,
            UserRepository userRepo,
            WebAuthnCredentialRepository credRepo,
            JwtUtil jwtUtil
    ) {
        this.rp = rp;
        this.mapper = mapper;
        this.userRepo = userRepo;
        this.credRepo = credRepo;
        this.jwtUtil = jwtUtil;
    }

    // =========================================================
    // Helpers JSON safe
    // =========================================================
    @SuppressWarnings("unchecked")
    private String sanitizeJsonExtensions(String json) {
        try {
            Map<String, Object> map = mapper.readValue(json, Map.class);

            Object extObj = map.get("extensions");
            if (extObj instanceof Map<?, ?>) {
                Map<String, Object> ext = (Map<String, Object>) extObj;

                ext.remove("appidExclude");
                ext.remove("appid");

                if (ext.isEmpty()) map.remove("extensions");
                else map.put("extensions", ext);
            }

            return mapper.writeValueAsString(map);
        } catch (Exception e) {
            return json;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> jsonToMap(String json) {
        try {
            return mapper.readValue(json, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid WebAuthn publicKey JSON", e);
        }
    }

    // =========================================================
    // REGISTER (from profile)
    // =========================================================
    public Map<String, Object> startRegistration(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ByteArray userHandle = new ByteArray(Long.toString(user.getId()).getBytes());

        UserIdentity userIdentity = UserIdentity.builder()
                .name(user.getEmail())
                .displayName(user.getEmail())
                .id(userHandle)
                .build();

        // ✅ IMPORTANT: REQUIRED => pour que le login "discover" propose le compte
        StartRegistrationOptions startOpts = StartRegistrationOptions.builder()
                .user(userIdentity)
                .authenticatorSelection(AuthenticatorSelectionCriteria.builder()
                        .residentKey(ResidentKeyRequirement.REQUIRED)
                        .userVerification(UserVerificationRequirement.PREFERRED)
                        .build())
                .build();

        PublicKeyCredentialCreationOptions pkOptions = rp.startRegistration(startOpts);

        String requestId = UUID.randomUUID().toString();
        pendingReg.put(requestId, new PendingReg(email, pkOptions));

        final String publicKeyJson;
        try {
            publicKeyJson = sanitizeJsonExtensions(pkOptions.toCredentialsCreateJson());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Cannot serialize WebAuthn create options", e);
        }

        return Map.of(
                "requestId", requestId,
                "publicKey", jsonToMap(publicKeyJson)
        );
    }

    public void finishRegistration(String requestId, Object credentialObj) throws Exception {

        PendingReg pending = pendingReg.remove(requestId);
        if (pending == null) throw new RuntimeException("Registration request expired");

        String credentialJson = mapper.writeValueAsString(credentialObj);

        PublicKeyCredential<AuthenticatorAttestationResponse, ClientRegistrationExtensionOutputs> pkc =
                PublicKeyCredential.parseRegistrationResponseJson(credentialJson);

        FinishRegistrationOptions finishOpts = FinishRegistrationOptions.builder()
                .request(pending.pkOptions)
                .response(pkc)
                .build();

        RegistrationResult result = rp.finishRegistration(finishOpts);

        User user = userRepo.findByEmail(pending.email).orElseThrow();

        WebAuthnCredential c = new WebAuthnCredential();
        c.setUserId(user.getId());
        c.setCredentialId(result.getKeyId().getId().getBytes());
        c.setPublicKeyCose(result.getPublicKeyCose().getBytes());
        c.setSignatureCount(result.getSignatureCount());
        c.setCreatedAt(LocalDateTime.now());

        credRepo.save(c);
    }

    // =========================================================
    // LOGIN 1) username-first (email obligatoire) => filtré
    // =========================================================
    public Map<String, Object> startAssertion(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (credRepo.findAllByUserId(user.getId()).isEmpty()) {
            throw new IllegalArgumentException("No passkey registered for this account");
        }

        AssertionRequest request = rp.startAssertion(
                StartAssertionOptions.builder()
                        .username(email)
                        .userVerification(UserVerificationRequirement.PREFERRED)
                        .build()
        );

        String requestId = UUID.randomUUID().toString();
        pendingAuth.put(requestId, new PendingAuth(request));

        final String publicKeyJson;
        try {
            publicKeyJson = sanitizeJsonExtensions(
                    request.getPublicKeyCredentialRequestOptions().toCredentialsGetJson()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Cannot serialize WebAuthn get options", e);
        }

        return Map.of(
                "requestId", requestId,
                "publicKey", jsonToMap(publicKeyJson)
        );
    }

    // =========================================================
    // LOGIN 2) discover (sans email) => choisit le compte
    // =========================================================
    public Map<String, Object> startAssertionDiscover() {

        AssertionRequest request = rp.startAssertion(
                StartAssertionOptions.builder()
                        .userVerification(UserVerificationRequirement.PREFERRED)
                        .build()
        );

        String requestId = UUID.randomUUID().toString();
        pendingAuth.put(requestId, new PendingAuth(request));

        final String publicKeyJson;
        try {
            publicKeyJson = sanitizeJsonExtensions(
                    request.getPublicKeyCredentialRequestOptions().toCredentialsGetJson()
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Cannot serialize WebAuthn get options", e);
        }

        return Map.of(
                "requestId", requestId,
                "publicKey", jsonToMap(publicKeyJson)
        );
    }

    // =========================================================
    // VERIFY LOGIN + ISSUE JWT
    // =========================================================
    public String finishAssertionAndIssueJwt(String requestId, Object credentialObj) throws Exception {

        PendingAuth pending = pendingAuth.remove(requestId);
        if (pending == null) throw new RuntimeException("Auth request expired");

        String credentialJson = mapper.writeValueAsString(credentialObj);

        PublicKeyCredential<AuthenticatorAssertionResponse, ClientAssertionExtensionOutputs> pkc =
                PublicKeyCredential.parseAssertionResponseJson(credentialJson);

        AssertionResult result = rp.finishAssertion(
                FinishAssertionOptions.builder()
                        .request(pending.request())
                        .response(pkc)
                        .build()
        );

        if (!result.isSuccess()) {
            throw new RuntimeException("Passkey login failed");
        }

        byte[] credId = result.getCredential().getCredentialId().getBytes();

        WebAuthnCredential dbCred = credRepo.findByCredentialId(credId)
                .orElseThrow(() -> new RuntimeException("Unknown credential"));

        dbCred.setSignatureCount(result.getSignatureCount());
        credRepo.save(dbCred);

        User user = userRepo.findById(dbCred.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}