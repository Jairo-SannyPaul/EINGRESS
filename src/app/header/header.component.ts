import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminpopupComponent } from '../adminpopup/adminpopup.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(AdminpopupComponent, {
      width: '450px', // Set the width of the dialog
     
height: '600px',
      disableClose: false // Optional: prevent closing on outside click
    });
  }
}