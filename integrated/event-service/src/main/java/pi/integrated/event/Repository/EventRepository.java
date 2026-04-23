package pi.integrated.event.Repository;

import pi.integrated.event.entity.Event;
import pi.integrated.event.entity.EventCategory;
import pi.integrated.event.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Recherche par mot-clé (name ou location)
    @Query("SELECT e FROM Event e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(e.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Event> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // Filtrage par catégorie
    Page<Event> findByCategory(EventCategory category, Pageable pageable);
    
    // Filtrage par status
    Page<Event> findByStatus(EventStatus status, Pageable pageable);
    
    // Filtrage par catégorie et status
    Page<Event> findByCategoryAndStatus(EventCategory category, EventStatus status, Pageable pageable);
    
    // Recherche + filtrage combinés
    @Query("SELECT e FROM Event e WHERE " +
           "(LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.location) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:status IS NULL OR e.status = :status)")
    Page<Event> searchAndFilter(@Param("keyword") String keyword, 
                                 @Param("category") EventCategory category, 
                                 @Param("status") EventStatus status, 
                                 Pageable pageable);
    
    // Événements les plus réservés (pour statistiques)
    @Query("SELECT e FROM Event e ORDER BY e.reservedPlaces DESC")
    List<Event> findTopReservedEvents(Pageable pageable);
    
    // Répartition des événements par catégorie
    @Query("SELECT e.category, COUNT(e) FROM Event e GROUP BY e.category")
    List<Object[]> countEventsByCategory();
}
