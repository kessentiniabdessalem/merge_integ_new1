package pi.integrated.event.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.integrated.event.entity.Reservation;
import pi.integrated.event.entity.ReservationStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    List<Reservation> findByEventId(Long eventId);
    
    List<Reservation> findByParticipantId(Long participantId);
    
    Optional<Reservation> findByEventIdAndParticipantId(Long eventId, Long participantId);
    
    boolean existsByEventIdAndParticipantId(Long eventId, Long participantId);
    
    long countByEventIdAndStatus(Long eventId, ReservationStatus status);
    
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = 'CONFIRMED'")
    long countTotalReservations();
    
    // Trouver une réservation par ticket code
    Optional<Reservation> findByTicketCode(String ticketCode);
}
