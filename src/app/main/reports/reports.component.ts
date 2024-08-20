import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { AccessLogService } from 'src/app/services/access-log.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ReportsSearchfieldComponent } from './reports-searchfield/reports-searchfield.component';
import { ActivatedRoute } from '@angular/router';
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
  constructor(
    private accessLogService: AccessLogService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.loadEmployeeInfo();
  }

  loadEmployeeInfo() {
    this.employeeService.getEmployee().subscribe(
      employees => {
        this.employeeList = employees;
        this.isTable1Empty = this.employeeList.length === 0; // Subaybayan kung walang nakapagpapakita sa table1

        if (this.employeeList.length > 0) {
          this.selectedEmployee = this.employeeList[0];
          this.fetchLoginSessions(this.selectedEmployee);
        } else {
          this.selectedEmployee = null; // Walang napiling empleyado kung walang nakapagpapakita sa table1
          this.loginSessions = []; // Walang nakapag-log in na sesyon kung walang nakapagpapakita sa table1
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
      // If no date is selected, show all employees
      this.filteredEmployees = this.employeeList;
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
    this.selectedReportsFilter = 'name';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectRole() {
    this.selectedReportsFilter = 'role';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectRfid() {
    this.selectedReportsFilter = 'rfid';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectFingerprint() {
    this.selectedReportsFilter = 'fingerprint';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

  selectBranch(){
    this.selectedReportsFilter = 'branch';
    this.employeeService.setFilterOption(this.selectedReportsFilter);
    this.reportsSearchFieldComponent.clearSearchField();
  }

}
