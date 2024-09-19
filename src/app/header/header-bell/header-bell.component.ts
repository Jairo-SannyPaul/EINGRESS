import { Component } from '@angular/core';

@Component({
  selector: 'app-header-bell',
  templateUrl: './header-bell.component.html',
  styleUrls: ['./header-bell.component.css']
})
export class HeaderBellComponent {
  isNotificationOpen = false;

  // Method to toggle notification dropdown visibility
  toggleNotificationDropdown(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  // Method to handle 'See previous notifications' button click
  viewPreviousNotifications(): void {
    console.log('Navigating to previous notifications...');
    // Add logic to navigate or show previous notifications here
  }
}
