import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { DialogService } from 'src/app/services/dialog.service';


@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.css']
})
export class AddUserModalComponent {
  isVisible: boolean = false;
  addUserForm: boolean = false;
  userForm: FormGroup;
  selectedImage!: File;
  isPopupVisible: boolean = false; // Popup visibility flag
  constructor(private formBuilder: FormBuilder, private employeeService: EmployeeService, private dialogService: DialogService) {
    this.userForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      profileImage: [''],
      phone: ['', Validators.required],
      rfidtag: [''],
      fingerprint1: [''],
      fingerprint2: [''],
      branch: ['', Validators.required],
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.hideAddUserModal();
    }
  }

  preventDefault(event: Event): void {
    if ((event as KeyboardEvent).key === 'Enter') {
      event.preventDefault();
    }
  }

  newEmployee = {
    id: 0,
    fullname: '',
    email: '',
    phone: '',
    role: '',
    rfidtag: '',
    profileImage: '',
    fingerprint1: '',
    fingerprint2: '',
    branch: ''
  };

  resetForm() {
    this.userForm.reset();
    this.newEmployee = {
      id: 0,
      fullname: '',
      email: '',
      phone: '',
      role: '',
      rfidtag: '',
      profileImage: '',
      fingerprint1: '',
      fingerprint2: '',
      branch: ''
    }
  }


  // Show the modal
  showAddUserModal(): void {
    this.isVisible = true;
  }
  // Hide the modal
  hideAddUserModal(): void {
    this.employeeService.closeModal();
    this.resetForm(); // Clear form on closing
  }

  // Submit the form data
  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    this.userForm.markAllAsTouched();
    this.userForm.get('fingerprint2')?.setValue('');
    if (this.userForm.valid) {
      const newEmployee = this.userForm.value;

      const handleError = (error: any) => {
        let errorMessage = 'Error creating employee.';
        if (error.status === 400 && error.error && error.error.message) {
          // Extract the message from the backend response
          errorMessage = error.error.message;
        }
        this.employeeService.closeModal(); //close the modal
        this.employeeService.setPopupErrorVisibility(true); //show error popup
      };

      if (!this.selectedImage) {
        this.employeeService.addEmployeeWithoutImage(newEmployee)
          .subscribe(
            response => {
              this.employeeService.closeModal(); //close the modal
              this.employeeService.setPopupVisibility(true) // Show the popup;
            },
            handleError
          );
      } else {
        this.employeeService.addEmployee(newEmployee, this.selectedImage)
          .subscribe(
            response => {
              this.employeeService.closeModal(); //close the modal
              this.employeeService.setPopupVisibility(true) // Show the popup;
            },
            handleError
          );
      }
    } else {
      if (this.userForm.get('email')?.errors?.['email']) {
        this.employeeService.closeModal();
        this.dialogService.openAlertDialog('Please enter a valid email address.');
      } else {
        this.employeeService.closeModal();
        this.dialogService.openAlertDialog('Please fill in all required fields correctly.');
      }
    }
  }

  // Form validation logic (you can add more complex logic here if needed)
  validateForm(): boolean {
    return this.userForm.valid;
  }
  

  closePopup(): void {
    this.isPopupVisible = false; // Hide the popup
    this.isVisible = false;
    this.resetForm(); // Clear form on closing
  }
}
