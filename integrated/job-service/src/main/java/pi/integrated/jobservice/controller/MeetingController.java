package pi.integrated.jobservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.integrated.jobservice.dto.MeetingDTO;
import pi.integrated.jobservice.dto.NextMeetingDTO;
import pi.integrated.jobservice.service.MeetingService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    public ResponseEntity<MeetingDTO> scheduleMeeting(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Long applicationId = Long.valueOf(body.get("applicationId").toString());
        Long evaluatorId = (Long) request.getAttribute("userId");
        String evaluatorName = (String) request.getAttribute("userName");
        LocalDateTime meetingDate = LocalDateTime.parse(body.get("meetingDate").toString());
        String notes = body.containsKey("notes") ? body.get("notes").toString() : null;
        String meetingLink = body.containsKey("meetingLink") ? body.get("meetingLink").toString() : null;
        return ResponseEntity.ok(
                meetingService.scheduleMeeting(applicationId, evaluatorId, evaluatorName, meetingDate, notes, meetingLink));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MeetingDTO> updateMeeting(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        LocalDateTime meetingDate = body.containsKey("meetingDate")
                ? LocalDateTime.parse(body.get("meetingDate").toString()) : null;
        String notes = body.containsKey("notes") ? body.get("notes").toString() : null;
        String meetingLink = body.containsKey("meetingLink") ? body.get("meetingLink").toString() : null;
        return ResponseEntity.ok(meetingService.updateMeeting(id, meetingDate, notes, meetingLink));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<MeetingDTO>> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(meetingService.getMeetingsForApplication(applicationId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MeetingDTO>> myMeetings(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("userRole");
        if ("TUTOR".equals(role)) {
            return ResponseEntity.ok(meetingService.getMeetingsForTeacher(userId));
        } else {
            return ResponseEntity.ok(meetingService.getMeetingsForEvaluator(userId));
        }
    }

    @GetMapping("/next")
    public ResponseEntity<NextMeetingDTO> nextMeeting(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return meetingService.getNextMeetingForUser(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
