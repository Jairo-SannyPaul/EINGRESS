import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-profile',
  templateUrl: './header-profile.component.html',
  styleUrls: ['./header-profile.component.css']
})
export class HeaderProfileComponent implements OnInit {
  username: string = '';

  ngOnInit(): void {
    // Retrieve the username from localStorage
    this.username = localStorage.getItem('username') || 'Admin';  // Default to 'Admin' if username is not found
  }
}
