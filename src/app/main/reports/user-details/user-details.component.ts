import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Employee } from 'src/app/interface/employee.interface';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent {
  constructor(private employeeService: EmployeeService, private router: Router) {
  }
  @Input() selectedEmployee: Employee | null = null;
  baseUrl = this.employeeService.apiUrl;
  getProfileImage(employee: Employee | null): string {
    // Check if selectedEmployee exists and has a profileImage
    if (employee && employee.profileImage) {
      // Assuming profile image URL is relative to the base URL
      return `${this.baseUrl}/profile-image/${employee.profileImage}`;
    } else {
      // Default profile image URL
      return '/assets/images/default-profile-image.png'; // Replace with your default image path
    }
  }

  navigateToReports() {
    if (this.selectedEmployee) {
      this.router.navigate(['/main/reports'], {
        queryParams: { userId: this.selectedEmployee.id }
      });
    }
  }

  navigateToEmployeeDetails() {
    if (this.selectedEmployee) {
      this.router.navigate(['/main/users'], {
        queryParams: { userId: this.selectedEmployee.id }
      });
    }
  }
  
}
