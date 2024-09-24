import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { EmployeeService } from '../services/employee.service';
@Component({
  selector: 'app-admin-changepass-modal',
  templateUrl: './admin-changepass-modal.component.html',
  styleUrls: ['./admin-changepass-modal.component.css']
})
export class AdminChangepassModalComponent {
  
  changePass = false;

constructor(private userService: UserService, private employeeService: EmployeeService){
  this.userService.modalState$.subscribe((state: boolean) => {
    this.changePass = state;
  });
}

  exitModal() {
    this.userService.closeModal();
  }
}
