import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatInputModule,
    MatProgressSpinnerModule, MatSnackBarModule
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

          <!-- LOADING -->
          @if (loading()) {
            <div class="state-box">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading...</p>
            </div>
          }

          <!-- ERROR -->
          @else if (errorMsg()) {
            <div class="state-box error">
              <mat-icon>error_outline</mat-icon>
              <p>{{ errorMsg() }}</p>
              <button mat-stroked-button color="warn" (click)="init()">Try Again</button>
            </div>
          }

          <!-- SUCCESS FEEDBACK -->
          @else if (successMsg()) {
            <div class="state-box success">
              <mat-icon class="big-icon success-icon">check_circle</mat-icon>
              <h2>{{ successMsg() }}</h2>
              <p class="time">{{ lastScanTime() | date:'mediumTime' }}</p>
              @if (lunchMinutes() > 0) {
                <p class="lunch-info">🍽 Lunch: {{ lunchMinutes() }} min today</p>
              }
              <button mat-flat-button color="primary" (click)="clearSuccess()">Back</button>
            </div>
          }

          <!-- REGISTER DEVICE (first-time) -->
          @else if (mode() === 'register') {
            <h2 class="section-title">Register Your Device</h2>
            <p class="instruction">Select your name and create a 4-digit PIN.<br/>This device will be linked to you.</p>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Your Name</mat-label>
              <mat-select [(ngModel)]="regEmployeeId">
                @for (emp of employees(); track emp.id) {
                  <mat-option [value]="emp.id">{{ emp.name }} — {{ emp.role }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Create 4-Digit PIN</mat-label>
              <input matInput type="password" maxlength="4" pattern="[0-9]*" inputmode="numeric"
                     [(ngModel)]="regPin" placeholder="e.g. 1234">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm PIN</mat-label>
              <input matInput type="password" maxlength="4" pattern="[0-9]*" inputmode="numeric"
                     [(ngModel)]="regPinConfirm" placeholder="Re-enter PIN">
            </mat-form-field>

            <button mat-flat-button color="primary" class="full-btn"
                    [disabled]="!regEmployeeId || regPin.length !== 4 || regPin !== regPinConfirm || submitting()"
                    (click)="registerDevice()">
              @if (submitting()) { <mat-spinner diameter="20"></mat-spinner> }
              @else { Register Device }
            </button>
          }

          <!-- PERSONAL DASHBOARD (device verified) -->
          @else if (mode() === 'dashboard') {
            <div class="dashboard">
              <div class="emp-card">
                <div class="emp-avatar" [style.background]="avatarColor">{{ initials() }}</div>
                <div>
                  <h2 class="emp-name">{{ empName() }}</h2>
                  <p class="emp-role">{{ empRole() }}</p>
                </div>
              </div>

              <div class="status-badge" [class]="statusClass()">
                {{ statusLabel() }}
              </div>

              <!-- Action Buttons -->
              <div class="actions-col">
                @if (allowedActions().includes('IN')) {
                  <button mat-flat-button class="action-btn btn-in" [disabled]="submitting()" (click)="scan('IN')">
                    <mat-icon>login</mat-icon> CHECK IN
                  </button>
                }
                @if (allowedActions().includes('LUNCH_START')) {
                  <button mat-flat-button class="action-btn btn-lunch" [disabled]="submitting()" (click)="scan('LUNCH_START')">
                    <mat-icon>restaurant</mat-icon> START LUNCH
                  </button>
                }
                @if (allowedActions().includes('LUNCH_END')) {
                  <button mat-flat-button class="action-btn btn-lunch-end" [disabled]="submitting()" (click)="scan('LUNCH_END')">
                    <mat-icon>restaurant</mat-icon> END LUNCH
                  </button>
                }
                @if (allowedActions().includes('OUT')) {
                  <button mat-flat-button class="action-btn btn-out" [disabled]="submitting()" (click)="scan('OUT')">
                    <mat-icon>logout</mat-icon> CHECK OUT
                  </button>
                }
              </div>

              @if (submitting()) {
                <div class="submitting"><mat-spinner diameter="24"></mat-spinner> Recording...</div>
              }

              @if (lunchMinutes() > 0) {
                <p class="lunch-total">🍽 Lunch time today: <strong>{{ lunchMinutes() }} min</strong></p>
              }

              <!-- Today's Timeline -->
              @if (todayScans().length > 0) {
                <div class="timeline">
                  <h3>Today's Activity</h3>
                  @for (s of todayScans(); track s.time) {
                    <div class="timeline-item">
                      <span class="tl-dot" [class]="'dot-' + s.type"></span>
                      <span class="tl-label">{{ scanLabel(s.type) }}</span>
                      <span class="tl-time">{{ s.time | date:'shortTime' }}</span>
                    </div>
                  }
                </div>
              }

              <div class="footer-links">
                <a routerLink="/my-profile" class="profile-link">
                  <mat-icon>person</mat-icon> My Profile
                </a>
              </div>

              @if (gpsEnabled()) {
                <p class="gps-hint"><mat-icon>location_on</mat-icon> GPS verified</p>
              }
            </div>
          }

        </mat-card-content>
      </mat-card>

      <div class="footer">
        <p>&copy; 2026 PayLite Payroll System</p>
        <button class="reset-link" (click)="resetDevice()">Not you? Switch account</button>
      </div>
    </div>
  `,
  styles: [`
    .checkin-container {
      min-height:100vh; background:#f1f5f9; display:flex; flex-direction:column;
      align-items:center; justify-content:center; padding:20px; font-family:'Inter',sans-serif;
    }
    .header { text-align:center; margin-bottom:24px; }
    .logo { font-size:48px; width:48px; height:48px; color:#185FA5; margin-bottom:8px; }
    .header h1 { font-size:1.5rem; font-weight:800; color:#1e293b; margin:0; }
    .accent { color:#185FA5; }
    .company-name { color:#64748b; font-weight:500; margin-top:4px; }

    .checkin-card {
      width:100%; max-width:420px; border-radius:20px !important;
      box-shadow:0 10px 40px rgba(0,0,0,0.1) !important; padding:8px;
    }

    .state-box {
      padding:40px 20px; text-align:center; display:flex; flex-direction:column;
      align-items:center; gap:12px;
    }
    .state-box.error mat-icon { font-size:48px; width:48px; height:48px; color:#dc2626; }
    .big-icon { font-size:56px; width:56px; height:56px; }
    .success-icon { color:#2E7D32; }
    .time { font-size:1.4rem; font-weight:800; color:#185FA5; }
    .lunch-info { color:#ea580c; font-weight:600; font-size:.9rem; }

    .section-title { text-align:center; font-weight:700; margin-bottom:4px; }
    .instruction { text-align:center; color:#64748b; font-size:.88rem; margin-bottom:20px; line-height:1.5; }
    .full-width { width:100%; }
    .full-btn { width:100%; height:48px; font-weight:700; border-radius:12px !important; margin-top:8px; }

    .dashboard { display:flex; flex-direction:column; gap:16px; }
    .emp-card { display:flex; align-items:center; gap:14px; }
    .emp-avatar {
      width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center;
      color:#fff; font-weight:800; font-size:1rem; flex-shrink:0;
    }
    .emp-name { font-size:1.1rem; font-weight:700; margin:0; }
    .emp-role { font-size:.85rem; color:#64748b; margin:2px 0 0; }

    .status-badge {
      text-align:center; padding:8px 16px; border-radius:10px; font-weight:700; font-size:.85rem;
    }
    .status-in { background:#dcfce7; color:#16a34a; }
    .status-out { background:#f1f5f9; color:#64748b; }
    .status-lunch { background:#fff7ed; color:#ea580c; }
    .status-none { background:#f1f5f9; color:#94a3b8; }

    .actions-col { display:flex; flex-direction:column; gap:10px; }
    .action-btn {
      height:54px; font-weight:700; border-radius:12px !important; letter-spacing:.5px;
      display:flex; align-items:center; justify-content:center; gap:8px;
    }
    .btn-in { background:#2E7D32 !important; color:#fff !important; }
    .btn-out { background:#185FA5 !important; color:#fff !important; }
    .btn-lunch { background:#ea580c !important; color:#fff !important; }
    .btn-lunch-end { background:#16a34a !important; color:#fff !important; }

    .submitting { display:flex; align-items:center; justify-content:center; gap:10px; color:#64748b; font-size:.9rem; }
    .lunch-total { text-align:center; color:#ea580c; font-weight:600; font-size:.88rem; margin:0; }

    .timeline { border-top:1px solid #e2e8f0; padding-top:12px; }
    .timeline h3 { font-size:.85rem; font-weight:700; color:#64748b; margin:0 0 10px; text-transform:uppercase; letter-spacing:1px; }
    .timeline-item { display:flex; align-items:center; gap:10px; padding:6px 0; }
    .tl-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
    .dot-IN { background:#16a34a; }
    .dot-OUT { background:#185FA5; }
    .dot-LUNCH_START { background:#ea580c; }
    .dot-LUNCH_END { background:#16a34a; }
    .tl-label { flex:1; font-size:.88rem; font-weight:600; }
    .tl-time { font-size:.82rem; color:#64748b; font-weight:600; }

    .footer-links { text-align:center; padding-top:8px; }
    .profile-link {
      display:inline-flex; align-items:center; gap:4px;
      color:#185FA5; font-weight:600; font-size:.88rem; text-decoration:none;
    }
    .profile-link mat-icon { font-size:18px; width:18px; height:18px; }

    .gps-hint {
      display:flex; align-items:center; justify-content:center; gap:4px;
      color:#10b981; font-size:.78rem; font-weight:600; margin:0;
    }
    .gps-hint mat-icon { font-size:14px; width:14px; height:14px; }

    .footer { margin-top:30px; text-align:center; color:#94a3b8; font-size:.82rem; }
    .reset-link {
      background:none; border:none; color:#94a3b8; cursor:pointer; font-size:.78rem;
      text-decoration:underline; margin-top:4px;
    }
  `]
})
export class CheckInComponent implements OnInit {
  token = '';
  deviceId = '';

  mode = signal<'register' | 'dashboard'>('register');
  loading = signal(true);
  submitting = signal(false);
  errorMsg = signal('');
  successMsg = signal('');
  companyName = signal('');
  gpsEnabled = signal(true);

  // Registration
  employees = signal<any[]>([]);
  regEmployeeId = '';
  regPin = '';
  regPinConfirm = '';

  // Dashboard
  empName = signal('');
  empRole = signal('');
  empId = signal('');
  initials = signal('');
  avatarColor = '#185FA5';
  lastScanTime = signal(new Date());
  lastScanType = signal('');
  allowedActions = signal<string[]>(['IN']);
  todayScans = signal<any[]>([]);
  lunchMinutes = signal(0);

  coords: { lat?: number; lon?: number } = {};

  constructor(private route: ActivatedRoute, private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.errorMsg.set('Invalid QR Code. Please ask your administrator for a fresh scan.');
      this.loading.set(false);
      return;
    }
    this.deviceId = this.getOrCreateDeviceId();
    this.requestLocation();
    this.init();
  }

  init() {
    this.loading.set(true);
    this.errorMsg.set('');

    // Try to verify existing device first
    this.api.verifyDevice({ deviceId: this.deviceId, token: this.token }).subscribe({
      next: (res) => {
        this.setDashboard(res);
        this.loading.set(false);
      },
      error: () => {
        // Device not registered → show registration
        this.loadEmployeesForRegistration();
      }
    });
  }

  loadEmployeesForRegistration() {
    this.api.getScanEmployees(this.token).subscribe({
      next: (res) => {
        this.employees.set(res.employees);
        this.companyName.set(res.company);
        this.mode.set('register');
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.error || 'Failed to load. QR may be expired.');
        this.loading.set(false);
      }
    });
  }

  registerDevice() {
    if (this.regPin !== this.regPinConfirm) {
      this.snackBar.open('PINs do not match', 'OK', { duration: 3000 });
      return;
    }
    this.submitting.set(true);
    this.api.registerDevice({
      employeeId: this.regEmployeeId,
      pin: this.regPin,
      deviceId: this.deviceId,
      token: this.token
    }).subscribe({
      next: () => {
        // Registration successful → verify device to load dashboard
        this.api.verifyDevice({ deviceId: this.deviceId, token: this.token }).subscribe({
          next: (res) => {
            this.setDashboard(res);
            this.submitting.set(false);
            this.snackBar.open('Device registered successfully!', 'OK', { duration: 3000 });
          },
          error: () => {
            this.submitting.set(false);
            this.errorMsg.set('Registration succeeded but verification failed. Try again.');
          }
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.snackBar.open(err?.error?.error || 'Registration failed', 'OK', { duration: 5000 });
      }
    });
  }

  setDashboard(res: any) {
    this.empName.set(res.employee.name);
    this.empRole.set(res.employee.role);
    this.empId.set(res.employee.id);
    this.initials.set(res.employee.name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase());
    this.lastScanType.set(res.lastScanType || '');
    this.allowedActions.set(res.allowedActions || ['IN']);
    this.todayScans.set(res.todayScans || []);
    this.lunchMinutes.set(res.lunchMinutes || 0);
    this.companyName.set('');
    this.mode.set('dashboard');

    // Random but deterministic avatar color
    const colors = ['#185FA5', '#2E7D32', '#6A1B9A', '#854F0B', '#0e7490', '#be123c'];
    const hash = res.employee.name.charCodeAt(0) + res.employee.name.charCodeAt(1);
    this.avatarColor = colors[hash % colors.length];
  }

  scan(type: string) {
    this.submitting.set(true);
    this.api.recordScan({
      employeeId: this.empId(),
      type,
      token: this.token,
      lat: this.coords.lat,
      lon: this.coords.lon,
      deviceId: this.deviceId
    }).subscribe({
      next: (res) => {
        this.lastScanTime.set(new Date(res.scanTime));
        this.lunchMinutes.set(res.lunchMinutes || 0);
        this.allowedActions.set(res.allowedActions || ['IN']);
        this.lastScanType.set(type);

        // Add to timeline
        this.todayScans.update(scans => [...scans, { type, time: res.scanTime }]);

        this.successMsg.set(this.scanLabel(type) + ' recorded!');
        this.submitting.set(false);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || 'Failed to record', 'OK', { duration: 5000 });
        this.submitting.set(false);
      }
    });
  }

  scanLabel(type: string): string {
    const labels: Record<string, string> = {
      'IN': 'Check In',
      'OUT': 'Check Out',
      'LUNCH_START': 'Lunch Started',
      'LUNCH_END': 'Lunch Ended'
    };
    return labels[type] || type;
  }

  statusClass(): string {
    const t = this.lastScanType();
    if (t === 'IN' || t === 'LUNCH_END') return 'status-in';
    if (t === 'OUT') return 'status-out';
    if (t === 'LUNCH_START') return 'status-lunch';
    return 'status-none';
  }

  statusLabel(): string {
    const t = this.lastScanType();
    if (t === 'IN' || t === 'LUNCH_END') return '✅ Checked In';
    if (t === 'OUT') return '🏠 Checked Out';
    if (t === 'LUNCH_START') return '🍽 On Lunch Break';
    return 'Not checked in today';
  }

  clearSuccess() {
    this.successMsg.set('');
  }

  resetDevice() {
    localStorage.removeItem('paylite_device_id');
    this.deviceId = this.getOrCreateDeviceId();
    this.mode.set('register');
    this.regEmployeeId = '';
    this.regPin = '';
    this.regPinConfirm = '';
    this.init();
  }

  requestLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { this.coords = { lat: pos.coords.latitude, lon: pos.coords.longitude }; },
        () => { this.gpsEnabled.set(false); }
      );
    }
  }

  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem('paylite_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('paylite_device_id', id);
    }
    return id;
  }
}
