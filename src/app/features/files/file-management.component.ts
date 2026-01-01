import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
  computed,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalModule, NzModalRef, NzModalService } from "ng-zorro-antd/modal";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzUploadModule } from "ng-zorro-antd/upload";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzFormModule } from "ng-zorro-antd/form";
import { FormsModule } from "@angular/forms";
import { FileService, FileDto } from "./file.service";
import { FolderService, FolderDto } from "./folder.service";
import { finalize } from "rxjs";
import { CommonModule } from "@angular/common";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb";
import { NzPopconfirmModule } from "ng-zorro-antd/popconfirm";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NzDividerModule } from "ng-zorro-antd/divider";

@Component({
  selector: "app-file-management",
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    NzInputModule,
    NzFormModule,
    FormsModule,
    NzModalModule,
    NzCardModule,
    NzBreadCrumbModule,
    NzPopconfirmModule,
    NzTagModule,
    NzDividerModule,
  ],
  providers: [FileService, FolderService, NzModalService],
  templateUrl: "./file-management.component.html",
  styleUrl: "./file-management.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class FileManagementComponent implements OnInit {
  private readonly fileService = inject(FileService);
  private readonly folderService = inject(FolderService);
  private readonly messageService = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);

  @ViewChild('createFolderTemplate') createFolderTemplate!: TemplateRef<any>;
  files: WritableSignal<FileDto[]> = signal([]);
  folders: WritableSignal<FolderDto[]> = signal([]);
  currentFolderId: WritableSignal<number | null> = signal(null);
  folderPath: WritableSignal<FolderDto[]> = signal([]);
  pending = signal(false);
  uploadPending = signal(false);
  showUploadModal = signal(false);
  selectedFile: File | null = null;
  newFolderName: string = '';
  ngOnInit(): void {
    this.loadRootFolders();
    this.loadFiles();
  }

  loadRootFolders() {
    this.pending.set(true);
    this.folderService
      .getRootFolders()
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: (folders: FolderDto[]) => {
          this.folders.set(folders);
        },
        error: (err: any) => {
          this.messageService.error("خطا در بارگذاری پوشه‌ها: " + (err.error?.message || err.message));
        },
      });
  }

  loadFiles() {
    this.pending.set(true);
    const folderId = this.currentFolderId();
    const obs = folderId
      ? this.fileService.getFilesByFolder(folderId)
      : this.fileService.getFilesByUser();

    obs.pipe(finalize(() => this.pending.set(false)))      .subscribe({
        next: (files: FileDto[]) => {
          this.files.set(files);
        },
        error: (err: any) => {
          this.messageService.error("خطا در بارگذاری فایل‌ها: " + (err.error?.message || err.message));
        },
      });
  }

  enterFolder(folder: FolderDto) {
    this.currentFolderId.set(folder.id);
    const currentPath = this.folderPath();
    this.folderPath.set([...currentPath, folder]);
    this.loadFiles();
    if (folder.subFolders) {
      this.folders.set(folder.subFolders);
    } else {
      this.folderService.getSubFolders(folder.id).subscribe({
        next: (subFolders: FolderDto[]) => {
          this.folders.set(subFolders);
        },
        error: (err: any) => {
          this.messageService.error("خطا در بارگذاری پوشه‌ها: " + (err.error?.message || err.message));
        },
      });
    }
  }

  navigateToFolder(index: number) {
    const path = this.folderPath();
    const newPath = path.slice(0, index + 1);
    this.folderPath.set(newPath);

    if (index === -1) {
      this.currentFolderId.set(null);
      this.loadRootFolders();
    } else {
      const targetFolder = newPath[newPath.length - 1];
      this.currentFolderId.set(targetFolder.id);
      this.folderService.getSubFolders(targetFolder.id).subscribe({
        next: (subFolders: FolderDto[]) => {
          this.folders.set(subFolders);
        },
      });
    }
    this.loadFiles();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.messageService.warning("لطفا یک فایل انتخاب کنید");
      return;
    }

    this.uploadPending.set(true);
    const folderId = this.currentFolderId();

    this.fileService
      .uploadFile(this.selectedFile, folderId || undefined)
      .pipe(finalize(() => {
        this.uploadPending.set(false);
        this.showUploadModal.set(false);
        this.selectedFile = null;
      }))
      .subscribe({
        next: (response: { fileId: number; message: string }) => {
          this.messageService.success(response.message || "فایل با موفقیت آپلود شد");
          this.loadFiles();
        },
        error: (err: any) => {
          this.messageService.error("خطا در آپلود فایل: " + (err.error?.message || err.message));
        },
      });
  }

  downloadFile(file: FileDto) {
    this.pending.set(true);
    this.fileService
      .downloadFile(file.id)
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.originalFileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.messageService.success("فایل با موفقیت دانلود شد");
        },
        error: (err: any) => {
          this.messageService.error("خطا در دانلود فایل: " + (err.error?.message || err.message));
        },
      });
  }

  deleteFile(file: FileDto) {
    this.pending.set(true);
    this.fileService
      .deleteFile(file.id)
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: (response: { message: string }) => {
          this.messageService.success(response.message || "فایل با موفقیت حذف شد");
          this.loadFiles();
        },
        error: (err: any) => {
          this.messageService.error("خطا در حذف فایل: " + (err.error?.message || err.message));
        },
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }
createFolder() {
  const modal: NzModalRef = this.modalService.create({
    nzTitle: 'ایجاد پوشه جدید',
    nzContent: this.createFolderTemplate,  // اینجا TemplateRef پاس می‌شود
    nzFooter: [
      {
        label: 'انصراف',
        onClick: () => modal.destroy()
      },
      {
        label: 'ایجاد',
        type: 'primary',
        loading: false,
        onClick: () => {
          const name = this.newFolderName?.trim();
          if (!name) {
            this.messageService.warning('لطفا نام پوشه را وارد کنید');
            return;
          }

         // modal.getInstance().nzFooter[1].loading = true; // دکمه در حال لود

          this.folderService
            .createFolder({
              name,
              parentFolderId: this.currentFolderId() || undefined,
            })
            .pipe(finalize(() => {
              //modal.getInstance().nzFooter[1].loading = false;
            }))
            .subscribe({
              next: (response) => {
                this.messageService.success(response?.message || 'پوشه با موفقیت ایجاد شد');
                this.loadRootFolders();
                if (this.currentFolderId()) {
                  this.loadFiles();
                }
                modal.close();
                this.newFolderName = ''; // ریست ورودی
              },
              error: (err: any) => {
                this.messageService.error('خطا در ایجاد پوشه: ' + (err.error?.message || err.message));
              }
            });
        }
      }
    ]
  });
}
  // createFolder() {
  //   this.modalService.confirm({
  //     nzTitle: "ایجاد پوشه جدید",
  //     nzContent: `
  //       <div>
  //         <input nz-input placeholder="نام پوشه" id="folderName" style="width: 100%; margin-top: 10px;" />
  //       </div>
  //     `,
  //     nzOkText: "ایجاد",
  //     nzCancelText: "انصراف",
  //     nzOnOk: () => {
  //       const input = document.getElementById("folderName") as HTMLInputElement;
  //       const name = input?.value?.trim();
  //       if (!name) {
  //         this.messageService.warning("لطفا نام پوشه را وارد کنید");
  //         return Promise.resolve(false);
  //       }

  //       this.pending.set(true);
  //       return this.folderService
  //         .createFolder({
  //           name,
  //           parentFolderId: this.currentFolderId() || undefined,
  //         })
  //         .pipe(finalize(() => this.pending.set(false)))
  //         .toPromise()
  //         .then((response: { message: string; folderId: number } | undefined) => {
  //           this.messageService.success(response?.message || "پوشه با موفقیت ایجاد شد");
  //           this.loadRootFolders();
  //           if (this.currentFolderId()) {
  //             this.loadFiles();
  //           }
  //           return true;
  //         })
  //         .catch((err: any) => {
  //           this.messageService.error("خطا در ایجاد پوشه: " + (err.error?.message || err.message));
  //           return false;
  //         });
  //     },
  //   });
  // }

  deleteFolder(folder: FolderDto) {
    this.modalService.confirm({
      nzTitle: "حذف پوشه",
      nzContent: `آیا مطمئن هستید که می‌خواهید پوشه "${folder.name}" را حذف کنید؟`,
      nzOkText: "بله",
      nzOkType: "primary",
      nzCancelText: "خیر",
      nzOnOk: () => {
        this.pending.set(true);
        this.folderService
          .deleteFolder(folder.id)
          .pipe(finalize(() => this.pending.set(false)))
          .subscribe({
            next: (response: { message: string }) => {
              this.messageService.success(response.message || "پوشه با موفقیت حذف شد");
              if (this.currentFolderId() === folder.id) {
                this.navigateToFolder(-1);
              } else {
                this.loadRootFolders();
              }
            },
            error: (err: any) => {
              this.messageService.error("خطا در حذف پوشه: " + (err.error?.message || err.message));
            },
          });
      },
    });
  }
}

