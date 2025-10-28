import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { environment } from '@environments/environment';
import * as fromDto from '@user/dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.baseApiUrl;
  private http = inject(HttpClient);

  constructor() { }

  changePassword(body: fromDto.ChangePasswordDto): Promise<void> {
    return lastValueFrom(this.http.post<void>(this.baseUrl + '/auth/change-password', { ...body }));
  }
}
