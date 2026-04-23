package pi.integrated.jobservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.integrated.jobservice.model.Job;
import pi.integrated.jobservice.model.JobStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(JobStatus status);

    @Query("SELECT j FROM Job j WHERE j.status = 'OPEN' AND j.expiresAt < :now")
    List<Job> findExpiredJobs(LocalDateTime now);

    @Query("SELECT j FROM Job j WHERE " +
           "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:subject IS NULL OR LOWER(j.subject) LIKE LOWER(CONCAT('%', :subject, '%')))")
    List<Job> searchJobs(String title, String location, String subject);
}
