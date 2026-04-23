package pi.integrated.event.dto;

import lombok.*;
import pi.integrated.event.entity.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketValidationResponse {
    private boolean valid;
    private String message;
    private String ticketCode;
    private String eventName;
    private LocalDate eventDate;
    private String eventLocation;
    private String participantName;
    private String participantEmail;
    private ReservationStatus status;
    private LocalDateTime reservationDate;
    private boolean alreadyUsed;
}
