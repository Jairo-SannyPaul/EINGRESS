import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { shareReplay } from 'rxjs';
import { User } from '../interface/user.interface';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.baseURL}api/users`;
  private mailerapiUrl = `${environment.baseURL}api/mailer`;
  currentUserId!: number;
  constructor(private http: HttpClient) { }

  getUser(): Observable<User> {
    const userUrl = `${this.apiUrl}/${this.getUserId()}`; // Adjust endpoint as necessary
    return this.http.get<User>(userUrl);
  }

  getUserById(id: number): Observable<User> {
    const userUrl = `${this.apiUrl}/${id}`; // Adjust endpoint as necessary
    return this.http.get<User>(userUrl);
  }

  addUser(user: User): Observable<User[]> {
    return this.http.post<User[]>(this.apiUrl, user);
  }

  // Add method to validate old password
  validateOldPassword(userId: number, oldPassword: string): Observable<boolean> {
    const validateUrl = `${this.apiUrl}/validate-old-password`;
    return this.http.post<boolean>(validateUrl, { userId, oldPassword });
  }

  updateUser(id: number, user: { username?: string; email?: string; password?: string }): Observable<{ message: string; user: User }> {
    const updateUrl = `${this.apiUrl}/${id}`;
    return this.http.put<{ message: string; user: User }>(updateUrl, user);
  }
  
  loginUser(credentials: { email: string, password: string }): Observable<any> {
    const loginUrl = `${this.apiUrl}/login`;
    return this.http.post<any>(loginUrl, credentials);
  }

  logoutUser() {
    localStorage.removeItem('token');
  }

  private getUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;
    return this.currentUserId;
  }

  sendResetOtp( emailPayload: {email: string}): Observable<any> {
    const resetOtpUrl = `${this.mailerapiUrl}/validate-email`;
    return this.http.post<any>(resetOtpUrl, emailPayload);
  }

  sendVerificationEmail(data: { name: string; address: string; verification_otp: string }): Observable<any> {
    return this.http.post(`${this.mailerapiUrl}/send-verification`, data);
  }

  validateResetOtp(resetOtpPayload: {email: string, otp: string}): Observable<any> { 
    const resetOtpUrl = `${this.apiUrl}/validate-ResetOtp`;
    return this.http.post<any>(resetOtpUrl, resetOtpPayload);
  }


}
