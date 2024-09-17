import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DialogService } from '../services/dialog.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  isLocked = false;
  activeSection: string = '';
  @Output() lockStateChange = new EventEmitter<boolean>();
  isHovered: boolean = false;
  constructor(private router: Router, private dialogService: DialogService) {}
  atDashboard: boolean = true;
  atReports: boolean = false;
  atUsers: boolean = false;

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveSection();
      }
    });

    this.updateActiveSection();
  }
  onHover() {
    
  }
  onUnhover() {
  
  }
  toggleLock() {
    this.isHovered = !this.isHovered ;
    this.isLocked = !this.isLocked;
    this.lockStateChange.emit(this.isLocked);
  }

  setActive(section: string) {
    this.activeSection = section;
  }

  logout() {
    this.dialogService.openConfirmDialog('Do you want to Logout?', 'No', 'Yes').subscribe(confirmed => {
      if (confirmed) {
        localStorage.removeItem('token');
        this.router.navigateByUrl('/login');
      }
    });
  }

  private updateActiveSection(): void {
    const url = this.router.url;
    if (url.startsWith('/main/reports')) {
      this.atDashboard = false;
      this.atReports = true;
      this.atUsers = false;
      this.activeSection = 'reports';
    } else if (url.startsWith('/main/dashboard')) {
      this.atDashboard = true;
      this.atReports = false;
      this.atUsers = false;
      this.activeSection = 'dashboard';
    } else if (url.startsWith('/main/users')) {
      this.atDashboard = false;
      this.atReports = false;
      this.atUsers = true;
      this.activeSection = 'users';
    } else {
      this.activeSection = ''; 
    }
  }
}
