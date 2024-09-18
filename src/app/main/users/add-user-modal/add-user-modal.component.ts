import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.css']
})

export class AddUserModalComponent implements OnInit {
  isVisible: boolean = false;
  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Initialize the form with validation
    this.userForm = this.fb.group({
      fullname: ['', Validators.required],
      role: ['', Validators.required],
      branch: ['', Validators.required],
      rfid: ['', Validators.required],
      fingerprint1: [''],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^\\+63\\d{9,10}$')]],
      fingerprintId1: ['', Validators.required],
      fingerprintId2: [''],
      fingerprint2: ['']
    });
  }

  ngOnInit() {
    // Initialization is already done in the property declaration
  }

  showAddUserModal() {
    this.isVisible = true;
  }

  hideAddUserModal() {
    this.isVisible = false;
  }

  onClear() {
    this.userForm.reset();
  }

  onSubmit() {
    if (this.userForm.valid) {
      // Handle form submission
      console.log(this.userForm.value);
    }
  }
}
