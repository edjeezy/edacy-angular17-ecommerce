import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Interface pour la réponse du jeton du serveur
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Interface pour la charge utile de l'utilisateur décodée à partir du JWT
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
  // L'URL de base de votre serveur Express
  private readonly API_URL = 'http://localhost:3000';

  // BehaviorSubject pour contenir l'état d'authentification actuel
  private authState = new BehaviorSubject<boolean>(this.isAuthenticated());
  // BehaviorSubject pour contenir les informations utilisateur décodées
  private user = new BehaviorSubject<UserPayload | null>(null);
  
  // Exposer l'état d'authentification et les données utilisateur en tant qu'Observables
  public authState$ = this.authState.asObservable();
  public user$ = this.user.asObservable();

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {


    // Lors de l'initialisation du service, vérifiez un jeton existant et décodez-le.
    // Cela gère le cas où l'utilisateur recharge la page.
    this.decodeAndStoreUser(this.getAccessToken());
  }

  /**
   * Décode un JWT, stocke la charge utile de l'utilisateur et met à jour le sujet utilisateur.
   * @param {string | null} token - Le jeton d'accès JWT.
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
   * Décode manuellement le jeton pour vérifier son expiration.
   * @param {string} token - Le jeton d'accès JWT.
   * @returns {boolean} Vrai si le jeton est expiré, sinon faux.
   */
  private isTokenExpired(token: string): boolean {
    if (!token) {
      return true;
    }

    try {
      // Décoder la charge utile du jeton en utilisant JwtHelperService
      const decodedToken = this.jwtHelper.decodeToken<UserPayload>(token);

      // Vérifier si le jeton a pu être décodé et s'il a une date d'expiration
      if (!decodedToken || !decodedToken.exp) {
        return true;
      }

      // Obtenir la date d'expiration en millisecondes
      const expirationDate = decodedToken.exp * 1000;
      // Obtenir la date actuelle en millisecondes
      const now = new Date().getTime();

      // Vérifier si le jeton a expiré
      return expirationDate < now;
    } catch (error) {
      // Si une erreur se produit lors du décodage, considérer le jeton comme expiré
      return true;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié en vérifiant le jeton d'accès.
   * @returns {boolean} Vrai si le jeton existe et n'est pas expiré.
   */
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  /**
   * Récupère le jeton d'accès depuis le localStorage.
   * @returns {string | null} Le jeton d'accès ou null s'il n'est pas trouvé.
   */
  public getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Récupère le jeton de rafraîchissement depuis le localStorage.
   * @returns {string | null} Le jeton de rafraîchissement ou null s'il n'est pas trouvé.
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Stocke les jetons d'accès et de rafraîchissement dans le localStorage et met à jour l'état d'authentification.
   * @param {AuthResponse} tokens - Les jetons à stocker.
   */
  private setTokens(tokens: AuthResponse): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    this.decodeAndStoreUser(tokens.accessToken); // Décoder et stocker les informations utilisateur
    this.authState.next(true); // Notifier les abonnés que l'utilisateur est authentifié
  }

  /**
   * Efface les jetons du localStorage et met à jour l'état d'authentification.
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.user.next(null); // Effacer les données utilisateur
    this.authState.next(false); // Notifier les abonnés que l'utilisateur est déconnecté
  }

  /**
   * Gère la connexion de l'utilisateur avec l'email et le mot de passe.
   * @param {any} credentials - Les informations de connexion de l'utilisateur.
   * @returns {Observable<AuthResponse>}
   */
  public login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setTokens(response);
        this.router.navigate(['/profile']); // Rediriger vers une route protégée en cas de succès
      })
    );
  }

  /**
   * Gère l'enregistrement d'un nouvel utilisateur.
   * @param {any} userInfo - Les informations du nouvel utilisateur.
   * @returns {Observable<AuthResponse>}
   */
  public signup(userInfo: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/signup`, userInfo).pipe(
      tap((response) => {
        this.setTokens(response);
        this.router.navigate(['/profile']); // Se connecter et rediriger automatiquement
      })
    );
  }

  /**
   * Déconnecte l'utilisateur en effaçant les jetons locaux et en notifiant le serveur.
   */
  public logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      // Notifier le backend pour invalider le jeton de rafraîchissement
      this.http.post(`${this.API_URL}/auth/logout`, { refreshToken }).subscribe();
    }
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  /**
   * Lance le flux OAuth de Google en redirigeant vers le point de terminaison du backend.
   */
  public loginWithGoogle(): void {
    // Le backend gérera la redirection vers l'écran de consentement de Google.
    window.location.href = `${this.API_URL}/auth/google`;
  }

  /**
   * Gère le rappel de Google OAuth, en stockant les jetons de l'URL.
   * @param {string} accessToken - Le jeton d'accès des paramètres de requête de l'URL.
   * @param {string} refreshToken - Le jeton de rafraîchissement des paramètres de requête de l'URL.
   */
  public handleGoogleCallback(accessToken: string, refreshToken: string): void {
    this.setTokens({ accessToken, refreshToken });
    this.router.navigate(['/profile']);
  }

  /**
   * Tente d'obtenir un nouveau jeton d'accès en utilisant le jeton de rafraîchissement.
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
        // Après le rafraîchissement, décodez le nouveau jeton d'accès pour mettre à jour les informations utilisateur
        this.decodeAndStoreUser(response.accessToken);
        this.authState.next(true);
      }),
      catchError((error) => {
        // Si le jeton de rafraîchissement est également invalide, déconnectez l'utilisateur.
        this.logout();
        return of(null);
      })
    );
  }
}
