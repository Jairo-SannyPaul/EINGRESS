// users.component.ts
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AddUserFormComponent } from './add-user-form/add-user-form.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  @ViewChild(AddUserFormComponent) addUserFormContainer!: AddUserFormComponent;
  filter: boolean = false;
  onAddUserBtnClicked(){
    this.addUserFormContainer.showAddUserForm();
  }

  toggleFilter(){
    this.filter = !this.filter;
  }
}
