import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';

import { UserManagementRoutingModule } from './user-management-routing-module';

import { GmailEmailValidatorDirective } from './validators/gmail-email.validator';
import { ConfirmPasswordValidatorDirective } from './validators/confirm-password.validator';
import { Signin } from './signin/signin';
import { Signup } from './signup/signup';
import { SignupChoice } from './signup-choice/signup-choice';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';
import { PinCheck } from './pin-check/pin-check';
import { DevicePendingComponent } from './device-pending/device-pending';
import { DeviceConfirmComponent } from './device-confirm/device-confirm';
import { DeviceRejectComponent } from './device-reject/device-reject';
import { QrLoginComponent } from './qr-login/qr-login';
import { QrApproveComponent } from './qr-approve/qr-approve';

@NgModule({
  declarations: [
    GmailEmailValidatorDirective,
    ConfirmPasswordValidatorDirective,
    Signin,
    Signup,
    SignupChoice,
    ForgotPassword,
    ResetPassword,
    PinCheck,
    DevicePendingComponent,
    DeviceConfirmComponent,
    DeviceRejectComponent,
    QrLoginComponent,
    QrApproveComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UserManagementRoutingModule,
    QRCodeComponent
  ]
})
export class UserManagementModule { }
