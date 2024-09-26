import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { MainComponent } from '../main.component';
import { AddUserModalComponent } from './add-user-modal/add-user-modal.component';
import { EmployeeService } from 'src/app/services/employee.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SearchfieldComponent } from './searchfield/searchfield.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


import { HeaderLabelService } from 'src/app/services/header-label.service';
import { FiltersService } from 'src/app/services/filters.service';

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
  @ViewChild(MainComponent, { static: false }) mainComponentContainer!: MainComponent;

  @ViewChild(AddUserModalComponent) addUserModalContainer! : AddUserModalComponent;


  @ViewChild(SearchfieldComponent) searchFieldComponent!: SearchfieldComponent;
  @Output() sortOptionChanged = new EventEmitter<string>();

  filterStatus: string = '';
  filterToggle: boolean = false;
  selectedFilter: string = 'name';
  sortOption: string = 'nameAsc';
  private sortOptionSubscription!: Subscription;
  
  constructor(
    private employeeService: EmployeeService,
    private headerLabelService: HeaderLabelService,
    private route: ActivatedRoute,
    private filtersService: FiltersService
  ) {}

  ngOnInit() {
    this.filtersService.selectedFilter$.subscribe(filter => {
      switch (filter) {
        case 'name':
          this.selectName();
          break;
        case 'role':
          this.selectRole();
          break;
        case 'rfid':
          this.selectRfid();
          break;
        case 'fingerprint':
          this.selectFingerprint();
          break;
        default:
          break;
      }
    });


    // Subscribe to the sortOption observable
    this.sortOptionSubscription = this.employeeService.sortOption$.subscribe(sortOption => {
      this.sortOption = sortOption;
    });

    this.route.queryParams.subscribe(params => {
      this.filterStatus = params['status'] || '';

      if (this.filterStatus === 'registered') {
          // Apply the filter logic for registered users
          this.filterUsersByStatus('registered');
      }
  });

    // Update the header title to "Dashboard"
    this.headerLabelService.updateTitle('Users Overview');
  }

  filterUsersByStatus(status: string) {
    // Add your filtering logic here to filter users by the 'registered' status
}

onSortChange(sortOption?: string) {
  if (sortOption) {
    this.sortOption = sortOption; // Update sort option based on emitted value
  }
  console.log('Sort option changed:', this.sortOption);
  this.sortOptionChanged.emit(this.sortOption);
  this.employeeService.setSortOption(this.sortOption);
  this.employeeService.triggerReload();
}

  onAddUserBtnClicked() {
    this.employeeService.openModal();
    
    
  }
  toggleFilter() {
    this.filterToggle = !this.filterToggle;
  }

  selectName(){
    console.log("Users name filter selected")
    this.selectedFilter ='name';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }

  selectRole(){
    console.log("Users role filter selected")
    this.selectedFilter ='role';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }

  selectRfid(){
    console.log("Users RFID filter selected")
    this.selectedFilter ='rfid';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }

  selectFingerprint(){
    console.log("Users fingerprint filter selected")
    this.selectedFilter ='fingerprint';
    this.employeeService.setFilterOption(this.selectedFilter);
    this.searchFieldComponent.clearSearchField();
  }
}
