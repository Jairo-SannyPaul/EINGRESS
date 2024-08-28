import { Component, ChangeDetectorRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';
import { startWith, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-user-selection',
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.css']
})
export class UserSelectionComponent implements OnInit, OnDestroy {
  baseUrl = this.employeeService.apiUrl;
  loading = true;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchSubscription: Subscription | undefined;
  private reloadSubscription: Subscription = new Subscription();
  private sortOptionSubscription: Subscription | undefined;
  sortOption: string = 'nameAsc';
  @Input() selectedFilter: string = 'name';  // Selected filter input
  @Output() employeeSelected = new EventEmitter<Employee>();

  constructor(
    private employeeService: EmployeeService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef properly
  ) { }

  ngOnInit() {
    this.loadEmployeeInfo();

    this.employeeService.deletedClicked$.subscribe(() => {
      this.deleteEmployee();
    });

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
      this.loading = false;
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
      case 'branchAsc':
        this.filteredEmployees.sort((a, b) => {
          if (a.branch === b.branch) {
            return a.fullname.localeCompare(b.fullname);
          }
          return a.branch.localeCompare(b.branch);
        });
        break;
      case 'branchDsc':
        this.filteredEmployees.sort((a, b) => {
          if (a.branch === b.branch) {
            return b.fullname.localeCompare(a.fullname);
          }
          return b.branch.localeCompare(a.branch);
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
      case 'bio':
        this.filteredEmployees.sort((a, b) => {
          const aHasBio = (a.fingerprint1 && a.fingerprint1.trim() !== '') || (a.fingerprint2 && a.fingerprint2.trim() !== '');
          const bHasBio = (b.fingerprint1 && b.fingerprint1.trim() !== '') || (b.fingerprint2 && b.fingerprint2.trim() !== '');

          if (aHasBio && !bHasBio) return -1; // `a` has bio data, `b` does not
          if (!aHasBio && bHasBio) return 1;  // `b` has bio data, `a` does not
          return 0; // If both have or both don't have bio data, keep current order
        });
        break;
      case 'noBio':
        this.filteredEmployees.sort((a, b) => {
          const aHasBio = (a.fingerprint1 && a.fingerprint1.trim() !== '') || (a.fingerprint2 && a.fingerprint2.trim() !== '');
          const bHasBio = (b.fingerprint1 && b.fingerprint1.trim() !== '') || (b.fingerprint2 && b.fingerprint2.trim() !== '');

          if (aHasBio && !bHasBio) return 1;  // `a` has bio data, `b` does not
          if (!aHasBio && bHasBio) return -1; // `b` has bio data, `a` does not
          return 0; // If both have or both don't have bio data, keep current order
        });
        break;
    }
    this.cdr.markForCheck();
  }


  onSortChange(sortOption: string) {
    this.sortOption = sortOption;
    this.sortEmployees(this.sortOption);
  }

  deleteEmployee() {
    const selectedEmployeeIds = this.employees
      .filter(employee => employee.selected)
      .map(employee => employee.id);

    if (selectedEmployeeIds.length > 0) {
      this.dialogService.openConfirmDialog('Do you want to Delete this user/s?', 'Cancel', 'Confirm').subscribe(confirmed => {
        if (confirmed) {
          this.employeeService.deleteEmployee(selectedEmployeeIds).subscribe(() => {
            this.loadEmployeeInfo(); // Refresh employee info after deletion
          });
        }
      });
    }
  }

  selectedEmployee(employee: Employee) {
    this.employeeSelected.emit(employee);
  }


  hasBio(employee: Employee): boolean {
    return !!((employee.fingerprint1 && employee.fingerprint1.trim() !== '') || (employee.fingerprint2 && employee.fingerprint2.trim() !== ''));
  }

}
