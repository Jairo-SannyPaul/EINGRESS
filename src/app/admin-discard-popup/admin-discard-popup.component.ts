

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-admin-discard-popup',
  templateUrl: './admin-discard-popup.component.html',
  styleUrls: ['./admin-discard-popup.component.css']
})
export class AdminDiscardPopupComponent {

  constructor (private employeeService: EmployeeService){}
  @Input() isVisible: boolean = false; // Input to control visibility
  @Output() close = new EventEmitter<void>(); // Output event to close the popup

  closePopup(): void {
    this.close.emit(); // Emit close event
    this.employeeService.closeModal();
    this.employeeService.reload$;
  }

  confirm(){
    this.close.emit(); // Emit close event
    this.employeeService.closeModal();
    this.employeeService.reload$;
    this.employeeService.closeEditModeAndReload();
  }

}


