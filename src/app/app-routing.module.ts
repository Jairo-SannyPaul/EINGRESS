import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { DashboardComponent } from './main/dashboard/dashboard.component';
import { ReportsComponent } from './main/reports/reports.component';
import { UsersComponent } from './main/users/users.component';
import { AddUserFormComponent } from './main/users/add-user-form/add-user-form.component';
import { authGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AdminpopupComponent } from './adminpopup/adminpopup.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'manage-account', component: AdminpopupComponent },
  { 
    path: 'login', 
    component: LoginComponent,
  },
  { 
    path: 'main', 
    component: MainComponent,
    canActivate: [authGuard],
    children:[
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'add-user-form', component: AddUserFormComponent },
    ]
  },
  {
    path:'**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
