import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzUploadModule } from "ng-zorro-antd/upload";
import { NzTreeSelectModule } from "ng-zorro-antd/tree-select";
import { NzTreeModule, NzTreeNodeOptions, NzTreeNode } from "ng-zorro-antd/tree";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { FileService } from "./file.service";
import { FolderService, FolderDto } from "./folder.service";
import { FilePatternService, FilePatternDto, FieldType, CreateFilePatternDto, PatternFieldDto } from "./file-pattern.service";
import { finalize } from "rxjs";

@Component({
  selector: "app-upload-file",
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzDatePickerModule,
    NzCardModule,
    NzModalModule,
    NzDividerModule,
    NzUploadModule,
    NzTreeSelectModule,
    NzTreeModule,
    NzCheckboxModule,
    NzDropDownModule,
    NzMenuModule,
  ],
  providers: [FileService, FolderService, FilePatternService, NzModalService],
  templateUrl: "./upload-file.component.html",
  styleUrl: "./upload-file.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class UploadFileComponent implements OnInit {
  private readonly fileService = inject(FileService);
  private readonly folderService = inject(FolderService);
  private readonly patternService = inject(FilePatternService);
  private readonly messageService = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);
  private readonly fb = inject(FormBuilder);

  // Form
  uploadForm!: FormGroup;
  patternForm!: FormGroup;
  fieldValuesForm!: FormGroup;

  // Data
  folders: WritableSignal<FolderDto[]> = signal([]);
  folderTree: WritableSignal<NzTreeNodeOptions[]> = signal([]);
  patterns: WritableSignal<FilePatternDto[]> = signal([]);
  selectedFolderId: WritableSignal<number | null> = signal(null);
  selectedFile: WritableSignal<File | null> = signal(null);
  selectedPattern: WritableSignal<FilePatternDto | null> = signal(null);
  isCreatingPattern = signal(false);

  // UI State
  pending = signal(false);
  uploadPending = signal(false);
  showPatternModal = signal(false);
  showFolderModal = signal(false);
  showAddOptionModal = signal(false);
  currentSelectFieldName = signal('');
  newOptionValue = signal('');
  editingFolderId: WritableSignal<number | null> = signal(null);
  newFolderName = signal('');
  newFolderParentId: WritableSignal<number | null> = signal(null);

  // Preview
  previewUrl = signal<string | null>(null);
  previewType = signal<'image' | 'pdf' | null>(null);

  // Pattern options
  selectFieldOptions: WritableSignal<Record<string, string[]>> = signal({});

  FieldType = FieldType;

  ngOnInit(): void {
    this.initializeForms();
    this.loadFolderTree();
    this.loadPatterns();
  }

  initializeForms() {
    this.uploadForm = this.fb.group({
      folderId: [null],
      file: [null, Validators.required],
      patternId: [null],
    });

    this.patternForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      pattern: ['', Validators.required],
      fields: this.fb.array([]),
    });

    this.fieldValuesForm = this.fb.group({});
  }

  loadFolders() {
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

  loadFolderTree() {
    this.pending.set(true);
    this.folderService
      .getFoldersByUser()
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: (folders: FolderDto[]) => {
          this.folders.set(folders);
          this.folderTree.set(this.buildFolderTree(folders));
        },
        error: (err: any) => {
          this.messageService.error("خطا در بارگذاری پوشه‌ها: " + (err.error?.message || err.message));
        },
      });
  }

  buildFolderTree(folders: FolderDto[]): NzTreeNodeOptions[] {
    const rootFolders = folders.filter(f => !f.parentFolderId);

    const buildNode = (folder: FolderDto): NzTreeNodeOptions => {
      const children = folders
        .filter(f => f.parentFolderId === folder.id)
        .map(child => buildNode(child));

      return {
        title: folder.name,
        key: folder.id.toString(),
        children: children.length > 0 ? children : undefined,
        isLeaf: children.length === 0,
        icon: 'folder',
      };
    };

    return rootFolders.map(folder => buildNode(folder));
  }

  onFolderTreeSelect(event: any): void {
    const keys = event?.keys || (event && Array.isArray(event) ? event : []);
    if (keys && keys.length > 0) {
      const folderId = Number(keys[0]);
      this.selectedFolderId.set(folderId);
      this.uploadForm.patchValue({ folderId });
    } else {
      this.selectedFolderId.set(null);
      this.uploadForm.patchValue({ folderId: null });
    }
  }

  openCreateFolderModal(parentId?: number): void {
    this.newFolderParentId.set(parentId || null);
    this.newFolderName.set('');
    this.editingFolderId.set(null);
    this.showFolderModal.set(true);
  }

  openEditFolderModal(folderId: number): void {
    this.editingFolderId.set(folderId);
    this.folderService.getFolderById(folderId).subscribe({
      next: (folder: FolderDto) => {
        this.newFolderName.set(folder.name);
        this.newFolderParentId.set(folder.parentFolderId || null);
        this.showFolderModal.set(true);
      },
      error: (err: any) => {
        this.messageService.error("خطا در بارگذاری پوشه: " + (err.error?.message || err.message));
      },
    });
  }

  openEditFolderFromTree(node: NzTreeNode) {
  const folderId = Number(node.key);
  this.openEditFolderModal(folderId);
}

openCreateSubfolderFromTree(node: NzTreeNode) {
  const folderId = Number(node.key);
  this.openCreateFolderModal(folderId);
}

deleteFolderFromTreeMenu(node: NzTreeNode) {
  const folderId = Number(node.key);
  this.deleteFolderFromTree(folderId);
}

  saveFolder(): void {
    const name = this.newFolderName().trim();
    if (!name) {
      this.messageService.warning("لطفا نام پوشه را وارد کنید");
      return;
    }

    const editingId = this.editingFolderId();
    const parentId = this.newFolderParentId();

    if (editingId) {
      this.pending.set(true);
      this.folderService
        .updateFolder(editingId, {
          name,
          parentFolderId: parentId || undefined,
        })
        .pipe(finalize(() => {
          this.pending.set(false);
          this.showFolderModal.set(false);
          this.editingFolderId.set(null);
        }))
        .subscribe({
          next: (response: { message: string }) => {
            this.messageService.success(response.message || "پوشه با موفقیت ویرایش شد");
            this.loadFolderTree();
          },
          error: (err: any) => {
            this.messageService.error("خطا در ویرایش پوشه: " + (err.error?.message || err.message));
          },
        });
    } else {
      this.pending.set(true);
      this.folderService
        .createFolder({
          name,
          parentFolderId: parentId || undefined,
        })
        .pipe(finalize(() => {
          this.pending.set(false);
          this.showFolderModal.set(false);
          this.newFolderParentId.set(null);
        }))
        .subscribe({
          next: (response: { message: string; folderId: number }) => {
            this.messageService.success(response.message || "پوشه با موفقیت ایجاد شد");
            this.loadFolderTree();
          },
          error: (err: any) => {
            this.messageService.error("خطا در ایجاد پوشه: " + (err.error?.message || err.message));
          },
        });
    }
  }

  deleteFolderFromTree(folderId: number): void {
    this.modalService.confirm({
      nzTitle: "حذف پوشه",
      nzContent: "آیا مطمئن هستید که می‌خواهید این پوشه را حذف کنید؟",
      nzOkText: "بله",
      nzOkType: "primary",
      nzCancelText: "خیر",
      nzOnOk: () => {
        this.pending.set(true);
        this.folderService
          .deleteFolder(folderId)
          .pipe(finalize(() => this.pending.set(false)))
          .subscribe({
            next: (response: { message: string }) => {
              this.messageService.success(response.message || "پوشه با موفقیت حذف شد");
              this.loadFolderTree();
              if (this.selectedFolderId() === folderId) {
                this.selectedFolderId.set(null);
                this.uploadForm.patchValue({ folderId: null });
              }
            },
            error: (err: any) => {
              this.messageService.error("خطا در حذف پوشه: " + (err.error?.message || err.message));
            },
          });
      },
    });
  }

  loadPatterns() {
    this.patternService.getPatternsByUser().subscribe({
      next: (patterns: FilePatternDto[]) => {
        this.patterns.set(patterns);
      },
      error: (err: any) => {
        this.messageService.error("خطا در بارگذاری پترن‌ها: " + (err.error?.message || err.message));
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.uploadForm.patchValue({ file });
      this.generatePreview(file);
    }
  }

  generatePreview(file: File) {
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl.set(e.target.result);
        this.previewType.set('image');
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl.set(e.target.result);
        this.previewType.set('pdf');
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
      this.previewType.set(null);
    }
  }

  onFolderChange(folderId: number | null) {
    this.selectedFolderId.set(folderId);
    this.uploadForm.patchValue({ folderId });
  }

  onPatternChange(patternId: number | null) {
    if (!patternId) {
      this.selectedPattern.set(null);
      this.fieldValuesForm = this.fb.group({});
      return;
    }
debugger
    this.patternService.getPatternById(patternId).subscribe({
      next: (pattern: FilePatternDto) => {
        this.selectedPattern.set(this.mapPatternFields(pattern));
        //this.selectedPattern.set(pattern);
        this.buildFieldValuesForm(pattern);
      },
      error: (err: any) => {
        this.messageService.error("خطا در بارگذاری پترن: " + (err.error?.message || err.message));
      },
    });
  }

  buildFieldValuesForm(pattern: FilePatternDto) {
    const formControls: Record<string, any> = {};
    const optionsMap: Record<string, string[]> = {};

    // Sort fields by order
    const sortedFields = [...pattern.fields].sort((a, b) => a.order - b.order);

    sortedFields.forEach(field => {
      const validators = field.isRequired ? [Validators.required] : [];
      let defaultValue: any = field.defaultValue || '';

      // Handle date default value
      if (field.fieldType === FieldType.Date && defaultValue) {
        defaultValue = new Date(defaultValue);
      }

      formControls[field.fieldName] = [defaultValue, validators];

      // Store options for select fields
      if (field.fieldType === FieldType.Select && field.options) {
        optionsMap[field.fieldName] = field.options.split(',').map(o => o.trim()).filter(o => o);
      }
    });

    this.fieldValuesForm = this.fb.group(formControls);
    this.selectFieldOptions.set(optionsMap);
  }

  openAddOptionModal(fieldName: string): void {
    this.currentSelectFieldName.set(fieldName);
    this.newOptionValue.set('');
    this.showAddOptionModal.set(true);
  }

  addOptionToSelectField(): void {
    const fieldName = this.currentSelectFieldName();
    const newOption = this.newOptionValue().trim();

    if (!newOption) {
      this.messageService.warning("لطفا نام گزینه را وارد کنید");
      return;
    }

    const currentOptions = this.selectFieldOptions();
    const options = currentOptions[fieldName] || [];

    if (options.includes(newOption)) {
      this.messageService.warning("این گزینه قبلا اضافه شده است");
      return;
    }

    const updatedOptions = { ...currentOptions };
    updatedOptions[fieldName] = [...options, newOption];
    this.selectFieldOptions.set(updatedOptions);
    this.messageService.success("گزینه با موفقیت اضافه شد");
    this.showAddOptionModal.set(false);
    this.newOptionValue.set('');
  }

  getSelectOptions(fieldName: string): string[] {
    return this.selectFieldOptions()[fieldName] || [];
  }

  openCreatePatternModal() {
    this.isCreatingPattern.set(true);
    this.patternForm.reset();
    this.patternForm.setControl('fields', this.fb.array([]));
    this.showPatternModal.set(true);
  }

  addPatternField() {
    const fieldsArray = this.patternForm.get('fields') as FormArray;
    fieldsArray.push(this.fb.group({
      fieldName: ['', Validators.required],
      placeholder: ['', Validators.required],
      fieldType: [FieldType.Text, Validators.required],
      options: [''],
      isRequired: [false],
      defaultValue: [''],
      order: [fieldsArray.length],
    }));
  }

  removePatternField(index: number) {
    const fieldsArray = this.patternForm.get('fields') as FormArray;
    fieldsArray.removeAt(index);
    // Update order
    fieldsArray.controls.forEach((control: any, idx: number) => {
      control.patchValue({ order: idx });
    });
  }

  get patternFieldsArray(): FormArray {
    return this.patternForm.get('fields') as FormArray;
  }
  private mapPatternFields(pattern: FilePatternDto): FilePatternDto {
  return {
    ...pattern,
    fields: pattern.fields.map(f => ({
      ...f,
      fieldType: f.fieldType as FieldType  // اگر string enum
      // یا: Number(f.fieldType) as FieldType  // اگر عددی
    }))
  };
}
  savePattern() {
    if (this.patternForm.invalid) {
      Object.values(this.patternForm.controls).forEach((control: any) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.messageService.warning("لطفا تمام فیلدهای الزامی را پر کنید");
      return;
    }

    const patternData: CreateFilePatternDto = this.patternForm.value;

    this.pending.set(true);
    this.patternService
      .createPattern(patternData)
      .pipe(finalize(() => {
        this.pending.set(false);
        this.showPatternModal.set(false);
        this.isCreatingPattern.set(false);
      }))
      .subscribe({
        next: (response: { message: string; patternId: number }) => {
          this.messageService.success(response.message || "پترن با موفقیت ایجاد شد");
          this.loadPatterns();
          // Select the newly created pattern
          this.uploadForm.patchValue({ patternId: response.patternId });
          this.onPatternChange(response.patternId);
        },
        error: (err: any) => {
          this.messageService.error("خطا در ایجاد پترن: " + (err.error?.message || err.message));
        },
      });
  }

  uploadFile() {
    if (this.uploadForm.invalid) {
      this.messageService.warning("لطفا فایل را انتخاب کنید");
      return;
    }

    const file = this.selectedFile();
    if (!file) {
      this.messageService.warning("لطفا فایل را انتخاب کنید");
      return;
    }

    const pattern = this.selectedPattern();
    const folderId = this.selectedFolderId();

    // Validate pattern fields if pattern is selected
    if (pattern && this.fieldValuesForm.invalid) {
      Object.values(this.fieldValuesForm.controls).forEach((control: any) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.messageService.warning("لطفا تمام فیلدهای الزامی پترن را پر کنید");
      return;
    }

    let patternValues: Record<string, string> | undefined;
    if (pattern) {
      patternValues = {};
      Object.keys(this.fieldValuesForm.value).forEach(key => {
        const value = this.fieldValuesForm.value[key];
        if (value !== null && value !== undefined) {
          // Format date if needed
          if (value instanceof Date) {
            patternValues![key] = value.toISOString().split('T')[0];
          } else {
            patternValues![key] = String(value);
          }
        }
      });
    }

    this.uploadPending.set(true);
    this.fileService
      .uploadFile(file, folderId || undefined, pattern?.id, patternValues)
      .pipe(finalize(() => this.uploadPending.set(false)))
      .subscribe({
        next: (response: { fileId: number; message: string }) => {
          this.messageService.success(response.message || "فایل با موفقیت آپلود شد");
          // Reset form
          this.uploadForm.reset();
          this.fieldValuesForm = this.fb.group({});
          this.selectedFile.set(null);
          this.selectedPattern.set(null);
          this.selectedFolderId.set(null);
          this.previewUrl.set(null);
          this.previewType.set(null);
          // Reset file input
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        },
        error: (err: any) => {
          this.messageService.error("خطا در آپلود فایل: " + (err.error?.message || err.message));
        },
      });
  }

  getFieldTypeLabel(type: FieldType): string {
    const labels: Record<FieldType, string> = {
      [FieldType.Text]: 'متن',
      [FieldType.Number]: 'عدد',
      [FieldType.Date]: 'تاریخ',
      [FieldType.Select]: 'انتخابی',
      [FieldType.TextArea]: 'متن چندخطی',
    };
    return labels[type] || 'نامشخص';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  getSortedFields(fields: PatternFieldDto[]): PatternFieldDto[] {
    return [...fields].sort((a, b) => a.order - b.order);
  }
}

