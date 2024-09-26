import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { AccessLogService } from 'src/app/services/access-log.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ReportsSearchfieldComponent } from './reports-searchfield/reports-searchfield.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderLabelService } from 'src/app/services/header-label.service';
import { FiltersService } from 'src/app/services/filters.service';
type LoginSession = {
  date: string;
  time: string;
};

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
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
export class ReportsComponent implements OnInit {
  headerShown = false;
  loading: boolean = true;
  employeeList: Employee[] = [];
  selectedEmployee: Employee | null = null;
  loginSessions: LoginSession[] = [];
  searchTerm: string = '';
  filteredEmployees: Employee[] = [];
  selectedDate: string = ''; // Store the selected date from the date picker
  isTable1Empty: boolean = true;
  @Output() sortOptionReportsChanged = new EventEmitter<string>();
  @ViewChild(ReportsSearchfieldComponent) reportsSearchFieldComponent!: ReportsSearchfieldComponent;
  filterToggle: boolean = false;
  selectedReportsFilter: string = 'name';
  sortOption: string = 'nameAsc';
  private sortOptionSubscription!: Subscription;
  constructor(
    private accessLogService: AccessLogService,
    private employeeService: EmployeeService,
    private headerLabelService: HeaderLabelService,
    private route: ActivatedRoute,
    private filtersService: FiltersService
  ) { }

  ngOnInit(): void {
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
        case 'branch':
          this.selectBranch();
          break;
        default:
          break;
      }
    });

    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      console.log('Navigated with userId:', userId);
      this.loadEmployeeInfo(userId);
    });
    this.sortOptionSubscription = this.employeeService.sortOption$.subscribe(sortOption => {
      this.sortOption = sortOption;
    });

    // Update the header title to "Dashboard"
    this.headerLabelService.updateTitle('Reports');
    this.headerLabelService.updateHeaderTitle('Employees Login Session')

    this.filtersService.dateFilter$.subscribe(date => {
      this.selectedDate = date;
      this.filterEmployeesByDate(); // Call the filtering method whenever the date changes
    });
  }

    getEmployeeById(userId: string) {
      this.employeeService.getEmployeeById(userId).subscribe(
        employee => {
          this.selectedEmployee = employee;
          this.fetchLoginSessions(employee);
        },
        error => {
          console.error('Error fetching employee by ID:', error);
        }
      );
    }
  
  loadEmployeeInfo(userId?: string) {
    this.employeeService.getEmployee().subscribe(
      employees => {
        this.employeeList = employees;
        this.isTable1Empty = this.employeeList.length === 0; // Subaybayan kung walang nakapagpapakita sa table1

        if (userId) {
          this.selectedEmployee = this.employeeList.find(emp => emp.id === +userId) || null;
        } else if (this.employeeList.length > 0) {
          this.selectedEmployee = this.employeeList[0];
        } else {
          this.selectedEmployee = null;
        }

        if (this.selectedEmployee) {
          this.fetchLoginSessions(this.selectedEmployee);
        } else {
          this.loginSessions = [];
        }
      },
      error => {
        console.error('Error fetching employees:', error);
      }
    );
  }

  fetchLoginSessions(employee: Employee) {
    this.accessLogService.getAccessLogsByEmployeeId(employee.id)
      .subscribe(
        accessLogs => {
          this.loginSessions = accessLogs.map(log => ({
            date: new Date(log.accessDateTime).toLocaleDateString(),
            time: new Date(log.accessDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));

          this.filterEmployeesByDate(); // Filter employees based on selected date

          console.log('Updated login sessions:', this.loginSessions);
          this.loading = false;
        },
        error => {
          console.error('Error fetching access logs:', error);
        }
      );
  }
  filterEmployeesByDate() {
    if (this.selectedDate) {
      this.filteredEmployees = this.employeeList.filter(employee =>
        employee.accessLogs && employee.accessLogs.some(log =>
          new Date(log.accessDateTime).toLocaleDateString() === this.selectedDate
        )
      );
    } else {
      this.filteredEmployees = this.employeeList; // Show all employees if no date is selected
    }
  }


  handleEmployeeSelected(employee: Employee) {
    this.selectedEmployee = employee;
    this.fetchLoginSessions(employee);
  }

  onSearchChanged(searchTerm: string) {
    // Filter employees whose names start with the search term
    if (searchTerm) {
      this.filteredEmployees = this.employeeList.filter(employee =>
        employee.fullname.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    } else {
      this.filteredEmployees = [...this.employeeList]; // Reset to all employees if search term is empty
    }

  }


  onDateChanged(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.selectedDate = event.value.toLocaleDateString();
    } else {
      this.selectedDate = '';
    }

    if (this.selectedEmployee) {
      this.fetchLoginSessions(this.selectedEmployee);
    }
  }



  onSortChange() {
    console.log('Sort option changed:', this.sortOption); // Debugging log
    this.sortOptionReportsChanged.emit(this.sortOption);

    // Optional: you might also update the service or trigger other actions if needed
    this.employeeService.setSortOption(this.sortOption);
  }


  toggleFilter() {
    this.filterToggle = !this.filterToggle;

  }

  selectName() {
    console.log("Name filter selected")
    this.selectedReportsFilter = 'name';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectRole() {
    console.log("Role filter selected")
    this.selectedReportsFilter = 'role';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectRfid() {
    console.log("Rfid filter selected")
    this.selectedReportsFilter = 'rfid';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectFingerprint() {
    console.log("Fingerprint filter selected")
    this.selectedReportsFilter = 'fingerprint';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectBranch(){
    console.log("Branch filter selected")
    this.selectedReportsFilter = 'branch';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }
  
  ngOnDestroy(): void {
    // Clear the title when navigating away from this component
    this.headerLabelService.clearDescription();
  }
}
