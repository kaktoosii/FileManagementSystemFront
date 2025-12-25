import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { RouterModule } from "@angular/router";
import { UserViewModel } from "../../gen/model/userViewModel";
import { UserService } from "./users.service";
import { finalize } from "rxjs";
import { NzIconModule } from "ng-zorro-antd/icon";

@Component({
  selector: "ileria-users",
  imports: [NzTableModule, NzDividerModule, RouterModule, NzButtonModule ,   NzIconModule,
      NzModalModule],
  providers: [UserService, NzModalService],
  templateUrl: "./users.component.html",
  styleUrl: "./users.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class UsersComponent implements OnInit {
  private readonly api = inject(UserService);
  private readonly messageService = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);

  users: WritableSignal<UserViewModel[]> = signal([]);
  pending = signal(false);
  pageIndex = signal(1);
  pageSize = signal(10);
  totalNumber = signal(1);

  ngOnInit(): void {
    this.GetList();
  }

  private GetList() {
    this.pending.set(true);
    this.api
      .GetList({
        PageNumber: this.pageIndex(),
        PageSize: this.pageSize(),
      })
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe((res) => {
        this.users.set(res.data!);
        this.totalNumber.set(res.totalRecords ?? 0);
        this.pageIndex.set(res.pageNumber ?? 1);
        this.pageSize.set(res.pageSize ?? 10);
      });
  }

  onPageSizeChange(pageSize: number) {
    this.pageSize.set(pageSize);
    this.GetList();
  }

  onPageIndexChange(pageIndex: number) {
    this.pageIndex.set(pageIndex);
    this.GetList();
  }

  deleteUser(userId: number) {
    this.modalService.confirm({
      nzTitle: 'حذف کاربر',
      nzContent: 'آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟',
      nzOkText: 'بله',
      nzOkType: 'primary',
      nzCancelText: 'خیر',
      nzOnOk: () => {
        this.pending.set(true);
        this.api
          .deleteUser(userId)
          .pipe(finalize(() => this.pending.set(false)))
          .subscribe({
            next: () => {
              this.messageService.success('کاربر با موفقیت حذف شد.');
              this.GetList();
            },
            error: (err) => {
              this.messageService.error('خطا در حذف کاربر: ' + (err.error?.message || err.message));
            },
          });
      },
    });
  }
}
