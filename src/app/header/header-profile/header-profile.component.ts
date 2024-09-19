import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-profile',
  templateUrl: './header-profile.component.html',
  styleUrls: ['./header-profile.component.css']
})
export class HeaderProfileComponent implements OnInit {
  username: string = '';

  constructor(private router: Router){}

  ngOnInit(): void {
    // Retrieve the username from localStorage
    this.username = localStorage.getItem('username') || 'Admin';  // Default to 'Admin' if username is not found
  }

  toggleActive(event: MouseEvent) {
    // this.isActive = !this.isActive;
    // this.isDropdownOpen = this.isActive; 
    this.router.navigateByUrl('/main/admin')
  }
}
