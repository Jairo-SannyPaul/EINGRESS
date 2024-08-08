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
  recentAlerts: { type: string, message: string }[] = [];
  matchedEmployees: Employee[] = [];
  maxEmployeesDisplayed: number = 4;

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
        
        // Process access logs
        this.matchedEmployees = employees.filter(employee => {
          return employee.accessLogs?.some(log => new Date(log.accessDateTime).toLocaleDateString() === currentDate);
        });
  
        this.matchedEmployees.sort((a, b) => {
          const accessTimeA = this.getMostRecentAccessTime(a);
          const accessTimeB = this.getMostRecentAccessTime(b);
          return accessTimeB.getTime() - accessTimeA.getTime();
        });
  
        const firstSixEmployees = this.matchedEmployees.slice(0, this.maxEmployeesDisplayed);
        const accessLogAlerts = firstSixEmployees.map(employee => {
          const mostRecentTime = this.getMostRecentAccessTime(employee);
          const formattedTime = mostRecentTime.toLocaleTimeString();
          return { type: 'login', message: `${employee.fullname} has entered the building at ${formattedTime}`, timestamp: mostRecentTime.toISOString() };
        });
  
        // Process error logs
        const errorLogAlerts = errorLogs
          .filter(log => new Date(log.timestamp!).toLocaleDateString() === currentDate)
          .map(log => {
            const timeOnly = new Date(log.timestamp!).toLocaleTimeString();
            let message: string;
  
            // Check the message and transform it accordingly
            if (log.message === 'Employee not found.') {
              message = `Someone not registered tried to enter the building at ${timeOnly}`;
            } else if (log.message === 'Error Fingerprint not match:') {
              message = `Someone tried to login with wrong fingerprint at ${timeOnly}`;
            } else {
              message = log.message;
            }
  
            return { type: 'error', message: message, timestamp: log.timestamp };
          });
  
        // Combine and sort by time (most recent first)
        const combinedAlerts = [...accessLogAlerts, ...errorLogAlerts];
        this.recentAlerts = combinedAlerts
          .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
          .slice(0, 4); // Keep only the top 4 most recent alerts
      },
      error => {
        console.error('Error fetching data:', error);
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
}
