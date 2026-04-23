import { Component } from '@angular/core';
import { TicketValidationService, TicketValidationResponse } from '../../services/ticket-validation.service';

@Component({
  selector: 'app-ticket-scanner',
  templateUrl: './ticket-scanner.component.html',
  styleUrls: ['./ticket-scanner.component.scss'],
  standalone: false
})
export class TicketScannerComponent {
  ticketCode = '';
  validationResult: TicketValidationResponse | null = null;
  loading = false;

  constructor(private validationService: TicketValidationService) {}

  validateTicket() {
    if (!this.ticketCode.trim()) {
      alert('Veuillez entrer un code de ticket');
      return;
    }

    this.loading = true;
    this.validationService.validateTicket(this.ticketCode).subscribe({
      next: (result) => {
        this.validationResult = result;
        this.loading = false;

        // Si le ticket est valide et pas encore utilisé, demander confirmation
        if (result.valid && !result.alreadyUsed) {
          if (confirm(`✅ Ticket valide!\n\nParticipant: ${result.participantName}\nÉvénement: ${result.eventName}\n\nMarquer ce ticket comme utilisé?`)) {
            this.markAsUsed();
          }
        }
      },
      error: (error) => {
        console.error('Erreur validation:', error);
        this.loading = false;
        alert('Erreur lors de la validation du ticket');
      }
    });
  }

  markAsUsed() {
    this.validationService.markAsUsed(this.ticketCode).subscribe({
      next: () => {
        alert('✅ Ticket marqué comme utilisé');
        if (this.validationResult) {
          this.validationResult.alreadyUsed = true;
        }
      },
      error: (error) => {
        console.error('Erreur marquage:', error);
        alert('Erreur lors du marquage du ticket');
      }
    });
  }

  reset() {
    this.ticketCode = '';
    this.validationResult = null;
  }

  getStatusClass(): string {
    if (!this.validationResult) return '';
    return this.validationResult.valid ? 'valid' : 'invalid';
  }
}
