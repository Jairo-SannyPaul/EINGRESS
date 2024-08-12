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
  filterToggle: boolean = false;
  selectedFilter: string = 'name';

  onAddUserBtnClicked(){
    this.addUserFormContainer.showAddUserForm();
  }
  toggleFilter(){
    this.filterToggle = !this.filterToggle;
  }

  selectName(){
    this.selectedFilter ='name';
  }
  selectRole(){
    this.selectedFilter ='role';
  }
  selectRfid(){
    this.selectedFilter ='rfid';
  }
  selectFingerprint(){
    this.selectedFilter ='fingerprint';
  }
}
