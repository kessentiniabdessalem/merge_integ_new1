package pi.integrated.event;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import pi.integrated.event.Repository.EventRepository;
import pi.integrated.event.Repository.ParticipantRepository;
import pi.integrated.event.Repository.ReservationRepository;
import pi.integrated.event.Service.PDFTicketService;
import pi.integrated.event.Service.ReservationService;
import pi.integrated.event.dto.ReservationResponse;
import pi.integrated.event.entity.*;
import pi.integrated.event.exception.ReservationException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private ParticipantRepository participantRepository;

    @Mock
    private PDFTicketService pdfTicketService;

    @InjectMocks
    private ReservationService reservationService;

    private Event event;
    private Participant participant;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Créer un événement de test
        event = new Event();
        event.setId(1L);
        event.setName("Workshop Angular");
        event.setCategory(EventCategory.WORKSHOP);
        event.setStatus(EventStatus.Upcoming);
        event.setDate(LocalDate.now().plusDays(10));
        event.setPlacesLimit(100);
        event.setReservedPlaces(50);
        event.setDescription("Test event");
        event.setLocation("Salle A");
        event.setPhotoUrl("/test.jpg");
        event.setOrganizerFirstName("Ahmed");
        event.setOrganizerLastName("Mansour");

        // Créer un participant de test
        participant = new Participant();
        participant.setId(1L);
        participant.setFullName("Mohamed Salah");
        participant.setEmail("mohamed@test.com");
    }

    @Test
    void shouldCreateReservationSuccessfully() {
        // Given
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(reservationRepository.existsByEventIdAndParticipantId(1L, 1L)).thenReturn(false);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation res = invocation.getArgument(0);
            res.setId(1L);
            return res;
        });

        // When
        ReservationResponse response = reservationService.createReservation(1L, 1L);

        // Then
        assertNotNull(response);
        assertEquals("Réservation confirmée avec succès!", response.getMessage());
        assertEquals("Workshop Angular", response.getEventName());
        assertEquals("Mohamed Salah", response.getParticipantName());
        assertTrue(response.getTicketCode().startsWith("TKT-"));
        verify(eventRepository).save(event);
        assertEquals(51, event.getReservedPlaces());
    }

    @Test
    void shouldThrowExceptionWhenEventNotFound() {
        // Given
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        ReservationException exception = assertThrows(ReservationException.class, () -> {
            reservationService.createReservation(999L, 1L);
        });
        assertEquals("Événement introuvable", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenEventFull() {
        // Given
        event.setReservedPlaces(100); // Full
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        // When & Then
        ReservationException exception = assertThrows(ReservationException.class, () -> {
            reservationService.createReservation(1L, 1L);
        });
        assertEquals("Désolé, cet événement est complet.", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenEventExpired() {
        // Given
        event.setDate(LocalDate.now().minusDays(1)); // Date passée
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        // When & Then
        ReservationException exception = assertThrows(ReservationException.class, () -> {
            reservationService.createReservation(1L, 1L);
        });
        assertEquals("Désolé, cet événement est expiré.", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenEventCancelled() {
        // Given
        event.setStatus(EventStatus.Cancelled);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));

        // When & Then
        ReservationException exception = assertThrows(ReservationException.class, () -> {
            reservationService.createReservation(1L, 1L);
        });
        assertTrue(exception.getMessage().contains("n'est plus disponible"));
    }

    @Test
    void shouldThrowExceptionWhenAlreadyReserved() {
        // Given
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(participantRepository.findById(1L)).thenReturn(Optional.of(participant));
        when(reservationRepository.existsByEventIdAndParticipantId(1L, 1L)).thenReturn(true);

        // When & Then
        ReservationException exception = assertThrows(ReservationException.class, () -> {
            reservationService.createReservation(1L, 1L);
        });
        assertEquals("Vous avez déjà réservé cet événement.", exception.getMessage());
    }
}
