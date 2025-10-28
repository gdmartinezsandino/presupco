import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  public baseUrl: string = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean | readonly (string | number | boolean)[]>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${path}`, { params });
  }

  post<T>(path: string, body: Record<string, unknown>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${path}`, body);
  }

  patch<T>(path: string, body: Record<string, unknown>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${path}`);
  }
}
