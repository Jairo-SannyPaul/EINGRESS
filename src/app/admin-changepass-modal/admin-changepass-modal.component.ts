import { UserService } from './../services/user.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { User } from '../interface/user.interface';

@Component({
  selector: 'app-admin-changepass-modal',
  templateUrl: './admin-changepass-modal.component.html',
  styleUrls: ['./admin-changepass-modal.component.css']
})
export class AdminChangepassModalComponent implements OnInit {
  form: FormGroup;
  changePass = false;
  passNotMatch!: boolean;
  emptyOldPass!: boolean;
  currentAdmin!: number;
  invalidOldPass!: boolean;
  currentEmail!: string;

  // Variables to track password visibility states
  showOldPass = false;
  showNewPass = false;
  showConfirmPass = false;

  constructor(private userService: UserService, private fb: FormBuilder, private employeeService: EmployeeService) {
    this.userService.modalState$.subscribe((state: boolean) => {
      this.changePass = state;
    });

    // Add Validators.required to the form controls
    this.form = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.currentAdmin = this.userService.currentUserId;
    console.log("Current id: ", this.currentAdmin)
    if (this.currentAdmin) {
      this.userService.getUserById(this.currentAdmin).subscribe({
        next: (user: User) => {
          this.currentEmail = user.email || "";
        },
        error: (err) => {
          console.error('Failed to fetch user details', err);
        }
      });
    }
  }

  exitModal() {
    this.userService.closeModal();
  }

  saveChanges() {
    if (this.form.invalid) {
      return; // Prevent submission if the form is invalid
    }
  
    const oldPass = this.form.get('oldPassword')?.value;
    const newPass = this.form.get('newPassword')?.value;
    const confirmPass = this.form.get('confirmPassword')?.value;
  
    if (newPass !== confirmPass) {
      this.passNotMatch = true; // Set error for mismatched passwords
      return;
    }
  
    if (newPass && !oldPass) {
      this.emptyOldPass = true; // Set error for empty old password
      return;
    }
  
    if (oldPass) {
      console.log('Validating old password');
      this.userService.validateOldPassword(this.currentAdmin, oldPass).subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.invalidOldPass = true; // Set error for invalid old password
            this.employeeService.setPopupErrorVisibility(true); // Show error visibility
            return;
          }
  
          const updateData = {
            password: newPass
          };
          this.userService.updateUser(this.currentAdmin, updateData).subscribe({
            next: (response) => {
              this.userService.closeModal();
              this.employeeService.setPopupVisibility(true); // Show success visibility
            },
            error: (error) => {
              this.userService.closeModal();
              console.error('Error updating profile:', error);
              this.employeeService.setPopupErrorVisibility(true); // Show error visibility on update failure
            }
          });
        },
        error: (error) => {
          console.error('Error validating old password:', error);
          this.userService.closeModal();
          this.employeeService.setPopupErrorVisibility(true); // Show error visibility on validation error
        }
      });
    }
  }
  

  toggleOldPass() {
    this.showOldPass = !this.showOldPass;
  }

  toggleNewPass() {
    this.showNewPass = !this.showNewPass;
  }

  toggleConfirmPass() {
    this.showConfirmPass = !this.showConfirmPass;
  }


}
