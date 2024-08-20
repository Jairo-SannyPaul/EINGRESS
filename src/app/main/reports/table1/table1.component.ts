import { Component, ChangeDetectorRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';
import { startWith, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { AccessLogService } from 'src/app/services/access-log.service';

@Component({
  selector: 'app-table1',
  templateUrl: './table1.component.html',
  styleUrls: ['./table1.component.css']
})
export class Table1Component implements OnInit {
  baseUrl = this.employeeService.apiUrl;
  filteredEmployees: Employee[] = [];
  @Input() employees: Employee[] = [];
  @Output() employeeSelected = new EventEmitter<Employee>();
  selectedEmployee: Employee | null = null;
  loginSessions: { accessDateTime: Date, date: string, time: string }[] = []; // Initialize as empty array
  noEmployeesFound: boolean = false; // Variable to track if no employees are found
  sortOption: string = 'nameAsc';
  @Input() selectedFilter: string = 'name';  // Selected filter input
  cdr: any;
  private sortOptionSubscription: Subscription | undefined;
  searchSubscription: any;
  reloadSubscription: any;
  constructor(
    private employeeService: EmployeeService,
    private accessLogService: AccessLogService
  ) {}

  ngOnInit() {
    this.loadEmployeeInfo();

    this.reloadSubscription = this.employeeService.reload$.subscribe(() => {
      this.loadEmployeeInfo(); // Refresh employee info when reload is triggered
    });

    this.sortOptionSubscription = this.employeeService.sortOption$.subscribe(sortOption => {
      this.sortOption = sortOption;
      this.sortEmployees(this.sortOption);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sortOption']) {
      console.log('Sort option changed:', this.sortOption);
      this.sortEmployees(this.sortOption);
    }
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.reloadSubscription.unsubscribe();
  }

  loadEmployeeInfo() {
    this.employeeService.searchUserTrigger$.pipe(
      startWith(''),
      switchMap(searchInputValue => {
        return searchInputValue.trim()
          ? this.employeeService.searchEmployee(searchInputValue) // Pass selectedFilter here
          : this.employeeService.getEmployee();
      })
    ).subscribe(employees => {
      this.employees = employees;
      this.filteredEmployees = [...this.employees];
      this.sortEmployees(this.sortOption); // Sort employees after loading
    });
  }

  sortEmployees(sortOption: string) {
    switch (sortOption) {
      case 'nameAsc':
        this.filteredEmployees.sort((a, b) => a.fullname.localeCompare(b.fullname));
        break;
      case 'nameDsc':
        this.filteredEmployees.sort((a, b) => b.fullname.localeCompare(a.fullname));
        break;
      case 'roleAsc':
        this.filteredEmployees.sort((a, b) => {
          if (a.role === b.role) {
            return a.fullname.localeCompare(b.fullname);
          }
          return a.role.localeCompare(b.role);
        });
        break;
      case 'roleDsc':
        this.filteredEmployees.sort((a, b) => {
          if (a.role === b.role) {
            return b.fullname.localeCompare(a.fullname);
          }
          return b.role.localeCompare(a.role);
        });
        break;
        case 'branch':
        this.filteredEmployees.sort((a, b) => {
          if (a.branch === b.branch) {
            return a.fullname.localeCompare(b.fullname);
          }
          return a.branch.localeCompare(b.branch);
        });
        break;
        case 'logAsc':
          this.filteredEmployees.sort((a, b) => {
            const dateA = a.lastlogdate
              ? new Date(a.lastlogdate.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$1-$2T$4:$5:$6'))
              : new Date(0);
            const dateB = b.lastlogdate
              ? new Date(b.lastlogdate.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$1-$2T$4:$5:$6'))
              : new Date(0);
            return dateB.getTime() - dateA.getTime(); // Most recent first
          });
          break;
      }
  }

  onSortChange(sortOption: string) {
    this.sortOption = sortOption;
    this.sortEmployees(this.sortOption);
  }

  selectEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.employeeSelected.emit(employee);

    // Fetch access logs for the selected employee
    this.accessLogService.getAccessLogsByEmployeeId(employee.id)
      .subscribe(
        accessLogs => {
          this.loginSessions = accessLogs.map(log => ({
            accessDateTime: new Date(log.accessDateTime),
            date: new Date(log.accessDateTime).toLocaleDateString(),
            time: new Date(log.accessDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          console.log('Updated login sessions:', this.loginSessions);
        },
        error => {
          console.error('Error fetching access logs:', error);
        }
      );
  }
}
