package pi.integrated.jobservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.integrated.jobservice.model.TeacherCvProfile;

import java.util.Optional;

@Repository
public interface TeacherCvProfileRepository extends JpaRepository<TeacherCvProfile, Long> {

    Optional<TeacherCvProfile> findByUserId(Long userId);
}
