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

  addUser(user: User): Observable<User[]>{
    return this.http.post<User[]>(this.apiUrl, user);
  }

  //TRY AND ERROR
  updateUser(id: number, user: { username: string; password: string }): Observable<any> {
    const updateUrl = `${this.apiUrl}/${id}`;
    return this.http.put<any>(updateUrl, user);
  }
  
  
  loginUser(credentials: { username: string, password: string }): Observable<any> { 
    const loginUrl = `${this.apiUrl}/login`;
    return this.http.post<any>(loginUrl, credentials);
  }

  logoutUser(){
    localStorage.removeItem('token');
  }

  private getUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;
    return this.currentUserId;
  }
}
