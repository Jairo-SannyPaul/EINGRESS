import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-user-submit-popup',
  templateUrl: './add-user-submit-popup.component.html',
  styleUrls: ['./add-user-submit-popup.component.css']
})
export class AddUserSubmitPopupComponent {
  @Input() isVisible: boolean = false; // Input to control visibility
  @Output() close = new EventEmitter<void>(); // Output event to close the popup

  closePopup(): void {
    this.close.emit(); // Emit close event
  }

  
}
