import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';

@NgModule({
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  exports: [NavbarComponent, FooterComponent],
})
export class CoreModule {}
