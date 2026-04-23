package pi.integrated.jobservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.integrated.jobservice.dto.MeetingDTO;
import pi.integrated.jobservice.dto.NextMeetingDTO;
import pi.integrated.jobservice.model.Application;
import pi.integrated.jobservice.model.Meeting;
import pi.integrated.jobservice.repository.ApplicationRepository;
import pi.integrated.jobservice.repository.MeetingRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    public MeetingDTO scheduleMeeting(Long applicationId, Long evaluatorId, String evaluatorName,
                                      LocalDateTime meetingDate, String notes, String meetingLink) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        Meeting meeting = Meeting.builder()
                .application(app)
                .assignedToId(evaluatorId)
                .assignedToName(evaluatorName)
                .meetingDate(meetingDate)
                .notes(notes)
                .meetingLink(meetingLink)
                .build();

        meeting = meetingRepository.save(meeting);

        notificationService.notifyMeetingScheduled(
                app.getTeacherId(), app.getJob().getTitle(), meetingDate);

        return toDto(meeting);
    }

    public MeetingDTO updateMeeting(Long meetingId, LocalDateTime meetingDate, String notes, String meetingLink) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found: " + meetingId));
        if (meetingDate != null) meeting.setMeetingDate(meetingDate);
        if (notes != null) meeting.setNotes(notes);
        if (meetingLink != null) meeting.setMeetingLink(meetingLink);
        return toDto(meetingRepository.save(meeting));
    }

    public void deleteMeeting(Long meetingId) {
        meetingRepository.deleteById(meetingId);
    }

    public List<MeetingDTO> getMeetingsForApplication(Long applicationId) {
        return meetingRepository.findByApplicationId(applicationId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<MeetingDTO> getMeetingsForTeacher(Long teacherId) {
        return meetingRepository.findByApplicationTeacherId(teacherId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<MeetingDTO> getMeetingsForEvaluator(Long evaluatorId) {
        return meetingRepository.findByAssignedToId(evaluatorId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public Optional<NextMeetingDTO> getNextMeetingForUser(Long userId) {
        return meetingRepository.findNextMeetingForUser(userId, LocalDateTime.now())
                .map(m -> NextMeetingDTO.builder()
                        .meetingId(m.getId())
                        .meetingDate(m.getMeetingDate())
                        .meetingLink(m.getMeetingLink())
                        .jobTitle(m.getApplication().getJob().getTitle())
                        .otherPartyName(m.getAssignedToName())
                        .build());
    }

    private MeetingDTO toDto(Meeting m) {
        return MeetingDTO.builder()
                .id(m.getId())
                .applicationId(m.getApplication().getId())
                .teacherId(m.getApplication().getTeacherId())
                .teacherName(m.getApplication().getTeacherName())
                .jobTitle(m.getApplication().getJob().getTitle())
                .assignedToId(m.getAssignedToId())
                .assignedToName(m.getAssignedToName())
                .meetingDate(m.getMeetingDate())
                .notes(m.getNotes())
                .meetingLink(m.getMeetingLink())
                .build();
    }
}
