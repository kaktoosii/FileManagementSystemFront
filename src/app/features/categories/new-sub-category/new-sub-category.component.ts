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
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzUploadFile, NzUploadModule } from "ng-zorro-antd/upload";
import { BASE_URL } from "@core/base-url-token";
import { NzMessageService } from "ng-zorro-antd/message";

@Component({
  selector: "shop-new-sub-category",
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
  templateUrl: "./new-sub-category.component.html",
  styleUrl: "./new-sub-category.component.scss",
})
export class NewSubCategoryComponent {
  @Input({ required: true }) categoryId: number = 0;

  private readonly api = inject(CategoryService);

  private readonly _fb = inject(FormBuilder);
  uploadUrl = inject(BASE_URL) + "Document";
  @Output() close = new EventEmitter<void>();
  fileList: NzUploadFile[] = [];
  private message = inject(NzMessageService);
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
      title: ["", Validators.required],
      showCode: ["", Validators.required],
      documentId: ["", Validators.required],
    });
  }
  handleUpload(info: { file: NzUploadFile }): void {
    debugger;
    if (info.file.status === "done") {
      const uploadedUrl = info.file.response;
      if (uploadedUrl) {
        this.form.get("documentId")?.setValue(uploadedUrl);
        this.message.success("تصویر اصلی با موفقیت آپلود شد.");
      }
    } else if (info.file.status === "error") {
      this.message.error("آپلود تصویر اصلی با مشکل مواجه شد.");
    }
  }
  async submit() {
    this.api
      .Create({ ...this.form.value, categoryId: this.categoryId ?? 1 })
      .subscribe(() => {
        this.close.emit();
      });
  }
}
