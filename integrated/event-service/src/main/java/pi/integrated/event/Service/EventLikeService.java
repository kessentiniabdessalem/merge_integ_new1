package pi.integrated.event.Service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pi.integrated.event.Repository.EventLikeRepository;
import pi.integrated.event.Repository.EventRepository;
import pi.integrated.event.Repository.ParticipantRepository;
import pi.integrated.event.entity.Event;
import pi.integrated.event.entity.EventLike;
import pi.integrated.event.entity.Participant;
import pi.integrated.event.exception.ReservationException;

@Service
public class EventLikeService {

    @Autowired
    private EventLikeRepository eventLikeRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Transactional
    public String likeEvent(Long eventId, Long participantId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ReservationException("Événement introuvable"));

        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new ReservationException("Participant introuvable"));

        // Vérifier si déjà liké
        if (eventLikeRepository.existsByEventIdAndParticipantId(eventId, participantId)) {
            return "Vous avez déjà aimé cet événement";
        }

        EventLike like = new EventLike();
        like.setEvent(event);
        like.setParticipant(participant);
        eventLikeRepository.save(like);

        return "Événement ajouté aux favoris";
    }

    @Transactional
    public String unlikeEvent(Long eventId, Long participantId) {
        if (!eventLikeRepository.existsByEventIdAndParticipantId(eventId, participantId)) {
            return "Vous n'avez pas aimé cet événement";
        }

        eventLikeRepository.deleteByEventIdAndParticipantId(eventId, participantId);
        return "Événement retiré des favoris";
    }

    public boolean isLikedByParticipant(Long eventId, Long participantId) {
        return eventLikeRepository.existsByEventIdAndParticipantId(eventId, participantId);
    }

    public long getLikesCount(Long eventId) {
        return eventLikeRepository.countByEventId(eventId);
    }
}
