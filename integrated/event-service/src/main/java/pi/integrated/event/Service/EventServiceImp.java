package pi.integrated.event.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import pi.integrated.event.dto.EventStatistics;
import pi.integrated.event.entity.Event;
import pi.integrated.event.entity.EventCategory;
import pi.integrated.event.entity.EventStatus;
import pi.integrated.event.entity.Participant;
import pi.integrated.event.Repository.EventRepository;
import pi.integrated.event.Repository.ParticipantRepository;
import pi.integrated.event.Repository.ReservationRepository;
import pi.integrated.event.Service.IEventService;

import java.util.List;
import java.util.Map;

@Service
public class EventServiceImp implements IEventService {

    private final EventRepository eventRepository;
    private final ParticipantRepository participantRepository;
    private final ReservationRepository reservationRepository;

    public EventServiceImp(EventRepository eventRepository,
                           ParticipantRepository participantRepository,
                           ReservationRepository reservationRepository) {
        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id " + id));
    }

    @Override
    public Event addEvent(Event event) {
        // ensure reservedPlaces is initialized
        if (event.getReservedPlaces() == 0) {
            event.setReservedPlaces(0);
        }
        return eventRepository.save(event);
    }

    @Override
    public Event updateEvent(Long id, Event event) {
        Event existing = getEventById(id);
        existing.setName(event.getName());
        existing.setCategory(event.getCategory());
        existing.setStatus(event.getStatus());
        existing.setDate(event.getDate());
        existing.setPlacesLimit(event.getPlacesLimit());
        existing.setDescription(event.getDescription());
        existing.setLocation(event.getLocation());
        existing.setPhotoUrl(event.getPhotoUrl());
        existing.setOrganizerFirstName(event.getOrganizerFirstName());
        existing.setOrganizerLastName(event.getOrganizerLastName());
        existing.setOrganizer(event.getOrganizer());
        // reservedPlaces is managed by reservation endpoint, do not override here
        return eventRepository.save(existing);
    }

    @Override
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    @Override
    public Event reserveEvent(Long eventId, Participant participant) {
        Event event = getEventById(eventId);

        if (event.getReservedPlaces() >= event.getPlacesLimit()) {
            throw new RuntimeException("Plus de places disponibles pour cet événement");
        }

        // persist participant separately so that join table can be populated
        Participant saved = participantRepository.save(participant);
        event.getParticipants().add(saved);
        event.setReservedPlaces(event.getReservedPlaces() + 1);

        return eventRepository.save(event);
    }

    // Recherche et filtrage avec pagination
    public Page<Event> searchAndFilterEvents(String keyword, EventCategory category, 
                                             EventStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        if (keyword != null && !keyword.isEmpty()) {
            return eventRepository.searchAndFilter(keyword, category, status, pageable);
        } else if (category != null && status != null) {
            return eventRepository.findByCategoryAndStatus(category, status, pageable);
        } else if (category != null) {
            return eventRepository.findByCategory(category, pageable);
        } else if (status != null) {
            return eventRepository.findByStatus(status, pageable);
        } else {
            return eventRepository.findAll(pageable);
        }
    }

    // Statistiques pour Admin
    public EventStatistics getStatistics() {
        long totalEvents = eventRepository.count();
        long totalReservations = reservationRepository.countTotalReservations();
        long totalParticipants = participantRepository.count();
        List<Event> topReservedEvents = eventRepository.findTopReservedEvents(PageRequest.of(0, 5));
        
        // Répartition par catégorie
        List<Object[]> categoryData = eventRepository.countEventsByCategory();
        Map<String, Long> eventsByCategory = new java.util.HashMap<>();
        for (Object[] row : categoryData) {
            eventsByCategory.put(row[0].toString(), (Long) row[1]);
        }
        
        return EventStatistics.builder()
                .totalEvents(totalEvents)
                .totalReservations(totalReservations)
                .totalParticipants(totalParticipants)
                .topReservedEvents(topReservedEvents)
                .eventsByCategory(eventsByCategory)
                .build();
    }
}
