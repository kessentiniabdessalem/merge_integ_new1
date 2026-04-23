package pi.integrated.preevaluation;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;
import pi.integrated.preevaluation.client.UserProfileSyncClient;
import pi.integrated.preevaluation.dto.*;
import pi.integrated.preevaluation.entity.*;
import pi.integrated.preevaluation.repository.*;
import pi.integrated.preevaluation.security.JwtRoleNormalizer;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static pi.integrated.preevaluation.QuestionCategory.GRAMMAR;
import static pi.integrated.preevaluation.QuestionCategory.READING;
import static pi.integrated.preevaluation.QuestionCategory.VOCABULARY;

@Service
@RequiredArgsConstructor
public class PreevaluationService {

    private static final int PER_CATEGORY = 4;
    private static final int TOTAL_PER_LEVEL = 12;
    private static final int PASS_THRESHOLD = 8;

    private final QuestionRepository questionRepository;
    private final PreevaluationProfileRepository profileRepository;
    private final PreevaluationResultRepository resultRepository;
    private final PreevaluationAnswerRepository answerRepository;
    private final PreevaluationLevelSelectionRepository selectionRepository;
    private final PreevaluationFraudTrackingRepository fraudTrackingRepository;
    private final PreevaluationFraudLogRepository fraudLogRepository;
    private final UserProfileSyncClient userProfileSyncClient;

    @Transactional(readOnly = true)
    public PreevaluationStatusResponse getStatus(String userEmail, String role) {
        if (!"STUDENT".equalsIgnoreCase(JwtRoleNormalizer.normalize(role))) {
            return PreevaluationStatusResponse.builder()
                    .completed(true)
                    .profileCompleted(true)
                    .needsPreevaluation(false)
                    .terminatedForCheating(false)
                    .fraudFirstStrikeConsumed(false)
                    .build();
        }

        Optional<PreevaluationResult> result = resultRepository.findByUserEmail(userEmail);
        if (result.isPresent()) {
            return PreevaluationStatusResponse.builder()
                    .completed(true)
                    .profileCompleted(true)
                    .finalLevel(result.get().getFinalLevel().name())
                    .needsPreevaluation(false)
                    .terminatedForCheating(false)
                    .fraudFirstStrikeConsumed(false)
                    .build();
        }

        Optional<PreevaluationFraudTracking> fraudOpt = fraudTrackingRepository.findByUserEmail(userEmail);
        boolean terminated = fraudOpt.map(PreevaluationFraudTracking::isTerminatedForCheating).orElse(false);
        boolean firstConsumed = fraudOpt.map(PreevaluationFraudTracking::isFirstStrikeConsumed).orElse(false);

        boolean profileDone = profileRepository.findByUserEmail(userEmail).isPresent();
        String active = selectionRepository
                .findFirstByUserEmailAndSubmittedFalseOrderByIdDesc(userEmail)
                .map(s -> s.getLevel().name())
                .orElse(null);

        return PreevaluationStatusResponse.builder()
                .completed(false)
                .profileCompleted(profileDone)
                .activeLevel(active)
                .needsPreevaluation(true)
                .terminatedForCheating(terminated)
                .fraudFirstStrikeConsumed(firstConsumed)
                .build();
    }

    @Transactional
    public FraudReportResponse reportFraud(String userEmail, String role, FraudReportRequest request) {
        requireStudent(role);
        if (resultRepository.findByUserEmail(userEmail).isPresent()) {
            return FraudReportResponse.builder()
                    .action("IGNORED")
                    .message("Pre-evaluation already completed.")
                    .build();
        }
        profileRepository.findByUserEmail(userEmail).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pre-evaluation test has not started"));

        String reason = request != null && request.getReason() != null && !request.getReason().isBlank()
                ? request.getReason().trim().substring(0, Math.min(64, request.getReason().trim().length()))
                : "UNKNOWN";

        PreevaluationFraudTracking tracking = fraudTrackingRepository.findByUserEmail(userEmail)
                .orElseGet(() -> {
                    PreevaluationFraudTracking t = PreevaluationFraudTracking.builder()
                            .userEmail(userEmail)
                            .firstStrikeConsumed(false)
                            .terminatedForCheating(false)
                            .build();
                    return fraudTrackingRepository.save(t);
                });

        fraudLogRepository.save(PreevaluationFraudLog.builder()
                .userEmail(userEmail)
                .reason(reason)
                .createdAt(Instant.now())
                .build());

        if (tracking.isTerminatedForCheating()) {
            return FraudReportResponse.builder()
                    .action("TERMINATED")
                    .message("Cheating attempt detected again. Your preevaluation has been terminated.")
                    .build();
        }

        if (!tracking.isFirstStrikeConsumed()) {
            tracking.setFirstStrikeConsumed(true);
            fraudTrackingRepository.save(tracking);
            wipeTestProgress(userEmail);
            return FraudReportResponse.builder()
                    .action("FIRST_STRIKE_RESTART")
                    .message("Cheating attempt detected. You have one last chance. The test will restart with new questions.")
                    .build();
        }

        tracking.setTerminatedForCheating(true);
        fraudTrackingRepository.save(tracking);
        wipeTestProgress(userEmail);
        return FraudReportResponse.builder()
                .action("TERMINATED")
                .message("Cheating attempt detected again. Your preevaluation has been terminated.")
                .build();
    }

    @Transactional
    public void wipeTestProgress(String userEmail) {
        answerRepository.deleteAllByUserEmail(userEmail);
        List<PreevaluationLevelSelection> selections = selectionRepository.findAllByUserEmail(userEmail);
        if (!selections.isEmpty()) {
            selectionRepository.deleteAll(selections);
        }
    }

    @Transactional
    public void saveProfile(String userEmail, String role, PreevaluationProfileRequest request) {
        requireStudent(role);
        assertNotTerminatedForCheating(userEmail);
        if (resultRepository.findByUserEmail(userEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pre-evaluation already completed");
        }
        PreevaluationProfile profile = profileRepository.findByUserEmail(userEmail)
                .orElseGet(() -> PreevaluationProfile.builder()
                        .userEmail(userEmail)
                        .build());
        profile.setStudiedBefore(Boolean.TRUE.equals(request.getStudiedBefore()));
        profile.setFrequency(request.getFrequency());
        profile.setGoal(request.getGoal());
        profileRepository.save(profile);
    }

    @Transactional
    public LevelStartResponse startLevel(String userEmail, String role, EnglishLevel level) {
        requireStudent(role);
        assertNotTerminatedForCheating(userEmail);
        if (resultRepository.findByUserEmail(userEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pre-evaluation already completed");
        }
        profileRepository.findByUserEmail(userEmail).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete profile first"));

        Optional<PreevaluationLevelSelection> existingOpen =
                selectionRepository.findByUserEmailAndLevelAndSubmittedFalse(userEmail, level);
        if (existingOpen.isPresent()) {
            return toStartResponse(existingOpen.get());
        }

        Optional<PreevaluationLevelSelection> otherOpen =
                selectionRepository.findFirstByUserEmailAndSubmittedFalseOrderByIdDesc(userEmail);
        if (otherOpen.isPresent() && otherOpen.get().getLevel() != level) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Finish level " + otherOpen.get().getLevel() + " first");
        }

        EnglishLevel expected = computeNextLevelToStart(userEmail);
        if (level != expected) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Expected level " + expected.name() + " but got " + level.name());
        }

        List<Question> picked = pickTwelveQuestions(level);
        PreevaluationLevelSelection sel = PreevaluationLevelSelection.builder()
                .userEmail(userEmail)
                .level(level)
                .submitted(false)
                .passed(false)
                .questionIds(picked.stream().map(Question::getId).toList())
                .build();
        selectionRepository.save(sel);
        return toStartResponse(sel);
    }

    @Transactional
    public LevelSubmitResponse submitLevel(String userEmail, String role, EnglishLevel level, LevelSubmitRequest request) {
        requireStudent(role);
        assertNotTerminatedForCheating(userEmail);
        if (resultRepository.findByUserEmail(userEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pre-evaluation already completed");
        }

        PreevaluationLevelSelection sel = selectionRepository
                .findByUserEmailAndLevelAndSubmittedFalse(userEmail, level)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No open session for this level"));

        Set<Long> allowed = new HashSet<>(sel.getQuestionIds());
        if (request.getAnswers() == null || request.getAnswers().size() != TOTAL_PER_LEVEL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected " + TOTAL_PER_LEVEL + " answers");
        }
        Set<Long> answeredQs = new HashSet<>();
        for (LevelSubmitRequest.AnswerItem item : request.getAnswers()) {
            if (!answeredQs.add(item.getQuestionId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate question in answers");
            }
            if (!allowed.contains(item.getQuestionId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid question for this level session");
            }
        }

        List<Question> questions = questionRepository.findAllWithOptionsByIdIn(allowed);
        Map<Long, Question> byId = questions.stream().collect(Collectors.toMap(Question::getId, Function.identity()));

        int score = 0;
        for (LevelSubmitRequest.AnswerItem item : request.getAnswers()) {
            Question q = byId.get(item.getQuestionId());
            if (q == null || q.getLevel() != level) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question does not match level");
            }
            Option selected = q.getOptions().stream()
                    .filter(o -> o.getId().equals(item.getSelectedOptionId()))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid option for question"));

            boolean ok = selected.isCorrect();
            if (ok) {
                score++;
            }
            PreevaluationAnswer row = PreevaluationAnswer.builder()
                    .userEmail(userEmail)
                    .question(q)
                    .selectedOption(selected)
                    .isCorrect(ok)
                    .build();
            answerRepository.save(row);
        }

        boolean passed = score >= PASS_THRESHOLD;
        sel.setSubmitted(true);
        sel.setPassed(passed);
        selectionRepository.save(sel);

        if (!passed) {
            EnglishLevel finalLevel = resolveLastValidatedLevel(userEmail);
            finishWithResult(userEmail, finalLevel);
            return LevelSubmitResponse.builder()
                    .score(score)
                    .passed(false)
                    .finished(true)
                    .finalLevel(finalLevel)
                    .nextLevel(null)
                    .build();
        }

        if (level == EnglishLevel.C2) {
            finishWithResult(userEmail, EnglishLevel.C2);
            return LevelSubmitResponse.builder()
                    .score(score)
                    .passed(true)
                    .finished(true)
                    .finalLevel(EnglishLevel.C2)
                    .nextLevel(null)
                    .build();
        }

        EnglishLevel next = Objects.requireNonNull(level.nextOrNull());
        return LevelSubmitResponse.builder()
                .score(score)
                .passed(true)
                .finished(false)
                .finalLevel(null)
                .nextLevel(next)
                .build();
    }

    private EnglishLevel resolveLastValidatedLevel(String userEmail) {
        List<PreevaluationLevelSelection> passedOk =
                selectionRepository.findAllByUserEmailAndSubmittedTrueAndPassedTrue(userEmail);
        if (passedOk.isEmpty()) {
            return EnglishLevel.A1;
        }
        return passedOk.stream()
                .map(PreevaluationLevelSelection::getLevel)
                .max(Comparator.comparingInt(Enum::ordinal))
                .orElse(EnglishLevel.A1);
    }

    private void finishWithResult(String userEmail, EnglishLevel finalLevel) {
        PreevaluationResult r = PreevaluationResult.builder()
                .userEmail(userEmail)
                .finalLevel(finalLevel)
                .completedAt(Instant.now())
                .build();
        resultRepository.save(r);
        fraudTrackingRepository.deleteByUserEmail(userEmail);
        syncUserFinalLevel(finalLevel);
    }

    private void syncUserFinalLevel(EnglishLevel finalLevel) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return;
        }
        HttpServletRequest req = attrs.getRequest();
        String auth = req.getHeader(HttpHeaders.AUTHORIZATION);
        userProfileSyncClient.syncFinalLevel(auth, finalLevel.name());
    }

    private void assertNotTerminatedForCheating(String userEmail) {
        fraudTrackingRepository.findByUserEmail(userEmail)
                .filter(PreevaluationFraudTracking::isTerminatedForCheating)
                .ifPresent(t -> {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pre-evaluation terminated for cheating");
                });
    }

    private void requireStudent(String role) {
        String r = JwtRoleNormalizer.normalize(role);
        if (!"STUDENT".equalsIgnoreCase(r)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pre-evaluation is for students only");
        }
    }

    private EnglishLevel computeNextLevelToStart(String userEmail) {
        List<PreevaluationLevelSelection> passed = selectionRepository.findAllByUserEmailAndSubmittedTrueAndPassedTrue(userEmail);
        if (passed.isEmpty()) {
            return EnglishLevel.A1;
        }
        EnglishLevel max = passed.stream()
                .map(PreevaluationLevelSelection::getLevel)
                .max(Comparator.comparingInt(Enum::ordinal))
                .orElse(EnglishLevel.A1);
        EnglishLevel next = max.nextOrNull();
        if (next == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All levels already passed");
        }
        return next;
    }

    private List<Question> pickTwelveQuestions(EnglishLevel level) {
        ensurePool(level, QuestionCategory.GRAMMAR);
        ensurePool(level, QuestionCategory.VOCABULARY);
        ensurePool(level, QuestionCategory.READING);

        List<Question> g = pickRandomSubset(level, QuestionCategory.GRAMMAR, PER_CATEGORY);
        List<Question> v = pickRandomSubset(level, QuestionCategory.VOCABULARY, PER_CATEGORY);
        List<Question> r = pickRandomSubset(level, QuestionCategory.READING, PER_CATEGORY);
        if (g.size() < PER_CATEGORY || v.size() < PER_CATEGORY || r.size() < PER_CATEGORY) {
            throw new IllegalStateException("Not enough questions in bank for level " + level);
        }
        List<Question> all = new ArrayList<>();
        all.addAll(g);
        all.addAll(v);
        all.addAll(r);
        Collections.shuffle(all, new Random());
        return all;
    }

    private List<Question> pickRandomSubset(EnglishLevel level, QuestionCategory category, int limit) {
        List<Question> pool = new ArrayList<>(questionRepository.findByLevelAndCategory(level, category));
        Collections.shuffle(pool, new Random());
        return pool.stream().limit(limit).toList();
    }

    private void ensurePool(EnglishLevel level, QuestionCategory cat) {
        long n = questionRepository.countByLevelAndCategory(level, cat);
        if (n < PER_CATEGORY) {
            throw new IllegalStateException("Question bank too small for " + level + " / " + cat);
        }
    }

    @Transactional(readOnly = true)
    public PreevaluationResultReviewResponse getResultReview(String userEmail, String role) {
        requireStudent(role);
        PreevaluationResult result = resultRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pre-evaluation not completed yet"));

        List<PreevaluationAnswer> wrong = answerRepository.findByUserEmailAndIsCorrectFalse(userEmail);
        Set<Long> qids = wrong.stream().map(a -> a.getQuestion().getId()).collect(Collectors.toSet());
        Map<Long, Question> withOpts = qids.isEmpty()
                ? Map.of()
                : questionRepository.findAllWithOptionsByIdIn(qids).stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        Map<QuestionCategory, Integer> errByCat = new EnumMap<>(QuestionCategory.class);
        for (QuestionCategory c : QuestionCategory.values()) {
            errByCat.put(c, 0);
        }

        List<IncorrectAnswerItemDto> items = new ArrayList<>();
        for (PreevaluationAnswer a : wrong) {
            Question q = withOpts.get(a.getQuestion().getId());
            if (q == null) {
                continue;
            }
            String correctText = q.getOptions().stream()
                    .filter(Option::isCorrect)
                    .map(Option::getText)
                    .findFirst()
                    .orElse("");
            errByCat.merge(q.getCategory(), 1, Integer::sum);
            items.add(IncorrectAnswerItemDto.builder()
                    .questionId(q.getId())
                    .questionText(q.getText())
                    .selectedAnswerText(a.getSelectedOption().getText())
                    .correctAnswerText(correctText)
                    .category(q.getCategory().name())
                    .categoryLabel(formatCategoryLabel(q.getCategory()))
                    .level(q.getLevel().name())
                    .build());
        }

        items.sort(Comparator
                .comparing(IncorrectAnswerItemDto::getLevel)
                .thenComparing(IncorrectAnswerItemDto::getCategory));

        List<Map.Entry<QuestionCategory, Integer>> sortedCats = errByCat.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .sorted((x, y) -> Integer.compare(y.getValue(), x.getValue()))
                .toList();

        String mainWeakness = sortedCats.isEmpty() ? null : formatCategoryLabel(sortedCats.get(0).getKey());
        String secondaryWeakness = sortedCats.size() >= 2 ? formatCategoryLabel(sortedCats.get(1).getKey()) : null;
        String readingNote = buildReadingAssessment(errByCat, sortedCats);

        EnglishLevel failedLevel = selectionRepository
                .findFirstByUserEmailAndSubmittedTrueAndPassedFalseOrderByIdDesc(userEmail)
                .map(PreevaluationLevelSelection::getLevel)
                .orElse(null);

        List<String> globalLines = buildGlobalSummaryLines(result.getFinalLevel(), errByCat, mainWeakness, secondaryWeakness, readingNote);

        return PreevaluationResultReviewResponse.builder()
                .finalLevel(result.getFinalLevel().name())
                .failedLevel(failedLevel != null ? failedLevel.name() : null)
                .incorrectAnswers(items)
                .mainWeakness(mainWeakness)
                .secondaryWeakness(secondaryWeakness)
                .readingAssessment(readingNote)
                .globalSummaryLines(globalLines)
                .build();
    }

    private static String formatCategoryLabel(QuestionCategory c) {
        return switch (c) {
            case GRAMMAR -> "Grammar";
            case VOCABULARY -> "Vocabulary";
            case READING -> "Reading";
        };
    }

    private static String buildReadingAssessment(Map<QuestionCategory, Integer> errByCat,
                                                   List<Map.Entry<QuestionCategory, Integer>> sortedCats) {
        int readErr = errByCat.getOrDefault(READING, 0);
        int grammarErr = errByCat.getOrDefault(GRAMMAR, 0);
        int vocabErr = errByCat.getOrDefault(VOCABULARY, 0);
        int totalWrong = grammarErr + vocabErr + readErr;

        if (totalWrong == 0) {
            return "No incorrect answers were recorded.";
        }
        if (readErr == 0) {
            return "You had no incorrect Reading items in this pre-evaluation — keep reinforcing grammar and vocabulary too.";
        }
        int maxOther = Math.max(grammarErr, vocabErr);
        if (readErr > maxOther) {
            return "Reading needs improvement.";
        }
        if (readErr <= maxOther / 2 && maxOther > 0) {
            return "Your reading comprehension is acceptable but needs improvement compared with your other skills.";
        }
        if (sortedCats.size() == 1 && sortedCats.get(0).getKey() == READING) {
            return "Reading needs improvement.";
        }
        return "Reading is part of the mix of skills to strengthen; keep practising close reading and inference.";
    }

    private List<String> buildGlobalSummaryLines(EnglishLevel finalLevel,
                                                 Map<QuestionCategory, Integer> errByCat,
                                                 String mainWeakness,
                                                 String secondaryWeakness,
                                                 String readingNote) {
        List<String> lines = new ArrayList<>();
        String fl = finalLevel.name();
        int totalWrong = errByCat.values().stream().mapToInt(Integer::intValue).sum();

        if (mainWeakness != null) {
            if ("Grammar".equals(mainWeakness)) {
                lines.add("Your main problem is grammar — especially accurate sentence structure, tenses, and agreement.");
            } else {
                lines.add("Your main weakness is " + mainWeakness.toLowerCase() + " at your current placement (" + fl + ").");
            }
        }
        if (secondaryWeakness != null) {
            lines.add("You need more practice in " + secondaryWeakness.toLowerCase() + " to balance your skills.");
        }
        lines.add(readingNote);
        if (totalWrong <= 4) {
            lines.add("The number of mistakes is moderate; reviewing the items below with short daily practice should help quickly.");
        } else {
            lines.add("Use the list below as a focused checklist and repeat similar exercises around level " + fl + ".");
        }
        return lines;
    }

    private LevelStartResponse toStartResponse(PreevaluationLevelSelection sel) {
        List<Long> ids = sel.getQuestionIds();
        List<Question> loaded = questionRepository.findAllWithOptionsByIdIn(ids);
        Map<Long, Question> byId = loaded.stream().collect(Collectors.toMap(Question::getId, Function.identity()));

        List<QuestionPublicDto> dtos = new ArrayList<>();
        for (Long id : ids) {
            Question q = byId.get(id);
            if (q == null) {
                continue;
            }
            List<OptionPublicDto> opts = q.getOptions().stream()
                    .map(o -> OptionPublicDto.builder().id(o.getId()).text(o.getText()).build())
                    .toList();
            dtos.add(QuestionPublicDto.builder()
                    .id(q.getId())
                    .text(q.getText())
                    .category(q.getCategory())
                    .options(opts)
                    .build());
        }

        return LevelStartResponse.builder()
                .level(sel.getLevel())
                .expectedCount(TOTAL_PER_LEVEL)
                .questions(dtos)
                .build();
    }
}
