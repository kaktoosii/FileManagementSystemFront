import { Component, OnInit, signal } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { MessageService } from "./message.service";
import { MessageViewModel } from "@models";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzTableModule } from "ng-zorro-antd/table";
import { RouterModule } from "@angular/router";
import { NzButtonModule } from "ng-zorro-antd/button";
import { CommonModule } from "@angular/common";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrl: "./message.component.scss",
  standalone: true,
  imports: [
    NzTableModule,
    NzCardModule,
    RouterModule,
    NzButtonModule,
    CommonModule,
    NzIconModule,
    NzModalModule,
  ],
})
export default class MessageListComponent implements OnInit {
  messages: MessageViewModel[] = [];
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  totalNumber = signal<number>(0);
  isLoading = false;

  constructor(
    private messageService: MessageService,
    private nzMessage: NzMessageService,
    private modal: NzModalService,
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  // دریافت لیست پیام‌ها
  loadMessages(): void {
    this.isLoading = true;
    this.messageService
      .getMessages({
        pageNumber: this.pageIndex(),
        pageSize: this.pageSize(),
      })
      .subscribe(
        (response) => {
          this.messages = response.data;
          this.totalNumber.set(response.totalRecords);
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          this.nzMessage.error("خطا در بارگذاری پیام‌ها");
        },
      );
  }

  // حذف پیام
  deleteMessage(id: number): void {
    this.modal.confirm({
      nzTitle: "آیا از حذف این آیتم مطمئن هستید؟",
      nzContent: '<b style="color: red;"></b>',
      nzOkText: "بله",
      nzOkType: "primary",
      nzOkDanger: true,
      nzOnOk: () => {
        this.messageService.deleteMessage(id).subscribe(
          () => {
            this.nzMessage.success("پیام با موفقیت حذف شد");
            this.messages = this.messages.filter((msg) => msg.id !== id);
          },
          () => this.nzMessage.error("خطا در حذف پیام"),
        );
      },
      nzCancelText: "خیر",
      nzOnCancel: () => console.log("Cancel"),
    });
  }
}
