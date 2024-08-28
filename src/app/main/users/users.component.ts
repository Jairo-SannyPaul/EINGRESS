import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { AddUserFormComponent } from './add-user-form/add-user-form.component';
import { EmployeeService } from 'src/app/services/employee.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SearchfieldComponent } from './searchfield/searchfield.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  animations: [
    trigger('slideIn', [
      state('void', style({
        transform: 'translateY(-20px)', /* Start from above */
        opacity: 0
      })),
      state('*', style({
        transform: 'translateY(0)', /* End at original position */
        opacity: 1
      })),
      transition('void => *', [
        animate('0.2s ease-out')
      ]),
      transition('* => void', [
        animate('0.2s ease-in')
      ])
    ])
  ]
})
export class UsersComponent {
  @ViewChild(AddUserFormComponent) addUserFormContainer!: AddUserFormComponent;
  @ViewChild(SearchfieldComponent) searchFieldComponent!: SearchfieldComponent;
  @Output() sortOptionChanged = new EventEmitter<string>();

  filterToggle: boolean = false;
  selectedFilter: string = 'name';
  sortOption: string = 'nameAsc';
  private sortOptionSubscription!: Subscription;
  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    // Subscribe to the sortOption observable
    this.sortOptionSubscription = this.employeeService.sortOption$.subscribe(sortOption => {
      this.sortOption = sortOption;
    });
  }

  onSortChange() {
    console.log('Sort option changed:', this.sortOption);
    this.sortOptionChanged.emit(this.sortOption);

    // Optional: you might also update the service or trigger other actions if needed
    this.employeeService.setSortOption(this.sortOption);
  }

  onAddUserBtnClicked() {
    this.addUserFormContainer.showAddUserForm();
  }

  toggleFilter() {
    this.filterToggle = !this.filterToggle;
  }

  selectName(){
    this.selectedFilter ='name';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }

  selectRole(){
    this.selectedFilter ='role';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }

  selectRfid(){
    this.selectedFilter ='rfid';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }

  selectFingerprint(){
    this.selectedFilter ='fingerprint';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }

  selectBranch(){
    this.selectedFilter ='branch';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }
}
