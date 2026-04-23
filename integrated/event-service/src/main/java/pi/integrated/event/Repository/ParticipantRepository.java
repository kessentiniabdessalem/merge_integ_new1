package pi.integrated.event.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.integrated.event.entity.Participant;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {}