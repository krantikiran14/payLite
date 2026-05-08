import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  // ── Company / Auth Profile ──
  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/profile`, { headers: this.getHeaders() });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/profile`, data, { headers: this.getHeaders() });
  }

  // ── Employees ──
  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees`, { headers: this.getHeaders() });
  }

  createEmployee(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/employees`, data, { headers: this.getHeaders() });
  }

  updateEmployee(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/employees/${id}`, data, { headers: this.getHeaders() });
  }

  // ── Attendance ──
  getAttendance(month: number, year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/attendance/${month}/${year}`, { headers: this.getHeaders() });
  }

  saveAttendance(records: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance`, records, { headers: this.getHeaders() });
  }

  // ── Bonuses ──
  getBonuses(month: number, year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bonuses/${month}/${year}`, { headers: this.getHeaders() });
  }

  createBonus(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bonuses`, data, { headers: this.getHeaders() });
  }

  deleteBonus(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/bonuses/${id}`, { headers: this.getHeaders() });
  }

  // ── Payroll ──
  runPayroll(month: number, year: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payroll/run`, { month, year }, { headers: this.getHeaders() });
  }

  getPayroll(month: number, year: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/payroll/${month}/${year}`, { headers: this.getHeaders() });
  }

  downloadPayslipPDF(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/payslip/${id}/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  downloadPayrollExcel(month: number, year: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/payroll/export/${month}/${year}`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }
  // ── Scans (QR Attendance) ──
  getScanToken(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/scans/token`, { headers: this.getHeaders() });
  }

  getScanEmployees(token: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/scans/employees`, { params: { token } });
  }

  registerDevice(data: { employeeId: string; pin: string; deviceId: string; token: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/scans/register-device`, data);
  }

  verifyDevice(data: { deviceId: string; token: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/scans/verify-device`, data);
  }

  recordScan(data: { employeeId: string; type: string; token: string; lat?: number; lon?: number; deviceId?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/scans`, data);
  }

  // ── Self-Profile (device-auth) ──
  getMyProfile(deviceId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/scans/my-profile`, {
      headers: new HttpHeaders({ 'x-device-id': deviceId })
    });
  }

  updateMyProfile(deviceId: string, data: { phone?: string; emergencyContact?: string; address?: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/scans/my-profile`, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', 'x-device-id': deviceId })
    });
  }

  // ── Admin: Reset PIN ──
  resetEmployeePin(employeeId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/scans/reset-pin/${employeeId}`, { headers: this.getHeaders() });
  }
}
