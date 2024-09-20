  import { Component, OnInit } from '@angular/core';
  import { UserService } from '../services/user.service';
  import { User } from '../interface/user.interface';
  import { AddUserModalService } from '../services/add-user-modal.service';

  @Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
  })
  export class MainComponent{

  private users: User[] = [];
  isNavbarLocked: boolean = false;
  username: string = '';
  user!: User;
  changePass = false;

  showAddUserModal: boolean = false;

  openAddUserModal() {
    this.addusermodalService.openModal();
  }

  closeAddUserModal() {
    this.addusermodalService.closeModal();
  }

  constructor(
    private userService: UserService,
    private addusermodalService: AddUserModalService ) {
    this.userService.modalState$.subscribe((state: boolean) => {
    this.changePass = state;
  });

    this.addusermodalService.modalVisible$.subscribe((visible: boolean) => {
    this.showAddUserModal = visible;
  });
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Admin';
    this.loadUser();
  }

  exitModal(){
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
  }
