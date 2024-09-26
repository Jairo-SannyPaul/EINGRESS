import { Component, OnInit } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
import { AccessLogService } from 'src/app/services/access-log.service';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { combineLatest } from 'rxjs';
import { AccessLog } from 'src/app/interface/access-log.interface';
import { Employee } from 'src/app/interface/employee.interface';
import { ErrorLog } from 'src/app/interface/error-log.interface';

@Component({
  selector: 'app-recent-alerts',
  templateUrl: './recent-alerts.component.html',
  styleUrls: ['./recent-alerts.component.css']
})
export class RecentAlertsComponent implements OnInit {
  recentAlerts: { type: string, name: string, date: string, time: string }[] = [];
  matchedEmployees: Employee[] = [];
  maxEmployeesDisplayed: number = 10;

  constructor(
    private employeeService: EmployeeService,
    private accessLogService: AccessLogService,
    private errorLogService: ErrorLogService
  ) { }

  ngOnInit(): void {
    this.loadRecentAlerts();
  }

  loadRecentAlerts() {
    combineLatest([
      this.employeeService.getEmployee(),
      this.accessLogService.getAccessLogs(),
      this.errorLogService.getErrorLogs()
    ]).subscribe(
      ([employees, accessLogs, errorLogs]: [Employee[], AccessLog[], ErrorLog[]]) => {
        const currentDate = new Date().toLocaleDateString();
        
        // Define time format options for 12-hour format
        const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        
        // Process access logs
        this.matchedEmployees = employees.filter(employee => 
          employee.accessLogs?.some(log => 
            new Date(log.accessDateTime).toLocaleDateString() === currentDate
          )
        );
  
        this.matchedEmployees.sort((a, b) => {
          const accessTimeA = this.getMostRecentAccessTime(a);
          const accessTimeB = this.getMostRecentAccessTime(b);
          return accessTimeB.getTime() - accessTimeA.getTime();
        });
  
        const firstSixEmployees = this.matchedEmployees.slice(0, this.maxEmployeesDisplayed);
        const accessLogAlerts = firstSixEmployees.map(employee => {
          const mostRecentTime = this.getMostRecentAccessTime(employee);
          const formattedTime = mostRecentTime.toLocaleTimeString([], timeOptions);
          const formattedDate = mostRecentTime.toLocaleDateString();
          const firstName = employee.fullname.split(' ')[0];  // Get the first name
          return { type: 'login', name: firstName, date: formattedDate, time: formattedTime };
        });
  
        // Process error logs, only include errors that should be shown
        const errorLogAlerts = errorLogs
          .filter(log => new Date(log.timestamp!).toLocaleDateString() === currentDate)
          .map(log => {
            const timeOnly = new Date(log.timestamp!).toLocaleTimeString([], timeOptions);
            const dateOnly = new Date(log.timestamp!).toLocaleDateString();
            return { type: 'error', name: 'Error', date: dateOnly, time: timeOnly };
          });
  
        // Combine access and error logs and sort them by date and time (most recent first)
        const combinedAlerts = [...accessLogAlerts, ...errorLogAlerts];
        this.recentAlerts = combinedAlerts
          .filter(alert => alert.type === 'login')  // Filter out errors
          .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
          .slice(0, 10);  // Keep only the top 10 most recent alerts
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  getMostRecentAccessTime(employee: Employee): Date {
    const accessTimes = employee.accessLogs?.map(log => new Date(log.accessDateTime)) || [];
    return accessTimes.reduce((mostRecent, current) => (current > mostRecent ? current : mostRecent), new Date(0));
  }
}
