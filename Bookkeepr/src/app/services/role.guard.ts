import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { map } from 'rxjs';
import { UsersService } from './users.service';

export const roleGuard: CanMatchFn = (route: Route, _: UrlSegment[]) => {
  const router = inject(Router);
  const usersSvc = inject(UsersService);

  const navigation = router.getCurrentNavigation();

  const returnUrl = navigation?.extractedUrl.toString() || '/';
  const allowedRoles = ((route.data || {})['roles'] || []) as Array<string>;
  return usersSvc.user$.pipe(
    map((user) => {
      if (user && allowedRoles.includes(user.role)) {
        return true;
      } else {
        router.navigate(['login'], {
          queryParams: { returnUrl },
        });
        return false;
      }
    })
  );
};