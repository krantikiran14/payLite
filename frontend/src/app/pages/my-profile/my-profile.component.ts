import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <div class="top-bar">
        <a routerLink="/check-in" class="back-link">
          <mat-icon>arrow_back</mat-icon> Back to Check-in
        </a>
      </div>

      @if (loading()) {
        <div class="state-box"><mat-spinner diameter="40"></mat-spinner><p>Loading profile...</p></div>
      } @else if (errorMsg()) {
        <div class="state-box error">
          <mat-icon>error_outline</mat-icon>
          <p>{{ errorMsg() }}</p>
          <p class="hint">Make sure you've registered your device via QR check-in first.</p>
        </div>
      } @else {
        <!-- Profile Card -->
        <mat-card class="profile-card">
          <div class="profile-header">
            <div class="avatar" [style.background]="avatarColor">{{ initials() }}</div>
            <div>
              <h1 class="name">{{ employee().name }}</h1>
              <p class="role">{{ employee().role }}</p>
              <p class="since">Joined {{ employee().joiningDate | date:'mediumDate' }}</p>
            </div>
          </div>
        </mat-card>

        <!-- Editable Contact Info -->
        <mat-card class="contact-card">
          <h2><mat-icon>contact_phone</mat-icon> Contact Information</h2>
          <p class="edit-hint">You can update your contact details below.</p>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone Number</mat-label>
            <input matInput [(ngModel)]="phone" placeholder="+91 XXXXX XXXXX">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Emergency Contact</mat-label>
            <input matInput [(ngModel)]="emergencyContact" placeholder="Name — Phone">
            <mat-icon matPrefix>emergency</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <textarea matInput [(ngModel)]="address" rows="2" placeholder="Your home address"></textarea>
            <mat-icon matPrefix>home</mat-icon>
          </mat-form-field>

          <button mat-flat-button color="primary" class="save-btn" [disabled]="saving()" (click)="saveProfile()">
            @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
            @else { Save Changes }
          </button>
        </mat-card>

        <!-- Attendance History -->
        <mat-card class="history-card">
          <h2><mat-icon>history</mat-icon> Attendance History (Last 30 Days)</h2>

          @if (dailySummary().length === 0) {
            <p class="no-data">No attendance records found.</p>
          } @else {
            <div class="history-list">
              @for (day of dailySummary(); track day.date) {
                <div class="day-row">
                  <div class="day-date">
                    <span class="date-main">{{ day.date | date:'EEE, MMM d' }}</span>
                  </div>
                  <div class="day-times">
                    @if (day.checkIn) {
                      <span class="badge in">IN {{ day.checkIn | date:'shortTime' }}</span>
                    }
                    @if (day.checkOut) {
                      <span class="badge out">OUT {{ day.checkOut | date:'shortTime' }}</span>
                    }
                  </div>
                  <div class="day-stats">
                    @if (day.workMinutes > 0) {
                      <span class="stat">{{ formatDuration(day.workMinutes) }} work</span>
                    }
                    @if (day.lunchMinutes > 0) {
                      <span class="stat lunch">{{ day.lunchMinutes }}m lunch</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      min-height:100vh; background:#f1f5f9; padding:20px; font-family:'Inter',sans-serif;
      max-width:560px; margin:0 auto;
    }

    .top-bar { margin-bottom:20px; }
    .back-link {
      display:inline-flex; align-items:center; gap:4px;
      color:#185FA5; font-weight:600; font-size:.9rem; text-decoration:none;
    }

    .state-box {
      padding:60px 20px; text-align:center; display:flex; flex-direction:column;
      align-items:center; gap:12px;
    }
    .state-box.error mat-icon { font-size:48px; width:48px; height:48px; color:#dc2626; }
    .hint { color:#94a3b8; font-size:.85rem; }

    mat-card {
      border-radius:16px !important; box-shadow:0 4px 20px rgba(0,0,0,0.06) !important;
      padding:24px !important; margin-bottom:16px;
    }

    .profile-header { display:flex; align-items:center; gap:16px; }
    .avatar {
      width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center;
      color:#fff; font-weight:800; font-size:1.1rem; flex-shrink:0;
    }
    .name { font-size:1.2rem; font-weight:800; margin:0; color:#1e293b; }
    .role { font-size:.9rem; color:#64748b; margin:2px 0 0; }
    .since { font-size:.78rem; color:#94a3b8; margin:2px 0 0; }

    h2 { display:flex; align-items:center; gap:8px; font-size:1rem; font-weight:700; margin:0 0 4px; }
    h2 mat-icon { font-size:20px; width:20px; height:20px; color:#185FA5; }
    .edit-hint { color:#94a3b8; font-size:.82rem; margin:0 0 16px; }
    .full-width { width:100%; }
    .save-btn {
      width:100%; height:44px; font-weight:700; border-radius:12px !important;
      display:flex; align-items:center; justify-content:center; gap:8px;
    }

    .no-data { text-align:center; color:#94a3b8; padding:20px; }

    .history-list { display:flex; flex-direction:column; gap:8px; margin-top:12px; }
    .day-row {
      display:flex; align-items:center; gap:12px; padding:10px 12px;
      background:#f8fafc; border-radius:10px; flex-wrap:wrap;
    }
    .day-date { min-width:110px; }
    .date-main { font-weight:600; font-size:.88rem; }
    .day-times { display:flex; gap:6px; flex:1; }
    .badge {
      font-size:.7rem; font-weight:700; padding:3px 8px; border-radius:6px;
    }
    .badge.in { background:#dcfce7; color:#16a34a; }
    .badge.out { background:#dbeafe; color:#185FA5; }
    .day-stats { display:flex; gap:8px; }
    .stat { font-size:.78rem; font-weight:600; color:#64748b; }
    .stat.lunch { color:#ea580c; }
  `]
})
export class MyProfileComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  errorMsg = signal('');
  employee = signal<any>({});
  initials = signal('');
  avatarColor = '#185FA5';
  dailySummary = signal<any[]>([]);

  phone = '';
  emergencyContact = '';
  address = '';

  private deviceId = '';

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.deviceId = localStorage.getItem('paylite_device_id') || '';
    if (!this.deviceId) {
      this.errorMsg.set('No device registered. Please scan a QR code and register first.');
      this.loading.set(false);
      return;
    }
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.api.getMyProfile(this.deviceId).subscribe({
      next: (res) => {
        this.employee.set(res.employee);
        this.phone = res.employee.phone || '';
        this.emergencyContact = res.employee.emergencyContact || '';
        this.address = res.employee.address || '';
        this.dailySummary.set(res.dailySummary || []);

        const name = res.employee.name || '';
        this.initials.set(name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase());
        const colors = ['#185FA5', '#2E7D32', '#6A1B9A', '#854F0B', '#0e7490', '#be123c'];
        const hash = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
        this.avatarColor = colors[hash % colors.length];

        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.error || 'Failed to load profile');
        this.loading.set(false);
      }
    });
  }

  saveProfile() {
    this.saving.set(true);
    this.api.updateMyProfile(this.deviceId, {
      phone: this.phone,
      emergencyContact: this.emergencyContact,
      address: this.address
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Profile updated!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.saving.set(false);
        this.snackBar.open(err?.error?.error || 'Failed to save', 'OK', { duration: 5000 });
      }
    });
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
