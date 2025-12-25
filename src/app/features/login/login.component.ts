import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import { LoginService } from "./login.service";
import { finalize } from "rxjs";
import { Router, RouterLink } from "@angular/router";
import { AlertService } from "@core/alert.service";
import { CookieHandler } from "@core/cookie-handler";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  providers: [LoginService],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  public readonly pending = signal(false);
  public readonly passwordVisible = signal(false);

  private readonly router = inject(Router);
  private readonly service = inject(LoginService);
  private readonly alert = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    if (CookieHandler.getToken()) {
      CookieHandler.removeToken();
      CookieHandler.removeRefreshToken();
    }

    this.createForm();
  }

  private createForm() {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required]],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAsTouched();
      this.alert.warning("لطفا فرم را تکمیل کنید");
      return;
    }

    this.pending.set(true);

    this.service
      .login({ ...this.loginForm.value })
      .pipe(
        finalize(() => {
          this.pending.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.alert.success("خوش آمدید");
          CookieHandler.setToken(response.accessToken!);
          CookieHandler.setRefreshToken(response.refreshToken!);
          CookieHandler.setAccess(response.dynamicPermissionsToken!)
          this.router.navigate(["/dashboard/home"]);
        },
        error: () => {
          this.alert.error("نام کاربری یا/و رمز عبور اشتباه است");
        },
      });
  }
}
