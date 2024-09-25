import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { AccessLogService } from 'src/app/services/access-log.service';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { combineLatest } from 'rxjs';
import { AccessLog } from 'src/app/interface/access-log.interface';
import { Employee } from 'src/app/interface/employee.interface';
import { ErrorLog } from 'src/app/interface/error-log.interface';


@Component({
  selector: 'app-header-bell',
  templateUrl: './header-bell.component.html',
  styleUrls: ['./header-bell.component.css']
})
export class HeaderBellComponent {
  recentAlerts: { type: string, message: string, timestamp: string }[] = []; // Ensure this is present
  matchedEmployees: Employee[] = [];
  maxEmployeesDisplayed: number = 100;
  isNotificationOpen = false;
  isPreviousNotificationsView = false;
  hasNewAlerts: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private accessLogService: AccessLogService,
    private errorLogService: ErrorLogService
  ) { }

  ngOnInit(): void {
  //   this.recentAlerts = [
  //     { type: 'login', message: 'Test User has entered the building at 10:00 AM' },
  //     { type: 'error', message: 'Unregister: Someone is trying to enter.' }
  // ];
    this.loadRecentAlerts();
    // Check if there is a stored value for hasNewAlerts in local storage
    const storedHasNewAlerts = localStorage.getItem('hasNewAlerts');
    this.hasNewAlerts = storedHasNewAlerts === 'true'; // Set from local storage
  }

  // Method to toggle notification dropdown visibility
  toggleNotificationDropdown(): void {
    if (this.isNotificationOpen) {
      // If closing, reset the previous notifications view
      this.isPreviousNotificationsView = false;
    } else {
      // If opening, only set hasNewAlerts to false if there are new alerts
      if (this.hasNewAlerts) {
        this.hasNewAlerts = false;
        localStorage.setItem('hasNewAlerts', 'false'); // Update local storage
      }
    }
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  // Method to handle 'See previous notifications' button click
  viewPreviousNotifications(): void {
    this.isPreviousNotificationsView = true;
    console.log('Navigating to previous notifications...');
    // Add logic to navigate or show previous notifications here
  }

  loadRecentAlerts() {
    this.errorLogService.getErrorLogs().subscribe(
        (errorLogs: ErrorLog[]) => {
            const currentDate = new Date().toLocaleDateString();
            
            // Process error logs
            const errorLogAlerts = errorLogs
                .filter(log => new Date(log.timestamp!).toLocaleDateString() === currentDate)
                .map(log => {
                    const timestamp = log.timestamp || '';
                    let message: string;

                    // Transform error log messages into alerts
                    if (log.message === 'Employee not found.') {
                        message = `Unregister`;
                    } else if (log.message === 'Error Fingerprint not match:') {
                        message = `Unauthorized Bio`;
                    } else {
                        message = log.message; // Catch-all for other messages
                    }

                    return { type: 'error', message: message, timestamp: timestamp };
                });

                const previousAlertCount = this.recentAlerts.length;


            // Sort the logs by timestamp (most recent first)
            this.recentAlerts = errorLogAlerts
                .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
                .slice(0, 100) // Limit to 100 most recent alerts
                .map(alert => ({
                    type: alert.type,
                    message: alert.message,
                    timestamp: alert.timestamp
                }));

              // Check for new alerts
              this.hasNewAlerts = this.recentAlerts.some(alert =>
                alert.message === 'Unregister' || alert.message === 'Unauthorized Bio'
              );

              // Update local storage for hasNewAlerts
              localStorage.setItem('hasNewAlerts', String(this.hasNewAlerts));

            console.log(this.recentAlerts); // Debugging: Logs the processed alerts
        },
        error => {
            console.error('Error fetching error logs:', error);
        }
    );
}

  filterAndSortAlerts(alerts: { type: string, message: string, timestamp?: string }[]): { type: string, message: string }[] {
    return alerts
      .filter(alert => alert.timestamp) // Ensure timestamp exists
      .sort((a, b) => {
        const timeA = new Date(a.timestamp!).getTime();
        const timeB = new Date(b.timestamp!).getTime();
        return timeB - timeA; // Most recent first
      })
      .map(alert => ({
        type: alert.type,
        message: alert.message
      }));
  }

  getMostRecentAccessTime(employee: Employee): Date {
    const accessTimes = employee.accessLogs?.map(log => new Date(log.accessDateTime)) || [];
    return accessTimes.reduce((mostRecent, current) => (current > mostRecent ? current : mostRecent), new Date(0));
  }

  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const timeDiffInSeconds = Math.floor((now.getTime() - alertTime.getTime()) / 1000);

    if (timeDiffInSeconds < 3600) {
      const minutes = Math.floor(timeDiffInSeconds / 60);
      return minutes === 1 ? '1m ago' : `${minutes}m ago`;
    } else if (timeDiffInSeconds < 86400) {
      const hours = Math.floor(timeDiffInSeconds / 3600);
      return hours === 1 ? '1h ago' : `${hours}h ago`;
    } else {
      const days = Math.floor(timeDiffInSeconds / 86400);
      return days === 1 ? '1day ago' : `${days}days ago`;
    }
  }

  // ----USE THIS IF THEY WANT SECONDS TO BE SEEN----
  // if (timeDiffInSeconds < 60) {
  //   return timeDiffInSeconds === 1 ? '1 second ago' : `${timeDiffInSeconds} seconds ago`;
  // } else if (timeDiffInSeconds < 3600) {
  //   const minutes = Math.floor(timeDiffInSeconds / 60);
  //   return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  // } else if (timeDiffInSeconds < 86400) {
  //   const hours = Math.floor(timeDiffInSeconds / 3600);
  //   return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  // } else {
  //   const days = Math.floor(timeDiffInSeconds / 86400);
  //   return days === 1 ? '1 day ago' : `${days} days ago`;
  // }
  
}
