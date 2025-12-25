import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzButtonModule } from "ng-zorro-antd/button";
import { RouterModule } from "@angular/router";
import { SupportService } from "@features/support/support.service";
import { SupportRequestDetailViewModel } from "@models";
@Component({
  selector: "app-support",
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, RouterModule],
  templateUrl: "./support.component.html",
})
export default class SupportListComponent implements OnInit {
  private supportService = inject(SupportService);

  supportRequests = signal<SupportRequestDetailViewModel[]>([]);
  selectedRequest = signal<SupportRequestDetailViewModel | null>(null);
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  totalNumber = signal<number>(0);
  pending = signal<boolean>(false);

  ngOnInit(): void {
    this.loadSupportRequests();
  }

  loadSupportRequests(): void {
    this.pending.set(true);
    this.supportService
      .getSupportRequests({
        pageNumber: this.pageIndex(),
        pageSize: this.pageSize(),
      })
      .subscribe((response) => {
        this.supportRequests.set(response.data);
        this.totalNumber.set(response.totalRecords);
        this.pending.set(false);
      });
  }
}
