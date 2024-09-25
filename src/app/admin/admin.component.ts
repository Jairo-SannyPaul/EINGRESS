import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { HeaderLabelService } from '../services/header-label.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit, OnDestroy {
  changePass:boolean = false
  descriptionTitle: string | null = null;
  private titleSubscription!: Subscription;

  constructor (
    private userService: UserService,
    private headerLabelService: HeaderLabelService
  ){}

  ngOnInit(): void {
    this.titleSubscription = this.headerLabelService.currentDescription.subscribe(description => {
      this.descriptionTitle = description;
    });

    this.headerLabelService.updateTitle('Admin Details');
    this.headerLabelService.updateHeaderTitle('Profile &  Security ')
  }
  
  toggleChangePass() {
    if (!this.changePass) {  // Fix the condition to check the value, not assign
      this.userService.openModal();
    }
    this.changePass = !this.changePass;  // Toggle the state after opening/closing the modal
  }

  
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.userService.closeModal();
    }
  }

  ngOnDestroy(): void {
    // Clear the title when navigating away from this component
    this.headerLabelService.clearDescription();
  }
}
