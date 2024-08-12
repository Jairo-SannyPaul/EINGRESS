import { Component, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminpopupComponent } from '../adminpopup/adminpopup.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isDropdownOpen = false;

  constructor(private elRef: ElementRef, public dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(AdminpopupComponent, {
    width: '450px', 
    height: '600px',
    disableClose: false
    });

    this.isDropdownOpen = false;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!this.elRef.nativeElement.contains(target)) {
      this.isDropdownOpen = false;
    }
  }

}