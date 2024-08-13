import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { DashboardComponent } from './main/dashboard/dashboard.component';
import { ReportsComponent } from './main/reports/reports.component';
import { UsersComponent } from './main/users/users.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { UserService } from './services/user.service';
import { SecuritySummaryComponent } from './main/dashboard/security-summary/security-summary.component';
import { SearchfieldComponent } from './main/users/searchfield/searchfield.component';
import { AddUserBtnComponent } from './main/users/add-user-btn/add-user-btn.component';
import { DeleteBtnComponent } from './main/users/delete-btn/delete-btn.component';
import { CheckboxComponent } from './main/users/checkbox/checkbox.component';
import { TableComponent } from './main/users/table/table.component';
import { UserSelectionComponent } from './main/users/table/user-selection/user-selection.component';
import { AddUserFormComponent } from './main/users/add-user-form/add-user-form.component';
import { Table1Component } from './main/reports/table1/table1.component';
import { UserDetailsComponent } from './main/reports/user-details/user-details.component';
import { LoginSessionsComponent } from './main/reports/login-sessions/login-sessions.component';

import { CustomInterceptor } from './services/custom.interceptor';

import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { EmployeeDetailsComponent } from './main/users/table/employee-details/employee-details.component';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { ReportsSearchfieldComponent } from './main/reports/reports-searchfield/reports-searchfield.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RecentAlertsComponent } from './main/dashboard/recent-alerts/recent-alerts.component';
import { RecentLoginComponent } from './main/dashboard/recent-login/recent-login.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from './dialogs/alert-dialog/alert-dialog.component';
import { SuccessDialogComponent } from './dialogs/success-dialog/success-dialog.component';
import { AdminpopupComponent } from './adminpopup/adminpopup.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    HeaderComponent,
    MainComponent,
    DashboardComponent,
    ReportsComponent,
    UsersComponent,
    SecuritySummaryComponent,
    SearchfieldComponent,
    AddUserBtnComponent,
    DeleteBtnComponent,
    CheckboxComponent,
    TableComponent,
    UserSelectionComponent,
    AddUserFormComponent,
    Table1Component,
    UserDetailsComponent,
    LoginSessionsComponent,
    PageNotFoundComponent,
    EmployeeDetailsComponent,
    ReportsSearchfieldComponent,
    RecentAlertsComponent,
    RecentLoginComponent,
    ConfirmDialogComponent,
    ConfirmDialogComponent,
    AlertDialogComponent,
    SuccessDialogComponent,
    AdminpopupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxChartsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule
  ],
  providers: [
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
