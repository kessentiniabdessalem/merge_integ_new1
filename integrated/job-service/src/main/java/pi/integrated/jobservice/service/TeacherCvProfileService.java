package pi.integrated.jobservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pi.integrated.jobservice.model.TeacherCvProfile;
import pi.integrated.jobservice.repository.TeacherCvProfileRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TeacherCvProfileService {

    private final TeacherCvProfileRepository profileRepository;
    private final FileStorageService fileStorageService;
    private final CvTextExtractionService cvTextExtractionService;

    public TeacherCvProfile uploadCv(Long userId, MultipartFile cvFile) {
        String path = fileStorageService.storeFile(cvFile, "cv-profiles");
        String extractedText = cvTextExtractionService.extractTextFromPdf(cvFile);

        TeacherCvProfile profile = profileRepository.findByUserId(userId)
                .orElse(new TeacherCvProfile());
        profile.setUserId(userId);
        profile.setCvPath(path);
        profile.setExtractedText(extractedText);
        profile.setUploadedAt(LocalDateTime.now());

        return profileRepository.save(profile);
    }

    public Optional<TeacherCvProfile> getProfile(Long userId) {
        return profileRepository.findByUserId(userId);
    }
}
