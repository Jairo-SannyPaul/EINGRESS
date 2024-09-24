import { Component, HostListener } from '@angular/core';
import { UserService } from '../services/user.service';
import { EmployeeService } from '../services/employee.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../interface/user.interface';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  form: FormGroup;
  changePass: boolean = false
  editMode: boolean = false
  isPopupVisible: boolean = false;
  currentAdmin!: number;
  currentUsername!: string;
  currentAge!: string;
  currentGender!: string;
  originalValues: any;
  discardPopupVisible: boolean = false; 

  private reloadSubscription: Subscription = new Subscription();


  constructor(
    private userService: UserService,
    private employeeService: EmployeeService,
    private formbuilder: FormBuilder) {
    this.form = this.formbuilder.group({
      username: [''],
      bday: [''],
      email: ['', Validators.email],
      number: [''],
      age: [''],
      address: ['']
    });
  }

  adminUpdate = {
    username: '',
    bday: '',
    email: '',
    number: '',
    age: '',
    address: ''
  };


  ngOnInit() {
    this.currentAdmin = this.userService.currentUserId;
    console.log("Current ID: ", this.currentAdmin);

    if (this.currentAdmin) {
      this.loadAdminInfo(); // Fetch admin info if there's a valid ID
    }

    // Subscribe to reload events
    this.reloadSubscription = this.employeeService.reload$.subscribe(() => {
      // Call a method to reload or refresh data
      this.loadAdminInfo();  // Fetch admin data again when reload$ is triggered
    });

    this.employeeService.editMode$.subscribe(isEditing => {
      this.editMode = isEditing;
      // Add any additional logic that should occur when edit mode changes
      if (!isEditing) {
       this.editMode = false;
      }
    });
  }

  ngOnDestroy() {
    this.reloadSubscription.unsubscribe();
  }


  loadAdminInfo() {
    this.userService.getUserById(this.currentAdmin).subscribe({
      next: (user: User) => {
        this.currentUsername = user.username || '';
        this.currentAge = user.age || '';
        this.currentGender = user.gender || '';
        this.form.patchValue({
          username: user.username || '',
          email: user.email || '',
          bday: user.bday || '',
          number: user.number || '',
          address: user.address || '',
          age: user.age || '',
        });

        // Store original values
        this.originalValues = {
          username: user.username,
          email: user.email,
          bday: user.bday,
          number: user.number,
          address: user.address,
          age: user.age
        };

        console.log("Fetched User: ", user);
      },
      error: (err) => {
        console.error('Failed to fetch user details', err);
      }
    });
  }

  toggleChangePass() {
    if (!this.changePass) {  // Fix the condition to check the value, not assign
      this.userService.openModal();
    }
    this.changePass = !this.changePass;  // Toggle the state after opening/closing the modal
  }


  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.userService.closeModal();
    }
  }

  editAdmin() {
    this.editMode = !this.editMode;
  }

  saveChanges() {
    // this.employeeService.setPopupVisibility(true)
    if (this.form.invalid) {
      this.employeeService.setPopupErrorVisibility(true);
      return;
    }
    else {
      const updateData = {
        username: this.form.get('username')?.value,
        bday: this.form.get('bday')?.value,
        email: this.form.get('email')?.value,
        number: this.form.get('number')?.value,
        age: this.form.get('age')?.value,
        address: this.form.get('address')?.value,
      };

      console.log("Updating data");
      this.userService.updateUser(this.currentAdmin, updateData).subscribe({

        next: (response) => {
          if (response.message === 'User updated successfully with new email') {
            console.log('Email changed');
            // Prepare data for sending verification email
            const verificationData = {
              name: this.form.get('newusername')?.value,
              address: this.form.get('newEmail')?.value,
              verification_otp: response.user.verify_otp, // Ensure verify_token is part of response
            };

            // Call send verification email
            this.userService.sendVerificationEmail(verificationData).subscribe({
              next: (emailResponse) => {
                console.log('Verification email sent:', emailResponse);
              },
              error: (emailError) => {
                console.error('Error sending verification email:', emailError);
              }
            });
          }
          else {
            this.employeeService.triggerReload(); // Notify other components to reload
            this.editMode = false;
            this.currentUsername = updateData.username; // Update current username
            this.currentAge = updateData.age; // Update current age
            this.employeeService.setPopupVisibility(true);
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.editMode = false;
          this.employeeService.setPopupErrorVisibility(true);
        }
      });
    }
  }

  hasUnsavedChanges(): boolean {
    // Compare current form values with original values
    const currentValues = this.form.value;
    return Object.keys(currentValues).some(key => currentValues[key] !== this.originalValues[key]);
  }


  clearChanges() {
    if (this.hasUnsavedChanges()) {
      this.employeeService.setDiscardPopupVisibility(true);
    }
    else{
      this.editMode = false;
    }
  }
}
