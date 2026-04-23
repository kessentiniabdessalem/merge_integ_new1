import { Directive, Input, OnChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GMAIL_SUFFIX = '@gmail.com';
const LEARNIFY_SUFFIX = '@learnify.com';

@Directive({
  selector: '[appGmailEmail]',
  standalone: false,
  providers: [
    { provide: NG_VALIDATORS, useExisting: GmailEmailValidatorDirective, multi: true }
  ]
})
export class GmailEmailValidatorDirective implements Validator, OnChanges {

  @Input() appGmailEmail: string = '';

  private onChange: (() => void) | null = null;

  ngOnChanges(): void {
    if (this.onChange) {
      this.onChange();
    }
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').trim();
    if (value === '') return null;

    if (!EMAIL_REGEX.test(value)) {
      return { email: true };
    }

    const role = (this.appGmailEmail || '').toString().toLowerCase();
    const isLearnifyRole = role === 'admin' || role === 'tutor';

    if (isLearnifyRole) {
      if (!value.toLowerCase().endsWith(LEARNIFY_SUFFIX)) {
        return { learnify: true };
      }
    } else {
      if (!value.toLowerCase().endsWith(GMAIL_SUFFIX)) {
        return { gmail: true };
      }
    }
    return null;
  }
}
