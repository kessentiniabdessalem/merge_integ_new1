import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-learnbot></app-learnbot>
    <app-voice-command></app-voice-command>
    <app-toast></app-toast>
  `,
  styles: [],
  standalone: false,
})
export class AppComponent {}
