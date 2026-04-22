import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InrPipe } from '../../shared/pipes/inr.pipe';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule, FormsModule, InrPipe,
    MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSlideToggleModule, MatChipsModule, MatCardModule, MatProgressSpinnerModule,
    MatSelectModule, MatSnackBarModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Employees & Settings</h1>
        <p class="page-subtitle">Manage your team and company office location</p>
      </div>
      <div class="header-actions">
        <button mat-stroked-button (click)="toggleSettings()" class="settings-btn">
          <mat-icon>{{ showSettings() ? 'expand_less' : 'settings' }}</mat-icon> 
          {{ showSettings() ? 'Hide Settings' : 'Company Settings' }}
        </button>
        <button mat-raised-button color="primary" (click)="openDrawer()" class="add-btn" id="add-employee-btn">
          <mat-icon>person_add</mat-icon> Add Employee
        </button>
      </div>
    </div>

    @if (showSettings()) {
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>Office Geofencing</mat-card-title>
          <mat-card-subtitle>Set your office location to restrict attendance scans to the premises</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="settings-grid">
            <mat-form-field appearance="outline">
              <mat-label>Company Name</mat-label>
              <input matInput [(ngModel)]="profile.companyName">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Office Latitude</mat-label>
              <input matInput type="number" [(ngModel)]="profile.officeLat">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Office Longitude</mat-label>
              <input matInput type="number" [(ngModel)]="profile.officeLon">
            </mat-form-field>
            <div class="settings-actions">
              <button mat-stroked-button color="accent" (click)="detectLocation()" [disabled]="detecting()">
                <mat-icon>my_location</mat-icon> Detect My Location
              </button>
              <button mat-flat-button color="primary" (click)="saveSettings()" [disabled]="savingSettings()">
                <mat-icon>save</mat-icon> Save Settings
              </button>
            </div>
          </div>
          <p class="settings-hint" *ngIf="profile.officeLat">
            <mat-icon>info</mat-icon> Geofencing is active. Employees must be within 200m of these coordinates.
          </p>
        </mat-card-content>
      </mat-card>
    }

    @if (loading()) {
      <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
    } @else {
      <mat-card class="table-card">
        <div class="search-bar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <mat-label>Search employees...</mat-label>
            <input matInput [(ngModel)]="searchQuery" (ngModelChange)="filterEmployees()">
          </mat-form-field>
        </div>

        <div class="table-wrapper">
          <table mat-table [dataSource]="filteredEmployees()" class="emp-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let emp">
                <div class="emp-name">
                  <div class="avatar" [style.background]="getAvatarColor(emp.name)">{{ emp.name[0] }}</div>
                  <span>{{ emp.name }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let emp">{{ emp.role }}</td>
            </ng-container>

            <ng-container matColumnDef="basicSalary">
              <th mat-header-cell *matHeaderCellDef>Basic Salary</th>
              <td mat-cell *matCellDef="let emp">{{ emp.basicSalary | inr }}</td>
            </ng-container>

            <ng-container matColumnDef="pf">
              <th mat-header-cell *matHeaderCellDef>PF</th>
              <td mat-cell *matCellDef="let emp">
                <mat-icon [class]="emp.pfEnabled ? 'toggle-on' : 'toggle-off'">
                  {{ emp.pfEnabled ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="esi">
              <th mat-header-cell *matHeaderCellDef>ESI</th>
              <td mat-cell *matCellDef="let emp">
                <mat-icon [class]="emp.esiEnabled ? 'toggle-on' : 'toggle-off'">
                  {{ emp.esiEnabled ? 'check_circle' : 'cancel' }}
                </mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let emp">
                <span class="status-badge" [class]="emp.status">{{ emp.status }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let emp">
                <button mat-icon-button (click)="editEmployee(emp)"><mat-icon>edit</mat-icon></button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
          </table>
        </div>
      </mat-card>
    }

    <!-- Drawer Overlay -->
    @if (drawerOpen()) {
      <div class="drawer-overlay" (click)="closeDrawer()"></div>
      <div class="drawer">
        <div class="drawer-header">
          <h2>{{ editingEmployee ? 'Edit' : 'Add' }} Employee</h2>
          <button mat-icon-button (click)="closeDrawer()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="drawer-body">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput [(ngModel)]="form.name" id="emp-name">
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role / Designation</mat-label>
            <input matInput [(ngModel)]="form.role" id="emp-role">
          </mat-form-field>
          <div class="row-2">
            <mat-form-field appearance="outline">
              <mat-label>Basic Salary (₹)</mat-label>
              <input matInput type="number" [(ngModel)]="form.basicSalary" id="emp-salary">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>HRA (₹)</mat-label>
              <input matInput type="number" [(ngModel)]="form.hra" id="emp-hra">
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Joining Date</mat-label>
            <input matInput type="date" [(ngModel)]="form.joiningDate" id="emp-joining">
          </mat-form-field>
          <div class="toggle-row">
            <mat-slide-toggle [(ngModel)]="form.pfEnabled" id="emp-pf">PF Enabled</mat-slide-toggle>
            <mat-slide-toggle [(ngModel)]="form.esiEnabled" id="emp-esi">ESI Enabled</mat-slide-toggle>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="form.status" id="emp-status">
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="drawer-footer">
          <button mat-button (click)="closeDrawer()">Cancel</button>
          <button mat-raised-button color="primary" (click)="saveEmployee()" [disabled]="saving()" id="save-employee-btn">
            @if (saving()) { Saving... } @else { Save }
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:16px; }
    .header-actions { display: flex; gap: 12px; }
    .page-title { font-size:1.75rem; font-weight:700; color:#1e293b; margin:0; }
    .page-subtitle { color:#64748b; margin:4px 0 0; }
    .settings-btn { border-radius: 12px !important; height: 44px; }
    .add-btn { height:44px; border-radius:12px !important; color: white !important; }
    
    .settings-card { border-radius: 16px !important; margin-bottom: 24px; border: 1px solid #e2e8f0; box-shadow: none !important; }
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; align-items: center; margin-top: 16px; }
    .settings-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .settings-actions button { border-radius: 10px !important; height: 44px; }
    .settings-hint { margin-top: 16px; display: flex; align-items: center; gap: 8px; color: #15803d; font-size: 0.85rem; font-weight: 500; }
    .settings-hint mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .table-card { border-radius:16px !important; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08) !important; }
    .search-bar { padding:16px 16px 0; }
    .search-field { width:100%; }
    .table-wrapper { overflow-x:auto; }
    .emp-table { width:100%; }
    .emp-name { display:flex; align-items:center; gap:12px; }
    .avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:700; font-size:0.9rem; }
    .toggle-on { color:#2E7D32; }
    .toggle-off { color:#ccc; }
    .status-badge { padding:4px 12px; border-radius:20px; font-size:0.75rem; font-weight:600; text-transform:uppercase; }
    .status-badge.active { background:#e8f5e9; color:#2E7D32; }
    .status-badge.inactive { background:#fef2f2; color:#dc2626; }
    .table-row:hover { background:#f8fafc; }
    .loading-state { display:flex; justify-content:center; padding:60px; }
    .displayedColumns { }
    .drawer-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); z-index:200; }
    .drawer { position:fixed; top:0; right:0; bottom:0; width:420px; max-width:90vw; background:white; z-index:201; display:flex; flex-direction:column; box-shadow:-4px 0 20px rgba(0,0,0,0.15); }
    .drawer-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #e2e8f0; }
    .drawer-header h2 { margin:0; font-size:1.25rem; font-weight:700; }
    .drawer-body { flex:1; overflow-y:auto; padding:24px; display:flex; flex-direction:column; gap:4px; }
    .drawer-footer { padding:16px 24px; border-top:1px solid #e2e8f0; display:flex; gap:12px; justify-content:flex-end; }
    .full-width { width:100%; }
    .row-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .toggle-row { display:flex; gap:24px; margin:8px 0 16px; }
  `],
})
export class EmployeesComponent implements OnInit {
  employees = signal<any[]>([]);
  filteredEmployees = signal<any[]>([]);
  loading = signal(true);
  showSettings = signal(false);
  detecting = signal(false);
  savingSettings = signal(false);
  profile: any = {};
  saving = signal(false);
  drawerOpen = signal(false);
  searchQuery = '';
  editingEmployee: any = null;
  displayedColumns = ['name', 'role', 'basicSalary', 'pf', 'esi', 'status', 'actions'];

  form = { name: '', role: '', basicSalary: 0, hra: 0, joiningDate: '', pfEnabled: true, esiEnabled: true, status: 'active' as string };

  constructor(private api: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadData();
    this.loadProfile();
  }

  loadData() {
    this.loading.set(true);
    this.api.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.filterEmployees();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadProfile() {
    this.api.getProfile().subscribe(res => this.profile = res);
  }

  toggleSettings() {
    this.showSettings.update(v => !v);
  }

  detectLocation() {
    this.detecting.set(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.profile.officeLat = pos.coords.latitude;
          this.profile.officeLon = pos.coords.longitude;
          this.detecting.set(false);
          this.snackBar.open('Location detected!', 'OK', { duration: 2000 });
        },
        () => {
          this.detecting.set(false);
          this.snackBar.open('Failed to detect location. Please enter manually.', 'OK', { duration: 3000 });
        }
      );
    }
  }

  saveSettings() {
    this.savingSettings.set(true);
    this.api.updateProfile(this.profile).subscribe({
      next: () => {
        this.savingSettings.set(false);
        this.snackBar.open('Settings saved successfully!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.savingSettings.set(false);
        this.snackBar.open('Failed to save settings.', 'OK', { duration: 3000 });
      }
    });
  }

  filterEmployees() {
    const q = this.searchQuery.toLowerCase();
    this.filteredEmployees.set(
      this.employees().filter(e => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q))
    );
  }

  getAvatarColor(name: string): string {
    const colors = ['#185FA5','#2E7D32','#E65100','#6A1B9A','#00838F','#AD1457'];
    let hash = 0;
    for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  openDrawer() {
    this.editingEmployee = null;
    this.form = { name:'', role:'', basicSalary:0, hra:0, joiningDate:'', pfEnabled:true, esiEnabled:true, status:'active' };
    this.drawerOpen.set(true);
  }

  editEmployee(emp: any) {
    this.editingEmployee = emp;
    this.form = {
      name: emp.name, role: emp.role,
      basicSalary: Number(emp.basicSalary), hra: Number(emp.hra),
      joiningDate: emp.joiningDate?.split('T')[0] || '',
      pfEnabled: emp.pfEnabled, esiEnabled: emp.esiEnabled, status: emp.status,
    };
    this.drawerOpen.set(true);
  }

  closeDrawer() { this.drawerOpen.set(false); }

  saveEmployee() {
    this.saving.set(true);
    const obs = this.editingEmployee
      ? this.api.updateEmployee(this.editingEmployee.id, this.form)
      : this.api.createEmployee(this.form);

    obs.subscribe({
      next: () => {
        this.snackBar.open(this.editingEmployee ? 'Employee updated' : 'Employee added', 'OK', { duration: 3000 });
        this.closeDrawer();
        this.loadData();
        this.saving.set(false);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || 'Failed to save', 'OK', { duration: 3000 });
        this.saving.set(false);
      },
    });
  }
}
