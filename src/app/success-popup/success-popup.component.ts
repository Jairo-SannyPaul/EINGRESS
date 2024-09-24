import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
@Component({
  selector: 'app-success-popup',
  templateUrl: './success-popup.component.html',
  styleUrls: ['./success-popup.component.css']
})
export class SuccessPopupComponent {

  constructor (private employeeService: EmployeeService){}



  @Input() isVisible: boolean = false; // Input to control visibility
  @Output() close = new EventEmitter<void>(); // Output event to close the popup

  closePopup(): void {
    this.close.emit(); // Emit close event
    this.employeeService.closeModal();
    this.employeeService.reload$;
  }

  
}
