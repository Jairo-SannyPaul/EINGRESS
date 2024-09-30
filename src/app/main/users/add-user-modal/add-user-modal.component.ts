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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; // Reference to the file input

  isVisible: boolean = false;
  addUserForm: boolean = false;
  userForm: FormGroup;
  selectedImage!: File;
  fileSelect: boolean = false;
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

  // Form validation logic
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
    const colors = ['#FFFFFF', '#8B0000', '#B22222', '#006400', '#6B8E23', '#00008B', '#4169E1', '#8B008B', '#DA70D6', '#2F4F4F', '#708090', '#4B0082', '#8A2BE2', '#483D8B', '#6A5ACD', '#2E8B57', '#3CB371', '#556B2F', '#9ACD32', '#8B4513', '#D2691E', '#800000', '#CD5C5C', '#3B3B6D', '#7B68EE'];
    const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
    const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(45deg, ${randomColor1}, ${randomColor2})`;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0]; // Store the selected file
      console.log("Selected image:", this.selectedImage);
      
      // Set fileSelect to true when a file is selected
      this.fileSelect = true;
      this.submitEmployee(); // Call the submit function after selecting the file
    } else {
      this.fileSelect = false; // Reset fileSelect if no file
    }
  }

  // Submit the form data
  onSubmit(): void {
    this.userForm.markAllAsTouched();
    this.userForm.get('fingerprint2')?.setValue('');

    if (this.userForm.valid) {
      const newEmployee = this.userForm.value;

      const firstLetter = this.getFirstLetter(newEmployee.fullname);
      const gradient = this.generateRandomGradient();

      // Draw on canvas and export to PNG
      this.drawToCanvas(firstLetter, gradient, (pngDataUrl) => {
        console.log('Generated PNG URL:', pngDataUrl);
        const formattedName = newEmployee.fullname;
        const blob = this.dataUrlToBlob(pngDataUrl);
        this.downloadImage(pngDataUrl, formattedName);
        this.fileInput.nativeElement.click(); // Open the file selector
      });
    }
  }

  submitEmployee(): void {
    if (this.fileSelect) {
      const newEmployee = this.userForm.value;
      this.employeeService.addEmployee(newEmployee, this.selectedImage)
        .subscribe(
          response => {
            this.employeeService.closeModal(); // Close the modal
            this.employeeService.setPopupVisibility(true); // Show the popup
          },
          error => {
            let errorMessage = 'Error creating employee.';
            if (error.status === 400 && error.error && error.error.message) {
              errorMessage = error.error.message; // Extract the message from the backend response
            }
            this.employeeService.closeModal(); // Close the modal
            this.employeeService.setPopupErrorVisibility(true); // Show error popup
          }
        );
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

    const gradientColors = gradient.match(/#[0-9A-Fa-f]{6}/g);
    if (!gradientColors || gradientColors.length < 2) {
      console.error('Invalid gradient colors.');
      return;
    }

    const canvasGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    canvasGradient.addColorStop(0, gradientColors[0]);
    canvasGradient.addColorStop(1, gradientColors[1]);

    context.fillStyle = canvasGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FFFFFF'; // Set the text color
    context.font = 'normal 45px Poppins';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const adjustment = 5; // Adjust this value to move it lower or higher
    context.fillText(letter, canvas.width / 2, (canvas.height / 2) + adjustment);

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
}
