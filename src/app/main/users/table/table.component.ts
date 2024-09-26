import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { UserSelectionComponent } from './user-selection/user-selection.component';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { EmployeeService } from 'src/app/services/employee.service';
import { EmployeeDetailsRevampComponent } from './employee-details-revamp/employee-details-revamp.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent {
  registered: boolean = true;
  unregistered: boolean = false;
  showStatusSelection: boolean = false;
  @Input() sortOption: string = '';
  @Output() statusChanged = new EventEmitter<string>(); // Emit status changes
  @ViewChild(EmployeeDetailsComponent) employeeDetailsComponent!: EmployeeDetailsComponent; 
  deleteMode: boolean = false;
  private employeeUpdate!: EmployeeDetailsRevampComponent
  constructor(private employeeService: EmployeeService, private route: ActivatedRoute ) {}

  onEmployeeSelected(employee: Employee) {
    console.log("Selected Employee")
    // this.employeeDetailsComponent.showEmployeeDetails(employee);
    this.employeeService.setSelectedEmployee(employee);
    this.employeeService.openUpdateModal();
    
  }

  ngOnInit() {
    this.employeeService.deleteMode$.subscribe((mode: boolean) => {
      this.deleteMode = mode;
    });

    this.route.queryParams.subscribe(params => {
      if (params['status'] === 'registered') {
        this.toggleRegistered();
      }
    });
  }

  toggleShowStatus() {
    this.showStatusSelection = !this.showStatusSelection;
  }

  toggleRegistered() {
    this.registered = true;
    this.unregistered = false;
    this.statusChanged.emit('bio'); // Emit event with 'bio'
  }

  toggleUnregistered() {
    this.registered = false;
    this.unregistered = true;
    this.statusChanged.emit('noBio'); // Emit event with 'noBio'
  }
}
