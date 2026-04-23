package pi.integrated.quiz.service;

import pi.integrated.quiz.dto.QuestionCreateDTO;
import pi.integrated.quiz.dto.QuestionResponseDTO;
import pi.integrated.quiz.dto.QuestionUpdateDTO;
import pi.integrated.quiz.exception.ResourceNotFoundException;
import pi.integrated.quiz.model.Question;
import pi.integrated.quiz.model.Quiz;
import pi.integrated.quiz.repository.QuestionRepository;
import pi.integrated.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {
    
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    
    @Override
    @Transactional
    public QuestionResponseDTO addQuestion(QuestionCreateDTO dto) {
        Quiz quiz = quizRepository.findById(dto.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz", "id", dto.getQuizId()));
        
        Question question = new Question();
        question.setQuestionText(dto.getQuestionText());
        question.setType(dto.getType());
        question.setOptions(dto.getOptions());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        question.setPoints(dto.getPoints() != null ? dto.getPoints() : 1);
        question.setExplanation(dto.getExplanation());
        question.setOrderIndex(dto.getOrderIndex());
        question.setQuiz(quiz);
        
        Question saved = questionRepository.save(question);
        return mapToResponseDTO(saved);
    }
    
    @Override
    public QuestionResponseDTO getQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        return mapToResponseDTO(question);
    }
    
    @Override
    @Transactional
    public QuestionResponseDTO updateQuestion(Long id, QuestionUpdateDTO dto) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", "id", id));
        
        if (dto.getQuestionText() != null) question.setQuestionText(dto.getQuestionText());
        if (dto.getType() != null) question.setType(dto.getType());
        if (dto.getOptions() != null) question.setOptions(dto.getOptions());
        if (dto.getCorrectAnswer() != null) question.setCorrectAnswer(dto.getCorrectAnswer());
        if (dto.getPoints() != null) question.setPoints(dto.getPoints());
        if (dto.getExplanation() != null) question.setExplanation(dto.getExplanation());
        if (dto.getOrderIndex() != null) question.setOrderIndex(dto.getOrderIndex());
        
        Question updated = questionRepository.save(question);
        return mapToResponseDTO(updated);
    }
    
    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question", "id", id);
        }
        questionRepository.deleteById(id);
    }
    
    @Override
    public List<QuestionResponseDTO> getQuestionsByQuiz(Long quizId) {
        return questionRepository.findByQuizIdOrderByOrderIndex(quizId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void reorderQuestions(Long quizId, List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            Long questionId = orderedIds.get(i);
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question", "id", questionId));
            question.setOrderIndex(i);
            questionRepository.save(question);
        }
    }
    
    private QuestionResponseDTO mapToResponseDTO(Question question) {
        return new QuestionResponseDTO(
                question.getId(),
                question.getQuestionText(),
                question.getType(),
                question.getOptions(),
                question.getCorrectAnswer(),
                question.getPoints(),
                question.getExplanation(),
                question.getOrderIndex(),
                question.getQuizId()
        );
    }
}
