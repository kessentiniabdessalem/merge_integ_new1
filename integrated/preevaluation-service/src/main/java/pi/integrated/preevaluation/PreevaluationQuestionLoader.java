package pi.integrated.preevaluation;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Component;
import pi.integrated.preevaluation.entity.Option;
import pi.integrated.preevaluation.entity.Question;
import pi.integrated.preevaluation.repository.QuestionRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Iterator;

@Component
@RequiredArgsConstructor
@Slf4j
public class PreevaluationQuestionLoader implements ApplicationRunner {

    private final QuestionRepository questionRepository;
    private final ResourcePatternResolver resourcePatternResolver;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Resource[] resources = resourcePatternResolver.getResources("classpath:niveau_json/preevaluation_questions_*.json");
        int added = 0;
        for (Resource resource : resources) {
            added += loadFile(resource);
        }
        log.info("Preevaluation JSON import finished (+{} new questions), total in DB={}", added, questionRepository.count());
    }

    private int loadFile(Resource resource) throws Exception {
        int added = 0;
        JsonNode root = objectMapper.readTree(resource.getInputStream());
        Iterator<String> names = root.fieldNames();
        if (!names.hasNext()) {
            return 0;
        }
        String levelKey = names.next();
        EnglishLevel level = EnglishLevel.valueOf(levelKey);
        JsonNode bucket = root.get(levelKey);
        added += loadCategory(bucket, level, "grammar", QuestionCategory.GRAMMAR);
        added += loadCategory(bucket, level, "vocabulary", QuestionCategory.VOCABULARY);
        added += loadCategory(bucket, level, "reading", QuestionCategory.READING);
        return added;
    }

    private int loadCategory(JsonNode bucket, EnglishLevel level, String jsonKey, QuestionCategory category) {
        JsonNode arr = bucket.get(jsonKey);
        if (arr == null || !arr.isArray()) {
            return 0;
        }
        int added = 0;
        for (JsonNode qnode : arr) {
            String text = qnode.get("text").asText();
            String sourceHash = sha256(level.name() + "|" + category.name() + "|" + text);
            if (questionRepository.findBySourceHash(sourceHash).isPresent()) {
                continue;
            }
            Question q = new Question();
            q.setText(text);
            q.setLevel(level);
            q.setCategory(category);
            q.setSourceHash(sourceHash);
            JsonNode opts = qnode.get("options");
            if (opts == null || !opts.isArray()) {
                continue;
            }
            int order = 0;
            for (JsonNode onode : opts) {
                Option o = new Option();
                o.setText(onode.get("text").asText());
                o.setCorrect(onode.get("isCorrect").asBoolean());
                o.setSortOrder(order++);
                o.setQuestion(q);
                q.getOptions().add(o);
            }
            questionRepository.save(q);
            added++;
        }
        return added;
    }

    private static String sha256(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(s.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
