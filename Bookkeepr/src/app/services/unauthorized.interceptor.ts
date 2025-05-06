import { inject } from '@angular/core';
import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export function unauthorizedInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);

  return next(request).pipe(
    catchError((err) => {
      if (err.status === 401) {
        router.navigate(['login'], {
          queryParams: { returnUrl: router.routerState.snapshot.url },
        });
      }

      throw err;
    })
  );
}