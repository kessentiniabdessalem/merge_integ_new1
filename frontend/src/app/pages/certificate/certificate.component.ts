import { Component } from '@angular/core';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.scss',
  standalone: false,
})
export class CertificateComponent {
  certificates = [
    { id: 1, course: 'French B1 Course', date: '2024-03-10', completed: true },
    { id: 2, course: 'Spanish A2 Course', date: '2024-02-15', completed: true },
    { id: 3, course: 'English C1 Course', date: null, completed: false },
  ];

  generateCertificate(cert: { id: number; course: string; completed: boolean }): void {
    if (cert.completed) {
      console.log('Generating certificate for:', cert.course);
    } else {
      console.log('Complete the course and payment first');
    }
  }

  downloadCertificate(cert: { id: number; course: string; completed: boolean }): void {
    if (cert.completed) {
      console.log('Downloading certificate for:', cert.course);
    }
  }
}
