import { Observable } from "rxjs";
import { Injectable, inject } from "@angular/core";
import { UserLogin, UserTokensDto } from "@models";
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../../core/base-url-token";

@Injectable()
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL);

  login(model: UserLogin): Observable<UserTokensDto> {
    return this.http.post<UserTokensDto>(this.baseURL + "Auth/Login", model);
  }
}
