import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword: boolean = false;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ){
    this.form = this.formBuilder.group({
      username: ['',Validators.required],
      password: ['',Validators.required]
  });
  }

  // submitCredentials() {
  //   if(this.form.invalid){
  //     this.dialogService.openAlertDialog('Please fill in all credentials');
  //     return;
  //   }

  //   this.userService.loginUser(this.form.getRawValue()).subscribe({
  //       next: (response: any) => {
  //         localStorage.setItem('token', response.access_token);
  //         this.router.navigateByUrl('/main');
  //       },
  //       error: (error) => {
  //         this.dialogService.openAlertDialog('Invalid User please try again!');
  //         console.error(error); 
  //       }
  //     } 
  //   );
  // }

  submitCredentials() {
    if (this.form.invalid) {
      this.dialogService.openAlertDialog('Please fill in all credentials');
      return;
    }
  
    const { username, password } = this.form.getRawValue();
  
    this.userService.loginUser({ username, password }).subscribe({
      next: (response: any) => {
        // Extract token and user details from the response
        const token = response.access_token.token;
        const user = response.access_token.user;
  
        // Store the token and user details in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('username', username);  // Optionally store username if needed
  
        // Navigate to the main page
        this.router.navigateByUrl('/main');
      },
      error: (error) => {
        this.dialogService.openAlertDialog('Invalid User please try again!');
        console.error(error); 
      }
    });
  }
  

  // Method to toggle password visibility
  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    }
  }

  // Method to clear the placeholder text when the input is focused
  clearText(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;

    if (target.getAttribute('formControlName') === 'username') {
      target.placeholder = ''; 
    } else if (target.getAttribute('formControlName') === 'password') {
      target.placeholder = ''; 
    }
  }

  // Method to reset the placeholder text when the input loses focus
  resetPlaceholder(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;

    if (target.getAttribute('formControlName') === 'username') {
      target.placeholder = 'Username'; 
    } else if (target.getAttribute('formControlName') === 'password') {
      target.placeholder = 'Password'; 
    }
  }
}

