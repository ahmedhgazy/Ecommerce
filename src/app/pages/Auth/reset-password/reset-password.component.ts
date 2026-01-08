import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ToastModule,
    TranslateModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [MessageService],
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  token: string = '';
  email: string = '';
  isLoading = false;
  isSuccess = false;
  error: string | null = null;

  form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';

      if (!this.token || !this.email) {
        this.error = 'Invalid reset link. Please request a new password reset.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all fields correctly'
      });
      return;
    }

    const { newPassword, confirmPassword } = this.form.value;

    if (newPassword !== confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Passwords do not match'
      });
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.auth.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: newPassword
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.isSuccess = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset successfully! You can now login with your new password.'
          });
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.error = response.message || 'Failed to reset password';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message || 'Failed to reset password. The link may have expired.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.error!
        });
      }
    });
  }
}
