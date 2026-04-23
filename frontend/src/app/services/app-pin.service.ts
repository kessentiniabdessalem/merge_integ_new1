import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppPinService {
  private API = 'http://localhost:8080/api/app-pin';

  constructor(private http: HttpClient) {}

  private headers() {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  status(): Promise<{ hasPin: boolean }> {
    return firstValueFrom(this.http.get<{ hasPin: boolean }>(`${this.API}/status`, this.headers()));
  }

  set(pin: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.API}/set`, { pin }, this.headers()));
  }

  verify(pin: string): Promise<any> {
    return firstValueFrom(this.http.post(`${this.API}/verify`, { pin }, this.headers()));
  }
}
