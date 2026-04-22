import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, 
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="checkin-container">
      <div class="header">
        <mat-icon class="logo">qr_code_2</mat-icon>
        <h1>PayLite <span class="accent">Attendance</span></h1>
        <p class="company-name" *ngIf="companyName()">{{ companyName() }}</p>
      </div>

      <mat-card class="checkin-card">
        <mat-card-content>
          @if (loading()) {
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Fetching team list...</p>
            </div>
          } @else if (error()) {
            <div class="error-state">
              <mat-icon>error_outline</mat-icon>
              <p>{{ error() }}</p>
              <button mat-stroked-button color="warn" (click)="loadEmployees()">Try Again</button>
            </div>
          } @else if (success()) {
            <div class="success-state">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Attendance Marked!</h2>
              <p>Successfully recorded for <strong>{{ selectedEmployeeName() }}</strong></p>
              <p class="time">{{ lastScanTime() | date:'mediumTime' }}</p>
              <button mat-flat-button color="primary" (click)="reset()">Back to Check-in</button>
            </div>
          } @else {
            <p class="instruction">Select your name and mark your status</p>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Employee</mat-label>
              <mat-select [(ngModel)]="selectedEmployeeId" (selectionChange)="onEmployeeSelect($event.value)">
                @for (emp of employees(); track emp.id) {
                  <mat-option [value]="emp.id">{{ emp.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="actions">
              <button mat-flat-button class="btn-in" [disabled]="!selectedEmployeeId || submitting()" (click)="submit('IN')">
                <mat-icon>login</mat-icon> CHECK IN
              </button>
              <button mat-flat-button class="btn-out" [disabled]="!selectedEmployeeId || submitting()" (click)="submit('OUT')">
                <mat-icon>logout</mat-icon> CHECK OUT
              </button>
            </div>

            @if (submitting()) {
              <div class="submitting-overlay">
                <mat-spinner diameter="30"></mat-spinner>
                <span>Recording...</span>
              </div>
            }

            <p class="location-hint" *ngIf="gpsEnabled()">
              <mat-icon>location_on</mat-icon> GPS verification active
            </p>
          }
        </mat-card-content>
      </mat-card>

      <div class="footer">
        <p>&copy; 2026 PayLite Payroll System</p>
      </div>
    </div>
  `,
  styles: [`
    .checkin-container {
      min-height: 100vh; background: #f1f5f9; display: flex; flex-direction: column;
      align-items: center; justify-content: center; padding: 20px; font-family: 'Inter', sans-serif;
    }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 48px; width: 48px; height: 48px; color: #185FA5; margin-bottom: 8px; }
    .header h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0; }
    .accent { color: #185FA5; }
    .company-name { color: #64748b; font-weight: 500; margin-top: 4px; }

    .checkin-card {
      width: 100%; max-width: 400px; border-radius: 20px !important;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important; padding: 12px;
    }
    .instruction { color: #64748b; text-align: center; margin-bottom: 24px; font-size: 0.95rem; }
    .full-width { width: 100%; }

    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
    .actions button { height: 60px; font-weight: 700; border-radius: 12px !important; letter-spacing: 0.5px; }
    .btn-in { background: #2E7D32 !important; color: white !important; }
    .btn-out { background: #185FA5 !important; color: white !important; }

    .loading-state, .error-state, .success-state {
      padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .success-icon { font-size: 64px; width: 64px; height: 64px; color: #2E7D32; }
    .success-state h2 { margin: 0; color: #1e293b; }
    .time { font-size: 1.5rem; font-weight: 800; color: #185FA5; margin: 8px 0; }

    .error-state mat-icon { font-size: 48px; width: 48px; height: 48px; color: #dc2626; }
    .submitting-overlay {
      display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 20px; color: #64748b;
    }
    .location-hint {
      display: flex; align-items: center; justify-content: center; gap: 4px;
      margin-top: 24px; color: #10b981; font-size: 0.8rem; font-weight: 600;
    }
    .location-hint mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .footer { margin-top: 40px; color: #94a3b8; font-size: 0.85rem; }
  `]
})
export class CheckInComponent implements OnInit {
  token = '';
  companyName = signal('');
  employees = signal<any[]>([]);
  loading = signal(true);
  submitting = signal(false);
  success = signal(false);
  error = signal('');
  
  selectedEmployeeId = '';
  selectedEmployeeName = signal('');
  lastScanTime = signal(new Date());
  gpsEnabled = signal(true);

  coords: { lat?: number, lon?: number } = {};

  constructor(private route: ActivatedRoute, private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.error.set('Invalid QR Code. Please ask your administrator for a fresh scan.');
      this.loading.set(false);
      return;
    }
    this.loadEmployees();
    this.requestLocation();
  }

  loadEmployees() {
    this.loading.set(true);
    this.error.set('');
    this.api.getScanEmployees(this.token).subscribe({
      next: (res) => {
        this.employees.set(res.employees);
        this.companyName.set(res.company);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.error || 'Failed to load team list');
        this.loading.set(false);
      }
    });
  }

  requestLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        },
        () => {
          console.warn('Location access denied');
          // We don't block for demo, but in production you might
        }
      );
    }
  }

  onEmployeeSelect(id: string) {
    const emp = this.employees().find(e => e.id === id);
    if (emp) this.selectedEmployeeName.set(emp.name);
  }

  submit(type: 'IN' | 'OUT') {
    this.submitting.set(true);
    this.api.recordScan({
      employeeId: this.selectedEmployeeId,
      type,
      token: this.token,
      lat: this.coords.lat,
      lon: this.coords.lon
    }).subscribe({
      next: (res) => {
        this.lastScanTime.set(new Date(res.scanTime));
        this.success.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || 'Failed to mark attendance', 'OK', { duration: 5000 });
        this.submitting.set(false);
      }
    });
  }

  reset() {
    this.success.set(false);
    this.selectedEmployeeId = '';
  }
}
