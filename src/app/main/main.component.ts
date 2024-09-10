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
  constructor (
    private userService: UserService
  ){
  }

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Admin';
    this.loadUser();
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
