import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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

const routes: Routes = [
  { path: 'login', component: Signin },
  { path: 'signup-choice', component: SignupChoice },
  { path: 'signup', component: Signup },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'pin-check', component: PinCheck },
  { path: 'device-pending', component: DevicePendingComponent },
  { path: 'device-confirm', component: DeviceConfirmComponent },
  { path: 'device-reject', component: DeviceRejectComponent },
  { path: 'qr-login', component: QrLoginComponent },
  { path: 'qr-approve', component: QrApproveComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
