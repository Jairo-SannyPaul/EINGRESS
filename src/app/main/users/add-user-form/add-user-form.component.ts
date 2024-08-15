import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/services/employee.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-add-user-form',
  templateUrl: './add-user-form.component.html',
  styleUrls: ['./add-user-form.component.css']
})
export class AddUserFormComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('rfidInput') rfidInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fingerprintInput1') fingerprintInput1!: ElementRef<HTMLInputElement>;
  @ViewChild('fingerprintInput2') fingerprintInput2!: ElementRef<HTMLInputElement>;
  @ViewChild('employeeRole', {static: false}) employeeRole?: ElementRef;

  addUserForm: boolean = false;
  selectedImage!: File;
  photoSrc: string | ArrayBuffer | null = null;
  added: boolean = false;
  baseUrl = this.employeeService.apiUrl;
  userForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private employeeService: EmployeeService, private dialogService: DialogService) { 
    this.userForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      profileImage: [''],
      phone: ['', Validators.required],
      rfidtag: [''],
      fingerprint1: [''],
      fingerprint2: ['']
    });
  }

  newEmployee = {
    id: 0,
    fullname: '',
    email: '',
    phone: '',
    role: '',
    rfidtag: '',
    profileImage: '' ,
    fingerprint1: '',
    fingerprint2: ''
  };

  showAddUserForm() {
    this.addUserForm = true;
  }

  hideAddUserForm() {
    this.employeeService.triggerReload();
    this.addUserForm = false;
    this.resetForm();
    this.added = false;
  }

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
      fingerprint2: ''
    };
    this.photoSrc = null;
    this.selectedImage = null!;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.selectedImage = file;

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

  submitUser(): void {
    // Mark all fields as touched to trigger validation messages
    this.userForm.markAllAsTouched();
  
    if (this.userForm.valid) {
      const newEmployee = this.userForm.value;
  
      if (!this.selectedImage) {
        this.employeeService.addEmployeeWithoutImage(newEmployee)
          .subscribe(
            response => {
              this.dialogService.openSuccessDialog('Employee Created Successfully').subscribe(confirmed => {
                if (confirmed) {

                  this.hideAddUserForm();
                }
              });
            },
            error => {
              this.handleError(error);
            }
          );
      } else {
        this.employeeService.addEmployee(newEmployee, this.selectedImage)
          .subscribe(
            response => {
              this.dialogService.openSuccessDialog('Employee Created Successfully').subscribe(confirmed => {
                if (confirmed) {
                  this.hideAddUserForm();
                }
              });
            },
            error => {
              this.handleError(error);
            }
          );
      }
    } else {
      // Check specifically for email validation error
      if (this.userForm.get('email')?.errors?.['email']) {
        this.dialogService.openAlertDialog('Please enter a valid email address.');
      } else {
        this.dialogService.openAlertDialog('Please fill in all required fields correctly.');
      }
    }
  }

  handleError(error: any) {
    console.error('An error occurred:', error);
    this.dialogService.openAlertDialog('An error occurred while processing your request. Please try again.');
  }

  startRFIDScan(): void {
    if (this.added) {
      this.rfidInput.nativeElement.removeAttribute('disabled');
      this.rfidInput.nativeElement.focus();
    }
  }

  toggleFingerprint() {
    if(this.userForm.get('fingerprint1')?.value){
      this.added = !this.added;
      this.userForm.get('fingerprint2')?.setValue('');
    }
    else{
      this.dialogService.openAlertDialog('Please put value in Fingerprint ID 1 first');
      return;
    }
}


}
