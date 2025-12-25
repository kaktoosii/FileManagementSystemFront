export interface ReportViewModel {
  id: number;
  title: string;
  code: string;
  reportJson?: string; // Optional since list might not include json
}
