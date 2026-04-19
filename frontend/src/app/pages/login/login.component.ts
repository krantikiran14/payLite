import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <div class="login-card-wrapper">
        <div class="brand">
          <div class="brand-icon">
            <mat-icon class="brand-logo">payments</mat-icon>
          </div>
          <h1 class="brand-name">Pay<span class="accent">Lite</span></h1>
          <p class="brand-tagline">Payroll management for Indian micro-businesses</p>
        </div>

        <mat-card class="login-card">
          <mat-card-content>
            <h2 class="login-title">Welcome back</h2>
            <p class="login-subtitle">Sign in to manage your payroll</p>

            @if (errorMsg()) {
              <div class="error-banner">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMsg() }}</span>
              </div>
            }

            <form (ngSubmit)="onLogin()" class="login-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" [(ngModel)]="email" name="email" required id="login-email">
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required id="login-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" class="login-btn" [disabled]="loading()" id="login-submit">
                @if (loading()) {
                  <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                } @else {
                  Sign In
                }
              </button>
            </form>

            <div class="demo-hint">
              <mat-icon>info</mat-icon>
              <span>Demo: <strong>demo&#64;paylite.in</strong> / <strong>demo1234</strong></span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f2b46 0%, #185FA5 50%, #1a73c7 100%);
      padding: 20px;
    }
    .login-card-wrapper { width: 100%; max-width: 420px; }
    .brand { text-align: center; margin-bottom: 32px; }
    .brand-icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .brand-logo { font-size: 36px; width: 36px; height: 36px; color: white; }
    .brand-name { font-size: 2rem; font-weight: 800; color: white; margin: 0; letter-spacing: -1px; }
    .accent { color: #64B5F6; }
    .brand-tagline { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 4px; }
    .login-card {
      border-radius: 16px !important; padding: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
    }
    .login-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: #1e293b; }
    .login-subtitle { color: #64748b; margin: 0 0 24px; }
    .login-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .login-btn {
      height: 48px; font-size: 1rem; font-weight: 600; border-radius: 12px !important;
      background: linear-gradient(135deg, #185FA5, #1a73c7) !important;
      color: white !important;
      margin-top: 8px;
    }
    .btn-spinner { margin: 0 auto; }
    .error-banner {
      background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
      padding: 12px 16px; display: flex; align-items: center; gap: 8px;
      color: #dc2626; margin-bottom: 16px; font-size: 0.9rem;
    }
    .demo-hint {
      margin-top: 20px; padding: 12px; background: #f0f7ff; border-radius: 8px;
      display: flex; align-items: center; gap: 8px; color: #185FA5; font-size: 0.85rem;
    }
    .demo-hint mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = signal(false);
  errorMsg = signal('');

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isAuthenticated()) {
      this.router.navigate(['/payroll/4/2026']);
    }
  }

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMsg.set('Please enter email and password');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/payroll/4/2026']);
    } catch (err: any) {
      this.errorMsg.set(err?.error?.error || 'Login failed. Please check your credentials.');
    } finally {
      this.loading.set(false);
    }
  }
}
