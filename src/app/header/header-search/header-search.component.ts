import { Component, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/interface/employee.interface'; // Make sure the Employee interface is imported
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-search',
  templateUrl: './header-search.component.html',
  styleUrls: ['./header-search.component.css']
})

export class HeaderSearchComponent {
  @Input() showFilterButton: boolean = false;
  @Output() searchEvent = new EventEmitter<string>();

  showDropdown = false;
  options: string[] = [];
  filteredOptions: { fullname: string; rfid: string }[] = [];
  inputValue: string = '';
  noResultsFound: boolean = false;

  private searchSubscription: Subscription = new Subscription(); // Subscription to handle search

  constructor(private employeeService: EmployeeService) {}

  // Filter options based on input
  filterOptions(event: Event): void {
    this.inputValue = (event.target as HTMLInputElement).value; // Update input value

    if (this.inputValue.length > 0) {
      // Call the service to fetch filtered employee names
      this.searchSubscription = this.employeeService.searchEmployee(this.inputValue).subscribe((employees: Employee[]) => {
        // Map the result to employee full names
        this.filteredOptions = employees.map(employee => ({
          fullname: employee.fullname,
          rfid: employee.rfidtag || 'No RFID'  // Display 'No RFID' if the employee has no RFID tag
        }));

        // If there are no matches, show 'No results found'
        this.noResultsFound = this.filteredOptions.length === 0;

        // Show dropdown if there are filtered options or no results
        this.showDropdown = this.filteredOptions.length > 0 || this.noResultsFound;
      });
    } else {
      this.filteredOptions = [];
      this.showDropdown = false; // Hide dropdown if there's no input
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

    // Check if the click was outside the input and dropdown
    if (target !== inputField && !dropdown.contains(target)) {
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
