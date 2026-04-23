package pi.integrated.jobservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pi.integrated.jobservice.dto.ApplicationDTO;
import pi.integrated.jobservice.model.Application;
import pi.integrated.jobservice.model.ApplicationStatus;
import pi.integrated.jobservice.model.Job;
import pi.integrated.jobservice.repository.ApplicationRepository;
import pi.integrated.jobservice.repository.JobRepository;
import pi.integrated.jobservice.repository.TeacherCvProfileRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final TeacherCvProfileRepository cvProfileRepository;
    private final FileStorageService fileStorageService;
    private final ApplicationMatchScoreService matchScoreService;
    private final NotificationService notificationService;

    public ApplicationDTO createApplication(Long jobId, Long teacherId, String teacherName,
                                            String motivation, MultipartFile cv, MultipartFile certificat) {
        if (applicationRepository.findByJobIdAndTeacherId(jobId, teacherId).isPresent()) {
            throw new RuntimeException("You have already applied to this job.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        String cvPath = cv != null && !cv.isEmpty() ? fileStorageService.storeFile(cv, "applications/cv") : null;
        String certPath = certificat != null && !certificat.isEmpty()
                ? fileStorageService.storeFile(certificat, "applications/certificat") : null;

        // Compute match score from stored CV profile text
        String cvText = cvProfileRepository.findByUserId(teacherId)
                .map(p -> p.getExtractedText()).orElse("");
        double score = matchScoreService.computeScore(cvText, job);

        Application app = Application.builder()
                .job(job)
                .teacherId(teacherId)
                .teacherName(teacherName)
                .motivation(motivation)
                .cvPath(cvPath)
                .certificatPath(certPath)
                .status(ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .matchScore(score)
                .build();

        app = applicationRepository.save(app);

        notificationService.createNotification(teacherId,
                "Your application to \"" + job.getTitle() + "\" has been submitted.");

        return mapToDTO(app);
    }

    public ApplicationDTO updateStatus(Long applicationId, ApplicationStatus newStatus) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        app.setStatus(newStatus);
        app = applicationRepository.save(app);
        notificationService.notifyApplicationStatusChange(
                app.getTeacherId(), app.getJob().getTitle(), newStatus.name());
        return mapToDTO(app);
    }

    public List<ApplicationDTO> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<ApplicationDTO> getApplicationsByTeacher(Long teacherId) {
        return applicationRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public ApplicationDTO getApplication(Long id) {
        return applicationRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
    }

    private ApplicationDTO mapToDTO(Application app) {
        return ApplicationDTO.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .teacherId(app.getTeacherId())
                .teacherName(app.getTeacherName())
                .motivation(app.getMotivation())
                .cvPath(app.getCvPath())
                .certificatPath(app.getCertificatPath())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .matchScore(app.getMatchScore())
                .build();
    }
}
