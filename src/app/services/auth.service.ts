import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Interface for the token response from the server
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Interface for the decoded user payload from the JWT
export interface UserPayload {
  id: number | string;
  name: string;
  iat: number;
  exp: number;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // The base URL of your Express server
  private readonly API_URL = 'http://localhost:3000'; 

  // BehaviorSubject to hold the current authentication state
  private authState = new BehaviorSubject<boolean>(this.isAuthenticated());
  // BehaviorSubject to hold the decoded user information
  private user = new BehaviorSubject<UserPayload | null>(null);
  
  // Expose the auth state and user data as Observables
  public authState$ = this.authState.asObservable();
  public user$ = this.user.asObservable();

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {
    // On service initialization, check for an existing token and decode it.
    // This handles the case where the user reloads the page.
    this.decodeAndStoreUser(this.getAccessToken());
  }

  /**
   * Decodes a JWT, stores the user payload, and updates the user subject.
   * @param {string | null} token - The JWT access token.
   */
  private decodeAndStoreUser(token: string | null): void {
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken<UserPayload>(token);
      this.user.next(decodedToken);
    } else {
      this.user.next(null);
    }
  }

  /**
   * Checks if the user is authenticated by verifying the access token.
   * @returns {boolean} True if the token exists and is not expired.
   */
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  /**
   * Retrieves the access token from localStorage.
   * @returns {string | null} The access token or null if not found.
   */
  public getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Retrieves the refresh token from localStorage.
   * @returns {string | null} The refresh token or null if not found.
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Stores the access and refresh tokens in localStorage and updates auth state.
   * @param {AuthResponse} tokens - The tokens to store.
   */
  private setTokens(tokens: AuthResponse): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    this.decodeAndStoreUser(tokens.accessToken); // Decode and store user info
    this.authState.next(true); // Notify subscribers that the user is authenticated
  }

  /**
   * Clears tokens from localStorage and updates auth state.
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.user.next(null); // Clear user data
    this.authState.next(false); // Notify subscribers that the user is logged out
  }

  /**
   * Handles user login with email and password.
   * @param {any} credentials - The user's login credentials.
   * @returns {Observable<AuthResponse>}
   */
  public login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setTokens(response);
        this.router.navigate(['/profile']); // Redirect to a protected route on success
      })
    );
  }

  /**
   * Handles new user registration.
   * @param {any} userInfo - The new user's information.
   * @returns {Observable<AuthResponse>}
   */
  public signup(userInfo: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/signup`, userInfo).pipe(
      tap((response) => {
        this.setTokens(response);
        this.router.navigate(['/profile']); // Automatically log in and redirect
      })
    );
  }

  /**
   * Logs the user out by clearing local tokens and notifying the server.
   */
  public logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      // Notify the backend to invalidate the refresh token
      this.http.post(`${this.API_URL}/auth/logout`, { refreshToken }).subscribe();
    }
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  /**
   * Initiates the Google OAuth flow by redirecting to the backend endpoint.
   */
  public loginWithGoogle(): void {
    // The backend will handle the redirect to Google's consent screen.
    window.location.href = `${this.API_URL}/auth/google`;
  }

  /**
   * Handles the callback from Google OAuth, storing the tokens from the URL.
   * @param {string} accessToken - The access token from the URL query params.
   * @param {string} refreshToken - The refresh token from the URL query params.
   */
  public handleGoogleCallback(accessToken: string, refreshToken: string): void {
    this.setTokens({ accessToken, refreshToken });
    this.router.navigate(['/profile']);
  }

  /**
   * Attempts to get a new access token using the refresh token.
   * @returns {Observable<any>}
   */
  public refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.http.post<any>(`${this.API_URL}/auth/refresh-token`, { refreshToken }).pipe(
      tap((response: { accessToken: string }) => {
        localStorage.setItem('access_token', response.accessToken);
        // After refreshing, decode the new access token to update user info
        this.decodeAndStoreUser(response.accessToken);
        this.authState.next(true);
      }),
      catchError((error) => {
        // If the refresh token is also invalid, log the user out.
        this.logout();
        return of(null);
      })
    );
  }
}
