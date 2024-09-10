import { Component, HostListener, ElementRef, Renderer2, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminpopupComponent } from '../adminpopup/adminpopup.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isActive = false;
  isDropdownOpen = false;
  username: string = '';

  constructor(private elRef: ElementRef, public dialog: MatDialog) {}

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

  toggleActive(event: MouseEvent) {
    this.isActive = !this.isActive;
    this.isDropdownOpen = this.isActive; 
  }
}