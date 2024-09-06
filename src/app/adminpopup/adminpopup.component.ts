import { UserService } from './../services/user.service';
import { DialogService } from './../services/dialog.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../interface/user.interface';

@Component({
  selector: 'app-adminpopup',
  templateUrl: './adminpopup.component.html',
  styleUrls: ['./adminpopup.component.css']
})

export class AdminpopupComponent implements OnInit {

  form:FormGroup;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  currentAdmin!: number;
  // baseUrl = this.UserService.apiUrl;

  constructor(private fb: FormBuilder, private userService: UserService, private dialogService: DialogService) {
    this.form = this.fb.group({
      newEmail: ['', Validators.email], // Email should have a proper validator
      newusername: [''],
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  adminUpdate = {
    newEmail: '',
    newusername: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    this.currentAdmin = this.userService.currentUserId;
    console.log("Current ID: ", this.currentAdmin);
    if (this.currentAdmin) {
      this.userService.getUserById(this.currentAdmin).subscribe({
        next: (user: User) => {
          this.form.patchValue({
            newEmail: user.email || '',
            newusername: user.username || ''
          });
          console.log("Fetched User: ", user);
        },
        error: (err) => {
          console.error('Failed to fetch user details', err);
        }
      });
    }
  }
  

  clearText(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.placeholder = ''; 
  }

  resetPlaceholder(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      switch (inputElement.getAttribute('formControlName')) {
        case 'newEmail':
          inputElement.placeholder = 'Enter Email';
          break;
        case 'newusername':
          inputElement.placeholder = 'Enter New Username';
          break;
        case 'oldPassword':
          inputElement.placeholder = 'Enter Old Password';
          break;
        case 'newPassword':
          inputElement.placeholder = 'Enter New Password';
          break;
        case 'confirmPassword':
          inputElement.placeholder = 'Confirm Password';
          break;
      }
    }
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'oldPassword') {
      this.showOldPassword = !this.showOldPassword;
    } else if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onClear(): void {
    this.form.reset();
    
    // Reset placeholders after clearing the form
    const placeholders: { [key: string]: string } = {
      newusername: 'Enter New Username',
      oldPassword: 'Enter Old Password',
      newPassword: 'Enter New Password',
      confirmPassword: 'Confirm Password'
    };

    Object.keys(this.form.controls).forEach(controlName => {
      const inputElement = document.querySelector(`input[formControlName="${controlName}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.placeholder = placeholders[controlName];
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.dialogService.openAlertDialog('Please fill in all required fields correctly.');
      return;
    }
  
    const oldPass = this.form.get('oldPassword')?.value;
    const newPass = this.form.get('newPassword')?.value;
    const confirmPass = this.form.get('confirmPassword')?.value;
  
    if (newPass !== confirmPass) {
      this.dialogService.openAlertDialog('New password and confirmed password do not match.');
      return;
    }
  
    if (newPass && !oldPass) {
      this.dialogService.openAlertDialog('Please enter your old password to update your password.');
      return;
    }
  
    const updateData = {
      username: this.form.get('newusername')?.value,
      email: this.form.get('newEmail')?.value,
      password: newPass
    };
  
    this.userService.updateUser(this.currentAdmin, updateData).subscribe({
      next: (response) => {
        if (response.message === 'User updated successfully with new email') {
          console.log('Email changed');
          this.dialogService.openSuccessDialog('Email changed and user updated successfully!');
  
          // Prepare data for sending verification email
          const verificationData = {
            name: this.form.get('newusername')?.value,
            address: this.form.get('newEmail')?.value,
            verification_otp: response.user.verify_otp, // Ensure verify_token is part of response
          };
  
          // Call send verification email
          this.userService.sendVerificationEmail(verificationData).subscribe({
            next: (emailResponse) => {
              console.log('Verification email sent:', emailResponse);
            },
            error: (emailError) => {
              console.error('Error sending verification email:', emailError);
            }
          });
        } else {
          this.dialogService.openSuccessDialog('Profile updated successfully!');
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.dialogService.openAlertDialog('Error updating profile.');
      }
    });
  }
  
  
  

}