package pi.integrated.event.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pi.integrated.event.entity.Organizer;

public interface OrganizerRepository extends JpaRepository<Organizer, Long> {}