import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  // Subject to notify about the selected filter
  private selectedFilterSource = new Subject<string>();

  // Observable for other components to subscribe
  selectedFilter$ = this.selectedFilterSource.asObservable();

  constructor() { }

  // Method to trigger filter change
  setFilter(filter: string) {
    this.selectedFilterSource.next(filter);
  }
}
