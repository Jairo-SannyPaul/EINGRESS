import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-adminpopup',
  templateUrl: './adminpopup.component.html',
  styleUrls: ['./adminpopup.component.css']
})
export class AdminpopupComponent {
  manageAccountForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.manageAccountForm = this.fb.group({
      newusername: [''],
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  
}
