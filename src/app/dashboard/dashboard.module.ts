import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';
import { AdminSignupComponent } from './pages/admin-signup/admin-signup.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminNotFoundComponent } from './pages/admin-not-found/admin-not-found.component';


@NgModule({
  declarations: [
    DashboardComponent,
    AdminLoginComponent,
    AdminSignupComponent,
    ProfileComponent,
    AdminNotFoundComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,

  ]
})
export class DashboardModule { }
