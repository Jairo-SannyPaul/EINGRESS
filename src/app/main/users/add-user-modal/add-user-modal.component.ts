import { Component, Input } from '@angular/core';


interface User {
  fullName: string;
  role: string;
  branch: string;
  rfid: string;
  email: string;
  contact: string;
  fingerprint1: string;
  fingerprintId1: string;
  fingerprintId2?: string;
  fingerprint2?: string;
}

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.css']
})
export class AddUserModalComponent {

  @Input() isVisible: boolean = false; // Input to control visibility
  isPopupVisible: boolean = false; // Popup visibility flag

  // Initialize the user model to bind with the form fields
  user: User = {
    fullName: '',
    role: '',
    branch: '',
    rfid: '',
    email: '',
    contact: '',
    fingerprint1: '',
    fingerprintId1: '',
    fingerprintId2: '',
    fingerprint2: ''
  };

  constructor() {}

  // Show the modal
  showAddUserModal(): void {
    this.isVisible = true;
  }

  // Hide the modal
  hideAddUserModal(): void {
    this.isVisible = false;
    this.onClear(); // Clear form on closing
  }

  // Clear form fields
  onClear(): void {
    this.user = {
      fullName: '',
      role: '',
      branch: '',
      rfid: '',
      email: '',
      contact: '',
      fingerprint1: '',
      fingerprintId1: '',
      fingerprintId2: '',
      fingerprint2: ''
    };
  }

  onSubmit(): void {
    if (this.validateForm()) {
      console.log('Form Submitted:', this.user);
      this.isPopupVisible = true; // Show the popup
    } else {
      console.error('Form validation failed');
    }
  }

  // Form validation logic (you can add more complex logic here if needed)
  validateForm(): boolean {
    return (
      this.user.fullName &&
      this.user.role &&
      this.user.branch &&
      this.user.rfid &&
      this.user.email &&
      this.user.contact &&
      this.user.fingerprintId1
    ) ? true : false;
  }

  
  closePopup(): void {
    this.isPopupVisible = false; // Hide the popup
    this.isVisible = false;
    this.onClear(); // Clear form on closing
    }
}
