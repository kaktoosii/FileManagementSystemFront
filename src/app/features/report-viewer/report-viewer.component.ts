// src/app/report-viewer/report-viewer.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute } from '@angular/router';
import { ReportDataService } from '../report-data.service';
import { ReportService } from '@features/report-designer/report.service';


declare var Stimulsoft: any;

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NzMessageModule],
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export default class ReportViewerComponent implements OnInit, AfterViewInit {
  reportId: number = 1; // Default report ID
  private viewer: any;
  isLoading = false;

  constructor(
    private reportService: ReportService,
    private reportDataService: ReportDataService,
    private nzMessage: NzMessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      //this.loadWell(id);
    }
    this.reportId =  1;

  }




  ngAfterViewInit(): void {
    if (typeof Stimulsoft !== 'undefined' && Stimulsoft.Report && Stimulsoft.Viewer) {
      this.activateLicense();
      this.initializeViewer();
    } else {
      const checkStimulsoft = setInterval(() => {
        if (typeof Stimulsoft !== 'undefined' && Stimulsoft.Report && Stimulsoft.Viewer) {
          clearInterval(checkStimulsoft);
          this.activateLicense();
          this.initializeViewer();
        }
      }, 100);
    }
  }

  private activateLicense(): void {
    Stimulsoft.Base.StiLicense.key = '6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHn0s4gy0Fr5YoUZ9V00Y0igCSFQzwEqYBh/N77k4f0fWXTHW5rqeBNLkaurJDenJ9o97TyqHs9HfvINK18Uwzsc/bG01Rq+x3H3Rf+g7AY92gvWmp7VA2Uxa30Q97f61siWz2dE5kdBVcCnSFzC6awE74JzDcJMj8OuxplqB1CYcpoPcOjKy1PiATlC3UsBaLEXsok1xxtRMQ283r282tkh8XQitsxtTczAJBxijuJNfziYhci2jResWXK51ygOOEbVAxmpflujkJ8oEVHkOA/CjX6bGx05pNZ6oSIu9H8deF94MyqIwcdeirCe60GbIQByQtLimfxbIZnO35X3fs/94av0ODfELqrQEpLrpU6FNeHttvlMc5UVrT4K+8lPbqR8Hq0PFWmFrbVIYSi7tAVFMMe2D1C59NWyLu3AkrD3No7YhLVh7LV0Tttr/8FrcZ8xirBPcMZCIGrRIesrHxOsZH2V8t/t0GXCnLLAWX+TNvdNXkB8cF2y9ZXf1enI064yE5dwMs2fQ0yOUG/xornE';
  }

  private initializeViewer(): void {
    const options = new Stimulsoft.Viewer.StiViewerOptions();
    options.appearance.fullScreenMode = false;
    options.toolbar.showPrintButton = true;
    this.viewer = new Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);
    this.viewer.renderHtml('viewer');
  }

  private loadReport(): void {
    this.isLoading = true;
    this.reportService.getReport(this.reportId).subscribe({
      next: (vm) => {
        const report = new Stimulsoft.Report.StiReport();
        try {
          if (vm.reportJson) {
            report.load(vm.reportJson);
          } else {
            console.warn('No report JSON found, loading empty report');
            this.nzMessage.warning('گزارش یافت نشد');
          }

          // Register well data with the report
          report.regData('Wells', 'Wells', []);
          report.dictionary.synchronize();

          this.viewer.report = report;
          this.viewer.renderHtml('viewer');
          this.isLoading = false;
        } catch (error) {
          console.error('Error loading report:', error);
          this.nzMessage.error('خطا در بارگذاری گزارش');
          this.viewer.report = new Stimulsoft.Report.StiReport();
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.nzMessage.error('خطا در دریافت گزارش');
        this.viewer.report = new Stimulsoft.Report.StiReport();
        this.isLoading = false;
      }
    });
  }

  printReport(): void {
    if (this.viewer.report) {
      this.viewer.report.print();
      this.nzMessage.success('گزارش به چاپگر ارسال شد');
      setTimeout(() => window.close(), 1000); // Close tab after printing
    } else {
      this.nzMessage.error('هیچ گزارشی برای چاپ بارگذاری نشده است');
    }
  }
}
