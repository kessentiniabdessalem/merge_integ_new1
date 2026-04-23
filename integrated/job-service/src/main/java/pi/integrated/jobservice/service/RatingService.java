package pi.integrated.jobservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.integrated.jobservice.model.Rating;
import pi.integrated.jobservice.repository.RatingRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;

    public Rating createRating(Long teacherId, String teacherName,
                               Long studentId, String studentName,
                               Integer note, String commentaire) {
        if (ratingRepository.existsByTeacherIdAndStudentId(teacherId, studentId)) {
            throw new RuntimeException("You have already rated this teacher.");
        }
        Rating rating = Rating.builder()
                .teacherId(teacherId)
                .teacherName(teacherName)
                .studentId(studentId)
                .studentName(studentName)
                .note(note)
                .commentaire(commentaire)
                .createdAt(LocalDateTime.now())
                .build();
        return ratingRepository.save(rating);
    }

    public List<Rating> getRatingsForTeacher(Long teacherId) {
        return ratingRepository.findByTeacherId(teacherId);
    }

    public List<Rating> getRatingsByStudent(Long studentId) {
        return ratingRepository.findByStudentId(studentId);
    }

    public Double getAverageRatingForTeacher(Long teacherId) {
        Double avg = ratingRepository.getAverageRatingForTeacher(teacherId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    public List<Rating> getAllRatings() {
        return ratingRepository.findAll();
    }
}
