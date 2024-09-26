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

  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;


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
    const colors = ['#FFFFFF', '#8B0000', // Dark Red
      '#B22222', // Firebrick (Mid-light Red)
      '#006400', // Dark Green
      '#6B8E23', // Olive Drab (Mid-light Green)
      '#00008B', // Dark Blue
      '#4169E1', // Royal Blue (Mid-light Blue)
      '#8B008B', // Dark Magenta
      '#DA70D6', // Orchid (Mid-light Magenta)
      '#2F4F4F', // Dark Slate Gray
      '#708090', // Slate Gray (Mid-light Gray)
      '#4B0082', // Indigo
      '#8A2BE2', // Blue Violet (Mid-light Indigo)
      '#483D8B', // Dark Slate Blue
      '#6A5ACD', // Slate Blue (Mid-light Slate Blue)
      '#2E8B57', // Sea Green
      '#3CB371', // Medium Sea Green (Mid-light Sea Green)
      '#556B2F', // Dark Olive Green
      '#9ACD32', // Yellow Green (Mid-light Olive Green)
      '#8B4513', // Saddle Brown
      '#D2691E', // Chocolate (Mid-light Brown)
      '#800000', // Maroon
      '#CD5C5C', // Indian Red (Mid-light Maroon)
      '#3B3B6D',  // Dark Purple
      '#7B68EE'];

    const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
    const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(45deg, ${randomColor1}, ${randomColor2})`;
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


      // Draw on canvas and export to PNG
      this.drawToCanvas(firstLetter, gradient, (pngDataUrl) => {
        console.log('Generated PNG URL:', pngDataUrl);

        // Generate the filename using the full name
        const formattedName = newEmployee.fullname

        // Convert the data URL to a Blob
        const blob = this.dataUrlToBlob(pngDataUrl);


        // Trigger the download
        this.downloadImage(pngDataUrl, formattedName);

      });

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

    // Draw the letter slightly lower than the center
    context.fillStyle = '#FFFFFF'; // Set the text color
    context.font = 'normal 45px Poppins';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Adjust the y coordinate to move it lower
    const adjustment = 5; // Adjust this value to move it lower or higher
    context.fillText(letter, canvas.width / 2, (canvas.height / 2) + adjustment);

    // Export the canvas content to a PNG data URL
    const dataUrl = canvas.toDataURL('image/png');
    callback(dataUrl);
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  private downloadImage(dataUrl: string, filename: string): void {
    const blob = this.dataUrlToBlob(dataUrl);
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  //

}
