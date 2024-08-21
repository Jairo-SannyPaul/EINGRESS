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
export class AdminpopupComponent {

  form:FormGroup;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
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

// onSubmit(): void {
//   this.form.markAllAsTouched();
//   if (this.form.valid) {
//     const adminUpdate = this.form.value;

//     // Call the updateUser method to update the admin profile
//     this.UserService.updateUser(adminUpdate).subscribe({
//       next: (response) => {
//         console.log('Response from backend:', response);
//         this.dialogService.openSuccessDialog('Profile updated successfully!').subscribe(confirmed =>{
//           if (confirmed) {
//             this.hideadminpop();
//           }
//         });
//       },
//       error: (error) => {
//         let errorMessage = 'Error updating profile.';
//         if (error.status === 400 && error.error && error.error.message) {
//           errorMessage = error.error.message;
//         }
//         this.dialogService.openAlertDialog(errorMessage);
//       }
//     });
//   } else {
//     this.dialogService.openAlertDialog('Please fill in all required fields correctly.');
//   }
// }
//   hideadminpop() {
//     throw new Error('Method not implemented.');
//   }

onSubmit(): void {
  this.form.markAllAsTouched();
  
  console.log('Form Valid:', this.form.valid);
  console.log('Form Errors:', this.form.errors);
  console.log('Form Controls:', this.form.controls);

  if (this.form.invalid) {
    this.dialogService.openAlertDialog('Please fill in all required fields correctly.');
    return;
  }

  const adminUpdate = this.form.value;

  if (!adminUpdate.newusername || !adminUpdate.oldPassword || !adminUpdate.newPassword || !adminUpdate.confirmPassword) {
    this.dialogService.openAlertDialog('All fields must be filled.');
    return;
  }

  if (adminUpdate.newPassword !== adminUpdate.confirmPassword) {
    this.dialogService.openAlertDialog('New password and confirmed password do not match.');
    return;
  }

  this.UserService.updateUser(adminUpdate).subscribe({
    next: (response) => {
      console.log('Response from backend:', response);
      this.dialogService.openSuccessDialog('Profile updated successfully!').subscribe(confirmed => {
        if (confirmed) {
          this.hideadminpop();
        }
      });
    },
    error: (error) => {
      let errorMessage = 'Error updating profile.';
      if (error.status === 400 && error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      this.dialogService.openAlertDialog(errorMessage);
    }
  });
}
  hideadminpop() {
    throw new Error('Method not implemented.');
  }

}