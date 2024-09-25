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

  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;


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

  // Form validation logic (you can add more complex logic here if needed)
  validateForm(): boolean {
    return this.userForm.valid;
  }

  closePopup(): void {
    this.isPopupVisible = false; // Hide the popup
    this.isVisible = false;
    this.resetForm(); // Clear form on closing
  }


  getFirstLetter(fullname: string): string {
    return fullname.charAt(0).toUpperCase();
  }

  generateRandomGradient(): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#33FFF5'];
    const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
    const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(0deg, ${randomColor1}, ${randomColor2})`;
  }
  
  // Submit the form data
  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    this.userForm.markAllAsTouched();
    this.userForm.get('fingerprint2')?.setValue('');   

    if (this.userForm.valid) {
      const newEmployee = this.userForm.value;
      
      const firstLetter = this.getFirstLetter(newEmployee.fullname);
      const gradient = this.generateRandomGradient();

      // Set the profileImage to a combination of the first letter and gradient for use later
      newEmployee.profileImage = `${firstLetter}|${gradient}`;

      // Draw on canvas and export to PNG
      this.drawToCanvas(firstLetter, gradient, (pngDataUrl) => {
        // Optionally, use the PNG data URL here
        console.log('Generated PNG URL:', pngDataUrl);
        // You can now set this PNG URL as an image source or save it
      });


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


  // Function to draw the letter and gradient on a canvas and export as PNG
  drawToCanvas(letter: string, gradient: string, callback: (dataUrl: string) => void): void {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context could not be obtained.');
      return;
    }

    // Parse gradient colors from the string
    const gradientColors = gradient.match(/#[0-9A-Fa-f]{6}/g);
    if (!gradientColors || gradientColors.length < 2) {
      console.error('Invalid gradient colors.');
      return;
    }

    // Create the gradient
    const canvasGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    canvasGradient.addColorStop(0, gradientColors[0]);
    canvasGradient.addColorStop(1, gradientColors[1]);

    // Fill the canvas with the gradient
    context.fillStyle = canvasGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the letter in the center
    context.fillStyle = '#FFFFFF'; // Set the text color
    context.font = 'bold 60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(letter, canvas.width / 2, canvas.height / 2);

    // Export the canvas content to a PNG data URL
    const dataUrl = canvas.toDataURL('image/png');
    callback(dataUrl);
  }
}



  
