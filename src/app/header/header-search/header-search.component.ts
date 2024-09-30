import { Component, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/interface/employee.interface'; // Make sure the Employee interface is imported
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FiltersService } from 'src/app/services/filters.service';

@Component({
  selector: 'app-header-search',
  templateUrl: './header-search.component.html',
  styleUrls: ['./header-search.component.css']
})
export class HeaderSearchComponent {
  @Input() showFilterButton: boolean = false;
  @Output() searchEvent = new EventEmitter<string>();
  @Output() filterToggleEvent = new EventEmitter<boolean>();

  showDropdown = false;
  options: string[] = [];
  filteredOptions: { fullname: string; rfid: string }[] = [];
  inputValue: string = '';
  noResultsFound: boolean = false;
  filterToggle: boolean = false;  // New property to control filter visibility
  currentFilterState!: boolean;
  isDashboardState: boolean = false;
  isReportsState!: boolean;
  isUsersState!: boolean;

  private searchSubscription: Subscription = new Subscription(); // Subscription to handle search
  private filterClickSubscription: Subscription = new Subscription(); // Subscription for filter click

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private filtersService: FiltersService
  ) { }

  ngOnInit(): void {
    // Subscribe to the filterClick$ once in ngOnInit and track current filter state
    this.filterClickSubscription = this.employeeService.filterClick$.subscribe(currentValue => {
      this.filterToggle = currentValue;
    });

    // Initialize the filter search based on the current URL when the component is loaded (page refresh)
    this.changeSearchState(this.router.url);

    // Subscribe to router events to handle navigation changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.changeSearchState(event.urlAfterRedirects);
      }
    });
  }

  changeSearchState(url: string) {
    // Check if the current URL includes specific paths
    if (url.includes('/reports')) {
      this.employeeService.setFilterClick(false);
      this.isReportsState = true;
      this.isDashboardState = false;
      this.isUsersState = false;
      this.isDashboardState = false; // Set the flag for dashboard state
      this.filtersService.setFilter('reports');
      // Change the search state for reports
    } else if (url.includes('/dashboard')) {
      this.employeeService.setFilterClick(false);
      this.isReportsState = false;
      this.isDashboardState = true;
      this.isUsersState = false;
      this.isDashboardState = true; // Set the flag for dashboard state
      // Change the search state for dashboard
    } else if (url.includes('/users')) {
      this.employeeService.setFilterClick(false);
      this.isReportsState = false;
      this.isDashboardState = false;
      this.isUsersState = true;
      this.isDashboardState = false; // Set the flag for dashboard state
      // Change the search state for users
    }
  }

  // Toggle the visibility of filter options
  toggleFilterOptions(): void {
    // Toggle the value of filterClick using the current filter state
    this.employeeService.setFilterClick(!this.filterToggle);
  }


  // Update this method to emit the search value when in reports state
  filterOptions(event: Event): void {
    console.log("filterOptions called"); // Add this line
    this.inputValue = (event.target as HTMLInputElement).value;

    if (this.isDashboardState) {
      if (this.inputValue.length > 0) {
        // Call the service to fetch filtered employee names
        this.searchSubscription = this.employeeService.searchEmployee(this.inputValue).subscribe((employees: Employee[]) => {
          this.filteredOptions = employees.map(employee => ({
            fullname: employee.fullname,
            rfid: employee.rfidtag || 'No RFID'
          }));

          this.noResultsFound = this.filteredOptions.length === 0;
          this.showDropdown = this.filteredOptions.length > 0 || this.noResultsFound;
        });
      }
    } 
    else if (this.isReportsState) {
      this.filtersService.setSearchValue(this.inputValue); // Pass the input value
    }
    else if (this.isUsersState) {
      this.filtersService.setSearchValue(this.inputValue); // Pass the input value
    }
    else {
      this.filteredOptions = [];
      this.showDropdown = false;
      this.noResultsFound = false;
    }
  }

  // Handle input focus to control dropdown visibility
  handleFocus(): void {
    // Show dropdown only if there is input
    if (this.inputValue.length > 0) {
      this.showDropdown = this.filteredOptions.length > 0 || this.noResultsFound;
    }
  }

  // Select an option from the dropdown
  selectOption(option: { fullname: string; rfid: string }) {
    this.inputValue = option.fullname;  // Optionally, set the input to the clicked option's fullname
    this.showDropdown = false;          // Hide the dropdown once an option is selected
    this.searchEvent.emit(option.fullname); // Emit the selected fullname, or you can emit the entire option if needed
  }

  // Hide dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const inputField = document.querySelector('.search-field input') as HTMLElement;
    const dropdown = document.querySelector('.dropdown') as HTMLElement;

    // Check if dropdown is not null before using it
    if (dropdown && target !== inputField && !dropdown.contains(target)) {
      this.showDropdown = false; // Hide dropdown
    } else if (target === inputField) {
      // Do not show dropdown if input is empty
      this.showDropdown = this.inputValue.length > 0 && (this.filteredOptions.length > 0 || this.noResultsFound);
    }
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
