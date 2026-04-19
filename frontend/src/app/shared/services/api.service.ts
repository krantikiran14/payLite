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
}
