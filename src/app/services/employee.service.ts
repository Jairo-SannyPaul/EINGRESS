import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../interface/employee.interface';
import { Subject } from 'rxjs';
import { forkJoin } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  apiUrl = `${environment.baseURL}api/employee`;

  private deletedClickedSource = new Subject<void>();
  deletedClicked$ = this.deletedClickedSource.asObservable();

  private searchedUserTriggerSource = new Subject<string>();
  searchUserTrigger$ = this.searchedUserTriggerSource.asObservable();

  private sortOptionSource = new BehaviorSubject<string>('nameAsc');
  sortOption$ = this.sortOptionSource.asObservable();

  private selectedFilterSource = new BehaviorSubject<string>('name');
  selectedFilter$ = this.selectedFilterSource.asObservable();

  setToggle: boolean = false;

  constructor(private http: HttpClient) {}

  getEmployee(): Observable<Employee[]> {
    const getEmployeeInfoUrl = `${this.apiUrl}`;
    return this.http.get<Employee[]>(getEmployeeInfoUrl);
  }

  deleteEmployee(employeeID: number[]): Observable<any> {
    const deleteEmployeeUrl = employeeID.map(id => `${this.apiUrl}/${id}`);
    const deleteRequest = deleteEmployeeUrl.map(url => this.http.delete(url));
    return forkJoin(deleteRequest);
  }

  addEmployee(employee: Employee, file: File): Observable<any> {
    const formData: FormData = new FormData();
    console.log(employee);
    formData.append('file', file); // Assuming the profileImage is always present
    formData.append('employee', JSON.stringify(employee)); // Convert employee object to JSON string
    return this.http.post<any>(`${this.apiUrl}`, formData);
  }

  

  addEmployeeWithoutImage(employee: Employee): Observable<any> {
    const formData: FormData = new FormData();
    console.log(employee);
    formData.append('employee', JSON.stringify(employee)); // Convert employee object to JSON string
    return this.http.post<any>(`${this.apiUrl}`, formData); // Send PUT request without image
  }

  updateEmployee(id: number, employee: Employee, file: File): Observable<any> {
    const formData: FormData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('employee', JSON.stringify(employee));
  
    const updateEmployeeUrl = `${this.apiUrl}/${id}`;
    return this.http.put<Employee>(updateEmployeeUrl, formData); // Use FormData in the PUT request
  }
  
  updateEmployeeWithoutImage(id: number, employee: Employee): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('employee', JSON.stringify(employee));
    const updateEmployeeUrl = `${this.apiUrl}/${id}`;
    return this.http.put<Employee>(updateEmployeeUrl, formData); // Send PUT request without image
  }

  searchEmployee(searchInputValue: string): Observable<Employee[]> {
    return this.getEmployee().pipe(
      map(employees => {
        const selectedFilter = this.selectedFilterSource.getValue();
        const filteredEmployees = employees.filter(employee => {
          const searchValueLower = searchInputValue.toLowerCase();
  
          switch (selectedFilter) {
            case 'name':
              return employee.fullname.toLowerCase().startsWith(searchValueLower);
            case 'role':
              return employee.role.toLowerCase().includes(searchValueLower);
            case 'rfid':
              return employee.rfidtag?.toLowerCase().includes(searchValueLower) || false;
            case 'fingerprint':
              return employee.fingerprint1?.toLowerCase().includes(searchValueLower) ||
                     employee.fingerprint2?.toLowerCase().includes(searchValueLower);
            default:
              return false;
          }
        });
        return filteredEmployees;
      })
    );
  }
  
  countBiometricRegistrations(): Observable<{ BioRegistered: number; noBioRegistered: number }> {
    return this.getEmployee().pipe(
      map(employees => {
        let BioRegistered = 0;
        let noBioRegistered = 0;

        employees.forEach(employee => {
          const hasFingerprint1 = employee.fingerprint1 && employee.fingerprint1.trim() !== '';
          const hasFingerprint2 = employee.fingerprint2 && employee.fingerprint2.trim() !== '';

          if (hasFingerprint1 || hasFingerprint2) {
            BioRegistered++;
          } else {
            noBioRegistered++;
          }
        });

        return { BioRegistered, noBioRegistered };
      })
    );
  }
  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }  
  triggerDelete() {
    this.deletedClickedSource.next();
  }

  triggerSearchUser(searchInputValue: string) {
    this.searchedUserTriggerSource.next(searchInputValue);
  }

  reloadPage() {
    window.location.reload();
  }

  private reloadSubject = new Subject<void>();

  reload$ = this.reloadSubject.asObservable();

  triggerReload() {
    this.reloadSubject.next();
  }

  setSortOption(sortOption: string) {
    this.sortOptionSource.next(sortOption);
  }

  setFilterOption(filter: string) {
    this.selectedFilterSource.next(filter);
  }

  private deleteModeSource = new BehaviorSubject<boolean>(false);
  deleteMode$ = this.deleteModeSource.asObservable();

  toggleDeleteMode() {
    const currentDeleteMode = this.deleteModeSource.getValue();
    this.deleteModeSource.next(!currentDeleteMode);
  }

  private checkedStateSource = new Subject<boolean>();
  checkedState$ = this.checkedStateSource.asObservable();

  updateCheckedState(isChecked: boolean) {
    this.checkedStateSource.next(isChecked);
  }
}
