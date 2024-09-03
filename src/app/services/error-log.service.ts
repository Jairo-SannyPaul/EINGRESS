import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorLog } from '../interface/error-log.interface';

@Injectable({
  providedIn: 'root'
})
export class ErrorLogService {

  private apiUrl = `${environment.baseURL}api/error-logs`;

  constructor(private http: HttpClient) { }

  getErrorLogs(): Observable<ErrorLog[]> {
    const getErrorLogsUrl = `${this.apiUrl}`;
    return this.http.get<ErrorLog[]>(getErrorLogsUrl);
  }

}
