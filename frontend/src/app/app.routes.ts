import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'employees', loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent), canActivate: [authGuard] },
  { path: 'attendance/:month/:year', loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent), canActivate: [authGuard] },
  { path: 'payroll/:month/:year', loadComponent: () => import('./pages/payroll/payroll.component').then(m => m.PayrollComponent), canActivate: [authGuard] },
  { path: 'check-in', loadComponent: () => import('./pages/check-in/check-in.component').then(m => m.CheckInComponent) },
  { path: '**', redirectTo: '' },
];
