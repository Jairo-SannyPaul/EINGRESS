import { Component, ChangeDetectorRef, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';
import { startWith, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { formatDate } from '@angular/common';
import { AddUserModalComponent } from '../../add-user-modal/add-user-modal.component';

@Component({
  selector: 'app-user-selection',
  templateUrl: './user-selection.component.html',
  styleUrls: ['./user-selection.component.css']
})
export class UserSelectionComponent implements OnInit, OnDestroy {


  baseUrl = this.employeeService.apiUrl;
  loading = true;
  employee!: Employee;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  currentPage: number = 1; // Active page
  totalPages: number = 1;  // Total number of pages
  itemsPerPage: number = 11; // Number of employees per page
  searchSubscription: Subscription | undefined;
  private reloadSubscription: Subscription = new Subscription();
  private sortOptionSubscription: Subscription | undefined;
  sortOption: string = 'nameAsc';
  deleteMode: boolean = false;
  checked: boolean = false;
  @Input() selectedFilter: string = 'name';  // Selected filter input
  @Output() employeeSelected = new EventEmitter<Employee>();

  constructor(
    private employeeService: EmployeeService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef properly
  ) { }

  ngOnInit() {
    this.employeeService.deleteMode$.subscribe(mode => {
      this.deleteMode = mode;
    });
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
          ? this.employeeService.searchEmployee(searchInputValue)
          : this.employeeService.getEmployee();
      })
    ).subscribe(employees => {
      this.employees = employees;
      this.filteredEmployees = [...this.employees];
      this.sortEmployees(this.sortOption); // Sort employees after loading

      this.updatePagination(); // Apply pagination after loading and sorting
      this.loading = false;
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page
    this.updatePaginatedEmployees();
  }

  updatePaginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Slice the sorted employees to get the current page's data
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedEmployees();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEmployees();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedEmployees();
    }
  }

  get totalPagesArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }
  // Call this method whenever the page changes
changePage(newPage: number) {
  this.currentPage = newPage;
  this.updatePaginatedEmployees(); // Refresh the displayed employees for the new page
}

  sortEmployees(sortOption: string) {
    // Step 1: Sort the full dataset
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
        default:
            console.warn(`Unknown sort option: ${sortOption}`);
            break;
    }
    
    // Step 2: Update pagination
    this.updatePaginatedEmployees();

    this.cdr.markForCheck(); // Mark for change detection
}


  onSortChange(sortOption: string) {
    this.sortOption = sortOption;
    this.sortEmployees(this.sortOption);
  }

  deleteEmployee() {

    // const selectedEmployeeIds = this.employees
    //   .filter(employee => employee.selected)
    //   .map(employee => employee.id);

    // if (selectedEmployeeIds.length > 0) {
    //   this.dialogService.openConfirmDialog('Do you want to Delete this user/s?', 'Cancel', 'Confirm').subscribe(confirmed => {
    //     if (confirmed) {
    //       this.employeeService.deleteEmployee(selectedEmployeeIds).subscribe(() => {
    //         this.loadEmployeeInfo(); // Refresh employee info after deletion
    //       });
    //     }
    //   });
    // }

    //soft-delete code:
    
    const selectedEmployeeIds = this.employees
    .filter(employee => employee.selected)
    .map(employee => employee.id);

  if (selectedEmployeeIds.length > 0) {
    this.dialogService.openConfirmDialog('Do you want to delete this user/s?', 'Cancel', 'Confirm')
      .subscribe(confirmed => {
        if (confirmed) {
          selectedEmployeeIds.forEach(id => {
            this.employeeService.deleteEmployee(id).subscribe(() => {
              this.loadEmployeeInfo(); // Refresh employee info after deletion
            });
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

  currentDate: string = formatDate(new Date(), 'MM/dd/yyyy', 'en-US'); // Format date to match lastlogdate format

  isActiveToday(employee: Employee): boolean {
    if (!employee.lastlogdate) return false;

    const employeeDate = formatDate(new Date(employee.lastlogdate), 'MM/dd/yyyy', 'en-US');
    return employeeDate === this.currentDate;
  }

  convertRegDate(dateInput: Date | undefined): string {
    if (!dateInput) return ''; // Return an empty string if date is undefined or null
    const date = new Date(dateInput);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleString('en-US', options);
  }


  convertLastLog(dateString: string | undefined): string {
    if (!dateString) return ''; // Handle undefined or empty input

    // Split date and time parts (MM/DD/YYYY and HH:MM:SS)
    const [datePart, timePart] = dateString.split(', ');

    // Split date part into month, day, and year
    const [month, day, year] = datePart.split('/').map(part => parseInt(part, 10));

    // Create a new Date object using the extracted parts
    const date = new Date(year, month - 1, day, ...timePart.split(':').map(part => parseInt(part, 10)));

    // Format the date as desired, e.g., "January 1, 2024, 12:00 PM"
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  toggleDeleteMode() {
    this.deleteMode = !this.deleteMode;
  }


  toggleSelection(employee: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked; // Store checked state
    console.log('Employee:', employee, 'Checked:', checked); // Log the employee and the checked state

    // Update the service with the checked state
    this.employeeService.updateCheckedState(checked);
  }
}