import { Component, Input, OnChanges, OnInit, Output, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-employee-details-revamp',
  templateUrl: './employee-details-revamp.component.html',
  styleUrls: ['./employee-details-revamp.component.css']
})
export class EmployeeDetailsRevampComponent {
  updateEmployeeForm!: FormGroup;
  employeeDetails!: Employee | undefined;
  hasVal: boolean = false;
  added!: boolean;
  route: any;
  constructor(
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder
  ){
    this.updateEmployeeForm = this.formBuilder.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      profileImage: [''],
      phone: ['', Validators.required],
      rfidtag: [''],
      fingerprint1: [''],
      fingerprint2: [''],
      branch: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.employeeService.selectedEmployee$.subscribe((employee) => {
      if (employee) {
        this.showEmployeeDetails(employee);
      }
    });
    
    this.route.queryParams.subscribe((params: { [x: string]: any; }) => {
      const userId = params['userId'];
      if (userId) {
        this.loadEmployeeDetails(userId);
      }
    });
  }

    loadEmployeeDetails(userId: string): void {
    this.employeeService.getEmployeeById(userId).subscribe(employee => {
      this.employeeDetails = employee;
      this.updateEmployeeForm.patchValue(employee);
    }, error => {
      console.error('Error fetching employee details:', error);
    });
  }



  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.exitUpdateModal();
      console.log("esc clicked");
    }
  }
  exitUpdateModal(){
    this.employeeService.closeUpdateModal();
  }

  showEmployeeDetails(employee: Employee): void {
    console.log("patching values: ", employee )
    console.log(employee);
    this.updateEmployeeForm.patchValue({
      fullname: employee.fullname,
      email: employee.email,
      role: employee.role,
      phone: employee.phone,
      rfidtag: employee.rfidtag,
      fingerprint1: employee.fingerprint1,
      fingerprint2: employee.fingerprint2,
      branch: employee.branch
    });
    this.employeeDetails = employee;
  
    const fingerprint2Value = this.updateEmployeeForm.get('fingerprint2')?.value;
    if (fingerprint2Value) {
      this.hasVal = true;
      this.added = true;
    }
  }
}
