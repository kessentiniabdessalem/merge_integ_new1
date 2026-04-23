package pi.integrated.jobservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.integrated.jobservice.model.Job;
import pi.integrated.jobservice.model.SavedJob;
import pi.integrated.jobservice.repository.JobRepository;
import pi.integrated.jobservice.repository.SavedJobRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;

    public SavedJob saveJob(Long userId, Long jobId) {
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException("Job already saved");
        }
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        SavedJob saved = SavedJob.builder()
                .userId(userId)
                .job(job)
                .savedAt(LocalDateTime.now())
                .build();
        return savedJobRepository.save(saved);
    }

    @Transactional
    public void unsaveJob(Long userId, Long jobId) {
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    public List<SavedJob> getSavedJobs(Long userId) {
        return savedJobRepository.findByUserId(userId);
    }

    public boolean isSaved(Long userId, Long jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }
}
