import { UserService } from './../services/user.service';
import { DialogService } from './../services/dialog.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
      newusername: [''],
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['',Validators.required]
    });
  }

  adminUpdate = {
    newusername: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
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

//   onSubmit(): void {
//     if (this.form.valid) {
//       console.log(this.form.value);
//     }
//   }
// }

onSubmit(): void {
  this.form.markAllAsTouched();
  if (this.form.valid) {
    const adminUpdate = this.form.value;

    const handleError = (error: any) => {
      let errorMessage = 'Error creating employee.';
      if (error.status === 400 && error.error && error.error.message) {
        // Extract the message from the backend response
        errorMessage = error.error.message;
      }
      this.dialogService.openAlertDialog(errorMessage);
    };

    if(this.form.get('newusername')?.errors?.['newusername']){
      this.dialogService.openAlertDialog('Please enter a new username');
    } else{
      this.dialogService.openAlertDialog('Please fill in all requiredfields correctly')
    }
  }
}
}