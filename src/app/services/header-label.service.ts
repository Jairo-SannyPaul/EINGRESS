import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderLabelService {
  private titleSource = new BehaviorSubject<string>('Default Title'); // Default title
  currentTitle = this.titleSource.asObservable();

  constructor() { }

   // Method to update the label
   updateTitle(title: string): void {
    this.titleSource.next(title);
  }
}
