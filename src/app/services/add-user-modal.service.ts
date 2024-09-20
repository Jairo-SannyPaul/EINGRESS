import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddUserModalService {
  private modalVisibleSubject = new BehaviorSubject<boolean>(false);
  modalVisible$ = this.modalVisibleSubject.asObservable();

  // Method to open the modal
  openModal() {
    this.modalVisibleSubject.next(true);
  }

  // Method to close the modal
  closeModal() {
    this.modalVisibleSubject.next(false);
  }
}
