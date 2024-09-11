import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../services/dialog.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  verificationError: boolean = false;
  showPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  form: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  isForgotPassword = false;
  isVerification = false;
  isResetPassword = false;
  censoredEmail: string = "a***n@j*******t.com";
  resetEmail!: string;
  currentAdmin!: number;
  successChangePass: boolean = false;
  verifyErrorMessage!: String;
  isNotificationPopup = false;
  timeLeft: number = 300; // 5 minutes in seconds
  private destroy$ = new Subject<void>();
  timerInterval: any;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      newPassword: [''], // Add this for reset password
      confirmPassword: [''], // Add this for reset password
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

  ngOnDestroy() {
    // Clear the interval when the component is destroyed to prevent memory leaks
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isResetPassword || this.isVerification) {
      // Prompt the user before closing
      $event.returnValue = 'You have unsaved changes! Are you sure you want to leave?';
    }
  }


  moveFocus(event: Event, nextField: HTMLInputElement | null, prevField: HTMLInputElement | null) {
    const inputEvent = event as InputEvent;
    const target = inputEvent.target as HTMLInputElement;
  
    const value = target.value;
    const maxLength = target.maxLength;
    
    // console.log(`Input Value: "${value}", Max Length: ${maxLength}, Event Type: ${inputEvent.inputType}`);
  
    if (value.length >= maxLength && nextField) {
      setTimeout(() => nextField.focus(), 0);
    } else if (value.length === 0 && prevField) {
      setTimeout(() => prevField.focus(), 0);
    } else if (inputEvent.inputType === 'deleteContentBackward' && prevField) {
      setTimeout(() => prevField.focus(), 0);
    }
  }

  handleButtonClick(): void {
    if (this.isResetPassword) {
      this.resetPassword();
    } else if (this.isVerification) {
      this.verifyCode();
    } else if (this.isForgotPassword) {
      this.sendRequest();
    }else {
      this.submitCredentials();
    }
  }
  
  getButtonText(): string {
    if (this.isResetPassword) {
      return 'Reset Password';
    } else if (this.isVerification) {
      return this.isLoading ? 'Verifying...' : 'Verify';
    } else if (this.isForgotPassword) {
      return this.isLoading ? 'Sending Request...' : 'Send Request';
    } else {
      return this.isLoading ? 'Logging in...' : 'Login';
    }
  }
  
  toggleBackToLogin() {
    if (this.isResetPassword) {
      const confirmed = confirm("You are in the reset password process. Going back will discard all changes. Are you sure?");
      if (!confirmed) {
        return; // Stop if the user cancels the action
      }
    }
    else if (this.isVerification) {
      const confirmed = confirm("You are in the Reset OTP Verification Process. Going back will require to send Reset OTP again. Are you sure?");
      if (!confirmed) {
        return; // Stop if the user cancels the action
      }
    }

    this.isForgotPassword = false;
    this.isVerification = false;
    this.isResetPassword = false;
    this.verificationError = false;
    this.errorMessage = null;
    this.errorMessage = '';
    this.form.reset();
    this.isLoading = false;

  }

  toggleVerification() {
    this.isVerification = true;
  }

  toggleResetPassword() {
    this.isVerification = false;
    this.isResetPassword = true;
  }

  // Check the input values to position labels correctly
  checkInputValues(): void {
    const emailInput = this.form.controls['email'].value;
    const passwordInput = this.form.controls['password'].value;

    if (emailInput) {
      this.setLabelPosition('email', true);
    }
    if (passwordInput) {
      this.setLabelPosition('password', true);
    }
  }

  toggleForgotPassword() {
    this.isForgotPassword = !this.isForgotPassword;
    this.isVerification = false;
    this.isResetPassword = false;
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
    if (this.isResetPassword) {
      return this.form.controls['newPassword'].value && this.form.controls['confirmPassword'].value;
    }
    if (this.isForgotPassword) {
      return this.form.controls['email'].value;
    }
    if (this.isVerification) {
      // Ensure all code fields are filled for verification
      return this.form.controls['code1'].value && 
             this.form.controls['code2'].value &&
             this.form.controls['code3'].value &&
             this.form.controls['code4'].value &&
             this.form.controls['code5'].value &&
             this.form.controls['code6'].value;
    }
    return this.form.controls['email'].value && this.form.controls['password'].value;
  }

  submitCredentials() {
    const { email, password } = this.form.getRawValue();
    if (email === "" || password === "") {
      this.errorMessage = 'Please fill in all credentials';
      return;
    }
    else{
      this.isLoading = true;
    
      this.userService.loginUser({ email, password }).subscribe({
        next: (response: any) => {
          // Extract token and user details from the response
          const token = response.access_token.token;
          const user = response.access_token.user;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('email', email);  // Optionally store username if needed
          this.router.navigateByUrl('/main');
          this.isLoading = false; // Stop loading
          this.errorMessage = null;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Your email or password was not recognized. Please try again.';
          console.error(error);
        }
      });
    }

   
  }

  // Method to toggle password visibility
  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    } else if (field === 'showPassword') {
    this.showPassword = !this.showPassword;
    }
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
    this.resetEmail = this.form.get('email')?.value;
    const email = this.form.get('email')?.value;
    console.log("Send Reset OTP frontend: ", email);
    this.isLoading = true;  // Start loading

     // Start the timer
     this.resetTimer();

    this.userService.sendResetOtp({ email }).subscribe({
      next: (response: any) => {
        if (response.error) {
          // If user not found or any other error is returned from the backend
          this.errorMessage = response.error;
          console.log('Error response:', response.error);
        } else {
        
          this.isLoading = false;  // Stop loading on success
          console.log("Sent Reset OTP to email: ", email)
          this.errorMessage = null;
          setTimeout(() => {
            this.isLoading = false;
            this.isVerification = true; // Move to verification step after sending request
            this.censoredEmail=this.censorEmail(this.resetEmail);
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


    // // Routes to reset password 
    //       console.log("Sent Reset OTP to email: ", email)
    //       setTimeout(() => {
    //         this.isLoading = false;
    //         this.isVerification = true; // Move to verification step after sending request
    //         this.censoredEmail=this.censorEmail(this.resetEmail);
    //       }, 1000);
  }

  censorEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const censoredLocal = localPart[0] + '***' + localPart[localPart.length - 1];
    const censoredDomain = domain[0] + '*******' + domain[domain.length - 1];
    return `${censoredLocal}@${censoredDomain}`;
  }


  verifyCode(): void {
    this.isLoading = true;
    this.isVerification = true;
    const otp = `${this.form.value.code1}${this.form.value.code2}${this.form.value.code3}${this.form.value.code4}${this.form.value.code5}${this.form.value.code6}`;
  
    const email = this.resetEmail;
    console.log(email);
    console.log("Validating OTP: ", otp, "From email: ", email);
    
    this.verificationError = false; // Reset error state
    this.verifyErrorMessage = '';

    

    this.userService.validateResetOtp({ email, otp }).subscribe({
      next: (response: any) => {
        if (response.message === "User not found") {  // Fixed comparison
          this.verifyErrorMessage = response.message;
          this.verificationError = true;
          console.log('Error response:', response.message);
        } 
        else if(response.message === "OTP expired") {  // Fixed comparison
          this.verifyErrorMessage = "Verification code Expired!";
          this.verificationError = true;
          console.log('Error response:', response.message);
        }
        else if(response.message === "Invalid OTP") {  // Fixed comparison
          this.verifyErrorMessage = "Verification code not valid!";
          this.verificationError = true;
          console.log('Error response:', response.message);
        } 
        else {
          this.isLoading = true;
          this.currentAdmin = response.id;
          console.log("Stored Admin ID: ", this.currentAdmin)
          setTimeout(() => {
            this.isLoading = false;
            this.isResetPassword = true;
          }, 1000);
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || "An error occurred";  // User-friendly error message
        console.error('Error response:', this.errorMessage);  // Log the full error response for debugging
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;  // Stop loading regardless of success or error
      }
    });
  
  


    // setTimeout(() => {
    //   this.isLoading = false;
    //   // Simulate verification logic
    //   if (otp === "123456") {  // Replace with actual verification logic
    //     console.log(otp);
    //     this.isResetPassword = true;
    //     console.log('Verification complete, transitioning to reset password state.');
    //   } else {
    //     this.verificationError = true;  // Trigger the red border if the code is incorrect
    //     this.verifyErrorMessage = 'Verification code not valid!';
    //   }
    // }, 1000);
}

resetPassword() {
  this.isLoading = true;

  const confirmPass = this.form.get('confirmPassword')?.value
  
  // UNCOMMENT THIS
  const updateData = {
    username: this.form.get('newusername')?.value,
    email: this.form.get('newEmail')?.value,
    password: this.form.get('newPassword')?.value
  };


  if( updateData.password !== confirmPass){
    this.errorMessage = "Passwords don't match";
    this.isLoading = false;
  }

  else{
  this.userService.updateUser(this.currentAdmin, updateData).subscribe({
    next: (response) => {
        this.isLoading = true;
        console.log('Admin password updated');
        this.successChangePass = true;
        setTimeout(() => {
          this.isForgotPassword = false;
          this.isVerification = false;
          this.isResetPassword = false;
          this.verificationError = false;
          this.errorMessage = null;
          this.errorMessage = '';
          this.form.reset();
          this.isLoading = false;
          // Reset state and display notification
          this.isNotificationPopup = true;
          // Hide notification after 5 seconds
          setTimeout(() => {
            this.isNotificationPopup = false;
            this.router.navigate(['/login']);
          }, 5000); // 5 seconds
        }, 1000); // Simulate network delay
    },
    error: (error) => {
      console.error('Error updating profile:', error);
      this.isLoading = false;
    }
  });
}

}

closeNotification(): void {
  this.isNotificationPopup = false;
}

sendNewCode() {
  // Handle logic for sending a new code
  // Reset and start the timer again
  this.resetTimer();
  this.verificationError = false;


  this.resetEmail = this.form.get('email')?.value;
  const email = this.form.get('email')?.value;
  console.log("Send Reset OTP frontend: ", email);
  this.isLoading = true;  // Start loading

   // Start the timer
   this.startTimer();

  this.userService.sendResetOtp({ email }).subscribe({
    next: (response: any) => {
      if (response.error) {
        // If user not found or any other error is returned from the backend
        this.errorMessage = response.error;
        console.log('Error response:', response.error);
      } else {
        this.isLoading = false;  // Stop loading on success
        console.log("Sent Reset OTP to email: ", email)
        this.errorMessage = null;
        this.form.patchValue({
          code1: '',
          code2: '',
          code3: '',
          code4: '',
          code5: '',
          code6: ''
        });
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

get formattedTime(): string {
  const minutes = Math.floor(this.timeLeft / 60);
  const seconds = this.timeLeft % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


startTimer() {
  // Clear any existing timer interval
  
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
  }

  this.timerInterval = setInterval(() => {
    if (this.timeLeft > 0) {
      this.timeLeft--;
    } else {
      clearInterval(this.timerInterval);
    }
  }, 1000);
}

resetTimer() {
  // Reset the timeLeft to 300 seconds
  this.timeLeft = 300;
  // Start or restart the timer
  this.startTimer();
}


handleTimerExpiration() {
  // Handle the timer expiration logic
  console.log("Timer expired");
  this.isVerification = false;
  this.isForgotPassword = true; // Optionally reset to forgot password state
}

}
