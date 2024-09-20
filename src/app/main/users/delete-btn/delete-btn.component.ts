import { Component, OnInit, ViewChild } from '@angular/core';
import { EmployeeService } from 'src/app/services/employee.service';
@Component({
  selector: 'app-delete-btn',
  templateUrl: './delete-btn.component.html',
  styleUrls: ['./delete-btn.component.css']
})
export class DeleteBtnComponent implements OnInit {
  delMode: boolean = false;
  checkedDel: boolean = false;

  constructor(private deleteService: EmployeeService) {}

  ngOnInit() {
    // Subscribe to checked state changes
    this.deleteService.checkedState$.subscribe(isChecked => {
      this.checkedDel = isChecked;
    });
  }

  onDeleteClicked() {
    if (this.checkedDel) {
      this.deleteService.triggerDelete();
    } else if (!this.checkedDel && !this.delMode) {
      this.deleteService.toggleDeleteMode();
    }
  }
}
