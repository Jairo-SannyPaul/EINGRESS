import { Component, EventEmitter, Input, ViewChild, } from '@angular/core';
import { UserSelectionComponent } from './user-selection/user-selection.component';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { EmployeeService } from 'src/app/services/employee.service';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})

export class TableComponent  {
  registered: boolean = true;
  unregistered: boolean = false;
  showStatusSelection: boolean = false;
  @Input() sortOption: string = '';
  @ViewChild(EmployeeDetailsComponent) employeeDetailsComponent!: EmployeeDetailsComponent; 
  deleteMode: boolean = false;

  constructor(private employeeService: EmployeeService) {}
  onEmployeeSelected(employee: Employee){
    this.employeeDetailsComponent.showEmployeeDetails(employee);
  }

  ngOnInit() {
    // Subscribe to deleteMode from the service
    this.employeeService.deleteMode$.subscribe((mode: boolean) => {
      this.deleteMode = mode;
    });
  }

  isStatusClicked: boolean = false; // Track the SVG state

  toggleShowStatus() {
    this.showStatusSelection = !this.showStatusSelection;
    // this.isStatusClicked = !this.isStatusClicked;
  }
  
  toggleRegistered(){
    this.registered = true;
    this.unregistered = false;
  }

  toggleUnregistered(){
    this.registered = false;
    this.unregistered = true;
  }
}
