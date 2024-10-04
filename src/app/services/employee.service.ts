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

  constructor(private http: HttpClient) { }

  getEmployee(): Observable<Employee[]> {
    const getEmployeeInfoUrl = `${this.apiUrl}`;
    return this.http.get<Employee[]>(getEmployeeInfoUrl);
  }

  // deleteEmployee(employeeID: number[]): Observable<any> {
  //   const deleteEmployeeUrl = employeeID.map(id => `${this.apiUrl}/${id}`);
  //   const deleteRequest = deleteEmployeeUrl.map(url => this.http.delete(url));
  //   return forkJoin(deleteRequest);
  // }

  deleteEmployee(id: number): Observable<any> {
    const formData: FormData = new FormData();

    // Only update the delDate field to the current date
    const deldate = new Date().toISOString();
    const employeeData = { deldate };

    // Append employee data (with only delDate) to FormData
    formData.append('employee', JSON.stringify(employeeData));

    const updateEmployeeUrl = `${this.apiUrl}/${id}`;
    return this.http.put(updateEmployeeUrl, formData); // Send PUT request with FormData
  }



  addEmployee(employee: Employee, file: File): Observable<any> {
    const formData: FormData = new FormData();
    console.log(employee);
    if (file) {
      formData.append('file', file);
    }
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
    return this.http.put<Employee>(updateEmployeeUrl, formData);
  }

  updateEmployeeWithoutImage(id: number, employee: Employee): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('employee', JSON.stringify(employee));
    const updateEmployeeUrl = `${this.apiUrl}/${id}`;
    return this.http.put<Employee>(updateEmployeeUrl, formData); // Send PUT request without image
  }

  uploadFingerPrints(id: number, fingerprint1?: File | null, fingerprint2?: File | null): Observable<any>{
    const formData: FormData = new FormData();

    if(fingerprint1){
      formData.append('fingerprintfile1', fingerprint1);
    }
    if(fingerprint2){
      formData.append('fingerprintfile2', fingerprint2);
    }
    const updateEmployeeUrl = `${this.apiUrl}/${id}/fingerprintFiles`;
    return this.http.post<any>(updateEmployeeUrl, formData);
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
            // return employee.fullname.toLowerCase().includes(searchValueLower); //use this if they want keyword letters
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

  searchByRegDate(regdateFilter: Date | null): Observable<Employee[]> {
    return this.getEmployee().pipe(
      map(employees => {
        if (!regdateFilter) {
          return employees; // Return all employees if no date filter is provided
        }
  
        const formattedRegdate = this.formatDateToYYYYMMDD(regdateFilter); // Format the filter date
        return employees.filter(employee => {
          // Compare formatted regdate with employee regdate
          return this.formatDateToYYYYMMDD(new Date(employee.regdate)) === formattedRegdate;
        });
      })
    );
  }

  searchByLastLogDate(lastlogdate: string | null): Observable<Employee[]> {
    return this.getEmployee().pipe(
      map(employees => {
        if (!lastlogdate) {
          return employees; // Return all employees if no date is provided
        }
  
        // Extract the date part in "MM/DD/YYYY" format
        const searchDateString = lastlogdate.split(',')[0].trim(); // Get the date part only
        const formattedSearchDate = this.formatDate(searchDateString); // Standardize the format
  
        // Filter employees based on lastlogdate
        const matchedEmployees = employees.filter(employee => {
          // Get date part from employee's lastlogdate
          const employeeDate = employee.lastlogdate?.split(',')[0].trim(); // Get date part from employee's lastlogdate
          const formattedEmployeeDate = this.formatDate(employeeDate); // Standardize employee date format
          
          return formattedEmployeeDate === formattedSearchDate; // Use strict equality for comparison
        });
  
        // Log the matched employees
        console.log("Matched Employees with lastlogdate:", matchedEmployees);
        
        return matchedEmployees;
      })
    );
  }
  
  
  // Helper function to format the date to "MM/DD/YYYY"
  private formatDate(dateString: string): string {
    const [month, day, year] = dateString.split('/').map(Number);
    
    // Pad month and day with leading zeros if necessary
    const paddedMonth = String(month).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    
    return `${paddedMonth}/${paddedDay}/${year}`;
  }
  
  
  
  
  
  private formatDateToYYYYMMDD(date: Date | null): string {
    if (!date) return ''; // Return an empty string if date is null
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
  //for success popup
  private popupVisibleSubject = new BehaviorSubject<boolean>(false);
  popupVisible$ = this.popupVisibleSubject.asObservable();

  setPopupVisibility(isVisible: boolean) {
    this.popupVisibleSubject.next(isVisible);
  }

  //for error popup
  private errorPopupVisibleSubject = new BehaviorSubject<boolean>(false);
  errorPopupVisibleSubject$ = this.errorPopupVisibleSubject.asObservable();

  setPopupErrorVisibility(isVisible: boolean) {
    this.errorPopupVisibleSubject.next(isVisible);
  }

  //for discard popup
  private discardPopupVisibleSubject = new BehaviorSubject<boolean>(false);
  discardPopupVisibleSubject$ = this.discardPopupVisibleSubject.asObservable();

  setDiscardPopupVisibility(isVisible: boolean) {
    this.discardPopupVisibleSubject.next(isVisible);
  }

  //for user modal popup
  private modalVisibleSubject = new BehaviorSubject<boolean>(false);
  modalVisible$ = this.modalVisibleSubject.asObservable();
  openModal() {
    this.modalVisibleSubject.next(true);
  }
  closeModal() {
    this.modalVisibleSubject.next(false);
  }

  //for update modal popup
  private updateModalVisibleSubject = new BehaviorSubject<boolean>(false);
  updateModalVisible$ = this.updateModalVisibleSubject.asObservable();
  openUpdateModal() {
    console.log("update modal opened")
    this.updateModalVisibleSubject.next(true);
  }
  closeUpdateModal() {
    this.updateModalVisibleSubject.next(false);
  }

  //selected Employee for update modal
  private selectedEmployeeSubject = new BehaviorSubject<Employee | null>(null);
  selectedEmployee$ = this.selectedEmployeeSubject.asObservable();

  setSelectedEmployee(employee: Employee) {
    this.selectedEmployeeSubject.next(employee);
  }

  //for clicking yes in discard popup
  private editModeSource = new BehaviorSubject<boolean>(false);
  editMode$ = this.editModeSource.asObservable();
  
  closeEditModeAndReload() {
    this.setEditMode(false); // Close edit mode
    this.triggerReload(); // Trigger reload for other components that need to refresh
  }
  setEditMode(isEditing: boolean) {
    this.editModeSource.next(isEditing);
  }

  //for toggling filter
  private filterClickSource = new BehaviorSubject<boolean>(false); // Default is false
  filterClick$ = this.filterClickSource.asObservable();

  setFilterClick(value: boolean): void {
    this.filterClickSource.next(value); // Emit the new value
  }
}
