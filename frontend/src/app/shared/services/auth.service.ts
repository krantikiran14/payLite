import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  companyName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'paylite_token';
  currentUser = signal<AuthUser | null>(null);
  isAuthenticated = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem('paylite_user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  async login(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<{ token: string; user: AuthUser }>('/api/auth/login', { email, password })
    );
    localStorage.setItem(this.TOKEN_KEY, result.token);
    localStorage.setItem('paylite_user', JSON.stringify(result.user));
    this.currentUser.set(result.user);
    this.isAuthenticated.set(true);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('paylite_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
