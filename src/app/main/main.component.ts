import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../interface/user.interface';
import { EmployeeService } from '../services/employee.service';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {

  private users: User[] = [];
  isNavbarLocked: boolean = false;
  username: string = '';
  user!: User;
  changePass = false;
  isPopupVisible: boolean = false;
  isErrorPopupVisible: boolean = true;
  showAddUserModal: boolean = false;

  openAddUserModal() {
    this.employeeService.openModal();
  }

  closeAddUserModal() {
    this.employeeService.closeModal();
  }

  constructor(
    private userService: UserService,
    private employeeService: EmployeeService) {
    this.userService.modalState$.subscribe((state: boolean) => {
      this.changePass = state;
      this.employeeService.modalVisible$.subscribe((visible: boolean) => {
        this.showAddUserModal = visible;
      });
    });

    this.employeeService.modalVisible$.subscribe((visible: boolean) => {
      this.showAddUserModal = visible;
    });
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Admin';
    this.loadUser();
    this.employeeService.popupVisible$.subscribe((visible: boolean) => {
      this.isPopupVisible = visible;
    });
    this.employeeService.errorPopupVisibleSubject$.subscribe((visible: boolean) => {
      this.isErrorPopupVisible = visible;
    });
  }

  exitModal() {
    this.userService.closeModal();
  }

  loadUser(): void {
    this.userService.getUser().subscribe({
      next: (response: User) => {
        this.user = response;
      },
      error: (err) => {
        console.error('Failed to load user', err);
      }
    });
  }

  onLockStateChange(isLocked: boolean) {
    this.isNavbarLocked = isLocked;
  }

  closePopup() {
    this.employeeService.setPopupVisibility(this.isPopupVisible = false);
    this.employeeService.setPopupErrorVisibility(this.isErrorPopupVisible = false);
  }

  
}
