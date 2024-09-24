import { Component, HostListener, ViewChild, ElementRef, EventEmitter, Output, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { AccessLogService } from 'src/app/services/access-log.service';
import { EmployeeService } from 'src/app/services/employee.service';
import { LoginTotalService } from 'src/app/services/login-total.service';
import { Router } from '@angular/router';
import { HeaderLabelService } from 'src/app/services/header-label.service';
import { ErrorLogService } from 'src/app/services/error-log.service';
import { Employee } from 'src/app/interface/employee.interface';
import { ErrorLog } from 'src/app/interface/error-log.interface';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  @ViewChild('activityContainer') activityContainer!: ElementRef;
  @Output() loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  lastCheckedDate: string | null = null;
  loading: boolean = true;
  TotalRegistered: number = 0;
  LoginsToday: number = 0;
  total: number = 0;
  NotOnSite: number = 0;
  unauthorizedBioCount: number = 0;
  totalBio!: number;
  noBio!: number;
  yScaleMax: number = 0;
  chartWidth: number = 10;
  chartHeight: number = 10;
  currentDate: string = new Date().toLocaleDateString();
  recentAlerts: { type: string, message: string, timestamp: string }[] = [];

  constructor(
    private accessLogService: AccessLogService,
    private employeeService: EmployeeService,
    private logintotalService: LoginTotalService,
    private headerLabelService: HeaderLabelService,
    private errorLogService: ErrorLogService,
    private router: Router
  ) {
    this.fetchLoginsToday();
    this.loadEmployeeInfo();
    this.employeeService.countBiometricRegistrations().subscribe(counts => {
      this.totalBio = counts.BioRegistered;
      this.noBio = counts.noBioRegistered;
    });
    this.fetchRegisteredWithRFIDandBio();
  }

  ngOnInit(): void{
    // Update the header title to "Dashboard"
    this.headerLabelService.updateTitle('Dashboard');
    this.loadRecentAlerts();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calculateChartDimensions();
  }

  fetchLoginsToday() {
    // Fetch employees and access logs in parallel
    combineLatest([
      this.employeeService.getEmployee(),
      this.accessLogService.getAccessLogs()
    ]).subscribe(
      ([employees, accessLogs]) => {
        // Calculate total employees
        this.total = employees.length;

        // Set yScaleMax based on total
        this.yScaleMax = this.total * 1.2;

        // Filter employees whose last login date matches the current date
        const loggedTodayEmployees = employees.filter(employee => {
          return employee.lastlogdate && new Date(employee.lastlogdate).toLocaleDateString() === this.currentDate;
        });

        // Count the number of employees who logged in today
        this.LoginsToday = loggedTodayEmployees.length;

        // Calculate NotOnSite
        this.NotOnSite = this.total - this.LoginsToday;

        // Check if today's login statistics exist in the database
        this.logintotalService.getTodayLoginStatistics().subscribe(
          (todayLoginStats) => {
            if (!todayLoginStats) {
              // Today's login statistics don't exist, so create a default entry
              this.logintotalService.createDefaultEntry(this.LoginsToday.toString(), this.NotOnSite.toString()).subscribe(
                () => {
                  console.log('Default entry created successfully.');
                  this.updateLoginStatisticsInBackend();
                },
                error => {
                  console.error('Error creating default entry:', error);
                }
              );
            } else {
              // Today's login statistics already exist, update them in the backend
              this.updateLoginStatisticsInBackend();
            }
          },
          error => {
            console.error('Error fetching today\'s login statistics:', error);
          }
        );
      },
      error => {
        console.error('Error fetching employees:', error);
      }
    );
  }

  loadRecentAlerts() {
    this.errorLogService.getErrorLogs().subscribe(
        (errorLogs: ErrorLog[]) => {
            const currentDate = new Date().toLocaleDateString(); // Get today's date
            
            // Reset the unauthorized bio count for the current day
            this.unauthorizedBioCount = 0; // Always reset before counting for today

            // Count unauthorized bio attempts only for the current date
            errorLogs.forEach(log => {
                // Check if the log's date matches today's date and the message indicates fingerprint mismatch
                if (new Date(log.timestamp!).toLocaleDateString() === currentDate && 
                    log.message === 'Error Fingerprint not match:') {
                    this.unauthorizedBioCount++; // Increment the count for today's unauthorized bio attempts
                }
            });

            // Log the total count with the specific date
            console.log(`Total count of unauthorized bio attempts for ${currentDate} is: ${this.unauthorizedBioCount}`);
        },
        error => {
            console.error('Error fetching error logs:', error);
        }
    );
}

  loadEmployeeInfo() {
    this.employeeService.getEmployee().subscribe(
      employees => {
        this.total = employees.length; // Calculate total employees
        this.yScaleMax = this.total * 1.2; // Set yScaleMax based on total
      },
      error => {
        console.error('Error fetching employees:', error);
      }
    );
  }


  updateLoginStatisticsInBackend() {
    this.logintotalService.updateTodayLoginStatistics(this.LoginsToday.toString(), this.NotOnSite.toString()).subscribe(
      () => {
        console.log('Login statistics updated successfully.');
        this.loading = false;
        this.loadingChange.emit(this.loading);
      },
      error => {
        console.error('Error updating login statistics:', error);
      }
    );
  }

  fetchRegisteredWithRFIDandBio() {
    this.employeeService.getEmployee().subscribe(
      employees => {
        // Filter employees who have both RFID and biometric registrations
        const registeredWithRFIDandBio = employees.filter(employee => 
          employee.rfidtag && employee.fingerprint1
        );

        // Set the total registered count
        this.TotalRegistered = registeredWithRFIDandBio.length;

        console.log('Total Registered with RFID and Bio:', this.TotalRegistered);
      },
      error => {
        console.error('Error fetching employees:', error);
      }
    );
  }

  getMostRecentAccessTime(employee: Employee): Date {
    const accessTimes = employee.accessLogs?.map(log => new Date(log.accessDateTime)) || [];
    return accessTimes.reduce((mostRecent, current) => (current > mostRecent ? current : mostRecent), new Date(0));
  }


  calculateChartDimensions() {
    if (this.activityContainer) {
      const element = this.activityContainer.nativeElement;
      this.chartWidth = element.clientWidth + 50;
      this.chartHeight = element.clientHeight;
    }
  }


  onLoadingChange(isLoading: boolean) {
    this.loading = isLoading;
  }

}
