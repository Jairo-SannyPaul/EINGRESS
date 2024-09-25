import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interface/user.interface';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
  selector: 'app-header-profile',
  templateUrl: './header-profile.component.html',
  styleUrls: ['./header-profile.component.css']
})
export class HeaderProfileComponent implements OnInit {
  currentUsername: string = '';
  currentAdmin!: number;

  constructor(private router: Router, private userService: UserService, private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.employeeService.reload$.subscribe(() => {
      this.reloadHeader(); // Call method to reload header data
    });
    this.currentAdmin = this.userService.currentUserId;
    if (this.currentAdmin) {
      this.loadHeaderData();
    }
  }

  reloadHeader() {
    this.loadHeaderData();
  }

  loadHeaderData() {
    this.userService.getUserById(this.currentAdmin).subscribe({
      next: (user: User) => {
        this.currentUsername = user.username || "Admin";
      },
      error: (err) => {
        console.error('Failed to fetch user details', err);
      }
    });
  }

  toggleActive(event: MouseEvent) {
    // this.isActive = !this.isActive;
    // this.isDropdownOpen = this.isActive; 
    this.router.navigateByUrl('/main/admin')
  }
}
