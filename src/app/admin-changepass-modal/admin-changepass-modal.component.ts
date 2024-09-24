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
      this.passNotMatch = true;
      return;
    }

    else if (newPass && !oldPass) {
      this.emptyOldPass = true;
      return;
    }
    else if (oldPass) {
      this.userService.validateOldPassword(this.currentAdmin, oldPass).subscribe({
        next: (isValid) => {
          if (!isValid) {
            this.invalidOldPass = true;
            return;
          }

          const updateData = {
            password: newPass
          };
          this.userService.updateUser(this.currentAdmin, updateData).subscribe({
            next: (response) => {
              this.userService.closeModal();
              this.employeeService.setPopupVisibility(true);
            },
            error: (error) => {
              this.userService.closeModal();
              console.error('Error updating profile:', error);
              this.employeeService.setPopupErrorVisibility(true);
            }
          });
        },
        error: (error) => {
          this.employeeService.setPopupErrorVisibility(true);
        }
      });
    }
  }
}
