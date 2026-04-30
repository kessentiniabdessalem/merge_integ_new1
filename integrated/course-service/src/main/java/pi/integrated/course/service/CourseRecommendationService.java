package pi.integrated.course.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.integrated.course.dto.RecommendationRequest;
import pi.integrated.course.dto.RecommendedCourseResponse;
import pi.integrated.course.entity.Course;
import pi.integrated.course.repository.CourseRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseRecommendationService {

    private static final int MIN_RESULTS = 3;
    private static final int MAX_RESULTS = 6;

    /**
     * CEFR → course level label (must match values stored in Course.level).
     * Also provides the next level for bridge recommendations.
     */
    private static final Map<String, String> CEFR_TO_LEVEL = Map.of(
            "A1", "Beginner",
            "A2", "Elementary",
            "B1", "Intermediate",
            "B2", "Upper Intermediate",
            "C1", "Advanced",
            "C2", "Proficient"
    );

    private static final List<String> CEFR_ORDER = List.of("A1", "A2", "B1", "B2", "C1", "C2");

    /**
     * Preevaluation category → course category names.
     * One preevaluation weakness can match several course categories.
     */
    private static final Map<String, List<String>> WEAKNESS_TO_CATEGORIES = Map.of(
            "Grammar",    List.of("Grammar"),
            "Vocabulary", List.of("Vocabulary", "Speaking"),
            "Reading",    List.of("Exam Preparation", "Reading")
    );

    private final CourseRepository courseRepository;

    public List<RecommendedCourseResponse> recommend(RecommendationRequest req) {
        String cefr          = normalise(req.getCefrLevel());
        String currentLevel  = CEFR_TO_LEVEL.getOrDefault(cefr, "Beginner");
        String nextLevel     = nextCefrLevel(cefr).map(CEFR_TO_LEVEL::get).orElse(null);
        Set<Long> completed  = new HashSet<>(
                req.getCompletedCourseIds() == null ? Collections.emptyList() : req.getCompletedCourseIds()
        );

        List<String> mainCategories =
                courseCategories(req.getMainWeakness());
        List<String> secondaryCategories =
                courseCategories(req.getSecondaryWeakness());

        List<Course> candidates = courseRepository.findAll().stream()
                .filter(c -> !completed.contains(c.getId()))
                .collect(Collectors.toList());

        // Score + reason
        record Scored(Course course, int score, String reason) {}
        List<Scored> scored = new ArrayList<>();

        for (Course c : candidates) {
            int score = 0;
            String reason = null;

            boolean matchesMain      = mainCategories.contains(c.getCategory());
            boolean matchesSecondary = secondaryCategories.contains(c.getCategory());
            boolean matchesLevel     = currentLevel.equalsIgnoreCase(c.getLevel());
            boolean matchesNext      = nextLevel != null && nextLevel.equalsIgnoreCase(c.getLevel());

            if (matchesMain) {
                score += 4;
                reason = "Because your " + req.getMainWeakness() + " skills need improvement";
            } else if (matchesSecondary) {
                score += 2;
                reason = "Because " + req.getSecondaryWeakness() + " is a secondary area to strengthen";
            }

            if (matchesLevel) {
                score += 3;
                if (reason == null) {
                    reason = "Because this course matches your current level (" + cefr + ")";
                }
            } else if (matchesNext) {
                score += 1;
                if (reason == null) {
                    reason = "To help you progress toward the next level";
                }
            }

            if (score == 0) continue;
            scored.add(new Scored(c, score, reason != null ? reason : "Recommended based on your English profile"));
        }

        scored.sort(Comparator.comparingInt(Scored::score).reversed());

        List<RecommendedCourseResponse> results = scored.stream()
                .limit(MAX_RESULTS)
                .map(s -> toResponse(s.course(), s.reason()))
                .collect(Collectors.toList());

        // Fallback: if fewer than MIN_RESULTS, fill with same-level courses (no score filter)
        if (results.size() < MIN_RESULTS) {
            Set<Long> already = results.stream().map(RecommendedCourseResponse::getId).collect(Collectors.toSet());
            candidates.stream()
                    .filter(c -> !already.contains(c.getId()))
                    .filter(c -> currentLevel.equalsIgnoreCase(c.getLevel()))
                    .limit(MIN_RESULTS - results.size())
                    .forEach(c -> results.add(toResponse(c, "Because this course matches your current level (" + cefr + ")")));
        }

        return results;
    }

    private RecommendedCourseResponse toResponse(Course c, String reason) {
        return RecommendedCourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .category(c.getCategory())
                .level(c.getLevel())
                .description(c.getDescription())
                .duration(c.getDuration())
                .price(c.getPrice())
                .teacher(c.getTeacher())
                .image(c.getImage())
                .thumbnail(c.getThumbnail())
                .studentsCount(c.getStudentsCount())
                .createdAt(c.getCreatedAt())
                .reason(reason)
                .build();
    }

    private List<String> courseCategories(String weakness) {
        if (weakness == null || weakness.isBlank()) return Collections.emptyList();
        return WEAKNESS_TO_CATEGORIES.getOrDefault(weakness, Collections.emptyList());
    }

    private String normalise(String raw) {
        if (raw == null) return "A1";
        String u = raw.trim().toUpperCase();
        return CEFR_ORDER.contains(u) ? u : "A1";
    }

    private Optional<String> nextCefrLevel(String cefr) {
        int i = CEFR_ORDER.indexOf(cefr);
        return (i >= 0 && i < CEFR_ORDER.size() - 1)
                ? Optional.of(CEFR_ORDER.get(i + 1))
                : Optional.empty();
    }
}
