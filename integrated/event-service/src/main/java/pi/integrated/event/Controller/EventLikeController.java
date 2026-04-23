package pi.integrated.event.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.integrated.event.Service.EventLikeService;

@RestController
@RequestMapping("/api/events/likes")
public class EventLikeController {

    @Autowired
    private EventLikeService eventLikeService;

    @PostMapping("/{eventId}/participant/{participantId}")
    public ResponseEntity<String> likeEvent(@PathVariable Long eventId, @PathVariable Long participantId) {
        String message = eventLikeService.likeEvent(eventId, participantId);
        return ResponseEntity.ok(message);
    }

    @DeleteMapping("/{eventId}/participant/{participantId}")
    public ResponseEntity<String> unlikeEvent(@PathVariable Long eventId, @PathVariable Long participantId) {
        String message = eventLikeService.unlikeEvent(eventId, participantId);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{eventId}/participant/{participantId}/status")
    public ResponseEntity<Boolean> isLiked(@PathVariable Long eventId, @PathVariable Long participantId) {
        boolean isLiked = eventLikeService.isLikedByParticipant(eventId, participantId);
        return ResponseEntity.ok(isLiked);
    }

    @GetMapping("/{eventId}/count")
    public ResponseEntity<Long> getLikesCount(@PathVariable Long eventId) {
        long count = eventLikeService.getLikesCount(eventId);
        return ResponseEntity.ok(count);
    }
}
