package pi.integrated.ai.service;

import pi.integrated.ai.dto.StudyPlanRequest;
import pi.integrated.ai.dto.StudyPlanResponse;
import org.springframework.stereotype.Service;

@Service
public class StudyPlanService {

    private final GeminiService geminiService;

    public StudyPlanService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public StudyPlanResponse generateStudyPlan(StudyPlanRequest request) {
        String systemPrompt = buildSystemPrompt();
        String userMessage  = buildUserMessage(request);

        String advice = geminiService.chat(systemPrompt, userMessage);
        return new StudyPlanResponse(request.getCourseTitle(), advice);
    }

    private String buildSystemPrompt() {
        return "You are an expert educational advisor. " +
               "Given a course with its title, description, level, and total duration, " +
               "you produce a clear, actionable study plan with weekly milestones, " +
               "time estimates per topic, and practical study tips. " +
               "Write in plain text (no JSON, no markdown code blocks). " +
               "Structure the response with clear week-by-week sections.";
    }

    private String buildUserMessage(StudyPlanRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Please generate a detailed study plan for the following course:\n\n");
        sb.append("Course Title: ").append(request.getCourseTitle()).append("\n");

        if (request.getLevel() != null && !request.getLevel().isBlank()) {
            sb.append("Level: ").append(request.getLevel()).append("\n");
        }
        if (request.getDurationMinutes() != null && request.getDurationMinutes() > 0) {
            int hours = request.getDurationMinutes() / 60;
            int mins  = request.getDurationMinutes() % 60;
            String duration = hours > 0
                ? (hours + " hour" + (hours > 1 ? "s" : "") + (mins > 0 ? " " + mins + " min" : ""))
                : (mins + " minutes");
            sb.append("Total Duration: ").append(duration).append("\n");
        }
        if (request.getCourseDescription() != null && !request.getCourseDescription().isBlank()) {
            sb.append("Description: ").append(request.getCourseDescription()).append("\n");
        }
        if (request.getExtraContext() != null && !request.getExtraContext().isBlank()) {
            sb.append("\nAdditional context from the student: ").append(request.getExtraContext()).append("\n");
        }

        sb.append("\nPlease include:\n");
        sb.append("1. A recommended weekly schedule\n");
        sb.append("2. Estimated time per topic or phase\n");
        sb.append("3. Study tips tailored to the course content and level\n");
        sb.append("4. Key milestones and checkpoints");

        return sb.toString();
    }
}
