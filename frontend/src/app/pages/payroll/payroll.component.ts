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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { ApiService } from '../../shared/services/api.service';

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InrPipe,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatSelectModule, MatChipsModule, MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Payroll — {{ monthName }} {{ year() }}</h1>
        <p class="page-subtitle">Review, process, and export payroll</p>
      </div>
      <div class="header-actions">
        <mat-form-field appearance="outline" class="month-select">
          <mat-label>Month</mat-label>
          <mat-select [(ngModel)]="selectedMonth" (ngModelChange)="loadPayroll()">
            @for (m of monthOptions; track m.value) {
              <mat-option [value]="m.value">{{ m.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <button mat-raised-button class="export-btn" (click)="exportExcel()" [disabled]="payrollStatus() !== 'processed'" id="export-excel-btn">
          <mat-icon>download</mat-icon> Export Excel
        </button>
        <button mat-raised-button color="primary" (click)="runPayroll()" [disabled]="running()" class="run-btn" id="run-payroll-btn">
          <mat-icon>play_arrow</mat-icon>
          @if (running()) { Processing... } @else { Run All Payroll }
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <mat-card class="summary-card total">
        <div class="card-icon"><mat-icon>account_balance_wallet</mat-icon></div>
        <div class="card-info">
          <span class="card-label">Total Payout</span>
          <span class="card-value">{{ totalPayout() | inr }}</span>
        </div>
      </mat-card>
      <mat-card class="summary-card processed">
        <div class="card-icon"><mat-icon>check_circle</mat-icon></div>
        <div class="card-info">
          <span class="card-label">Processed</span>
          <span class="card-value">{{ processedCount() }}</span>
        </div>
      </mat-card>
      <mat-card class="summary-card pending">
        <div class="card-icon"><mat-icon>schedule</mat-icon></div>
        <div class="card-info">
          <span class="card-label">Status</span>
          <span class="card-value status-text" [class]="payrollStatus()">{{ payrollStatus() | uppercase }}</span>
        </div>
      </mat-card>
      <mat-card class="summary-card flagged">
        <div class="card-icon"><mat-icon>warning</mat-icon></div>
        <div class="card-info">
          <span class="card-label">Flagged</span>
          <span class="card-value">{{ flaggedCount() }}</span>
        </div>
      </mat-card>
    </div>

    @if (loading()) {
      <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
    } @else {
      <mat-card class="table-card">
        <div class="table-wrapper">
          <table class="payroll-table">
            <thead>
              <tr>
                <th class="th-emp">Employee</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>OT Pay</th>
                <th>Bonus</th>
                <th>Gross</th>
                <th>PF</th>
                <th>ESI</th>
                <th>Unpaid Ded.</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (ps of payslips(); track ps.employee?.id || $index) {
                <tr class="data-row" (click)="toggleExpand(ps)" [class.expanded-row]="isExpanded(ps)">
                  <td>
                    <div class="emp-cell">
                      <div class="avatar" [style.background]="getColor(ps.employee?.name)">{{ ps.employee?.name?.[0] }}</div>
                      <div>
                        <div class="emp-name">{{ ps.employee?.name }}</div>
                        <div class="emp-role">{{ ps.employee?.role }}</div>
                      </div>
                      <mat-icon class="expand-icon">{{ isExpanded(ps) ? 'expand_less' : 'expand_more' }}</mat-icon>
                    </div>
                  </td>
                  <td>{{ ps.breakdown?.basicSalary | inr }}</td>
                  <td>{{ ps.breakdown?.hra | inr }}</td>
                  <td>{{ ps.breakdown?.overtimePay | inr }}</td>
                  <td>{{ ps.breakdown?.festivalBonus | inr }}</td>
                  <td class="gross-cell">{{ ps.breakdown?.grossPay | inr }}</td>
                  <td class="deduction">{{ ps.breakdown?.pfDeduction | inr }}</td>
                  <td class="deduction">{{ ps.breakdown?.esiDeduction | inr }}</td>
                  <td class="deduction">{{ ps.breakdown?.unpaidLeaveDeduction | inr }}</td>
                  <td class="net-cell">{{ ps.breakdown?.netPay | inr }}</td>
                  <td>
                    @if (ps.breakdown?.warnings?.length > 0) {
                      <span class="badge flagged-badge" [matTooltip]="ps.breakdown.warnings.join(', ')">Flagged</span>
                    } @else {
                      <span class="badge ok-badge">{{ payrollStatus() === 'processed' ? 'Processed' : 'Draft' }}</span>
                    }
                  </td>
                  <td>
                    @if (ps.id && payrollStatus() === 'processed') {
                      <button mat-icon-button matTooltip="Download PDF" (click)="downloadPDF(ps, $event)">
                        <mat-icon>picture_as_pdf</mat-icon>
                      </button>
                    }
                  </td>
                </tr>
                @if (isExpanded(ps)) {
                  <tr class="detail-row">
                    <td colspan="12">
                      <div class="detail-grid">
                        <div class="detail-section earnings">
                          <h4>Earnings</h4>
                          <div class="detail-line"><span>Basic Salary</span><span>{{ ps.breakdown?.basicSalary | inr }}</span></div>
                          <div class="detail-line"><span>HRA</span><span>{{ ps.breakdown?.hra | inr }}</span></div>
                          <div class="detail-line"><span>Overtime Pay</span><span>{{ ps.breakdown?.overtimePay | inr }}</span></div>
                          <div class="detail-line"><span>Festival Bonus</span><span>{{ ps.breakdown?.festivalBonus | inr }}</span></div>
                          <div class="detail-line total"><span>Gross Pay</span><span>{{ ps.breakdown?.grossPay | inr }}</span></div>
                        </div>
                        <div class="detail-section deductions">
                          <h4>Deductions</h4>
                          <div class="detail-line"><span>Provident Fund (PF)</span><span>{{ ps.breakdown?.pfDeduction | inr }}</span></div>
                          <div class="detail-line"><span>ESI</span><span>{{ ps.breakdown?.esiDeduction | inr }}</span></div>
                          <div class="detail-line"><span>Unpaid Leave Ded.</span><span>{{ ps.breakdown?.unpaidLeaveDeduction | inr }}</span></div>
                          <div class="detail-line total"><span>Total Deductions</span><span>{{ (ps.breakdown?.pfDeduction + ps.breakdown?.esiDeduction + ps.breakdown?.unpaidLeaveDeduction) | inr }}</span></div>
                        </div>
                        <div class="detail-section net">
                          <div class="net-pay-box">
                            <span class="net-label">NET PAY</span>
                            <span class="net-value">{{ ps.breakdown?.netPay | inr }}</span>
                          </div>
                          @if (ps.breakdown?.warnings?.length > 0) {
                            <div class="warnings-box">
                              @for (w of ps.breakdown.warnings; track w) {
                                <div class="warning-line"><mat-icon>warning</mat-icon> {{ w }}</div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </mat-card>
    }
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:16px; }
    .page-title { font-size:1.75rem; font-weight:700; color:#1e293b; margin:0; }
    .page-subtitle { color:#64748b; margin:4px 0 0; }
    .header-actions { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
    .month-select { width:150px; }
    .run-btn, .export-btn { height:44px; border-radius:12px !important; color: white !important; }
    .export-btn { background:#f1f5f9 !important; color:#334155 !important; }

    .summary-cards { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:24px; }
    .summary-card { border-radius:16px !important; padding:20px !important; display:flex; align-items:center; gap:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06) !important; transition:transform 0.2s; }
    .summary-card:hover { transform:translateY(-2px); }
    .card-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .total .card-icon { background:#EBF5FF; color:#185FA5; }
    .processed .card-icon { background:#E8F5E9; color:#2E7D32; }
    .pending .card-icon { background:#FFF8E1; color:#F9A825; }
    .flagged .card-icon { background:#FEF2F2; color:#D32F2F; }
    .card-label { font-size:0.8rem; color:#64748b; display:block; }
    .card-value { font-size:1.35rem; font-weight:700; color:#1e293b; }
    .status-text.processed { color:#2E7D32; }
    .status-text.draft { color:#F9A825; }

    .table-card { border-radius:16px !important; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08) !important; }
    .table-wrapper { overflow-x:auto; }
    .payroll-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
    .payroll-table th { background:#f8fafc; padding:12px 14px; text-align:left; font-weight:600; color:#64748b; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #e2e8f0; white-space:nowrap; }
    .payroll-table td { padding:14px; border-bottom:1px solid #f1f5f9; }
    .data-row { cursor:pointer; transition:background 0.15s; }
    .data-row:hover { background:#f8fafc; }
    .expanded-row { background:#f0f7ff !important; }
    .th-emp { min-width:200px; }
    .emp-cell { display:flex; align-items:center; gap:12px; }
    .avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; flex-shrink:0; }
    .emp-name { font-weight:600; }
    .emp-role { font-size:0.78rem; color:#64748b; }
    .expand-icon { color:#94a3b8; margin-left:auto; }
    .gross-cell { font-weight:600; color:#1e293b; }
    .deduction { color:#D32F2F; }
    .net-cell { font-weight:700; color:#185FA5; font-size:0.95rem; }
    .badge { padding:4px 10px; border-radius:20px; font-size:0.7rem; font-weight:600; text-transform:uppercase; }
    .ok-badge { background:#E8F5E9; color:#2E7D32; }
    .flagged-badge { background:#FFF8E1; color:#E65100; cursor:help; }

    .detail-row td { padding:0 !important; background:#f8fafc; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; padding:20px 24px; }
    .detail-section h4 { margin:0 0 12px; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.5px; }
    .earnings h4 { color:#185FA5; }
    .deductions h4 { color:#D32F2F; }
    .detail-line { display:flex; justify-content:space-between; padding:6px 0; font-size:0.85rem; border-bottom:1px solid #e2e8f0; }
    .detail-line.total { font-weight:700; border-top:2px solid #cbd5e1; border-bottom:none; margin-top:4px; padding-top:10px; }
    .net-pay-box { background:linear-gradient(135deg, #185FA5, #1a73c7); color:white; border-radius:12px; padding:20px; text-align:center; }
    .net-label { display:block; font-size:0.8rem; opacity:0.8; margin-bottom:4px; }
    .net-value { display:block; font-size:1.5rem; font-weight:800; }
    .warnings-box { margin-top:12px; padding:12px; background:#FFF8E1; border-radius:8px; }
    .warning-line { display:flex; align-items:center; gap:6px; font-size:0.8rem; color:#E65100; margin-bottom:4px; }
    .warning-line mat-icon { font-size:16px; width:16px; height:16px; }
    .loading-state { display:flex; justify-content:center; padding:60px; }

    @media (max-width: 768px) {
      .summary-cards { grid-template-columns:repeat(2, 1fr); }
      .detail-grid { grid-template-columns:1fr; }
    }
  `],
})
export class PayrollComponent implements OnInit {
  payslips = signal<any[]>([]);
  loading = signal(true);
  running = signal(false);
  payrollStatus = signal<string>('draft');
  totalPayout = signal(0);
  processedCount = signal(0);
  flaggedCount = signal(0);
  selectedMonth = 4;
  monthName = 'April';
  year = signal(2026);
  expandedIds = new Set<string>();
  monthOptions = Array.from({length:12}, (_,i) => ({ value:i+1, label:MONTHS[i+1] }));

  constructor(private api: ApiService, private route: ActivatedRoute, private snackBar: MatSnackBar) {}

  ngOnInit() {
    const m = Number(this.route.snapshot.paramMap.get('month')) || 4;
    const y = Number(this.route.snapshot.paramMap.get('year')) || 2026;
    this.selectedMonth = m;
    this.year.set(y);
    this.loadPayroll();
  }

  loadPayroll() {
    this.monthName = MONTHS[this.selectedMonth];
    this.loading.set(true);
    this.api.getPayroll(this.selectedMonth, this.year()).subscribe({
      next: (data) => {
        this.payslips.set(data.payslips || []);
        this.payrollStatus.set(data.status || 'draft');
        this.totalPayout.set(data.totalPayout || 0);
        this.processedCount.set(data.payslips?.length || 0);
        this.flaggedCount.set(
          (data.payslips || []).filter((p: any) => p.breakdown?.warnings?.length > 0).length
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  runPayroll() {
    this.running.set(true);
    this.api.runPayroll(this.selectedMonth, this.year()).subscribe({
      next: () => {
        this.snackBar.open('Payroll processed successfully!', 'OK', { duration: 3000 });
        this.running.set(false);
        this.loadPayroll();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || 'Payroll failed', 'OK', { duration: 3000 });
        this.running.set(false);
      },
    });
  }

  toggleExpand(ps: any) {
    const key = ps.employee?.id || ps.id;
    if (this.expandedIds.has(key)) this.expandedIds.delete(key);
    else this.expandedIds.add(key);
  }

  isExpanded(ps: any): boolean {
    return this.expandedIds.has(ps.employee?.id || ps.id);
  }

  getColor(name: string): string {
    if (!name) return '#185FA5';
    const colors = ['#185FA5','#2E7D32','#E65100','#6A1B9A','#00838F','#AD1457'];
    let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  }

  downloadPDF(ps: any, event: Event) {
    event.stopPropagation();
    this.api.downloadPayslipPDF(ps.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${ps.employee?.name?.replace(/\s+/g, '_')}-${this.selectedMonth}-${this.year()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to download PDF', 'OK', { duration: 3000 }),
    });
  }

  exportExcel() {
    this.api.downloadPayrollExcel(this.selectedMonth, this.year()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payroll-${this.selectedMonth}-${this.year()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Failed to export Excel', 'OK', { duration: 3000 }),
    });
  }
}
