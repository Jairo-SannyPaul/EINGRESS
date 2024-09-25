import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.css']
})
export class ErrorPopupComponent {

  constructor (private employeeService: EmployeeService){}



  @Input() isVisible: boolean = false; // Input to control visibility
  @Output() close = new EventEmitter<void>(); // Output event to close the popup

  closePopup(): void {
    this.close.emit(); // Emit close event
    this.employeeService.closeModal();
    this.employeeService.reload$;
  }

}
