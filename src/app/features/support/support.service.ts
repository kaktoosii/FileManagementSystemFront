import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BASE_URL } from "@core/base-url-token";
import {
  SupportRequestDetailViewModel,
  SupportRequestDetailViewModelResponse,
} from "@models";
@Injectable({
  providedIn: "root",
})
export class SupportService {
  private readonly http = inject(HttpClient);
  private readonly baseURL = inject(BASE_URL) + "supports";

  // Get list of support requests
  getSupportRequests(filter: {
    pageNumber: number;
    pageSize: number;
    searchText?: string;
  }): Observable<any> {
    return this.http.get<any>(`${this.baseURL}`, { params: { ...filter } });
  }

  // Get details of a support request
  getSupportRequestById(
    id: number,
  ): Observable<SupportRequestDetailViewModelResponse> {
    return this.http.get<SupportRequestDetailViewModelResponse>(
      `${this.baseURL}/${id}`,
    );
  }

  // Respond to a support request
  respondToSupportRequest(
    requestId: number,
    responseMessage: string,
  ): Observable<any> {
    return this.http.post(`${this.baseURL}/respond/${requestId}`, {
      responseMessage,
    });
  }
}
