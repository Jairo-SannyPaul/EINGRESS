import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';
import { EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/services/dialog.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('rfidInput') rfidInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fingerprintInput1') fingerprintInput1!: ElementRef<HTMLInputElement>;
  @ViewChild('fingerprintInput2') fingerprintInput2!: ElementRef<HTMLInputElement>;
  
  hasVal: boolean = false;
  employeeDetails!: Employee | undefined;
  selectedImage!: File;
  photoSrc: string | ArrayBuffer | null = null;
  editMode: boolean = false;
  rfidScanMode: boolean = false;
  updateEmployeeForm: FormGroup;
  isUpdating: boolean = false;
  baseUrl = this.employeeService.apiUrl;
  added!: boolean;
  showCopyNotification: boolean = false;
  route: any;
  
  constructor(private formBuilder: FormBuilder, private employeeService: EmployeeService, private dialogService: DialogService) {
    this.updateEmployeeForm = this.formBuilder.group({
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
    this.updateEmployeeForm.disable();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: { [x: string]: any; }) => {
      const userId = params['userId'];
      if (userId) {
        this.loadEmployeeDetails(userId);
      }
    });
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.hideEmployeeDetails();
      console.log("esc clicked");
    }
  }

  loadEmployeeDetails(userId: string): void {
    this.employeeService.getEmployeeById(userId).subscribe(employee => {
      this.employeeDetails = employee;
      this.updateEmployeeForm.patchValue(employee);
    }, error => {
      console.error('Error fetching employee details:', error);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeeDetails'] && changes['employeeDetails'].currentValue) {
      this.updateEmployeeForm.patchValue(changes['employeeDetails'].currentValue);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.selectedImage = file;

        // Update the image source for preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.photoSrc = reader.result;
        };
      } else {
        alert('Please select a valid image format (jpg, png).');
      }
    }
  }

  updateEmployee(event: Event): void {
    event.preventDefault(); // Prevent the default form submission behavior
    const id = this.employeeDetails?.id;
  
    if (id) {
      const emailControl = this.updateEmployeeForm.get('email');
  
      if (this.updateEmployeeForm.invalid && emailControl?.value === '') {
        this.dialogService.openAlertDialog('Please fill in all credentials');
        return;
      }
  
      if (emailControl && emailControl.invalid) {
        this.dialogService.openAlertDialog('Invalid email please try again');
        return;
      }
  
      const fingerprint1 = this.updateEmployeeForm.get('fingerprint1')?.value;
      const fingerprint2 = this.updateEmployeeForm.get('fingerprint2')?.value;
  
      if (fingerprint1 && fingerprint2 && fingerprint1 === fingerprint2) {
        this.dialogService.openAlertDialog('Fingerprint1 and Fingerprint2 cannot be the same.');
        return;
      }
  
      const updateEmployee: Employee = this.updateEmployeeForm.value;
      const file: File = this.selectedImage;
  
      this.isUpdating = true; // Set update flag
  
      const handleError = (error: any) => {
        let errorMessage = 'Error updating employee.';
        if (error.status === 400 && error.error && error.error.message) {
          // Extract the message from the backend response
          errorMessage = error.error.message;
        }
        this.dialogService.openAlertDialog(errorMessage);
        this.isUpdating = false; // Reset update flag
      };
  
      if (file) {
        this.employeeService.updateEmployee(id, updateEmployee, file).subscribe(
          (response) => {
            this.dialogService.openSuccessDialog('Employee updated successfully').subscribe(confirmed => {
              if (confirmed) {
                this.isUpdating = false;
                this.hideEmployeeDetails();
              }
            });
          },
          handleError
        );
      } else {
        this.employeeService.updateEmployeeWithoutImage(id, updateEmployee).subscribe(
          (response) => {
            this.dialogService.openSuccessDialog('Employee updated successfully').subscribe(confirmed => {
              if (confirmed) {
                console.log('Employee update successful', response);
                this.isUpdating = false;
                this.hideEmployeeDetails();
              }
            });
          },
          handleError
        );
      }
    }
  }
  
  onClear(): void {
    Object.keys(this.updateEmployeeForm.controls).forEach(controlName => {
      const control = this.updateEmployeeForm.get(controlName);
      if (control instanceof FormControl) {
        control.setValue('');
      }
    });
  }

  enableEdit(): void {
    this.editMode = true;
    this.updateEmployeeForm.enable();
  }

  onRoleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const roleValue = target.getAttribute('value');
    this.updateEmployeeForm.patchValue({ role: roleValue });
    console.log({ role: roleValue });
  }

  showEmployeeDetails(employee: Employee): void {
    this.updateEmployeeForm.patchValue({
      fullname: employee.fullname,
      email: employee.email,
      role: employee.role,
      phone: employee.phone,
      rfidtag: employee.rfidtag,
      fingerprint1: employee.fingerprint1,
      fingerprint2: employee.fingerprint2,
      branch: employee.branch
    });
    this.employeeDetails = employee;
  
    const fingerprint2Value = this.updateEmployeeForm.get('fingerprint2')?.value;
    if (fingerprint2Value) {
      this.hasVal = true;
      this.added = true;
    }
  }

  hideEmployeeDetails(): void {
    this.employeeDetails = undefined;
    this.editMode = false;
    this.employeeService.triggerReload();
    this.updateEmployeeForm.disable();
    this.added = false;
  }

  startRFIDScan(): void {
    if (this.editMode) {
      this.rfidInput.nativeElement.removeAttribute('disabled');
      this.rfidInput.nativeElement.focus();
    }
  }
  
  preventDefault(event: Event): void {
    if ((event as KeyboardEvent).key === 'Enter') {
      event.preventDefault();
    }
  }
  
  toggleFingerprint() {
    if(this.updateEmployeeForm.get('fingerprint1')?.value){
      this.added = !this.added;
      this.updateEmployeeForm.get('fingerprint2')?.setValue('');
    }
    else{
      this.dialogService.openAlertDialog('Please put value in Fingerprint ID 1 first');
      return;
    }
}

copyRFID() {
  const rfidInput = this.rfidInput.nativeElement as HTMLInputElement;
  
  // Temporarily enable the input if it's disabled and editMode is not active
  const wasDisabled = rfidInput.disabled && !this.editMode;
  if (wasDisabled) {
    rfidInput.disabled = false;
  }

  // Copy the value to the clipboard using the Clipboard API
  navigator.clipboard.writeText(rfidInput.value).then(() => {
    // Show the notification and change the icon
    this.showCopyNotification = true;

    // Automatically hide the notification and revert the icon after 1 second
    setTimeout(() => {
      this.showCopyNotification = false;
      if (wasDisabled) {
        rfidInput.disabled = true;
      }
    }, 1000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
  });
}

// Method to clear the placeholder text when the input is focused
clearText(event: FocusEvent): void {
  const target = event.target as HTMLInputElement;
  if (target.hasAttribute('formControlName')) {
    target.placeholder = ''; 
  }
}

// Method to reset the placeholder text when the input loses focus
resetPlaceholder(event: FocusEvent): void {
  const target = event.target as HTMLInputElement;
  const placeholders: { [key: string]: string } = {
    'fullname': 'Enter Name',
    'email': 'Enter Email',
    'rfidtag': 'ABC19021DC',
    'phone': '+639 xxx xxx xxxx',
    'fingerprint1': '135135115161',
    'fingerprint2': '135135115161'
  };
  const formControlName = target.getAttribute('formControlName');
  if (formControlName) {
    target.placeholder = placeholders[formControlName] || '';
  }
}



}
