package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.QuizAttemptResponseDTO;
import pi.integrated.quiz.dto.QuizAttemptSubmitDTO;
import pi.integrated.quiz.exception.ResourceNotFoundException;
import pi.integrated.quiz.model.Question;
import pi.integrated.quiz.model.Quiz;
import pi.integrated.quiz.model.QuizAttempt;
import pi.integrated.quiz.repository.QuestionRepository;
import pi.integrated.quiz.repository.QuizAttemptRepository;
import pi.integrated.quiz.repository.QuizRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public QuizAttemptResponseDTO submitAttempt(QuizAttemptSubmitDTO dto) {
        Quiz quiz = quizRepository.findById(dto.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", dto.getQuizId()));

        List<Question> questions = questionRepository.findByQuizIdOrderByOrderIndex(dto.getQuizId());
        Map<Long, String> submittedAnswers = dto.getAnswers();

        float earnedPoints = 0;
        int totalPoints = 0;

        for (Question question : questions) {
            int qPoints = question.getPoints() != null ? question.getPoints() : 1;
            totalPoints += qPoints;

            String submittedAnswer = submittedAnswers.get(question.getId());
            if (submittedAnswer != null &&
                    submittedAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim())) {
                earnedPoints += qPoints;
            }
        }

        float scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
        float passingScore = quiz.getPassingScore() != null ? quiz.getPassingScore() : 50.0f;
        boolean passed = scorePercentage >= passingScore;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudentId(dto.getStudentId());
        attempt.setStudentName(dto.getStudentName());
        attempt.setScore(earnedPoints);
        attempt.setTotalPoints(totalPoints);
        attempt.setPassed(passed);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setTimeSpentMinutes(dto.getTimeSpentMinutes());

        try {
            attempt.setAnswers(objectMapper.writeValueAsString(submittedAnswers));
        } catch (JsonProcessingException e) {
            attempt.setAnswers("{}");
        }

        QuizAttempt saved = attemptRepository.save(attempt);

        String message = passed
                ? "Congratulations! You passed the quiz with a score of " + String.format("%.1f", scorePercentage) + "%!"
                : "You did not pass. Your score was " + String.format("%.1f", scorePercentage) + "%. Required: " + String.format("%.1f", passingScore) + "%";

        return mapToResponseDTO(saved, message);
    }

    @Override
    public List<QuizAttemptResponseDTO> getAttemptsByQuiz(Long quizId) {
        return attemptRepository.findByQuizId(quizId).stream()
                .map(a -> mapToResponseDTO(a, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizAttemptResponseDTO> getAttemptsByStudent(Long studentId) {
        return attemptRepository.findByStudentId(studentId).stream()
                .map(a -> mapToResponseDTO(a, null))
                .collect(Collectors.toList());
    }

    @Override
    public QuizAttemptResponseDTO getAttemptById(Long id) {
        QuizAttempt attempt = attemptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuizAttempt", "id", id));
        return mapToResponseDTO(attempt, null);
    }

    private QuizAttemptResponseDTO mapToResponseDTO(QuizAttempt attempt, String message) {
        QuizAttemptResponseDTO dto = new QuizAttemptResponseDTO();
        dto.setId(attempt.getId());
        dto.setQuizId(attempt.getQuizId());
        dto.setStudentId(attempt.getStudentId());
        dto.setStudentName(attempt.getStudentName());
        dto.setScore(attempt.getScore());
        dto.setTotalPoints(attempt.getTotalPoints());
        dto.setPassed(attempt.getPassed());
        dto.setMessage(message != null ? message : (attempt.getPassed() != null && attempt.getPassed() ? "Passed" : "Failed"));
        dto.setTimeSpentMinutes(attempt.getTimeSpentMinutes());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setCompletedAt(attempt.getCompletedAt());
        return dto;
    }
}
