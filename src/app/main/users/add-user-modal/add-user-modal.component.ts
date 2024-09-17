import { Component } from '@angular/core';

@Component({
  selector: 'app-add-user-modal',
  templateUrl: './add-user-modal.component.html',
  styleUrls: ['./add-user-modal.component.css']
})
export class AddUserModalComponent {

  isVisible: boolean = false;

  showAddUserModal() {
    this.isVisible = true;
  }

  hideAddUserModal() {
    this.isVisible = false;
  }

  onClear() {
    // Add your clear logic here
  }

  onSubmit() {
    // Add your submit logic here
  }

}
