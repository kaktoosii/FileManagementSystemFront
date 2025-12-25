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
import { NgIf } from "@angular/common";
import { PasswordService } from "./password.service";

@Component({
  selector: "app-change-password",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NgIf,
  ],
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export default class ChangePasswordComponent implements OnInit {
  form!: FormGroup;
  isLoading = signal(false);

  private readonly _fb = inject(FormBuilder);
  private readonly passwordService = inject(PasswordService);

  ngOnInit(): void {
    this.form = this._fb.group(
      {
        oldPassword: ["", Validators.required],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(group: FormGroup) {
    return group.get("newPassword")?.value ===
      group.get("confirmPassword")?.value
      ? null
      : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.passwordService.changePassword(this.form.value).subscribe(() => {
      alert("Password changed successfully!");
      this.isLoading.set(false);
      this.form.reset();
    });
  }
}
