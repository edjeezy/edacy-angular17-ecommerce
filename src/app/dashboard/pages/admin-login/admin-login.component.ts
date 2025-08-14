import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });


  errorMessage: string | null = null;

  get email() {
    return this.loginForm.get('email') as FormControl;
  }

  get password() {
    return this.loginForm.get('password') as FormControl;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Via formbuilder
    /*     this.loginForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required]],
        }); */
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement.';
      return;
    }

    this.errorMessage = null;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // La redirection est gérée dans le service
        console.log('Connexion réussie !');
        this.router.navigate(['/dashboard/profile']);
      },
      error: (err) => {
        // Affiche un message d'erreur si l'authentification échoue
        this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la connexion.';
        console.error('Erreur de connexion', err);
      }
    });
  }
}
