import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Determines if a route can be activated.
   * @param next - The activated route snapshot.
   * @param state - The router state snapshot.
   * @returns {Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree}
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // We use the authState$ observable from the AuthService.
    // 'pipe' and 'take(1)' ensure we get the current value and then unsubscribe.
    return this.authService.authState$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          // If the user is authenticated, allow access to the route.
          return true;
        } else {
          // If the user is not authenticated, redirect them to the login page.
          // The router.createUrlTree method creates a UrlTree that the router
          // will navigate to, effectively blocking access to the original route.
          console.log('Access denied. Redirecting to login.');
          return this.router.createUrlTree(['/dashboard/login']);
        }
      })
    );
  }
}
