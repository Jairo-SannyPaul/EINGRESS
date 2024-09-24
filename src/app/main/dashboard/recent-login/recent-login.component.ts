import { Component } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/interface/employee.interface';
import { Router } from '@angular/router';


@Component({
  selector: 'app-recent-login',
  templateUrl: './recent-login.component.html',
  styleUrls: ['./recent-login.component.css']
})
export class RecentLoginComponent {
  recentLogin: Employee | null = null;
  baseUrl = this.employeeService.apiUrl;
  constructor(private employeeService: EmployeeService, private router: Router) {
    this.findRecentLoginEmployee();
  }

  findRecentLoginEmployee(): void {
    this.employeeService.getEmployee().subscribe((employees: Employee[]) => {
      console.log('Fetched Employees:', employees);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0); // Start of today
      const endOfDay = new Date(today);
      endOfDay.setUTCHours(23, 59, 59, 999); // End of today
  
      let recentLoginEmployee: Employee | null = null;
  
      employees.forEach((employee: Employee) => {
        if (employee.lastlogdate) {
          const lastLoginDateTime = new Date(employee.lastlogdate);
          // Check if the last login date is today
          if (lastLoginDateTime >= today && lastLoginDateTime <= endOfDay) {
            recentLoginEmployee = employee;
          }
        }
      });
  
      this.recentLogin = recentLoginEmployee || null;
      console.log('Recent Login:', this.recentLogin);
    });
  }
  

  getProfileImage(employee: Employee | null): string {
    // Check if selectedEmployee exists and has a profileImage
    if (employee && employee.profileImage) {
      // Assuming profile image URL is relative to the base URL
      // return `http://localhost:3000/api/employee/profile-image/${employee.profileImage}`;
      return `${this.baseUrl}/profile-image/${employee.profileImage}`;
    } else {
      // Default profile image URL
      return '/assets/images/default-profile.svg'; // Replace with your default image path
    }
  }

  navigateToReports(): void {
    if (this.recentLogin) {
      this.router.navigate(['/main/reports'], {
        queryParams: { userId: this.recentLogin.id, fullName: this.recentLogin.fullname }
      });
    }
  }  
}
