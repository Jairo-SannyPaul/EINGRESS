import { Component, HostListener, ElementRef, Renderer2, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { AdminpopupComponent } from '../adminpopup/adminpopup.component';
import { HeaderLabelService } from '../services/header-label.service';
import { EmployeeService } from '../services/employee.service';
import { FiltersService } from '../services/filters.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isActive = false;
  isDropdownOpen = false;
  isNotificationOpen = false;
  showFilterButton: boolean = false
  headerTitle: string = '';
  descriptionTitle: string = '';
  username: string = '';
  filterClick: boolean = false;
  activeFilter: string = 'name';
  constructor(
    private elRef: ElementRef, 
    public dialog: MatDialog, 
    private headerLabelService: HeaderLabelService, 
    private router: Router, 
    private employeeService: EmployeeService,
    private filtersService: FiltersService
   ) {}

  ngOnInit(): void {
    // Retrieve the username from localStorage
    this.username = localStorage.getItem('username') || 'Admin';  // Default to 'Admin' if username is not found

    // Subscribe to the title changes from the service
    this.headerLabelService.currentTitle.subscribe((title: string) => {
      this.headerTitle = title;
    });

    this.headerLabelService.currentDescription.subscribe((description: string | null) => {
      // Handle the case when the description is null
      if (description !== null) {
        this.descriptionTitle = description;
      } else {
        this.descriptionTitle = ''; // Set a default value or handle it accordingly
      }
    });
    

    this.employeeService.filterClick$.subscribe((value: boolean) => {
      this.filterClick = value;
      console.log('Filter clicked:', this.filterClick);
    });
 // Initialize the filter button based on the current URL when the component is loaded (page refresh)
  this.checkFilterButtonVisibility(this.router.url);

 // Subscribe to router events to handle navigation changes
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.checkFilterButtonVisibility(event.urlAfterRedirects);
    }
  });
}
  checkFilterButtonVisibility(url: string) {
    this.showFilterButton = url.includes('/reports') || url.includes('/users');
  }

  toggleFilter() {
    this.filterClick = !this.filterClick;
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
  
  toggleFilterOptions(): void {
    // Emit true when the filter is toggled
    // this.filterService.setFilterClick(true);
  }

// Update the filter functions to set the active filter
setNameFilter() {
  this.activeFilter = 'name';
  this.filtersService.setFilter('name');
}

setRoleFilter() {
  this.activeFilter = 'role';
  this.filtersService.setFilter('role');
}

setRFIDFilter() {
  this.activeFilter = 'rfid';
  this.filtersService.setFilter('rfid');
}

setBranchFilter() {
  this.activeFilter = 'branch';
  this.filtersService.setFilter('branch');
}

setFingerprintFilter() {
  this.activeFilter = 'fingerprint';
  this.filtersService.setFilter('fingerprint');
}

}