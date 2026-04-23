package pi.integrated.ai.dto;

public class EventRecommendedEvent {
    private Long id;
    private String name;
    private String category;
    private String date;
    private String description;
    private int availableSeats;

    public EventRecommendedEvent() {}

    public EventRecommendedEvent(Long id, String name, String category, String date, String description, int availableSeats) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.date = date;
        this.description = description;
        this.availableSeats = availableSeats;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }
}
