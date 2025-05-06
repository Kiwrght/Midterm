import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';

export function jwtInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const usersSvc = inject(UsersService);
  // add JWT auth header if a user is logged in for API requests
  const accessToken = usersSvc.getToken();
  if (accessToken) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return next(request);
}