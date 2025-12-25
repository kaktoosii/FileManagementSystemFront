import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from './report.service';
import { ReportViewModel } from '../../gen/model/reportViewModel';

declare var Stimulsoft: any;

@Component({
  selector: 'app-report-designer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-designer.component.html',
  styleUrls: ['./report-designer.component.scss']
})
export default class ReportDesignerComponent implements OnInit {
  reports: ReportViewModel[] = [];
  selectedReportId: number | null = null;
  private designer: any;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    // Activate Stimulsoft license before initializing the designer
    this.activateLicense();
    this.initializeDesigner();
    this.loadReports();
  }

  private activateLicense(): void {
    // Option 1: Using a license key string
    Stimulsoft.Base.StiLicense.key = '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHn0s4gy0Fr5YoUZ9V00Y0igCSFQzwEqYBh/N77k4f0fWXTHW5rqeBNLkaurJDenJ9o97TyqHs9HfvINK18Uwzsc/bG01Rq+x3H3Rf+g7AY92gvWmp7VA2Uxa30Q97f61siWz2dE5kdBVcCnSFzC6awE74JzDcJMj8OuxplqB1CYcpoPcOjKy1PiATlC3UsBaLEXsok1xxtRMQ283r282tkh8XQitsxtTczAJBxijuJNfziYhci2jResWXK51ygOOEbVAxmpflujkJ8oEVHkOA/CjX6bGx05pNZ6oSIu9H8deF94MyqIwcdeirCe60GbIQByQtLimfxbIZnO35X3fs/94av0ODfELqrQEpLrpU6FNeHttvlMc5UVrT4K+8lPbqR8Hq0PFWmFrbVIYSi7tAVFMMe2D1C59NWyLu3AkrD3No7YhLVh7LV0Tttr/8FrcZ8xirBPcMZCIGrRIesrHxOsZH2V8t/t0GXCnLLAWX+TNvdNXkB8cF2y9ZXf1enI064yE5dwMs2fQ0yOUG/xornE'; // Replace with your actual license key

    // Option 2: Using a license file (uncomment to use)
    // Stimulsoft.Base.StiLicense.loadFromFile('assets/license.key'); // Ensure license.key is placed in the assets folder
  }

  private initializeDesigner(): void {
    const options = new Stimulsoft.Designer.StiDesignerOptions();
    options.appearance.fullScreenMode = false;
    this.designer = new Stimulsoft.Designer.StiDesigner(options, 'StiDesigner', false);
    this.designer.renderHtml('designer');

    this.designer.onSaveReport = (args: any) => {
      if (this.selectedReportId) {
        this.saveReport(args.report.saveToJsonString());
      }
    };
  }

  private loadReports(): void {
    this.reportService.getReports().subscribe({
      next: (reports) => {
        this.reports = reports;
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
      }
    });
  }

  private saveReport(reportJson: string): void {
    if (!this.selectedReportId) return;

    const updateModel: ReportViewModel = {
      id: this.selectedReportId,
      title: '',
      code: '',
      reportJson
    };

    this.reportService.updateReport(updateModel).subscribe({
      next: () => {
        console.log('Report saved successfully');
      },
      error: (err) => {
        console.error('Error saving report:', err);
      }
    });
  }

  loadReport(event: any): void {
    this.selectedReportId = event.target.value;
    if (this.selectedReportId) {
      this.reportService.getReport(this.selectedReportId).subscribe({
        next: (vm) => {
          if (vm.reportJson) {
            const report = new Stimulsoft.Report.StiReport();
            report.load(vm.reportJson);
            this.designer.report = report;
          }
        },
        error: (err) => {
          console.error('Error loading report:', err);
        }
      });
    }
  }
}
