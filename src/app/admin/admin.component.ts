import { Component, HostListener } from '@angular/core';
import { UserService } from '../services/user.service';
import { EmployeeService } from '../services/employee.service';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  changePass:boolean = false
  editMode:boolean = false
  isPopupVisible: boolean = false;

  constructor (private userService: UserService, private employeeService: EmployeeService){
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

  editAdmin(){
    this.editMode = !this.editMode;
  }

  saveChanges(){
this.employeeService.setPopupVisibility(true)
  }

  clearChanges(){
    this.editMode = !this.editMode;
  }
}
