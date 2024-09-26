import { Component, ElementRef, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FiltersService } from 'src/app/services/filters.service';

@Component({
  selector: 'app-searchfield',
  templateUrl: './searchfield.component.html',
  styleUrls: ['./searchfield.component.css']
})
export class SearchfieldComponent {

  @ViewChild('searchInput') searchInput!: ElementRef;
  @Input() selectedFilter: string = 'name';  // Accepts selectedFilter as an input

  searchEmployee: string = '';
  isFocused: boolean = false;
  private reloadSubscription: Subscription = new Subscription();
  private searchValueSubscription: Subscription = new Subscription(); // Subscription for search value changes


  constructor(private employeeService: EmployeeService, private route: ActivatedRoute, private filtersService: FiltersService) { }

  ngOnInit() {
    this.reloadSubscription = this.employeeService.reload$.subscribe(() => {
      this.searchInput.nativeElement.value = "";
    });

    this.searchValueSubscription = this.filtersService.searchValue$.subscribe(value => {
      this.searchEmployee = value; // Update searchEmployee with the value emitted from FiltersService
      this.searchInput.nativeElement.value = this.searchEmployee; // Set the input field value
      this.onSearchUserInputChanged(); // Trigger search based on new input
    });
  }

  ngAfterViewInit() {
    // Retrieve the full name from the query parameters
    this.route.queryParams.subscribe(params => {
      if (params['fullName']) {
        this.searchEmployee = params['fullName'];

        // Set the input value and manually trigger the search
        setTimeout(() => {
          this.searchInput.nativeElement.value = this.searchEmployee;
          this.onSearchUserInputChanged();  
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.reloadSubscription) {
      this.reloadSubscription.unsubscribe();
    }
  }
  onSearchUserInputChanged() {
    this.searchEmployee = this.searchInput.nativeElement.value; // Get the latest value
    console.log("Input value: ", this.searchEmployee); // Log the current input value
    this.employeeService.triggerSearchUser(this.searchEmployee);
  }

  onInputBlur() {
    if (!this.searchEmployee.trim()) {
      this.employeeService.triggerSearchUser('');
    }
  }

  toggleActive() {
    this.isFocused = !this.isFocused;
  }

  clearSearchField() {
    this.searchEmployee = '';
    this.searchInput.nativeElement.value = '';
    this.employeeService.triggerSearchUser('');
  }

  clearPlaceholder() {
    this.isFocused = true;
    this.searchInput.nativeElement.placeholder = '';
  }

  restorePlaceholder() {
    this.isFocused = false;
    if (!this.searchEmployee.trim()) {
      this.searchInput.nativeElement.placeholder = `Search ${this.selectedFilter}`;
    }
  }
}
