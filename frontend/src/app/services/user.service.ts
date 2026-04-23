import { Injectable } from '@angular/core';
import { ApiBaseService } from './api-base.service';

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  joinedDate?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiBaseService) {}

  list(page = 0, size = 10) { return this.api.get<any>('/admin/users', { page, size }); }
  get(id: number) { return this.api.get<UserDto>(`/admin/users/${id}`); }
}
