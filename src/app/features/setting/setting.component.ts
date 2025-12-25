import { environment } from "@env";
import { Component, inject, OnInit, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { EditorModule } from "@tinymce/tinymce-angular";
import { SettingService } from "./setting.service";
import { SettingViewModel, SettingViewModelResponse } from "@models";

@Component({
  selector: "app-edit-settings",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    EditorModule, // TinyMCE Editor
  ],
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.scss"],
})
export default class EditSettingsComponent implements OnInit {
  form!: FormGroup;
  isLoading = signal(false);
  settingsData: SettingViewModel = {};
  editorApiKey = environment.editorApiKey;
  tinyMceConfig = {
    menubar: false,
    plugins: "lists advlist textcolor colorpicker directionality", // ✅ Enable lists, text color, and text direction
    toolbar:
      "undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | forecolor backcolor | ltr rtl", // ✅ Add color & direction buttons
    content_style:
      "ul { list-style-type: square; } ol { list-style-type: upper-roman; } p { direction: ltr; }", // ✅ Default LTR text
  };
  private readonly _fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingService);

  ngOnInit(): void {
    this.form = this._fb.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      meta: [""],
      pushToken: [""],
      pushApikey: [""],
      icon: [""],
      fcmServerKey: [""],
      fcmSenderId: [""],
      telegram: [""],
      instagram: [""],
      linkedIn: [""],
      footer: [""],
      copyRight: [""],
      phone: ["", Validators.pattern("^[0-9]+$")],
      aboutUs: [""],
      rules: [""],
      questions: [""],
    });

    this.loadSettings();
  }

  loadSettings() {
    this.isLoading.set(true);
    this.settingsService
      .getSettings()
      .subscribe((data: SettingViewModelResponse) => {
        this.settingsData = data.data ?? {};
        this.form.patchValue(this.settingsData);
        this.isLoading.set(false);
      });
  }

  submit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.settingsService.updateSettings(this.form.value).subscribe(() => {
      alert("با موفقیت ثبت شد!");
      this.isLoading.set(false);
    });
  }
}
