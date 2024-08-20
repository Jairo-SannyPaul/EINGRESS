import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  loading: boolean = false; // This will now be controlled by the child

  onLoadingChange(isLoading: boolean) {
    this.loading = isLoading;
  }

}
