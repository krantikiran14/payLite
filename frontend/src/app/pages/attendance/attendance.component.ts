import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { ApiService } from '../../shared/services/api.service';

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InrPipe,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatChipsModule, MatProgressSpinnerModule,
    MatSelectModule, MatSnackBarModule, MatDialogModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Attendance — {{ monthName }} {{ year() }}</h1>
        <p class="page-subtitle">Record working days, leave, and overtime for all employees</p>
      </div>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="month-select">
          <mat-label>Month</mat-label>
          <mat-select [(ngModel)]="selectedMonth" (ngModelChange)="loadData()">
            @for (m of monthOptions; track m.value) {
              <mat-option [value]="m.value">{{ m.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <button mat-stroked-button (click)="openQR()" class="qr-btn">
          <mat-icon>qr_code_2</mat-icon> Show QR
        </button>
        <button mat-raised-button color="primary" (click)="saveAll()" [disabled]="saving()" class="save-btn" id="save-attendance-btn">
          <mat-icon>save</mat-icon>
          @if (saving()) { Saving... } @else { Save All }
        </button>
      </div>
    </div>

    <!-- QR Dialog Overlay -->
    @if (qrOpen()) {
      <div class="dialog-overlay" (click)="closeQR()"></div>
      <div class="qr-dialog">
        <div class="qr-header">
          <h3>Self-Attendance QR</h3>
          <button mat-icon-button (click)="closeQR()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="qr-body">
          <p class="qr-hint">Scan this QR to mark check-in/out. Valid for today only.</p>
          <div class="qr-image-wrapper">
            <img [src]="qrUrl()" alt="Attendance QR Code" *ngIf="qrUrl()">
            <mat-spinner diameter="40" *ngIf="!qrUrl()"></mat-spinner>
          </div>
          <p class="qr-date">{{ today | date:'fullDate' }}</p>
          <div class="qr-security">
            <mat-icon>verified_user</mat-icon> Secure token active
          </div>
        </div>
        <div class="qr-footer">
          <button mat-flat-button color="primary" (click)="copyLink()">Copy Link</button>
        </div>
      </div>
    }

    @if (loading()) {
      <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
    } @else {
      <mat-card class="table-card">
        <div class="table-wrapper">
          <table mat-table [dataSource]="attendanceRows()" class="att-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let row">
                <div class="emp-cell">
                  <div class="avatar" [style.background]="getColor(row.employeeName)">{{ row.employeeName[0] }}</div>
                  <div>
                    <div class="emp-name-text">{{ row.employeeName }}</div>
                    <div class="emp-role-text">{{ row.employeeRole }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="presentDays">
              <th mat-header-cell *matHeaderCellDef>Present Days</th>
              <td mat-cell *matCellDef="let row">
                <input type="number" class="inline-input" [(ngModel)]="row.presentDays" min="0" max="31">
              </td>
            </ng-container>

            <ng-container matColumnDef="paidLeaveDays">
              <th mat-header-cell *matHeaderCellDef>Paid Leave</th>
              <td mat-cell *matCellDef="let row">
                <input type="number" class="inline-input" [(ngModel)]="row.paidLeaveDays" min="0" max="31">
              </td>
            </ng-container>

            <ng-container matColumnDef="unpaidLeaveDays">
              <th mat-header-cell *matHeaderCellDef>Unpaid Leave</th>
              <td mat-cell *matCellDef="let row">
                <input type="number" class="inline-input warning-input" [(ngModel)]="row.unpaidLeaveDays" min="0" max="31"
                  [class.has-warning]="row.unpaidLeaveDays > 1">
              </td>
            </ng-container>

            <ng-container matColumnDef="overtimeHours">
              <th mat-header-cell *matHeaderCellDef>OT Hours</th>
              <td mat-cell *matCellDef="let row">
                <input type="number" class="inline-input" [(ngModel)]="row.overtimeHours" min="0" step="0.5">
              </td>
            </ng-container>

            <ng-container matColumnDef="bonus">
              <th mat-header-cell *matHeaderCellDef>Bonuses</th>
              <td mat-cell *matCellDef="let row">
                <div class="bonus-cell">
                  @for (b of getBonuses(row.employeeId); track b.id) {
                    <span class="bonus-chip">
                      {{ b.label }}: {{ b.amount | inr }}
                      <mat-icon class="chip-delete" (click)="deleteBonus(b.id)">close</mat-icon>
                    </span>
                  }
                  <button mat-stroked-button class="add-bonus-btn" (click)="openBonusForm(row)">
                    <mat-icon>add</mat-icon> Bonus
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </mat-card>
    }

    <!-- Bonus Mini-Dialog -->
    @if (bonusFormOpen()) {
      <div class="dialog-overlay" (click)="closeBonusForm()"></div>
      <div class="bonus-dialog">
        <h3>Add Bonus for {{ bonusTarget?.employeeName }}</h3>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Label (e.g. Festival Bonus)</mat-label>
          <input matInput [(ngModel)]="bonusLabel">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount (₹)</mat-label>
          <input matInput type="number" [(ngModel)]="bonusAmount">
        </mat-form-field>
        <div class="dialog-actions">
          <button mat-button (click)="closeBonusForm()">Cancel</button>
          <button mat-raised-button color="primary" (click)="saveBonus()">Add Bonus</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:16px; }
    .page-title { font-size:1.75rem; font-weight:700; color:#1e293b; margin:0; }
    .page-subtitle { color:#64748b; margin:4px 0 0; }
    .header-actions { display:flex; gap:12px; align-items:center; }
    .month-select { width:160px; }
    .save-btn { height:44px; border-radius:12px !important; color: white !important; }
    .table-card { border-radius:16px !important; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08) !important; }
    .table-wrapper { overflow-x:auto; }
    .att-table { width:100%; }
    .emp-cell { display:flex; align-items:center; gap:12px; }
    .avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; flex-shrink:0; }
    .emp-name-text { font-weight:600; }
    .emp-role-text { font-size:0.8rem; color:#64748b; }
    .inline-input {
      width:72px; padding:8px 10px; border:1px solid #e2e8f0; border-radius:8px;
      font-size:0.9rem; text-align:center; outline:none; transition:border-color 0.2s;
    }
    .inline-input:focus { border-color:#185FA5; box-shadow:0 0 0 3px rgba(24,95,165,0.1); }
    .inline-input.has-warning { border-color:#F9A825; background:#FFFBEB; }
    .bonus-cell { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
    .bonus-chip {
      display:inline-flex; align-items:center; gap:4px; padding:4px 10px;
      background:#f0f7ff; border:1px solid #d0e3f7; border-radius:16px;
      font-size:0.78rem; color:#185FA5;
    }
    .chip-delete { font-size:14px !important; width:14px !important; height:14px !important; cursor:pointer; opacity:0.6; }
    .chip-delete:hover { opacity:1; }
    .add-bonus-btn { font-size:0.75rem !important; padding:2px 8px !important; min-width:auto !important; height:28px !important; }
    .loading-state { display:flex; justify-content:center; padding:60px; }
    .dialog-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); z-index:200; }
    .bonus-dialog, .qr-dialog { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:24px; border-radius:16px; z-index:201; width:380px; max-width:90vw; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .qr-dialog { width: 340px; padding: 0; overflow: hidden; }
    .qr-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
    .qr-header h3 { margin: 0; font-size: 1.1rem; }
    .qr-body { padding: 24px; text-align: center; }
    .qr-hint { font-size: 0.85rem; color: #64748b; margin-bottom: 20px; }
    .qr-image-wrapper { background: white; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; display: inline-block; margin-bottom: 16px; }
    .qr-image-wrapper img { width: 200px; height: 200px; display: block; }
    .qr-date { font-size: 0.9rem; font-weight: 600; color: #1e293b; margin: 8px 0; }
    .qr-security { display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 0.75rem; color: #2E7D32; font-weight: 700; text-transform: uppercase; }
    .qr-security mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .qr-footer { padding: 16px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: center; }
    .qr-btn { height: 44px; border-radius: 12px !important; margin-right: 8px; }
    .bonus-dialog h3 { margin:0 0 16px; }
    .dialog-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:8px; }
    .full-width { width:100%; }
    @media (max-width: 768px) { .inline-input { width:56px; padding:6px; } }
  `],
})
export class AttendanceComponent implements OnInit {
  attendanceRows = signal<any[]>([]);
  bonuses = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  bonusFormOpen = signal(false);
  bonusTarget: any = null;
  bonusLabel = '';
  bonusAmount = 0;
  selectedMonth = 4;
  monthName = 'April';
  year = signal(2026);
  today = new Date();
  qrOpen = signal(false);
  qrUrl = signal('');
  fullCheckinUrl = '';
  displayedColumns = ['name','presentDays','paidLeaveDays','unpaidLeaveDays','overtimeHours','bonus'];
  monthOptions = Array.from({length:12}, (_,i) => ({ value:i+1, label:MONTHS[i+1] }));

  constructor(private api: ApiService, private route: ActivatedRoute, private snackBar: MatSnackBar) {}

  ngOnInit() {
    const m = Number(this.route.snapshot.paramMap.get('month')) || 4;
    const y = Number(this.route.snapshot.paramMap.get('year')) || 2026;
    this.selectedMonth = m;
    this.year.set(y);
    this.loadData();
  }

  loadData() {
    this.monthName = MONTHS[this.selectedMonth];
    this.loading.set(true);
    this.api.getAttendance(this.selectedMonth, this.year()).subscribe({
      next: (data) => { this.attendanceRows.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.api.getBonuses(this.selectedMonth, this.year()).subscribe({
      next: (data) => this.bonuses.set(data),
    });
  }

  getBonuses(employeeId: string) {
    return this.bonuses().filter(b => b.employeeId === employeeId);
  }

  getColor(name: string): string {
    const colors = ['#185FA5','#2E7D32','#E65100','#6A1B9A','#00838F','#AD1457'];
    let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  }

  saveAll() {
    this.saving.set(true);
    const records = this.attendanceRows().map(r => ({
      employeeId: r.employeeId, month: this.selectedMonth, year: this.year(),
      presentDays: r.presentDays, paidLeaveDays: r.paidLeaveDays,
      unpaidLeaveDays: r.unpaidLeaveDays, overtimeHours: r.overtimeHours,
    }));
    this.api.saveAttendance(records).subscribe({
      next: () => { this.snackBar.open('Attendance saved!', 'OK', { duration: 3000 }); this.saving.set(false); },
      error: () => { this.snackBar.open('Failed to save', 'OK', { duration: 3000 }); this.saving.set(false); },
    });
  }

  openBonusForm(row: any) { this.bonusTarget = row; this.bonusLabel = ''; this.bonusAmount = 0; this.bonusFormOpen.set(true); }
  closeBonusForm() { this.bonusFormOpen.set(false); }

  saveBonus() {
    if (!this.bonusLabel || !this.bonusAmount) return;
    this.api.createBonus({
      employeeId: this.bonusTarget.employeeId, month: this.selectedMonth, year: this.year(),
      label: this.bonusLabel, amount: this.bonusAmount,
    }).subscribe({
      next: () => { this.closeBonusForm(); this.loadData(); this.snackBar.open('Bonus added', 'OK', { duration: 3000 }); },
      error: () => this.snackBar.open('Failed to add bonus', 'OK', { duration: 3000 }),
    });
  }

  deleteBonus(id: string) {
    this.api.deleteBonus(id).subscribe({
      next: () => { this.loadData(); this.snackBar.open('Bonus removed', 'OK', { duration: 2000 }); },
    });
  }

  openQR() {
    this.qrOpen.set(true);
    this.qrUrl.set('');
    this.api.getScanToken().subscribe({
      next: (res) => {
        const baseUrl = window.location.origin;
        this.fullCheckinUrl = `${baseUrl}/check-in?token=${res.token}`;
        // Generate QR code using external API
        this.qrUrl.set(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.fullCheckinUrl)}`);
      },
      error: () => {
        this.snackBar.open('Failed to generate secure token', 'OK', { duration: 3000 });
        this.closeQR();
      }
    });
  }

  closeQR() {
    this.qrOpen.set(false);
  }

  copyLink() {
    navigator.clipboard.writeText(this.fullCheckinUrl);
    this.snackBar.open('Link copied to clipboard!', 'OK', { duration: 2000 });
  }
}
