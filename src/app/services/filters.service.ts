import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  // Subject to notify about the selected filter
  private selectedFilterSource = new Subject<string>();
  private searchValueSubject = new BehaviorSubject<string>(''); // Use searchValue
  searchValue$ = this.searchValueSubject.asObservable(); // Expose the observable

  // Observable for other components to subscribe
  selectedFilter$ = this.selectedFilterSource.asObservable();

  constructor() { }

  // Method to trigger filter change
  setFilter(filter: string) {
    this.selectedFilterSource.next(filter);
  }

  setSearchValue(value: string) {
    this.searchValueSubject.next(value); // Update the search value
  }


  //for datepickers
  private dateFilterSubject = new BehaviorSubject<string>('');
  dateFilter$ = this.dateFilterSubject.asObservable();

  updateDateFilter(date: string) {
    console.log("Last log date search:", date)
    this.dateFilterSubject.next(date);
  }

  // For registered datepicker, now tracking Date objects instead of strings
  private regdateFilterSubject = new BehaviorSubject<Date | null>(null);
  regdateFilter$ = this.regdateFilterSubject.asObservable();

  updateRegDateFilter(date: Date | null) {
    const formattedDate = this.formatDateToYYYYMMDD(date);
    console.log("Updating reg date filter:", formattedDate); // Log the formatted date string
    this.regdateFilterSubject.next(date);
  }

  formatDateToYYYYMMDD(date: Date | null): string | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


}
