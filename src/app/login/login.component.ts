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
  errorMessage: string | null = null;
  isLoading = false;
  isForgotPassword = false;
  isVerification = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      code1: [''],
      code2: [''],
      code3: [''],
      code4: [''],
      code5: [''],
      code6: ['']
    });
  }

  ngOnInit(): void {
    // Check the fields and move labels if input is prefilled
    this.checkInputValues();
  }

  toggleBackToLogin() {
    this.isForgotPassword = false;
    this.isVerification = false;
    this.errorMessage = '';
    this.form.reset();
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

  toggleForgotPassword() {
    this.isForgotPassword = !this.isForgotPassword;
    this.errorMessage = null;
    if (this.isForgotPassword) {
      this.form.reset(); // Reset form when switching to forgot password mode
    }
  }


  // Method to set the label position based on value presence
  setLabelPosition(field: string, hasValue: boolean): void {
    const label = document.querySelector(`label[for=${field}]`) as HTMLElement;
    if (hasValue && label) {
      label.classList.add('-top-5');
      label.classList.remove('top-1/2', '-translate-y-1/2');
    } else if (label) {
      label.classList.remove('-top-5');
      label.classList.add('top-1/2', '-translate-y-1/2');
    }
  }

  get isButtonActive(): boolean {
    return this.form.controls['username'].value && this.form.controls['password'].value;
  }

  submitCredentials() {
    this.isLoading = false;
    if (this.form.invalid) {
      this.dialogService.openAlertDialog('Please fill in all credentials');
      this.errorMessage = 'Please fill in all credentials';
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.userService.loginUser({ username, password }).subscribe({
      next: (response: any) => {
        // Extract token and user details from the response
        const token = response.access_token.token;
        const user = response.access_token.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('username', username);  // Optionally store username if needed
        this.router.navigateByUrl('/main');
        this.isLoading = false; // Stop loading
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = 'Your email or password was not recognized. Please try again.';
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


  resetPlaceholder(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const controlName = target.getAttribute('formControlName') || '';

    // Only move the label down if the input is empty
    if (!value) {
      this.setLabelPosition(controlName, false);
    } else {
      this.setLabelPosition(controlName, true);  // Keep the label up if there's a value
    }
  }

  sendRequest(): void {
    const email = this.form.get('username')?.value;
    console.log("Send Reset OTP frontend: ", email);
    this.isLoading = true;  // Start loading

    this.userService.sendResetOtp({ email }).subscribe({
      next: (response: any) => {
        if (response.error) {
          // If user not found or any other error is returned from the backend
          this.errorMessage = response.error;
          console.log('Error response:', response.error);
        } else {
        
          this.isLoading = false;  // Stop loading on success
          console.log("Sent Reset OTP to email: ", email)
          setTimeout(() => {
            this.isLoading = false;
            this.isVerification = true; // Move to verification step after sending request
          }, 1000);
        }
      },
      error: (error) => {
        this.errorMessage = error;  // User-friendly error message
        console.error('Error response:', this.errorMessage);  // Log the full error response for debugging
      },
      complete: () => {
        this.isLoading = false;  // Stop loading regardless of success or error
      }
    });
  }

  verifyCode(): void {
    // Handle verification logic here
    const verificationCode = `${this.form.value.code1}${this.form.value.code2}${this.form.value.code3}${this.form.value.code4}${this.form.value.code5}${this.form.value.code6}`;
    console.log('Verification Code:', verificationCode);

    // Simulate verification success
    setTimeout(() => {
      this.router.navigate(['/reset-password']); // Navigate to the reset password page
    }, 1000);
  }

}
