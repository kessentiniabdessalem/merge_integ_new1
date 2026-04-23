package pi.integrated.event.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import pi.integrated.event.entity.EventCategory;
import pi.integrated.event.entity.EventStatus;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nom obligatoire")
    private String name;

    @NotNull(message = "Catégorie obligatoire")
    @Enumerated(EnumType.STRING)
    private EventCategory category;

    @NotNull(message = "Status obligatoire")
    @Enumerated(EnumType.STRING)
    private EventStatus status;

    @NotNull(message = "Date obligatoire")
    private LocalDate date;

    @Min(value = 50, message = "Minimum 50 places")
    private int placesLimit;

    @NotBlank(message = "Description obligatoire")
    @Column(length = 1000)
    private String description;

    @NotBlank(message = "Lieu obligatoire")
    private String location;

    private String photoUrl; // Photo optionnelle

    private int reservedPlaces = 0;

    // convenience fields to store organizer names directly on the event
    @NotBlank(message = "Organizer first name obligatoire")
    private String organizerFirstName;

    @NotBlank(message = "Organizer last name obligatoire")
    private String organizerLastName;

    @ManyToOne
    private Organizer organizer;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "event_participants",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "participant_id")
    )
    private List<Participant> participants = new ArrayList<>();
}
