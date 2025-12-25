import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "@core/base-url-token";
import { SettingViewModel } from "@models";

@Injectable({
  providedIn: "root",
})
export class SettingService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Settings";

  getSettings(): Observable<any> {
    return this.http.get<SettingViewModel>(this.baseURL);
  }

  updateSettings(data: any): Observable<any> {
    return this.http.put<SettingViewModel>(this.baseURL, data);
  }
}
