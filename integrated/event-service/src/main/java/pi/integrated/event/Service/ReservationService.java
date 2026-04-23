package pi.integrated.event.Service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pi.integrated.event.Repository.EventRepository;
import pi.integrated.event.Repository.ParticipantRepository;
import pi.integrated.event.Repository.ReservationRepository;
import pi.integrated.event.dto.ReservationResponse;
import pi.integrated.event.dto.TicketValidationResponse;
import pi.integrated.event.entity.*;
import pi.integrated.event.exception.ReservationException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ParticipantRepository participantRepository;

    @Autowired
    private PDFTicketService pdfTicketService;

    @Transactional
    public ReservationResponse createReservation(Long eventId, Long participantId) {
        // Récupérer l'événement
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ReservationException("Événement introuvable"));

        // Récupérer ou créer le participant
        Participant participant = participantRepository.findById(participantId)
                .orElseGet(() -> {
                    // Créer un participant guest par défaut
                    Participant guest = new Participant();
                    guest.setFullName("Guest");
                    guest.setEmail(null);
                    guest.setAttended(false);
                    return participantRepository.save(guest);
                });

        // Vérification 1: Status doit être Upcoming
        if (event.getStatus() != EventStatus.Upcoming) {
            throw new ReservationException("Désolé, cet événement n'est plus disponible. Status: " + event.getStatus());
        }

        // Vérification 2: Date doit être >= aujourd'hui
        if (event.getDate().isBefore(LocalDate.now())) {
            throw new ReservationException("Désolé, cet événement est expiré.");
        }

        // Vérification 3: Places disponibles
        if (event.getReservedPlaces() >= event.getPlacesLimit()) {
            throw new ReservationException("Désolé, cet événement est complet.");
        }

        // Vérification 4: Participant n'a pas déjà réservé
        if (reservationRepository.existsByEventIdAndParticipantId(eventId, participantId)) {
            throw new ReservationException("Vous avez déjà réservé cet événement.");
        }

        // Créer la réservation
        Reservation reservation = new Reservation();
        reservation.setEvent(event);
        reservation.setParticipant(participant);
        reservation.setTicketCode(generateUniqueTicketCode());
        reservation.setStatus(ReservationStatus.CONFIRMED);

        // Incrémenter les places réservées
        event.setReservedPlaces(event.getReservedPlaces() + 1);
        eventRepository.save(event);

        // Associer le participant à l'événement (ManyToMany)
        if (!event.getParticipants().contains(participant)) {
            event.getParticipants().add(participant);
        }

        // Sauvegarder la réservation
        reservation = reservationRepository.save(reservation);

        return ReservationResponse.builder()
                .id(reservation.getId())
                .ticketCode(reservation.getTicketCode())
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus())
                .eventName(event.getName())
                .participantName(participant.getFullName())
                .message("Réservation confirmée avec succès!")
                .build();
    }

    public byte[] generateTicketPDF(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ReservationException("Réservation introuvable"));
        
        return pdfTicketService.generateTicketPDF(reservation);
    }

    public List<ReservationResponse> getReservationsByEvent(Long eventId) {
        return reservationRepository.findByEventId(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReservationResponse> getReservationsByParticipant(Long participantId) {
        return reservationRepository.findByParticipantId(participantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ReservationException("Réservation introuvable"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new ReservationException("Cette réservation est déjà annulée");
        }

        // Décrémenter les places réservées
        Event event = reservation.getEvent();
        event.setReservedPlaces(Math.max(0, event.getReservedPlaces() - 1));
        eventRepository.save(event);

        // Mettre à jour le status
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }

    private String generateUniqueTicketCode() {
        return "TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .ticketCode(reservation.getTicketCode())
                .reservationDate(reservation.getReservationDate())
                .status(reservation.getStatus())
                .eventName(reservation.getEvent().getName())
                .participantName(reservation.getParticipant().getFullName())
                .build();
    }

    // Validation de ticket (Scan QR Code)
    public TicketValidationResponse validateTicket(String ticketCode) {
        Reservation reservation = reservationRepository.findByTicketCode(ticketCode)
                .orElse(null);

        if (reservation == null) {
            return TicketValidationResponse.builder()
                    .valid(false)
                    .message("❌ Ticket invalide - Code introuvable")
                    .ticketCode(ticketCode)
                    .build();
        }

        // Vérifier si le ticket a été annulé
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            return TicketValidationResponse.builder()
                    .valid(false)
                    .message("❌ Ticket invalide - Réservation annulée")
                    .ticketCode(ticketCode)
                    .eventName(reservation.getEvent().getName())
                    .participantName(reservation.getParticipant().getFullName())
                    .status(reservation.getStatus())
                    .build();
        }

        // Vérifier si le participant a déjà assisté (ticket déjà utilisé)
        boolean alreadyUsed = reservation.getParticipant().isAttended();
        
        if (alreadyUsed) {
            return TicketValidationResponse.builder()
                    .valid(false)
                    .message("⚠️ Ticket déjà utilisé")
                    .ticketCode(ticketCode)
                    .eventName(reservation.getEvent().getName())
                    .eventDate(reservation.getEvent().getDate())
                    .eventLocation(reservation.getEvent().getLocation())
                    .participantName(reservation.getParticipant().getFullName())
                    .participantEmail(reservation.getParticipant().getEmail())
                    .status(reservation.getStatus())
                    .reservationDate(reservation.getReservationDate())
                    .alreadyUsed(true)
                    .build();
        }

        // Ticket valide
        return TicketValidationResponse.builder()
                .valid(true)
                .message("✅ Ticket valide - Bienvenue!")
                .ticketCode(ticketCode)
                .eventName(reservation.getEvent().getName())
                .eventDate(reservation.getEvent().getDate())
                .eventLocation(reservation.getEvent().getLocation())
                .participantName(reservation.getParticipant().getFullName())
                .participantEmail(reservation.getParticipant().getEmail())
                .status(reservation.getStatus())
                .reservationDate(reservation.getReservationDate())
                .alreadyUsed(false)
                .build();
    }

    // Marquer le ticket comme utilisé
    @Transactional
    public void markTicketAsUsed(String ticketCode) {
        Reservation reservation = reservationRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ReservationException("Ticket introuvable"));

        Participant participant = reservation.getParticipant();
        participant.setAttended(true);
        participantRepository.save(participant);
    }
}
