import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { AlertDialogComponent } from '../dialogs/alert-dialog/alert-dialog.component';
import { SuccessDialogComponent } from '../dialogs/success-dialog/success-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(message: string, cancelText:string, confirmText: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'dialog-z-index',  // Add this line
      width: '350px',
      data: 
      { 
        message,
        cancelText,
        confirmText
      }
    });

    return dialogRef.afterClosed();
  }

  openAlertDialog(message: string) {
    this.dialog.open(AlertDialogComponent, {
      panelClass: 'dialog-z-index',  // Add this line
      width: '350px',
      data: 
      { 
        message 
      }
    });
  }

  openSuccessDialog(message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(SuccessDialogComponent, {
      panelClass: 'dialog-z-index',  // Add this line
      width: '350px',
      data: 
      { 
        message
      }
    });

    return dialogRef.afterClosed();
  }
}
