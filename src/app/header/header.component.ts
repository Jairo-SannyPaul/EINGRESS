import { Component, HostListener, ElementRef, Renderer2, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminpopupComponent } from '../adminpopup/adminpopup.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isActive = false;
  isDropdownOpen = false;
  isNotificationOpen = false;
  username: string = '';

  constructor(private elRef: ElementRef, public dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    // Retrieve the username from localStorage
    this.username = localStorage.getItem('username') || 'Admin';  // Default to 'Admin' if username is not found
  }

  openDialog(): void {
    this.dialog.open(AdminpopupComponent, {
    width: '450px', 
    height: '700px',
    disableClose: false
    });

    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!this.elRef.nativeElement.contains(target)) {
      this.isDropdownOpen = false;
      this.isActive = false;
    }
  }

  // Method to toggle notification dropdown visibility
  toggleNotificationDropdown(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  // Method to handle 'See previous notifications' button click
  viewPreviousNotifications(): void {
    console.log('Navigating to previous notifications...');
    // Add logic to navigate or show previous notifications here
  }

  toggleActive(event: MouseEvent) {
    // this.isActive = !this.isActive;
    // this.isDropdownOpen = this.isActive; 
    this.router.navigateByUrl('/main/admin')
  }
}