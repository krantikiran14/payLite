import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule,
  ],
  template: `
    @if (auth.isAuthenticated()) {
      <mat-toolbar class="app-toolbar">
        <button mat-icon-button (click)="sidenavOpen = !sidenavOpen" class="menu-btn">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="logo-text">Pay<span class="logo-accent">Lite</span></span>
        <span class="spacer"></span>
        <span class="user-name">{{ auth.currentUser()?.companyName }}</span>
        <button mat-icon-button (click)="auth.logout()" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav [opened]="sidenavOpen" mode="side" class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/payroll/4/2026" routerLinkActive="active-link">
              <mat-icon matListItemIcon>payments</mat-icon>
              <span matListItemTitle>Payroll</span>
            </a>
            <a mat-list-item routerLink="/employees" routerLinkActive="active-link">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Employees</span>
            </a>
            <a mat-list-item routerLink="/attendance/4/2026" routerLinkActive="active-link">
              <mat-icon matListItemIcon>event_available</mat-icon>
              <span matListItemTitle>Attendance</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>
        <mat-sidenav-content class="main-content">
          <router-outlet />
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100vh; }
    .app-toolbar {
      background: linear-gradient(135deg, #185FA5 0%, #1a73c7 100%);
      color: white; position: sticky; top: 0; z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .logo-text { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.5px; }
    .logo-accent { color: #64B5F6; }
    .spacer { flex: 1; }
    .user-name { font-size: 0.85rem; opacity: 0.9; margin-right: 8px; }
    .menu-btn { margin-right: 8px; }
    .sidenav-container { flex: 1; }
    .sidenav {
      width: 220px; background: #f8fafc;
      border-right: 1px solid #e2e8f0;
    }
    .main-content { padding: 24px; background: #f1f5f9; min-height: 100%; }
    .active-link { background: rgba(24,95,165,0.08) !important; color: #185FA5 !important; }
    @media (max-width: 768px) {
      .sidenav { width: 200px; }
      .main-content { padding: 16px; }
      .user-name { display: none; }
    }
  `],
})
export class AppComponent {
  sidenavOpen = true;
  constructor(public auth: AuthService) {}
}
