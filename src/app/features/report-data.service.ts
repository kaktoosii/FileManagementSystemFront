// src/app/report-data.service.ts
import { Injectable } from '@angular/core';
import { WellViewModel } from '../gen/model/well';

@Injectable({
  providedIn: 'root'
})
export class ReportDataService {
  private wellData: WellViewModel | null = null;

  setWellData(data: WellViewModel): void {
    this.wellData = data;
  }

  getWellData(): WellViewModel | null {
    const data = this.wellData;
    this.wellData = null; // Clear after retrieval to avoid stale data
    return data;
  }
}
