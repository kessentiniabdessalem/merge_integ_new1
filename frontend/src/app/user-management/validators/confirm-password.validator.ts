import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appConfirmPassword]',
  standalone: false,
  providers: [
    { provide: NG_VALIDATORS, useExisting: ConfirmPasswordValidatorDirective, multi: true }
  ]
})
export class ConfirmPasswordValidatorDirective implements Validator, OnChanges {

  @Input() appConfirmPassword = '';

  private control: AbstractControl | null = null;

  validate(control: AbstractControl): ValidationErrors | null {
    this.control = control;
    const confirmValue = (control.value || '').trim();
    const passwordValue = (this.appConfirmPassword || '').trim();
    if (confirmValue === '' || passwordValue === '') return null;
    return passwordValue === confirmValue ? null : { confirmMismatch: true };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appConfirmPassword'] && this.control) {
      this.control.updateValueAndValidity();
    }
  }
}
