import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-details-revamp',
  templateUrl: './employee-details-revamp.component.html',
  styleUrls: ['./employee-details-revamp.component.css']
})
export class EmployeeDetailsRevampComponent {

   
  currentName!: string;
  currentEmail!: string;
  updateEmployeeForm!: FormGroup;
  employeeDetails!: Employee | undefined;
  photoSrc: string | ArrayBuffer | null = null;
  hasVal: boolean = false;
  added!: boolean;
  route: any;
  baseUrl = this.employeeService.apiUrl;
  selectedImage!: File;
  isUpdating: boolean = false;

  
  selectedRole: string | null = null;
  roledropdownOpen: boolean = false;

  @ViewChild('roleDropdown') roleDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder
  ) {
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
  }
  ngOnInit(): void {
 
    this.employeeService.selectedEmployee$.subscribe((employee) => {
      if (employee) {
        this.showEmployeeDetails(employee);
      }
    });

    this.updateEmployeeForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });

     // Synchronize selectedRole with form control value
     this.selectedRole = this.updateEmployeeForm.get('role')?.value;

  }

  loadEmployeeDetails(userId: string): void {
    this.employeeService.getEmployeeById(userId).subscribe(employee => {
      this.employeeDetails = employee;
      this.updateEmployeeForm.patchValue(employee);
    }, error => {
      console.error('Error fetching employee details:', error);
    });
  }


  checkFormChanges() {
    if (this.updateEmployeeForm.dirty) {
    }
  }


  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.exitUpdateModal();
      console.log("esc clicked");
    }
  }
  exitUpdateModal() {
    this.employeeService.closeUpdateModal();
  }

  showEmployeeDetails(employee: Employee): void {
    console.log("patching values: ", employee);
    console.log(employee);
  
    this.currentName = employee.fullname;
    this.currentEmail = employee.email;
  
    // Patch the employee details into the form
    this.updateEmployeeForm.patchValue({
      fullname: employee.fullname,
      email: employee.email,
      role: employee.role, // This is important for role
      phone: employee.phone,
      rfidtag: employee.rfidtag,
      fingerprint1: employee.fingerprint1,
      fingerprint2: employee.fingerprint2,
      branch: employee.branch
    });
  
    // Assign the role from the employee data to selectedRole
    this.selectedRole = employee.role; // This ensures it is displayed
  
    this.employeeDetails = employee;

    const fingerprint2Value = this.updateEmployeeForm.get('fingerprint2')?.value;
    if (fingerprint2Value) {
      this.hasVal = true;
      this.added = true;
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
        this.updateEmployeeForm.markAsDirty();
      } else {
        alert('Please select a valid image format (jpg, png).');
      }
    }
  }

  resetForm(): void {
    if (this.employeeDetails) {
        // Patch the form with the employee details
        this.updateEmployeeForm.patchValue({
            fullname: this.employeeDetails.fullname,
            email: this.employeeDetails.email,
            role: this.employeeDetails.role, // This will set the role to the registered one
            phone: this.employeeDetails.phone,
            rfidtag: this.employeeDetails.rfidtag,
            fingerprint1: this.employeeDetails.fingerprint1,
            fingerprint2: this.employeeDetails.fingerprint2,
            branch: this.employeeDetails.branch,
        });

        // Optionally reset the selected role display
        this.selectedRole = this.employeeDetails.role;

        // Reset photoSrc to null or original image if needed
        this.photoSrc = null; // Or revert to the original image source if applicable

        // Reset the form's dirty state
        this.updateEmployeeForm.markAsPristine();
    }
}

  

  updateEmployee(event: Event): void {
    event.preventDefault(); // Prevent the default form submission behavior
    const id = this.employeeDetails?.id;

    if (id) {
      const emailControl = this.updateEmployeeForm.get('email');

      // if (this.updateEmployeeForm.invalid && emailControl?.value === '') {
      //   this.dialogService.openAlertDialog('Please fill in all credentials');

      //   return;
      // }

      if (emailControl && emailControl.invalid) {
        // this.dialogService.openAlertDialog('Invalid email please try again');
        return;
      }

      const fingerprint1 = this.updateEmployeeForm.get('fingerprint1')?.value;
      const fingerprint2 = this.updateEmployeeForm.get('fingerprint2')?.value;

      if (fingerprint1 && fingerprint2 && fingerprint1 === fingerprint2) {
        // this.dialogService.openAlertDialog('Fingerprint1 and Fingerprint2 cannot be the same.');
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
        // this.dialogService.openAlertDialog(errorMessage);
        this.isUpdating = false; // Reset update flag
      };

      if (file) {
        this.employeeService.updateEmployee(id, updateEmployee, file).subscribe(
          (response) => {
            this.employeeService.reload$;
            this.employeeService.setPopupVisibility(true);
            this.employeeService.closeUpdateModal();
          },
          handleError
        );
      } else {
        this.employeeService.updateEmployeeWithoutImage(id, updateEmployee).subscribe(
          (response) => {
            this.employeeService.setPopupVisibility(true);
            this.employeeService.closeUpdateModal();
          },
          handleError
        );
      }
    }
  }

  isDropdownOpen = false;

  onBranchChange() {
    // Set isDropdownOpen to false when an item is selected
    this.isDropdownOpen = false;
  }

  roles: string[] = [
    'Admin Aide', 'Administrative Assistant', 'Administrative Officer', 'Back End Developer',
    'Bubble Developer', 'CAD Operator', 'Cebu Branch Manager', 'Chief Executive Officer',
    'Chief Finance Officer', 'Co-CEO', 'Database Administrator', 'Developer', 'DevOps Engineer',
    'Digital Creative Marketing', 'Driver/ Maintenance', 'Front-end Developer', 'Full Stack Developer',
    'Guest', 'HR and Recruitment Assistant', 'HR Consultant', 'Intern', 'Internal Finance', 'IT Administrator',
    'Junior Full Stack Developer', 'Lead UI/UX Designer', 'Liaison Officer', 'Logistics', 'Logistics Assistant',
    'Maintenance Worker', 'PMO Manager', 'Principal Development Supervisor', 'Product Design Manager',
    'Product Owner', 'Project Coordinator', 'Project Manager', 'QA Manager', 'Quality Assurance Specialist',
    'Quality Assurance Specialist - Team Lead', 'Quality Automation Supervisor', 'Scrum Master',
    'Scrum Master/Product Owner', 'Software Development Manager', 'Sr. Full Stack Developer', 'TVI Head', 
    'UI/UX Designer'
  ];
  // Add the HostListener for detecting clicks outside the role dropdown
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.roledropdownOpen && this.roleDropdown) {
      const clickedInside = this.roleDropdown.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.roledropdownOpen = false;
      }
    }
  }

  toggleDropdown() {
    this.roledropdownOpen = !this.roledropdownOpen;
  }

  selectRole(role: string) {
    this.selectedRole = role;
    this.roledropdownOpen = false; // Close the dropdown
    
    const roleControl = this.updateEmployeeForm.get('role');
    roleControl?.setValue(role); // Set the value of the role control
    roleControl?.markAsDirty(); // Mark the control as dirty (optional)
    console.log('Role selected:', role);
    console.log('Form value:', this.updateEmployeeForm.value);
    console.log('Form dirty:', this.updateEmployeeForm.dirty);
  }  
}
