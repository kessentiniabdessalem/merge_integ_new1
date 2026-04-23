import { Component, OnInit } from '@angular/core';
import { CertificateService, Certificate } from '../../../core/services/certificate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrl: './certificate-list.component.scss',
  standalone: false,
})
export class CertificateListComponent implements OnInit {
  certificates: Certificate[] = [];
  isLoading = false;
  error: string = '';

  constructor(
    private certificateService: CertificateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading = true;
    this.error = '';
    
    this.certificateService.getCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load certificates: ' + err.message;
        this.isLoading = false;
        console.error('Error loading certificates:', err);
      }
    });
  }

  editCertificate(certificate: Certificate): void {
    this.router.navigate(['/admin/certificates', certificate.id, 'edit']);
  }

  deleteCertificate(certificate: Certificate): void {
    if (confirm(`Are you sure you want to delete certificate for ${certificate.user_name || 'User ' + certificate.user_id}?`)) {
      this.certificateService.deleteCertificate(certificate.id!).subscribe({
        next: () => {
          this.loadCertificates(); // Reload the list
        },
        error: (err) => {
          this.error = 'Failed to delete certificate: ' + err.message;
          console.error('Error deleting certificate:', err);
        }
      });
    }
  }

  downloadCertificate(certificate: Certificate): void {
    if (certificate.pdf_path) {
      // Open PDF in new tab
      window.open(certificate.pdf_path, '_blank');
    } else {
      alert('PDF not available for this certificate');
    }
  }

  generateCertificate(certificate: Certificate): void {
    if (confirm(`Generate certificate for ${certificate.user_name || 'User ' + certificate.user_id}?`)) {
      this.certificateService.generateCertificate(certificate.id!).subscribe({
        next: () => {
          alert('Certificate generated successfully!');
          this.loadCertificates();
        },
        error: (err) => {
          this.error = 'Failed to generate certificate: ' + err.message;
          console.error('Error generating certificate:', err);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ISSUED':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning';
      case 'REVOKED':
        return 'bg-danger';
      case 'EXPIRED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  getGradeColor(grade: number | undefined): string {
    if (!grade) return 'text-secondary';
    if (grade >= 90) return 'text-success';
    if (grade >= 80) return 'text-primary';
    if (grade >= 70) return 'text-warning';
    return 'text-danger';
  }
}
