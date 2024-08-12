import { Component, EventEmitter, Input, ViewChild, } from '@angular/core';
import { UserSelectionComponent } from './user-selection/user-selection.component';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  animations: [
    trigger('slideIn', [
      state('void', style({
        transform: 'translateY(-20px)', /* Start from above */
        opacity: 0
      })),
      state('*', style({
        transform: 'translateY(0)', /* End at original position */
        opacity: 1
      })),
      transition('void => *', [
        animate('0.2s ease-out')
      ]),
      transition('* => void', [
        animate('0.2s ease-in')
      ])
    ])
  ]
})

export class TableComponent  {
  @Input() sortOption: string = '';
  @ViewChild(EmployeeDetailsComponent) employeeDetailsComponent!: EmployeeDetailsComponent; 

  onEmployeeSelected(employee: Employee){
    this.employeeDetailsComponent.showEmployeeDetails(employee);
  }
}
