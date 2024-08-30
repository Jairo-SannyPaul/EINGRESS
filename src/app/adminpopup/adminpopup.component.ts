import { UserService } from './../services/user.service';
import { DialogService } from './../services/dialog.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { id } from '@swimlane/ngx-charts';

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
  currentAdmin!: { id: number };
  // baseUrl = this.UserService.apiUrl;

  constructor(private fb: FormBuilder, private UserService: UserService, private dialogService: DialogService) {
    this.form = this.fb.group({
      newusername: ['', Validators.required],
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['',Validators.required]
    });
  }

  adminUpdate = {
    newusername: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit() {
    // Initialize currentAdmin or fetch from a service
    this.currentAdmin = { id: 1 };  // Example id; replace with actual logic to get current admin
  }

  clearText(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.placeholder = ''; 
  }

  resetPlaceholder(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value === '') {
      switch (inputElement.getAttribute('formControlName')) {
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


//TRY AND ERROR
onSubmit(): void {
  if (this.form.invalid) {
    this.dialogService.openAlertDialog('Please fill in all required fields correctly.');
    return;
  }

  const { newusername, oldPassword, newPassword, confirmPassword } = this.form.value;

  if (newPassword !== confirmPassword) {
    this.dialogService.openAlertDialog('New password and confirmed password do not match.');
    return;
  }

  // Get current user ID from session or similar
  const userId = 9; // Example; replace with actual logic

  // Prepare update data
  const updateData = { username: newusername, password: newPassword };

  // Call the update service
  this.UserService.updateUser(userId, updateData).subscribe({
    next: (response) => {
      this.dialogService.openSuccessDialog('Profile updated successfully!');
    },
    error: (error) => {
      this.dialogService.openAlertDialog('Error updating profile.');
    }
  });
}

}