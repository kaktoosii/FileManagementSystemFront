import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "@core/base-url-token";

@Injectable({
  providedIn: "root",
})
export class PasswordService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Auth/ChangePassword";

  changePassword(data: any): Observable<any> {
    return this.http.post<any>(this.baseURL, data);
  }
}
