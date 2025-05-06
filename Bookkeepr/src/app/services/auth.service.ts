import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth'; // Update with your actual FastAPI endpoint

  constructor(private http: HttpClient) {}

  //Login function (sends username & password to FastAPI)
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password });
  }

  //  Logout function (clears session/token)
  logout(): void {
    localStorage.removeItem('access_token'); // Clears stored token
  }

  // Get user role (useful for checking if admin)
  getUserRole(): string {
    return localStorage.getItem('user_role') || 'user'; // Defaults to 'user'
  }

  // Check if user is authenticated (valid token)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}