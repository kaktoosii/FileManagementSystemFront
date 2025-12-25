import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from '@core/base-url-token';
import { ReportViewModel } from '../../gen/model/reportViewModel';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(BASE_URL) + 'report';

  getReports(): Observable<ReportViewModel[]> {
    return this.http.get<ReportViewModel[]>(this.baseUrl);
  }

  getReport(id: number): Observable<ReportViewModel> {
    return this.http.get<ReportViewModel>(`${this.baseUrl}/${id}`);
  }

  updateReport(report: ReportViewModel): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/body`, report);
  }
}
