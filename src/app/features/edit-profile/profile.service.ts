import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "@core/base-url-token";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Account";

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/GetUserInfo`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.baseURL}`, data);
  }
}
