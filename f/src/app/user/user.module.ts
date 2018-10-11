import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      { path: 'sign-up', component: SignupComponent },
      { path: 'forgotPassword', component: ForgotPasswordComponent },
      { path: 'resetPassword/:userId', component: ResetPasswordComponent },
    ])
  ],
  declarations: [SignupComponent, LoginComponent, ForgotPasswordComponent, ResetPasswordComponent]
})
export class UserModule { }
