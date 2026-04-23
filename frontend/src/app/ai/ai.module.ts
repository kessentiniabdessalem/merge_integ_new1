import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AI_ROUTES } from './ai.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AI_ROUTES)
  ]
})
export class AiModule { }
