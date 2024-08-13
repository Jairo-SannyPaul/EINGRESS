import { Component, EventEmitter, Input, ViewChild, } from '@angular/core';
import { UserSelectionComponent } from './user-selection/user-selection.component';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})

export class TableComponent  {
  @Input() sortOption: string = '';
  @ViewChild(EmployeeDetailsComponent) employeeDetailsComponent!: EmployeeDetailsComponent; 

  onEmployeeSelected(employee: Employee){
    this.employeeDetailsComponent.showEmployeeDetails(employee);
  }
}
