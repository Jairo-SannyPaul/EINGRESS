import { Component, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmployeeService } from 'src/app/services/employee.service';

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

  constructor(private employeeService: EmployeeService) { }

  ngOnInit() {
    this.reloadSubscription = this.employeeService.reload$.subscribe(() => {
      this.searchInput.nativeElement.value = "";
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
}
