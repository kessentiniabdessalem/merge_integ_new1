package pi.integrated.event.dto;

import lombok.*;
import pi.integrated.event.entity.EventCategory;
import pi.integrated.event.entity.EventStatus;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRequest {
    private String name;
    private String category;
    private String status;
    private String date;
    private Integer placesLimit;
    private String description;
    private String location;
    private String organizerFirstName;
    private String organizerLastName;
}
