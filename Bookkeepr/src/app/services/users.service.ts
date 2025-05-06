
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { api } from './constants';

export interface LoginResult {
  username: string;
  role: string;
}

export interface UserDto {
  id: string;
  username: string;
  role: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly url = api + '/users';
  localStorageKey = 'accessToken';

  constructor(private http: HttpClient, private router: Router) {
    this.decodeAccessToken();
  }

  signUp(username: string, password: string, email: string): Observable<any> {
    return this.http.post<any>(this.url + '/signup', {
      username,
      password,
      email,
    });
  }

  signIn(
    username: string,
    password: string
  ): Observable<{ access_token: string }> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return this.http
      .post<{ access_token: string }>(this.url + '/sign-in', formData)
      .pipe(
        map((x) => {
          localStorage.setItem(this.localStorageKey, x.access_token);
          this.decodeAccessToken();
          return x;
        })
      );
  }
  private decodeAccessToken() {
    let user = this._defaultUser;
    try {
      const token = this.getToken();
      user = jwtDecode<LoginResult>(token);
    } catch (Error) {
      user = this._defaultUser;
    } finally {
      this._user.next(user);
    }
  }

  logout() {
    localStorage.removeItem(this.localStorageKey);
    this._user.next(this._defaultUser);
    this.router.navigate(['login']);
  }

  private readonly _defaultUser: LoginResult = { username: '', role: '' };
  private _user = new BehaviorSubject<LoginResult>(this._defaultUser);
  user$: Observable<LoginResult> = this._user.asObservable();

  getToken(): string {
    return localStorage.getItem(this.localStorageKey) || '';
  }
  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.url);
  }

  updateUserRole(id: string): Observable<any> {
    return this.http.post<any>(this.url + '/' + id, {});
  }
}