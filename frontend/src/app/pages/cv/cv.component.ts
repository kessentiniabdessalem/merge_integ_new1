import { Component, OnInit } from '@angular/core';
import { CvProfileService, CvProfile } from '../../services/cv-profile.service';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
  standalone: false,
})
export class CvComponent implements OnInit {
  profile: CvProfile | null = null;
  loading = true;
  uploading = false;
  uploadError: string | null = null;
  uploadSuccess = false;

  constructor(private cvProfileService: CvProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.cvProfileService.getMyCv().subscribe({
      next: (p) => {
        this.profile = p;
        this.loading = false;
      },
      error: () => {
        // 404 = no CV yet, that is fine
        this.profile = null;
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
      this.uploadError = 'Only PDF files are accepted.';
      return;
    }
    this.uploadError = null;
    this.uploadSuccess = false;
    this.uploading = true;
    this.cvProfileService.uploadCv(file).subscribe({
      next: (p) => {
        this.profile = p;
        this.uploading = false;
        this.uploadSuccess = true;
      },
      error: () => {
        this.uploadError = 'Upload failed. Please try again.';
        this.uploading = false;
      },
    });
  }
}
