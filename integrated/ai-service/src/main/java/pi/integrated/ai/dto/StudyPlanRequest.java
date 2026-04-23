package pi.integrated.ai.dto;

public class StudyPlanRequest {
    private String courseTitle;
    private String courseDescription;
    private String level;
    private Integer durationMinutes;
    private String extraContext;

    public StudyPlanRequest() {}

    public StudyPlanRequest(String courseTitle, String courseDescription, String level,
                            Integer durationMinutes, String extraContext) {
        this.courseTitle = courseTitle;
        this.courseDescription = courseDescription;
        this.level = level;
        this.durationMinutes = durationMinutes;
        this.extraContext = extraContext;
    }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getCourseDescription() { return courseDescription; }
    public void setCourseDescription(String courseDescription) { this.courseDescription = courseDescription; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getExtraContext() { return extraContext; }
    public void setExtraContext(String extraContext) { this.extraContext = extraContext; }
}
