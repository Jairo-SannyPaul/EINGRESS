import { Component, Output, EventEmitter, Input, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { FiltersService } from 'src/app/services/filters.service';

@Component({
  selector: 'app-reports-searchfield',
  templateUrl: './reports-searchfield.component.html',
  styleUrls: ['./reports-searchfield.component.css']
})
export class ReportsSearchfieldComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput') searchInput!: ElementRef;
  @Input() selectedReportsFilter: string = 'name'; 

  searchEmployee: string = '';
  isFocused: boolean = false;
  private reloadSubscription: Subscription = new Subscription();
  private searchValueSubscription: Subscription = new Subscription(); // Subscription for search value changes

  constructor(
    private employeeService: EmployeeService, 
    private route: ActivatedRoute,
    private filtersService: FiltersService
  ) { }

  ngOnInit() {
    this.reloadSubscription = this.employeeService.reload$.subscribe(() => {
      this.searchInput.nativeElement.value = "";
      this.searchEmployee = ""; // Clear searchEmployee too
    });

    // Subscribe to the searchValue observable
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
    if (this.searchValueSubscription) {
      this.searchValueSubscription.unsubscribe(); // Clean up subscription
    }
  }

  onSearchUserInputChanged() {
    this.searchEmployee = this.searchInput.nativeElement.value; // Get the latest value
    console.log("Input value: ", this.searchEmployee); // Log the current input value
    this.employeeService.triggerSearchUser(this.searchEmployee); // Trigger the search with the latest value
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
}
