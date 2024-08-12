import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'
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

  constructor(private http: HttpClient) { }

  getEmployee(): Observable<Employee[]> {
    const getEmployeeInfoUrl = `${this.apiUrl}`;
    return this.http.get<Employee[]>(getEmployeeInfoUrl);
  }

  deleteEmployee(employeeID: number[]): Observable<any>{
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

  addEmployeeWithoutImage( employee: Employee): Observable<any> {
    const formData: FormData = new FormData();
    console.log(employee);
    formData.append('employee', JSON.stringify(employee)); // Convert employee object to JSON string
    return this.http.post<any>(`${this.apiUrl}`, formData);// Send PUT request without image
  }

  updateEmployee(id: number, employee: Employee, file: File): Observable<any> {
    const formData: FormData = new FormData();
    // If a file is provided, append it to the FormData
    if (file) {
      formData.append('file', file);
    }
    // Append the employee object to the FormData
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

  searchEmployee(searchInputValue: string): Observable<Employee[]>{
    return this.getEmployee().pipe(
      map(employees => {
        const filteredEmployees = employees.filter(
          employee => employee.fullname.toLowerCase().includes(searchInputValue.toLowerCase())
        );
        return filteredEmployees;
      })
    );
  }

  triggerDelete(){
    this.deletedClickedSource.next();
  }

  triggerSearchUser(searchInputValue: string){
    this.searchedUserTriggerSource.next(searchInputValue);
  }

  reloadPage(){
    window.location.reload();
  }

  private reloadSubject = new Subject<void>();

  reload$ = this.reloadSubject.asObservable();

  triggerReload() {
    this.reloadSubject.next();
  }
  setSortOption(sortOption:string){
    this.sortOptionSource.next(sortOption);
  }

}
