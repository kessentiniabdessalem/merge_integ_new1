package pi.integrated.jobservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.integrated.jobservice.dto.NotificationDTO;
import pi.integrated.jobservice.model.Job;
import pi.integrated.jobservice.model.Notification;
import pi.integrated.jobservice.repository.MeetingRepository;
import pi.integrated.jobservice.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MeetingRepository meetingRepository;

    public void createNotification(Long userId, String message) {
        Notification n = Notification.builder()
                .userId(userId)
                .message(message)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(n);
    }

    /**
     * Called when a job expires. We skip admin lookup (no user DB in this service).
     * The teacher who applied gets notified instead.
     */
    public void notifyJobExpired(Job job) {
        // Notify all applicants that the job they applied to has expired
        if (job.getApplications() != null) {
            for (var app : job.getApplications()) {
                createNotification(app.getTeacherId(),
                        "The job \"" + job.getTitle() + "\" you applied to has expired.");
            }
        }
    }

    public void notifyApplicationStatusChange(Long teacherId, String jobTitle, String newStatus) {
        createNotification(teacherId,
                "Your application for \"" + jobTitle + "\" has been " + newStatus.toLowerCase() + ".");
    }

    public void notifyMeetingScheduled(Long teacherId, String jobTitle, LocalDateTime meetingDate) {
        createNotification(teacherId,
                "A meeting for your application to \"" + jobTitle + "\" has been scheduled on " + meetingDate + ".");
    }

    /**
     * Create meeting reminder notifications for upcoming meetings (called by scheduler).
     */
    public void ensureTeacherNotificationsForMeetings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusHours(24);
        meetingRepository.findAll().stream()
                .filter(m -> m.getMeetingDate() != null
                        && m.getMeetingDate().isAfter(now)
                        && m.getMeetingDate().isBefore(soon))
                .forEach(m -> {
                    Long teacherId = m.getApplication().getTeacherId();
                    String jobTitle = m.getApplication().getJob().getTitle();
                    createNotification(teacherId,
                            "Reminder: your meeting for \"" + jobTitle + "\" is in less than 24 hours.");
                });
    }

    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void markRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    private NotificationDTO toDto(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
