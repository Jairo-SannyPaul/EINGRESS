import { Component, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reports-searchfield',
  templateUrl: './reports-searchfield.component.html',
  styleUrls: ['./reports-searchfield.component.css']
})
export class ReportsSearchfieldComponent {

  @ViewChild('searchInput') searchInput!: ElementRef;
  @Input() selectedReportsFilter: string = 'name'; 

  searchEmployee: string = '';
  isFocused: boolean = false;
  private reloadSubscription: Subscription = new Subscription();

  constructor(private employeeService: EmployeeService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.reloadSubscription = this.employeeService.reload$.subscribe(() => {
      this.searchInput.nativeElement.value = "";
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
    this.searchEmployee = this.searchInput.nativeElement.value;
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
}
