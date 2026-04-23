package pi.integrated.preevaluation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import pi.integrated.preevaluation.config.PreevaluationAiProperties;
import pi.integrated.preevaluation.dto.*;
import pi.integrated.preevaluation.entity.Option;
import pi.integrated.preevaluation.entity.PreevaluationAnswer;
import pi.integrated.preevaluation.entity.Question;
import pi.integrated.preevaluation.repository.PreevaluationAnswerRepository;
import pi.integrated.preevaluation.repository.PreevaluationResultRepository;
import pi.integrated.preevaluation.repository.QuestionRepository;
import pi.integrated.preevaluation.security.JwtRoleNormalizer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Service
@RequiredArgsConstructor
public class PreevaluationAiExplanationService {

    private static final Logger log = LoggerFactory.getLogger(PreevaluationAiExplanationService.class);

    private static final int MAX_INITIAL_EXPLANATION_CHARS = 12_000;
    private static final int MAX_CHAT_MESSAGE_CHARS = 4_000;
    private static final int MAX_USER_FOLLOWUP_CHARS = 2_000;
    private static final int MAX_PRIOR_MESSAGES = 10;

    private static final String SYSTEM_PROMPT = """
            You are a friendly English teacher. Explain in clear, simple English (CEFR-aware) why the student's \
            multiple-choice answer is wrong and why the correct option is right. Include the relevant grammar rule, \
            vocabulary nuance, or reading strategy when applicable, and end with one short example sentence that \
            illustrates the correct idea. Use short paragraphs or bullet points. Do not mention that you are an AI.""";

    private static final String FOLLOW_UP_SYSTEM_INSTRUCTIONS = """
            You continue helping the same student only about the mistake below. Stay on this question and these \
            answer options. Answer follow-up questions briefly and pedagogically. If they ask for French, you may \
            use French for explanations but keep English examples when useful for learning. Do not change the \
            correct answer. Do not discuss unrelated topics. Do not mention that you are an AI.""";

    private final PreevaluationAiProperties aiProperties;
    private final RestClient openAiRestClient;
    private final ObjectMapper objectMapper;
    private final PreevaluationResultRepository resultRepository;
    private final PreevaluationAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public ExplainMistakeResponse explainMistake(String userEmail, String role, ExplainMistakeRequest request) {
        requireStudent(role);
        if (resultRepository.findByUserEmail(userEmail).isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Pre-evaluation not completed yet");
        }

        List<PreevaluationAnswer> wrong = answerRepository.findByUserEmailAndIsCorrectFalse(userEmail);
        Optional<PreevaluationAnswer> match = wrong.stream()
                .filter(a -> a.getQuestion().getId().equals(request.getQuestionId()))
                .findFirst();
        if (match.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "This question is not in your incorrect answers");
        }

        Question q = questionRepository.findAllWithOptionsByIdIn(List.of(request.getQuestionId())).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Question not found"));

        PreevaluationAnswer row = match.get();
        String studentText = row.getSelectedOption().getText();
        String correctText = q.getOptions().stream()
                .filter(Option::isCorrect)
                .map(Option::getText)
                .findFirst()
                .orElse("");

        String apiKey = aiProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "AI explanations are not configured. Set GROQ_API_KEY (free tier: https://console.groq.com/keys) "
                            + "or use OpenAI with preevaluation.ai.provider=openai and OPENAI_API_KEY.");
        }
        apiKey = apiKey.trim();

        String userPrompt = buildUserPrompt(q.getText(), studentText, correctText, q.getCategory().name(), q.getLevel().name());

        String explanation = callChatCompletionsApi(apiKey, userPrompt);
        return ExplainMistakeResponse.builder().explanation(explanation).build();
    }

    @Transactional(readOnly = true)
    public FollowUpChatResponse followUpChat(String userEmail, String role, FollowUpChatRequest request) {
        requireStudent(role);
        if (resultRepository.findByUserEmail(userEmail).isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Pre-evaluation not completed yet");
        }

        List<PreevaluationAnswer> wrong = answerRepository.findByUserEmailAndIsCorrectFalse(userEmail);
        Optional<PreevaluationAnswer> match = wrong.stream()
                .filter(a -> a.getQuestion().getId().equals(request.getQuestionId()))
                .findFirst();
        if (match.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "This question is not in your incorrect answers");
        }

        Question q = questionRepository.findAllWithOptionsByIdIn(List.of(request.getQuestionId())).stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Question not found"));

        String studentText = match.get().getSelectedOption().getText();
        String correctText = q.getOptions().stream()
                .filter(Option::isCorrect)
                .map(Option::getText)
                .findFirst()
                .orElse("");

        List<ChatMessageDto> prior = new ArrayList<>(
                request.getPriorMessages() == null ? List.of() : request.getPriorMessages());
        if (prior.size() > MAX_PRIOR_MESSAGES) {
            prior = new ArrayList<>(prior.subList(prior.size() - MAX_PRIOR_MESSAGES, prior.size()));
        }
        validatePriorMessages(prior);

        String apiKey = aiProperties.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "AI explanations are not configured. Set GROQ_API_KEY (free tier: https://console.groq.com/keys) "
                            + "or use OpenAI with preevaluation.ai.provider=openai and OPENAI_API_KEY.");
        }
        apiKey = apiKey.trim();

        String initial = truncate(request.getInitialExplanation(), MAX_INITIAL_EXPLANATION_CHARS);
        String userMsg = truncate(request.getUserMessage().trim(), MAX_USER_FOLLOWUP_CHARS);

        String systemContent = buildFollowUpSystemContent(
                q.getText(), studentText, correctText, q.getCategory().name(), q.getLevel().name(), initial);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemContent));
        messages.add(Map.of("role", "assistant", "content", initial));

        for (ChatMessageDto m : prior) {
            String roleN = normalizeChatRole(m.getRole());
            messages.add(Map.of("role", roleN, "content", truncate(m.getContent(), MAX_CHAT_MESSAGE_CHARS)));
        }
        messages.add(Map.of("role", "user", "content", userMsg));

        String reply = postChatCompletion(apiKey, messages, 0.45, 900);
        return FollowUpChatResponse.builder().reply(reply).build();
    }

    private static void validatePriorMessages(List<ChatMessageDto> prior) {
        if (prior == null || prior.isEmpty()) {
            return;
        }
        String expected = "user";
        for (ChatMessageDto m : prior) {
            String r = m.getRole() == null ? "" : m.getRole().trim().toLowerCase();
            if (!"user".equals(r) && !"assistant".equals(r)) {
                throw new ResponseStatusException(BAD_REQUEST, "Invalid message role");
            }
            if (!expected.equals(r)) {
                throw new ResponseStatusException(BAD_REQUEST, "Invalid chat history order (expected alternating user/assistant).");
            }
            expected = "user".equals(r) ? "assistant" : "user";
        }
        if (!"user".equals(expected)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid chat history (expected complete assistant replies before a new question).");
        }
    }

    private static String normalizeChatRole(String role) {
        if (role == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid message role");
        }
        String r = role.trim().toLowerCase();
        if (!"user".equals(r) && !"assistant".equals(r)) {
            throw new ResponseStatusException(BAD_REQUEST, "Message role must be user or assistant");
        }
        return r;
    }

    private static String buildFollowUpSystemContent(String questionText, String studentAnswer, String correctAnswer,
                                                     String category, String level, String initialExplanation) {
        return FOLLOW_UP_SYSTEM_INSTRUCTIONS + """

                ---
                Question (%s, level %s): %s
                Student's wrong answer: %s
                Correct answer: %s
                ---
                Initial explanation already shown to the student:
                %s
                ---""".formatted(category, level, questionText, studentAnswer, correctAnswer, initialExplanation);
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        if (s.length() <= max) {
            return s;
        }
        return s.substring(0, max) + "…";
    }

    private static String buildUserPrompt(String question, String studentAnswer, String correctAnswer,
                                          String category, String level) {
        return """
                Question (%s, level %s):
                %s

                Student chose: %s
                Correct answer: %s

                Explain pedagogically for the student.""".formatted(category, level, question, studentAnswer, correctAnswer);
    }

    private String resolveBaseUrl() {
        String custom = aiProperties.getBaseUrl();
        if (custom != null && !custom.isBlank()) {
            String b = custom.trim();
            return b.endsWith("/") ? b.substring(0, b.length() - 1) : b;
        }
        return switch (aiProperties.getProvider()) {
            case GROQ -> "https://api.groq.com/openai";
            case OPENAI -> "https://api.openai.com";
        };
    }

    private String resolveModel() {
        String custom = aiProperties.getModel();
        if (custom != null && !custom.isBlank()) {
            return custom.trim();
        }
        return switch (aiProperties.getProvider()) {
            case GROQ -> "llama-3.1-8b-instant";
            case OPENAI -> "gpt-4o-mini";
        };
    }

    private String callChatCompletionsApi(String apiKey, String userPrompt) {
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", userPrompt)
        );
        return postChatCompletion(apiKey, messages, 0.35, 700);
    }

    private String postChatCompletion(String apiKey, List<Map<String, String>> messages, double temperature, int maxTokens) {
        String base = resolveBaseUrl();
        String model = resolveModel();

        List<Map<String, Object>> payloadMessages = new ArrayList<>();
        for (Map<String, String> m : messages) {
            payloadMessages.add(Map.of(
                    "role", m.get("role"),
                    "content", m.get("content")
            ));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("temperature", temperature);
        body.put("max_tokens", maxTokens);
        body.put("messages", payloadMessages);

        final String jsonBody;
        try {
            jsonBody = objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            log.error("Failed to serialize AI request body", e);
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "Internal error preparing AI request.");
        }

        final ResponseEntity<String> response;
        try {
            response = openAiRestClient.post()
                    .uri(base + "/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonBody)
                    .retrieve()
                    .toEntity(String.class);
        } catch (RestClientResponseException e) {
            String providerMsg = parseProviderErrorMessage(e.getResponseBodyAsString());
            log.warn("AI provider HTTP {} — {}", e.getStatusCode().value(), truncateForLog(e.getResponseBodyAsString(), 800));
            String detail = providerMsg != null ? providerMsg : "AI provider error (HTTP " + e.getStatusCode().value() + ").";
            int code = e.getStatusCode().value();
            HttpStatus clientStatus = (code == 401 || code == 403) ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_GATEWAY;
            throw new ResponseStatusException(clientStatus, detail);
        } catch (ResourceAccessException e) {
            log.warn("AI provider network error: {}", e.getMessage());
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "Could not connect to the AI service. Check your network and firewall, or try again later.");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.warn("AI provider request failed: {}", e.getMessage());
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "Unexpected error calling the AI service. Try again later.");
        }

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The AI service returned an error. Try again later.");
        }

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode content = root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                throw new ResponseStatusException(SERVICE_UNAVAILABLE, "Empty reply from AI. Try again.");
            }
            return content.asText().trim();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to parse AI response: {}", e.getMessage());
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "Could not parse AI response. Try again later.");
        }
    }

    private String parseProviderErrorMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode msg = root.path("error").path("message");
            if (msg.isTextual() && !msg.asText().isBlank()) {
                return msg.asText().trim();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private static String truncateForLog(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.replaceAll("\\s+", " ").trim();
        return t.length() <= max ? t : t.substring(0, max) + "…";
    }

    private void requireStudent(String role) {
        String r = JwtRoleNormalizer.normalize(role);
        if (!"STUDENT".equalsIgnoreCase(r)) {
            throw new ResponseStatusException(FORBIDDEN, "Pre-evaluation is for students only");
        }
    }
}
