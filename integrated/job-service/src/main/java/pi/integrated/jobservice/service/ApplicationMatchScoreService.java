package pi.integrated.jobservice.service;

import org.springframework.stereotype.Service;
import pi.integrated.jobservice.model.Job;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Computes a match score (0-100) between a CV text and a Job posting.
 * Simple keyword-overlap approach — no external AI call needed.
 */
@Service
public class ApplicationMatchScoreService {

    public double computeScore(String cvText, Job job) {
        if (cvText == null || cvText.isBlank()) return 0.0;

        String combined = (job.getTitle() + " " + job.getDescription() + " " + job.getSubject()).toLowerCase();
        String cv = cvText.toLowerCase();

        Set<String> jobWords = tokenize(combined);
        Set<String> cvWords = tokenize(cv);

        if (jobWords.isEmpty()) return 0.0;

        long matches = jobWords.stream().filter(cvWords::contains).count();
        double score = (double) matches / jobWords.size() * 100.0;
        return Math.min(100.0, Math.round(score * 10.0) / 10.0);
    }

    private Set<String> tokenize(String text) {
        Set<String> words = new HashSet<>(Arrays.asList(text.split("[^a-zA-Z0-9]+")));
        words.removeIf(w -> w.length() < 3);
        return words;
    }
}
