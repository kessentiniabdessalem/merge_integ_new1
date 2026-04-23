package pi.integrated.ai.dto;

public class StudyPlanResponse {
    private String courseTitle;
    private String advice;

    public StudyPlanResponse() {}

    public StudyPlanResponse(String courseTitle, String advice) {
        this.courseTitle = courseTitle;
        this.advice = advice;
    }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getAdvice() { return advice; }
    public void setAdvice(String advice) { this.advice = advice; }
}
