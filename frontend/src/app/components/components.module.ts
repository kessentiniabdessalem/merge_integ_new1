import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TicketScannerComponent } from './ticket-scanner/ticket-scanner.component';

@NgModule({
  declarations: [
    TicketScannerComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [TicketScannerComponent],
})
export class ComponentsModule {}