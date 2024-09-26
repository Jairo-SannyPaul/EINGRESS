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
    this.dateFilterSubject.next(date);
  }
}
