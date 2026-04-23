package pi.integrated.ai.dto;

public class EventPredictionRequest {
    private int likes;
    private int reservations;
    private int placesRestantes;

    public EventPredictionRequest() {}

    public EventPredictionRequest(int likes, int reservations, int placesRestantes) {
        this.likes = likes;
        this.reservations = reservations;
        this.placesRestantes = placesRestantes;
    }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public int getReservations() { return reservations; }
    public void setReservations(int reservations) { this.reservations = reservations; }

    public int getPlacesRestantes() { return placesRestantes; }
    public void setPlacesRestantes(int placesRestantes) { this.placesRestantes = placesRestantes; }
}
