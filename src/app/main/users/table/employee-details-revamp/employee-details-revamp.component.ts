import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-employee-details-revamp',
  templateUrl: './employee-details-revamp.component.html',
  styleUrls: ['./employee-details-revamp.component.css']
})
export class EmployeeDetailsRevampComponent {
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

   // Utility function to generate profile picture data
  generateProfilePicture(initial: string): string {
    const canvas = document.createElement('canvas');
    const size = 100; // Adjust the canvas size as needed
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Generate random gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      const colors = this.getRandomColors();
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);

      // Draw the background gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Draw the initial
      ctx.fillStyle = '#FFF'; // White color for the text
      ctx.font = 'bold 50px Arial'; // Adjust font size and style
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, size / 2, size / 2);
    }

    // Return the base64 image data
    return canvas.toDataURL('image/png');
  }

  // Helper function to generate random colors for the gradient
  getRandomColors(): [string, string] {
    const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return [randomColor(), randomColor()];
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
