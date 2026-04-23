package pi.integrated.event.Service;
import pi.integrated.event.entity.Event;
import pi.integrated.event.entity.Participant;

import java.util.List;

public interface IEventService {

    List<Event> getAllEvents();

    Event getEventById(Long id);

    Event addEvent(Event event);

    Event updateEvent(Long id, Event event);

    void deleteEvent(Long id);

    // Réservation d'un participant
    Event reserveEvent(Long eventId, Participant participant);
}