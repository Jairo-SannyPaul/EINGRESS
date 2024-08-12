import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { AddUserFormComponent } from './add-user-form/add-user-form.component';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  @ViewChild(AddUserFormComponent) addUserFormContainer!: AddUserFormComponent;
  @Output() sortOptionChanged = new EventEmitter<string>();

  filterToggle: boolean = false;
  selectedFilter: string = 'name';
  sortOption: string = 'nameAsc';
  constructor(private employeeService: EmployeeService){}

  onSortChange() {
    console.log('Sort option changed:', this.sortOption); // Debugging log
    this.sortOptionChanged.emit(this.sortOption);

    // Optional: you might also update the service or trigger other actions if needed
    this.employeeService.setSortOption(this.sortOption);
  }
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
