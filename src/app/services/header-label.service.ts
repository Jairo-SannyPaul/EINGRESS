import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderLabelService {
  private titleSource = new BehaviorSubject<string>('Default Title'); // Default title
  private descriptionSource = new BehaviorSubject<string | null>(null); //Default Description
  
  currentTitle = this.titleSource.asObservable();
  currentDescription = this.descriptionSource.asObservable();

  constructor() { }

   // Method to update the label
  updateTitle(title: string): void {
    this.titleSource.next(title);
  }

  updateHeaderTitle(description: string): void {
    this.descriptionSource.next(description);
  }

  // Method to clear the title
  clearDescription(): void {
    this.descriptionSource.next(null); // Clear the title when navigating away 
  }
}
