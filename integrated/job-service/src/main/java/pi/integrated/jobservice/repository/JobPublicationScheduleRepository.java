package pi.integrated.jobservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.integrated.jobservice.model.JobPublicationSchedule;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobPublicationScheduleRepository extends JpaRepository<JobPublicationSchedule, Long> {

    List<JobPublicationSchedule> findByPublishedFalseAndScheduledAtBefore(LocalDateTime now);
}
