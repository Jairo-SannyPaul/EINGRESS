import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { DialogService } from 'src/app/services/dialog.service';
import { AddUserModalService } from 'src/app/services/add-user-modal.service';


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
  constructor(private formBuilder: FormBuilder, private employeeService: EmployeeService, private dialogService: DialogService, private addUserModalService: AddUserModalService) {
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
    this.addUserModalService.closeModal();
    this.resetForm(); // Clear form on closing
  }

  getFirstLetter(fullname: string): string {
    return fullname.charAt(0).toUpperCase(); // Get the first letter and convert it to uppercase
  }
  

  generateRandomGradient(): string {
    const colors = [
      '#FF5733', // Color 1
      '#33FF57', // Color 2
      '#3357FF', // Color 3
      '#FF33A6', // Color 4
      '#33FFF5', // Color 5
    ];
    const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
    const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(135deg, ${randomColor1}, ${randomColor2})`;
  }

  
  // Submit the form data
  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    this.userForm.markAllAsTouched();
    this.userForm.get('fingerprint2')?.setValue('');   

    if (this.userForm.valid) {
      const newEmployee = this.userForm.value;

        // Get the first letter and log it to the console
      const firstLetter = this.getFirstLetter(newEmployee.fullname);
      console.log('First letter of fullname:', firstLetter); // Log the first letter

        // Set the profileImage using the first letter of the fullname with a random gradient
      const gradient = this.generateRandomGradient();
      newEmployee.profileImage = `${firstLetter}|${gradient}`; // Store both the letter and gradient


      const handleError = (error: any) => {
        let errorMessage = 'Error creating employee.';
        if (error.status === 400 && error.error && error.error.message) {
          // Extract the message from the backend response
          errorMessage = error.error.message;
        }
        this.dialogService.openAlertDialog(errorMessage);
      };

      if (!this.selectedImage) {
        this.employeeService.addEmployeeWithoutImage(newEmployee)
          .subscribe(
            response => {
              this.isPopupVisible = true; // Show the popup;
            },
            handleError
          );
      } else {
        this.employeeService.addEmployee(newEmployee, this.selectedImage)
          .subscribe(
            response => {
              this.isPopupVisible = true; // Show the popup;
            },
            handleError
          );
      }
    } else {
      if (this.userForm.get('email')?.errors?.['email']) {
        this.addUserModalService.closeModal();
        this.dialogService.openAlertDialog('Please enter a valid email address.');
      } else {
        this.addUserModalService.closeModal();
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
