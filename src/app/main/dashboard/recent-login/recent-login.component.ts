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
  recentLogins: [] = [];
  baseUrl = this.employeeService.apiUrl;
  constructor(private employeeService: EmployeeService, private router: Router) {
    this.findRecentLoginEmployee();
  }

  findRecentLoginEmployee(): void {
    this.employeeService.getEmployee().subscribe(
        (employees: Employee[]) => {
            console.log('Fetched Employees:', employees);

            const currentDate = new Date().toLocaleDateString();
            const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

            // Filter employees who logged in today
            const recentLoginEmployees = employees.filter(employee => {
                if (employee.lastlogdate) {
                    const lastLoginDate = new Date(employee.lastlogdate);
                    return lastLoginDate.toLocaleDateString() === currentDate;
                }
                return false;
            });

            // Sort employees by last login time (most recent first)
            recentLoginEmployees.sort((a, b) => {
                const lastLoginA = a.lastlogdate ? new Date(a.lastlogdate).getTime() : 0; // Default to 0 if undefined
                const lastLoginB = b.lastlogdate ? new Date(b.lastlogdate).getTime() : 0; // Default to 0 if undefined
                return lastLoginB - lastLoginA; // Sort in descending order
            });

            // Extract the most recent login employee
            this.recentLogin = recentLoginEmployees.length > 0 ? recentLoginEmployees[0] : null;

            // Optional: Format the last login time for display if needed
            if (this.recentLogin && this.recentLogin.lastlogdate) {
                const lastLoginTime = new Date(this.recentLogin.lastlogdate);
                const formattedTime = lastLoginTime.toLocaleTimeString([], timeOptions);
                const formattedDate = lastLoginTime.toLocaleDateString();
                console.log('Most Recent Login:', {
                    name: this.recentLogin.fullname,
                    date: formattedDate,
                    time: formattedTime
                });
            } else {
                console.log('No recent logins found for today.');
            }
        },
        error => {
            console.error('Error fetching employees:', error);
        }
    );
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
