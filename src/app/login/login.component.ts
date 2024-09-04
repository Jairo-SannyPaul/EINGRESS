import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  showPassword: boolean = false;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check the fields and move labels if input is prefilled
    this.checkInputValues();
  }

  // Check the input values to position labels correctly
  checkInputValues(): void {
    const usernameInput = this.form.controls['username'].value;
    const passwordInput = this.form.controls['password'].value;

    if (usernameInput) {
      this.setLabelPosition('username', true);
    }
    if (passwordInput) {
      this.setLabelPosition('password', true);
    }
  }

  // Method to set the label position based on value presence
  setLabelPosition(field: string, hasValue: boolean): void {
    const label = document.querySelector(`label[for=${field}]`) as HTMLElement;
    if (hasValue && label) {
      label.classList.add('top-[-15px]', 'text-[15px]');
      label.classList.remove('top-1/2', '-translate-y-1/2');
    } else if (label) {
      label.classList.remove('top-[-15px]', 'text-[15px]');
      label.classList.add('top-1/2', '-translate-y-1/2');
    }
  }

  // Submit credentials logic
  // submitCredentials(): void {
  //   if (this.form.invalid) {
  //     this.dialogService.openAlertDialog('Please fill in all credentials');
  //     return;
  //   }

  //   const { username, password } = this.form.getRawValue();
  //   this.userService.loginUser({ username, password }).subscribe({
  //     next: (response: any) => {
  //       localStorage.setItem('token', response.access_token);
  //       localStorage.setItem('username', username);
  //       this.router.navigateByUrl('/main');
  //     },
  //     error: (error) => {
  //       this.dialogService.openAlertDialog('Invalid User please try again!');
  //       console.error(error);
  //     }
  //   });
  // }

  isLoading = false;

get isButtonActive(): boolean {
  return this.form.controls['username'].value && this.form.controls['password'].value;
}

submitCredentials(): void {
  if (this.form.invalid) {
    this.dialogService.openAlertDialog('Please fill in all credentials');
    return;
  }

  this.isLoading = true; // Start loading

  const { username, password } = this.form.getRawValue();
  this.userService.loginUser({ username, password }).subscribe({
    next: (response: any) => {
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('username', username);
      this.router.navigateByUrl('/main');
      this.isLoading = false; // Stop loading
    },
    error: (error) => {
      this.dialogService.openAlertDialog('Invalid User please try again!');
      this.isLoading = false; // Stop loading
      console.error(error);
    }
  });
}


  // Method to toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Method to clear the placeholder text when the input is focused
  clearText(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    this.setLabelPosition(target.getAttribute('formControlName') || '', true);
  }

  // Method to reset the placeholder text and label position when the input loses focus
  resetPlaceholder(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const controlName = target.getAttribute('formControlName') || '';

    if (!value) {
      this.setLabelPosition(controlName, false);
    }
  }
}
