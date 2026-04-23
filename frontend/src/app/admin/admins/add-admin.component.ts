import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { AdminManagementService } from '../../services/admin-management.service';

const LEARNIFY_DOMAIN = '@learnify.com';

function personalEmailValidator(domain: string) {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const parent = control.parent;
    if (!parent) return null;
    const username = (parent.get('username')?.value || '').trim();
    const learnify = username ? `${username}${domain}` : '';
    const personal = (control.value || '').trim().toLowerCase();
    if (!personal) return null;
    if (learnify && personal === learnify.toLowerCase()) return { sameAsLearnify: true };
    if (personal.endsWith('@learnify.com')) return { endsWithLearnify: true };
    return null;
  };
}

@Component({
  selector: 'app-add-admin',
  standalone: false,
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.css'],
})
export class AddAdminComponent {
  readonly domain = LEARNIFY_DOMAIN;
  loading = false;
  msg = '';
  err = '';

  form;

  constructor(private fb: FormBuilder, private adminService: AdminManagementService) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      personalEmail: ['', [Validators.required, Validators.email, personalEmailValidator(LEARNIFY_DOMAIN)]],
    });
  }

  get email(): string {
    const u = (this.form.value.username || '').trim();
    return u ? `${u}${this.domain}` : '';
  }

  submit() {
    this.msg = '';
    this.err = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.err = 'Please fill all required fields correctly.';
      return;
    }

    this.loading = true;
    this.adminService.createAdmin({
      firstName: this.form.value.firstName!,
      lastName: this.form.value.lastName!,
      email: this.email,
      password: this.form.value.password!,
      personalEmail: this.form.value.personalEmail!.trim(),
    }).subscribe({
      next: () => {
        this.loading = false;
        this.err = '';
        this.msg = 'Admin created successfully';
        this.form.reset();
        setTimeout(() => { this.msg = ''; }, 5000);
      },
      error: (e: any) => {
        this.loading = false;
        this.msg = '';
        const msg = e?.error?.message || e?.error?.error;
        if (e?.status === 401) {
          this.err = 'Non autorisé. Connecte-toi avec un compte Admin (@learnify.com, onglet Admin).';
        } else if (e?.status === 403) {
          this.err =
            'Accès refusé. Déconnecte-toi puis reconnecte-toi en Admin, ou vide les cookies pour ce site si tu as aussi utilisé « Continue with Google » sur le même navigateur.';
        } else {
          this.err = msg || 'Échec de la création de l’administrateur.';
        }
      }
    });
  }
}
