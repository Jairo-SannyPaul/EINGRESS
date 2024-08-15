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

  constructor(private router: Router, private dialogService: DialogService) {}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveSection();
      }
    });

    this.updateActiveSection();
  }

  toggleLock() {
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
      this.activeSection = 'reports';
    } else if (url.startsWith('/main/dashboard')) {
      this.activeSection = 'dashboard';
    } else if (url.startsWith('/main/users')) {
      this.activeSection = 'users';
    } else {
      this.activeSection = ''; 
    }
  }
}
