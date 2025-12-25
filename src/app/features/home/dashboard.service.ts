import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_URL } from "@core/base-url-token";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "Dashboard";
  constructor() {}
}
