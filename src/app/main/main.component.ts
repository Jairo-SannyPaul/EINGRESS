import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../interface/user.interface';

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
  constructor (
    private userService: UserService
  ){
    this.userService.modalState$.subscribe((state: boolean) => {
      this.changePass = state;
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
