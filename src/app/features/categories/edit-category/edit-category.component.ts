import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { NzRadioModule } from "ng-zorro-antd/radio";
import { NzTimePickerModule } from "ng-zorro-antd/time-picker";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzAlertModule } from "ng-zorro-antd/alert";
import { CategoryService } from "../category.service";
import { NzFormModule } from "ng-zorro-antd/form";
import { CategoryDto } from "@models";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzUploadFile, NzUploadModule } from "ng-zorro-antd/upload";
import { BASE_URL } from "@core/base-url-token";
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
  selector: "shop-edit-category",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzRadioModule,
    NzTimePickerModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzAlertModule,
    NzFormModule,
    NzSelectModule,
    NzButtonModule,
    NzUploadModule,
  ],
  templateUrl: "./edit-category.component.html",
  styleUrl: "./edit-category.component.scss",
})
export class EditCategoryComponent {
  @Input({ required: true }) category!: CategoryDto;

  private readonly api = inject(CategoryService);
  private message = inject(NzMessageService);
  private readonly _fb = inject(FormBuilder);
  uploadUrl = inject(BASE_URL) + "Document";
  @Output() close = new EventEmitter<void>();
  fileList: NzUploadFile[] = [];
  form!: FormGroup;

  icons = [
    "ceiling.svg",
    "facade.svg",
    "paint-roller.svg",
    "plastering.svg",
    "wire.svg",
  ];

  ngOnInit(): void {
    this.form = this._fb.group({
      title: [this.category.title, Validators.required],
      showCode: [this.category.showCode, Validators.required],
      documentId: [this.category.documentId, Validators.required],
    });
    if (this.category.documentId) {
      this.fileList = [
        {
          uid: "-1",
          name: this.category.documentId,
          status: "done",
          url: this.uploadUrl + `?DocumentId=${this.category.documentId}`,
        },
      ];
    }
  }
  handleUpload(info: { file: NzUploadFile }): void {
    debugger;
    if (info.file.status === "done") {
      const uploadedUrl = info.file.response;
      if (uploadedUrl) {
        this.form.get("documentId")?.setValue(uploadedUrl);
        this.form.markAsDirty();
        this.message.success("تصویر اصلی با موفقیت آپلود شد.");
      }
    } else if (info.file.status === "error") {
      this.message.error("آپلود تصویر اصلی با مشکل مواجه شد.");
    }
  }

  async submit() {
    this.api.Update({ ...this.category, ...this.form.value }).subscribe(() => {
      this.close.emit();
    });
  }
}
