import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-login-sessions',
  templateUrl: './login-sessions.component.html',
  styleUrls: ['./login-sessions.component.css']
})
export class LoginSessionsComponent {
  @Input() loginSessions: { date: string, time: string }[] = [];

// Function to get the day of the week based on the date string
getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}  
}
