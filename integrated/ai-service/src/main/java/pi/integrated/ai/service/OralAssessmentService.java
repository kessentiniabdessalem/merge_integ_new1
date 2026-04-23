package pi.integrated.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pi.integrated.ai.dto.OralAssessmentItem;
import pi.integrated.ai.dto.OralAssessmentRequest;
import pi.integrated.ai.dto.OralAssessmentResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Service
public class OralAssessmentService {

    private static final Logger log = LoggerFactory.getLogger(OralAssessmentService.class);

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public OralAssessmentService(GeminiService geminiService) {
        this.geminiService = geminiService;
        this.objectMapper = new ObjectMapper();
    }

    public OralAssessmentResponse evaluate(OralAssessmentRequest req) {
        String system = buildSystemPrompt(req);
        String user = buildUserPayload(req);
        String full = system + "\n\n" + user;

        String json = geminiService.generateJson(full, 0.2, 4096);
        return parseResponse(json);
    }

    private String buildSystemPrompt(OralAssessmentRequest req) {
        String lang = req.getLanguage() != null ? req.getLanguage().toLowerCase(Locale.ROOT) : "fr";
        String target = req.getTargetLevel() != null ? req.getTargetLevel() : "B2";
        return """
                Tu es un examinateur CEFR pour un entretien oral professionnel.
                Langue de l'entretien: %s (réponses du candidat dans cette langue).
                Niveau visé par le poste: %s.
                Tu dois estimer le niveau global CEFR (A1, A2, B1, B2, C1, C2) à partir des échanges fournis.
                Règles:
                - Si le candidat refuse systématiquement de répondre, donne des réponses vides ou hors sujet, baisse fortement le niveau (souvent A2-B1).
                - Si session terminée tôt ou strikes anti-triche élevés, pénalise la confiance et le niveau.
                - Réponds UNIQUEMENT par un objet JSON valide, sans markdown, sans texte avant/après.
                Schéma JSON obligatoire:
                {
                  "cefrLevel": "A1|A2|B1|B2|C1|C2",
                  "confidence": 0.0 à 1.0,
                  "strengthsFr": ["point court en français", "..."],
                  "weaknessesFr": ["point court en français", "..."],
                  "summaryFr": "résumé court en français",
                  "summaryEn": "short summary in English"
                }
                """.formatted(lang, target);
    }

    private String buildUserPayload(OralAssessmentRequest req) {
        StringBuilder sb = new StringBuilder();
        sb.append("Contexte: strikes=").append(req.getSecurityStrikes());
        sb.append(", sessionTerminatedEarly=").append(req.isSessionTerminatedEarly());
        sb.append("\nÉchanges:\n");
        int i = 1;
        for (OralAssessmentItem item : req.getItems()) {
            sb.append(i++).append(". Q: ").append(nullToEmpty(item.getQuestion())).append("\n");
            sb.append("   R: ").append(nullToEmpty(item.getAnswer())).append("\n");
        }
        return sb.toString();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    private OralAssessmentResponse parseResponse(String json) {
        try {
            JsonNode n = objectMapper.readTree(json);
            return OralAssessmentResponse.builder()
                    .cefrLevel(n.path("cefrLevel").asText("B1"))
                    .confidence(n.path("confidence").isMissingNode() ? 0.5 : n.path("confidence").asDouble(0.5))
                    .strengthsFr(readStringList(n.path("strengthsFr")))
                    .weaknessesFr(readStringList(n.path("weaknessesFr")))
                    .summaryFr(n.path("summaryFr").asText(""))
                    .summaryEn(n.path("summaryEn").asText(""))
                    .provider("gemini")
                    .build();
        } catch (Exception e) {
            log.warn("Parse JSON assessment failed, raw: {}", json.length() > 500 ? json.substring(0, 500) + "..." : json, e);
            return OralAssessmentResponse.builder()
                    .cefrLevel("B1")
                    .confidence(0.3)
                    .strengthsFr(Collections.emptyList())
                    .weaknessesFr(List.of("Impossible d'analyser la réponse du modèle."))
                    .summaryFr("")
                    .summaryEn("")
                    .provider("gemini-parse-error")
                    .build();
        }
    }

    private static List<String> readStringList(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return Collections.emptyList();
        }
        if (node.isArray()) {
            List<String> out = new ArrayList<>();
            for (JsonNode x : node) {
                String t = x.asText("").trim();
                if (!t.isEmpty()) {
                    out.add(t);
                }
            }
            return out;
        }
        String single = node.asText("").trim();
        return single.isEmpty() ? Collections.emptyList() : List.of(single);
    }
}
