package pi.integrated.jobservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.integrated.jobservice.model.Meeting;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    // Find meetings for a teacher (via application.teacherId — plain Long field)
    @Query("SELECT m FROM Meeting m JOIN m.application a WHERE a.teacherId = :teacherId")
    List<Meeting> findByApplicationTeacherId(Long teacherId);

    // Find meetings assigned to a specific evaluator (plain Long column)
    List<Meeting> findByAssignedToId(Long assignedToId);

    // Find meetings by application
    List<Meeting> findByApplicationId(Long applicationId);

    // Find next upcoming meeting for a user (either as teacher or evaluator)
    @Query("SELECT m FROM Meeting m JOIN m.application a " +
           "WHERE (a.teacherId = :userId OR m.assignedToId = :userId) " +
           "AND m.meetingDate > :now " +
           "ORDER BY m.meetingDate ASC")
    Optional<Meeting> findNextMeetingForUser(Long userId, LocalDateTime now);
}
