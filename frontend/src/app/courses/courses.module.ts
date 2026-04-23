











import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';

import { CourseListComponent } from '../pages/courses/course-list/course-list.component';
import { CourseManagementComponent } from '../pages/course-management/course-management.component';

@NgModule({
  declarations: [CourseListComponent, CourseManagementComponent],
  imports: [CommonModule, RouterModule, FormsModule, CoreModule],
  exports: [CourseListComponent, CourseManagementComponent],
})
export class CoursesModule {}
