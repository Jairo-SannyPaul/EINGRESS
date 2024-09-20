import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AddUserModalService } from 'src/app/services/add-user-modal.service';
import { EmployeeService } from 'src/app/services/employee.service';
@Component({
  selector: 'app-add-user-submit-popup',
  templateUrl: './add-user-submit-popup.component.html',
  styleUrls: ['./add-user-submit-popup.component.css']
})
export class AddUserSubmitPopupComponent {

  constructor (private addusermodalService: AddUserModalService, private employeeService: EmployeeService){}



  @Input() isVisible: boolean = false; // Input to control visibility
  @Output() close = new EventEmitter<void>(); // Output event to close the popup

  closePopup(): void {
    this.close.emit(); // Emit close event
    this.addusermodalService.closeModal();
    this.employeeService.reload$;
  }

  
}
