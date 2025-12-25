import { Component, Input, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputModule } from "ng-zorro-antd/input";
import { SupportService } from "../support.service";
import { SupportRequestDetailViewModel } from "@models";
import { NzCardModule } from "ng-zorro-antd/card";
import { FormsModule } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
  selector: "app-support-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
  ],
  templateUrl: "./support-detail.component.html",
})
export default class SupportDetailComponent implements OnInit {
  private supportService = inject(SupportService);
  private route = inject(ActivatedRoute);
  private nzMessage = inject(NzMessageService);

  requestId = signal<number>(0);
  supportRequest = signal<any | null>(null);
  responseMessage = signal<string>("");
  isAdmin = signal<boolean>(true); // Replace with actual role checking

  ngOnInit(): void {
    this.requestId.set(Number(this.route.snapshot.paramMap.get("id")));
    this.loadSupportRequest();
  }

  loadSupportRequest(): void {
    this.supportService
      .getSupportRequestById(this.requestId())
      .subscribe((request) => {
        this.supportRequest.set(request.data);
      });
  }

  sendResponse(): void {
    if (!this.responseMessage()) return;

    this.supportService
      .respondToSupportRequest(this.requestId(), this.responseMessage())
      .subscribe(() => {
        this.nzMessage.success("پیام با موفقیت حذف شد");
        this.supportRequest().response = this.responseMessage();
        this.loadSupportRequest();
      });
  }
  goBack() {
    window.history.back();
  }
}
