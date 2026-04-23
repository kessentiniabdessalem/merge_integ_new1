package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.*;
import pi.integrated.quiz.exception.ResourceNotFoundException;
import pi.integrated.quiz.model.Quiz;
import pi.integrated.quiz.model.QuizStatus;
import pi.integrated.quiz.repository.FeedbackRepository;
import pi.integrated.quiz.repository.QuestionRepository;
import pi.integrated.quiz.repository.QuizAttemptRepository;
import pi.integrated.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final FeedbackRepository feedbackRepository;
    
    @Override
    @Transactional
    public QuizResponseDTO createQuiz(QuizCreateDTO dto) {
        Quiz quiz = new Quiz();
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        quiz.setCourseId(dto.getCourseId());
        quiz.setTutorId(dto.getTutorId());
        quiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        quiz.setPassingScore(dto.getPassingScore());
        quiz.setTotalPoints(dto.getTotalPoints());
        quiz.setStatus(dto.getStatus() != null ? dto.getStatus() : QuizStatus.DRAFT);
        
        Quiz saved = quizRepository.save(quiz);
        return mapToResponseDTO(saved);
    }
    
    @Override
    public QuizResponseDTO getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        return mapToResponseDTO(quiz);
    }
    
    @Override
    public List<QuizResponseDTO> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public QuizResponseDTO updateQuiz(Long id, QuizUpdateDTO dto) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        
        if (dto.getTitle() != null) quiz.setTitle(dto.getTitle());
        if (dto.getDescription() != null) quiz.setDescription(dto.getDescription());
        if (dto.getCourseId() != null) quiz.setCourseId(dto.getCourseId());
        if (dto.getTutorId() != null) quiz.setTutorId(dto.getTutorId());
        if (dto.getTimeLimitMinutes() != null) quiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        if (dto.getPassingScore() != null) quiz.setPassingScore(dto.getPassingScore());
        if (dto.getTotalPoints() != null) quiz.setTotalPoints(dto.getTotalPoints());
        if (dto.getStatus() != null) quiz.setStatus(dto.getStatus());
        
        Quiz updated = quizRepository.save(quiz);
        return mapToResponseDTO(updated);
    }
    
    @Override
    @Transactional
    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResourceNotFoundException("Quiz", "id", id);
        }
        quizRepository.deleteById(id);
    }
    
    @Override
    public List<QuizResponseDTO> getQuizzesByCourse(Long courseId) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<QuizResponseDTO> getPublishedQuizzes() {
        return quizRepository.findByStatus(QuizStatus.PUBLISHED).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public QuizResponseDTO publishQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        quiz.setStatus(QuizStatus.PUBLISHED);
        Quiz updated = quizRepository.save(quiz);
        return mapToResponseDTO(updated);
    }
    
    @Override
    @Transactional
    public QuizResponseDTO archiveQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
        quiz.setStatus(QuizStatus.ARCHIVED);
        Quiz updated = quizRepository.save(quiz);
        return mapToResponseDTO(updated);
    }
    
    @Override
    public Quiz getQuizWithQuestions(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", id));
    }
    
    @Override
    public QuizStatsDTO getQuizStats(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResourceNotFoundException("Quiz", "id", id);
        }
        
        Long totalAttempts = (long) attemptRepository.findByQuizId(id).size();
        Double averageScore = attemptRepository.getAverageScoreByQuizId(id);
        Long passedCount = attemptRepository.countPassedAttemptsByQuizId(id);
        Double passRate = totalAttempts > 0 ? (passedCount.doubleValue() / totalAttempts) * 100 : 0.0;
        Double averageRating = feedbackRepository.getAverageRatingByQuizId(id);
        
        return new QuizStatsDTO(
                totalAttempts,
                averageScore != null ? averageScore : 0.0,
                passRate,
                averageRating != null ? averageRating : 0.0
        );
    }
    
    private QuizResponseDTO mapToResponseDTO(Quiz quiz) {
        Long questionCount = questionRepository.countByQuizId(quiz.getId());
        Double averageScore = attemptRepository.getAverageScoreByQuizId(quiz.getId());
        
        return new QuizResponseDTO(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getCourseId(),
                quiz.getTutorId(),
                quiz.getTimeLimitMinutes(),
                quiz.getPassingScore(),
                quiz.getTotalPoints(),
                quiz.getStatus(),
                quiz.getCreatedAt(),
                quiz.getUpdatedAt(),
                questionCount,
                averageScore
        );
    }
}
