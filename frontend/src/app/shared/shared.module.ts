import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GetStartedModalComponent } from '../components/get-started-modal/get-started-modal.component';

@NgModule({
  declarations: [GetStartedModalComponent],
  imports: [CommonModule],
  exports: [GetStartedModalComponent, CommonModule],
})
export class SharedModule {}
