import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Certificate, CertificateService } from '../../../core/services/certificate.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-certificate-form',
  templateUrl: './certificate-form.component.html',
  styleUrl: './certificate-form.component.scss',
  standalone: false,
})
export class CertificateFormComponent implements OnInit {
  certificateForm: FormGroup;
  isEditing = false;
  isLoading = false;
  error: string = '';
  certificateId: number | null = null;

  certificateStatuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'issued', label: 'Issued' },
    { value: 'revoked', label: 'Revoked' }
  ];

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.certificateForm = this.fb.group({
      user_id: ['', [Validators.required, Validators.min(1)]],
      course_id: ['', [Validators.required, Validators.min(1)]],
      certificate_number: ['', [Validators.required]],
      issue_date: ['', Validators.required],
      completion_date: ['', Validators.required],
      grade: ['', [Validators.min(0), Validators.max(100)]],
      status: ['draft', Validators.required],
      verification_code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.certificateId = parseInt(id);
      this.isEditing = true;
      this.loadCertificate(this.certificateId);
    } else {
      // Generate default values for new certificate
      this.generateDefaultValues();
    }
  }

  generateDefaultValues(): void {
    const currentDate = new Date().toISOString().split('T')[0];
    this.certificateForm.patchValue({
      certificate_number: 'CERT-' + date('Y') + '-' + Math.floor(Math.random() * 90000) + 10000,
      verification_code: 'VERIFY-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      issue_date: currentDate,
      completion_date: currentDate,
      status: 'draft'
    });
  }

  loadCertificate(id: number): void {
    this.isLoading = true;
    this.certificateService.getCertificate(id).subscribe({
      next: (certificate) => {
        this.certificateForm.patchValue({
          user_id: certificate.user_id,
          course_id: certificate.course_id,
          certificate_number: certificate.certificate_number,
          issue_date: certificate.issue_date,
          completion_date: certificate.completion_date,
          grade: certificate.grade,
          status: certificate.status,
          verification_code: certificate.verification_code
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load certificate: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.certificateForm.invalid) {
      this.markFormGroupTouched(this.certificateForm);
      return;
    }

    this.isLoading = true;
    this.error = '';

    const formData = this.certificateForm.value;

    if (this.isEditing && this.certificateId) {
      // Update existing certificate
      this.certificateService.updateCertificate(this.certificateId, formData).subscribe({
        next: () => {
          this.router.navigate(['/admin/certificates']);
        },
        error: (err) => {
          this.error = 'Failed to update certificate: ' + err.message;
          this.isLoading = false;
        }
      });
    } else {
      // Create new certificate
      this.certificateService.createCertificate(formData).subscribe({
        next: () => {
          this.router.navigate(['/admin/certificates']);
        },
        error: (err) => {
          this.error = 'Failed to create certificate: ' + err.message;
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/certificates']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.certificateForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.certificateForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['min']) return 'Value must be at least 1';
      if (field.errors['max']) return 'Grade cannot exceed 100';
    }
    return '';
  }
}

// Helper function for date generation
function date(format: string): string {
  const d = new Date();
  if (format === 'Y') {
    return d.getFullYear().toString();
  }
  return d.toISOString().split('T')[0];
}
