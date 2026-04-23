import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

import { HomeComponent } from '../pages/home/home.component';
import { HeroComponent } from '../components/hero/hero.component';
import { FeaturesComponent } from '../components/features/features.component';
import { CoursesComponent } from '../components/courses/courses.component';
import { MentorComponent } from '../components/mentor/mentor.component';
import { GroupComponent } from '../components/group/group.component';
import { TestimonialsComponent } from '../components/testimonials/testimonials.component';
import { PricingComponent } from '../components/pricing/pricing.component';

// Nouveaux components
import { EventStatisticsComponent } from '../components/event-statistics/event-statistics.component';

@NgModule({
  declarations: [
    HomeComponent,
    HeroComponent,
    FeaturesComponent,
    CoursesComponent,
    MentorComponent,
    GroupComponent,
    TestimonialsComponent,
    PricingComponent,
    EventStatisticsComponent,
  ],
  imports: [CommonModule, RouterModule, FormsModule, CoreModule, SharedModule],
  exports: [HomeComponent, EventStatisticsComponent],
})
export class HomeModule {}
